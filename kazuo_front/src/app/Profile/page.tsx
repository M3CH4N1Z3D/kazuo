"use client";

import { useAppContext } from "@/context/AppContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Building, Shield, KeyRound } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { userData, isLoggedIn } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/Login");
    }
  }, [isLoggedIn, router]);

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-primary px-6 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="h-6 w-6" /> Perfil de Usuario
          </h1>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid gap-6">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Nombre</p>
                <p className="text-lg font-semibold">{userData.name || "Sin nombre"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="bg-blue-100 p-3 rounded-full">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Correo Electrónico</p>
                <p className="text-lg font-semibold">{userData.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="bg-blue-100 p-3 rounded-full">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Empresa / Organización</p>
                <p className="text-lg font-semibold">{userData.company || "No especificada"}</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/UpdatePass" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full flex gap-2">
                <KeyRound size={18} />
                Cambiar Contraseña
              </Button>
            </Link>
             <Link href="/GestionInventario" className="w-full sm:w-auto">
              <Button className="w-full">
                Ir al Inventario
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
