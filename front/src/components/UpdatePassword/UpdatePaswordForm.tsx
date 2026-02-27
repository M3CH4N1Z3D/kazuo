"use client";
import { useState, useEffect } from "react";
import { IUpdatePassProps, TUpdatePassError } from "@/interfaces/types";
import { validateUpdatePass } from "@/helpers/validate";
import { useAlert } from "@/context/AlertContext";
import { useAppContext } from "@/context/AppContext";
// import { register } from "@/helpers/auth.helper";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

const UpdatePassForm = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { userData, isLoggedIn } = useAppContext();

  const initialState: IUpdatePassProps = {
    newPassword: "",
    confirmNewPass: "",
    token: token || "",
    oldPassword: "",
  };

  const [dataUpdatedPass, setDataUpdatedPass] = useState<IUpdatePassProps>(initialState);
  const [errors, setErrors] = useState<TUpdatePassError>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({
    newPassword: false,
    confirmNewPass: false,
    oldPassword: false,
  });

  const { showAlert } = useAlert();

  useEffect(() => {
    if (!token && !isLoggedIn) {
       // Si no hay token y no está logueado, redirigir a login
       // o mostrar mensaje de error apropiado
       // router.push("/Login");
    }
  }, [token, isLoggedIn, router]);

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const { name } = event.target;
    setTouched({
      ...touched,
      [name]: true,
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setDataUpdatedPass({
      ...dataUpdatedPass,
      [name]: value,
    });

    const updatedErrors = validateUpdatePass({
      ...dataUpdatedPass,
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
    const validationErrors = validateUpdatePass(dataUpdatedPass);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        let response;
        if (token) {
            // Reset Password Flow (Forgot Password)
            response = await fetch(`${apiUrl}/auth/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataUpdatedPass),
            });
        } else {
            // Change Password Flow (Logged in)
            if (!userData?.token) {
                throw new Error("No estás autenticado");
            }
            response = await fetch(`${apiUrl}/auth/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${userData.token}`
                },
                body: JSON.stringify({
                    oldPassword: dataUpdatedPass.oldPassword,
                    newPassword: dataUpdatedPass.newPassword
                }),
            });
        }

        if (response.ok) {
          showAlert({
            title: "¡Contraseña actualizada correctamente!",
            message: token ? "Ahora puedes iniciar sesión con tu nueva contraseña." : "Tu contraseña ha sido actualizada.",
            variant: "success",
            confirmText: "Aceptar",
          });
          setDataUpdatedPass(initialState);
          setTouched({
            oldPassword: false,
            newPassword: false,
            confirmNewPass: false,
          });
          if (token) {
              router.push("/Login");
          } else {
              router.push("/Profile");
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Respuesta no exitosa del servidor");
        }
      } catch (error: any) {
        showAlert({
          title: "Error al actualizar contraseña",
          message: error.message || "Inténtalo nuevamente",
          variant: "danger",
          confirmText: "Aceptar",
        });
      }
    }
  };

  const isFormValid =
    Object.keys(errors).length === 0 && 
    touched.newPassword && 
    touched.confirmNewPass && 
    (token ? true : touched.oldPassword);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg mt-6 mb-6 rounded-lg">
        <h2 className="text-2xl font-bold text-center text-gray-700 uppercase">
          Actualizar contraseña
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!token && (
              <div className="space-y-2">
                <label
                  htmlFor="oldPassword"
                  className="block text-sm font-bold text-gray-700"
                >
                  Contraseña actual:
                </label>
                <Input
                  type="password"
                  name="oldPassword"
                  id="oldPassword"
                  value={dataUpdatedPass.oldPassword || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {touched.oldPassword && errors.oldPassword && (
                  <p className="text-red-500 text-sm">{errors.oldPassword}</p>
                )}
              </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="newPassword"
              className="block text-sm font-bold text-gray-700"
            >
              Nueva contraseña:
            </label>
            <Input
              type="password"
              name="newPassword"
              id="newPassword"
              value={dataUpdatedPass.newPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {touched.newPassword && errors.newPassword && (
              <p className="text-red-500 text-sm">{errors.newPassword}</p>
            )}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="confirmNewPass"
              className="block text-sm font-bold text-gray-700"
            >
              Confirma la nueva contraseña:
            </label>
            <Input
              type="password"
              name="confirmNewPass"
              id="confirmNewPass"
              value={dataUpdatedPass.confirmNewPass}
              onChange={handleChange}
              onBlur={handleBlur}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {/* Mostrar mensaje de error si las contraseñas no coinciden */}
            {touched.confirmNewPass && errors.confirmNewPass && (
              <p className="text-red-500 text-sm">{errors.confirmNewPass}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-2 px-4 font-semibold rounded-xl shadow-sm transition-all border ${
              isFormValid
                ? "bg-white border-slate-200 text-slate-700 hover:shadow-md hover:border-transparent hover:bg-gradient-to-r hover:from-sky-500 hover:to-green-500 hover:text-white"
                : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
            }`}
          >
            Actualizar contraseña
          </button>
        </form>
      </div>
    </div>
  );
};
export default UpdatePassForm;
