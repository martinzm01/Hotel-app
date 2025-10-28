import React, { useState, useEffect } from "react";
import { supabase } from "../back_supabase/client";
import Header from "../components/headerHabitaciones";
import Button from "../components/ui/Button";

export default function AdministracionOperadores() {
  const [operators, setOperators] = useState([]);
  const [editingOperator, setEditingOperator] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    rol: "operador", // Valor por defecto
    nombre: "",
    apellido: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOperators();
  }, []);

  async function fetchOperators() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("clientes") // Usamos la tabla 'clientes'
        .select("*")
        .eq("rol", "operador") // Filtramos solo los operadores
        .order("fecha_registro", { ascending: false });

      if (error) throw error;

      if (data) {
        const operatorsData = data.map((cliente) => ({
          id: cliente.id,
          email: cliente.email,
          rol: cliente.rol,
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          fecha_registro: cliente.fecha_registro,
        }));
        setOperators(operatorsData);
      }
    } catch (error) {
      console.error("Error fetching operators:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const operatorDataForSupabase = {
      email: formData.email,
      rol: formData.rol,
      nombre: formData.nombre,
      apellido: formData.apellido,
    };

    try {
      if (editingOperator) {
        // --- ACTUALIZAR (UPDATE) ---
        const { data, error } = await supabase
          .from("clientes") // Usamos la tabla 'clientes'
          .update(operatorDataForSupabase)
          .eq("id", editingOperator.id)
          .select()
          .single();

        if (error) throw error;

        const updatedOperator = {
          id: data.id,
          email: data.email,
          rol: data.rol,
          nombre: data.nombre,
          apellido: data.apellido,
          fecha_registro: data.fecha_registro,
        };

        setOperators((prev) =>
          prev.map((operator) =>
            operator.id === editingOperator.id ? updatedOperator : operator
          )
        );
      } else {
        // --- CREAR (INSERT) ---
        const { data, error } = await supabase
          .from("clientes") // Usamos la tabla 'clientes'
          .insert({ ...operatorDataForSupabase, fecha_registro: new Date() }) // Insertamos con fecha de registro
          .select()
          .single();

        if (error) throw error;

        const newOperator = {
          id: data.id,
          email: data.email,
          rol: data.rol,
          nombre: data.nombre,
          apellido: data.apellido,
          fecha_registro: data.fecha_registro,
        };

        setOperators((prev) => [newOperator, ...prev]);
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error submitting operator:", error.message);
      alert(`Error al guardar: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (operator) => {
    setEditingOperator(operator);
    setFormData({
      email: operator.email,
      rol: operator.rol,
      nombre: operator.nombre,
      apellido: operator.apellido,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de que deseas eliminar este operador?")) {
      try {
        const { error } = await supabase
          .from("clientes") // Usamos la tabla 'clientes'
          .delete()
          .eq("id", id);

        if (error) throw error;

        setOperators((prev) => prev.filter((operator) => operator.id !== id));
      } catch (error) {
        console.error("Error deleting operator:", error.message);
        alert(`Error al borrar: ${error.message}`);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOperator(null);
    setFormData({ email: "", rol: "operador", nombre: "", apellido: "" });
  };

  if (loading) {
    return (
      <main>
        <Header />
        <section className="py-20 text-center">
          <p>Cargando operadores...</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <Header />
        <section className="py-20 text-center">
          <p className="text-red-600">Error al cargar: {error}</p>
        </section>
      </main>
    );
  }

  return (
    <main>
      <Header />
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-4xl font-light text-foreground">
                Administración de Operadores
              </h2>
              <p className="mt-2 text-muted-foreground">Gestiona los operadores del hotel</p>
            </div>
            <Button size="lg" onClick={() => setIsModalOpen(true)}>
              + Nuevo Operador
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {operators.map((operator) => (
              <div key={operator.id} className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-xl font-semibold mb-2">{operator.nombre} {operator.apellido}</h3>
                <p className="text-gray-600">Email: {operator.email}</p>
                <p className="text-gray-600">Rol: {operator.rol}</p>
                <div className="mt-4 flex justify-end gap-2">
                  <Button size="sm" onClick={() => handleEdit(operator)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(operator.id)}>
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {operators.length === 0 && (
            <p className="text-center text-gray-500 mt-12">
              No hay operadores cargados. ¡Añade uno!
            </p>
          )}
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 relative text-black">
            <h3 className="text-xl font-serif font-light mb-4">
              {editingOperator ? "Editar Operador" : "Nuevo Operador"}
            </h3>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full border rounded px-3 py-2"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                className="w-full border rounded px-3 py-2"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
              <input
                type="text"
                name="apellido"
                placeholder="Apellido"
                className="w-full border rounded px-3 py-2"
                value={formData.apellido}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />

              <div className="flex gap-2 mt-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : editingOperator ? "Guardar Cambios" : "Crear Operador"}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={handleCloseModal} disabled={isSubmitting}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
