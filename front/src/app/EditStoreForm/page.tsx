import EditStoreForm from '@/components/EditStoreForm/EditStoreForm'
import ProtectedRoutes from "@/context/ProtectedRoutes";
import React from 'react'

const page = ({ params }: { params: { storeId: string } }) => {
  return (
    <div>
      <ProtectedRoutes>
        <EditStoreForm storeId={params.storeId}/>
      </ProtectedRoutes>
    </div>
  )
}

export default page



