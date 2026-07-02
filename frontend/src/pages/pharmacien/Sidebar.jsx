import { FiPackage, FiClock, FiCalendar, FiBell, FiUser, FiLogOut } from "react-icons/fi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalConfirmation from "../livreur/ModalConfirmation.jsx";
import styles from "./Sidebar.module.css";
import logo from "../../../../geopharma_logo_v2.svg";

const NAV_ITEMS = [
  { id: "commandes",     label: "Commandes",    icone: FiPackage  },
  { id: "horaires",      label: "Horaires",     icone: FiClock    },
  { id: "gardes",        label: "Gardes",       icone: FiCalendar },
  { id: "notifications", label: "Notifications",icone: FiBell     },
  { id: "profil",        label: "Mon profil",   icone: FiUser     },
];

export default function Sidebar({ pharmacien, pageCourante, onNaviguer, nbNotificationsNonLues = 0 }) {
  const navigate = useNavigate();
  const [modalDeconnexion, setModalDeconnexion] = useState(false);

  const initiales = pharmacien?.prenom && pharmacien?.nom
    ? `${pharmacien.prenom[0]}${pharmacien.nom[0]}`.toUpperCase()
    : "??";

  const handleDeconnexion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/connexion");
  };

  return (
    <>
      {/* ---- Sidebar desktop ---- */}
      <aside className={styles.sidebar}>
        <div className={styles.haut}>
          <div className={styles.logoZone}>
            <img src={logo} alt="GeoPharma" className={styles.logo} />
          </div>

          <div className={styles.profilZone}>
            <div className={styles.avatar}>{initiales}</div>
            <div>
              <p className={styles.nomPharmacien}>
                {pharmacien?.prenom} {pharmacien?.nom}
              </p>
              <span className={styles.badgeRole}>Pharmacien</span>
            </div>
          </div>

          <nav className={styles.nav}>
            {NAV_ITEMS.map(({ id, label, icone: Icone }) => (
              <button
                key={id}
                className={pageCourante === id ? styles.lienActif : styles.lien}
                onClick={() => onNaviguer(id)}
              >
                <Icone />
                <span className={styles.labelLien}>{label}</span>
                {id === "notifications" && nbNotificationsNonLues > 0 && (
                  <span className={styles.badgeNav}>
                    {nbNotificationsNonLues > 9 ? "9+" : nbNotificationsNonLues}
                  </span>
                )}
              </button>
            ))}

            <button className={styles.lienDeconnexion} onClick={() => setModalDeconnexion(true)}>
              <FiLogOut /> Se déconnecter
            </button>
          </nav>
        </div>
      </aside>

      {/* ---- Header mobile (identique livreur) ---- */}
      <header className={styles.headerMobile}>
        <img src={logo} alt="GeoPharma" className={styles.logoMobile} />
        <div className={styles.headerMobileDroite}>
          <span className={styles.badgeRole}>Pharmacien</span>
          <div className={styles.avatarMobile}>{initiales}</div>
        </div>
      </header>

      {/* ---- Nav mobile en bas ---- */}
      <nav className={styles.navMobile}>
        {NAV_ITEMS.map(({ id, label, icone: Icone }) => (
          <button
            key={id}
            type="button"
            className={pageCourante === id ? styles.navMobileItemActif : styles.navMobileItem}
            onClick={() => onNaviguer(id)}
          >
            <span className={styles.navMobileIconeZone}>
              <Icone size={19} />
              {id === "notifications" && nbNotificationsNonLues > 0 && (
                <span className={styles.badgeNavMobile}>
                  {nbNotificationsNonLues > 9 ? "9+" : nbNotificationsNonLues}
                </span>
              )}
            </span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {modalDeconnexion && (
        <ModalConfirmation
          titre="Se déconnecter"
          message="Voulez-vous vraiment vous déconnecter de votre compte ?"
          labelConfirmer="Se déconnecter"
          danger={false}
          onConfirmer={handleDeconnexion}
          onAnnuler={() => setModalDeconnexion(false)}
        />
      )}
    </>
  );
}