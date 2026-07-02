// frontend/src/services/pharmacieService.js
import axios from "axios";

const API_BASE_URL = "http://localhost/geopharma/backend/routes";

// Données factices — même structure que la réponse attendue du backend PHP.
// A retirer dès que l'endpoint pharmacies.php de Personne 1 est prêt :
// il suffira de remplacer USE_MOCK_DATA par false, aucune autre modif nécessaire.
const USE_MOCK_DATA = true;

const MOCK_PHARMACIES = [
  {
    id_pharmacie: 1,
    nom: "Pharmacie Point E",
    adresse: "Avenue Cheikh Anta Diop, Point E, Dakar",
    latitude: 14.6994,
    longitude: -17.4644,
    tel: "33 825 12 34",
    statut: "ouverte",
    est_active: true,
    horaires: "8h - 22h",
  },
  {
    id_pharmacie: 2,
    nom: "Pharmacie Gueule Tapée",
    adresse: "Rue 10, Gueule Tapée, Dakar",
    latitude: 14.6889,
    longitude: -17.4547,
    tel: "33 821 45 67",
    statut: "garde",
    est_active: true,
    horaires: "24h/24",
  },
  {
    id_pharmacie: 3,
    nom: "Pharmacie du Centenaire",
    adresse: "Avenue du Centenaire, Dakar",
    latitude: 14.6737,
    longitude: -17.4462,
    tel: "33 822 98 76",
    statut: "ouverte",
    est_active: true,
    horaires: "7h30 - 23h",
  },
  {
    id_pharmacie: 4,
    nom: "Pharmacie Amitié",
    adresse: "Amitié 2, Dakar",
    latitude: 14.7156,
    longitude: -17.4689,
    tel: "33 827 33 21",
    statut: "fermee",
    est_active: true,
    horaires: "8h - 20h",
  },
  {
    id_pharmacie: 5,
    nom: "Pharmacie HLM Grand Yoff",
    adresse: "HLM Grand Yoff, Dakar",
    latitude: 14.7268,
    longitude: -17.4553,
    tel: "33 824 56 89",
    statut: "ouverte",
    est_active: true,
    horaires: "8h - 21h",
  },
  {
    id_pharmacie: 6,
    nom: "Pharmacie Fann Résidence",
    adresse: "Fann Résidence, Dakar",
    latitude: 14.6906,
    longitude: -17.4728,
    tel: "33 825 90 12",
    statut: "garde",
    est_active: true,
    horaires: "24h/24",
  },
];

export async function getPharmacies() {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_PHARMACIES.filter((p) => p.est_active);
  }

  const response = await axios.get(`${API_BASE_URL}/pharmacies.php`);
  return response.data;
}

export function calculerDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function getItineraire(lat1, lon1, lat2, lon2) {
  const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;
  const response = await axios.get(url);

  if (!response.data.routes || response.data.routes.length === 0) {
    throw new Error("Aucun itinéraire trouvé");
  }

  const route = response.data.routes[0];
  return {
    coordinates: route.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
    distanceKm: route.distance / 1000,
    dureeMin: route.duration / 60,
  };
}