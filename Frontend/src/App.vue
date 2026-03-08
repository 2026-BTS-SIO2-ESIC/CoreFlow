<script setup>
// Rien à importer ici si on utilise le router pour afficher LoginView
</script>

<template>
  <!-- Ici le router va afficher la vue actuelle, par défaut LoginView -->
  <router-view />
   <!-- Site en développement... -->
</template>

<style scoped>
/* Style global minimal */
body {
  margin: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
}
</style>

<style>
/* On peut laisser le style vide pour l'instant, Tailwind s'occupe de tout */
</style>