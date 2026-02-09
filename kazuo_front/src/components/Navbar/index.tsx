"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  Menu,
  X,
  Globe,
  Home,
  Lightbulb,
  ClipboardList,
  Phone,
  Users,
  LogOut,
  LayoutDashboard,
  LogIn,
  UserPlus,
  Building,
  User,
} from "lucide-react";
import "@fortawesome/fontawesome-free/css/all.min.css";

interface AuthButtonsProps {
  isLoggedIn: boolean;
  handleLogout: () => void;
  handleOnClick: (route: string) => void;
  onLinkClick?: () => void;
  mobile?: boolean;
}

export default function Navbar() {
  const { isLoggedIn, logout } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    // Cerrar el menú si está abierto
    setIsMenuOpen(false);

    const result = await Swal.fire({
      title: "¿Estás seguro que quieres cerrar sesión?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      logout();
    }
  };

  const handleOnClick = (route: string) => {
    router.push(route);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <button
          className={`${!isLoggedIn ? "lg:hidden" : ""}`}
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <nav
          className={`${
            isLoggedIn ? "hidden" : "hidden lg:flex"
          } items-center space-x-6`}
        >
          <NavLinks isLoggedIn={isLoggedIn} />
        </nav>
        <div
          className={`${
            isLoggedIn ? "hidden" : "hidden lg:flex"
          } items-center space-x-4`}
        >
          <AuthButtons
            isLoggedIn={isLoggedIn}
            handleLogout={handleLogout}
            handleOnClick={handleOnClick}
          />
        </div>
      </div>
      {isMenuOpen && (
        <div
          className={`${
            !isLoggedIn ? "lg:hidden" : ""
          } mt-4 bg-white shadow-lg rounded-lg p-4 absolute top-16 left-0 right-0 z-50 border border-gray-100`}
        >
          <nav className="flex flex-col space-y-4">
            <NavLinks onLinkClick={closeMenu} mobile isLoggedIn={isLoggedIn} />
          </nav>
          <div className="mt-4 flex flex-col space-y-4 pt-4 border-t border-gray-100">
            <AuthButtons
              isLoggedIn={isLoggedIn}
              handleLogout={handleLogout}
              handleOnClick={handleOnClick}
              onLinkClick={closeMenu}
              mobile
            />
          </div>
        </div>
      )}
    </header>
  );
}

function NavLinks({
  onLinkClick,
  mobile,
  isLoggedIn,
}: {
  onLinkClick?: () => void;
  mobile?: boolean;
  isLoggedIn: boolean;
}) {
  const baseClasses =
    "flex items-center gap-2 font-medium transition-colors hover:text-blue-800";
  const activeClasses = "text-blue-600";
  const inactiveClasses = "text-gray-600";

  if (isLoggedIn) {
    return (
      <>
        <Link
          href="/GestionInventario"
          onClick={onLinkClick}
          className={`${baseClasses} ${inactiveClasses}`}
        >
          <LayoutDashboard size={18} /> Gestion de inventario
        </Link>
        <Link
          href="/Company"
          onClick={onLinkClick}
          className={`${baseClasses} ${inactiveClasses}`}
        >
          <Building size={18} /> Gestion de empresa
        </Link>
        <Link
          href="/GestionInventario"
          onClick={onLinkClick}
          className={`${baseClasses} ${inactiveClasses}`}
        >
          <User size={18} /> Perfil
        </Link>
        <Link
          href="/GoogleTranslate "
          onClick={onLinkClick}
          className={`${baseClasses} ${inactiveClasses}`}
        >
          <Globe size={18} /> Traducir
        </Link>
        <Link
          href="/Nosotros"
          onClick={onLinkClick}
          className={`${baseClasses} ${inactiveClasses}`}
        >
          <Users size={18} /> Nosotros
        </Link>
        <Link
          href="/Contacto"
          onClick={onLinkClick}
          className={`${baseClasses} ${inactiveClasses}`}
        >
          <Phone size={18} /> Contacto
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href="/"
        onClick={onLinkClick}
        className={`${baseClasses} ${activeClasses}`}
      >
        <Home size={18} /> Inicio
      </Link>
      <Link
        href="/Soluciones"
        onClick={onLinkClick}
        className={`${baseClasses} ${activeClasses}`}
      >
        <Lightbulb size={18} /> Soluciones
      </Link>
      <Link
        href="/Planes"
        onClick={onLinkClick}
        className={`${baseClasses} ${inactiveClasses}`}
      >
        <ClipboardList size={18} /> Planes
      </Link>
      <Link
        href="/Contacto"
        onClick={onLinkClick}
        className={`${baseClasses} ${inactiveClasses}`}
      >
        <Phone size={18} /> Contacto
      </Link>
      <Link
        href="/Nosotros"
        onClick={onLinkClick}
        className={`${baseClasses} ${inactiveClasses}`}
      >
        <Users size={18} /> Nosotros
      </Link>
      <Link
        href="/GoogleTranslate "
        onClick={onLinkClick}
        className={`${baseClasses} ${inactiveClasses}`}
      >
        <Globe size={18} /> Traducir
      </Link>
    </>
  );
}

function AuthButtons({
  isLoggedIn,
  handleLogout,
  handleOnClick,
  onLinkClick,
  mobile,
}: AuthButtonsProps) {
  return (
    <>
      {isLoggedIn ? (
        <>
          <button
            onClick={handleLogout}
            className={`w-full lg:w-auto px-4 py-2 text-gray-600 hover:text-red-600 transition-colors flex items-center justify-center gap-2 ${
              !mobile ? "hidden lg:flex" : ""
            }`}
          >
            <LogOut size={18} /> Cerrar sesión
          </button>
        </>
      ) : (
        <>
          <Link
            href="/Login"
            onClick={onLinkClick}
            className="w-full lg:w-auto px-4 py-2 text-gray-600 flex items-center justify-center gap-2 hover:text-blue-600 transition-colors"
          >
            <LogIn size={18} /> Iniciar sesión
          </Link>
          <Link
            href="/Register"
            onClick={onLinkClick}
            className="w-full lg:w-auto px-4 py-2 bg-blue-600 text-white rounded-md flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <UserPlus size={18} /> Registrarme
          </Link>
        </>
      )}
    </>
  );
}
