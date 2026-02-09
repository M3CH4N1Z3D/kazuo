"use client";

import { IEditStoreProps, IProduct } from "@/interfaces/types";
import { useAuth0 } from "@auth0/auth0-react";

import { useEffect, useState, useRef, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import ProductForm from "../ProductForm/ProductForm";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import {
  faEdit,
  faMinus,
  faPlus,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "../Loader/Loader";
import Swal from "sweetalert2";

const Products: React.FC<IEditStoreProps> = ({ storeId }) => {
  const router = useRouter();
  const { userData } = useAppContext();
  const { user, isAuthenticated } = useAuth0();

  const [activeTab, setActiveTab] = useState("stock");
  const [products, setProducts] = useState<IProduct[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [storeName, setStoreName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const kazuo_back = process.env.NEXT_PUBLIC_API_URL;

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${kazuo_back}/product/store/${storeId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userData?.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener los productos");
      }

      const data = await response.json();
      const sortedProducts = data.sort((a: IProduct, b: IProduct) =>
        a.name.localeCompare(b.name)
      );
      setProducts(sortedProducts);

      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setProducts([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userData?.token) {
      fetchProducts();
    }
  }, [userData]);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const response = await fetch(`${kazuo_back}/store/${storeId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userData?.token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Error al obtener los datos de la bodega");
        }
        const data = await response.json();
        setStoreName(data.storeFound.name);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    if (userData?.token) {
      fetchStoreData();
    }
  }, [storeId, userData]);

  const handleCreateNewProduct = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleProductCreated = () => {
    setIsModalOpen(false);
    fetchProducts();
  };

  const handlePencilClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.unids.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.bange.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNavigateToStatistics = () => {
    router.push(`/Statistics/${storeId}`);
  };

  const handleGenerateReport = () => {
    try {
      const doc = new jsPDF();
      const totalOutPrice = products.reduce(
        (sum, product) => sum + Number(product.outPrice),
        0
      );
      const totalInPrice = products.reduce(
        (sum, product) => sum + Number(product.inPrice),
        0
      );
      const estimatedProfits = totalOutPrice - totalInPrice;

      // Configuración del documento
      doc.setFont("helvetica");
      doc.setFontSize(20);

      // Título y fecha
      doc.text(`Reporte de Inventario - ${storeName}`, 20, 20);
      doc.setFontSize(12);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 30);
      doc.text(
        `Ganancias estimadas: ${estimatedProfits.toFixed(2)} ${
          products[0]?.bange || ""
        }`,
        20,
        40
      );

      // Tabla de productos
      const headers = [
        "Producto",
        "Cantidad",
        "U. Medida",
        "P. Compra",
        "P. Venta",
        "Stock Min.",
      ];
      let y = 50;

      // Encabezados
      doc.setFontSize(10);
      headers.forEach((header, index) => {
        doc.text(header, 20 + index * 30, y);
      });

      // Línea separadora
      y += 2;
      doc.line(20, y, 190, y);
      y += 10;

      // Productos
      doc.setFontSize(9);
      products.forEach((product) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }

        doc.text(product.name.substring(0, 15), 20, y);
        doc.text(product.quantity.toString(), 50, y);
        doc.text(product.unids, 80, y);
        doc.text(`${product.inPrice}`, 110, y);
        doc.text(`${product.outPrice}`, 140, y);
        doc.text(`${product.minStock}`, 170, y);

        y += 7;
      });

      // Resumen
      y += 10;
      doc.setFontSize(10);
      doc.text(`Total de productos: ${products.length}`, 20, y);

      // Descargar PDF
      doc.save(
        `Inventario_${storeName}_${new Date().toLocaleDateString()}.pdf`
      );

      Swal.fire({
        title: "¡Éxito!",
        text: "El informe se ha generado y descargado correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo generar el informe. Por favor, inténtalo de nuevo.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  };

  const handleNavigateToProductPage = (productId: string) => {
    if (userData || isAuthenticated) {
      router.push(`/Products/${storeId}/${productId}`);
    } else {
      router.push("/login");
    }
  };

  const handleAddProduct = (productId: string) => {
    Swal.fire({
      title: "¿Cuántos Productos se añadirán?",
      input: "number",
      inputLabel: "Añadir productos",
      inputPlaceholder: "Ingrese la cantidad",
      showCancelButton: true,
      inputValidator: (value) => {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue <= 0) {
          return "Por favor, ingrese una cantidad válida";
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const quantityChange = Number(result.value);
        updateProductQuantity(productId, quantityChange);
        console.log(quantityChange);
      }
    });
  };

  const handleNewOrderProduct = (productId: string) => {
    Swal.fire({
      title: "¿Cuántos productos se despacharán?",
      input: "number",
      inputLabel: "Generar despacho",
      inputPlaceholder: "Ingrese la cantidad",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value || Number(value) <= 0) {
          return "Por favor, ingrese una cantidad válida";
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const quantityChange = Number(result.value);
        updateProductQuantity(productId, -quantityChange);
      }
    });
  };
  const updateProductQuantity = async (
    productId: string,
    quantityChange: number
  ) => {
    console.log(quantityChange);
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const newQuantity = Number(product.quantity) + Number(quantityChange);
    console.log(product.quantity);

    try {
      const response = await fetch(`${kazuo_back}/product/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData?.token}`,
        },
        body: JSON.stringify({ quantity: Number(newQuantity) }),
      });

      if (response.ok) {
        setProducts(
          products.map((p) =>
            p.id === productId ? { ...p, quantity: newQuantity } : p
          )
        );
        Swal.fire("Éxito", "Cantidad actualizada correctamente", "success");
      } else {
        throw new Error("Error al actualizar la cantidad");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Error", "No se pudo actualizar la cantidad", "error");
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-center bg-gray-100">
      <main className="w-full flex-grow container mx-auto px-4 py-8">
        <div className="rounded-md p-8 md:w-2/3 mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-gray-800">
              {storeName || "Cargando el nombre de la bodega"}
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className={`w-full sm:w-52 px-4 py-2 rounded text-sm text-white transition duration-300 ease-in-out flex items-center justify-center ${
                  userData?.isAdmin
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                onClick={handleGenerateReport}
                disabled={!userData?.isAdmin}
              >
                Generar Informe
              </button>
              <button
                className={`w-full sm:w-52 px-4 py-2 rounded text-sm text-white transition duration-300 ease-in-out flex items-center justify-center ${
                  userData?.isAdmin
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                onClick={handleNavigateToStatistics}
                disabled={!userData?.isAdmin}
              >
                Estadisticas por Bodega
              </button>
              <button
                className="w-full sm:w-52 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition duration-300 ease-in-out flex items-center justify-center"
                onClick={handleCreateNewProduct}
              >
                Agregar Producto
              </button>
            </div>
          </div>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar productos por nombre, unidad de medida o moneda"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-md p-3 w-full"
            />

          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader />
            </div>
          ) : (
            <div className="w-full mt-4 overflow-x-auto shadow-md sm:rounded-lg">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Cantidad
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Unidad
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Cap. Max
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Precio Compra
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Moneda
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Precio Venta
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Stock Min
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.unids}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.maxCapacity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.inPrice}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.bange}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.outPrice}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-red-600 font-bold">
                          {product.minStock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <td className="grid grid-cols-2 grid-rows-2 gap-6 py-2 text-center">
                              <FontAwesomeIcon
                                icon={faEdit}
                                className="text-blue-500 hover:text-blue-600 cursor-pointer mx-1"
                                title="Editar producto"
                                onClick={() =>
                                  handleNavigateToProductPage(product.id!)
                                }
                              />
                              <FontAwesomeIcon
                                icon={faChartLine}
                                className="text-green-500 hover:text-green-600"
                                title="Ver estadísticas"
                              />
                              <FontAwesomeIcon
                                icon={faPlus}
                                className="text-yellow-500 hover:text-yellow-600 cursor-pointer"
                                title="Añadir stock"
                                onClick={() => handleAddProduct(product.id!)}
                              />
                              <FontAwesomeIcon
                                icon={faMinus}
                                className="text-red-500 hover:text-red-600 cursor-pointer"
                                title="Despachar producto"
                                onClick={() =>
                                  handleNewOrderProduct(product.id!)
                                }
                              />
                            </td>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center py-4">
                        No se encontraron productos que coincidan con su
                        búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCloseModal}>
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
                  <ProductForm
                    storeId={storeId}
                    onSuccess={handleProductCreated}
                    onCancel={handleCloseModal}
                    isModal={true}
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Products;
