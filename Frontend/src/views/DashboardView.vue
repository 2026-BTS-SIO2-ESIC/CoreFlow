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
              <p><strong>A2F :</strong> {{ user?.twofa_enabled ? 'Activée' : 'Désactivée' }}</p>
            </div>
            <button @click="openPasswordModal" class="btn-password">Modifier mon mot de passe</button>
            <button @click="openTwofaModal" class="btn-password btn-twofa">
              {{ user?.twofa_enabled ? 'Gérer mon A2F TOTP' : 'Activer mon A2F TOTP' }}
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
          <div class="password-input-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="passwordForm.oldPass"
              placeholder="••••••••"
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>Nouveau mot de passe</label>
          <div class="password-input-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="passwordForm.newPass"
              placeholder="••••••••"
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>Confirmer le nouveau mot de passe</label>
          <div class="password-input-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="passwordForm.confirmPass"
              placeholder="••••••••"
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="closePasswordModal" class="btn-cancel">Annuler</button>
          <button @click="handlePasswordChange" class="btn-save" :disabled="modalLoading">
            {{ modalLoading ? 'Mise à jour...' : 'Mettre à jour' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL A2F TOTP -->
    <div v-if="showTwofaModal" class="modal-overlay" @click.self="closeTwofaModal">
      <div class="modal-card twofa-modal-card">
        <div class="modal-header">
          <h3>🔐 A2F TOTP</h3>
          <button class="modal-close" @click="closeTwofaModal">✕</button>
        </div>

        <div v-if="twofaError" class="modal-error">{{ twofaError }}</div>
        <div v-if="twofaSuccess" class="modal-success">{{ twofaSuccess }}</div>

        <template v-if="twofaModalMode === 'setup'">
          <p class="twofa-help">
            Scannez le QR code avec Google Authenticator, Authy ou Microsoft Authenticator, puis
            saisissez le code à 6 chiffres pour activer l'A2F.
          </p>

          <div v-if="twofaLoading && !twofaSecret" class="twofa-loading">Génération de la clé…</div>

          <div v-else>
            <div v-if="twofaQrDataUrl" class="twofa-qr-box">
              <img :src="twofaQrDataUrl" alt="QR code A2F" class="twofa-qr" />
            </div>

            <div class="twofa-secret-box">
              <span class="twofa-secret-label">Clé secrète</span>
              <code class="twofa-secret">{{ twofaSecret }}</code>
            </div>

            <div class="form-group">
              <label>Code TOTP</label>
              <input
                v-model="twofaCode"
                type="text"
                inputmode="numeric"
                autocomplete="one-time-code"
                maxlength="6"
                placeholder="123456"
              />
            </div>
          </div>
        </template>

        <template v-else>
          <p class="twofa-help">
            Votre A2F est active. Si vous la désactivez, vous pourrez vous reconnecter sans code
            TOTP jusqu'à une nouvelle activation.
          </p>
        </template>

        <div class="modal-actions">
          <button @click="closeTwofaModal" class="btn-cancel">Annuler</button>
          <button
            v-if="twofaModalMode === 'setup'"
            @click="confirmTwofaSetup"
            class="btn-save"
            :disabled="twofaLoading"
          >
            {{ twofaLoading ? 'Activation...' : 'Activer' }}
          </button>
          <button
            v-else
            @click="disableTwofa"
            class="btn-save"
            :disabled="twofaLoading"
          >
            {{ twofaLoading ? 'Désactivation...' : 'Désactiver' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import DashboardSidebar from '../components/DashboardSidebar.vue';
import CreateEventModal from '@/components/CreateEventModal.vue';
import EventList from '@/components/EventList.vue';
import QRCode from 'qrcode';

const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export default {
  name: 'DashboardView',
  components: {
    DashboardSidebar,
    CreateEventModal,
    EventList,
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
      showPassword: false,
      modalLoading: false,
      modalError: null,
      modalSuccess: null,
      passwordForm: { oldPass: '', newPass: '', confirmPass: '' },

      // Modal A2F
      showTwofaModal: false,
      twofaModalMode: 'setup',
      twofaLoading: false,
      twofaError: null,
      twofaSuccess: null,
      twofaSecret: '',
      twofaQrDataUrl: '',
      twofaCode: '',
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
        const response = await axios.get(`${import.meta.env.VITE_API_BASE}/api/event/all`);
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
      this.showPassword = false
      this.passwordForm = { oldPass: '', newPass: '', confirmPass: '' }
      this.showPasswordModal = true
    },

    closePasswordModal() {
      if (this.modalLoading) return
      this.showPassword = false
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

    async openTwofaModal() {
      this.twofaError = null;
      this.twofaSuccess = null;
      this.twofaCode = '';
      this.twofaSecret = '';
      this.twofaQrDataUrl = '';
      this.twofaModalMode = this.user?.twofa_enabled ? 'disable' : 'setup';
      this.showTwofaModal = true;

      if (this.twofaModalMode === 'setup') {
        await this.prepareTwofaSetup();
      }
    },

    closeTwofaModal() {
      if (this.twofaLoading) {
        return;
      }

      this.showTwofaModal = false;
      this.twofaError = null;
      this.twofaSuccess = null;
      this.twofaCode = '';
      this.twofaSecret = '';
      this.twofaQrDataUrl = '';
    },

    async prepareTwofaSetup() {
      const token = localStorage.getItem('token');
      this.twofaLoading = true;

      try {
        const response = await fetch(`${API_URL}/api/auth/2fa/setup`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          this.twofaError = data.message || "Impossible de préparer l'A2F.";
          return;
        }

        this.twofaSecret = data.data.secret;
        this.twofaQrDataUrl = await QRCode.toDataURL(data.data.otpauthUrl, {
          width: 220,
          margin: 1,
        });
      } catch (error) {
        console.error('Erreur préparation A2F:', error);
        this.twofaError = 'Impossible de générer la configuration A2F.';
      } finally {
        this.twofaLoading = false;
      }
    },

    async confirmTwofaSetup() {
      if (!this.twofaCode) {
        this.twofaError = 'Veuillez saisir le code TOTP.';
        return;
      }

      const token = localStorage.getItem('token');
      this.twofaLoading = true;
      this.twofaError = null;

      try {
        const response = await fetch(`${API_URL}/api/auth/2fa/confirm`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: this.twofaCode,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          this.twofaError = data.message || 'Code TOTP invalide.';
          return;
        }

        this.user = data.data.user;
        localStorage.setItem('user', JSON.stringify(data.data.user));
        this.twofaSuccess = 'A2F activée avec succès.';
        this.showTwofaModal = false;
      } catch (error) {
        console.error('Erreur confirmation A2F:', error);
        this.twofaError = 'Impossible de valider le code TOTP.';
      } finally {
        this.twofaLoading = false;
      }
    },

    async disableTwofa() {
      const token = localStorage.getItem('token');
      this.twofaLoading = true;
      this.twofaError = null;

      try {
        const response = await fetch(`${API_URL}/api/auth/2fa/disable`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          this.twofaError = data.message || "Impossible de désactiver l'A2F.";
          return;
        }

        this.user = data.data.user;
        localStorage.setItem('user', JSON.stringify(data.data.user));
        this.twofaSuccess = 'A2F désactivée.';
        this.showTwofaModal = false;
      } catch (error) {
        console.error('Erreur désactivation A2F:', error);
        this.twofaError = "Impossible de désactiver l'A2F.";
      } finally {
        this.twofaLoading = false;
      }
    }
  }
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
.btn-password:hover { opacity: 0.88; transform: translateY(-1px); }

.btn-twofa { margin-top: 10px; }

.btn-twofa { margin-top: 10px; }

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
.password-input-wrapper {
  position: relative;
}
.form-group input {
  width: 100%;
  padding: 10px 12px;
  padding-right: 42px;
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

.modal-actions { display: flex; gap: 10px; margin-top: 24px; }
.btn-cancel { flex: 1; padding: 10px; background: #f9fafb; color: #6b7280; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; }
.btn-cancel:hover { background: #f3f4f6; }
.btn-save { flex: 1; padding: 10px; background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; transition: opacity 0.2s; }
.btn-save:hover:not(:disabled) { opacity: 0.88; }
.btn-save:disabled { opacity: 0.55; cursor: not-allowed; }

.twofa-modal-card { width: 520px; }
.twofa-help { margin: 0 0 16px; color: #4b5563; font-size: 14px; line-height: 1.5; }
.twofa-loading { padding: 24px 0; text-align: center; color: #6b7280; }
.twofa-qr-box { display: flex; justify-content: center; margin: 10px 0 18px; }
.twofa-qr { width: 220px; height: 220px; border-radius: 16px; background: #fff; padding: 10px; border: 1px solid #e5e7eb; }
.twofa-secret-box { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; }
.twofa-secret-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.6px; color: #6b7280; font-weight: 700; }
.twofa-secret { display: block; padding: 12px 14px; border-radius: 10px; background: #f8fafc; border: 1px solid #e5e7eb; color: #111827; word-break: break-all; }
</style>