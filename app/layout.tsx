import type React from "react";
import type { Metadata } from "next";
import "./globals.css";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartProvider } from "@/contexts/cart-context";
import { AuthProvider } from "@/contexts/auth-context";
import { FavoritesProvider } from "@/contexts/favorites-context";
import { OrdersProvider } from "@/contexts/orders-context";
import { SettingsProvider } from "@/contexts/settings-context";
import { CategoriesProvider } from "@/contexts/categories-context";
import { DiscountsProvider } from "@/contexts/discounts-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { Toaster } from "@/components/ui/toaster";
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Les Sha Accesorios",
  description:
    "Descubre nuestra colección única de bisutería artesanal. Collares, aretes, pulseras y accesorios hechos a mano con amor y dedicación.",
  authors: { name: "rbravoh99@gmail.com" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/logolessha.svg" type="image/svg+xml" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <ThemeProvider>
          <AuthProvider>
            <SettingsProvider>
              <CategoriesProvider>
                <DiscountsProvider>
                  <OrdersProvider>
                    <FavoritesProvider>
                      <CartProvider>
                        <Navbar />
                        <main>{children}</main>
                        <Footer />
                        <Toaster />
                      </CartProvider>
                    </FavoritesProvider>
                  </OrdersProvider>
                </DiscountsProvider>
              </CategoriesProvider>
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
