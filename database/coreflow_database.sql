-- ============================================================
-- CoreFlow - Base de données unifiée pour l'équipe
-- Version : 1.0 | Date : 2026-03-06
-- À importer par tous les membres de l'équipe
-- Commande : mysql -u root -p coreflow < coreflow_database.sql
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
SET NAMES utf8mb4;

-- ------------------------------------------------------------
-- Création de la base de données
-- ------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `coreflow`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `coreflow`;

-- ------------------------------------------------------------
-- Table : utilisateurs
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `utilisateurs`;
CREATE TABLE `utilisateurs` (
  `id`           INT            NOT NULL AUTO_INCREMENT,
  `email`        VARCHAR(255)   NOT NULL,
  `password`     VARCHAR(255)   NOT NULL,
  `nom`          VARCHAR(100)   NOT NULL,
  `prenom`       VARCHAR(100)   NOT NULL,
  `role`         ENUM('admin','rh','manager','employe') NOT NULL DEFAULT 'employe',
  `departement`  VARCHAR(100)   DEFAULT NULL,
  `poste`        VARCHAR(100)   DEFAULT NULL,
  `telephone`    VARCHAR(20)    DEFAULT NULL,
  `date_embauche` DATE          DEFAULT NULL,
  `est_actif`    TINYINT(1)     DEFAULT '1',
  `created_at`   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `departement_email` VARCHAR(255)   NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email`    (`email`),
  KEY `idx_role`     (`role`),
  KEY `idx_est_actif`(`est_actif`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Données de test standardisées
-- IMPORTANT : Les mots de passe ci-dessous sont en clair pour les tests.
-- En production, ils doivent être hashés (bcrypt) côté Node.js.
-- Mots de passe : Admin -> @dmiN1234 | RH -> Rh_1234 | Manager -> Manager_1234 | Employé -> Employe_1234
INSERT INTO `utilisateurs` (`id`, `email`, `password`, `nom`, `prenom`, `role`, `departement`, `poste`, `telephone`, `date_embauche`, `est_actif`) VALUES
(1, 'admin@coreflow.fr',   '$2b$10$adminHashPlaceholder000000000000000000000000000000000000', 'Admin',  'CoreFlow', 'admin',   'Informatique',       'Administrateur Système', '01 23 45 67 89', '2024-01-01', 1),
(2, 'rh@coreflow.fr',      '$2b$10$rhHashPlaceholder0000000000000000000000000000000000000000', 'Martin', 'Marie',    'rh',      'Ressources Humaines', 'Responsable RH',         '01 23 45 67 90', '2024-02-01', 1),
(3, 'manager@coreflow.fr', '$2b$10$managerHashPlaceholder00000000000000000000000000000000000', 'Dubois', 'Pierre',   'manager', 'IT',                  'Manager IT',             '01 23 45 67 91', '2024-03-01', 1),
(4, 'employe@coreflow.fr', '$2b$10$employeHashPlaceholder00000000000000000000000000000000000', 'Durand', 'Sophie',   'employe', 'Commercial',          'Commerciale',            '01 23 45 67 92', '2024-04-01', 1);

-- ------------------------------------------------------------
-- Table : tickets
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `tickets`;
CREATE TABLE `tickets` (
  `id`             INT          NOT NULL AUTO_INCREMENT,
  `titre`          VARCHAR(255) NOT NULL,
  `description`    TEXT         NOT NULL,
  `categorie`      ENUM('it','rh','comptabilite','direction','autre') DEFAULT 'autre',
  `priorite`       ENUM('basse','normale','haute','urgente')          DEFAULT 'normale',
  `statut`         ENUM('ouvert','en_cours','resolu','ferme')         DEFAULT 'ouvert',
  `demandeur_id`   INT          NOT NULL,
  `assigne_a_id`   INT          DEFAULT NULL,
  `date_resolution` TIMESTAMP   DEFAULT NULL,
  `created_at`     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_demandeur` (`demandeur_id`),
  KEY `idx_assigne`   (`assigne_a_id`),
  KEY `idx_statut`    (`statut`),
  KEY `idx_categorie` (`categorie`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `tickets` (`id`, `titre`, `description`, `categorie`, `priorite`, `statut`, `demandeur_id`, `assigne_a_id`) VALUES
(1, 'Problème imprimante',    'L\'imprimante du 2ème étage ne fonctionne plus',        'it', 'normale',  'ouvert',   4, 3),
(2, 'Question sur fiche de paie', 'Incompréhension sur une ligne de ma fiche de paie', 'rh', 'haute',    'en_cours', 4, 2),
(3, 'Accès VPN',              'Impossible de me connecter au VPN depuis ce matin',     'it', 'urgente',  'ouvert',   3, NULL);

-- ------------------------------------------------------------
-- Table : commentaires
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `commentaires`;
CREATE TABLE `commentaires` (
  `id`          INT       NOT NULL AUTO_INCREMENT,
  `ticket_id`   INT       NOT NULL,
  `user_id`     INT       NOT NULL,
  `contenu`     TEXT      NOT NULL,
  `est_interne` TINYINT(1) DEFAULT '0',
  `created_at`  TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ticket` (`ticket_id`),
  KEY `idx_user`   (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `commentaires` (`id`, `ticket_id`, `user_id`, `contenu`, `est_interne`) VALUES
(1, 1, 3, 'J\'envoie un technicien cet après-midi', 0),
(2, 2, 2, 'Pouvez-vous passer me voir demain matin ?', 0),
(3, 2, 4, 'D\'accord, je passe à 10h', 0),
(4, 3, 3, 'Vérifiez que votre mot de passe n\'a pas expiré', 0);

-- ------------------------------------------------------------
-- Table : conges
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `conges`;
CREATE TABLE `conges` (
  `id`                     INT  NOT NULL AUTO_INCREMENT,
  `user_id`                INT  NOT NULL,
  `type_conge`             ENUM('conge_paye','rtt','maladie','sans_solde') NOT NULL DEFAULT 'conge_paye',
  `date_debut`             DATE NOT NULL,
  `date_fin`               DATE NOT NULL,
  `nb_jours`               INT  NOT NULL,
  `motif`                  TEXT DEFAULT NULL,
  `statut`                 ENUM('en_attente','approuve','refuse') DEFAULT 'en_attente',
  `validateur_id`          INT  DEFAULT NULL,
  `date_validation`        TIMESTAMP DEFAULT NULL,
  `commentaire_validateur` TEXT DEFAULT NULL,
  `created_at`             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`             TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `validateur_id`  (`validateur_id`),
  KEY `idx_user_id`    (`user_id`),
  KEY `idx_statut`     (`statut`),
  KEY `idx_dates`      (`date_debut`, `date_fin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `conges` (`id`, `user_id`, `type_conge`, `date_debut`, `date_fin`, `nb_jours`, `motif`, `statut`, `validateur_id`, `date_validation`) VALUES
(1, 4, 'conge_paye', '2026-02-10', '2026-02-14', 5, 'Vacances familiales',  'approuve',   2, '2026-01-20 09:30:00'),
(2, 3, 'rtt',        '2026-02-20', '2026-02-20', 1, 'Rendez-vous médical',  'en_attente', NULL, NULL),
(3, 4, 'maladie',    '2026-01-15', '2026-01-17', 3, 'Grippe',               'approuve',   2, '2026-01-15 13:00:00');

-- ------------------------------------------------------------
-- Table : soldes_conges
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `soldes_conges`;
CREATE TABLE `soldes_conges` (
  `id`                  INT NOT NULL AUTO_INCREMENT,
  `user_id`             INT NOT NULL,
  `conges_payes_total`  INT DEFAULT '25',
  `conges_payes_pris`   INT DEFAULT '0',
  `rtt_total`           INT DEFAULT '10',
  `rtt_pris`            INT DEFAULT '0',
  `annee`               INT NOT NULL,
  `created_at`          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_annee` (`user_id`, `annee`),
  KEY `idx_user_annee`  (`user_id`, `annee`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `soldes_conges` (`id`, `user_id`, `conges_payes_total`, `conges_payes_pris`, `rtt_total`, `rtt_pris`, `annee`) VALUES
(1, 1, 25, 0,  10, 0, 2026),
(2, 2, 25, 5,  10, 2, 2026),
(3, 3, 25, 3,  10, 1, 2026),
(4, 4, 25, 10, 10, 5, 2026);

-- ------------------------------------------------------------
-- Table : evenements
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `evenements`;
CREATE TABLE `evenements` (
  `id`               INT          NOT NULL AUTO_INCREMENT,
  `titre`            VARCHAR(255) NOT NULL,
  `description`      TEXT         DEFAULT NULL,
  `type_evenement`   ENUM('reunion','formation','afterwork','seminaire','autre') DEFAULT 'autre',
  `date_debut`       DATETIME     NOT NULL,
  `date_fin`         DATETIME     NOT NULL,
  `lieu`             VARCHAR(255) DEFAULT NULL,
  `organisateur_id`  INT          DEFAULT NULL,
  `est_obligatoire`  TINYINT(1)   DEFAULT '0',
  `nb_places_max`    INT          DEFAULT NULL,
  `statut`           ENUM('planifie','en_cours','termine','annule') DEFAULT 'planifie',
  `created_at`       DATETIME    DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `niveau`           ENUM('1','2') NOT NULL,
  `inviter`          TEXT;
  PRIMARY KEY (`id`),
  KEY `idx_organisateur` (`organisateur_id`),
  KEY `idx_dates`        (`date_debut`, `date_fin`),
  KEY `idx_statut`       (`statut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `evenements` (`id`, `titre`, `description`, `type_evenement`, `date_debut`, `date_fin`, `lieu`, `organisateur_id`, `est_obligatoire`, `nb_places_max`, `statut`) VALUES
(1, 'Réunion mensuelle',   'Point mensuel de l\'équipe',               'reunion',   '2026-02-20 10:00:00', '2026-02-20 12:00:00', 'Salle de réunion A',  1, 1, 20, 'planifie'),
(2, 'Afterwork d\'équipe', 'Soirée détente entre collègues',           'afterwork', '2026-02-25 18:00:00', '2026-02-25 22:00:00', 'Bar Le Central',      2, 0, 30, 'planifie'),
(3, 'Formation Sécurité',  'Formation obligatoire sécurité au travail','formation', '2026-03-05 09:00:00', '2026-03-05 17:00:00', 'Salle de formation',  1, 1, 50, 'planifie');

-- ------------------------------------------------------------
-- Table : participations
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `participations`;
CREATE TABLE `participations` (
  `id`            INT NOT NULL AUTO_INCREMENT,
  `evenement_id`  INT NOT NULL,
  `user_id`       INT NOT NULL,
  `statut`        ENUM('inscrit','confirme','absent','en_attente') DEFAULT 'inscrit',
  `commentaire`   TEXT DEFAULT NULL,
  `created_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_participation` (`evenement_id`, `user_id`),
  KEY `idx_evenement` (`evenement_id`),
  KEY `idx_user`      (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `participations` (`id`, `evenement_id`, `user_id`, `statut`) VALUES
(1, 1, 2, 'confirme'),
(2, 1, 3, 'confirme'),
(3, 1, 4, 'inscrit'),
(4, 2, 3, 'confirme'),
(5, 2, 4, 'confirme'),
(6, 3, 2, 'inscrit'),
(7, 3, 3, 'inscrit'),
(8, 3, 4, 'en_attente');

-- ------------------------------------------------------------
-- Table : documents
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `documents`;
CREATE TABLE `documents` (
  `id`           INT          NOT NULL AUTO_INCREMENT,
  `titre`        VARCHAR(255) NOT NULL,
  `type_fichier` VARCHAR(50)  DEFAULT NULL,
  `fichier_path` VARCHAR(500) NOT NULL,
  `taille`       INT          DEFAULT NULL,
  `description`  TEXT         DEFAULT NULL,
  `auteur_id`    INT          NOT NULL,
  `est_public`   TINYINT(1)   DEFAULT '0',
  `created_at`   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_auteur`    (`auteur_id`),
  KEY `idx_est_public`(`est_public`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table : jours_feries
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `jours_feries`;
CREATE TABLE `jours_feries` (
  `id`    INT          NOT NULL AUTO_INCREMENT,
  `date`  DATE         NOT NULL,
  `nom`   VARCHAR(100) NOT NULL,
  `annee` INT          NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `date`      (`date`),
  KEY    `idx_date`      (`date`),
  KEY    `idx_annee`     (`annee`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `jours_feries` (`id`, `date`, `nom`, `annee`) VALUES
(1,  '2026-01-01', 'Jour de l\'An',     2026),
(2,  '2026-04-06', 'Lundi de Pâques',   2026),
(3,  '2026-05-01', 'Fête du Travail',   2026),
(4,  '2026-05-08', 'Victoire 1945',     2026),
(5,  '2026-05-14', 'Ascension',         2026),
(6,  '2026-05-25', 'Lundi de Pentecôte',2026),
(7,  '2026-07-14', 'Fête Nationale',    2026),
(8,  '2026-08-15', 'Assomption',        2026),
(9,  '2026-11-01', 'Toussaint',         2026),
(10, '2026-11-11', 'Armistice 1918',    2026),
(11, '2026-12-25', 'Noël',              2026);

-- ------------------------------------------------------------
-- Clés étrangères
-- ------------------------------------------------------------
ALTER TABLE `commentaires`
  ADD CONSTRAINT `fk_commentaires_ticket` FOREIGN KEY (`ticket_id`)  REFERENCES `tickets`      (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_commentaires_user`   FOREIGN KEY (`user_id`)    REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE;

ALTER TABLE `conges`
  ADD CONSTRAINT `fk_conges_user`       FOREIGN KEY (`user_id`)       REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_conges_validateur` FOREIGN KEY (`validateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL;

ALTER TABLE `documents`
  ADD CONSTRAINT `fk_documents_auteur`  FOREIGN KEY (`auteur_id`)     REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE;

ALTER TABLE `evenements`
  ADD CONSTRAINT `fk_evenements_orga`   FOREIGN KEY (`organisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL;

ALTER TABLE `participations`
  ADD CONSTRAINT `fk_participations_event` FOREIGN KEY (`evenement_id`) REFERENCES `evenements`   (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_participations_user`  FOREIGN KEY (`user_id`)      REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE;

ALTER TABLE `soldes_conges`
  ADD CONSTRAINT `fk_soldes_user`       FOREIGN KEY (`user_id`)       REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE;

ALTER TABLE `tickets`
  ADD CONSTRAINT `fk_tickets_demandeur` FOREIGN KEY (`demandeur_id`)  REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tickets_assigne`   FOREIGN KEY (`assigne_a_id`)  REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL;

-- ------------------------------------------------------------
-- Vues
-- ------------------------------------------------------------
DROP VIEW IF EXISTS `v_conges_details`;
CREATE VIEW `v_conges_details` AS
  SELECT
    c.id, c.type_conge, c.date_debut, c.date_fin, c.nb_jours, c.motif, c.statut, c.created_at,
    u.id AS user_id, u.prenom AS user_prenom, u.nom AS user_nom,
    u.email AS user_email, u.departement AS user_departement,
    v.id AS validateur_id, v.prenom AS validateur_prenom, v.nom AS validateur_nom,
    c.date_validation, c.commentaire_validateur
  FROM conges c
  JOIN utilisateurs u ON c.user_id = u.id
  LEFT JOIN utilisateurs v ON c.validateur_id = v.id;

DROP VIEW IF EXISTS `v_users_stats`;
CREATE VIEW `v_users_stats` AS
  SELECT
    u.id, u.prenom, u.nom, u.email, u.role, u.departement, u.est_actif,
    COUNT(DISTINCT c.id) AS nb_conges,
    COUNT(DISTINCT t.id) AS nb_tickets,
    COUNT(DISTINCT p.id) AS nb_participations
  FROM utilisateurs u
  LEFT JOIN conges       c ON u.id = c.user_id
  LEFT JOIN tickets      t ON u.id = t.demandeur_id
  LEFT JOIN participations p ON u.id = p.user_id
  GROUP BY u.id;

COMMIT;

-- ============================================================
-- COMPTES DE TEST
-- ============================================================
-- | Rôle    | Email                  | Mot de passe   |
-- |---------|------------------------|----------------|
-- | Admin   | admin@coreflow.fr      | @dmiN1234      |
-- | RH      | rh@coreflow.fr         | Rh_1234        |
-- | Manager | manager@coreflow.fr    | Manager_1234   |
-- | Employé | employe@coreflow.fr    | Employe_1234   |
-- ============================================================
-- ⚠️  IMPORTANT : Les passwords dans cette seed sont des
-- placeholders. Lancez le script Node.js hash-passwords.js
-- pour les remplacer par de vrais hash bcrypt.
-- ============================================================