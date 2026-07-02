import { useState } from "react";
import { FiMapPin, FiFileText, FiAlignLeft } from "react-icons/fi";
import ModalOrdonnance from "./ModalOrdonnance.jsx";
import styles from "./CarteCommandeAttente.module.css";

const BASE_URL = "http://localhost/geopharma/backend";

function formaterHeure(dateString) {
  const date = new Date(dateString.replace(" ", "T"));
  const aujourdhui = new Date();
  const estAujourdhui = date.toDateString() === aujourdhui.toDateString();
  const heure = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return estAujourdhui ? `Aujourd'hui ${heure}` : `${date.toLocaleDateString("fr-FR")} ${heure}`;
}

function Miniature({ ordonnance, onClick }) {
  const { fichier, type_fichier } = ordonnance;

  if (type_fichier === "IMAGE") {
    return (
      <button className={styles.miniature} onClick={onClick} title="Voir l'ordonnance">
        <img
          src={`${BASE_URL}/uploads/${fichier}`}
          alt="Ordonnance"
          className={styles.miniatureImg}
        />
      </button>
    );
  }

  if (type_fichier === "PDF") {
    return (
      <button className={styles.miniature} onClick={onClick} title="Voir l'ordonnance PDF">
        <div className={styles.miniaturePdf}>
          <FiFileText size={22} />
          <span>PDF</span>
        </div>
      </button>
    );
  }

  if (type_fichier === "TEXTE") {
    return (
      <button className={styles.miniature} onClick={onClick} title="Voir la saisie manuelle">
        <div className={styles.miniatureTexte}>
          <FiAlignLeft size={22} />
          <span>Texte</span>
        </div>
      </button>
    );
  }

  return null;
}

export default function CarteCommandeAttente({ commande, onAccepter, onRefuser }) {
  const { nom_patient, prenom_patient, mode, date_commande, adresse_livraison, ordonnances = [] } = commande;
  const [ordonnanceSelectionnee, setOrdonnanceSelectionnee] = useState(null);

  return (
    <div className={styles.carte}>
      <div className={styles.enTete}>
        <span className={styles.nomPatient}>{prenom_patient} {nom_patient}</span>
        <span className={mode === "LIVRAISON" ? styles.badgeLivraison : styles.badgeRetrait}>
          {mode === "LIVRAISON" ? "Livraison à domicile" : "Retrait en pharmacie"}
        </span>
      </div>

      <p className={styles.date}>{formaterHeure(date_commande)}</p>

      {ordonnances.length > 0 && (
        <div className={styles.ordonnances}>
          {ordonnances.map((ordo) => (
            <Miniature
              key={ordo.id_ordonnance}
              ordonnance={ordo}
              onClick={() => setOrdonnanceSelectionnee(ordo)}
            />
          ))}
        </div>
      )}

      {mode === "LIVRAISON" && adresse_livraison && (
        <p className={styles.adresse}>
          <FiMapPin /> Adresse : {adresse_livraison}
        </p>
      )}

      <div className={styles.actions}>
        <button className={styles.boutonAccepter} onClick={onAccepter}>
          ✓ Accepter
        </button>
        <button className={styles.boutonRefuser} onClick={onRefuser}>
          ✕ Refuser
        </button>
      </div>

      {ordonnanceSelectionnee && (
        <ModalOrdonnance
          ordonnance={ordonnanceSelectionnee}
          onFermer={() => setOrdonnanceSelectionnee(null)}
        />
      )}
    </div>
  );
}