import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SplashScreen } from "@/components/splash-screen";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/lib/language-context";
import { Header } from "@/components/header";
import { ToastProvider } from "@/components/ui/toast";
import { db } from "@/db";
import { systemStats } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyProToken } from "@/lib/pro-utils";
import { headers } from "next/headers";
import { ensureDb } from "@/lib/ensure-db";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JannahFlow - Family Management",
  description: "Powered by CACUBE 2026",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let familyName = "Family";
  let isPro = false;
  try {
    await ensureDb();
    const nameStat = await db.query.systemStats.findFirst({
      where: eq(systemStats.key, "family_name")
    });
    familyName = nameStat?.value || "Family";

    const tokenStat = await db.query.systemStats.findFirst({
      where: eq(systemStats.key, "pro_token")
    });
    
    const headersList = await headers();
    const host = headersList.get("host") || "localhost";
    const hostname = host.split(":")[0];
    isPro = await verifyProToken(tokenStat?.value, hostname);
  } catch {
    // DB not ready yet (first deploy); use safe defaults
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-200 dark:bg-slate-900/80 transition-colors flex justify-center`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <LanguageProvider>
            <div className="w-full max-w-3xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen relative shadow-2xl flex flex-col overflow-x-hidden">
                <SplashScreen />
                <Header familyName={familyName} isPro={isPro} />
                <main className="flex-1 flex flex-col w-full min-w-0">
                    {children}
                </main>
                <ToastProvider />
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
