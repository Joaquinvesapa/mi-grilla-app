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
        {children}
      </body>
    </html>
  );
}
