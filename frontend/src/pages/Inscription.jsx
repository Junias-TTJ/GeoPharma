import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { inscription } from "../api.js";
import { FiEye, FiEyeOff } from "react-icons/fi";
import styles from "./Connexion.module.css";
import logo from "../../../geopharma_logo_v2.svg";


export default function Inscription() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    mot_de_passe: "",
    confirmation: "",
  });
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);
  const [voirMdp, setVoirMdp] = useState(false);
  const [voirConfirmation, setVoirConfirmation] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErreur("");
  };

  const handleSubmit = async () => {
  if (!form.nom || !form.prenom || !form.telephone || !form.mot_de_passe || !form.confirmation) {
    setErreur("Veuillez remplir tous les champs obligatoires.");
    return;
  }
  if (form.mot_de_passe.length < 8) {
    setErreur("Le mot de passe doit contenir au moins 8 caractères.");
    return;
  }
  if (form.mot_de_passe !== form.confirmation) {
    setErreur("Les mots de passe ne correspondent pas.");
    return;
  }
  setChargement(true);
  try {
    await inscription({
      nom: form.nom,
      prenom: form.prenom,
      tel: form.telephone,
      email: form.email || null,
      mot_de_passe: form.mot_de_passe,
      role: "PATIENT",
    });
    navigate("/connexion");
  } catch (err) {
    setErreur(err.response?.data?.erreur || "Erreur lors de l'inscription.");
  } finally {
    setChargement(false);
  }
};

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        <div className={styles.logoZone}>
          <img
            src={logo}
            alt="GeoPharma - Vos médicaments, où que vous soyez"
            className={styles.logo}
          />
        </div>

        <h2 className={styles.titre}>Créer un compte</h2>

        <div className={styles.champZone}>
          <label className={styles.label}>Nom</label>
          <input
            className={styles.input}
            type="text"
            name="nom"
            placeholder="Diallo"
            value={form.nom}
            onChange={handleChange}
          />
        </div>

        <div className={styles.champZone}>
          <label className={styles.label}>Prénom</label>
          <input
            className={styles.input}
            type="text"
            name="prenom"
            placeholder="Aminata"
            value={form.prenom}
            onChange={handleChange}
          />
        </div>

        <div className={styles.champZone}>
          <label className={styles.label}>Téléphone</label>
          <input
            className={styles.input}
            type="text"
            name="telephone"
            placeholder="Ex: +221 77 123 45 67"
            value={form.telephone}
            onChange={handleChange}
          />
        </div>

        <div className={styles.champZone}>
          <label className={styles.label}>Email (optionnel)</label>
          <input
            className={styles.input}
            type="email"
            name="email"
            placeholder="vous@exemple.com"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className={styles.champZone}>
          <label className={styles.label}>Mot de passe</label>
          <div className={styles.inputWrapper}>
            <input
              className={styles.input}
              type={voirMdp ? "text" : "password"}
              name="mot_de_passe"
              placeholder="Choisissez un mot de passe"
              value={form.mot_de_passe}
              onChange={handleChange}
            />
            <span className={styles.eyeIcon} onClick={() => setVoirMdp(!voirMdp)}>
              {voirMdp ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
        </div>

        <div className={styles.champZone}>
          <label className={styles.label}>Confirmer le mot de passe</label>
          <div className={styles.inputWrapper}>
            <input
              className={styles.input}
              type={voirConfirmation ? "text" : "password"}
              name="confirmation"
              placeholder="Retapez le mot de passe"
              value={form.confirmation}
              onChange={handleChange}
            />
            <span className={styles.eyeIcon} onClick={() => setVoirConfirmation(!voirConfirmation)}>
              {voirConfirmation ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
        </div>

        {erreur && <p className={styles.erreur}>{erreur}</p>}

        <button
          className={chargement ? styles.boutonDisabled : styles.bouton}
          onClick={handleSubmit}
          disabled={chargement}
        >
          {chargement ? "Création..." : "S'inscrire"}
        </button>

        <p className={styles.lienTexte}>
          Déjà un compte ?{" "}
          <span className={styles.lien} onClick={() => navigate("/connexion")}>
            Se connecter
          </span>
        </p>

      </div>
    </div>
  );
}