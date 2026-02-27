import React from "react";
import { SpotOnSpinner } from "./SpotOnSpinner";

const Loader1 = () => {
  // Reemplazamos el loader de barra de progreso con el nuevo spinner unificado
  return (
    <div className="flex flex-col items-center justify-center">
      <SpotOnSpinner size="sm" text="Cargando..." />
    </div>
  );
};

export default Loader1;
