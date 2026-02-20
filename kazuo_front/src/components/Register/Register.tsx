"use client";
import { useState } from "react";
import { TRegisterError, IRegisterProps } from "@/interfaces/types";
import { validateRegisterForm } from "@/helpers/validate";
import Swal from "sweetalert2";
// import { register } from "@/helpers/auth.helper";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "../Loader/Loader";
import { useAppContext } from "@/context/AppContext";
import { useGoogleLogin } from "@react-oauth/google";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

const Register = () => {
  const [t] = useTranslation("global");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAppContext();
  const kazuo_back = process.env.NEXT_PUBLIC_API_URL;
  
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");
  const nameParam = searchParams.get("name");

  const initialState: IRegisterProps = {
    email: emailParam || "",
    password: "",
    confirmPass: "",
    name: nameParam || "",
    invitationToken: token || undefined,
  };

  const [dataUser, setDataUser] = useState<IRegisterProps>(initialState);

  useEffect(() => {
    if (emailParam || token || nameParam) {
      setDataUser((prev) => ({
        ...prev,
        email: emailParam || prev.email,
        name: nameParam || prev.name,
        invitationToken: token || undefined,
      }));
      setTouched((prev) => ({
        ...prev,
        email: !!emailParam,
        name: !!nameParam,
      }));
    }
  }, [emailParam, token, nameParam]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<TRegisterError>(initialState);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({
    email: false,
    password: false,
    confirmPass: false,
    name: false,
  });

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
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
          Swal.fire({
            title: t("register.welcomeTitle", { name: loginData.name }),
            text: t("register.googleSuccess"),
            icon: "success",
            confirmButtonText: t("company.alerts.accept"),
          });
          router.push("/GestionInventario");
        } else {
          throw new Error("Error en login Google");
        }
      } catch (error) {
        console.error(error);
        Swal.fire({
          title: t("register.googleErrorTitle"),
          text: t("register.googleErrorText"),
          icon: "error",
          confirmButtonText: t("company.alerts.accept"),
        });
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      Swal.fire({
        title: t("register.googleErrorTitle"),
        text: t("register.googleConnectError"),
        icon: "error",
        confirmButtonText: t("company.alerts.accept"),
      });
    },
  });

  const handleGoogleLogin = () => googleLogin();

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const { name } = event.target;
    setTouched({
      ...touched,
      [name]: true,
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setDataUser({
      ...dataUser,
      [name]: value,
    });

    const updatedErrors = validateRegisterForm({
      ...dataUser,
      [name]: value,
    });
    setErrors(updatedErrors);

    setTouched({
      ...touched,
      [name]: true,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateRegisterForm(dataUser);
    setErrors(validationErrors);
    console.log(dataUser);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        const response = await fetch(`${kazuo_back}/auth/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataUser),
        });

        if (response.ok) {
          Swal.fire({
            title: t("register.registerSuccessTitle"),
            text: t("register.registerSuccessText"),
            icon: "success",
            confirmButtonText: t("company.alerts.accept"),
          });
          setDataUser(initialState);
          setTouched({
            email: false,
            password: false,
            confirmPass: false,
            name: false,
          });
          router.push("/Login");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al registrarse");
        }
      } catch (error: any) {
        Swal.fire({
          title: t("register.registerErrorTitle"),
          text: error.message || t("register.registerErrorText"),
          icon: "error",
          confirmButtonText: t("company.alerts.accept"),
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const isFormValid =
    Object.keys(errors).length === 0 && Object.values(touched).every((t) => t);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg mt-6 mb-6 rounded-lg">
        <h2 className="text-2xl font-bold text-center text-gray-700 uppercase">
          {t("register.title")}
        </h2>
        {!token && (
          <>
            <div>
              <button
                onClick={handleGoogleLogin}
                className="w-full py-2 px-4 bg-white text-gray-700 font-semibold rounded-md shadow-sm hover:bg-gray-50 border border-gray-300 flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {t("register.googleRegister")}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t("register.or")}</span>
              </div>
            </div>
          </>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-bold text-gray-700"
            >
              {t("register.emailLabel")}
            </label>
            <input
              type="email"
              name="email"
              id="email"
              onBlur={handleBlur}
              value={dataUser.email}
              onChange={handleChange}
              readOnly={!!token}
              className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                token ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
            {touched.email && errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-bold text-gray-700"
            >
              {t("register.passwordLabel")}
            </label>
            <Input
              type="password"
              name="password"
              id="password"
              value={dataUser.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {touched.password && errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="confirmPass"
              className="block text-sm font-bold text-gray-700"
            >
              {t("register.confirmPasswordLabel")}
            </label>
            <Input
              type="password"
              name="confirmPass"
              id="confirmPass"
              value={dataUser.confirmPass}
              onChange={handleChange}
              onBlur={handleBlur}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {/* Mostrar mensaje de error si las contraseñas no coinciden */}
            {touched.confirmPass && errors.confirmPass && (
              <p className="text-red-500 text-sm">{errors.confirmPass}</p>
            )}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-bold text-gray-700"
            >
              {t("register.nameLabel")}
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={dataUser.name}
              onChange={handleChange}
              onBlur={handleBlur}
              readOnly={!!token}
              className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                token ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
            {touched.name && errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-2 px-4 text-white font-semibold rounded-md shadow-sm flex justify-center items-center ${
              isFormValid
                ? "bg-gray-900 hover:bg-gray-800"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? <Loader /> : t("register.submitButton")}
          </button>
        </form>
      </div>
    </div>
  );
};
export default Register;
