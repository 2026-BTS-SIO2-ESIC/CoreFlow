<template>
  <div class="dashboard">
    <DashboardSidebar :user="user" :loading="loading" @logout="logout" />

    <!-- CONTENU PRINCIPAL -->
    <div class="main-content">
      <div class="dashboard-header">
        <div v-if="loading" class="header-loading">Chargement...</div>
        <div v-else class="header-content">
          <div class="header-left">
            <h1>Bonjour, {{ user?.prenom || 'Bienvenue' }} 👋</h1>
            <p class="header-subtitle">{{ currentDate }} — {{ user?.departement || 'CoreFlow' }}</p>
          </div>
          <div class="header-right" v-if="user">
            <div class="header-badge">{{ user.role }}</div>
          </div>
        </div>
      </div>

      <div v-if="error" class="error-banner">{{ error }}</div>

      <!-- Cartes stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="icon">📅</span>
          <div class="stat-info">
            <label>Solde Congés</label>
            <p>
              {{
                user?.['solde_congés'] != null
                  ? user['solde_congés'] + ' jours restants'
                  : 'Non disponible'
              }}
            </p>
          </div>
        </div>
        <div class="stat-card">
          <span class="icon">💻</span>
          <div class="stat-info">
            <label>Mon Service</label>
            <p>{{ user?.departement || 'Non défini' }}</p>
          </div>
        </div>
        <div class="stat-card">
          <span class="icon">🗓️</span>
          <div class="events-dashboard-section">
          <CreateEventModal v-if="user && (user.role === 'admin' || user.role === 'manager')" />
          
            <div class="events-container">
              <EventList title="🚀 Événements à venir" :events="upcomingEvents" />
              <div class="spacer-v"></div>
              <EventList title="📜 Historique" :events="pastEvents" class="past-events-style" />
            </div>
        </div>
          <!-- <div class="stat-info">
            <label>Prochain Événement</label>
            <p>Aucun événement planifié</p>
          </div> -->
        </div>
      </div>

      <!-- Contenu bas -->
      <div class="dashboard-core">
        <div class="actions-panel">
          <h3>🔔 Mes Actions en Attente</h3>
          <div class="empty-state">
            <p>Aucune action en attente.</p>
          </div>
        </div>

        <div class="side-panels">
          <div class="profile-security-card">
            <h3>🛡️ Profil & Sécurité</h3>
            <div class="secure-info">
              <p><strong>Mail :</strong> {{ user?.email || '—' }}</p>
              <p><strong>Service :</strong> {{ user?.departement || '—' }}</p>
              <p><strong>Rôle :</strong> {{ user?.role || '—' }}</p>
            </div>
            <button @click="openPasswordModal" class="btn-password">
              Modifier mon mot de passe
            </button>
          </div>

          <div class="company-life">
            <h3>📢 Vie de l'entreprise</h3>
            <div class="empty-state">
              <p>Aucune annonce pour le moment.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL MOT DE PASSE -->
    <div v-if="showPasswordModal" class="modal-overlay" @click.self="closePasswordModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>🔒 Modifier mon mot de passe</h3>
          <button class="modal-close" @click="closePasswordModal">✕</button>
        </div>

        <div v-if="modalError" class="modal-error">{{ modalError }}</div>
        <div v-if="modalSuccess" class="modal-success">{{ modalSuccess }}</div>

        <div class="form-group">
          <label>Mot de passe actuel</label>
          <input type="password" v-model="passwordForm.oldPass" placeholder="••••••••" />
        </div>

        <div class="form-group">
          <label>Nouveau mot de passe</label>
          <input type="password" v-model="passwordForm.newPass" placeholder="••••••••" />
        </div>

        <div class="form-group">
          <label>Confirmer le nouveau mot de passe</label>
          <input type="password" v-model="passwordForm.confirmPass" placeholder="••••••••" />
        </div>

        <div class="modal-actions">
          <button @click="closePasswordModal" class="btn-cancel">Annuler</button>
          <button @click="handlePasswordChange" class="btn-save" :disabled="modalLoading">
            {{ modalLoading ? 'Mise à jour...' : 'Mettre à jour' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardSidebar from '../components/DashboardSidebar.vue'

const API_URL = 'http://localhost:3000'

import axios from 'axios';
import CreateEventModal from '@/components/CreateEventModal.vue';
import EventList from '@/components/EventList.vue';

export default {
  name: 'DashboardView',
  components: {
    DashboardSidebar,CreateEventModal, EventList
  },

  // ── Données réactives ────────────────────────────────
  data() {
    return {
      user: null,
      loading: true,
      error: null,

      upcomingEvents: [],
      pastEvents: [],

      // Modal mot de passe
      showPasswordModal: false,
      modalLoading: false,
      modalError: null,
      modalSuccess: null,
      passwordForm: { oldPass: '', newPass: '', confirmPass: '' },
    }
  },

  // ── Propriétés calculées ─────────────────────────────
  computed: {
    currentDate() {
      return new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    },
  },

  // ── Chargement initial ───────────────────────────────
  async mounted() {
    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/login')
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        this.$router.push('/login')
        return
      }

      const data = await response.json()
      this.user = data.data
      localStorage.setItem('user', JSON.stringify(data.data))
    } catch (err) {
      this.error = 'Impossible de contacter le serveur.'
      const userStr = localStorage.getItem('user')
      if (userStr) this.user = JSON.parse(userStr)
    } finally {
      this.loading = false
    }
  },

  // ── Actions ──────────────────────────────────────────
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
    goToAdminPanel() {
      this.$router.push('/admin/users')
    },
    goToEventPanel() {
      try {
        this.$router.push('/event/create')
      } catch (err) {
        console.error('Error navigating to event panel:', err)
      }
    },
    openPasswordModal() {
      this.modalError = null
      this.modalSuccess = null
      this.passwordForm = { oldPass: '', newPass: '', confirmPass: '' }
      this.showPasswordModal = true
    },

    closePasswordModal() {
      if (this.modalLoading) return
      this.showPasswordModal = false
    },

    async handlePasswordChange() {
      this.modalError = null
      this.modalSuccess = null

      if (!this.passwordForm.oldPass) {
        this.modalError = 'Veuillez saisir votre mot de passe actuel.'
        return
      }
      if (this.passwordForm.newPass.length < 4) {
        this.modalError = 'Le nouveau mot de passe doit faire au moins 4 caractères.'
        return
      }
      if (this.passwordForm.newPass !== this.passwordForm.confirmPass) {
        this.modalError = 'Les mots de passe ne correspondent pas.'
        return
      }

      const token = localStorage.getItem('token')
      this.modalLoading = true

      try {
        const res = await fetch(`${API_URL}/api/users/password`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            oldPass: this.passwordForm.oldPass,
            newPass: this.passwordForm.newPass,
          }),
        })

        const data = await res.json()
        if (!res.ok) {
          this.modalError = data.message || 'Erreur lors de la mise à jour.'
        } else {
          this.modalSuccess = 'Mot de passe mis à jour avec succès.'
          this.passwordForm = { oldPass: '', newPass: '', confirmPass: '' }
        }
      } catch (err) {
        this.modalError = 'Impossible de contacter le serveur.'
      } finally {
        this.modalLoading = false
      }
    },
  },
}
</script>

