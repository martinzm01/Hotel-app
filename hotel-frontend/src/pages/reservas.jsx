import React, { useEffect } from "react";
import HotelHeader from "../components/headerHabitaciones";
import TableAdminReservas from "../components/TableAdminReservas";
import PageBreadcrumb from "../components/PageBreadCrumb";
import ComponentCard from "../components/ComponentCard";
export default function Reservas() {


    return (
            <main className="bg-gray-50" >
            <HotelHeader/>
            <div className="p-6 min-h-screen  bg-background  bg-white">
              <div className="space-y-6">
                  <TableAdminReservas />
              </div>
            </div>
          
            
            </main>
        );
    }
