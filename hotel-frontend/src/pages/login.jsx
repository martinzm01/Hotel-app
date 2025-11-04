import React, { useState } from "react";
import { supabase } from "../back_supabase/client";
import { useNavigate } from "react-router-dom";
import Footer from "../components/footer";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState(""); 
  const [apellido, setApellido] = useState("");
  const navigate = useNavigate();
  // <<< 1. OBTENEMOS 'setLoading' ADEMÁS DE 'setProfile'
  const { setProfile, setLoading } = useAuth(); 

  const handleSubmit = async (e) => {
    e.preventDefault();

if (isRegister) {
      // --- LÓGICA DE REGISTRO (CONFIANDO EN EL TRIGGER) ---
      try {
        setLoading(true);

        if (!email || !password || !nombre || !apellido || !dni) {
          alert("Por favor, completá todos los campos.");
          throw new Error("Campos incompletos");
        }

        // 1. Creamos el usuario en Supabase Authentication
        const { error: authError } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            // Pasamos los datos extra aquí
            data: { 
              nombre: nombre, 
              apellido: apellido,
              dni: dni, 
            },
          },
        });

        if (authError) {
          alert("Error al registrar: " + authError.message);
          throw authError;
        }

        // 2. (HEMOS BORRADO EL BLOQUE .from("usuarios").insert())
        // El Trigger de la base de datos se encargará de esto.

        // 3. ¡Éxito!
        alert("¡Registro exitoso! Revisá tu correo para verificar la cuenta.");
        setIsRegister(false); 

      } catch (error) {
        console.error("Error en el registro:", error.message);
      } finally {
        setLoading(false);
      }
   


    } else {
      // --- LÓGICA DE LOGIN (Modificada) ---
      
      // <<< 2. ENVOLVEMOS TODO EN UN TRY...CATCH
      try {
        // <<< 3. AVISAMOS A LA APP QUE ESTAMOS CARGANDO
        setLoading(true);

        if (!email || !password) {
          alert("Por favor, completá todos los campos.");
          // Lanzamos un error para que el catch lo agarre
          throw new Error("Campos incompletos"); 
        }

        // 1. Autenticamos al usuario
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError || !loginData.user) {
          alert("Correo o contraseña incorrectos.");
          throw new Error("Credenciales incorrectas");
        }

        // 2. Buscamos el perfil COMPLETO del usuario
        const { data: dataRol, error: rolError } = await supabase
          .from("usuarios") 
          .select("*") 
          .eq("id", loginData.user.id)
          .single(); 

        if (rolError) {
          alert("Error al obtener el perfil de usuario: " + rolError.message);
          throw new Error("Error de perfil");
        }

        if (!dataRol) {
          alert("No se pudo encontrar el perfil del usuario.");
          throw new Error("Perfil no encontrado");
        }

        // 3. ¡SOLUCIÓN! ACTUALIZAMOS EL CONTEXTO GLOBAL ANTES DE NAVEGAR
        setProfile(dataRol);

        // 4. Redirigimos según el 'rol' obtenido
        // El 'loading' sigue en 'true'. El AuthContext (onAuthStateChange)
        // se encargará de ponerlo en 'false' cuando termine su propia carga.
        switch (dataRol.rol) {
          case "operador":
            navigate("/MenuOperador"); // 
            break;
          case "administrador":
            navigate("/admin"); 
            break;
          case "cliente":
            navigate("/home"); 
            break;
          default:
            navigate("/");
        }
      } catch (error) {
        // <<< 4. SI ALGO FALLA, DEJAMOS DE CARGAR
        alert(error.message); // Los alerts de arriba ya no son necesarios
        setLoading(false);
        console.error("Error en el login:", error.message);
      }
    }
  };

  return (
    // ... (Tu JSX de return no cambia)
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
              {/* ... (inputs de registro) ... */}
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
              <input
                type="text" // Puedes usar "text" o "number"
                placeholder="DNI"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
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
            className="bg-gray-800 hover:bg-gray-600 cursor-pointer text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {isRegister ? "Registrarse" : "Ingresar"}
          </button>
        </form>

        <p className="mt-4 text-center">
          {isRegister ? "¿Ya tenés una cuenta?" : "¿No tenés cuenta?"}{" "}
          <button
            className="text-blue-600 hover:text-blue-800  font-bold underline cursor-pointer"
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

