import React from "react";

export default function RoomCard({ title, description, price, image }) {
  return (
    <div style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "10px", borderRadius: "4px" }}>
      <img src={image} alt={title} style={{ width: "100%", maxHeight: "200px", objectFit: "cover" }} />
      <h3>{title}</h3>
      <p>{description}</p>
      <p>Precio: {price}</p>
    </div>
  );
}
