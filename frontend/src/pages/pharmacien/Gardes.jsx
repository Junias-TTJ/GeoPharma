import { useState, useEffect } from "react";
import { FiCalendar, FiPhone, FiMoon } from "react-icons/fi";
import { getGardes } from "../../api.js";
import styles from "./Gardes.module.css";

function formaterDate(dateString) {
  const date = new Date(dateString.replace(" ", "T"));
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day:     "numeric",
    month:   "long",
  });
}

function formaterHeure(dateString) {
  const date = new Date(dateString.replace(" ", "T"));
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formaterTel(tel) {
  // Formater un numéro sénégalais : 338221100 → +221 33 822 11 00
  if (!tel) return null;
  const t = tel.replace(/\D/g, "");
  if (t.length === 9) {
    return `+221 ${t.slice(0,2)} ${t.slice(2,5)} ${t.slice(5,7)} ${t.slice(7,9)}`;
  }
  return tel;
}

export default function Gardes() {
  const [gardes, setGardes]           = useState([]);
  const [telPharmacie, setTelPharmacie] = useState(null);
  const [chargement, setChargement]   = useState(true);
  const [erreur, setErreur]           = useState(null);

  useEffect(() => {
    chargerGardes();
  }, []);

  const chargerGardes = async () => {
    try {
      setChargement(true);
      const res = await getGardes();
      setGardes(res.data.gardes);
      setTelPharmacie(res.data.tel_pharmacie);
    } catch (e) {
      setErreur("Impossible de charger les gardes.");
    } finally {
      setChargement(false);
    }
  };

  if (chargement) {
    return <div className={styles.chargement}>Chargement...</div>;
  }

  if (erreur) {
    return <div className={styles.erreurBanner}>{erreur}</div>;
  }

  const maintenant     = new Date();
  const prochaineGarde = gardes[0] || null;
  const esteDeGardeNow = prochaineGarde
    ? new Date(prochaineGarde.date_debut.replace(" ", "T")) <= maintenant &&
      new Date(prochaineGarde.date_fin.replace(" ", "T"))   >= maintenant
    : false;

  return (
    <div className={styles.page}>

      {/* Bandeau prochaine garde */}
      {prochaineGarde ? (
        <div className={styles.bandeauGarde}>
          <div className={styles.bandeauGauche}>
            <div className={styles.bandeauIcone}>
              <FiMoon size={20} />
            </div>
            <div>
              <p className={styles.bandeauLabel}>Prochaine garde</p>
              <p className={styles.bandeauDate}>
                {formaterDate(prochaineGarde.date_debut)} · {formaterHeure(prochaineGarde.date_debut)} — {formaterHeure(prochaineGarde.date_fin)}
              </p>
            </div>
          </div>
          {esteDeGardeNow && (
            <span className={styles.badgeDeGarde}>De garde ce soir</span>
          )}
        </div>
      ) : (
        <div className={styles.aucuneGarde}>
          Aucune garde programmée pour le moment.
        </div>
      )}

      {/* Calendrier des gardes */}
      {gardes.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.titreSection}>
            <span className={styles.puce} /> Calendrier des gardes
          </h2>

          <div className={styles.listeGardes}>
            {gardes.map((garde, index) => {
              const debut     = new Date(garde.date_debut.replace(" ", "T"));
              const fin       = new Date(garde.date_fin.replace(" ", "T"));
              const estActive = debut <= maintenant && fin >= maintenant;
              const estAVenir = debut > maintenant;

              return (
                <div key={garde.id_garde} className={styles.ligneGarde}>
                  <div className={styles.ligneGauche}>
                    <div className={styles.iconeGarde}>
                      <FiCalendar size={18} />
                    </div>
                    <div>
                      <p className={styles.dateGarde}>{formaterDate(garde.date_debut)}</p>
                      <p className={styles.heureGarde}>
                        {formaterHeure(garde.date_debut)} — {formaterHeure(garde.date_fin)}
                      </p>
                    </div>
                  </div>

                  {estActive && (
                    <span className={styles.badgeActive}>En cours</span>
                  )}
                  {estAVenir && index === 0 && (
                    <span className={styles.badgeAVenir}>À venir</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Numéro de garde */}
      {telPharmacie && (
        <div className={styles.numeroGarde}>
          <div className={styles.numeroIcone}>
            <FiPhone size={18} />
          </div>
          <div>
            <p className={styles.numeroTitre}>Numéro de garde</p>
            <p className={styles.numeroDesc}>
              Pendant vos gardes, les patients peuvent vous joindre au{" "}
              <span className={styles.numeroTel}>{formaterTel(telPharmacie)}</span>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}