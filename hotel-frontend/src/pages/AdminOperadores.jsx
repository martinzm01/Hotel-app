import React, { useState, useEffect } from "react";
import { supabase } from "../back_supabase/client";
import Button from "../components/ui/Button";
import UserCardAdmin from "../components/UserCardAdmin";

export default function AdminOperadores() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    nombre: "",
    apellido: "",
    rol: "operador", // Valor por defecto
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientes, setClientes] = useState([]); // Nuevo estado para clientes
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedClientId, setExpandedClientId] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchClientes(); // Cargar clientes al montar el componente
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("rol", "operador");

      if (error) throw error;

      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Nueva función para obtener la lista de clientes
  async function fetchClientes() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("rol", "cliente"); // Filtrar por rol "cliente"

      if (error) throw error;

      setClientes(data); // Guardar los clientes en el nuevo estado
    } catch (error) {
      console.error("Error fetching clientes:", error.message);
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

    try {
      if (editingUser) {
        // Actualizar usuario
        const { data, error } = await supabase
          .from("usuarios")
          .update({
            email: formData.email,
            nombre: formData.nombre,
            apellido: formData.apellido,
            rol: formData.rol,
          })
          .eq("id", editingUser.id)
          .select()
          .single();

        if (error) throw error;

        setUsers((prev) =>
          prev.map((user) => (user.id === editingUser.id ? data : user))
        );
      } else {
        // Crear usuario
        const { data, error } = await supabase
          .from("usuarios")
          .insert({
            email: formData.email,
            nombre: formData.nombre,
            apellido: formData.apellido,
            rol: formData.rol,
          })
          .select()
          .single();

        if (error) throw error;

        setUsers((prev) => [data, ...prev]);
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error submitting user:", error.message);
      alert(`Error al guardar: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de que deseas volver este usuario a cliente?")) {
      try {
        const { data, error } = await supabase
          .from("usuarios")
          .update({ rol: "cliente" }) // Cambiar el rol a "cliente"
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        // Actualizar la lista de usuarios
        setUsers((prev) => prev.filter((user) => user.id !== id));

        // Agregar el usuario a la lista de clientes (si es necesario)
        setClientes((prev) => [data, ...prev]);

      } catch (error) {
        console.error("Error al cambiar el rol del usuario:", error.message);
        alert(`Error al cambiar el rol del usuario: ${error.message}`);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      email: "",
      nombre: "",
      apellido: "",
      rol: "operador",
    });
  };

  // Función para ascender un cliente existente a operador
  const handleAscend = async (user) => {
    if (confirm(`¿Estás seguro de que deseas ascender a ${user.nombre} ${user.apellido} a operador?`)) {
      try {
        const { data, error } = await supabase
          .from("usuarios")
          .update({ rol: "operador" })
          .eq("id", user.id)
          .select()
          .single();

        if (error) throw error;

        // Actualizar la lista de usuarios y clientes
        setUsers((prev) => {
          const updatedUsers = [...prev, { ...user, rol: "operador" }];
          return updatedUsers;
        });
        setClientes((prev) => prev.filter((c) => c.id !== user.id));
      } catch (error) {
        console.error("Error al ascender usuario:", error.message);
        alert(`Error al ascender usuario: ${error.message}`);
      }
    }
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
  };

  const handleToggleDetails = (id) => {
    setExpandedClientId(expandedClientId === id ? null : id);
  };

  // Filtra los clientes basados en el término de búsqueda
  const filteredClientes = clientes.filter(user =>
    searchTerm === "" ||
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <main>
        <section className="py-20 text-center">
          <p>Cargando operadores...</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <section className="py-20 text-center">
          <p className="text-red-600">Error al cargar: {error}</p>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between mt-10">
            <div>
              <h2 className="font-serif text-4xl font-light text-foreground">
                Administración de Operadores
              </h2>
              <p className="mt-2 text-muted-foreground">
                Gestiona los operadores del hotel
              </p>
            </div>
          </div>

          {/* Lista de operadores */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <UserCardAdmin
                key={user.id}
                {...user}
                onEdit={() => handleEdit(user)}
                onDelete={() => handleDelete(user.id)}
              />
            ))}
          </div>

          {/* Barra de búsqueda */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Buscar cliente por nombre o correo..."
              className="w-full border rounded px-3 py-2"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          {/* Sección para ascender clientes existentes */}
          <section>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="font-serif text-2xl font-light text-foreground mt-10">
                Ascender Clientes a Operadores
              </h2>
              <p className="mt-2 text-muted-foreground">
                Lista de clientes para ascender a operadores
              </p>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Mapear sobre los clientes filtrados */}
                {filteredClientes.map((user) => (
                  <div key={user.id} className="bg-white shadow rounded-lg p-4">
                    <h3 className="text-lg font-semibold" style={{ color: 'black' }}>{user.nombre} {user.apellido}</h3> {/* Nombre en negro */}
                    <p className="text-gray-600">{user.email}</p>
                    <div className="mt-2 flex justify-between">
                      <Button size="sm" onClick={() => handleAscend(user)}>
                        Ascender
                      </Button>
                      <Button size="sm" onClick={() => handleToggleDetails(user.id)}>
                        {expandedClientId === user.id ? "Ocultar Detalles" : "Ver Detalles"}
                      </Button>
                    </div>
                    {expandedClientId === user.id && (
                      <div className="mt-2" style={{ color: 'black' }}> {/* Detalles en negro */}
                        <p>Email: {user.email}</p>
                        {/* Agrega más detalles aquí (fecha_registro, dni, telefono, etc.) */}
                        <p>Fecha de Registro: {user.fecha_registro}</p>
                        <p>DNI: {user.dni}</p>
                        <p>Teléfono: {user.telefono}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredClientes.length === 0 && (
                <p className="text-center text-gray-500 mt-12">
                  No hay clientes para ascender a operadores que coincidan con la búsqueda.
                </p>
              )}
            </div>
          </section>

          {users.length === 0 && !searchTerm && (
            <p className="text-center text-gray-500 mt-12">
              No hay operadores cargados. ¡Empieza a buscar o ascender clientes!
            </p>
          )}
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 relative text-black">
            <h3 className="text-xl font-serif font-light mb-4">
              {editingUser ? "Editar Operador" : "Nuevo Operador"}
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
                  {isSubmitting
                    ? "Guardando..."
                    : editingUser
                    ? "Guardar Cambios"
                    : "Crear Operador"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
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
