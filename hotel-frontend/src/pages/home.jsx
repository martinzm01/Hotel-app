import HotelHeader from "../components/Hotelheader";

export default function Home() {
  return (
    <main>
      <HotelHeader />
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-serif text-4xl font-light text-foreground">
            Contenido de la página principal
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center font-sans leading-relaxed text-muted-foreground">
            Aquí puedes agregar el resto del contenido de tu aplicación de hotel.
          </p>
        </div>
      </section>
    </main>
  )
}
