import React from "react";
import PageBreadcrumb from "../components/PageBreadCrumb";
import ComponentCard from "../components/ComponentCard";
import BasicTableOne from "../components/BasicTableOne";

export default function BasicTables() {
  // Cambia el título de la pestaña al cargar el componente
  React.useEffect(() => {
    document.title = "React.js Basic Tables Dashboard | TailAdmin";
  }, []);

  return (
    <div className="p-6 min-h-screen  bg-background  bg-gray-50">
      <div className="space-y-6">
        <ComponentCard title="Reservas">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </div>
  );
}
