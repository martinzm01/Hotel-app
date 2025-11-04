import React, { useState, useEffect } from "react";
import { supabase } from "../back_supabase/client";
import Button from "../components/ui/Button";
import UserCardAdmin from "../components/UserCardAdmin";

export default function AdminOperadores() {
  const [users, setUsers] = useState([]); // Operadores existentes
  const [editingUser, setEditingUser] = useState(null); // Para el modal de EDICIÓN
  const [formData, setFormData] = useState({
    email: "",
    nombre: "",
    apellido: "",
    rol: "operador",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- ESTADOS PARA EL MODAL DE BÚSQUEDA ---
  const [searchEmail, setSearchEmail] = useState("");
  const [foundUser, setFoundUser] = useState(null);
  const [searchStatus, setSearchStatus] = useState("idle"); // idle, loading, notFound, found

  useEffect(() => {
    fetchUsers();
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

  // --- MODIFICADO: Solo para EDITAR (UPDATE) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSubmitting(true);
    try {
      // Solo lógica de Actualizar usuario
      const { data, error } = await supabase
        .from("usuarios")
        .update({
          email: formData.email,
          nombre: formData.nombre,
          apellido: formData.apellido,
          dni:formData.dni,
        })
        .eq("id", editingUser.id)
        .select()
        .single();

      if (error) throw error;

      setUsers((prev) =>
        prev.map((user) => (user.id === editingUser.id ? data : user))
      );
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting user:", error.message);
      alert(`Error al guardar: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --- NUEVA FUNCIÓN: Buscar usuario por email ---
  async function handleSearchUser(e) {
    e.preventDefault();
    setSearchStatus("loading");
    setFoundUser(null);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", searchEmail.trim())
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setFoundUser(data);
        setSearchStatus("found");
      } else {
        setSearchStatus("notFound");
      }
    } catch (error) {
      console.error("Error searching user:", error.message);
      setError(error.message);
      setSearchStatus("idle");
    }
  }

  // --- NUEVA FUNCIÓN: Cambiar rol (Ascender/Descender) ---
  async function handleRoleChange(user, newRole) {
    if (
      !confirm(
        `¿Seguro que deseas cambiar el rol de ${user.nombre} a ${newRole}?`
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .update({ rol: newRole })
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      setFoundUser(data); // Actualiza la info en el modal
      fetchUsers(); // Refresca la lista principal de operadores
      alert(`Rol actualizado exitosamente a ${newRole}`);
    } catch (error) {
      console.error("Error changing role:", error.message);
      alert(`Error al cambiar el rol: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- Lógica de la tarjeta (Editar y Borrar/Descender) ---
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol,
      dni:user.dni
    });
    setIsModalOpen(true);
  };

  // Esta función desciende a un usuario a 'cliente'
  const handleDescend = async (id) => {
    if (confirm("¿Estás seguro de que deseas descender este operador a cliente?")) {
      try {
        const { error } = await supabase
          .from("usuarios")
          .update({ rol: "cliente" })
          .eq("id", id);

        if (error) throw error;
        setUsers((prev) => prev.filter((user) => user.id !== id));
      } catch (error) {
        console.error("Error al descender usuario:", error.message);
        alert(`Error: ${error.message}`);
      }
    }
  };

  // --- MODIFICADO: Resetea todos los estados del modal ---
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ email: "", nombre: "", apellido: "", rol: "operador" });
    setSearchEmail("");
    setFoundUser(null);
    setSearchStatus("idle");
    setError(null);
  };

  // --- RENDERIZADO ---

  if (loading && users.length === 0) {
    return (
      <main>
        <section className="py-20 text-center">
          <p>Cargando operadores...</p>
        </section>
      </main>
    );
  }

  if (error && users.length === 0) {
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
            <Button
              size="lg"
              onClick={() => setIsModalOpen(true)}
              className="w-full md:w-auto hover:bg-green-950"
            >
              + Nuevo operador
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <UserCardAdmin
                key={user.id}
                {...user}
                onEdit={() => handleEdit(user)}
                onDelete={() => handleDescend(user.id)} // onDelete ahora llama a handleDescend
              />
            ))}
          </div>

          {users.length === 0 && (
            <p className="text-center text-gray-500 mt-12">
              No hay operadores cargados.
            </p>
          )}
        </div>
      </section>

      {/* --- MODAL MODIFICADO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 relative text-black shadow-xl">
            <h3 className="text-xl font-serif font-light mb-4">
              {editingUser ? "Editar Operador" : "Buscar y Asignar Rol"}
            </h3>

            {editingUser ? (
              // --- VISTA 1: Formulario de EDICIÓN (Diseño Modernizado) ---
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="flex text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Nombre */}
                <div>
                  <label
                    htmlFor="nombre"
                    className="flex text-sm font-medium text-gray-700"
                  >
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    id="nombre"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Apellido */}
                <div>
                  <label
                    htmlFor="apellido"
                    className="flex text-sm font-medium text-gray-700 "
                  >
                    Apellido
                  </label>
                  <input
                    type="text"
                    name="apellido"
                    id="apellido"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50"
                    value={formData.apellido}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                {/* DNI */}
                <div>
                  <label
                    htmlFor="dni"
                    className="flex text-sm font-medium text-gray-700"
                  >
                    DNI
                  </label>
                  <input
                    type="text"
                    name="dni"
                    id="dni"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50"
                    value={formData.dni}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Separador y Botón de Acción Destructiva */}
                <div className="relative py-2">
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-sm text-gray-500">
                      Acción de Rol
                    </span>
                  </div>
                </div>

                {/* Botón para Descender */}
                <Button
                  type="button"
                  variant="destructive" // Asumo que 'destructive' le da color rojo
                  className="w-full cursor-pointer hover:border-1"
                  onClick={() => {
                    handleDescend(editingUser.id);
                    handleCloseModal(); // Cierra el modal después de confirmar
                  }}
                  disabled={isSubmitting}
                >
                  Descender a Cliente
                </Button>
                {/* Botones de Guardar/Cancelar */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 hover:bg-green-950/70 hover:border-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 cursor-pointer hover:border-1 "
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                </div>

              </form>
            ) : (
              // --- VISTA 2: Formulario de BÚSQUEDA (Sin cambios) ---
              <div className="space-y-4">
                <form className="flex gap-2" onSubmit={handleSearchUser}>
                  <input
                    type="email"
                    name="searchEmail"
                    placeholder="Buscar por email..."
                    className="w-full border rounded px-3 py-2"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <Button
                    type="submit"
                    disabled={isSubmitting || searchStatus === "loading"}
                  >
                    {searchStatus === "loading" ? "..." : "Buscar"}
                  </Button>
                </form>

                {searchStatus === "loading" && (
                  <p className="text-center">Buscando...</p>
                )}
                {error && (
                  <p className="text-red-600 text-center">Error: {error}</p>
                )}
                {searchStatus === "notFound" && (
                  <p className="text-center text-gray-600">
                    No se encontró ningún usuario con ese email.
                  </p>
                )}

                {searchStatus === "found" && foundUser && (
                  <div className="mt-4 p-4 border rounded-lg bg-gray-50 space-y-2">
                    <h4 className="font-semibold text-lg">
                      {foundUser.nombre} {foundUser.apellido}
                    </h4>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {foundUser.email}
                    </p>
                    <p>
                      <span className="font-medium">DNI:</span>{" "}
                      {foundUser.dni || "No especificado"}
                    </p>
                    <p>
                      <span className="font-medium">Rol Actual:</span>
                      <span
                        className={`ml-2 font-bold uppercase ${
                          foundUser.rol === "operador"
                            ? "text-green-600"
                            : foundUser.rol === "cliente"
                            ? "text-blue-600"
                            : "text-purple-600"
                        }`}
                      >
                        {foundUser.rol}
                      </span>
                    </p>

                    <div className="flex gap-2 pt-2">
                      {foundUser.rol === "cliente" && (
                        <Button
                          onClick={() =>
                            handleRoleChange(foundUser, "operador")
                          }
                          disabled={isSubmitting}
                        >
                          {isSubmitting
                            ? "Ascendiendo..."
                            : "Ascender a Operador"}
                        </Button>
                      )}
                      {foundUser.rol === "operador" && (
                        <Button
                          variant="destructive"
                          onClick={() =>
                            handleRoleChange(foundUser, "cliente")
                          }
                          disabled={isSubmitting}
                        >
                          {isSubmitting
                            ? "Descendiendo..."
                            : "Descender a Cliente"}
                        </Button>
                      )}
                      {foundUser.rol === "administrador" && (
                        <p className="text-sm text-gray-700 font-medium">
                          No se puede modificar el rol de un Administrador.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full cursor-pointer"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  Cerrar
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
