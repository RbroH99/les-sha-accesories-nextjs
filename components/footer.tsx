import Link from "next/link";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-amber-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="font-bold text-xl font-playfair">
                Bisutería Artesanal
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Creando joyas únicas con amor y dedicación. Cada pieza cuenta una
              historia especial.
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-gray-400 hover:text-rose-400 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-rose-400 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-rose-400 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/tienda"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Tienda
                </Link>
              </li>
              <li>
                <Link
                  href="/sobre-mi"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Sobre Mí
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contacto
                </Link>
              </li>
              {/* <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li> */}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Categorías</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/tienda?categoria=collares"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Collares
                </Link>
              </li>
              <li>
                <Link
                  href="/tienda?categoria=aretes"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Aretes
                </Link>
              </li>
              <li>
                <Link
                  href="/tienda?categoria=pulseras"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Pulseras
                </Link>
              </li>
              <li>
                <Link
                  href="/tienda?categoria=accesorios"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Accesorios
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-rose-400" />
                <span className="text-gray-400">
                  les.sha.accesorios@gmail.com
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-rose-400" />
                <span className="text-gray-400">+53 56709472</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-rose-400" />
                <span className="text-gray-400">Habana, Cuba</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 Bisutería Artesanal. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
