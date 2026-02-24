## route a utiliser a moment avec **postman**
- GET http://localhost:3000/event/list


- POST http://localhost:3000/event/create
body 
{
    "date_creation":"2026-06-20",
    "date_debut":"2026-06-21 12:00:00",
    "date_fin":"2026-06-21 12:00:00",
    "description":"TEST DES DROITS",
    "idEvenements":2,
    "idServices":2,
    "idUtilisateurs": 1,
    "nom_createur":"Vadim",
    "titre":"UN metting",
    "type":"meteeng",
    "niveau":"1",
    "inviter":["1,2"]
}


- PUT http://localhost:3000/event/update
body 
{
    // "date_creation":"2026-06-20",
    // "date_debut":"2026-06-21 12:00:00",
    // "date_fin":"2026-06-21 12:00:00",
    "description":"TEST DU PUT",
    "idEvenements":1,
    "idServices":2,
    // "idUtilisateurs": 2,
    "nom_createur":"Dimid",
    // "titre":"UN metting",
    // "type":"meteeng",
    "niveau":"2",
    "inviter":["2,1"]
}