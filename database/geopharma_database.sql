-- ============================================================
-- GEOPHARMA - SCRIPT DE CREATION DE LA BASE DE DONNEES
-- Projet Tutore L2 GLSI A - ESP/UCAD - Juin 2026
-- ============================================================
-- Equipe : Mame Diarra Bousso Dioum, Junias Tiamnang Tiogang,
--          Khadyja Camara
-- ============================================================

CREATE DATABASE geopharma;
USE geopharma;

-- Creation des utilisateurs

CREATE TABLE Utilisateur (
    id_utilisateur  INT          PRIMARY KEY AUTO_INCREMENT,
    nom             VARCHAR(50)  NOT NULL,
    prenom          VARCHAR(50)  NOT NULL,
    tel             VARCHAR(20)  NOT NULL,
    email           VARCHAR(100) UNIQUE NOT NULL,
    mot_de_passe    VARCHAR(255) NOT NULL,
    role            ENUM('PATIENT','PHARMACIEN','LIVREUR','ADMINISTRATEUR') NOT NULL,
    date_creation   DATETIME     DEFAULT CURRENT_TIMESTAMP,
    statut_compte   ENUM('ACTIF','SUSPENDU','EN_ATTENTE_VALIDATION') DEFAULT 'EN_ATTENTE_VALIDATION'
);

CREATE TABLE Patient (
    id_patient  INT PRIMARY KEY,
    adresse         VARCHAR(150),
    latitude        DECIMAL(10,7),
    longitude       DECIMAL(10,7),
    FOREIGN KEY (id_patient) REFERENCES Utilisateur(id_utilisateur) ON DELETE CASCADE
);

CREATE TABLE Livreur (
    id_livreur  INT PRIMARY KEY,
    id_pharmacie    INT NOT NULL,
    FOREIGN KEY (id_livreur) REFERENCES Utilisateur(id_utilisateur) ON DELETE CASCADE
);

CREATE TABLE Pharmacien (
    id_pharmacien  INT PRIMARY KEY,
    FOREIGN KEY (id_pharmacien) REFERENCES Utilisateur(id_utilisateur) ON DELETE CASCADE
);

CREATE TABLE Administrateur (
    id_administrateur  INT PRIMARY KEY,
    FOREIGN KEY (id_administrateur) REFERENCES Utilisateur(id_utilisateur) ON DELETE CASCADE
);


-- Creation des tables : PHARMACIE, HORAIRES & GARDES

CREATE TABLE Pharmacie (
    id_pharmacie    INT           PRIMARY KEY AUTO_INCREMENT,
    nom             VARCHAR(100)  NOT NULL,
    adresse         VARCHAR(150)  NOT NULL,
    latitude        DECIMAL(10,7) NOT NULL,
    longitude       DECIMAL(10,7) NOT NULL,
    tel             VARCHAR(20)   NOT NULL,
    statut          ENUM('OUVERTE','GARDE','FERMEE') DEFAULT 'FERMEE',
    est_active      BOOLEAN       DEFAULT FALSE,
    id_pharmacien   INT           UNIQUE,
    FOREIGN KEY (id_pharmacien) REFERENCES Pharmacien(id_pharmacien) ON DELETE SET NULL
);

ALTER TABLE Livreur
    ADD CONSTRAINT fk_livreur_pharmacie
    FOREIGN KEY (id_pharmacie) REFERENCES Pharmacie(id_pharmacie) ON DELETE CASCADE;

CREATE TABLE Horaire (
    id_horaire       INT PRIMARY KEY AUTO_INCREMENT,
    jour_semaine     ENUM('LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI','SAMEDI','DIMANCHE') NOT NULL,
    heure_ouverture  TIME NOT NULL,
    heure_fermeture  TIME NOT NULL,
    id_pharmacie     INT  NOT NULL,
    FOREIGN KEY (id_pharmacie) REFERENCES Pharmacie(id_pharmacie) ON DELETE CASCADE
);

CREATE TABLE Garde (
    id_garde      INT      PRIMARY KEY AUTO_INCREMENT,
    date_debut    DATETIME NOT NULL,
    date_fin      DATETIME NOT NULL,
    active        BOOLEAN  DEFAULT TRUE,
    validee       BOOLEAN  DEFAULT FALSE,
    id_pharmacie  INT      NOT NULL,
    FOREIGN KEY (id_pharmacie) REFERENCES Pharmacie(id_pharmacie) ON DELETE CASCADE
);


-- Creation des tables COMMANDE, ORDONNANCE, NOTIFICATION


