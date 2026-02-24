"use client";

import { useState, useEffect } from "react";
import { ILoginError, ILoginProps } from "@/interfaces/types";
import { validateLoginForm } from "@/helpers/validate";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import React from "react";
import Loader from "../Loader/Loader";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useTranslation } from "react-i18next";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";

const Login: React.FC = () => {
  const { t } = useTranslation("global");
  const kazuo_back = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  
  const initialState = {
    email: "",
    password: "",
  };

  const [dataUser, setDataUser] = useState<ILoginProps>(initialState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ILoginError>(initialState);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({
    email: false,
    password: false,
  });
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const { login } = useAppContext();

  useEffect(() => {
    const hasErrors = Object.keys(errors).length > 0;
    const isEmptyField = !dataUser.email || !dataUser.password;
    setIsButtonDisabled(hasErrors || isEmptyField);
  }, [errors, dataUser]);

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const { name } = event.target;
    setTouched({
      ...touched,
      [name]: true,
    });

    const updatedErrors = validateLoginForm({
      ...dataUser,
      [name]: event.target.value,
    });
    setErrors(updatedErrors);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setDataUser({
      ...dataUser,
      [name]: value,
    });

    const updatedErrors = validateLoginForm({
      ...dataUser,
      [name]: value,
    });
    setErrors(updatedErrors);
  };

  const encryptPassword = async (
    password: string,
    key: CryptoKey
  ): Promise<ArrayBuffer> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Vector de inicialización de 12 bytes
    return await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      data
    );
  };

  // Función para generar una clave criptográfica
  const generateKey = async (): Promise<CryptoKey> => {
    return await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const response = await fetch(`${kazuo_back}/auth/google`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: tokenResponse.access_token }),
        });

        if (response.ok) {
          const loginData = await response.json();
          await login(loginData);
          toast.success(t("login.welcome", { name: loginData.name }), {
            description: t("login.loginSuccess"),
          });
          router.push(`/GestionInventario`);
        } else {
          const errorData = await response.json();
          toast.error(t("login.authError"), {
            description: errorData.message || "Error al iniciar sesión con Google",
          });
        }
      } catch (error) {
        toast.error(t("login.unexpectedError"), {
            description: "Ocurrió un error al procesar tu solicitud con Google.",
        });
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast.error(t("login.authError"), {
        description: "Error al conectar con Google",
      });
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const currentErrors = validateLoginForm(dataUser);
    setErrors(currentErrors);

    if (Object.keys(currentErrors).length === 0) {
      setLoading(true); // Activa el loader
      try {
        const key = await generateKey();
        const encryptedPassword = await encryptPassword(dataUser.password, key);
        const encryptedPasswordBase64 = btoa(
          String.fromCharCode(...new Uint8Array(encryptedPassword))
        );
        const response = await fetch(`${kazuo_back}/auth/signin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataUser),
          // body: JSON.stringify({...dataUser, password: encryptedPasswordBase64}),
        });

        if (response.ok) {
          const loginData = await response.json();
          await login(loginData);
          toast.success(t("login.welcome", { name: loginData.name }), {
            description: t("login.loginSuccess"),
          });
          router.push(`/GestionInventario`);
        } else {
          const errorData = await response.json();
          toast.error(t("login.authError"), {
            description: errorData.message || "Credenciales incorrectas. Por favor, inténtalo de nuevo.",
          });
        }
      } catch (error) {
        toast.error(t("login.unexpectedError"), {
          description: "Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo.",
        });
      } finally {
        setLoading(false); // Desactiva el loader
        console.log("Datos del formulario:", dataUser);
      }
    }
  };

  const isFormValid =
    Object.keys(errors).length === 0 && Object.values(touched).every((t) => t);

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-[800px]">
      <div className="hidden bg-muted lg:block relative overflow-hidden">
        {/* Placeholder for brand image or gradient */}
        <div className="absolute inset-0 bg-zinc-900 object-cover opacity-90">
          <img
            src="/assets/estadisticas.jpg"
            alt="Spot-On Dashboard"
            className="h-full w-full object-cover dark:brightness-[0.2] grayscale hover:grayscale-0 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
        <div className="absolute bottom-10 left-10 text-white z-10">
          <h3 className="text-3xl font-bold mb-2">{t("login.manageBusiness")}</h3>
          <p className="text-lg text-gray-300">
            {t("login.platformDescription")}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold text-gray-900">{t("login.title")}</h1>
            <p className="text-balance text-muted-foreground">
              {t("login.subtitle")}
            </p>
          </div>

          <div className="grid gap-4">
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t("login.emailLabel")}
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t("login.emailPlaceholder")}
                  value={dataUser.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={touched.email && errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {touched.email && errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t("login.passwordLabel")}
                  </label>
                  <Link
                    href="/RecoverPass"
                    className="ml-auto inline-block text-sm underline text-primary hover:text-primary/90"
                  >
                    {t("login.forgotPassword")}
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={dataUser.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={touched.password && errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {touched.password && errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isButtonDisabled}>
                {loading ? <Loader /> : t("login.submitButton")}
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    O continuar con
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                type="button"
                onClick={() => googleLogin()}
                disabled={loading}
                className="w-full"
              >
                <FcGoogle className="mr-2 h-4 w-4" /> Google
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              {t("login.noAccount")}{" "}
              <Link
                href="/Register"
                className="underline text-primary hover:text-primary/90"
              >
                {t("login.registerLink")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
