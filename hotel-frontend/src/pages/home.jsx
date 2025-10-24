import React, { useState, useEffect } from "react";
import HotelHeader from "../components/Hotelheader";
import Footer from "../components/Footer";
const carouselItems = [
  {
    title: "Restaurant Terracota",
    description:
      "Con una experiencia innovadora y elegante, ofrecemos el entorno ideal para relajarse con una deliciosa comida mientras contempla la maravillosa vista a Salta, Argentina. Aquí encontrará platos gourmet internacionales acompañados de una selección de vinos exquisitos.",
    imageUrl: "/assets/restaurante del hotel.png",
  },
  {
    title: "Spa & Bienestar",
    description:
      "Sumérgete en un oasis de tranquilidad y bienestar en nuestro spa. Ofrecemos una variedad de tratamientos relajantes y rejuvenecedores para consentirte durante tu estancia.",
    imageUrl: "/assets/spa del hotel.png",
  },
  {
    title: "Salón de Juegos",
    description:
      "Diviértete con nuestra variedad de juegos y actividades recreativas. Tenemos mesas de billar, ping-pong, juegos de mesa y mucho más para todas las edades.",
    imageUrl: "/assets/salón de juegos.jpg",
  },
  {
    title: "Piscina Climatizada",
    description:
      "Disfruta de nuestra piscina climatizada durante todo el año. Relájate y disfruta de un ambiente tranquilo y cómodo, ideal para nadar y descansar.",
    imageUrl: "/assets/piscina del hotel.png",
  },
  {
    title: "Salón de Eventos",
    description:
      "Organiza tus eventos y celebraciones en nuestro elegante salón. Ofrecemos servicios personalizados para bodas, conferencias y más.",
    imageUrl: "/assets/salón de eventos.png",
  },
  {
    title: "Gimnasio Moderno",
    description:
      "Mantente en forma con nuestro gimnasio totalmente equipado. Contamos con máquinas de última generación y entrenadores profesionales a tu disposición.",
    imageUrl: "/assets/gimnasio moderno.jpg",
  },
];