<style scoped>
/* ── Base ───────────────────────────────────────────── */
.dashboard {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family:
    'Inter',
    system-ui,
    -apple-system,
    sans-serif;
}

/* ── Contenu principal ──────────────────────────────── */
.main-content {
  margin-left: 248px;
  padding: 28px 32px;
  background: #f4f6f8;
  min-height: 100vh;
}

/* ── Header ─────────────────────────────────────────── */
.dashboard-header {
  background: white;
  border-radius: 16px;
  padding: 24px 28px;
  margin-bottom: 24px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
  border-left: 4px solid #14b8a6;
}

.header-loading {
  font-size: 14px;
  color: #9ca3af;
}
.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-left h1 {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 5px 0;
  letter-spacing: -0.4px;
}
.header-subtitle {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
  text-transform: capitalize;
}
.header-badge {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 20px;
  letter-spacing: 0.4px;
  text-transform: capitalize;
  box-shadow: 0 3px 10px rgba(20, 184, 166, 0.3);
}

/* ── Bannière erreur ────────────────────────────────── */
.error-banner {
  background: #fef2f2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 14px;
  border-left: 4px solid #ef4444;
}

/* ── Cartes stats ───────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 20px 22px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
  border: 1px solid #f3f4f6;
}
.stat-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.icon {
  font-size: 26px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0fdfa;
  border-radius: 12px;
  flex-shrink: 0;
}
.stat-info label {
  font-size: 11px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  display: block;
}
.stat-info p {
  font-weight: 700;
  margin: 5px 0 0;
  color: #111827;
  font-size: 14px;
}

/* ── Grille basse ───────────────────────────────────── */
.dashboard-core {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 18px;
}

.actions-panel,
.profile-security-card,
.company-life {
  background: white;
  padding: 22px 24px;
  border-radius: 14px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;
}
.actions-panel h3,
.profile-security-card h3,
.company-life h3 {
  margin: 0 0 16px 0;
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}
.empty-state {
  padding: 28px 0;
  text-align: center;
  color: #c4c9d4;
  font-size: 13px;
}
.empty-state p {
  margin: 0;
}
.side-panels {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.secure-info {
  display: flex;
  flex-direction: column;
}
.secure-info p {
  margin: 0;
  padding: 8px 0;
  font-size: 13px;
  color: #4b5563;
  border-bottom: 1px solid #f9fafb;
  display: flex;
  gap: 6px;
}
.secure-info p:last-child {
  border-bottom: none;
}
.secure-info strong {
  color: #6b7280;
  font-weight: 600;
  min-width: 60px;
}

/* ── Boutons ────────────────────────────────────────── */
.btn-password {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 16px;
  font-size: 13px;
  font-weight: 600;
  transition:
    opacity 0.2s ease,
    transform 0.15s ease;
}
.btn-password:hover {
  opacity: 0.88;
  transform: translateY(-1px);
}

/* ── Modal ──────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-card {
  background: white;
  border-radius: 16px;
  padding: 28px 32px;
  width: 420px;
  max-width: 90vw;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}
.modal-close {
  background: none;
  border: none;
  font-size: 16px;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.15s;
}
.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-error {
  background: #fef2f2;
  color: #dc2626;
  border-left: 4px solid #ef4444;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 16px;
}
.modal-success {
  background: #f0fdfa;
  color: #0d9488;
  border-left: 4px solid #14b8a6;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}
.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}
.form-group input:focus {
  border-color: #14b8a6;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.12);
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 24px;
}
.btn-cancel {
  flex: 1;
  padding: 10px;
  background: #f9fafb;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.btn-cancel:hover {
  background: #f3f4f6;
}
.btn-save {
  flex: 1;
  padding: 10px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: opacity 0.2s;
}
.btn-save:hover:not(:disabled) {
  opacity: 0.88;
}
.btn-save:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>