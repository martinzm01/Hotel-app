import React, { useEffect, useState } from "react";
import { supabase } from "../back_supabase/client";
import RoomCard from "../components/RoomCard"; // asegúrate que exporte default
import Button from "../components/ui/Button";

export default function AdminHabitaciones() {
  const [numero, setNumero] = useState("");
  const [tipo, setTipo] = useState("simple");
  const [estado, setEstado] = useState("disponible");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [file, setFile] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [habitaciones, setHabitaciones] = useState([]);
  const [editando, setEditando] = useState(null); // id de la habitación en edición

  useEffect(() => {
    fetchHabitaciones();
  }, []);

  const fetchHabitaciones = async () => {
    const { data, error } = await supabase
      .from("habitaciones")
      .select("*")
      .order("numero", { ascending: true });

    if (error) console.error("Error fetch habitaciones:", error);
    else setHabitaciones(data);
  };

  const subirImagen = async (file) => {
    if (!file) return null;
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `imagenes/${fileName}`;

    const { data, error } = await supabase.storage
      .from("habitaciones")
      .upload(filePath, file);

    if (error) {
      console.error("Error al subir imagen:", error);
      return null;
    }

    return supabase.storage.from("habitaciones").getPublicUrl(filePath).data.publicUrl;
  };

  // Agregar o editar habitación
  const handleGuardar = async (e) => {
    e.preventDefault();

    if (!numero || !tipo || !precio || !estado || !descripcion) {
      alert("Completa todos los campos");
      return;
    }

    setCargando(true);
    let imagen_url = null;

    if (file) imagen_url = await subirImagen(file);

    const numeroInt = parseInt(numero);
    const precioNum = parseFloat(precio);

    if (editando) {
      // Actualizar
      const { error } = await supabase
        .from("habitaciones")
        .update({
          numero: numeroInt,
          tipo,
          precio: precioNum,
          estado,
          descripcion,
          ...(imagen_url && { imagen_url }),
        })
        .eq("id", editando);

      if (error) alert("Error al actualizar habitación");
      else {
        alert("Habitación actualizada");
        fetchHabitaciones();
        resetForm();
      }
    } else {
      // Crear nueva
      const { data, error } = await supabase
        .from("habitaciones")
        .insert([
          { numero: numeroInt, tipo, precio: precioNum, estado, descripcion, imagen_url },
        ])
        .select();

      if (error) alert("Error al agregar habitación");
      else {
        setHabitaciones((prev) => [...prev, data[0]]);
        resetForm();
      }
    }

    setCargando(false);
  };

  const resetForm = () => {
    setNumero("");
    setTipo("simple");
    setEstado("disponible");
    setDescripcion("");
    setPrecio("");
    setFile(null);
    setEditando(null);
  };

  const handleEditar = (habitacion) => {
    setEditando(habitacion.id);
    setNumero(habitacion.numero);
    setTipo(habitacion.tipo);
    setEstado(habitacion.estado);
    setDescripcion(habitacion.descripcion);
    setPrecio(habitacion.precio);
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Seguro que quieres eliminar esta habitación?")) return;

    const { error } = await supabase.from("habitaciones").delete().eq("id", id);
    if (error) alert("Error al eliminar habitación");
    else {
      setHabitaciones((prev) => prev.filter((h) => h.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Panel de Administración de Habitaciones
        </h2>

        {/* Formulario */}
        <form
          onSubmit={handleGuardar}
          className="bg-white shadow-lg rounded-xl p-6 mb-10 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            type="number"
            placeholder="Número de habitación"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="simple">Simple</option>
            <option value="doble">Doble</option>
            <option value="suite">Suite</option>
          </select>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="disponible">Disponible</option>
            <option value="ocupada">Ocupada</option>
          </select>
          <input
            type="number"
            placeholder="Precio por noche"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <textarea
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="border p-2 rounded w-full col-span-1 md:col-span-2"
          />
          <input
            type="file"
            accept="image/png, image/jpeg"
            onChange={(e) => setFile(e.target.files[0])}
            className="col-span-1 md:col-span-2"
          />

          <Button
            type="submit"
            disabled={cargando}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold col-span-1 md:col-span-2"
          >
            {cargando
              ? "Guardando..."
              : editando
              ? "Actualizar Habitación"
              : "Agregar Habitación"}
          </Button>
        </form>

        {/* Grid de habitaciones */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {habitaciones.length > 0 ? (
            habitaciones.map((hab) => (
              <div key={hab.id} className="relative group">
                <RoomCard
                  name={`Habitación ${hab.numero}`}
                  type={hab.tipo}
                  description={hab.descripcion}
                  price={hab.precio}
                  image={hab.imagen_url}
                  amenities={[hab.estado, "WiFi", "TV", "Aire Acondicionado"]}
                />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <Button
                    onClick={() => handleEditar(hab)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleEliminar(hab.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600 col-span-full">
              No hay habitaciones registradas.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
