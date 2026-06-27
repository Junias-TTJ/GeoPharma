import { FiPackage, FiUser, FiLogOut } from "react-icons/fi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalConfirmation from "./ModalConfirmation.jsx";
import styles from "./Sidebar.module.css";
import logo from "../../../../geopharma_logo_v2.svg";

export default function Sidebar({ livreur, pageCourante, onNaviguer}) {
  const navigate = useNavigate();
  const [modalDeconnexion, setModalDeconnexion] = useState(false);

  const initiales = livreur?.prenom && livreur?.nom
    ? `${livreur.prenom[0]}${livreur.nom[0]}`.toUpperCase()
    : "??";

  const handleDeconnexion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/connexion");
  };

  

  return (
    <>
      <aside className={styles.sidebar}>
        <div className={styles.haut}>
          <div className={styles.logoZone}>
            <img src={logo} alt="GeoPharma" className={styles.logo} />
          </div>

          <div className={styles.profilZone}>
            <div className={styles.avatar}>{initiales}</div>
            <div>
              <p className={styles.nomLivreur}>
                {livreur?.prenom} {livreur?.nom}
              </p>
              <span className={styles.badgeRole}>Livreur</span>
            </div>
          </div>

          <nav className={styles.nav}>
            <button
                className={pageCourante === "livraisons" ? styles.lienActif : styles.lien}
                onClick={() => onNaviguer("livraisons")}
            >
              <FiPackage /> Mes livraisons
            </button>

            <button
              className={pageCourante === "profil" ? styles.lienActif : styles.lien}
              onClick={() => onNaviguer("profil")}
            >
              <FiUser /> Mon profil
            </button>

            <button className={styles.lienDeconnexion} onClick={() => setModalDeconnexion(true)}>
              <FiLogOut /> Se déconnecter
            </button>
          </nav>
        </div>
      </aside>

      <nav className={styles.navMobile}>
        <button
          type="button"
          className={pageCourante === "livraisons" ? styles.navMobileItemActif : styles.navMobileItem}
          onClick={() => onNaviguer("livraisons")}
        >
          <FiPackage size={20} />
          <span>Livraisons</span>
        </button>

        <button
          type="button"
          className={pageCourante === "profil" ? styles.navMobileItemActif : styles.navMobileItem}
          onClick={() => onNaviguer("profil")}
        >
          <FiUser size={20} />
          <span>Profil</span>
        </button>
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
