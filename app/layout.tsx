import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { AuthProvider } from "@/components/providers/auth-provider";
import NextTopLoader from "nextjs-toploader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Inter has no monospace variant — JetBrains Mono for code blocks only
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PortalKit — Client Portal Software for Freelancers",
    template: "%s | PortalKit",
  },
  description:
    "PortalKit gives freelancers and agencies a branded client portal to share files, collect approvals, track invoices, and manage projects — all through one professional link.",
  keywords: [
    "client portal",
    "freelancer software",
    "project management for freelancers",
    "invoice tracking",
    "file approval software",
    "client collaboration tool",
    "white label client portal",
  ],
  authors: [{ name: "PortalKit" }],
  creator: "PortalKit",
  metadataBase: new URL("https://portalkit.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://portalkit.com",
    siteName: "PortalKit",
    title: "PortalKit — Client Portal Software for Freelancers",
    description:
      "Share files, collect approvals, track invoices, and manage projects — all through one branded client portal link.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PortalKit — Client Portal Software",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PortalKit — Client Portal Software for Freelancers",
    description:
      "Share files, collect approvals, track invoices, and manage projects — all through one branded client portal link.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <NextTopLoader
          color="#0051d5"
          height={3}
          showSpinner={false}
          shadow="0 0 10px #0051d5,0 0 5px #0051d5"
          easing="ease"
          speed={200}
        />
        <AuthProvider initialUser={user}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
