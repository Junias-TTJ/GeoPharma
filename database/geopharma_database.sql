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
    type_fichier   ENUM('IMAGE','PDF','TEXTE') NOT NULL,
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
('Ndiaye',  'Mary',    '772581473', 'mary.ndiaye@mail.com',  '$2y$10$0Qo/m/4AUZsL7kGxPjiuouBWieUlOB9zfQ/f1xeFOE0T2QOL5Qpke', 'PATIENT',        'ACTIF'),
('Diop',    'Moussa',  '770228796', 'moussa.diop@mail.com',  '$2y$10$0Qo/m/4AUZsL7kGxPjiuouBWieUlOB9zfQ/f1xeFOE0T2QOL5Qpke', 'PHARMACIEN',     'ACTIF'),
('Fall',    'Assane',  '774778595', 'assane.fall@mail.com',  '$2y$10$0Qo/m/4AUZsL7kGxPjiuouBWieUlOB9zfQ/f1xeFOE0T2QOL5Qpke', 'LIVREUR',        'ACTIF'),
('Camara',  'Khadyja', '770000000', 'admin@geopharma.sn',    '$2y$10$0Qo/m/4AUZsL7kGxPjiuouBWieUlOB9zfQ/f1xeFOE0T2QOL5Qpke', 'ADMINISTRATEUR', 'ACTIF');

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


-- Patients supplémentaires
INSERT INTO Utilisateur (nom, prenom, tel, email, mot_de_passe, role, statut_compte) VALUES
('Diallo',  'Fatou',    '771234568', 'fatou.diallo@mail.com',  '$2y$10$0Qo/m/4AUZsL7kGxPjiuouBWieUlOB9zfQ/f1xeFOE0T2QOL5Qpke', 'PATIENT', 'ACTIF'),
('Sow',     'Ibrahima', '772345678', 'ibrahima.sow@mail.com',  '$2y$10$0Qo/m/4AUZsL7kGxPjiuouBWieUlOB9zfQ/f1xeFOE0T2QOL5Qpke', 'PATIENT', 'ACTIF'),
('Ba',      'Amina',    '773456789', 'amina.ba@mail.com',      '$2y$10$0Qo/m/4AUZsL7kGxPjiuouBWieUlOB9zfQ/f1xeFOE0T2QOL5Qpke', 'PATIENT', 'ACTIF'),
('Faye',    'Omar',     '774567890', 'omar.faye@mail.com',     '$2y$10$0Qo/m/4AUZsL7kGxPjiuouBWieUlOB9zfQ/f1xeFOE0T2QOL5Qpke', 'PATIENT', 'ACTIF'),
('Mbaye',   'Rokhaya',  '775678901', 'rokhaya.mbaye@mail.com', '$2y$10$0Qo/m/4AUZsL7kGxPjiuouBWieUlOB9zfQ/f1xeFOE0T2QOL5Qpke', 'PATIENT', 'ACTIF');

-- Patient
INSERT INTO Patient (id_patient, adresse, latitude, longitude) VALUES
(12, 'Plateau, Dakar',             14.6928, -17.4467),
(13, 'HLM, Dakar',                 14.7100, -17.4500),
(14, 'Parcelles Assainies, Dakar', 14.7800, -17.4600),
(15, 'Grand Yoff, Dakar',          14.7500, -17.4550),
(16, 'Mermoz, Dakar',              14.7167, -17.4677);

-- Commandes
INSERT INTO Commande (mode, statut, adresse_livraison, date_commande, id_patient, id_pharmacie, id_livreur) VALUES
('LIVRAISON', 'ACCEPTEE', 'Plateau, Dakar',             '2026-06-30 09:30:00', 12, 1, 3),
('LIVRAISON', 'ACCEPTEE', 'HLM, Dakar',                 '2026-06-30 10:15:00', 13, 1, 3),
('LIVRAISON', 'LIVREE',   'Parcelles Assainies, Dakar', '2026-06-28 08:45:00', 14, 1, 3),
('RETRAIT',   'LIVREE',   NULL,                         '2026-06-27 11:00:00', 15, 1, 3),
('LIVRAISON', 'LIVREE',   'Grand Yoff, Dakar',          '2026-06-26 14:30:00', 16, 1, 3),
('LIVRAISON', 'LIVREE',   'Mermoz, Dakar',              '2026-06-25 09:00:00', 12, 1, 3),
('RETRAIT',   'LIVREE',   NULL,                         '2026-06-24 16:00:00', 13, 1, 3);

-- Ordonnances
INSERT INTO Ordonnance (fichier, type_fichier, id_patient, id_commande) VALUES
('ordo_fatou.jpg',    'IMAGE', 12, 2),
('ordo_ibrahima.jpg', 'IMAGE', 13, 3),
('ordo_amina.pdf',    'PDF',   14, 4),
('ordo_omar.jpg',     'IMAGE', 15, 5);

