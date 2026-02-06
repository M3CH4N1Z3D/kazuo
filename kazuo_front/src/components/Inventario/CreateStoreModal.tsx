"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Swal from "sweetalert2";
import { ICategory } from "@/interfaces/types";
import Loader from "../Loader/Loader";
import { useAppContext } from "@/context/AppContext";

interface CreateStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoreCreated: () => void;
}

const CreateStoreModal: React.FC<CreateStoreModalProps> = ({
  isOpen,
  onClose,
  onStoreCreated,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const { userData } = useAppContext();
  const kazuo_back = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (isOpen) {
      // Reset form when opening
      setName("");
      setSelectedCategory("");
      
      // Load categories
      const categoriesFromStorage: ICategory[] =
        typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("Categorias") || "[]")
          : [];
      setCategories(categoriesFromStorage);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !selectedCategory) {
      Swal.fire("Error", "Todos los campos son obligatorios", "error");
      return;
    }

    const userId = userData?.id || "";
    const companyIds = userData?.company ? [userData.company] : [];

    const dataStore = {
      name,
      categoryName: selectedCategory,
      userId,
      companyIds,
    };

    try {
      setLoading(true);
      const token = userData?.token || localStorage.getItem("token");
      
      const response = await fetch(`${kazuo_back}/store/bodega/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataStore),
      });

      if (response.ok) {
        Swal.fire({
          title: "¡Bodega creada!",
          text: "La bodega se ha creado correctamente.",
          icon: "success",
          confirmButtonText: "Aceptar",
        });
        onStoreCreated();
        onClose();
      } else {
        throw new Error("Error en la creación de la bodega");
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo crear la bodega. Por favor, inténtalo de nuevo.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-6 text-center"
                >
                  Crear Bodega
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nombre de la Bodega
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Ingrese el nombre de la bodega"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Categoría
                    </label>
                    <select
                      id="category"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="" disabled>
                        Seleccione una categoría
                      </option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-8 flex justify-end gap-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={onClose}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !name || !selectedCategory}
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:bg-blue-300"
                    >
                      {loading ? <Loader /> : "Aceptar"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CreateStoreModal;
