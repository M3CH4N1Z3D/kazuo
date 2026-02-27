"use client";

import { useAppContext } from "@/context/AppContext";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Building, Shield, KeyRound, Edit, Camera } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAlert } from "@/context/AlertContext";
import { useTranslation } from "react-i18next";
import { SpotOnSpinner } from "@/components/Loader/SpotOnSpinner";

export default function ProfilePage() {
  const { t } = useTranslation("global");
  const { showAlert } = useAlert();
  const { userData, isLoggedIn, setUserData } = useAppContext();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/Login");
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (userData?.company && userData.token) {
        try {
          // Si el campo company parece un nombre (no UUID), úsalo directamente
          // UUID regex simple (8-4-4-4-12 hex digits)
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(userData.company)) {
             setCompanyName(userData.company);
             return;
          }

          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          const response = await fetch(`${apiUrl}/companies/${userData.company}`, {
            headers: {
              'Authorization': `Bearer ${userData.token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
              setCompanyName(data.CompanyName || data.name || t("profile.companyNotFound"));
            } else {
              console.error("Error fetching company details");
            setCompanyName(userData.company); // Fallback al ID si falla
          }
        } catch (error) {
          console.error("Error fetching company", error);
          setCompanyName(userData.company); // Fallback
        }
      } else if (userData?.company) {
         setCompanyName(userData.company);
      }
    };

    if (userData) {
      fetchCompanyData();
    }
  }, [userData]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userData) return;

    // Validar tipo y tamaño
    if (!file.type.startsWith('image/')) {
      showAlert({
        title: t("profile.alerts.errorTitle"),
        message: t("profile.alerts.invalidFile"),
        variant: "danger",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      showAlert({
        title: t("profile.alerts.errorTitle"),
        message: t("profile.alerts.fileTooBig"),
        variant: "danger",
      });
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
      
      showAlert({
        variant: 'success',
        title: t("profile.alerts.successTitle"),
        message: t("profile.alerts.successText"),
        confirmText: "OK"
      });

    } catch (error) {
      console.error(error);
      showAlert({
        title: t("profile.alerts.errorTitle"),
        message: t("profile.alerts.updateError"),
        variant: "danger",
      });
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
        <SpotOnSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-primary px-6 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="h-6 w-6" /> {t("profile.title")}
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
                    <SpotOnSpinner size="md" />
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
            <p className="mt-2 text-sm text-muted-foreground">{t("profile.changePhoto")}</p>
          </div>

          <div className="grid gap-6">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{t("profile.name")}</p>
                <p className="text-lg font-semibold">{userData.name || t("profile.noName")}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="bg-blue-100 p-3 rounded-full">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{t("profile.email")}</p>
                <p className="text-lg font-semibold">{userData.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="bg-blue-100 p-3 rounded-full">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{t("profile.company")}</p>
                <p className="text-lg font-semibold">{companyName || userData.company || t("profile.noCompany")}</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/UpdatePass" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full flex gap-2">
                <KeyRound size={18} />
                {t("profile.changePassword")}
              </Button>
            </Link>
             <Link href="/GestionInventario" className="w-full sm:w-auto">
              <Button className="w-full">
                {t("profile.goToInventory")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
