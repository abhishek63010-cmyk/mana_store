import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mana Store",
  description: "A modular ecommerce platform for fashion and lifestyle products.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
