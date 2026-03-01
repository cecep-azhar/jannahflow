import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SplashScreen } from "@/components/splash-screen";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/lib/language-context";
import { Header } from "@/components/header";
import { ToastProvider } from "@/components/ui/toast";
import { LoadingProvider } from "@/components/loading-provider";
import { TimeValidator } from "@/components/time-validator";
import { db } from "@/db";
import { systemStats, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyProToken } from "@/lib/pro-utils";
import { headers } from "next/headers";
import { ensureDb } from "@/lib/ensure-db";
import { cookies } from "next/headers";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "JannahFlow",
  title: "JannahFlow - Moslem Family Management",
  description: "Powered by CACUBE 2026",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JannahFlow",
  },
  formatDetection: {
    telephone: false,
  },
/*  icons: {
    icon: [
      { url: logoImage.src, type: 'image/png' }
    ],
    apple: [
      { url: logoImage.src, type: 'image/png' }
    ]
  }, */
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let familyName = "Family";
  let isPro = false;
  let currentUser: { name: string; avatarUrl: string | null; avatarColor: string | null } | undefined = undefined;
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
    
    const cookieStore = await cookies();
    const userIdStr = cookieStore.get("mutabaah-user-id")?.value;
    if (userIdStr) {
      const user = await db.query.users.findFirst({
        where: eq(users.id, parseInt(userIdStr)),
      });
      if (user) {
        currentUser = { name: user.name, avatarUrl: user.avatarUrl, avatarColor: user.avatarColor };
      }
    }
  } catch {
    // DB not ready yet (first deploy); use safe defaults
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          if (!document.cookie.includes('device-tz=')) {
            document.cookie = "device-tz=" + Intl.DateTimeFormat().resolvedOptions().timeZone + "; path=/; max-age=31536000";
          }
        `}} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-200 dark:bg-slate-900 transition-colors flex justify-center`}
        suppressHydrationWarning
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <LanguageProvider>
            <LoadingProvider>
              <div className="w-full max-w-3xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen relative shadow-2xl flex flex-col overflow-x-hidden">
                  <SplashScreen />
                  <Header familyName={familyName} isPro={isPro} user={currentUser} />
                  <main className="flex-1 flex flex-col w-full min-w-0">
                      <TimeValidator serverTime={Date.now()} />
                      {children}
                  </main>
                  <ToastProvider />
              </div>
            </LoadingProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
