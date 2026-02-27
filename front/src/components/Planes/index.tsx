"use client";

import { useAppContext } from "@/context/AppContext";
import Link from "next/link";

export default function Planes() {
  const { userData } = useAppContext();

  return (
    <div className="max-w-screen px-4 sm:px-6 lg:px-8">
      <div className="animate-fade-in flex justify-center">
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow-lg p-6 transition-transform duration-300 transform hover:scale-105 max-w-md w-full">
          <div className="text-center">
            <h3 className="font-semibold text-lg sm:text-xl md:text-2xl lg:text-3xl text-center uppercase mb-4">
              Plan Premium
            </h3>
            <h2 className="font-extrabold text-4xl lg:text-5xl mb-6">
              GRATIS
            </h2>
            <p className="text-sm mb-4">Acceso total a todas las funciones</p>
          </div>
          <ul className="text-sm md:text-base space-y-3 mb-8">
            <li className="flex items-center space-x-2">
              <span className="text-green-300 font-bold">✔</span>
              <span>Crea y gestiona bodegas</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-300 font-bold">✔</span>
              <span>Crea equipos y agrega empleados</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-300 font-bold">✔</span>
              <span>Gestión completa de inventario</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-300 font-bold">✔</span>
              <span>Importa productos con Excel</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-300 font-bold">✔</span>
              <span>Escanea códigos de barras para eliminar productos</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-300 font-bold">✔</span>
              <span>Gestión de productos por empleados</span>
            </li>
          </ul>

          <div className="flex justify-center">
            {userData ? (
              <Link
                href="/storeform"
                className="bg-white text-blue-600 font-bold py-2 px-6 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-300"
              >
                Ir al Panel
              </Link>
            ) : (
              <Link
                href="/Register"
                className="bg-white text-blue-600 font-bold py-2 px-6 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-300"
              >
                Comenzar Ahora
              </Link>
            )}
          </div>

          <p className="mt-6 text-center text-gray-200 text-sm animate-pulse duration-1000">
            Descarga la app y lleva tu gestión a donde vayas
          </p>
        </div>
      </div>
    </div>
  );
}
