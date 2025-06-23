"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  ShoppingBag,
  Heart,
  User,
  Search,
  LogOut,
  Settings,
  UserCircle,
} from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { useFavorites } from "@/contexts/favorites-context";
import Image from "next/image";

const navigation = [
  { name: "Inicio", href: "/" },
  { name: "Tienda", href: "/tienda" },
  { name: "Collares", href: "/tienda?categoria=collares" },
  { name: "Aretes", href: "/tienda?categoria=aretes" },
  { name: "Pulseras", href: "/tienda?categoria=pulseras" },
  { name: "Sobre Mí", href: "/sobre-mi" },
  { name: "Contacto", href: "/contacto" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { items } = useCart();
  const { favorites } = useFavorites();
  const { user, logout } = useAuth();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="rounded-full overflow-hidden w-12 h-12 md:w-16 md:h-16 flex-shrink-0 border-2 border-white relative">
              <Image
                src="/Lesha.jpg"
                alt="LesSha Logo"
                fill // Ocupa todo el espacio del contenedor padre
                className="object-cover"
                sizes="(max-width: 768px) 48px, 64px" // Optimización para dispositivos
                priority // Opcional: si es el logo principal
              />
            </div>
            <span className="font-bold text-xl text-gray-900 font-playfair">
              LesSha
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-rose-600 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Search className="h-4 w-4" />
            </Button>

            {user && (
              <Link href="/favoritos">
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="h-4 w-4" />
                  {favorites.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-rose-600">
                      {favorites.length}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            <Link href="/carrito">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-4 w-4" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-rose-600">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <UserCircle className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/perfil" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Mi Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favoritos" className="cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" />
                      Mis Favoritos
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin/dashboard"
                          className="cursor-pointer"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Panel de Admin
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="icon">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
            )}

            {/* Mobile menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-lg font-medium text-gray-700 hover:text-rose-600 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  {user && (
                    <>
                      <hr className="my-4" />
                      <Link
                        href="/perfil"
                        className="text-lg font-medium text-gray-700 hover:text-rose-600 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        Mi Perfil
                      </Link>
                      <Link
                        href="/favoritos"
                        className="text-lg font-medium text-gray-700 hover:text-rose-600 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        Mis Favoritos
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          href="/admin/dashboard"
                          className="text-lg font-medium text-gray-700 hover:text-rose-600 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          Panel de Admin
                        </Link>
                      )}
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
