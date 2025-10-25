import React, { useEffect } from "react";
import HotelHeader from "../components/headerHabitaciones";
import PageBreadcrumb from "../components/PageBreadCrumb";
import ComponentCard from "../components/ComponentCard";
import TableAdminReservas from "../components/TableAdminReservas";
export default function AdminConsultas() {



    return (
            <main className="bg-gray-50" >
            <HotelHeader/>
            <div className="p-6 min-h-screen  bg-background  bg-gray-50">
                <div className="space-y-6">
                <ComponentCard title="Reservas">
                    <TableAdminReservas />
                </ComponentCard>
                </div>
            </div>
            
            </main>
        );
    }
