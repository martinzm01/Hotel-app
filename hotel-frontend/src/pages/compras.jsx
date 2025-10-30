import React, { useState } from "react";

export default function CompraProveedores() {
  const [productos] = useState([
    { id: 1, nombre: "Vinilo - The Beatles", proveedor: "MusicWorld", precio: 8500, stock: 10 },
    { id: 2, nombre: "Vinilo - Pink Floyd", proveedor: "RockStore", precio: 9200, stock: 8 },
    { id: 3, nombre: "Vinilo - Queen", proveedor: "RetroSound", precio: 8800, stock: 12 },
  ]);

  const [orden, setOrden] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cantidades, setCantidades] = useState({});

  const agregarAOrden = (producto) => {
    const cantidad = cantidades[producto.id] || 1;
    if (cantidad <= 0) return;

    const existente = orden.find((item) => item.id === producto.id);
    if (existente) {
      setOrden(
        orden.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        )
      );
    } else {
      setOrden([...orden, { ...producto, cantidad }]);
    }
  };

  const eliminarDeOrden = (id) => {
    setOrden(orden.filter((item) => item.id !== id));
  };

  const totalOrden = orden.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        🛒 Comprar productos a proveedores
      </h1>

      {/* Botón para abrir modal */}
      <div className="flex justify-end mb-3">
        <button
          onClick={() => setMostrarModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Ver orden ({orden.length})
        </button>
      </div>

      {/* Tabla de productos */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Producto</th>
              <th className="p-3">Proveedor</th>
              <th className="p-3">Precio Unitario</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Cantidad</th>
              <th className="p-3 text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-800">{producto.nombre}</td>
                <td className="p-3">{producto.proveedor}</td>
                <td className="p-3">${producto.precio.toLocaleString()}</td>
                <td className="p-3">{producto.stock}</td>
                <td className="p-3">
                  <input
                    type="number"
                    min="1"
                    max={producto.stock}
                    value={cantidades[producto.id] || ""}
                    onChange={(e) =>
                      setCantidades({
                        ...cantidades,
                        [producto.id]: parseInt(e.target.value),
                      })
                    }
                    className="border rounded w-20 p-1 text-center"
                  />
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => agregarAOrden(producto)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                  >
                    Agregar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de orden */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button
              onClick={() => setMostrarModal(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              🧾 Orden de compra
            </h2>

            {orden.length === 0 ? (
              <p className="text-gray-600">No hay productos en la orden.</p>
            ) : (
              <div>
                <table className="w-full text-sm mb-4">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2">Producto</th>
                      <th>Cant.</th>
                      <th>Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orden.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2">{item.nombre}</td>
                        <td className="text-center">{item.cantidad}</td>
                        <td className="text-right">
                          ${(item.precio * item.cantidad).toLocaleString()}
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => eliminarDeOrden(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            🗑
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>${totalOrden.toLocaleString()}</span>
                </div>

                <button
                  onClick={() => alert("Compra confirmada ✅")}
                  className="w-full mt-5 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                  Confirmar compra
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
