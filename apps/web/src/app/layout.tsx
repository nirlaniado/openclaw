import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nutrition Tracker",
  description: "Portable nutrition tracking foundation"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
