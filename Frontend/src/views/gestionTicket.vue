<script setup>
import { ref, onMounted } from "vue";


const token = localStorage.getItem("token");
const API = "http://localhost:3000/api/ticket/tickets"; // on définit l'URL de l'API pour récupérer les tickets
const API_It = "http://localhost:3000/api/ticket/itTickets"; // on définit l'URL de l'API pour récupérer les tickets
const API_Rh = "http://localhost:3000/api/ticket/rhTickets"; // on définit l'URL de l'API pour récupérer les tickets

const tickets = ref([]); // on crée une variable réactive pour stocker les tickets
const loading = ref(true); // on crée une variable réactive pour indiquer si les données sont en cours de chargement
const error = ref(null); // on crée une variable réactive pour stocker les erreurs

async function fetchTickets() {
  const stockedUser = JSON.parse(localStorage.getItem("user"));
  const role = stockedUser?.role; // évite une erreur si user = null

  let url = API_It;

  if (role === "it") {
    url = API_It;
  } else if (role === "rh") {
    url = API_Rh;
  } else if (role === "admin", "manager") {
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
  <section class="dashboard-header">
        <DashboardSidebar
        :user="user"
        :loading="false"
        @logout="logout"
      />
    <h1>Gestion des Tickets</h1>
    <!--@click="Créer la fonction nécessaire pour le bon fonctionnement" -->
    <button @click="createTicket" class="btn-create-ticket">+ Ajouter un ticket</button>
  </section>
  <section class="filter-buttons">
    <div class="filters" id="filters">
      <div id="all">Tous</div>
      <div id="bystand">En attente</div>
      <div id="ongoing">En cours</div>
      <div id="Résolu">Résolu</div>
      <div id="Fermé">Fermé</div>
    </div>
  </section>
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
    <tr v-for="ticket in tickets" :key="ticket.id">
      <td>{{ ticket.id }}</td>
      <td>{{ ticket.titre }}</td>
      <td>{{ ticket.description }}</td>
      <td>{{ ticket.categorie }}</td>
      <td>{{ ticket.statut }}</td>
      <td>{{ ticket.demandeur_id }}</td>
      <td>{{ ticket.updated_at }}</td>
      <td><button>✏️</button><button>👁️</button></td>
    </tr>
  </tbody>
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
</template>

<script>
import DashboardSidebar from "@/components/DashboardSidebar.vue";

export default {
  name: "gestionTicket",
  components: {
    DashboardSidebar
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

window.onload = () => {
  const filters = document.querySelectorAll("#filters div");
  const cards = document.querySelectorAll("#gallery .article-card");

  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const tag = filter.id;

      cards.forEach((card) => {
        console.log(card.dataset.category, tag);
        card.classList.add("inactive");
        card.classList.remove("active");

        if (tag === "all" || card.dataset.category === tag) {
          card.classList.remove("inactive");
          card.classList.add("active");
        }
      });
    });
  });
};
</script>

<style scoped>
section {
  padding: 20px 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 16px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.nav-menu {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #6b7280;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  font-size: 15px;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background-color: #f3f4f6;
  color: #14b8a6;
}

.nav-item.active {
  background-color: transparent;
  color: #14b8a6;
  border-left: 3px solid #14b8a6;
}

.nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-profile {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
}

.user-role {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 12px;
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
  background-color: white;
  color: #6b7280;
  font-weight: bold;
}

.stats-container {
  margin-top: 80px;
  display: flex;
  justify-content: space-between;
}

.stats {
  background-color: #fafafa;
  border-radius: 10px;
  color: #6b7280;
  padding: 20px 10px;
  width: 250px;
  font-size: 10px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
}

.dashboard-header h1 {
  font-size: 32px;
  color: #333;
}

.btn-logout {
  padding: 10px 20px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-logout:hover {
  background: #c82333;
}

svg {
  width: 20px;
  height: 20px;
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>