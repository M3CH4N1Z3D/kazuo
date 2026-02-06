import ProductForm from '@/components/ProductForm/ProductForm'
import ProtectedRoutes from "@/context/ProtectedRoutes";
import React from 'react'

const AddNewProduct = ({ params }: { params: { storeId: string } }) => {
  return (
    <div>
      <ProtectedRoutes>
        <ProductForm storeId={params.storeId}/>
      </ProtectedRoutes>
    </div>
  )
}

export default AddNewProduct
