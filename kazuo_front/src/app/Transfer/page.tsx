"use client";

import { useEffect, useState } from "react";
import { useAlert } from "@/context/AlertContext";
import { useAppContext } from "@/context/AppContext";
import Loader from "@/components/Loader/Loader";
import { useRouter } from "next/navigation";
import { IStore } from "@/interfaces/types";

export default function TransferPage() {
  const { showAlert } = useAlert();
  const { userData } = useAppContext();
  const router = useRouter();
  const kazuo_back = process.env.NEXT_PUBLIC_API_URL;

  const [stores, setStores] = useState<IStore[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingStores, setFetchingStores] = useState(true);

  const [formData, setFormData] = useState({
    sourceStoreId: "",
    targetStoreId: "",
    barcode: "",
    quantity: "",
  });

  const fetchStores = async () => {
    if (userData && userData.company) {
      try {
        const response = await fetch(
          `${kazuo_back}/companies/AllStoresCompany/${userData.company}`
        );
        const dataStore = await response.json();
        
        // Ajustar según la estructura de respuesta vista en Inventario/index.tsx
        const storeInfo =
          dataStore[0]?.stores.map((store: any) => ({
            id: store?.id || "",
            name: store?.name || "",
            categoryName: store?.category?.name || "",
            categoryId: store?.category?.id || "",
          })) || [];

        setStores(storeInfo);
      } catch (error) {
        console.error("Error fetching stores:", error);
        showAlert({
            title: "Error",
            message: "No se pudieron cargar las bodegas.",
            variant: "danger",
        });
      } finally {
        setFetchingStores(false);
      }
    } else {
        setFetchingStores(false);
    }
  };

  useEffect(() => {
    if (!userData) {
        router.push("/Login");
        return;
    }
    fetchStores();
  }, [userData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.sourceStoreId ||
      !formData.targetStoreId ||
      !formData.barcode ||
      !formData.quantity
    ) {
      showAlert({
        title: "Error",
        message: "Por favor complete todos los campos.",
        variant: "warning",
      });
      return;
    }

    if (formData.sourceStoreId === formData.targetStoreId) {
        showAlert({
            title: "Error",
            message: "La bodega de origen y destino no pueden ser la misma.",
            variant: "warning",
        });
        return;
    }

    try {
      setLoading(true);
      const token = userData?.token || localStorage.getItem("token");
      
      const payload = {
        sourceStoreId: formData.sourceStoreId,
        targetStoreId: formData.targetStoreId,
        barcode: formData.barcode,
        quantity: Number(formData.quantity),
      };

      const response = await fetch(`${kazuo_back}/product/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showAlert({
          title: "Éxito",
          message: "Transferencia realizada correctamente.",
          variant: "success",
        });
        setFormData({
            sourceStoreId: "",
            targetStoreId: "",
            barcode: "",
            quantity: "",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al realizar la transferencia.");
      }
    } catch (error: any) {
      showAlert({
        title: "Error",
        message: error.message,
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingStores) {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <Loader />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Traslado de Inventario
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Mueve productos entre tus bodegas
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            
            {/* Source Store */}
            <div className="mb-4">
              <label htmlFor="sourceStoreId" className="block text-sm font-medium text-gray-700 mb-1">
                Bodega de Origen
              </label>
              <select
                id="sourceStoreId"
                name="sourceStoreId"
                value={formData.sourceStoreId}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              >
                <option value="">Seleccione una bodega</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Store */}
            <div className="mb-4">
              <label htmlFor="targetStoreId" className="block text-sm font-medium text-gray-700 mb-1">
                Bodega de Destino
              </label>
              <select
                id="targetStoreId"
                name="targetStoreId"
                value={formData.targetStoreId}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              >
                <option value="">Seleccione una bodega</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Barcode */}
            <div className="mb-4">
              <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">
                Código de Barras
              </label>
              <input
                id="barcode"
                name="barcode"
                type="text"
                required
                value={formData.barcode}
                onChange={handleChange}
                placeholder="Escanea o ingresa el código"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              />
            </div>

            {/* Quantity */}
            <div className="mb-4">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Cantidad a transferir"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              />
            </div>

          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              }`}
            >
              {loading ? (
                  <Loader />
              ) : (
                "Transferir"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
