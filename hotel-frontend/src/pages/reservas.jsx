import React, { useState } from 'react';

export default function Reservas() {
  const [formData, setFormData] = useState({});

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    alert('Reserva realizada con éxito. ¡Gracias por elegir Hotel M&L!');
  };

  return (
    <div className="container">
      <h2>Realizar Reserva</h2>
      <form onSubmit={handleSubmit}>
        <label>Nombre:</label>
        <input type="text" name="nombre" onChange={handleChange} required />

        <label>Email:</label>
        <input type="email" name="email" onChange={handleChange} required />

        <label>Teléfono:</label>
        <input type="tel" name="telefono" onChange={handleChange} />

        <label>Tipo de Habitación:</label>
        <select name="habitacion" onChange={handleChange}>
          <option value="estandar">Habitación Estándar</option>
          <option value="doble">Habitación Doble</option>
          <option value="suite">Suite</option>
        </select>

        <label>Fecha de Llegada:</label>
        <input type="date" name="llegada" onChange={handleChange} required />

        <label>Fecha de Salida:</label>
        <input type="date" name="salida" onChange={handleChange} required />

        <label>Comentarios Adicionales:</label>
        <textarea name="comentarios" onChange={handleChange} rows="4"></textarea>

        <button type="submit">Reservar Ahora</button>
      </form>
    </div>
  );
}
