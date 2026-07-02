// frontend/src/components/PharmacyMarker.jsx
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Navigation, Phone, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const creerIcone = (couleur) =>
  L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 26px; height: 26px;
        background:${couleur};
        border: 3px solid #FFFFFF;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -28],
  });

const ICONES = {
  ouverte: creerIcone("#4A9B6F"),
  garde: creerIcone("#F59E0B"),
  fermee: creerIcone("#E53935"),
};

const LABELS_STATUT = {
  ouverte: { texte: "Ouverte", couleur: "#4A9B6F", bg: "#E8F5EE" },
  garde: { texte: "De garde", couleur: "#F59E0B", bg: "#FEF3E2" },
  fermee: { texte: "Fermée", couleur: "#E53935", bg: "#FDEAEA" },
};

export default function PharmacyMarker({ pharmacie, distance, onItineraire }) {
  const navigate = useNavigate();
  const icone = ICONES[pharmacie.statut] || ICONES.fermee;
  const badge = LABELS_STATUT[pharmacie.statut] || LABELS_STATUT.fermee;

  return (
    <Marker position={[pharmacie.latitude, pharmacie.longitude]} icon={icone}>
      <Popup>
        <div style={{ fontFamily: "Poppins, sans-serif", minWidth: "200px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "6px",
            }}
          >
            <h3
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "#1A1A1A",
                margin: 0,
              }}
            >
              {pharmacie.nom}
            </h3>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: badge.couleur,
                background: badge.bg,
                borderRadius: "20px",
                padding: "2px 10px",
                whiteSpace: "nowrap",
                marginLeft: "6px",
              }}
            >
              {badge.texte}
            </span>
          </div>

          <p style={{ fontSize: "13px", color: "#555555", margin: "2px 0" }}>
            {pharmacie.adresse}
          </p>
          <p style={{ fontSize: "13px", color: "#555555", margin: "2px 0" }}>
            {pharmacie.tel} · {pharmacie.horaires}
          </p>
          {distance != null && (
            <p
              style={{
                fontSize: "13px",
                color: "#4A9B6F",
                fontWeight: 600,
                margin: "2px 0 10px",
              }}
            >
              {distance.toFixed(1)} km
            </p>
          )}

          <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
            <button onClick={() => onItineraire(pharmacie)} style={boutonSecondaire}>
              <Navigation size={14} /> Itinéraire
            </button>
            <a href={`tel:${pharmacie.tel}`} style={boutonSecondaire}>
              <Phone size={14} /> Appeler
            </a>
          </div>
          <button
            onClick={() => navigate(`/commandes?pharmacie=${pharmacie.id_pharmacie}`)}
            style={boutonPrimaire}
          >
            <FileText size={14} /> Commander
          </button>
        </div>
      </Popup>
    </Marker>
  );
}

const boutonSecondaire = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "4px",
  border: "1.5px solid #4A9B6F",
  color: "#4A9B6F",
  background: "transparent",
  borderRadius: "8px",
  padding: "8px 10px",
  fontSize: "13px",
  fontWeight: 600,
  fontFamily: "Poppins, sans-serif",
  cursor: "pointer",
  textDecoration: "none",
};

const boutonPrimaire = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "4px",
  border: "none",
  color: "#FFFFFF",
  background: "#4A9B6F",
  borderRadius: "8px",
  padding: "9px 10px",
  fontSize: "13px",
  fontWeight: 600,
  fontFamily: "Poppins, sans-serif",
  cursor: "pointer",
  marginTop: "8px",
};