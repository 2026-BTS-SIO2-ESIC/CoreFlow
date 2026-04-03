<template>
  <div class="container">
    <DashboardSidebar :user="user" @logout="logout" />

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

      <!-- Filtre par rôle -->
      <div class="roleFilter">
        <button :class="['role-filter-btn', { active: myTickets }]" @click="myTickets = true">
          Mes tickets
        </button>
        <button :class="['role-filter-btn', { active: !myTickets }]" @click="myTickets = false">
          Tous les tickets
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
              <td class="id-cell ticket-id" data-label="N°">#{{ ticket.id }}</td>
              <td class="ticket-title" data-label="Titre">{{ ticket.titre }}</td>
              <td class="ticket-requester" data-label="Demandeur">{{ ticket.prenom }} {{ ticket.nom }}</td>
              <td class="ticket-status" data-label="Statut">
                <span :class="['status-badge', getStatusClass(ticket.statut)]">
                  {{ formatStatus(ticket.statut) }}
                </span>
              </td>
              <td class="ticket-updated" data-label="Dernière mise à jour">{{ formatDate(ticket.created_at) }}</td>
              <td class="actions" data-label="Action">
                <button @click="showDetails(ticket.id)" class="icon-btn">👁️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Statistiques ========================================================== -->

      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">Tickets traité</span>
          <span class="stat-value highlight">{{ ticketStats.traites }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Tickets en attente</span>
          <span class="stat-value highlight">{{ ticketStats.enAttente }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Note</span>
          <span class="stat-value highlight">{{ ticketStats.note }}</span>
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
                <span :class="['status-badge', getStatusClass(selectedTicket.statut)]">
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
              <p>
                <strong>Demandeur :</strong> {{ selectedTicket.prenom }}
                {{ selectedTicket.nom }} ({{ selectedTicket.departement }})
              </p>
              <p>
                <strong>Créé le :</strong>
                {{ dayjs(selectedTicket.created_at).format('DD MMMM YYYY à HH:mm') }}
              </p>
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
import DashboardSidebar from '@/components/DashboardSidebar.vue'
import 'dayjs/locale/fr' // Pour avoir les textes en français

// 2. Configuration du plugin
dayjs.extend(relativeTime)
dayjs.locale('fr')

export default {
  name: 'TicketsView',
  components: {
    DashboardSidebar,
  },
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
      myTickets: true, // Par défaut, on affiche les tickets de l'utilisateur connecté. Peut être ajusté selon le rôle.
    }
  },
  computed: {
    filteredTickets() {
      if (this.currentFilter === 'Tout') return this.tickets
      return this.tickets.filter((t) => t.statut === this.currentFilter)
    },
    ticketStats() {
      const tickets = Array.isArray(this.tickets) ? this.tickets : []

      const statuses = tickets.map((ticket) => this.normalizeStatus(ticket?.statut))
      const traites = statuses.filter((status) => ['resolu', 'ferme'].includes(status)).length
      const enAttente = statuses.filter((status) => ['ouvert', 'en_cours'].includes(status)).length
      const total = statuses.length

      const note = total > 0 ? ((traites / total) * 5).toFixed(1) : '0.0'

      return {
        traites,
        enAttente,
        note,
      }
    },
  },

  watch: {
    // Dès que myTickets change, on recharge les données
    myTickets: {
      handler: 'fetchTickets',
    },
  },

  async mounted() {
    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/login')
      return
    }

    const userStr = localStorage.getItem('user')
    if (userStr) {
      this.user = JSON.parse(userStr)
    }

    await this.fetchTickets()
    // const API = '${import.meta.env.VITE_API_BASE}/api/ticket/tickets' // on définit l'URL de l'API pour récupérer les tickets
    // const API_It = '${import.meta.env.VITE_API_BASE}/api/ticket/itTickets' // on définit l'URL de l'API pour récupérer les tickets
    // const API_Rh = '${import.meta.env.VITE_API_BASE}/api/ticket/rhTickets'
    // let url = '${import.meta.env.VITE_API_BASE}/api/tickets/my-tickets'
    // if (role === 'it') {
    //   url = API_It
    // } else if (role === 'rh') {
    //   url = API_Rh
    // } else if (role === 'admin' || role === 'manager') {
    //   url = API_Rh // tous les tickets
    // }

    // if (userStr) {
    //   this.user = JSON.parse(userStr)
    // } else {
    //   this.$router.push('/login')
    // }

    // try {
    //   const token = localStorage.getItem('token')
    //   //'${import.meta.env.VITE_API_BASE}/api/tickets/my-tickets'
    //   const response = await fetch(url, {
    //     method: 'GET',
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //     },
    //   })

    //   const result = await response.json()
    //   if (response.ok) {
    //     console.log('Tickets chargés :', result.data)
    //     this.tickets = Array.isArray(result.data) ? result.data : []
    //   }
    // } catch (err) {
    //   console.error('Erreur de chargement des tickets', err)
    // }
  },
  methods: {
    // 1. La méthode fetchTickets mise à jour pour prendre en compte le filtre "Mes tickets" vs "Tous les tickets"
    async fetchTickets() {
      const userStr = localStorage.getItem('user')
      const stockedUser = userStr ? JSON.parse(userStr) : null
      const role = stockedUser?.role
      if (!userStr) {
        this.$router.push('/login')
        return
      }

      if (this.myTickets) {
        // Afficher les tickets de l'utilisateur connecté
        try {
          const token = localStorage.getItem('token')
          const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/ticket/my-tickets`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          const result = await response.json()
          if (response.ok) {
            this.tickets = Array.isArray(result.data) ? result.data : []
          } else {
            alert('Impossible de charger vos tickets.')
          }
        } catch (err) {
          console.error('Erreur de chargement des tickets', err)
        }
      } else {
        const API = `${import.meta.env.VITE_API_BASE}/api/ticket/tickets` // tous les tickets (admin/manager)
        const API_It = `${import.meta.env.VITE_API_BASE}/api/ticket/itTickets` // tickets IT
        const API_Rh = `${import.meta.env.VITE_API_BASE}/api/ticket/rhTickets` // tickets RH
        let url = `${import.meta.env.VITE_API_BASE}/api/ticket/my-tickets` // par défaut, on affiche les tickets de l'utilisateur connecté (pour les rôles autres que admin/manager)
        if (role === 'it') {
          url = API_It
        } else if (role === 'rh') {
          url = API_Rh
        } else if (role === 'admin' || role === 'manager') {
          url = API // tous les tickets
        }
        try {
          const token = localStorage.getItem('token')
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          const result = await response.json()
          if (response.ok) {
            this.tickets = Array.isArray(result.data) ? result.data : []
          } else {
            alert('Impossible de charger les tickets.')
          }
        } catch (err) {
          console.error('Erreur de chargement des tickets', err)
        }
      }
    },
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

      const normalized = this.normalizeStatus(status)

      const map = {
        ouvert: 'En attente',
        en_cours: 'En cours',
        resolu: 'Résolu',
        ferme: 'Fermé',
      }

      return map[normalized] || status
    },

    normalizeStatus(status) {
      return String(status || 'ouvert')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')
    },

    getStatusClass(status) {
      const normalized = this.normalizeStatus(status)

      const classMap = {
        ouvert: 'status-open',
        en_attente: 'status-open',
        en_cours: 'status-progress',
        resolu: 'status-resolved',
        ferme: 'status-closed',
      }

      return classMap[normalized] || 'status-open'
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
        const token = localStorage.getItem('token')
        const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/ticket/${id}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const result = await response.json()
        if (response.ok) {
          this.selectedTicket = result.data
        } else {
          alert('Impossible de charger les détails du ticket.')
        }
      } catch (error) {
        console.error('Erreur détails:', error)
      }
    },

    async submitTicket() {
      try {
        const token = localStorage.getItem('token')
        const userStr = JSON.parse(localStorage.getItem('user'))
        const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/ticket`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(this.newTicket),
        })

        const result = await response.json()

        if (response.ok) {
          // AJOUT DYNAMIQUE : On s'assure que les clés correspondent au v-for du tableau
          const createdTicket = {
            id: result.id,
            titre: this.newTicket.titre,
            nom: userStr.nom,
            prenom: userStr.prenom,
            statut: 'ouvert',
            created_at: new Date().toISOString(), // Dayjs formatera cela en "il y a quelques secondes"
          }

          this.tickets.unshift(createdTicket)
          this.showModal = false
          this.newTicket = { titre: '', categorie: 'Informatique', description: '' }
          this.showToast('success', 'Ticket créé avec succès')
        } else {
          this.showToast('error', result.message || 'Erreur lors de la création du ticket')
        }
      } catch (error) {
        console.error('Erreur :', error)
        this.showToast('error', 'Erreur lors de la création du ticket')
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
html, body {
  height: auto;        /* Permet au document de s'étirer */
  min-height: 100%;
  overflow-x: hidden;  /* Évite le scroll horizontal parasite */
}
.container {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

@media (max-width: 1024px) {
  /* ... tes styles existants ... */

  .modal-content {
    padding: 20px;      /* Réduire le padding interne pour gagner de la place */
    margin-top: 20px;   /* Evite que la modale colle au haut de l'écran */
    margin-bottom: 20px;
  }

  .description-box {
    font-size: 13px;    /* Un peu plus petit pour le confort */
    padding: 15px;
  }
}

/* Corps de la page ============================================ */

.main-content {
  width: calc(100% - 248px);
  margin-left: 248px;
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

/* Filtre role (Mes tickets / Tous les tickets) */
.roleFilter {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 22px;
  padding: 6px;
  border-radius: 999px;
  border: 1px solid #dbe3ea;
  background: linear-gradient(180deg, #f8fbfc 0%, #f1f5f9 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.role-filter-btn {
  border: none;
  background: transparent;
  color: #4b5563;
  border-radius: 999px;
  padding: 9px 14px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.01em;
  cursor: pointer;
  transition: all 0.2s ease;
}

.role-filter-btn:hover {
  background: rgba(13, 148, 136, 0.09);
  color: #0f766e;
}

.role-filter-btn.active {
  color: #ffffff;
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  box-shadow: 0 6px 12px rgba(15, 118, 110, 0.25);
}

/* Tableau */
.table-container {
  background: white;
  border-radius: 12px;
  overflow-x: auto;
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

.status-closed {
  background-color: #fee2e2;
  color: #ef4444;
}
.status-open {
  background-color: #f3f4f6;
  color: #6b7280;
}
.status-resolved {
  background-color: #dcfce7;
  color: #22c55e;
}
.status-progress {
  background-color: #fef3c7;
  color: #d97706;
}

/* Actions */
.icon-btn {
  background: #ecfeff;
  border: 1px solid #99f6e4;
  color: #0f766e;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  padding: 6px 10px;
  margin-right: 6px;
  opacity: 1;
  min-width: 54px;
}

.icon-btn:hover {
  background: #ccfbf1;
  border-color: #5eead4;
}

.actions {
  white-space: nowrap;
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
/* Fond de la modale */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: flex-start; /* Changé de 'center' à 'flex-start' pour permettre le scroll naturel */
  padding: 20px;           /* Espace de sécurité pour ne pas coller aux bords */
  overflow-y: auto;        /* Active le scroll sur l'overlay si le contenu dépasse */
  z-index: 2000;
}

/* Boîte de la modale */
.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 500px;
  max-width: 100%;
  margin: auto;            /* Centre la modale si elle est plus petite que l'écran */
  position: relative;
}

/* Spécifique aux détails */
.details-modal {
  width: 700px !important;
  max-width: 100%;
  /* Supprime le max-height et l'overflow-y ici, 
     on laisse l'overlay gérer le scroll global c'est plus fluide sur mobile */
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

@media (max-width: 1024px) {
  .main-content {
    width: 100%;
    margin-left: 0;
    padding: 78px 20px 20px;
  }

  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .detail-row {
    grid-template-columns: 1fr;
  }

  .roleFilter {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 80px 12px 16px;
  }

  .content-header {
    gap: 10px;
    margin-bottom: 18px;
  }

  .content-header h1 {
    font-size: 22px;
  }

  .btn-add-ticket {
    width: 100%;
    padding: 12px 14px;
    font-size: 14px;
    text-align: center;
  }

  .filters {
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 10px;
    margin-bottom: 14px;
    scrollbar-width: thin;
  }

  .filter-btn {
    white-space: nowrap;
    border: 1px solid #d1fae5;
    border-radius: 999px;
    padding: 8px 12px;
    background: #f8fffe;
  }

  .filter-btn.active {
    background: #0f766e;
    color: #fff;
  }

  .filter-btn.active::after {
    display: none;
  }

  .roleFilter {
    width: 100%;
    border-radius: 12px;
    justify-content: stretch;
    padding: 4px;
    margin-bottom: 14px;
  }

  .role-filter-btn {
    flex: 1;
    text-align: center;
    padding: 10px 8px;
  }

  .table-container {
    background: transparent;
    box-shadow: none;
    overflow: visible;
    margin-bottom: 24px;
  }

  table,
  tbody,
  tr,
  td {
    display: block;
    width: 100%;
  }

  thead {
    display: none;
  }

  tbody {
    display: grid;
    gap: 14px;
  }

  tr {
    border: 1px solid #d9f5f2;
    border-radius: 16px;
    background: linear-gradient(180deg, #ffffff 0%, #f8fbfc 100%);
    padding: 0;
    overflow: hidden;
    box-shadow: 0 10px 22px rgba(15, 23, 42, 0.1);
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas:
      'id status'
      'title title'
      'requester requester'
      'updated action';
  }

  td {
    border-bottom: 1px dashed #e5e7eb;
    padding: 10px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: #1f2937;
  }

  td:last-child {
    border-bottom: none;
    padding-bottom: 4px;
  }

  td::before {
    content: attr(data-label);
    font-size: 11px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 700;
    min-width: 118px;
  }

  .ticket-id {
    grid-area: id;
    font-weight: 700;
    color: #0f766e;
    background: linear-gradient(180deg, #f0fdfa 0%, #ecfeff 100%);
    border-bottom: none;
    padding-bottom: 8px;
  }

  .ticket-title {
    grid-area: title;
    font-weight: 600;
    font-size: 14px;
    color: #0f172a;
    border-top: 1px dashed #dbeafe;
  }

  .ticket-requester {
    grid-area: requester;
  }

  .ticket-status {
    grid-area: status;
    border-bottom: none;
    justify-content: flex-end;
    padding-bottom: 8px;
    background: linear-gradient(180deg, #f0fdfa 0%, #ecfeff 100%);
  }

  .ticket-status .status-badge {
    margin-left: 0;
  }

  .ticket-updated {
    grid-area: updated;
    color: #334155;
    border-bottom: none;
  }

  .ticket-id::before,
  .ticket-status::before,
  .ticket-title::before,
  .actions::before {
    display: none;
  }

  .actions {
    grid-area: action;
    justify-content: flex-end;
    border-bottom: none;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .icon-btn {
    margin-right: 0;
    min-width: 44px;
    border-radius: 10px;
  }

  .status-badge {
    white-space: nowrap;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .stat-card {
    border: 1px solid #dbeafe;
    box-shadow: 0 8px 14px rgba(15, 23, 42, 0.08);
    padding: 14px;
  }

  .stat-label {
    font-size: 12px;
  }

  .stat-value {
    font-size: 22px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 76px 8px 12px;
  }

  .content-header h1 {
    font-size: 20px;
  }

  td::before {
    min-width: 92px;
    font-size: 10px;
  }

  td {
    padding: 9px 10px;
    font-size: 12px;
  }

  .ticket-title {
    font-size: 13px;
  }

  .icon-btn {
    min-width: 44px;
    padding: 6px 8px;
  }

  tr {
    border-radius: 14px;
    box-shadow: 0 8px 16px rgba(15, 23, 42, 0.09);
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .modal-overlay {
    padding: 10px;
  }

  .modal-content {
    padding: 16px;
  }
}
</style>
