<template>
  <div class="dashboard">
    <!-- SIDEBAR -->
    <div class="sidebar">
      <div class="logo">
        <div class="logo-icon">C</div>
        <div class="logo-text">CoreFlow</div>
      </div>
      <nav class="nav-menu">
        <a href="#" class="nav-item active">
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
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          Documents
        </a>

        <a @click="goToEventPanel" class="nav-item">
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

        <a href="#" class="nav-item">
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
        </a>
        <div
          v-if="
            user && (user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'manager')
          "
        >
          <a @click="goToAdminPanel" class="nav-item">
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
        <div v-if="loading" class="user-loading">Chargement...</div>
        <div v-else-if="user">
          <div class="user-name">{{ user.nom }} {{ user.prenom }}</div>
          <div class="user-role">{{ user.role }}</div>
        </div>
        <button @click="logout" class="btn-logout">Déconnexion</button>
      </div>
    </div>

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
          <div class="stat-info">
            <label>Prochain Événement</label>
            <p>Aucun événement planifié</p>
          </div>
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
const API_URL = 'http://localhost:3000'

export default {
  name: 'DashboardView',

  // ── Données réactives ────────────────────────────────
  data() {
    return {
      user: null,
      loading: true,
      error: null,
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
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$router.push('/login')
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

/* ── Sidebar ────────────────────────────────────────── */
.sidebar {
  width: 248px;
  height: 100vh;
  background: #ffffff;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.04);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 26px 20px 20px;
  border-bottom: 1px solid #f4f4f5;
}

.logo-icon {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 18px;
  box-shadow: 0 4px 10px rgba(20, 184, 166, 0.35);
  flex-shrink: 0;
}

.logo-text {
  font-size: 17px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.3px;
}

.nav-menu {
  flex: 1;
  padding: 12px 10px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  color: #6b7280;
  text-decoration: none;
  transition:
    background 0.18s ease,
    color 0.18s ease;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  margin-bottom: 2px;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: #f0fdfa;
  color: #0d9488;
}

.nav-item.active {
  background: #f0fdfa;
  color: #0d9488;
  font-weight: 600;
  border-left: 3px solid #14b8a6;
}

.nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.user-profile {
  padding: 14px 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  background: #fafafa;
}

.user-loading {
  font-size: 13px;
  color: #9ca3af;
}
.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  text-align: center;
  line-height: 1.3;
}
.user-role {
  font-size: 11px;
  color: #9ca3af;
  text-align: center;
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
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

.btn-logout {
  width: 100%;
  padding: 9px 16px;
  background: #fff0f0;
  color: #ef4444;
  border: 1px solid #fecaca;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}
.btn-logout:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
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