-- Notifications non lues pour le livreur (id = 3)
INSERT INTO Notification (message, type, lue, id_utilisateur, id_commande) VALUES
('Nouvelle commande assignée : Fatou Diallo - Plateau, Dakar', 'NOUVELLE_COMMANDE', 0, 3, 2),
('Nouvelle commande assignée : Ibrahima Sow - HLM, Dakar',    'NOUVELLE_COMMANDE', 0, 3, 3);


-- ============================================================
-- ALIMENTATION BDD - DASHBOARD PHARMACIEN
-- ============================================================

-- HORAIRES (compléter les 5 jours manquants, on a déjà Lundi=1 et Mardi=2)
INSERT INTO Horaire (jour_semaine, heure_ouverture, heure_fermeture, id_pharmacie) VALUES
('MERCREDI', '08:00:00', '20:00:00', 1),
('JEUDI',    '08:00:00', '20:00:00', 1),
('VENDREDI', '08:00:00', '20:00:00', 1),
('SAMEDI',   '09:00:00', '18:00:00', 1);
-- DIMANCHE fermé : pas de ligne = fermé

-- GARDES à venir (id_garde démarre à 2)
INSERT INTO Garde (date_debut, date_fin, active, validee, id_pharmacie) VALUES
('2026-07-03 21:00:00', '2026-07-04 08:00:00', TRUE, TRUE, 1),
('2026-07-12 21:00:00', '2026-07-13 08:00:00', TRUE, TRUE, 1),
('2026-07-20 08:00:00', '2026-07-21 08:00:00', TRUE, TRUE, 1),
('2026-07-31 21:00:00', '2026-08-01 08:00:00', TRUE, TRUE, 1);

-- COMMANDES (id_commande démarre à 9)
-- 2 EN_ATTENTE pour le pharmacien
INSERT INTO Commande (mode, statut, adresse_livraison, date_commande, id_patient, id_pharmacie) VALUES
('LIVRAISON', 'EN_ATTENTE', 'Mermoz, Dakar',   '2026-07-01 09:14:00', 1,  1),  -- id=9  Mary Ndiaye
('RETRAIT',   'EN_ATTENTE', NULL,               '2026-07-01 08:45:00', 12, 1);  -- id=10 Fatou Diallo

-- Commandes REFUSEE pour l'historique
INSERT INTO Commande (mode, statut, motif_refus, adresse_livraison, date_commande, id_patient, id_pharmacie) VALUES
('LIVRAISON', 'REFUSEE', 'Ordonnance illisible ou invalide', 'Plateau, Dakar', '2026-06-29 10:00:00', 13, 1),  -- id=11
('RETRAIT',   'REFUSEE', 'Rupture de stock',                 NULL,             '2026-06-28 14:00:00', 14, 1);  -- id=12

-- Commandes LIVREE pour l'historique
INSERT INTO Commande (mode, statut, adresse_livraison, date_commande, id_patient, id_pharmacie, id_livreur) VALUES
('LIVRAISON', 'LIVREE', 'Parcelles Assainies, Dakar', '2026-06-28 08:45:00', 15, 1, 3),  -- id=13
('RETRAIT',   'LIVREE', NULL,                         '2026-06-27 11:00:00', 16, 1, NULL); -- id=14

-- ORDONNANCES (id_ordonnance démarre à 6)
INSERT INTO Ordonnance (fichier, type_fichier, id_patient, id_commande) VALUES
('ordo_mary2.jpg',     'IMAGE', 1,  9),   -- commande EN_ATTENTE Mary
('ordo_fatou2.jpg',    'IMAGE', 12, 10),  -- commande EN_ATTENTE Fatou
('ordo_ibrahima2.jpg', 'IMAGE', 13, 11),  -- commande REFUSEE
('ordo_amina2.jpg',    'IMAGE', 15, 13);  -- commande LIVREE

-- NOTIFICATIONS (id_notification démarre à 4)
-- Pour le pharmacien (id=2)
INSERT INTO Notification (message, type, lue, id_utilisateur, id_commande) VALUES
-- Non lues
('Nouvelle commande de Mary Ndiaye - Livraison à domicile',  'NOUVELLE_COMMANDE',  0, 2, 9),   -- id=4
('Nouvelle commande de Fatou Diallo - Retrait en pharmacie', 'NOUVELLE_COMMANDE',  0, 2, 10),  -- id=5
-- Lues (historique)
('La commande #1 a été livrée à Mary Ndiaye.',               'LIVRAISON_TERMINEE', 1, 2, 1),   -- id=6
('Ibrahima Sow a annulé sa commande #11.',                   'COMMANDE_ANNULEE',   1, 2, 11),  -- id=7
('Votre garde de nuit commence demain à 21h00.',             'RAPPEL_GARDE',       1, 2, NULL); -- id=8