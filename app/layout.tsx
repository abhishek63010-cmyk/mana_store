import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { WishlistProvider } from "@/components/wishlist-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getCategories } from "@/lib/products/service";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: { default: "Abhi Fashions | Sarees for every occasion", template: "%s | Abhi Fashions" },
  description: "Thoughtfully chosen sarees for mothers, working women, and every woman who dresses in her own way.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const categories = await getCategories();
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <body><CartProvider userId={user?.id}><WishlistProvider userId={user?.id}><Header categories={categories} user={user} />{children}<Footer /></WishlistProvider></CartProvider></body>
    </html>
  );
}
