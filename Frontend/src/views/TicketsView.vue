<template>
  <div class="container">
    <!-- Barre latérale =============================================== -->
    <div class="sidebar">
      <div class="logo">
        <div class="logo-icon">C</div>
        <div class="logo-text">CoreFlow</div>
      </div>
      <nav class="nav-menu">
        <a href="#" class="nav-item">
          <div class="nav-icon">
            <svg viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </div>
          Tableau de bord
        </a>

        <a href="#" class="nav-item">
          <div class="nav-icon">
            <svg viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          Mes Congés
        </a>

        <a href="#" class="nav-item">
          <div class="nav-icon">
            <svg viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          Événements
        </a>

        <!-- Remplacer la balise a par un router-link -->
        <router-link to="/tickets" class="nav-item" :class="{ active: $route.path === '/tickets' }">
          <div class="nav-icon">
            <svg viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          Tickets & Support
        </router-link>

        <div v-if="user && (user.role === 'admin' || user.role === 'manager')">
          <a href="#" class="nav-item">
            <div class="nav-icon">
              <svg viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            Gestion utilisateurs
          </a>
        </div>
      </nav>
      <div class="user-profile">
        <div v-if="user">
          <div class="user-name">{{ user.nom }}</div>
          <div class="user-role">{{ user.role }}</div>
        </div>
        <button @click="logout" class="btn-logout">Déconnexion</button>
      </div>
    </div>

    <!-- Coprs de la page ============================================= -->

    <main class="main-content">
      <header class="content-header">
        <h1>Gestion des tickets</h1>
        <button class="btn-add-ticket" @click="showModal = true">+ Ajouter un ticket</button>
      </header>

      <div class="filters">
        <button
          v-for="f in ['Tout', 'ouvert', 'en_cours', 'resolu', 'ferme']"
          :key="f"
          :class="['filter-btn', { active: currentFilter === f }]"
          @click="currentFilter = f"
        >
          {{ formatStatus(f) }}
        </button>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>N°</th>
              <th>Titre</th>
              <th>Demandeur</th>
              <th>Statut</th>
              <th>Dernière mis à jour</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ticket in filteredTickets" :key="ticket.id">
              <td class="id-cell">#{{ ticket.id }}</td>
              <td>{{ ticket.titre }}</td>
              <td>{{ ticket.prenom }} {{ ticket.nom }}</td>
              <td>
                <span
                  :class="[
                    'status-badge',
                    (ticket.statut || 'en-attente').toLowerCase().replace(/\s+/g, '-'),
                  ]"
                >
                  {{ ticket.statut || 'En attente' }}
                </span>
              </td>
              <td>{{ formatDate(ticket.created_at) }}</td>
              <td class="actions">
                <button @click="showDetails(ticket.id)" class="icon-btn">👁️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">Tickets traité</span>
          <span class="stat-value highlight">12</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Tickets en attente</span>
          <span class="stat-value highlight">1</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Note</span>
          <span class="stat-value highlight">3.2</span>
        </div>
      </div>
    </main>

    <!-- Formulaire d'ajout de ticket ====================================== -->

    <transition name="fade">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Nouveau Ticket</h2>
            <button @click="showModal = false" class="close-btn">&times;</button>
          </div>

          <form @submit.prevent="submitTicket">
            <div class="form-group">
              <label>Titre</label>
              <input
                v-model="newTicket.titre"
                type="text"
                placeholder="Sujet de votre demande"
                required
              />
            </div>

            <div class="form-group">
              <label>Catégorie</label>
              <select v-model="newTicket.categorie">
                <option value="it">Informatique</option>
                <option value="rh">Ressources Humaines</option>
                <option value="comptabilite">Comptabilité</option>
                <option value="direction">Direction</option>
              </select>
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea v-model="newTicket.description" rows="4" required></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" @click="showModal = false" class="btn-cancel">Annuler</button>
              <button type="submit" class="btn-submit">Envoyer le ticket</button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Détails du ticket =================================================== -->

    <transition name="fade">
  <div v-if="selectedTicket" class="modal-overlay" @click.self="selectedTicket = null">
    <div class="modal-content details-modal">
      <div class="modal-header">
        <h2>Ticket #{{ selectedTicket.id }}</h2>
        <button @click="selectedTicket = null" class="close-btn">&times;</button>
      </div>

      <div class="details-body">
        <div class="detail-section">
          <label>Titre</label>
          <p class="detail-value">{{ selectedTicket.titre }}</p>
        </div>

        <div class="detail-row">
          <div class="detail-section">
            <label>Statut</label>
            <span :class="['status-badge', (selectedTicket.statut || 'ouvert').toLowerCase().replace('_', '-')]">
              {{ formatStatus(selectedTicket.statut) }}
            </span>
          </div>
          <div class="detail-section">
            <label>Catégorie</label>
            <p class="detail-value text-uppercase">{{ selectedTicket.categorie }}</p>
          </div>
        </div>

        <div class="detail-section">
          <label>Description</label>
          <div class="description-box">
            {{ selectedTicket.description }}
          </div>
        </div>

        <div class="detail-section info-footer">
          <p><strong>Demandeur :</strong> {{ selectedTicket.prenom }} {{ selectedTicket.nom }} ({{ selectedTicket.departement }})</p>
          <p><strong>Créé le :</strong> {{ dayjs(selectedTicket.created_at).format('DD MMMM YYYY à HH:mm') }}</p>
        </div>
      </div>

      <div class="modal-actions">
        <button @click="selectedTicket = null" class="btn-cancel">Fermer</button>
      </div>
    </div>
  </div>
