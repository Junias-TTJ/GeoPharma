import { useState } from "react";
import { FiUser, FiLock, FiAlertTriangle, FiEye, FiEyeOff } from "react-icons/fi";
import ModalConfirmation from "./ModalConfirmation.jsx";
import styles from "./ProfilLivreur.module.css";

const livreurTest = {
  prenom: "Ibrahima",
  nom: "Ndiaye",
  telephone: "+221 77 456 78 90",
  email: "ibrahima.ndiaye@geopharma.sn",
  nb_livraisons: 12,
};

export default function ProfilLivreur({ livreur = livreurTest, onDeconnexion }) {
  const [form, setForm] = useState({
    prenom: livreur.prenom,
    nom: livreur.nom,
    telephone: livreur.telephone,
    email: livreur.email,
  });

  const [mdp, setMdp] = useState({
    actuel: "",
    nouveau: "",
    confirmer: "",
  });

  const [visible, setVisible] = useState({
    actuel: false,
    nouveau: false,
    confirmer: false,
  });

  const [modal, setModal] = useState(null);
  const [erreurs, setErreurs] = useState({});

  const initiales = `${livreur.prenom[0]}${livreur.nom[0]}`.toUpperCase();

  const handleChangeForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErreurs({ ...erreurs, [e.target.name]: null });
  };

  const handleChangeMdp = (e) => {
    setMdp({ ...mdp, [e.target.name]: e.target.value });
    setErreurs({ ...erreurs, [e.target.name]: null });
  };

  const validerInfos = () => {
    const e = {};
    if (!form.prenom.trim()) e.prenom = "Le prénom est obligatoire";
    if (!form.nom.trim()) e.nom = "Le nom est obligatoire";
    if (!form.telephone.trim()) e.telephone = "Le téléphone est obligatoire";
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  const validerMdp = () => {
    const e = {};
    if (!mdp.actuel) e.actuel = "Champ obligatoire";
    if (!mdp.nouveau) e.nouveau = "Champ obligatoire";
    else if (mdp.nouveau.length < 8) e.nouveau = "8 caractères minimum";
    if (!mdp.confirmer) e.confirmer = "Champ obligatoire";
    else if (mdp.nouveau !== mdp.confirmer) e.confirmer = "Les mots de passe ne correspondent pas";
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  const handleConfirmer = () => {
    if (modal === "infos") {
      console.log("Infos mises à jour :", form);
    } else if (modal === "mdp") {
      console.log("Mot de passe mis à jour");
      setMdp({ actuel: "", nouveau: "", confirmer: "" });
    } else if (modal === "deconnexion") {
      onDeconnexion?.();
    } else if (modal === "suppression") {
      console.log("Compte supprimé");
    }
    setModal(null);
  };

  const MODALS = {
    infos: {
      titre: "Confirmer les modifications",
      message: "Voulez-vous enregistrer les modifications de vos informations personnelles ?",
      labelConfirmer: "Enregistrer",
      danger: false,
    },
    mdp: {
      titre: "Changer le mot de passe",
      message: "Voulez-vous vraiment modifier votre mot de passe ?",
      labelConfirmer: "Mettre à jour",
      danger: false,
    },
    deconnexion: {
      titre: "Se déconnecter",
      message: "Voulez-vous vraiment vous déconnecter de votre compte ?",
      labelConfirmer: "Se déconnecter",
      danger: false,
    },
    suppression: {
      titre: "Supprimer mon compte",
      message: "Cette action est irréversible. Toutes vos données seront définitivement supprimées.",
      labelConfirmer: "Supprimer",
      danger: true,
    },
  };

  return (
    <div className={styles.page}>
      <div className={styles.enTete}>
        <h1 className={styles.titre}>Mon profil</h1>
        <p className={styles.sousTitre}>Gérez vos informations personnelles et vos préférences</p>
      </div>

      {/* Carte identité */}
      <div className={styles.carteIdentite}>
        <div className={styles.avatar}>{initiales}</div>
        <div>
          <p className={styles.nomComplet}>{livreur.prenom} {livreur.nom}</p>
          <span className={styles.badgeRole}>Livreur</span>
          <p className={styles.nbLivraisons}>🛵 {livreur.nb_livraisons} livraisons effectuées</p>
        </div>
      </div>

      {/* Informations personnelles */}
      <div className={styles.section}>
        <h2 className={styles.titreSectionn}>
          <FiUser /> Informations personnelles
        </h2>
        <div className={styles.grille}>
          <div className={styles.champ}>
            <label className={styles.label}>Prénom</label>
            <input
              className={`${styles.input} ${erreurs.prenom ? styles.inputErreur : ""}`}
              name="prenom"
              value={form.prenom}
              onChange={handleChangeForm}
            />
            {erreurs.prenom && <span className={styles.erreur}>{erreurs.prenom}</span>}
          </div>
          <div className={styles.champ}>
            <label className={styles.label}>Nom</label>
            <input
              className={`${styles.input} ${erreurs.nom ? styles.inputErreur : ""}`}
              name="nom"
              value={form.nom}
              onChange={handleChangeForm}
            />
            {erreurs.nom && <span className={styles.erreur}>{erreurs.nom}</span>}
          </div>
          <div className={styles.champ}>
            <label className={styles.label}>Téléphone</label>
            <input
              className={`${styles.input} ${erreurs.telephone ? styles.inputErreur : ""}`}
              name="telephone"
              value={form.telephone}
              onChange={handleChangeForm}
            />
            {erreurs.telephone && <span className={styles.erreur}>{erreurs.telephone}</span>}
          </div>
          <div className={styles.champ}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              name="email"
              value={form.email}
              onChange={handleChangeForm}
            />
          </div>
        </div>
        <button className={styles.boutonPrimaire} onClick={() => { if (validerInfos()) setModal("infos"); }}>
          Enregistrer les modifications
        </button>
      </div>

      {/* Sécurité */}
      <div className={styles.section}>
        <h2 className={styles.titreSectionn}>
          <FiLock /> Sécurité
        </h2>
        <div className={styles.champMdp}>
          <label className={styles.label}>Mot de passe actuel</label>
          <div className={styles.inputMdpZone}>
            <input
              className={`${styles.input} ${erreurs.actuel ? styles.inputErreur : ""}`}
              type={visible.actuel ? "text" : "password"}
              name="actuel"
              value={mdp.actuel}
              onChange={handleChangeMdp}
            />
            <button className={styles.oeil} onClick={() => setVisible({ ...visible, actuel: !visible.actuel })}>
              {visible.actuel ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {erreurs.actuel && <span className={styles.erreur}>{erreurs.actuel}</span>}
        </div>
        <div className={styles.champMdp}>
          <label className={styles.label}>Nouveau mot de passe</label>
          <div className={styles.inputMdpZone}>
            <input
              className={`${styles.input} ${erreurs.nouveau ? styles.inputErreur : ""}`}
              type={visible.nouveau ? "text" : "password"}
              name="nouveau"
              placeholder="8 caractères minimum"
              value={mdp.nouveau}
              onChange={handleChangeMdp}
            />
            <button className={styles.oeil} onClick={() => setVisible({ ...visible, nouveau: !visible.nouveau })}>
              {visible.nouveau ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {erreurs.nouveau && <span className={styles.erreur}>{erreurs.nouveau}</span>}
        </div>
        <div className={styles.champMdp}>
          <label className={styles.label}>Confirmer le nouveau mot de passe</label>
          <div className={styles.inputMdpZone}>
            <input
              className={`${styles.input} ${erreurs.confirmer ? styles.inputErreur : ""}`}
              type={visible.confirmer ? "text" : "password"}
              name="confirmer"
              value={mdp.confirmer}
              onChange={handleChangeMdp}
            />
            <button className={styles.oeil} onClick={() => setVisible({ ...visible, confirmer: !visible.confirmer })}>
              {visible.confirmer ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {erreurs.confirmer && <span className={styles.erreur}>{erreurs.confirmer}</span>}
        </div>
        <button className={styles.boutonPrimaire} onClick={() => { if (validerMdp()) setModal("mdp"); }}>
          Mettre à jour
        </button>
      </div>

      {/* Déconnexion mobile */}
      <button className={styles.boutonDeconnexion} onClick={() => setModal("deconnexion")}>
        Se déconnecter
      </button>

      {/* Zone de danger */}
      <div className={styles.zoneDanger}>
        <h2 className={styles.titreDanger}>
          <FiAlertTriangle /> Zone de danger
        </h2>
        <div className={styles.ligneDanger}>
          <div>
            <p className={styles.labelDanger}>Supprimer mon compte</p>
            <p className={styles.descDanger}>Cette action est irréversible. Toutes vos données seront supprimées.</p>
          </div>
          <button className={styles.boutonSupprimer} onClick={() => setModal("suppression")}>
            Supprimer mon compte
          </button>
        </div>
      </div>

      {/* Modale */}
      {modal && (
        <ModalConfirmation
          {...MODALS[modal]}
          onConfirmer={handleConfirmer}
          onAnnuler={() => setModal(null)}
        />
      )}
    </div>
  );
}