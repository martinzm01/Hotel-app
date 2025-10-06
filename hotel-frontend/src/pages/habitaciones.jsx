import  HotelHeader  from "../components/Hotelheader"

export default function Habitaciones() {
  return (
    <main>
      {/* Header con carrusel */}
      <HotelHeader />

      {/* Sección de contenido */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-serif text-4xl font-light text-gray-800">
            Nuestras Habitaciones
          </h2>
          <p className="mt-6 text-center font-sans text-gray-600 max-w-2xl mx-auto">
            Explora nuestras opciones de alojamiento, diseñadas para ofrecerte
            el máximo confort y elegancia durante tu estancia.
          </p>

          {/* agregar cards de habitaciones más adelante */}
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Ejemplo de habitación */}
            <div className="rounded-2xl overflow-hidden shadow-lg bg-white">
              <img
                src="/assets/habitacion1.png"
                alt="Habitación Deluxe"
                className="h-56 w-full object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Habitación Deluxe
                </h3>
                <p className="mt-2 text-gray-600 text-sm">
                  Espaciosa y moderna, con vistas a la ciudad y servicios premium.
                </p>
                <button className="mt-4 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
                  Reservar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

