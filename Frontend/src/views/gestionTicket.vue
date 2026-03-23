<script setup>
import { ref, onMounted } from "vue";
import { computed } from "vue";

const token = localStorage.getItem("token");
const API = "http://localhost:3000/api/ticket/tickets"; // on définit l'URL de l'API pour récupérer les tickets
const API_It = "http://localhost:3000/api/ticket/itTickets"; // on définit l'URL de l'API pour récupérer les tickets
const API_Rh = "http://localhost:3000/api/ticket/rhTickets"; // on définit l'URL de l'API pour récupérer les tickets

const tickets = ref([]); // on crée une variable réactive pour stocker les tickets
const loading = ref(true); // on crée une variable réactive pour indiquer si les données sont en cours de chargement
const error = ref(null); // on crée une variable réactive pour stocker les erreurs
const activeFilter = ref("all");
const isEditing = ref(false);

const showModal = ref(false);
const selectedTicket = ref(null);

const filteredTickets = computed(() => {
  if (activeFilter.value === "all") return tickets.value;

  return tickets.value.filter((ticket) => {
    return ticket.statut === activeFilter.value;
  });
});

function openModal(ticket, edit = false) {
  selectedTicket.value = { ...ticket }; // copie
  isEditing.value = edit;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedTicket.value = null;
}

async function updateTicket() {
  try {
    const response = await fetch(
      `http://localhost:3000/api/ticket/${selectedTicket.value.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(selectedTicket.value),
      }
    );

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour");
    }

    // 🔄 refresh liste
    await fetchTickets();

    closeModal();
  } catch (err) {
    console.error(err);
  }
}

async function fetchTickets() {
  const stockedUser = JSON.parse(localStorage.getItem("user"));
  const role = stockedUser?.role; // évite une erreur si user = null

  let url = API_It;

  if (role === "it") {
    url = API_It;
  } else if (role === "rh") {
    url = API_Rh;
  } else if ((role === "admin", "manager")) {
    url = API; // tous les tickets
  }

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des tickets"); // si la réponse n'est pas ok, on lance une erreur
    }
    const data = await response.json(); // on parse la réponse en JSON
    tickets.value = data; // on stocke les utilisateurs dans la variable réactive
    console.log(tickets.value); // on log les utilisateurs pour vérifier que tout fonctionne
  } catch (err) {
    error.value = err.message; // on stocke l'erreur dans la variable réactive
  } finally {
    loading.value = false; // on indique que le chargement est terminé
  }
}

onMounted(() => {
  fetchTickets(); // on appelle la fonction pour récupérer les utilisateurs lorsque le composant est monté
});
</script>

<template>
  <div class="page-container">
    <section class="dashboard-header">
      <DashboardSidebar :user="user" :loading="false" @logout="logout" />
      <h1>Gestion des Tickets</h1>
      <!--@click="Créer la fonction nécessaire pour le bon fonctionnement" -->
      <button @click="createTicket" class="btn-create-ticket">+ Ajouter un ticket</button>
    </section>
    <div class="filters">
      <div @click="activeFilter = 'all'">Tous</div>
      <div @click="activeFilter = 'ouvert'">ouvert</div>
      <div @click="activeFilter = 'en_cours'">En cours</div>
      <div @click="activeFilter = 'resolu'">Résolu</div>
      <div @click="activeFilter = 'ferme'">Fermé</div>
    </div>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Titre</th>
          <th>Description</th>
          <th>Category</th>
          <th>Status</th>
          <th>Client</th>
          <th>Dernière modification le</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ticket in filteredTickets">
          <td>{{ ticket.id }}</td>
          <td>{{ ticket.titre }}</td>
          <td>{{ ticket.description }}</td>
          <td>{{ ticket.categorie }}</td>
          <td>{{ ticket.statut }}</td>
          <td>{{ ticket.demandeur_id }}</td>
          <td>{{ ticket.updated_at }}</td>
          <td class="action">
            <button @click="openModal(ticket, true)">✏️</button>
            <button @click="openModal(ticket, false)">👁️</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="stats-container">
      <div class="stats">
        <h2>Tickets traité</h2>
      </div>
      <div class="stats">
        <h2>Tickets en attente</h2>
      </div>

      <div class="stats">
        <h2>Note</h2>
      </div>
    </div>
  </div>
  <div v-if="showModal" class="modal-overlay" @click="closeModal">
  <div class="modal" @click.stop>
    <h2 v-if="isEditing">Modifier le ticket</h2>
    <h2 v-else>Détail du ticket</h2>

    <div v-if="selectedTicket">
      <!-- INPUT si édition -->
      <div v-if="isEditing">
        <input v-model="selectedTicket.titre" placeholder="Titre" />
        <textarea v-model="selectedTicket.description"></textarea>

        <select v-model="selectedTicket.statut">
          <option>En attente</option>
          <option>En cours</option>
          <option>Résolu</option>
          <option>Fermé</option>
        </select>
      </div>

      <!-- TEXTE si lecture -->
      <div v-else>
        <p><strong>ID :</strong> {{ selectedTicket.id }}</p>
        <p><strong>Titre :</strong> {{ selectedTicket.titre }}</p>
        <p><strong>Description :</strong> {{ selectedTicket.description }}</p>
        <p><strong>Statut :</strong> {{ selectedTicket.statut }}</p>
      </div>
    </div>

    <!-- Boutons -->
    <button v-if="isEditing" @click="updateTicket">
      Sauvegarder
    </button>

    <button @click="closeModal">Fermer</button>
  </div>
</div>
</template>

<script>
import DashboardSidebar from "@/components/DashboardSidebar.vue";
import { all } from "axios";

export default {
  name: "gestionTicket",
  components: {
    DashboardSidebar,
  },

  data() {
    return {
      user: null,
    };
  },
  mounted() {
    // Récupérer l'utilisateur depuis localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      this.user = JSON.parse(userStr);
    } else {
      // Rediriger vers login si pas connecté
      this.$router.push("/login");
    }
  },
  methods: {
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.$router.push("/login");
    },
    goToAdminPanel() {
      this.$router.push("/admin/users");
    },
  },
};
</script>

<style scoped>
.page-container {
  background-color: #f0fdfa;
  height: 100vh;
}
section {
  padding: 20px 0;
}

.btn-create-ticket {
  background-color: #0d9488;
  border: none;
  border-radius: 10px;
  color: white;
  padding: 20px 10px;
  font-size: 20px;
}

.filters {
  display: flex;
  gap: 40px;
  margin-left: 300px;
  margin-right: 80px;
  background-color: #f0fdfa;
}

table {
  margin-left: 300px;
  margin-right: 80px;
}

thead th {
  background-color: #0d9488;
  padding: 20px 10px;
  justify-content: space-between;
  text-align: start;
  color: white;
}

tbody tr td {
  padding: 20px 10px;
  color: #6b7280;
  font-weight: bold;
  background-color: white;
}

.stats-container {
  margin-top: 80px;
  display: flex;
  justify-content: space-between;
}

.stats {
  margin-left: 300px;
  margin-right: 80px;
  background-color: white;
  border-radius: 10px;
  color: #6b7280;
  padding: 20px 10px;
  width: 250px;
  font-size: px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
  margin-left: 300px;
  margin-right: 80px;
}

.dashboard-header h1 {
  font-size: 32px;
  color: #333;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);

  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 10px;
  width: 400px;
}
.closeBtn {
  background-color: red;
  padding: 10px 20px;
  border-radius: 10px;
  color: white;
  cursor: pointer;
}
</style>
