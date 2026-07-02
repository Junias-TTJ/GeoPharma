// frontend/src/pages/Carte.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, MapPin, ChevronUp, ChevronDown, Clock, Navigation } from "lucide-react";
import MapView from "../components/MapView";
import {
  getPharmacies,
  calculerDistance,
  getItineraire,
} from "../services/pharmacieService";
import styles from "./Carte.module.css";

const FILTRES = [
  { valeur: "toutes", label: "Toutes" },
  { valeur: "ouverte", label: "Ouvertes" },
  { valeur: "garde", label: "De garde" },
];

export default function Carte() {
  const [pharmacies, setPharmacies] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  const [recherche, setRecherche] = useState("");
  const [filtreActif, setFiltreActif] = useState("toutes");

  const [userPosition, setUserPosition] = useState(null);
  const [geoRefusee, setGeoRefusee] = useState(false);

  const [itineraire, setItineraire] = useState(null);
  const [pharmacieSelectionnee, setPharmacieSelectionnee] = useState(null);

  const [sheetOuvert, setSheetOuvert] = useState(true);

  useEffect(() => {
    getPharmacies()
      .then((data) => setPharmacies(data))
      .catch(() => setErreur("Impossible de charger les pharmacies."))
      .finally(() => setChargement(false));
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoRefusee(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition([position.coords.latitude, position.coords.longitude]);
      },
      () => {
        setGeoRefusee(true);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const distances = useMemo(() => {
    if (!userPosition) return {};
    const [latU, lonU] = userPosition;
    const map = {};
    pharmacies.forEach((p) => {
      map[p.id_pharmacie] = calculerDistance(latU, lonU, p.latitude, p.longitude);
    });
    return map;
  }, [userPosition, pharmacies]);

  const pharmaciesAffichees = useMemo(() => {
    let liste = [...pharmacies];

    if (filtreActif !== "toutes") {
      liste = liste.filter((p) => p.statut === filtreActif);
    }

    if (recherche.trim() !== "") {
      const q = recherche.toLowerCase();
      liste = liste.filter(
        (p) =>
          p.nom.toLowerCase().includes(q) || p.adresse.toLowerCase().includes(q)
      );
    }

    if (userPosition) {
      liste.sort((a, b) => distances[a.id_pharmacie] - distances[b.id_pharmacie]);
    }

    return liste;
  }, [pharmacies, filtreActif, recherche, userPosition, distances]);

  const demanderItineraire = useCallback(
    async (pharmacie) => {
      if (!userPosition) {
        setErreur("Activez votre localisation pour obtenir un itinéraire.");
        return;
      }
      setPharmacieSelectionnee(pharmacie);
      try {
        const resultat = await getItineraire(
          userPosition[0],
          userPosition[1],
          pharmacie.latitude,
          pharmacie.longitude
        );
        setItineraire(resultat);
      } catch {
        setErreur("Itinéraire indisponible pour le moment.");
      }
    },
    [userPosition]
  );

  const badgeStatut = (statut) => {
    const config = {
      ouverte: { texte: "Ouverte", couleur: "#4A9B6F", bg: "#E8F5EE" },
      garde: { texte: "De garde", couleur: "#F59E0B", bg: "#FEF3E2" },
      fermee: { texte: "Fermée", couleur: "#E53935", bg: "#FDEAEA" },
    };
    return config[statut] || config.fermee;
  };

  return (
    <div className={styles.page}>
      <aside className={`${styles.sidebar} ${sheetOuvert ? styles.sheetOuvert : styles.sheetFerme}`}>
        <button
          className={styles.poignee}
          onClick={() => setSheetOuvert((v) => !v)}
          aria-label="Afficher ou masquer la liste"
        >
          {sheetOuvert ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          <span>{pharmaciesAffichees.length} pharmacie{pharmaciesAffichees.length > 1 ? "s" : ""} trouvée{pharmaciesAffichees.length > 1 ? "s" : ""}</span>
        </button>

        <div className={styles.sidebarContenu}>
          <div className={styles.rechercheWrapper}>
            <Search size={16} color="#999999" />
            <input
              className={styles.rechercheInput}
              type="text"
              placeholder="Rechercher une pharmacie..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
          </div>

          <div className={styles.filtres}>
            {FILTRES.map((f) => (
              <button
                key={f.valeur}
                className={`${styles.filtreBtn} ${filtreActif === f.valeur ? styles.filtreActif : ""}`}
                onClick={() => setFiltreActif(f.valeur)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {geoRefusee && (
            <p className={styles.messageGeo}>
              Activez votre localisation pour voir les pharmacies près de vous
            </p>
          )}

          {chargement && <p className={styles.messageInfo}>Chargement des pharmacies...</p>}
          {erreur && <p className={styles.messageErreur}>{erreur}</p>}

          <ul className={styles.liste}>
            {pharmaciesAffichees.map((p) => {
              const badge = badgeStatut(p.statut);
              return (
                <li key={p.id_pharmacie} className={styles.carte}>
                  <div className={styles.carteHeader}>
                    <h3 className={styles.carteNom}>{p.nom}</h3>
                    <span
                      className={styles.badge}
                      style={{ color: badge.couleur, background: badge.bg }}
                    >
                      {badge.texte}
                    </span>
                  </div>
                  <p className={styles.carteAdresse}>
                    <MapPin size={13} />
                    {userPosition ? `${distances[p.id_pharmacie].toFixed(1)} km` : p.adresse}
                  </p>
                  <p className={styles.carteHoraire}>
                    <Clock size={13} />
                    {p.horaires}
                  </p>
                  <button className={styles.carteItineraire} onClick={() => demanderItineraire(p)}>
                    <Navigation size={13} /> Itinéraire
                  </button>
                </li>
              );
            })}
            {!chargement && pharmaciesAffichees.length === 0 && (
              <p className={styles.messageInfo}>Aucune pharmacie ne correspond à votre recherche.</p>
            )}
          </ul>
        </div>
      </aside>

      <div className={styles.carteContainer}>
        <MapView
          pharmacies={pharmaciesAffichees}
          userPosition={userPosition}
          distances={distances}
          onItineraire={demanderItineraire}
          itineraire={itineraire}
        />
        {itineraire && (
          <div className={styles.infoItineraire}>
            Vers {pharmacieSelectionnee?.nom} · {itineraire.distanceKm.toFixed(1)} km ·{" "}
            {Math.round(itineraire.dureeMin)} min
          </div>
        )}
      </div>
    </div>
  );
}