import React, { useEffect } from "react";
import HotelHeader from "../components/headerHabitaciones";
import TableAdminCosulta from "../components/TableAdminconsultas";
export default function AdminConsultas() {



    return (
            <main className="bg-gray-50" >
            <HotelHeader/>
            <div className="p-6 min-h-screen  bg-background  bg-gray-50">
                <div className="space-y-6">
                    <TableAdminCosulta />
                </div>
            </div>
            
            </main>
        );
    }
