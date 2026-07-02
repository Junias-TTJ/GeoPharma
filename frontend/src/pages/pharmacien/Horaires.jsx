import { useState, useEffect } from "react";
import { FiClock, FiSave } from "react-icons/fi";
import { getHoraires, enregistrerHoraires } from "../../api.js";
import styles from "./Horaires.module.css";

const JOURS = [
  "LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI", "DIMANCHE"
];

const LABEL_JOUR = {
  LUNDI:    "Lundi",
  MARDI:    "Mardi",
  MERCREDI: "Mercredi",
  JEUDI:    "Jeudi",
  VENDREDI: "Vendredi",
  SAMEDI:   "Samedi",
  DIMANCHE: "Dimanche",
};

const HORAIRES_DEFAUT = {
  LUNDI:    { ouvert: true,  ouverture: "08:00", fermeture: "20:00" },
  MARDI:    { ouvert: true,  ouverture: "08:00", fermeture: "20:00" },
  MERCREDI: { ouvert: true,  ouverture: "08:00", fermeture: "20:00" },
  JEUDI:    { ouvert: true,  ouverture: "08:00", fermeture: "20:00" },
  VENDREDI: { ouvert: true,  ouverture: "08:00", fermeture: "20:00" },
  SAMEDI:   { ouvert: true,  ouverture: "09:00", fermeture: "18:00" },
  DIMANCHE: { ouvert: false, ouverture: "09:00", fermeture: "18:00" },
};

export default function Horaires() {
  const [horaires, setHoraires] = useState(HORAIRES_DEFAUT);
  const [chargement, setChargement] = useState(true);
  const [sauvegarde, setSauvegarde] = useState(false);
  const [succes, setSucces] = useState(false);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    chargerHoraires();
  }, []);

  const chargerHoraires = async () => {
    try {
      setChargement(true);
      const res = await getHoraires();
      const data = res.data;

      // Construire l'état à partir des données backend
      const nouvelEtat = { ...HORAIRES_DEFAUT };
      JOURS.forEach((jour) => {
        nouvelEtat[jour] = { ...HORAIRES_DEFAUT[jour], ouvert: false };
      });
      data.forEach((h) => {
        nouvelEtat[h.jour_semaine] = {
          ouvert:     true,
          ouverture:  h.heure_ouverture.substring(0, 5),
          fermeture:  h.heure_fermeture.substring(0, 5),
        };
      });
      setHoraires(nouvelEtat);
    } catch (e) {
      setErreur("Impossible de charger les horaires.");
    } finally {
      setChargement(false);
    }
  };

  const toggleJour = (jour) => {
    setHoraires((prev) => ({
      ...prev,
      [jour]: { ...prev[jour], ouvert: !prev[jour].ouvert },
    }));
  };

  const handleHeure = (jour, champ, valeur) => {
    setHoraires((prev) => ({
      ...prev,
      [jour]: { ...prev[jour], [champ]: valeur },
    }));
  };

  const handleEnregistrer = async () => {
    try {
      setSauvegarde(true);
      setErreur(null);

      const payload = JOURS
        .filter((jour) => horaires[jour].ouvert)
        .map((jour) => ({
          jour_semaine:    jour,
          heure_ouverture: horaires[jour].ouverture,
          heure_fermeture: horaires[jour].fermeture,
        }));

      await enregistrerHoraires(payload);
      setSucces(true);
      setTimeout(() => setSucces(false), 3000);
    } catch (e) {
      setErreur("Erreur lors de l'enregistrement.");
    } finally {
      setSauvegarde(false);
    }
  };

  if (chargement) {
    return <div className={styles.chargement}>Chargement...</div>;
  }

  return (
    <div className={styles.page}>
      {erreur && <div className={styles.erreurBanner}>{erreur}</div>}

      <div className={styles.carte}>
        <div className={styles.carteTitre}>
          <FiClock className={styles.icone} />
          <p className={styles.sousTitre}>
            Définissez les heures d'ouverture de votre pharmacie.
          </p>
        </div>

        <div className={styles.liste}>
          {JOURS.map((jour, index) => (
            <div
              key={jour}
              className={`${styles.ligne} ${index < JOURS.length - 1 ? styles.avecSeparateur : ""}`}
            >
              <span className={styles.labelJour}>{LABEL_JOUR[jour]}</span>

              <button
                className={horaires[jour].ouvert ? styles.toggleActif : styles.toggle}
                onClick={() => toggleJour(jour)}
                aria-label={`Activer/désactiver ${LABEL_JOUR[jour]}`}
              >
                <span className={styles.toggleCurseur} />
              </button>

              {horaires[jour].ouvert ? (
                <div className={styles.plageHoraire}>
                  <input
                    type="time"
                    className={styles.inputHeure}
                    value={horaires[jour].ouverture}
                    onChange={(e) => handleHeure(jour, "ouverture", e.target.value)}
                  />
                  <span className={styles.tiret}>—</span>
                  <input
                    type="time"
                    className={styles.inputHeure}
                    value={horaires[jour].fermeture}
                    onChange={(e) => handleHeure(jour, "fermeture", e.target.value)}
                  />
                </div>
              ) : (
                <span className={styles.badgeFerme}>Fermé</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.piedDePage}>
        {succes && (
          <span className={styles.messageSucces}>✓ Horaires enregistrés avec succès</span>
        )}
        <button
          className={styles.boutonEnregistrer}
          onClick={handleEnregistrer}
          disabled={sauvegarde}
        >
          <FiSave />
          {sauvegarde ? "Enregistrement..." : "Enregistrer les horaires"}
        </button>
      </div>
    </div>
  );
}