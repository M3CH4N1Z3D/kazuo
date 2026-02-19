"use client";

import { useAppContext } from "@/context/AppContext";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Building, Shield, KeyRound, Edit, Camera } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";

export default function ProfilePage() {
  const { userData, isLoggedIn, setUserData } = useAppContext();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/Login");
    }
  }, [isLoggedIn, router]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userData) return;

    // Validar tipo y tamaño
    if (!file.type.startsWith('image/')) {
      Swal.fire('Error', 'Por favor selecciona un archivo de imagen válido', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      Swal.fire('Error', 'La imagen debe ser menor a 2MB', 'error');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const userId = userData.userId || userData.id; 
      
      const response = await fetch(`${apiUrl}/files/uploadProfileImage/${userId}`, {
        method: 'POST',
        headers: {
             'Authorization': `Bearer ${userData.token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }

      const data = await response.json();
      
      // Actualizar el contexto y localStorage con la nueva URL
      // Asumiendo que el backend devuelve la URL de la imagen en data.imgUrl o similar
      // Si el backend devuelve solo el string de la url:
      const newImgUrl = data.imgUrl || data.url || data; 

      const updatedUser = { ...userData, igmUrl: newImgUrl };
      setUserData(updatedUser);
      localStorage.setItem("userData", JSON.stringify(updatedUser));
      
      Swal.fire({
        icon: 'success',
        title: 'Imagen actualizada',
        text: 'Tu foto de perfil ha sido actualizada correctamente',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo actualizar la imagen de perfil', 'error');
    } finally {
      setIsUploading(false);
      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
          {/* Sección de Imagen de Perfil */}
          <div className="flex flex-col items-center justify-center pb-6 border-b">
            <div className="relative group cursor-pointer" onClick={handleImageClick}>
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-md bg-slate-200 flex items-center justify-center">
                 {userData.igmUrl ? (
                  <img 
                    src={userData.igmUrl} 
                    alt="Foto de perfil" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback si la imagen falla
                      e.currentTarget.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(userData.name) + "&background=random";
                    }}
                  />
                ) : (
                  <User className="h-16 w-16 text-slate-400" />
                )}
                
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              
              <div className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg border-2 border-white group-hover:bg-primary/90 transition-colors">
                <Edit size={16} />
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Click para cambiar foto</p>
          </div>

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
