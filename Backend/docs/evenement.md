## Documentation des routes `event`

Ce document décrit les routes de l’API `event` et donne des exemples d’utilisation avec **Postman**.

---

## 1. Liste de tous les événements

- **Méthode** : `GET`
- **URL** : `http://localhost:3000/event/list`

**Réponse (succès)** :

- `200 OK` + tableau d’événements.

---

## 2. Création d’un événement

- **Méthode** : `POST`
- **URL** : `http://localhost:3000/event/create`
- **Headers** : `Content-Type: application/json`

**Body (exemple JSON)** :

```json
{
  "date_creation": "2026-06-20",
  "date_debut": "2026-06-21 12:00:00",
  "date_fin": "2026-06-21 12:00:00",
  "description": "TEST DES DROITS",
  "idEvenements": 2,
  "idServices": 2,
  "idUtilisateurs": 1,
  "nom_createur": "Vadim",
  "titre": "Un meeting",
  "type": "meeting",
  "niveau": "1",
  "inviter": ["1", "2"]
}
```

**Comportement** :

- Crée un nouvel événement avec l’ID, le service, l’utilisateur créateur, etc.

---

## 3. Mise à jour d’un événement

- **Méthode** : `PUT`
- **URL** : `http://localhost:3000/event/update`
- **Headers** : `Content-Type: application/json`

Seuls certains champs sont obligatoires pour la mise à jour (par ex. `idEvenements`, `idServices`, `niveau`). Les autres champs sont optionnels.

**Body (exemple JSON)** :

```json
{
  "description": "TEST DU PUT",
  "idEvenements": 1,
  "idServices": 2,
  "nom_createur": "Dimid",
  "niveau": "2",
  "inviter": ["2", "1"]
}
```

**Règles importantes** :

- L’événement ne peut être modifié que par son propriétaire (`idUtilisateurs`) ; sinon une erreur est renvoyée (ex. `403 FORBIDDEN`).
- Les dates et le niveau sont validés côté serveur.

---

## 4. Règles de visibilité des événements (niveau & rôle)

### Niveaux d’événements

- **Niveau 1** : événement d’entreprise, visible par tous les utilisateurs.
- **Niveau 2** : événement de service, visible uniquement par les utilisateurs qui ont le **même `idServices`** que l’événement.

### Rôles (idRole) – objectifs

- **Admin (1)** : peut voir tous les événements.
- **Employé (2)** : peut voir les événements dont le service correspond à son `idServices`.
- **RH (3)** : voit uniquement les événements de **niveau 1**.
- **Manager (4)** : voit tous les événements ayant le même `idServices` que lui.

---

## 5. Tâches à faire / backlog

- [ ] verification des role pour chaque affichage d'evenement (admin, employé, RH, manager).
  1. [ ] Admin voit tout les evenement.
  2. [ ] Manager voit que les evenement qu'il a crees et les evenement ou il a ete inviter.
  3. [ ] Employee et RH voit que les evenement ou il a ete inviter.

- [ ] crees une route helper pour retrouver un utilisater
  1. [ ] lancer une requette avec l'email de utilisateur avec ALIKE %emailMsg% dans la requette
         2.1 [ ] sur front end recupere le resultat et rajouter dans le champ inviter

- [x] Ajouter 2 niveaux d’événements (`niveau 1` et `niveau 2`).
  - [x] niveau:1 Afficher l'événements pour tous les utilisateurs.
  - [x] niveau:2 Afficher l'evenement a la fonction des roles.

- [x] Ajouter la colonne `inviter` dans la table `evenements`.
  - [x] Vérifier que chaque utilisateur invité existe réellement.

- [x] Ajouter une route `GET` pour afficher un événement unique (`list_one`).
- [x] Modification des colonnes en DATETIME.
- [x] Créer une route `PUT` pour que l’utilisateur puisse modifier ses propres événements.

- [ ] Ajouter un filtre _à venir_ / _passé_ pour la route `GET /event/list`.
  - [ ] Vérifier les dates `date_debut` et `date_fin`, et distinguer les événements _à venir_ / _passés_.

---

## 6. Idées futures

- Suppression automatique des événements de niveau 2 après une certaine période.

## Commande utile

npm install --save-dev eslint
npx eslint --init

npx eslint
