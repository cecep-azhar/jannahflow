import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SplashScreen } from "@/components/splash-screen";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { ToastProvider } from "@/components/ui/toast";
import { db } from "@/db";
import { systemStats } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyProToken } from "@/lib/pro-utils";
import { headers } from "next/headers";

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
  const nameStat = await db.query.systemStats.findFirst({
    where: eq(systemStats.key, "family_name")
  });
  const familyName = nameStat?.value || "Family";

  const tokenStat = await db.query.systemStats.findFirst({
    where: eq(systemStats.key, "pro_token")
  });
  
  const headersList = await headers();
  const host = headersList.get("host") || "localhost";
  const hostname = host.split(":")[0];
  const isPro = await verifyProToken(tokenStat?.value, hostname);

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
            <div className="w-full max-w-3xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen relative shadow-2xl flex flex-col overflow-x-hidden">
                <SplashScreen />
                <Header familyName={familyName} isPro={isPro} />
                <main className="flex-1 flex flex-col">
                    {children}
                </main>
                <ToastProvider />
            </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
