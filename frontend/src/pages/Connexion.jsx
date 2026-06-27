import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { connexion } from "../api.js";
import { FiEye, FiEyeOff } from "react-icons/fi";
import styles from "./Connexion.module.css";
import logo from "../../../geopharma_logo_v2.svg";

export default function Connexion() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ telephone: "", mot_de_passe: "" });
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);
  const [voirMdp, setVoirMdp] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErreur("");
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    console.log("handleSubmit déclenché");
    if (!form.telephone || !form.mot_de_passe) {
      setErreur("Veuillez remplir tous les champs.");
      return;
    }
    setChargement(true);
    try {
      const res = await connexion(form.telephone, form.mot_de_passe);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      const role = res.data.user.role;
      if (role === "PATIENT") navigate("/");
      else if (role === "PHARMACIEN") navigate("/dashboard-pharmacien");
      else if (role === "LIVREUR") navigate("/dashboard-livreur");
      else if (role === "ADMINISTRATEUR") navigate("/dashboard-admin");

    } catch (err) {
      setErreur(err.response?.data?.erreur || "Erreur de connexion.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>

        <div className={styles.logoZone}>
          <img src={logo} alt="GeoPharma" className={styles.logo} />
        </div>

        <h2 className={styles.titre}>Connexion</h2>

        <div className={styles.champZone}>
          <label className={styles.label}>Téléphone ou email</label>
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
          <label className={styles.label}>Mot de passe</label>
          <div className={styles.inputWrapper}>
            <input
              className={styles.input}
              type={voirMdp ? "text" : "password"}
              name="mot_de_passe"
              placeholder="Votre mot de passe"
              value={form.mot_de_passe}
              onChange={handleChange}
            />
            <span
              className={styles.eyeIcon}
              onClick={() => setVoirMdp(!voirMdp)}
            >
              {voirMdp ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
        </div>

        {erreur && <p className={styles.erreur}>{erreur}</p>}

        <button
          type="submit"
          className={chargement ? styles.boutonDisabled : styles.bouton}
          disabled={chargement}
        >
          {chargement ? "Connexion..." : "Se connecter"}
        </button>

        <p className={styles.lienTexte}>
          Pas encore de compte ?{" "}
          <span
            className={styles.lien}
            onClick={() => navigate("/inscription")}
          >
            S'inscrire
          </span>
        </p>

      </form>
    </div>
  );
}
