import { useState } from "react";
import MiniatureOrdonnance from "./MiniatureOrdonnance.jsx";
import ModalOrdonnance from "./ModalOrdonnance.jsx";
import styles from "./TableauHistorique.module.css";

const FILTRES = [
  { id: "toutes", label: "Toutes" },
  { id: "acceptees", label: "Acceptées" },
  { id: "refusees", label: "Refusées" },
  { id: "livrees", label: "Livrées" },
];

const LABEL_STATUT = {
  ACCEPTEE: "Acceptée",
  REFUSEE: "Refusée",
  EN_LIVRAISON: "En livraison",
  LIVREE: "Livrée",
};

const STYLE_STATUT = {
  ACCEPTEE: "badgeAcceptee",
  REFUSEE: "badgeRefusee",
  EN_LIVRAISON: "badgeEnLivraison",
  LIVREE: "badgeLivree",
};

function formaterDate(dateString) {
  const date = new Date(dateString.replace(" ", "T"));
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function TableauHistorique({ historique, filtreActif, onChangerFiltre }) {
  const [ordonnanceSelectionnee, setOrdonnanceSelectionnee] = useState(null);

  return (
    <section className={styles.section}>
      <h2 className={styles.titreSection}>Historique des commandes</h2>

      <div className={styles.filtres}>
        {FILTRES.map((f) => (
          <button
            key={f.id}
            className={filtreActif === f.id ? styles.filtreActif : styles.filtre}
            onClick={() => onChangerFiltre(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {historique.length === 0 ? (
        <p className={styles.vide}>Aucune commande dans cette catégorie.</p>
      ) : (
        <div className={styles.tableauWrapper}>
          <table className={styles.tableau}>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date</th>
                <th>Mode</th>
                <th>Statut</th>
                <th>Ordonnance</th>
              </tr>
            </thead>
            <tbody>
              {historique.map((commande) => (
                <tr key={commande.id_commande}>
                  <td className={styles.cellulePatient}>
                    {commande.prenom_patient} {commande.nom_patient}
                  </td>
                  <td>{formaterDate(commande.date_commande)}</td>
                  <td>{commande.mode === "LIVRAISON" ? "Livraison" : "Retrait"}</td>
                  <td>
                    <span className={styles[STYLE_STATUT[commande.statut]] || styles.badgeDefaut}>
                      {LABEL_STATUT[commande.statut] || commande.statut}
                    </span>
                  </td>
                  <td>
                    {commande.ordonnances && commande.ordonnances.length > 0 ? (
                      <button
                        className={styles.lienVoir}
                        onClick={() => setOrdonnanceSelectionnee(commande.ordonnances[0])}
                      >
                        Voir
                      </button>
                    ) : (
                      <span className={styles.aucuneOrdonnance}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {ordonnanceSelectionnee && (
        <ModalOrdonnance
          ordonnance={ordonnanceSelectionnee}
          onFermer={() => setOrdonnanceSelectionnee(null)}
        />
      )}
    </section>
  );
}