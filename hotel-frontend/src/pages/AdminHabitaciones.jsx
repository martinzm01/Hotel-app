import React, { useState } from "react";
import Header from "../components/headerHabitaciones";
import RoomCardAdmin from "../components/RoomcardAdmin";
import Button from "../components/ui/Button";

const initialRooms = [
  {
    id: "suite-presidencial",
    name: "Suite Presidencial",
    type: "Suite de Lujo",
    description:
      "Experimenta el máximo lujo en nuestra suite presidencial con vistas panorámicas, sala de estar privada y servicios exclusivos.",
    price: 450,
    image: "/assets/habitacion2.png",
    amenities: ["Vista panorámica", "Jacuzzi privado", "Sala de estar", "Servicio 24/7"],
  },
  {
    id: "habitacion-deluxe",
    name: "Habitación Deluxe",
    type: "Deluxe",
    description:
      "Espaciosa habitación con cama king size, área de trabajo y baño de mármol. Perfecta para viajeros de negocios y placer.",
    price: 280,
    image: "/assets/imagen4.jpg",
    amenities: ["Cama King Size", "Baño de mármol", "Escritorio", "WiFi de alta velocidad"],
  },
];

export default function AdministracionPage() {
  const [rooms, setRooms] = useState(initialRooms);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    price: 0,
    image: "",
    amenities: [],
  });
  const [newAmenity, setNewAmenity] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim()) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...(prev.amenities || []), newAmenity.trim()],
      }));
      setNewAmenity("");
    }
  };

  const handleRemoveAmenity = (index) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRoom) {
      setRooms((prev) =>
        prev.map((room) => (room.id === editingRoom.id ? { ...room, ...formData } : room))
      );
    } else {
      const newRoom = {
        id: formData.name.toLowerCase().replace(/\s+/g, "-") || `room-${Date.now()}`,
        ...formData,
      };
      setRooms((prev) => [...prev, newRoom]);
    }
    handleCloseModal();
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData(room);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta habitación?")) {
      setRooms((prev) => prev.filter((room) => room.id !== id));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRoom(null);
    setFormData({ name: "", type: "", description: "", price: 0, image: "", amenities: [] });
    setNewAmenity("");
  };

  return (
    <main>
      <Header />
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

          {/* Lista de habitaciones */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <RoomCardAdmin
                key={room.id}
                {...room}
                estado="Disponible"
                onEdit={() => handleEdit(room)}
                onDelete={() => handleDelete(room.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Modal flotante centralizado */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 relative">
            <h3 className="text-xl font-serif font-light mb-4">
              {editingRoom ? "Editar Habitación" : "Nueva Habitación"}
            </h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Nombre de la habitación"
                className="w-full border rounded px-3 py-2"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="type"
                placeholder="Tipo"
                className="w-full border rounded px-3 py-2"
                value={formData.type}
                onChange={handleInputChange}
                required
              />
              <input
                type="number"
                name="price"
                placeholder="Precio por noche"
                className="w-full border rounded px-3 py-2"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="image"
                placeholder="URL de la imagen"
                className="w-full border rounded px-3 py-2"
                value={formData.image}
                onChange={handleInputChange}
              />
              <textarea
                name="description"
                placeholder="Descripción"
                className="w-full border rounded px-3 py-2"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                required
              />

              {/* Amenidades */}
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
                />
                <Button type="button" variant="outline" onClick={handleAddAmenity}>
                  Agregar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((a, i) => (
                  <span key={i} className="bg-gray-200 rounded-full px-3 py-1 text-sm flex items-center gap-1">
                    {a}
                    <button type="button" onClick={() => handleRemoveAmenity(i)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <Button type="submit" className="flex-1">
                  {editingRoom ? "Guardar Cambios" : "Crear Habitación"}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={handleCloseModal}>
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
