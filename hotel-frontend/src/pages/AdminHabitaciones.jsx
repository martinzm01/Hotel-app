import React, { useState, useEffect } from "react";
import { supabase } from "../back_supabase/client"; 
import RoomCardAdmin from "../components/RoomcardAdmin";
import Button from "../components/ui/Button";
import { Search } from "lucide-react"; // <-- 1. IMPORTAR EL ICONO DE BÚSQUEDA
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
    estado: "disponible", // Nuevo estado para el estado

  });
  const [newAmenity, setNewAmenity] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos"); // 'todos' será el valor por defecto

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
  ///

  // --- 1. FUNCIÓN PARA SUBIR LA IMAGEN ---
// Esta función recibe el objeto File y devuelve la URL pública
async function uploadImage(file) {
  // 1.1. Crear un nombre de archivo único
  // Usamos la extensión original del archivo y le añadimos un timestamp
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = fileName; // 'public' es un ejemplo de carpeta

  // 1.2. Subir el archivo al bucket
  const { error: uploadError } = await supabase.storage
    .from('Habitaciones') // <-- El nombre de tu bucket
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    throw uploadError; // Lanza el error para detener el handleSubmit
  }

  // 1.3. Obtener la URL pública del archivo subido
  const { data } = supabase.storage
    .from('Habitaciones') // <-- El nombre de tu bucket
    .getPublicUrl(filePath);

  if (!data || !data.publicUrl) {
    throw new Error('No se pudo obtener la URL pública');
  }

  // 1.4. Devolver la URL
  return data.publicUrl;
}


  const handleFileChange = (e) => {
  const file = e.target.files[0]; // Obtenemos el primer archivo seleccionado

  if (file) {
    setFormData((prev) => ({
      ...prev,
      image: file, // Guardamos el *objeto* del archivo en el estado
    }));
  }
};

  const handleAddAmenity = () => {
    if (newAmenity.trim() !== "") {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity("");
    }
  };

  const handleRemoveAmenity = (index) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

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
    estado: formData.estado, // Guardar el estado en la base de datos
 // Esto contendrá el File o la URL antigua
  };

  try {
    
    // --- INICIO DE LA MODIFICACIÓN ---
    if (formData.image instanceof File) {
      // Si es un archivo, lo subimos y obtenemos la URL
      // Luego, actualizamos el objeto que enviaremos a la BDD
      roomDataForSupabase.imagen_url = await uploadImage(formData.image);
    }
    // --- FIN DE LA MODIFICACIÓN ---

    if (editingRoom) {
      // --- ACTUALIZAR (UPDATE) ---
      const { data, error } = await supabase
        .from("habitaciones")
        .update(roomDataForSupabase) // roomDataForSupabase AHORA tiene la URL correcta
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
      const newData = {
          ...roomDataForSupabase,
          estado: "mantenimiento" // <-- AQUÍ SE AÑADE EL ESTADO
      };
      const { data, error } = await supabase
        .from("habitaciones")
        .insert(newData)
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

  // --- 3. LÓGICA DE FILTRADO ---
  // Filtra la lista 'rooms' basándose en 'searchTerm'
const filteredRooms = rooms
    .filter(room => {
      // 3.1. Primer filtro: por ESTADO
      if (statusFilter === "todos") {
        return true; // Si es 'todos', no descartes ninguno
      }
      return room.estado === statusFilter; // Compara el estado
    })
    .filter(room => {
      // 3.2. Segundo filtro: por TÉRMINO DE BÚSQUEDA (sobre la lista ya filtrada por estado)
      const nameString = String(room.name || "").toLowerCase();
      const typeString = String(room.type || "").toLowerCase();
      const query = searchTerm.toLowerCase();
      
      return nameString.includes(query) || typeString.includes(query);
    });
  // --- RENDERIZADO (JSX) ---

  if (loading) {
    return <main><section className="py-20 text-center"><p>Cargando habitaciones...</p></section></main>;
  }

  if (error) {
    return <main><section className="py-20 text-center"><p className="text-red-600">Error al cargar: {error}</p></section></main>;
  }

 return (
    <main>
      <section >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* --- 4. JSX MODIFICADO (ENCABEZADO, GRID Y MENSAJES) --- */}

          {/* Encabezado con nueva estructura flex y buscador */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-10">
            {/* Título y Subtítulo */}
            <div>
              <h2 className="font-serif text-4xl font-light text-foreground">
                Administración de Habitaciones
              </h2>
              <p className="mt-2 text-muted-foreground">Gestiona las habitaciones del hotel</p>
            </div>
            {/* --- ÁREA DE FILTROS Y BOTÓN (ACTUALIZADA) --- */}
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              {/* EL BUSCADOR (AÑADIDO) */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por n° o tipo..."
                  className="w-full pl-10 pr-4 py-2 border border-white rounded-md focus:outline-none focus:ring-1 focus:ring-black hover:bg-gray-100/95 bg-white/95 text-black"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* Filtro de Estado (NUEVO) */}
              <select
                className="
                          cursor-pointer transition-all duration-150
                          hover:border-gray-100 hover:ring-1 hover:ring-gray-100 rounded-md w-full md:w-auto border
                          border-gray-100  px-3 py-2 focus:outline-none  focus:ring-black bg-white/95 text-black"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option className="bg-white hover:bg-black" value="todos">Todos los estados</option>
                <option value="disponible">Disponibles</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="ocupado">Ocupadas</option> 
                <option value="cancelada">Canceladas</option>
              </select>

              {/* Botón Nueva Habitación */}
              <Button size="lg" onClick={() => setIsModalOpen(true)} className="w-full md:w-auto hover:bg-green-950">
                + Nueva Habitación
              </Button>
            </div>
          </div>


          {/* Lista de habitaciones (usa 'filteredRooms' en lugar de 'rooms') */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 ">
            {filteredRooms.map((room) => ( // <-- CAMBIO AQUÍ
              <RoomCardAdmin
                key={room.id}
                {...room} 
                name={`Hab. ${room.name}`} 
                estado={room.estado || "Disponible"} 
                onEdit={() => handleEdit(room)}
                onDelete={() => handleDelete(room.id)}
              />
            ))}
          </div>
          
          {/* Mensajes de "No hay resultados" (Lógica actualizada) */}
          {rooms.length > 0 && filteredRooms.length === 0 && (
             <p className="text-center text-gray-500 mt-12">
              No se encontraron habitaciones que coincidan con "{searchTerm}".
             </p>
          )}

          {rooms.length === 0 && (
             <p className="text-center text-gray-500 mt-12">
               No hay habitaciones cargadas. ¡Añade una!
             </p>
          )}

        </div>
      </section>

      {/* --- MODAL (SIN CAMBIOS) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 ">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 relative text-black">
            
            <h3 className="text-xl font-serif font-light mb-4">
              {editingRoom ? "Editar Habitación" : "Nueva Habitación"}
            </h3>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              
              <input
                type="number" 
                name="name" 
                placeholder="Número de la habitación"
                className="w-full border rounded-md px-3 py-2 bg-white" 
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={isSubmitting} 
              />
              <input
                type="text"
                name="type"
                placeholder="Tipo"
                className="w-full border rounded-md bg-white px-3 py-2" 
                value={formData.type}
                onChange={handleInputChange}
                required
                disabled={isSubmitting} 
              />
              <input
                type="number"
                name="price"
                placeholder="Precio por noche"
                className="w-full border rounded-md px-3 py-2 bg-white" 
                value={formData.price}
                onChange={handleInputChange}
                required
                disabled={isSubmitting} 
              />
              <input
                  type="file" 
                  name="image"
                  className="w-full border rounded-md px-3 py-2 bg-white text-gray-700
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-lg file:cursor-pointer file:border-0
                           file:text-sm file:font-semibold
                           file:bg-indigo-50 file:text-indigo-700
                           hover:file:bg-indigo-100" 
                  onChange={handleFileChange} 
                  disabled={isSubmitting}
                  accept="image/png, image/jpeg, image/webp"
                />
              <textarea
                name="description"
                placeholder="Descripción"
                className="w-full border rounded-md px-3 py-2 bg-white" 
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                required
                disabled={isSubmitting} 
              />

              {/* Amenidades (sin cambios) */}


{/* Selector de estado */}
              <div>
                <label htmlFor="estado" className=" flex  text-sm font-medium text-gray-700">
                  Estado:
                </label>
                <select
                  id="estado"
                  name="estado"
                  className="w-full border rounded px-3 py-2 cursor-pointer"
                  value={formData.estado}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                >
                  <option value="disponible">Disponible</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="ocupada">Ocupada</option>
                </select>
              </div>

              {/* Amenidades */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nueva amenidad"
                  className="flex-1 border rounded px-3 py-2 "
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
                <Button type="button" className="cursor-pointer " variant="outline" onClick={handleAddAmenity} disabled={isSubmitting}>
                  Agregar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((a, i) => (
                  <span key={i} className="bg-gray-200 rounded-full px-3 py-1 text-sm flex items-center gap-1">
                    {a}
                    <button type="button" className="cursor-pointer" onClick={() => handleRemoveAmenity(i)} disabled={isSubmitting}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {/* Botones  */}
              <div className="flex gap-2 mt-4">
                <Button type="submit" className="flex-1 cursor-pointer hover:bg-green-950/70 hover:border-1" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : (editingRoom ? "Guardar Cambios" : "Crear Habitación")}
                </Button>
                <Button type="button" variant="outline" className="flex-1 cursor-pointer hover:border-1" onClick={handleCloseModal} disabled={isSubmitting}>
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