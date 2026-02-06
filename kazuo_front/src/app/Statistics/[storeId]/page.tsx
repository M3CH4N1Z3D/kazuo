import Statistics from '@/components/Statistics/Statistics'
import ProtectedRoutes from "@/context/ProtectedRoutes";
import React from 'react'

const StatisticsPage = ({ params }: { params: { storeId: string } }) => {
  return (
    <div>
      <ProtectedRoutes>
        <Statistics storeId={params.storeId}/>
      </ProtectedRoutes>
    </div>
  )
}

export default StatisticsPage