CREATE TABLE Commande (
    id_commande       INT     PRIMARY KEY AUTO_INCREMENT,
    mode              ENUM('RETRAIT','LIVRAISON') NOT NULL,
    statut            ENUM('EN_ATTENTE','ACCEPTEE','REFUSEE','EN_LIVRAISON','LIVREE') DEFAULT 'EN_ATTENTE',
    motif_refus       VARCHAR(255),
    adresse_livraison VARCHAR(255),
    date_commande     DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_patient        INT      NOT NULL,
    id_pharmacie      INT      NOT NULL,
    id_livreur        INT,
    FOREIGN KEY (id_patient)   REFERENCES Patient(id_patient)  ON DELETE CASCADE,
    FOREIGN KEY (id_pharmacie) REFERENCES Pharmacie(id_pharmacie)  ON DELETE CASCADE,
    FOREIGN KEY (id_livreur)   REFERENCES Livreur(id_livreur)  ON DELETE SET NULL
);

CREATE TABLE Ordonnance (
    id_ordonnance  INT          PRIMARY KEY AUTO_INCREMENT,
    fichier        VARCHAR(255) NOT NULL,
    type_fichier   ENUM('IMAGE','PDF') NOT NULL,
    date_upload    DATETIME     DEFAULT CURRENT_TIMESTAMP,
    id_patient     INT          NOT NULL,
    id_commande    INT,
    FOREIGN KEY (id_patient)  REFERENCES Patient(id_patient) ON DELETE CASCADE,
    FOREIGN KEY (id_commande) REFERENCES Commande(id_commande)   ON DELETE SET NULL
);

CREATE TABLE Notification (
    id_notification  INT          PRIMARY KEY AUTO_INCREMENT,
    message          VARCHAR(255) NOT NULL,
    type             VARCHAR(50)  NOT NULL,
    date_envoi       DATETIME     DEFAULT CURRENT_TIMESTAMP,
    lue              BOOLEAN      DEFAULT FALSE,
    id_utilisateur   INT          NOT NULL,
    id_commande      INT,
    FOREIGN KEY (id_utilisateur) REFERENCES Utilisateur(id_utilisateur) ON DELETE CASCADE,
    FOREIGN KEY (id_commande)    REFERENCES Commande(id_commande)        ON DELETE SET NULL
);



-- TEST


INSERT INTO Utilisateur (nom, prenom, tel, email, mot_de_passe, role, statut_compte) VALUES
('Ndiaye',  'Mary',    '772581473', 'mary.ndiaye@mail.com',  'hash_pwd_1', 'PATIENT',        'ACTIF'),
('Diop',    'Moussa',  '770228796', 'moussa.diop@mail.com',  'hash_pwd_2', 'PHARMACIEN',     'ACTIF'),
('Fall',    'Assane',  '774778595', 'assane.fall@mail.com',  'hash_pwd_3', 'LIVREUR',        'ACTIF'),
('Camara',  'Khadyja', '770000000', 'admin@geopharma.sn',    'hash_pwd_4', 'ADMINISTRATEUR', 'ACTIF');

INSERT INTO Patient (id_patient, adresse, latitude, longitude) VALUES
(1, 'Mermoz, Dakar', 14.7167, -17.4677);

INSERT INTO Pharmacien (id_pharmacien) VALUES (2);

INSERT INTO Administrateur (id_administrateur) VALUES (4);

INSERT INTO Pharmacie (nom, adresse, latitude, longitude, tel, statut, est_active, id_pharmacien) VALUES
('Pharmacie Lat Dior', 'Rue Carnot, Dakar', 14.6928, -17.4467, '338221100', 'GARDE', TRUE, 2);

INSERT INTO Livreur (id_livreur, id_pharmacie) VALUES
(3, 1);

INSERT INTO Horaire (jour_semaine, heure_ouverture, heure_fermeture, id_pharmacie) VALUES
('LUNDI', '08:00:00', '20:00:00', 1),
('MARDI', '08:00:00', '20:00:00', 1);

INSERT INTO Garde (date_debut, date_fin, active, validee, id_pharmacie) VALUES
('2026-06-25 20:00:00', '2026-06-26 08:00:00', TRUE, TRUE, 1);

INSERT INTO Commande (mode, statut, adresse_livraison, id_patient, id_pharmacie, id_livreur) VALUES
('LIVRAISON', 'EN_LIVRAISON', 'Mermoz, Dakar', 1, 1, 3);

INSERT INTO Ordonnance (fichier, type_fichier, id_patient, id_commande) VALUES
('ordo_mary.jpg', 'IMAGE', 1, 1);

INSERT INTO Notification (message, type, id_utilisateur, id_commande) VALUES
('Votre commande a ete acceptee', 'ACCEPTATION', 1, 1);


-- Modifier email : nullable
ALTER TABLE Utilisateur 
MODIFY COLUMN email VARCHAR(100) UNIQUE;

-- Modifier tel : UNIQUE NOT NULL
ALTER TABLE Utilisateur 
MODIFY COLUMN tel VARCHAR(20) UNIQUE NOT NULL;