</transition>
  </div>
</template>

<script>
// 1. Importations
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Swal from 'sweetalert2'
import 'dayjs/locale/fr' // Pour avoir les textes en français

// 2. Configuration du plugin
dayjs.extend(relativeTime)
dayjs.locale('fr')

export default {
  name: 'TicketsView',
  data() {
    return {
      user: null,
      currentFilter: 'Tout',
      showModal: false,
      newTicket: {
        titre: '',
        categorie: 'Informatique',
        description: '',
      },
      tickets: [],
      selectedTicket: null,
      dayjs: dayjs,
      currentFilter: 'Tout',
    filters: ['Tout', 'En attente', 'En cours', 'Résolu', 'Fermé'],

    statusMap: {
      'En attente': 'ouvert',
      'En cours': 'en_cours',
      'Résolu': 'resolu',
      'Fermé': 'ferme'
    }
    }
  },
  computed: {
    filteredTickets() {
      if (this.currentFilter === 'Tout') return this.tickets
      return this.tickets.filter((t) => t.statut === this.currentFilter)
    },
  },
  async mounted() {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      this.user = JSON.parse(userStr)
    } else {
      this.$router.push('/login')
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3000/api/tickets/my-tickets', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()
      if (response.ok) {
        this.tickets = Array.isArray(result.data) ? result.data : []
      }
    } catch (err) {
      console.error('Erreur de chargement des tickets', err)
    }
  },
  methods: {
    // 3. La fameuse méthode formatDate mise à jour
    formatDate(date) {
      if (!date) return "À l'instant"
      // .fromNow() génère le texte relatif (ex: "il y a 5 min")
      return dayjs(date).fromNow()
    },

    // formateStatus pour afficher des statuts plus lisibles
    formatStatus(status) {
      if (!status) return 'En attente'

      if (typeof status === 'object') {
        status = status.statut || status.value || ''
      }

      const map = {
        ouvert: 'En attente',
        en_cours: 'En cours',
        resolu: 'Résolu',
        ferme: 'Fermé',
      }

      return map[status] || status
    },

    showToast(icon, title) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon,
        title,
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      })
    },

    // Détails du ticket
    async showDetails(id) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/tickets/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const result = await response.json();
        if (response.ok) {
          this.selectedTicket = result.data;
        } else {
          alert("Impossible de charger les détails du ticket.");
        }
      } catch (error) {
        console.error("Erreur détails:", error);
      }
    },

    async submitTicket() {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:3000/api/tickets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(this.newTicket),
        })

        const result = await response.json()

        if (response.ok && result.success) {
          // AJOUT DYNAMIQUE : On s'assure que les clés correspondent au v-for du tableau
          const createdTicket = {
            id: result.id,
            titre: this.newTicket.titre,
            prenom: this.user.prenom, // On utilise les infos de l'utilisateur connecté
            nom: this.user.nom,
            statut: 'En attente',
            created_at: new Date().toISOString(), // Dayjs formatera cela en "il y a quelques secondes"
          }

          this.tickets.unshift(createdTicket)
          this.showModal = false
          this.newTicket = { titre: '', categorie: 'Informatique', description: '' }
          this.showToast('success', 'Ticket ajoute avec succes')
        } else {
          this.showToast('error', result.message || 'Erreur lors de la creation')
        }
      } catch (error) {
        console.error('Erreur :', error)
        this.showToast('error', 'Erreur lors de la creation du ticket')
      }
    },
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$router.push('/login')
    },
  },
}
</script>

