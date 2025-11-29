import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import Script from "next/script";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.dennisbeltran.cl"),
  title: {
    default: "Dennis Beltrán Varela | Psicología Clínica Online",
    template: "%s | Dennis Beltrán Varela"
  },
  description:
    "Atención psicológica profesional online con Dennis Beltrán Varela. Especialista en psicología clínica, terapia en línea, salud mental y apoyo personalizado.",
  keywords: [
    "psicología online",
    "psicólogo clínico",
    "terapia psicológica",
    "Dennis Beltrán Varela",
    "salud mental",
    "terapia en línea",
    "psicología clínica"
  ],
  authors: [{ name: "Dennis Beltrán Varela" }],
  creator: "Dennis Beltrán Varela",
  publisher: "Dennis Beltrán Varela",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "/",
    siteName: "Dennis Beltrán Varela | Psicología Clínica Online",
    title: "Dennis Beltrán Varela | Psicología Clínica Online",
    description:
      "Atención psicológica profesional online con Dennis Beltrán Varela. Especialista en psicología clínica, terapia en línea, salud mental y apoyo personalizado.",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Dennis Beltrán Varela — Psicología Clínica Online"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Dennis Beltrán Varela | Psicología Clínica Online",
    description:
      "Atención psicológica profesional online con Dennis Beltrán Varela. Especialista en psicología clínica, terapia en línea, salud mental y apoyo personalizado.",
    images: ["/og.jpg"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      maxSnippet: -1,
      maxImagePreview: "large",
      maxVideoPreview: -1
    }
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png"
  },
  category: "healthcare",
};

export const viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
      <ClerkProvider>
    <html lang="es" dir="ltr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
      </ClerkProvider>
  );
}
