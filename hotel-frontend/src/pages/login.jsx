import React, { useState } from "react"; // Quitamos useEffect
import { supabase } from "../back_supabase/Client";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const navigate = useNavigate();

  // App.jsx y AuthContext ya se encargan de esta lógica.

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegister) {
      // VALIDACIONES REGISTRO
      if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        alert("El correo electrónico no tiene un formato válido.");
        return;
      }

      if (!/[A-Z]/.test(password) || !/[0-9]/.test(password) || password.length < 8) {
        alert(
          "La contraseña debe incluir al menos una mayúscula, un número y tener al menos 8 caracteres."
        );
        return;
      }

      if (!nombre || !apellido) {
        alert("Completá nombre y apellido.");
        return;
      }

      // Registro en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nombre, apellido } },
      });

      if (authError) {
        alert("Error al registrarse: " + authError.message);
        return;
      }

      if (!authData.user) {
        alert("Error: no se pudo crear el usuario.");
        return;
      }

      // Insertar en tabla usuarios
      const { error: rpcError } = await supabase.rpc("insert_usuario", {
        p_id: authData.user.id,
        p_nombre: nombre,
        p_apellido: apellido,
        p_email: email,
        p_rol: "cliente",
      });

      if (rpcError) {
        alert("Error al crear usuario en tabla usuarios: " + rpcError.message);
        return;
      }

      alert(" Usuario registrado correctamente. Revisá tu correo si hay verificación de email.");
      setIsRegister(false);
      setEmail("");
      setPassword("");
      setNombre("");
      setApellido("");
    } else {
      // LOGIN
      if (!email || !password) {
        alert("Por favor, completá todos los campos.");
        return;
      }

      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError || !loginData.user) {
        alert("Correo o contraseña incorrectos.");
        return;
      }

      alert("Bienvenido/a!");
      // Esta navegación SÍ está bien, porque es una acción directa del usuario.
      navigate("/home"); 
    }
  };

  return (
    <div
      style={{
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundBlendMode: "darken",
        backgroundImage: "url('/assets/fondologin.jpg')",
      }}
      className="relative bg-gray-100 min-h-screen flex flex-col justify-between pt-20 bg-cover bg-center"
    >
      <div className="relative z-10 bg-white p-8 rounded-xl shadow-lg w-96 mx-auto mt-10 mb-5">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center font-serif">
          {isRegister ? "Registrarse" : "Iniciar sesión"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-5">
          {isRegister && (
            <>
              <input
                type="text"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              <input
                type="text"
                placeholder="Apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </>
          )}

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />

          <button
            type="submit"
            className="bg-gray-800 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {isRegister ? "Registrarse" : "Ingresar"}
          </button>
        </form>

        <p className="mt-4 text-center">
          {isRegister ? "¿Ya tenés una cuenta?" : "¿No tenés cuenta?"}{" "}
          <button
            className="text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Iniciar sesión" : "Registrarme"}
          </button>
        </p>
      </div>

      <Footer />
    </div>
  );
}