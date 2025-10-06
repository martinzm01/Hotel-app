import React, { useState } from "react";
import { supabase } from "../back_supabase/client"; // Ruta correcta
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegister) {
      if (!nombre || !apellido) {
        alert("Completá nombre y apellido");
        return;
      }

      // 🔹 Registro en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nombre, apellido },
        },
      });

      if (error) {
        alert("Error al registrarse: " + error.message);
        return;
      }

      // 🔹 Insertar en tabla usuarios
      const { error: insertError } = await supabase
        .from("usuarios")
        .insert([
          {
            id: data.user.id,
            nombre,
            apellido,
            email,
            rol: "cliente", // rol por defecto
          },
        ]);

      if (insertError) {
        alert("Error al crear usuario en tabla usuarios: " + insertError.message);
        return;
      }

      alert(
        "Usuario registrado! Revisa tu correo para confirmar tu cuenta si está activada la verificación de email."
      );

      // Limpiar formulario y volver a login
      setIsRegister(false);
      setEmail("");
      setPassword("");
      setNombre("");
      setApellido("");

    } else {
      // 🔹 Login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert("Error al iniciar sesión: " + error.message);
        return;
      }

      alert("Login exitoso!");
      console.log("Usuario logueado:", data.user);

      // Redirigir a la página principal
      navigate("/habitaciones");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>{isRegister ? "Registrarse" : "Iniciar sesión"}</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          {isRegister && (
            <>
              <input
                style={styles.input}
                type="text"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
              <input
                style={styles.input}
                type="text"
                placeholder="Apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
              />
            </>
          )}

          <input
            style={styles.input}
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" style={styles.button}>
            {isRegister ? "Registrarse" : "Ingresar"}
          </button>
        </form>

        <p style={{ marginTop: "1em" }}>
          {isRegister ? "¿Ya tenés una cuenta?" : "¿No tenés cuenta?"}{" "}
          <span style={styles.toggle} onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Iniciar sesión" : "Registrarme"}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#f7f7f7",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: "2em",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "320px",
    textAlign: "center",
  },
  title: {
    marginBottom: "1em",
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "0.7em",
    marginBottom: "0.8em",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "1em",
  },
  button: {
    backgroundColor: "#444",
    color: "white",
    padding: "0.8em",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1em",
  },
  toggle: {
    color: "#007bff",
    cursor: "pointer",
    textDecoration: "underline",
  },
};
