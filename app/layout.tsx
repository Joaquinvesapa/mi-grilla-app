import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "MiGrilla",
  description: "Armá tu agenda del festival y coordiná con tus amigos.",
  icons: {
    icon: "/guitar_svg.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content="#fdf8ff" />
      </head>
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
