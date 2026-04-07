<template>
  <div class="event-section">
    <h3>{{ title }}</h3>
    <div v-if="events.length > 0" class="event-grid">
      <DetailCardEvent 
        v-for="event in events" 
        :key="event.id" 
        :event="event" 
      />
    </div>
    <p v-else>Aucun événement à afficher.</p>
  </div>
</template>

<script setup>
import DetailCardEvent from './DetailCardEvent.vue';

const props = defineProps({
  title: String,
  events: Array
});
</script>

<style scoped>
.event-section { margin-bottom: 2rem; }
.event-grid { display: flex; flex-direction: column; gap: 10px; }
</style>