## Documentation des routes `event`

Ce document décrit les routes de l'API `event` et donne des exemples d'utilisation avec **Postman**.

---

## 1. Liste des événements (par participation et rôle)

- **Méthode** : `GET`
- **URL** : `http://localhost:3000/event/list/participation/:user_id/:userRole`

**Paramètres URL** : `user_id` (ID de l'utilisateur), `userRole` (`admin`, `manager`, etc.)

**Comment utiliser** : Remplacez `:user_id` et `:userRole` par les valeurs. Ex. `GET http://localhost:3000/event/list/participation/5/admin`

**Réponse** : Si admin → `{ message, eventAdmin }`. Sinon → `{ message, eventLevelOne, eventLevelTwo }`

---

## 2. Création d'un événement

- **Méthode** : `POST`
- **URL** : `http://localhost:3000/event/create/:userRole`
- **Headers** : `Content-Type: application/json`

**Comment utiliser** : Le paramètre `userRole` doit être `manager`. Corps JSON avec les champs de l'événement.

**Body (exemple)** :

```json
{
  "titre": "Un meeting",
  "description": "Description",
  "type_evenement": "meeting",
  "date_debut": "2026-06-21 12:00:00",
  "date_fin": "2026-06-21 14:00:00",
  "lieu": "Salle A",
  "organisateur_id": 1,
  "niveau": "1",
  "inviter": "email1@x.com,email2@y.com",
  "department": "IT"
}
```

**Champs obligatoires** : `titre`, `organisateur_id`, `date_debut`, `date_fin`, `type_evenement`, `niveau`. **Réponse** : `201` + `{ message, id, participationIds }`

---

## 3. Récupérer un événement par ID

- **Méthode** : `GET`
- **URL** : `http://localhost:3000/event/list/:id`

**Comment utiliser** : Remplacez `:id` par l'ID de l'événement. Ex. `GET http://localhost:3000/event/list/42`

**Réponse** : `200 OK` + `{ message, event }`

---

## 4. Recherche d'utilisateurs par email (autocomplétion inviter)

- **Méthode** : `POST`
- **URL** : `http://localhost:3000/event/user_list_by_email`
- **Headers** : `Content-Type: application/json`

**Comment utiliser** : Pour l'autocomplétion du champ inviter. Envoie une chaîne partielle d'email, la requête SQL utilise `LIKE %valeur%`.

**Body** : `{ "email": "admin" }`

**Réponse** : `200 OK` + `{ message, usersInfos }` (tableau de `{ id, email }`)

---

## 5. Mise à jour d'un événement

- **Méthode** : `PUT`
- **URL** : `http://localhost:3000/event/update`
- **Headers** : `Content-Type: application/json`

**Comment utiliser** : Envoyez `id` et `organisateur_id` obligatoirement, plus les champs à modifier.

**Body (exemple)** :

```json
{
  "id": 42,
  "organisateur_id": 1,
  "titre": "Nouveau titre",
  "description": "Nouvelle description",
  "niveau": "2"
}
```

**Règles** : Seul le propriétaire (`organisateur_id`) peut modifier. Sinon `403 PERMISSION_ERROR`. Si l'événement n'existe pas : `404 NOT_FOUND`.

**Réponse** : `201` + `{ message, id }`

---

## 6. Règles de visibilité des événements (niveau & rôle)

### Niveaux d'événements

- **Niveau 1** : événement d'entreprise, visible par tous.
- **Niveau 2** : événement de service, visible selon participations/rôles.

### Rôles

- **Admin** : voit tous les événements.
- **Manager, Employé, RH** : voient les événements selon leur `user_id` et participations.

---

## 7. Tâches à faire / backlog

- [x] Vérification des rôles pour chaque affichage d'événement
- [x] Route helper recherche utilisateur par email
- [x] Niveaux 1 et 2
- [x] Colonne `inviter` + vérification des utilisateurs
- [x] Route `GET /event/list/:id`
- [x] Route `PUT /event/update`
- [ ] Filtre à venir / passé : `GET /event/list/passed`, `GET /event/list/coming`

---

## 8. Idées futures

- Suppression automatique des événements de niveau 2 après une certaine période.

---

## Commandes utiles

```bash
npm install --save-dev eslint
npx eslint --init
npx eslint
```

---

## Avant de commencer

- [ ] Mettre à jour la base de données (`Backend/migration-1.txt`)
- [ ] `npm install`
- [ ] `npm run dev`
