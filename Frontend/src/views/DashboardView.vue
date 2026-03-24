<template>
  <div class="dashboard">
    <div class="sidebar">
      <div class="logo">
        <div class="logo-icon">C</div>
        <div class="logo-text">CoreFlow</div>
      </div>
      <nav class="nav-menu">
        <a href="#" class="nav-item active">
          <div class="nav-icon">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          </div>
          Tableau de bord
        </a>

        <a href="#" class="nav-item">
          <div class="nav-icon">
            <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          Mes Congés
        </a>

        <a @click="goToEventPanel" class="nav-item">
          <div class="nav-icon">
            <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          Événements
        </a>

        <div v-if="user && (user.role === 'admin' || user.role === 'manager')">
          <a @click="goToAdminPanel" class="nav-item">
            <div class="nav-icon">
              <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            Gestion utilisateurs
          </a>
        </div>
      </nav>

      <div class="user-profile">
        <div v-if="user" class="user-details">
          <div class="user-name">{{ user.nom }}</div>
          <div class="user-role">{{ user.role }}</div>
        </div>
        <button @click="logout" class="btn-logout">Déconnexion</button>
      </div>
    </div>

    <div class="main-content">
      <div class="dashboard-header">
        <h1>Bienvenue sur CoreFlow</h1>
      </div>

      <div v-if="user" class="user-info-card">
        <h2>Informations de connexion</h2>
        <div class="info-grid">
          <p><strong>Nom :</strong> {{ user.prenom }} {{ user.nom }}</p>
          <p><strong>Email :</strong> {{ user.email }}</p>
          <p><strong>Rôle :</strong> {{ user.role }}</p>
          <p><strong>Département :</strong> {{ user.departement }}</p>
        </div>
      </div>

      <div class="events-dashboard-section">
        <CreateEventModal v-if="user && (user.role === 'admin' || user.role === 'manager')" />
        
        <div class="events-container">
          <EventList title="🚀 Événements à venir" :events="upcomingEvents" />
          <div class="spacer-v"></div>
          <EventList title="📜 Historique" :events="pastEvents" class="past-events-style" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import CreateEventModal from '@/components/CreateEventModal.vue';
import EventList from '@/components/EventList.vue';

export default {
  name: 'DashboardView',
  components: { CreateEventModal, EventList },
  data() {
    return {
      user: null,
      upcomingEvents: [],
      pastEvents: []
    }
  },
  async mounted() {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      this.user = JSON.parse(userStr)
      await this.fetchEvents();
    } else {
      this.$router.push('/login')
    }
  },
  methods: {
    async fetchEvents() {
      try {
        const response = await axios.get('http://localhost:3000/api/event/all');
        const now = new Date();
        this.upcomingEvents = response.data.filter(e => new Date(e.startDate) >= now);
        this.pastEvents = response.data.filter(e => new Date(e.startDate) < now);
      } catch (error) {
        console.error("Erreur API:", error);
      }
    },
    logout() {
      localStorage.clear();
      this.$router.push('/login');
    },
    goToAdminPanel() { this.$router.push('/admin/users'); },
    goToEventPanel() { this.$router.push('/event/create'); }
  }
}
</script>

<style scoped>
/* STRUCTURE GLOBALE */
.dashboard {
  display: flex;
  min-height: 100vh;
  background-color: #f3f4f6;
}

/* SIDEBAR FIXED */
.sidebar {
  width: 260px;
  height: 100vh;
  background-color: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0; top: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 30px 24px;
}

.logo-icon {
  width: 40px; height: 40px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: white; font-weight: bold; font-size: 20px;
}

.logo-text { font-size: 20px; font-weight: 700; color: #111827; }

.nav-menu { flex: 1; padding: 10px 0; }

.nav-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 24px;
  color: #6b7280; text-decoration: none;
  font-size: 15px; font-weight: 500;
  transition: all 0.2s; cursor: pointer;
}

.nav-item:hover { background-color: #f9fafb; color: #14b8a6; }
.nav-item.active {
  color: #14b8a6;
  background-color: #f0fdfa;
  border-right: 4px solid #14b8a6;
}

.nav-icon svg { width: 22px; height: 22px; stroke: currentColor; }

.user-profile {
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}

.user-name { font-weight: 600; color: #1f2937; }
.user-role { font-size: 12px; color: #9ca3af; margin-bottom: 15px; text-transform: uppercase; }

/* MAIN CONTENT AREA */
.main-content {
  margin-left: 260px; /* Doit être égal à la largeur de la sidebar */
  flex: 1;
  padding: 40px 60px;
}

.dashboard-header h1 { font-size: 28px; font-weight: 700; color: #111827; margin-bottom: 30px; }

.user-info-card {
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  margin-bottom: 40px;
}

.user-info-card h2 { font-size: 18px; margin-bottom: 15px; color: #374151; }
.info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }

.events-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.spacer-v { height: 1px; background: #e5e7eb; margin: 10px 0; }
.past-events-style { opacity: 0.6; }

.btn-logout {
  width: 100%;
  padding: 10px;
  background-color: #fee2e2;
  color: #ef4444;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.btn-logout:hover { background-color: #fecaca; }
</style>