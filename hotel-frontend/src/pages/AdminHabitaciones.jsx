import React, { useState, useEffect } from "react";
import { supabase } from "../back_supabase/Client"; 
import Header from "../components/headerHabitaciones";
import RoomCardAdmin from "../components/RoomcardAdmin";
import Button from "../components/ui/Button";

export default function AdministracionPage() {
  const [rooms, setRooms] = useState([]); 
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    name: "", // Este estado 'name' guardará el NÚMERO
    type: "",
    description: "",
    price: 0,
    image: "",
    amenities: [], 
  });
  const [newAmenity, setNewAmenity] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  useEffect(() => {
    fetchRooms();
  }, []);

  async function fetchRooms() {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from("habitaciones")
        .select("*")
        .order('created_at', { ascending: false }); 

      if (error) throw error;

      if (data) {
        // --- SECCIÓN 1: TRADUCCIÓN (BDD -> React) ---
        // BDD (derecha) -> React (izquierda)
        const roomsData = data.map(room => ({
          id: room.id, 
          estado: room.estado,
          
          name: room.numero, // Columna 'numero' (BDD) -> estado 'name' (React)
          
          type: room.tipo,
          description: room.descripcion,
          price: room.precio,
          amenities: room.servicios || [],
          image: room.imagen_url || ""
        }));
        setRooms(roomsData);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  // --- Funciones del formulario (sin cambios) ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };
  const handleAddAmenity = () => { /* ...sin cambios... */ };
  const handleRemoveAmenity = (index) => { /* ...sin cambios... */ };
  // --- Fin de sección sin cambios ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // --- SECCIÓN 2: TRADUCCIÓN (React -> BDD) ---
    // React (derecha) -> BDD (izquierda)
    const roomDataForSupabase = {
      
      // CAMBIO CORREGIDO:
      numero: parseInt(formData.name, 10), // Estado 'name' (React) -> Columna 'numero' (BDD)
      
      tipo: formData.type,
      descripcion: formData.description,
      precio: formData.price,
      servicios: formData.amenities || [],
      imagen_url: formData.image,
    };

    try {
      if (editingRoom) {
        // --- ACTUALIZAR (UPDATE) ---
        const { data, error } = await supabase
          .from("habitaciones")
          .update(roomDataForSupabase)
          .eq("id", editingRoom.id) 
          .select()
          .single();
        if (error) throw error;

        // --- SECCIÓN 3: TRADUCCIÓN (Respuesta BDD -> React) ---
        const updatedRoom = {
          id: data.id, estado: data.estado,
          name: data.numero, 
          type: data.tipo, description: data.descripcion, price: data.precio,
          amenities: data.servicios || [], image: data.imagen_url || ""
        };
        setRooms(prev => 
          prev.map(room => (room.id === editingRoom.id ? updatedRoom : room))
        );
        
      } else {
        // --- CREAR (INSERT) ---
        const { data, error } = await supabase
          .from("habitaciones")
          .insert(roomDataForSupabase)
          .select()
          .single();
        if (error) throw error;

        // --- SECCIÓN 4: TRADUCCIÓN (Respuesta BDD -> React) ---
        const newRoom = {
          id: data.id, estado: data.estado,
          name: data.numero, 
          type: data.tipo, description: data.descripcion, price: data.precio,
          amenities: data.servicios || [], image: data.imagen_url || ""
        };
        setRooms(prev => [newRoom, ...prev]); 
      }
      
      handleCloseModal(); 

    } catch (error) {
      console.error("Error submitting room:", error.message);
      alert(`Error al guardar: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. EDITAR (Preparar formulario)
  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({ ...room, amenities: room.amenities || [] }); 
    setIsModalOpen(true);
  };

  // 7. BORRAR (DELETE)
  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta habitación?")) {
      try {
        const { error } = await supabase.from("habitaciones").delete().eq("id", id); 
        if (error) throw error;
        setRooms(prev => prev.filter(room => room.id !== id));
      } catch (error) {
        console.error("Error deleting room:", error.message);
        alert(`Error al borrar: ${error.message}`);
      }
    }
  };

  // 8. CERRAR MODAL
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRoom(null);
    setFormData({ name: "", type: "", description: "", price: 0, image: "", amenities: [] });
    setNewAmenity("");
  };

  // --- RENDERIZADO (JSX) ---

  if (loading) {
    return <main><Header /><section className="py-20 text-center"><p>Cargando habitaciones...</p></section></main>;
  }

  if (error) {
    return <main><Header /><section className="py-20 text-center"><p className="text-red-600">Error al cargar: {error}</p></section></main>;
  }

  return (
    <main>
      <Header />
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* ... (Encabezado de la página - sin cambios) ... */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-4xl font-light text-foreground">
                Administración de Habitaciones
              </h2>
              <p className="mt-2 text-muted-foreground">Gestiona las habitaciones del hotel</p>
            </div>
            <Button size="lg" onClick={() => setIsModalOpen(true)}>
              + Nueva Habitación
            </Button>
          </div>

          {/* Lista de habitaciones (sin cambios) */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <RoomCardAdmin
                key={room.id}
                {...room} 
                name={`Hab. ${room.name}`} // room.name tiene el NÚMERO
                estado={room.estado || "Disponible"} 
                onEdit={() => handleEdit(room)}
                onDelete={() => handleDelete(room.id)}
              />
            ))}
          </div>
          
          {rooms.length === 0 && (
             <p className="text-center text-gray-500 mt-12">
              No hay habitaciones cargadas. ¡Añade una!
            </p>
          )}

        </div>
      </section>

      {/* --- MODAL CON EL DISEÑO CORREGIDO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 relative text-black">
            
            <h3 className="text-xl font-serif font-light mb-4">
              {editingRoom ? "Editar Habitación" : "Nueva Habitación"}
            </h3>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              
              {/* CAMBIO CORREGIDO: */}
              <input
                type="number" 
                name="name" // Se mantiene 'name' para el estado
                placeholder="Número de la habitación" // Texto corregido
                className="w-full border rounded px-3 py-2" 
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={isSubmitting} 
              />
              <input
                type="text"
                name="type"
                placeholder="Tipo"
                className="w-full border rounded px-3 py-2" 
                value={formData.type}
                onChange={handleInputChange}
                required
                disabled={isSubmitting} 
              />
              <input
                type="number"
                name="price"
                placeholder="Precio por noche"
                className="w-full border rounded px-3 py-2" 
                value={formData.price}
                onChange={handleInputChange}
                required
                disabled={isSubmitting} 
              />
              <input
                type="text"
                name="image"
                placeholder="URL de la imagen"
                className="w-full border rounded px-3 py-2" 
                value={formData.image}
                onChange={handleInputChange}
                disabled={isSubmitting} 
              />
              <textarea
                name="description"
                placeholder="Descripción"
                className="w-full border rounded px-3 py-2" 
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                required
                disabled={isSubmitting} 
              />

              {/* Amenidades (sin cambios) */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nueva amenidad"
                  className="flex-1 border rounded px-3 py-2" 
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddAmenity();
                    }
                  }}
                  disabled={isSubmitting} 
                />
                <Button type="button" variant="outline" onClick={handleAddAmenity} disabled={isSubmitting}>
                  Agregar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((a, i) => (
                  <span key={i} className="bg-gray-200 rounded-full px-3 py-1 text-sm flex items-center gap-1">
                    {a}
                    <button type="button" onClick={() => handleRemoveAmenity(i)} disabled={isSubmitting}>
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Botones (sin cambios) */}
              <div className="flex gap-2 mt-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : (editingRoom ? "Guardar Cambios" : "Crear Habitación")}
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