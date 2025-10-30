import HotelNavbar from "./components/navbar"
import AppRoutes from "./AppRoutes"
function App() {
  return (
    <> {/* Puedes usar un Fragment (<>) o un <div> */}
      <HotelNavbar />
      <AppRoutes />
      {/* Footer, etc. si lo tienes */}
    </>
  );
}

export default App; // Asegúrate de exportarlo

