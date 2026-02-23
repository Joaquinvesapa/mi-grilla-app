import type { Metadata, Viewport } from "next";
import { Anton, Host_Grotesk } from "next/font/google";
import "./globals.css";

// Display font — headings, artist names, titles, ALL CAPS impact text
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
});

// Body font — UI text, times, descriptions, navigation
const hostGrotesk = Host_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-host-grotesk",
});

// ── PWA Metadata ───────────────────────────────────────────

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdf8ff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a14" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "MiGrilla",
  description: "Armá tu agenda del festival y coordiná con tus amigos.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/guitar_svg.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MiGrilla",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${anton.variable} ${hostGrotesk.variable} font-sans antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-none"
        >
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
