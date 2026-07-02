import { useState } from "react";
import { FiUser, FiLock, FiAlertTriangle, FiEye, FiEyeOff } from "react-icons/fi";
import ModalConfirmation from "../livreur/ModalConfirmation.jsx";
import { modifierInfos, modifierMdp, supprimerCompte } from "../../api.js";
import styles from "./ProfilPharmacien.module.css";

export default function ProfilPharmacien({ pharmacien }) {
  const [form, setForm] = useState({
    prenom:    pharmacien?.prenom    || "",
    nom:       pharmacien?.nom       || "",
    telephone: pharmacien?.telephone || "",
    email:     pharmacien?.email     || "",
  });

  const [mdp, setMdp] = useState({
    actuel:    "",
    nouveau:   "",
    confirmer: "",
  });

  const [visible, setVisible] = useState({
    actuel:    false,
    nouveau:   false,
    confirmer: false,
  });

  const [modal, setModal]     = useState(null);
  const [erreurs, setErreurs] = useState({});
  const [succes, setSucces]   = useState(null);
  const [erreurApi, setErreurApi] = useState(null);

  const initiales = `${(pharmacien?.prenom || "?")[0]}${(pharmacien?.nom || "?")[0]}`.toUpperCase();

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
    if (!form.prenom.trim())    e.prenom    = "Le prénom est obligatoire";
    if (!form.nom.trim())       e.nom       = "Le nom est obligatoire";
    if (!form.telephone.trim()) e.telephone = "Le téléphone est obligatoire";
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  const validerMdp = () => {
    const e = {};
    if (!mdp.actuel)  e.actuel  = "Champ obligatoire";
    if (!mdp.nouveau) e.nouveau = "Champ obligatoire";
    else if (mdp.nouveau.length < 8) e.nouveau = "8 caractères minimum";
    if (!mdp.confirmer) e.confirmer = "Champ obligatoire";
    else if (mdp.nouveau !== mdp.confirmer) e.confirmer = "Les mots de passe ne correspondent pas";
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  const handleConfirmer = async () => {
    setErreurApi(null);
    try {
      if (modal === "infos") {
        await modifierInfos(form);
        // Mettre à jour le localStorage
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({
          ...user,
          nom:    form.nom,
          prenom: form.prenom,
        }));
        setSucces("Informations mises à jour avec succès.");
        setTimeout(() => setSucces(null), 3000);

      } else if (modal === "mdp") {
        await modifierMdp(mdp.actuel, mdp.nouveau, mdp.confirmer);
        setMdp({ actuel: "", nouveau: "", confirmer: "" });
        setSucces("Mot de passe mis à jour avec succès.");
        setTimeout(() => setSucces(null), 3000);

      } else if (modal === "suppression") {
        await supprimerCompte();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/connexion";
      }
    } catch (e) {
      setErreurApi(e.response?.data?.erreur || "Une erreur est survenue.");
    } finally {
      setModal(null);
    }
  };

  const MODALS = {
    infos: {
      titre:          "Confirmer les modifications",
      message:        "Voulez-vous enregistrer les modifications de vos informations personnelles ?",
      labelConfirmer: "Enregistrer",
      danger:         false,
    },
    mdp: {
      titre:          "Changer le mot de passe",
      message:        "Voulez-vous vraiment modifier votre mot de passe ?",
      labelConfirmer: "Mettre à jour",
      danger:         false,
    },
    deconnexion: {
      titre:          "Se déconnecter",
      message:        "Voulez-vous vraiment vous déconnecter de votre compte ?",
      labelConfirmer: "Se déconnecter",
      danger:         false,
    },
    suppression: {
      titre:          "Supprimer mon compte",
      message:        "Cette action est irréversible. Toutes vos données seront définitivement supprimées.",
      labelConfirmer: "Supprimer",
      danger:         true,
    },
  };

  return (
    <div className={styles.page}>
      <div className={styles.enTete}>
        <p className={styles.sousTitre}>Gérez vos informations personnelles et vos préférences</p>
      </div>

      {succes    && <div className={styles.succesBanner}>{succes}</div>}
      {erreurApi && <div className={styles.erreurBanner}>{erreurApi}</div>}

      {/* Carte identité */}
      <div className={styles.carteIdentite}>
        <div className={styles.avatar}>{initiales}</div>
        <div>
          <p className={styles.nomComplet}>{pharmacien?.prenom} {pharmacien?.nom}</p>
          <span className={styles.badgeRole}>Pharmacien</span>
          {pharmacien?.nom_pharmacie && (
            <p className={styles.nomPharmacie}>🏥 {pharmacien.nom_pharmacie}</p>
          )}
        </div>
      </div>

      {/* Informations personnelles */}
      <div className={styles.section}>
        <h2 className={styles.titreSection}>
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
        <button
          className={styles.boutonPrimaire}
          onClick={() => { if (validerInfos()) setModal("infos"); }}
        >
          Enregistrer les modifications
        </button>
      </div>

      {/* Sécurité */}
      <div className={styles.section}>
        <h2 className={styles.titreSection}>
          <FiLock /> Sécurité
        </h2>
        {["actuel", "nouveau", "confirmer"].map((champ) => (
          <div key={champ} className={styles.champMdp}>
            <label className={styles.label}>
              {champ === "actuel"    ? "Mot de passe actuel"            : ""}
              {champ === "nouveau"   ? "Nouveau mot de passe"           : ""}
              {champ === "confirmer" ? "Confirmer le nouveau mot de passe" : ""}
            </label>
            <div className={styles.inputMdpZone}>
              <input
                className={`${styles.input} ${erreurs[champ] ? styles.inputErreur : ""}`}
                type={visible[champ] ? "text" : "password"}
                name={champ}
                value={mdp[champ]}
                placeholder={champ === "nouveau" ? "8 caractères minimum" : ""}
                onChange={handleChangeMdp}
              />
              <button
                className={styles.oeil}
                onClick={() => setVisible({ ...visible, [champ]: !visible[champ] })}
              >
                {visible[champ] ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {erreurs[champ] && <span className={styles.erreur}>{erreurs[champ]}</span>}
          </div>
        ))}
        <button
          className={styles.boutonPrimaire}
          onClick={() => { if (validerMdp()) setModal("mdp"); }}
        >
          Mettre à jour
        </button>
      </div>

      {/* Zone de danger */}
      <div className={styles.zoneDanger}>
        <h2 className={styles.titreDanger}>
          <FiAlertTriangle /> Zone de danger
        </h2>
        <div className={styles.ligneDanger}>
          <div>
            <p className={styles.labelDanger}>Supprimer mon compte</p>
            <p className={styles.descDanger}>
              Cette action est irréversible. Toutes vos données seront supprimées.
            </p>
          </div>
          <button
            className={styles.boutonSupprimer}
            onClick={() => setModal("suppression")}
          >
            Supprimer mon compte
          </button>
        </div>
      </div>

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