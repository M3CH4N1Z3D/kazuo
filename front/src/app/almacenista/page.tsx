import Inventario from '@/components/almacenistaInventario'
import ProtectedRoutes from "@/context/ProtectedRoutes";
import React from 'react'

const page = () => {
  return (
    <div>
      <ProtectedRoutes>
        <Inventario />
      </ProtectedRoutes>
    </div>
  )
}

export default page
