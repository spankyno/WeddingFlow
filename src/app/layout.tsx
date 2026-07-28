import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

const body = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "WeddingFlow — Invitaciones digitales de boda",
  description:
    "Crea la invitación digital de tu boda, comunión, bautizo o evento en minutos: RSVP, mesas, regalos y más en un solo lugar.",
  openGraph: {
    title: "WeddingFlow",
    description: "Invitaciones digitales premium para bodas y celebraciones.",
    type: "website",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WeddingFlow",
  },
};

export const viewport: Viewport = {
  themeColor: "#151312",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="es" suppressHydrationWarning>
        <body className={`${display.variable} ${body.variable} font-body antialiased`}>
          <Providers>{children}</Providers>
          <PwaRegister />
        </body>
      </html>
    </ClerkProvider>
  );
}
