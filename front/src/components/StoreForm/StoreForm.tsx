"use client";

import { useEffect, useState } from "react";
import { useAlert } from "@/context/AlertContext";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { ICategory } from "@/interfaces/types";
import Loader from "../Loader/Loader";
import { useAppContext } from "@/context/AppContext";

export const StoreForm = () => {
  const { t } = useTranslation("global");
  const { showAlert } = useAlert();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [type, setType] = useState<string>("VENTA");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState<string>("");
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true); // Estado para habilitar/deshabilitar el botón
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const { userData } = useAppContext();

  const categoriesFromStorage: ICategory[] =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("Categorias") || "[]")
      : [];

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setType(e.target.value);
  };

  const handleNombreBodegaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  // Verifica si los campos están completos para habilitar el botón
  useEffect(() => {
    const hasCompany = !!userData?.company;
    setIsButtonDisabled(!(name && selectedCategory && hasCompany));
  }, [name, selectedCategory, userData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 
    
    const userId = userData?.id || "";
    const companyIds = userData?.company ? [userData.company] : [];
    

    const dataStore = {
      name,
      categoryName: selectedCategory,
      type,
      userId,
      companyIds,
    };
    console.log(dataStore);

    try {
      setLoading(true);
      const token = userData?.token || localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/store/bodega/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataStore),
      });

      console.log(dataStore);

      if (response.ok) {
        showAlert({
          title: t("storeForm.alerts.createdTitle"),
          message: t("storeForm.alerts.createdText"),
          variant: "success",
          confirmText: t("storeModal.accept"),
        });
        router.push("/GestionInventario");
      } else {
        throw new Error(t("storeForm.alerts.creationFailed"));
      }
    } catch (error) {
      showAlert({
        title: t("storeForm.alerts.errorTitle"),
        message: t("storeForm.alerts.errorText"),
        variant: "danger",
        confirmText: t("storeModal.accept"),
      });
    } finally {
      setLoading(false); // Desactiva el loader
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center text-blue-700">
          {t("storeForm.title")}
        </h2>
        {userData && !userData.company && (
          <div
            className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4"
            role="alert"
          >
            <p>{t("inventory.createCompanyFirst")}</p>
          </div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Campo para el nombre de la bodega */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              {t("storeForm.nameLabel")}
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={name}
              onChange={handleNombreBodegaChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={t("storeForm.namePlaceholder")}
            />
          </div>

          {/* Desplegable para seleccionar categoría */}
          <div className="space-y-2">
            <label
              htmlFor="categoryName"
              className="block text-sm font-medium text-gray-700"
            >
              {t("storeForm.categoryLabel")}
            </label>
            <select
              name="categoryName"
              id="categoryName"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="" disabled>
                {t("storeForm.selectCategory")}
              </option>
              {categoriesFromStorage.map((category: ICategory) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Desplegable para seleccionar tipo */}
          <div className="space-y-2">
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700"
            >
              Tipo de Bodega
            </label>
            <select
              name="type"
              id="type"
              value={type}
              onChange={handleTypeChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="VENTA">VENTA</option>
              <option value="RESPALDO">RESPALDO</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isButtonDisabled} // Deshabilita el botón si isButtonDisabled es true
            className={`w-full py-2 px-4 rounded-xl font-medium shadow-sm transition-all flex items-center justify-center gap-2 border ${
              isButtonDisabled ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-white border-slate-200 text-slate-700 hover:shadow-md hover:border-transparent hover:bg-gradient-to-r hover:from-sky-500 hover:to-green-500 hover:text-white"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500`}
          >
            {loading ? <Loader /> : t("storeForm.submitButton")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StoreForm;
