"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { useRouter, usePathname } from "next/navigation";
import { useAlert } from "@/context/AlertContext";
import LanguageSwitcher from "../LanguageSwitcher";
import { useTranslation } from "react-i18next";
import {
  Menu,
  X,
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
  CircleHelp,
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
  const { t } = useTranslation("global");
  const { showAlert } = useAlert();

  const handleLogout = async () => {
    // Cerrar el menú si está abierto
    setIsMenuOpen(false);

    const result = await showAlert({
      title: t("navbar.logoutConfirmTitle"),
      variant: "warning",
      showCancelButton: true,
      confirmText: t("navbar.logoutConfirmButton"),
      cancelText: t("navbar.cancel"),
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
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-2 -ml-2 hover:bg-muted rounded-md transition-colors"
            onClick={toggleMenu}
            aria-label="Abrir menú principal"
          >
            <Menu size={24} />
          </button>
        </div>
        
        <nav className="hidden lg:flex items-center space-x-4">
          <NavLinks isLoggedIn={isLoggedIn} />
        </nav>

        <div className="hidden lg:flex items-center space-x-4">
          <LanguageSwitcher />
          <AuthButtons
            isLoggedIn={isLoggedIn}
            handleLogout={handleLogout}
            handleOnClick={handleOnClick}
          />
        </div>
      </div>

      </header>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[99999] lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity backdrop-blur-sm"
            onClick={closeMenu}
            aria-hidden="true"
          />
          
          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 z-[99999] h-screen w-3/4 max-w-sm !bg-white dark:!bg-slate-900 !opacity-100 p-6 shadow-xl transition-transform duration-300 ease-in-out border-r overflow-y-auto bg-opacity-100">
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-bold text-foreground">{t("navbar.menu")}</span>
              <button
                onClick={closeMenu}
                className="p-2 -mr-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                aria-label="Cerrar menú"
              >
                <X size={24} />
              </button>
            </div>
            
            <nav className="flex flex-col space-y-2">
              <NavLinks onLinkClick={closeMenu} mobile isLoggedIn={isLoggedIn} />
              <LanguageSwitcher mobile />
            </nav>
            
            <div className="mt-auto pt-8 border-t">
              <div className="flex flex-col space-y-4">
                <AuthButtons
                  isLoggedIn={isLoggedIn}
                  handleLogout={handleLogout}
                  handleOnClick={handleOnClick}
                  onLinkClick={closeMenu}
                  mobile
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
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
  const pathname = usePathname();
  const { t } = useTranslation("global");
  const baseClasses =
    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground";
  const activeClasses = "bg-accent text-accent-foreground";
  const inactiveClasses = "text-muted-foreground";

  const getLinkClasses = (path: string) => {
    // Normalizar paths para comparación (eliminar espacios extra si los hay)
    const cleanPath = path.trim();
    const isActive =
      cleanPath === "/" ? pathname === "/" : pathname?.startsWith(cleanPath);
    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  if (isLoggedIn) {
    return (
      <>
        <Link
          href="/GestionInventario"
          onClick={onLinkClick}
          className={getLinkClasses("/GestionInventario")}
        >
          <LayoutDashboard size={18} /> {t("navbar.inventoryManagement")}
        </Link>
        <Link
          href="/Company"
          onClick={onLinkClick}
          className={getLinkClasses("/Company")}
        >
          <Building size={18} /> {t("navbar.companyManagement")}
        </Link>
        <Link
          href="/Profile"
          onClick={onLinkClick}
          className={getLinkClasses("/Profile")}
          id="tour-profile-link"
        >
          <User size={18} /> {t("navbar.profile")}
        </Link>
        <Link
          href="/Nosotros"
          onClick={onLinkClick}
          className={getLinkClasses("/Nosotros")}
        >
          <Users size={18} /> {t("navbar.aboutUs")}
        </Link>
        <Link
          href="/Contacto"
          onClick={onLinkClick}
          className={getLinkClasses("/Contacto")}
        >
          <Phone size={18} /> {t("navbar.contact")}
        </Link>
      </>
    );
  }

  return (
    <>
      <Link href="/" onClick={onLinkClick} className={getLinkClasses("/")}>
        <Home size={18} /> {t("navbar.home")}
      </Link>
      {/* <Link
        href="/Soluciones"
        onClick={onLinkClick}
        className={getLinkClasses("/Soluciones")}
      >
        <Lightbulb size={18} /> Soluciones
      </Link> */}
      {/* <Link
        href="/Planes"
        onClick={onLinkClick}
        className={getLinkClasses("/Planes")}
      >
        <ClipboardList size={18} /> Planes
      </Link> */}
      {/* <Link
        href="/Contacto"
        onClick={onLinkClick}
        className={getLinkClasses("/Contacto")}
      >
        <Phone size={18} /> Contacto
      </Link> */}
      {/* <Link
        href="/Nosotros"
        onClick={onLinkClick}
        className={getLinkClasses("/Nosotros")}
      >
        <Users size={18} /> Nosotros
      </Link> */}
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
  const { t } = useTranslation("global");
  return (
    <>
      {isLoggedIn ? (
        <>
           <button
            onClick={() => window.dispatchEvent(new Event("start-tour"))}
            className={`w-full lg:w-auto px-4 py-2 text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2 ${
              !mobile ? "hidden lg:flex" : ""
            }`}
            id="tour-help-btn"
            title={t("tour.help.title")}
          >
            <CircleHelp size={18} /> {mobile && t("tour.help.title")}
          </button>

          <button
            onClick={handleLogout}
            className={`w-full lg:w-auto px-4 py-2 text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center gap-2 ${
              !mobile ? "hidden lg:flex" : ""
            }`}
          >
            <LogOut size={18} /> {t("navbar.logout")}
          </button>
        </>
      ) : (
        <>
          <Link
            href="/Login"
            onClick={onLinkClick}
            className="w-full lg:w-auto px-4 py-2 text-sm font-medium text-muted-foreground flex items-center justify-center gap-2 hover:text-primary transition-colors"
          >
            <LogIn size={18} /> {t("navbar.login")}
          </Link>
          <Link
            href="/Register"
            onClick={onLinkClick}
            className="w-full lg:w-auto px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
          >
            <UserPlus size={18} /> {t("navbar.register")}
          </Link>
        </>
      )}
    </>
  );
}
