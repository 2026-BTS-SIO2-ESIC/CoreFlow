# 📦 CoreFlow — Base de données

Ce dossier contient la base de données **officielle et unifiée** du projet CoreFlow.  
Tout le monde doit utiliser **cette version** — ne pas utiliser votre ancienne BDD locale.

---

## 📁 Contenu du dossier

```
database/
├── coreflow_database.sql   ← Script complet (structure + données de test)
├── hash-passwords.js       ← Script Node.js pour hasher les mots de passe
└── README.md               ← Ce fichier
```

---

## 🚀 Installation (à faire une seule fois)

### Étape 1 — Importer la base de données

Ouvre un terminal et exécute :

```bash
mysql -u root -p -e "DROP DATABASE IF EXISTS coreflow;"
mysql -u root -p < database/coreflow_database.sql
```

> Si tu n'as pas de mot de passe MySQL, retire le `-p`.

Ou depuis **phpMyAdmin** :
1. Supprime la base `coreflow` si elle existe déjà
2. Crée une nouvelle base nommée `coreflow` en utf8mb4_unicode_ci
3. Importe le fichier `coreflow_database.sql`

---

### Étape 2 — Configurer le fichier .env

À la racine du projet back-end :

```bash
cp .env.example .env
```

Puis édite `.env` avec tes valeurs locales (DB_USER, DB_PASSWORD, etc.).

---

### Étape 3 — Hasher les mots de passe

```bash
cd database
node hash-passwords.js
```

> Ce script doit être lancé **une seule fois** après l'import SQL.  
> Il remplace les mots de passe placeholder par de vrais hash bcrypt.

---

## 👤 Comptes de test

| Rôle    | Email                   | Mot de passe   |
|---------|-------------------------|----------------|
| Admin   | admin@coreflow.fr       | @dmiN1234      |
| RH      | rh@coreflow.fr          | Rh_1234        |
| Manager | manager@coreflow.fr     | Manager_1234   |
| Employé | employe@coreflow.fr     | Employe_1234   |

---

## 🗂️ Structure des tables

| Table            | Description                              |
|------------------|------------------------------------------|
| `utilisateurs`   | Comptes utilisateurs avec rôle intégré   |
| `tickets`        | Tickets de support (IT, RH, etc.)        |
| `commentaires`   | Commentaires sur les tickets             |
| `conges`         | Demandes de congés                       |
| `soldes_conges`  | Soldes de congés par utilisateur/année   |
| `evenements`     | Événements (réunions, formations, etc.)  |
| `participations` | Inscriptions aux événements              |
| `documents`      | Fichiers partagés                        |
| `jours_feries`   | Jours fériés français 2026               |

### Vues disponibles

| Vue                | Description                                      |
|--------------------|--------------------------------------------------|
| `v_conges_details` | Congés avec infos utilisateur et validateur      |
| `v_users_stats`    | Statistiques par utilisateur (tickets, congés…)  |

---

## ⚠️ Migration depuis l'ancienne BDD

Si tu avais déjà une BDD basée sur la structure originale (avec `services`, `role`, `posseder`, `demander`), voici la correspondance :

| Ancienne structure              | Nouvelle structure                        |
|---------------------------------|-------------------------------------------|
| `utilisateurs.idUtilisateurs`   | `utilisateurs.id`                         |
| `utilisateurs.idServices`       | `utilisateurs.departement` (champ texte)  |
| Table `role` + table `posseder` | `utilisateurs.role` (ENUM)                |
| Table `services`                | `utilisateurs.departement`                |
| `congés.idCongés`               | `conges.id`                               |
| Table `demander`                | `conges.user_id` (clé directe)            |
| `tickets.idTickets + idServices`| `tickets.id` (clé simple)                 |
| Table `rediger`                 | `tickets.demandeur_id` + `assigne_a_id`   |

### Points clés à adapter dans ton back Node.js

- **Plus de clés composites** : toutes les tables ont un `id` simple en AUTO_INCREMENT
- **Plus de table `services`** : le département est un champ `VARCHAR` dans `utilisateurs`
- **Les rôles** sont un ENUM directement dans `utilisateurs` : `admin`, `rh`, `manager`, `employe`
- **Les congés** ont maintenant un validateur, un statut détaillé et une table de soldes séparée

---

## 🔄 Mise à jour de la BDD

Si la structure évolue en cours de projet :
1. Modifier `coreflow_database.sql` sur GitHub
2. Prévenir l'équipe sur le chat de groupe
3. Chaque membre réimporte le fichier (étapes 1 à 3 ci-dessus)

---

## ❓ Problèmes fréquents

**Erreur `Access denied`**  
→ Vérifie `DB_USER` et `DB_PASSWORD` dans ton `.env`

**Erreur `Unknown database 'coreflow'`**  
→ Le script crée la base automatiquement, mais si l'erreur persiste : `mysql -u root -p -e "CREATE DATABASE coreflow;"`

**Les mots de passe ne fonctionnent pas à la connexion**  
→ Tu n'as pas lancé `node hash-passwords.js` après l'import

**Erreur de charset / collation**  
→ Supprime la base et réimporte : le script force `utf8mb4_unicode_ci`