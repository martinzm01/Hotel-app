import React from "react";
import facebookIcon from "/assets/logofacebook.jpg"; // Importa los íconos
import instagramIcon from "/assets/logoig.jpg";
import twitterIcon from "/assets/logox.jpg";

export default function Footer() {
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
