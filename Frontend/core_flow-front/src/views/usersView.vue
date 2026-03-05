<script setup> 
//ref est une fonction de Vue qui permet de créer une variable réactive, 
// c'est à dire une variable qui va être mise à jour automatiquement dans le template lorsque sa valeur change

//onMounted est une fonction de Vue qui permet d'exécuter du code lorsque le composant est monté, 
// c'est à dire lorsque le composant est affiché pour la première fois dans le DOM
import { onMounted, ref } from 'vue';  

const users = ref([]); //création d'une variable réactive users qui est un tableau vide

const loading = ref(true); //création d'une variable réactive loading qui est un booléen initialisé à true

const error = ref(null); //création d'une variable réactive error qui est initialisée à null

//une fonction async attend la résolution d'une promesse avant de continuer son execution 
async function fetchUsers() { //création d'une fonction asynchrone fetchUsers qui va récupérer les utilisateurs depuis l'API
  try {
    const response = await fetch('http://localhost:3000/api/users'); //envoi d'une requête GET à l'API pour récupérer les utilisateurs
    if (!response.ok) { //si la réponse n'est pas ok, c'est à dire si le statut de la réponse n'est pas compris entre 200 et 299
      throw new Error('erreur de la recuperation des utilisateurs'); //lance une erreur avec un message
    }

    const data = await response.json(); //récupération des données au format JSON
    users.value = data; //mise à jour de la variable users avec les données récupérées
  } catch (err) { //si une erreur est survenue lors de la récupération des données
    error.value = err.message; //mise à jour de la variable error avec le message de l'erreur
  } finally {
    loading.value = false; //mise à jour de la variable loading à false, que la récupération des données ait réussi ou échoué
  }
}


onMounted(() => { //lorsque le composant est monté, exécute la fonction fetchUsers pour récupérer les utilisateurs
  fetchUsers();
});
</script>

<template>
    <div>
        <h1>Liste des utilisateurs</h1>
        <p v-if="loading">Chargement...</p> <!-- Affiche "Chargement..." si loading est true -->
        <p v-else-if="error">Erreur: {{ error }}</p> <!-- Affiche le message d'erreur si error n'est pas null -->
    
      <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Email</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="user in users" :key="user.idUtilisateur"> <!-- Parcourt la liste des utilisateurs et affiche une ligne pour chaque utilisateur -->
                <td>{{ user.idUtilisateur }}</td> <!-- Affiche l'ID de l'utilisateur -->
                <td>{{ user.Nom }}</td> <!-- Affiche le nom de l'utilisateur -->
                <td>{{ user.mail }}</td> <!-- Affiche l'email de l'utilisateur -->
            </tr>
        </tbody>
    </table>
  </div>
</template>