const nearbyPlaces = [
  {
    name: "Cerro San Bernardo",
    imageUrl: "/assets/Cerro San Bernardo.jpg",
    link: "",
  },
  {
    name: "Catedral de Salta",
    imageUrl: "/assets/catedral.jpg",
    link: "",
  },
  {
    name: "Museo Arq.de Alta Montaña",
    imageUrl: "/assets/Museo.jpg",
    link: "",
  },
  {
    name: "Iglesia San Francisco",
    imageUrl: "/assets/Iglesia San Francisco.jpg",
    link: "",
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [comments, setComments] = useState([
    { id: 1, author: "Lunapy", text: "Excelente hotel, muy recomendable!" },
    { id: 2, author: "Martinzm", text: "La piscina climatizada es genial." },
  ]);
  const [newComment, setNewComment] = useState("");

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prevSlide) =>
        (prevSlide - 1 + carouselItems.length) % carouselItems.length
    );
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, []);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim() !== "") {
      const newCommentObject = {
        id: comments.length + 1,
        author: "Anónimo",
        text: newComment,
      };
      setComments([...comments, newCommentObject]);
      setNewComment("");
    }
  };

  return (
    <main>
      <HotelHeader />
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-serif text-4xl font-light text-foreground">
            Hotel M&L Salta
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center font-sans leading-relaxed text-muted-foreground">
            Bienvenido al Hotel M&L Salta, tu oasis de confort y elegancia en el
            corazón de Salta la Linda. Descubre una experiencia inolvidable
            donde la hospitalidad se une al encanto local.
          </p>
        </div>
      </section>


      {/* Servicios */}
      <section className="py-12 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-serif text-center text-foreground mb-8">
            Servicios Destacados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Piscina Climatizada",
              "Restaurante Gourmet",
              "Spa & Bienestar",
              "Gimnasio Moderno",
              "Salón de Eventos",
              "Salón de Juegos",
            ].map((service, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <h4 className="text-xl font-semibold text-gray-800 mb-2">
                  {service}
                </h4>
                <p className="text-gray-600">
                  {service === "Piscina Climatizada"
                    ? "Relájate en nuestra piscina climatizada disponible todo el año."
                    : service === "Restaurante Gourmet"
                    ? "Disfruta de una exquisita selección de platos regionales e internacionales."
                    : service === "Spa & Bienestar"
                    ? "Déjate consentir con nuestros tratamientos de spa y masajes relajantes."
                    : service === "Gimnasio Moderno"
                    ? "Mantente en forma con nuestro gimnasio totalmente equipado."
                    : service === "Salón de Eventos"
                    ? "Organiza tus eventos y celebraciones en nuestro elegante salón."
                    : "Diviértete con nuestra variedad de juegos y actividades recreativas."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Carrusel */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gray-100 rounded-lg shadow-md overflow-hidden">
            <img
              src={carouselItems[currentSlide].imageUrl}
              alt={carouselItems[currentSlide].title}
              className="w-full h-96 object-cover"
            />
            <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50"></div>
            <div className="absolute top-0 left-0 w-1/2 h-full p-8 flex flex-col justify-center">
              <h3 className="text-3xl font-serif text-white mb-4">
                {carouselItems[currentSlide].title}
              </h3>
              <p className="text-lg text-gray-200">
                {carouselItems[currentSlide].description}
              </p>
              <button className="mt-6 bg-white text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 transition duration-300">
                Explorar
              </button>
            </div>

            <div className="absolute bottom-4 left-0 right-0 flex justify-between items-center px-4">
              <button
                onClick={prevSlide}
                className="bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-900 transition duration-300"
              >
                Anterior
              </button>
              <div className="text-white">
                {currentSlide + 1} / {carouselItems.length}
              </div>
              <button
                onClick={nextSlide}
                className="bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-900 transition duration-300"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </section>  

        {/* Información del Hotel */}
              <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-serif text-center text-foreground mb-8">
              Información del Hotel
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">
                  Recepción
                </h4>
                <p className="text-gray-600">
                  Atención las 24 horas para ayudarte con cualquier consulta o
                  necesidad.
                </p>
                <h4 className="text-xl font-semibold text-gray-800 mt-4 mb-2">
                  Registro de Llegada y Salida
              </h4>
                <p className="text-gray-600">
                  Check-in: a partir de las 14:00. Check-out: hasta las 11:00.
                </p>
                <h4 className="text-xl font-semibold text-gray-800 mt-4 mb-2">
                  Política de Mascotas
                </h4>
                <p className="text-gray-600">
                  Se admiten mascotas pequeñas bajo petición. Pueden aplicarse
                  cargos adicionales.
                </p>
                <h4 className="text-xl font-semibold text-gray-800 mt-4 mb-2">
                  Estacionamiento
                </h4>
                <p className="text-gray-600">
                  Disponemos de estacionamiento gratuito para nuestros huéspedes.
                </p>
              </div>
        
              <div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">
                  Políticas de Pago
                </h4>
                <p className="text-gray-600">
                  Aceptamos tarjetas de crédito (Visa, Mastercard, Naranja,
                  American Express) y efectivo.
                </p>
                <h4 className="text-xl font-semibold text-gray-800 mt-4 mb-2">
                  Idiomas
                </h4>
                <p className="text-gray-600">
                  Nuestro personal habla español, inglés y portugués.
                </p>
                <h4 className="text-xl font-semibold text-gray-800 mt-4 mb-2">
                  Accesibilidad
                </h4>
                <p className="text-gray-600">
                  Contamos con instalaciones accesibles para personas con
                  necesidades especiales, incluyendo habitaciones adaptadas y
                  rampas de acceso.
                </p>
                <p className="text-gray-600">
                  Por favor, contáctanos para más detalles sobre nuestras
                  facilidades de accesibilidad.
                </p>
              </div>
            </div>
          </div>
        </section>
        
         {/* Sección del Mapa y Ubicación (no se en que parte lo puse jsjs ya busco alguna zona) */}
        <section className="py-20 bg-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-serif text-center text-foreground mb-8">
              Nuestra Ubicación
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-lg shadow-md">
              {/* Columna Izquierda: Detalles de Ubicación */}
              <div>
                <h4 className="text-2xl font-serif text-foreground mb-4">
                  Cómo Llegar
                </h4>
                <div className="mb-6">
                  <p className="font-semibold text-lg text-gray-800">
                    Hotel M&l Salta
                  </p>
                  <p className="text-gray-600">
                    Calle Balcarce 50, Salta, Argentina, A4400
                  </p>
                  <p className="text-gray-600">Tel.: +54 387-412-3456</p>
                </div>
                {/* Aeropuerto */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-700 font-medium flex items-center">
                      <span className="mr-2 text-xl"></span> Aeropuerto
                      Internacional Martín Miguel de Güemes
                    </p>
                    <span className="text-gray-500">&#9660;</span>
                  </div>
                </div>
                {/* Otros Medios de Transporte */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-700 font-medium flex items-center">
                      <span className="mr-2 text-xl"></span> Otros medios de
                      transporte
                    </p>
                    <span className="text-gray-500">&#9660;</span>
                  </div>
                </div>
              </div>
              {/* Columna Derecha: Mapa */}
              <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28943.49529502177!2d-65.4201992864543!3d-24.78759282116423!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x941bc3b459a71cb9%3A0x74fc86b81836d832!2sSalta!5e0!3m2!1ses-419!2sar!4v1684172792071!5m2!1ses-419!2sar"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Hotel Myl Salta Location"
                ></iframe>
              </div>
            </div>
          </div>
        </section>
        {/* Estamos cerca de */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-serif text-center text-foreground mb-8">
              Estamos cerca de
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {nearbyPlaces.map((place, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <a href={place.link} target="_blank" rel="noopener noreferrer">
                    <img
                      src={place.imageUrl}
                      alt={place.name}
                      className="w-full h-64 object-cover transform hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute bottom-0 left-0 w-full bg-gray-800 text-white p-4 opacity-75">
                      <h4 className="text-lg font-serif">{place.name}</h4>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
              {/* Video y Comentarios */}
              <section className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-start">
                  {/* Video */}
                  <div className="w-1/2 relative mr-4">
                    <video
                      src="/assets/video pagina.mp4"
                      className="w-full rounded-lg shadow-md"
                      controls
                      muted
                      loop
                      autoPlay
                    >
                      Tu navegador no soporta la reproducción de videos.
                    </video>
                  </div>
        
                  {/* Comentarios */}
                  <div className="w-1/2">
                    <h4 className="text-xl font-serif text-gray-800 mb-2">
                      Comentarios
                    </h4>
                    <div className="mb-4">
                      {comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="mb-2 p-3 bg-gray-100 rounded-md"
                        >
                          <p className="text-sm font-semibold">{comment.author}:</p>
                          <p className="text-gray-700">{comment.text}</p>
                        </div>
                      ))}
                    </div>
        
                    <form onSubmit={handleCommentSubmit}>
                      <textarea
                        className="w-full p-2 border rounded-md text-gray-700"
                        placeholder="Escribe tu comentario..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="mt-2 bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-900 transition duration-300"
                      >
                        Enviar Comentario
                      </button>
                    </form>
                  </div>
                </div>
              </section>
              <Footer/>
          </main>
          );
        }
        


//MAPA FUNCIONAL

/*import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function Mapa() {
    useEffect(() => {
        const map = L.map('mapid').setView([-34.6037, -58.3816], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        L.marker([-34.6037, -58.3816]).addTo(map)
        .bindPopup('Hotel M&L<br>Estamos aquí!')
        .openPopup();
    }, []);

    return (
        <div className="container">
        <h2>Ubicación del Hotel</h2>
        <div id="mapid" style={{ height: '300px', borderRadius: '4px' }}></div>
        </div>
    );
    }
*/
