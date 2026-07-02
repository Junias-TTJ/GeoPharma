// frontend/src/components/MapView.jsx
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import PharmacyMarker from "./PharmacyMarker";

const DAKAR_CENTER = [14.6928, -17.4467];

const iconeUtilisateur = L.divIcon({
  className: "custom-marker",
  html: `
    <div style="
      width: 18px; height: 18px;
      background:#3B82F6;
      border: 3px solid #FFFFFF;
      border-radius: 50%;
      box-shadow: 0 0 0 4px rgba(59,130,246,0.25), 0 2px 6px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function RecentrerCarte({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 14, { animate: true });
    }
  }, [position, map]);
  return null;
}

export default function MapView({
  pharmacies,
  userPosition,
  distances,
  onItineraire,
  itineraire,
}) {
  return (
    <MapContainer
      center={DAKAR_CENTER}
      zoom={13}
      style={{ width: "100%", height: "100%" }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userPosition && (
        <>
          <Marker position={userPosition} icon={iconeUtilisateur} />
          <RecentrerCarte position={userPosition} />
        </>
      )}

      {pharmacies.map((pharmacie) => (
        <PharmacyMarker
          key={pharmacie.id_pharmacie}
          pharmacie={pharmacie}
          distance={distances[pharmacie.id_pharmacie]}
          onItineraire={onItineraire}
        />
      ))}

      {itineraire && (
        <Polyline
          positions={itineraire.coordinates}
          pathOptions={{ color: "#4A9B6F", weight: 5, opacity: 0.8 }}
        />
      )}
    </MapContainer>
  );
}