import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getCategories } from "@/lib/products/service";

export const metadata: Metadata = {
  title: { default: "Abhi Fashions | Sarees for every occasion", template: "%s | Abhi Fashions" },
  description: "Thoughtfully chosen sarees for mothers, working women, and every woman who dresses in her own way.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const categories = await getCategories();
  return (
    <html lang="en">
      <body><CartProvider><Header categories={categories} />{children}<Footer /></CartProvider></body>
    </html>
  );
}
