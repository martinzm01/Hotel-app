import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Importamos los íconos
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Creamos el objeto de ícono
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});



export default function MapComponent() {
  const position = [-24.7811, -65.4116];

  return (
    <MapContainer
      center={position}
      zoom={16}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* --- AQUÍ ESTÁ EL CAMBIO --- */}
      {/* Añadimos la prop 'icon' al Marker */}
      <Marker position={position} icon={DefaultIcon}>
        <Popup>
          <b>Hotel M&L Salta</b>
          <br />
          Calle Balcarce 50
        </Popup>
      </Marker>

    </MapContainer>
  );
}