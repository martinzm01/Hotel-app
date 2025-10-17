
import React from "react";
// Importa los íconos de la librería react-icons
import { FaFacebook, FaInstagram, FaXTwitter, FaPhone } from "react-icons/fa6";
// Importa el módulo de estilos CSS
import styles from "./Footer.module.css";

// Array para gestionar los enlaces a redes sociales de forma escalable
const socialLinks = [
  {
    name: "Facebook",
    href: "https://facebook.com/hotelML",
    icon: <FaFacebook />,
  },
  {
    name: "Instagram",
    href: "https://instagram.com/hotelML",
    icon: <FaInstagram />,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/hotelML",
    icon: <FaXTwitter />,
  },
];

export default function Footer() {
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerContent}>
        
        {/* Sección de Copyright y Contacto */}
        <div className={styles.infoSection}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} Hotel M&L. Todos los derechos reservados.
          </p>
          <p className={styles.certification}>
            Certificado por la Asociación de Hoteles de Salta.
          </p>
          <a href="tel:+5493871234567" className={styles.phoneLink}>
            <FaPhone size="0.9em" />
            <span>+54 9 387 123 4567</span>
          </a>
        </div>

        {/* Sección de Redes Sociales */}
        <div className={styles.socialSection}>
          <span className={styles.socialTitle}>Síguenos</span>
          <div className={styles.socialIcons}>
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className={styles.socialIconLink}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
/*export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#333",
        color: "white",
        textAlign: "center",
        padding: "1.5em 1em",
        marginTop: "2em",
        fontSize: "0.95rem",
      }}
    >
      <p style={{ margin: "0 0 0.5em 0" }}>
        &copy; 2025 Hotel M&L — Hotel certificado y verificado por la Asociación de Hoteles de Salta
      </p>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "1em",
          justifyContent: "center",
          margin: "0.8em 0",
          flexWrap: "wrap",
        }}
      >
        <span>¿Todavía no nos seguís?</span>
        <a
          href="https://facebook.com/hotelML"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "white", textDecoration: "none", display: "flex", alignItems: "center" }}
          aria-label="Facebook"
        >
          <img src={facebookIcon} alt="Facebook" style={{ width: "1.2em", marginRight: "0.3em" }} />
          Facebook
        </a>
        <a
          href="https://instagram.com/hotelML"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "white", textDecoration: "none", display: "flex", alignItems: "center" }}
          aria-label="Instagram"
        >
          <img src={instagramIcon} alt="Instagram" style={{ width: "1.2em", marginRight: "0.3em" }} />
          Instagram
        </a>
        <a
          href="https://twitter.com/hotelML"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "white", textDecoration: "none", display: "flex", alignItems: "center" }}
          aria-label="Twitter"
        >
          <img src={twitterIcon} alt="Twitter" style={{ width: "1.2em", marginRight: "0.3em" }} />
          Twitter
        </a>
      </div>

      <p style={{ margin: "1em 0 0 0" }}>
        Teléfono:{" "}
        <a href="tel:+5493871234567" style={{ color: "white", textDecoration: "underline" }}>
          +54 9 387 123 4567
        </a>
      </p>
    </footer>
  );
}

/*
export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#333", color: "white", textAlign: "center", padding: "1em 0", marginTop: "2em" }}>
      <p>&copy; 2025 Hotel M&L</p>
    </footer>
  );
}*/
