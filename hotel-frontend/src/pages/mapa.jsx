import React, { useEffect } from 'react';
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