<style scoped>
.container {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Corps de la page ============================================ */

.main-content {
  width: 100%;
  margin-left: 140px;
  padding: 40px;
}

/* Header & Bouton Ajouter */
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.content-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.btn-add-ticket {
  background-color: #0d9488;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Filtres */
.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.filter-btn {
  background: none;
  border: none;
  padding: 10px 5px;
  color: #6b7280;
  cursor: pointer;
  font-weight: 500;
  position: relative;
}

.filter-btn.active {
  color: #0d9488;
}

.filter-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #0d9488;
}

/* Tableau */
.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

thead {
  background-color: #14b8a6;
  color: white;
}

th,
td {
  padding: 16px;
  font-size: 14px;
}

tr {
  border-bottom: 1px solid #f3f4f6;
}

.id-cell {
  color: #9ca3af;
}

/* Badges de Statut */
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.fermé {
  background-color: #fee2e2;
  color: #ef4444;
}
.en-attente {
  background-color: #f3f4f6;
  color: #6b7280;
}
.résolu {
  background-color: #dcfce7;
  color: #22c55e;
}
.en-cours {
  background-color: #fef3c7;
  color: #d97706;
}

/* Actions */
.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  margin-right: 10px;
  opacity: 0.6;
}

.icon-btn:hover {
  opacity: 1;
}

/* Stats Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #0d9488;
}

/* Formulaire ========================================================= */

/* Fond de la modale (couvre tout l'écran) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* Fond semi-transparent */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000; /* Doit être supérieur à la sidebar */
}

/* Boîte blanche du formulaire */
.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 500px;
  max-width: 90%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: bold;
  margin-bottom: 5px;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-submit {
  background-color: #0d9488;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-cancel {
  background-color: #eee;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
}

/* transiition */

/* L'overlay reste fluide et simple */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* LA MAGIE EST ICI : Le formulaire */
.fade-enter-active .modal-content {
  /* On accentue le bezier : le 1.8 au lieu de 1.56 augmente le rebond */
  transition: all 0.5s cubic-bezier(0.68, -0.6, 0.32, 1.6);
}

.fade-leave-active .modal-content {
  /* Sortie plus rapide et sèche */
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
}

/* État initial (Entrée) */
.fade-enter-from .modal-content {
  transform: scale(0.7) translateY(40px); /* Part de plus petit et plus bas */
  opacity: 0;
}

/* État final (Sortie) */
.fade-leave-to .modal-content {
  transform: scale(0.9) translateY(-20px); /* Remonte un peu en disparaissant */
  opacity: 0;
}

/* Détails du ticket */

/* On rend la modale de détails plus large que celle du formulaire */
.details-modal {
  width: 700px !important; 
  max-width: 95%;
  max-height: 90vh;
  overflow-y: auto;
}

.details-body {
  display: flex;
  flex-direction: column;
  gap: 24px;
  text-align: left;
  padding: 10px 0;
}

/* --- Sections de contenu --- */

.detail-section label {
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  color: #9ca3af;
  margin-bottom: 6px;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 16px;
  color: #1f2937;
  font-weight: 500;
  margin: 0;
}

/* Mise en page en colonnes pour Statut/Catégorie */
.detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  background: #fdfdfd;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #f3f4f6;
}

/* La boîte de description */
.description-box {
  background: #f8fafc;
  padding: 10px 20px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  line-height: 1.6;
  color: #374151;
  white-space: pre-wrap; /* Préserve les retours à la ligne de l'utilisateur */
  min-height: 100px;
  font-size: 14px;
}

/* Footer avec infos secondaires */
.info-footer {
  margin-top: 10px;
  padding-top: 20px;
  border-top: 1px dashed #e5e7eb;
}

.info-footer p {
  margin: 5px 0;
  font-size: 13px;
  color: #535761;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Utilitaires */
.text-uppercase {
  text-transform: uppercase;
}

/* Ajustement du bouton fermer pour qu'il soit bien visible */
.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #9ca3af;
  cursor: pointer;
  line-height: 1;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #ef4444;
}

/* Barre lattérale =================================================== */

.sidebar {
  width: 240px;
  height: 100vh;
  background-color: #fafafa;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
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

/* SVG Icons */
svg {
  width: 20px;
  height: 20px;
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
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
</style>
