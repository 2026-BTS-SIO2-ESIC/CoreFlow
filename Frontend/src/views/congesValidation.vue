<template>
  <div class="page">

    <DashboardSidebar 
    :user="user" 
    :loading="false" 
    @logout="logout" />

    <header class="header">
      <div class="logo">
        <span class="logo-icon">C</span>
        <h2>CoreFlow</h2>
      </div>

      <div class="user-role">
        RH
      </div>
    </header>

    <section class="title">
      <h1>Gestion des Congés</h1>
      <p>Validez ou refusez les demandes des utilisateurs</p>
    </section>

    <!-- STATS -->
    <div v-if="error" class="error-banner">{{ error }}</div>
    <div class="stats-section">
      <div class="stats-header">
        <h3>Statistiques des congés</h3>
        <button @click="loadData" class="refresh-btn" :disabled="loading">
          <span v-if="loading">⏳</span>
          <span v-else>🔄</span>
          Actualiser
        </button>
      </div>
      <div class="stats">
        <div class="stat orange">
          <p>En attente</p>
          <h2>{{ stats.en_attente || 0 }}</h2>
        </div>

        <div class="stat green">
          <p>Validés</p>
          <h2>{{ stats.valide || 0 }}</h2>
        </div>

        <div class="stat red">
          <p>Refusés</p>
          <h2>{{ stats.refuse || 0 }}</h2>
        </div>

        <div class="stat grey">
          <p>Annulés</p>
          <h2>{{ stats.annule || 0 }}</h2>
        </div>

        <div class="stat teal">
          <p>Total</p>
          <h2>{{ stats.total || 0 }}</h2>
        </div>
      </div>
    </div>

    <!-- LISTE -->
    <div v-for="c in conges" :key="c.id" class="conge-card">

      <div class="card-header">
        <div class="avatar">{{ (c.prenom?.[0] || 'U') + (c.nom?.[0] || '') }}</div>

        <div class="card-info">
          <h3>{{ c.prenom }} {{ c.nom }} - Demande #{{ c.id }}</h3>
          <p>{{ c.date_debut }} → {{ c.date_fin }}</p>
        </div>

        <span :class="['badge', `badge-${c.statut}`]">
          {{ formatStatut(c.statut) }}
        </span>
      </div>

      <div class="motif">
        "{{ c.motif }}"
      </div>

      <div class="actions">
        <template v-if="c.statut === 'en_attente'">
          <button class="refuse" @click="refuser(c.id)">
            Refuser
          </button>

          <button class="approve" @click="valider(c.id)">
            Approuver
          </button>
        </template>

        <template v-else>
          <button class="disabled" disabled>
            Statut traité
          </button>
        </template>
      </div>

    </div>

  </div>
</template>

<script>
import DashboardSidebar from "../components/DashboardSidebar.vue"
import { getMesConges, getStatsConges } from "../services/congesApi.js"

export default {
  components: {
    DashboardSidebar
  },

  data() {
    return {
      user: null,
      conges: [],
      stats: {},
      loading: false,
      error: null
    }
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

    await this.loadData()

    // Auto-refresh des stats toutes les 30 secondes
    this.statsRefreshInterval = setInterval(() => {
      this.loadStatsOnly()
    }, 30000)
  },

  beforeUnmount() {
    if (this.statsRefreshInterval) {
      clearInterval(this.statsRefreshInterval)
    }
  },

  methods: {

    async loadData() {
      this.loading = true
      this.error = null

      try {
        this.conges = await getMesConges()
        await this.loadStatsOnly()
      } catch (err) {
        this.error = err.message || 'Erreur lors du chargement des congés.'
        this.conges = []
        this.stats = {}
      } finally {
        this.loading = false
      }
    },

    async loadStatsOnly() {
      try {
        this.stats = await getStatsConges()
      } catch (err) {
        console.error('Erreur lors du chargement des stats:', err)
        // Ne pas afficher d'erreur pour les stats seules
      }
    },

    async valider(id) {
      const token = localStorage.getItem('token')

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/conges/${id}/valider`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Erreur lors de la validation')
        }

        await this.loadData()
      } catch (err) {
        this.error = err.message || 'Erreur lors de la validation du congé.'
      }
    },

    async refuser(id) {
      const token = localStorage.getItem('token')

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/conges/${id}/refuser`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Erreur lors du refus')
        }

        await this.loadData()
      } catch (err) {
        this.error = err.message || 'Erreur lors du refus du congé.'
      }
    },

    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$router.push('/login')
    },

    formatStatut(statut) {
      const statusMap = {
        'en_attente': 'En attente',
        'approuve': 'Approuvé',
        'refuse': 'Refusé',
        'annule': 'Annulé'
      }
      return statusMap[statut] || statut
    }
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.page {
  margin-left: 248px;
  padding: 32px 24px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.page>div:not(.error-banner):not(:first-child) {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.error-banner {
  background: #fee2e2;
  color: #b91c1c;
  padding: 12px 14px;
  border-left: 4px solid #ef4444;
  border-radius: 8px;
  margin-bottom: 18px;
  max-width: 1080px;
  margin-left: auto;
  margin-right: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  max-width: 1080px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  background: linear-gradient(135deg, #1e7f73 0%, #0d9488 100%);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(30, 127, 115, 0.25);
}

.logo h2 {
  margin: 0;
  font-size: 20px;
  color: #111827;
  font-weight: 700;
}

.user-role {
  background: linear-gradient(135deg, #1e7f73 0%, #0d9488 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(30, 127, 115, 0.25);
}

.title {
  text-align: center;
  margin-bottom: 28px;
  max-width: 1080px;
  margin-left: auto;
  margin-right: auto;
}

.title h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #0f172a;
  font-weight: 700;
}

.title p {
  margin: 0;
  color: #64748b;
  font-size: 15px;
}

.stats-section {
  max-width: 1080px;
  margin: 28px auto;
  width: 100%;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stats-header h3 {
  margin: 10px;
  font-size: 18px;
  color: #0f172a;
  font-weight: 600;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #1e7f73;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: #0d9488;
  transform: translateY(-1px);
}

.refresh-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  transform: none;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  /* grid-template-columns: repeat(4, 1fr); */
  gap: 20px;
  margin: 50px 0;
}

.stat {
  background: white;
  padding: 20px;
  padding-right: 100px;
  border-radius: 10px;
  border-left: 5px solid;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.stat p {
  margin: 0 0 6px 0;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.stat h2 {
  margin: 0;
  font-size: 24px;
  color: #0f172a;
  font-weight: 700;
}

.orange {
  border-color: #f97316;
}

.green {
  border-color: #22c55e;
}

.red {
  border-color: #ef4444;
}

.teal {
  border-color: #1e7f73;
}

.grey {
  border-color: #64748b;
}

.conge-card {
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  max-width: 1080px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  border-left: 4px solid #1e7f73;
}

.conge-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.avatar {
  width: 44px;
  height: 44px;
  min-width: 44px;
  background: linear-gradient(135deg, #1e7f73 0%, #0d9488 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 3px 10px rgba(30, 127, 115, 0.2);
}

.card-info {
  flex: 1;
  min-width: 200px;
}

.card-info h3 {
  margin: 0;
  font-size: 15px;
  color: #111827;
  font-weight: 600;
}

.card-info p {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #64748b;
}

.badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.badge-en_attente {
  background: #fed7aa;
  color: #92400e;
  border: 1px solid #fbbf24;
}

.badge-approuve {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #22c55e;
}

.badge-refuse {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #ef4444;
}

.badge-annule {
  background: #e2e8f0;
  color: #1e293b;
  border: 1px solid #94a3b8;
}

.actions .disabled {
  background: #cbd5e1;
  border: 1px solid #94a3b8;
  color: #1e293b;
  cursor: not-allowed;
}

.motif {
  margin: 12px 0;
  padding: 10px 12px;
  background: #f8fafc;
  border-left: 3px solid #1e7f73;
  border-radius: 6px;
  font-size: 13px;
  color: #475569;
  font-style: italic;
  line-height: 1.5;
}

.motif::before {
  content: '💬 ';
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.refuse,
.approve {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  min-width: 100px;
}

.refuse {
  background: #ef4444;
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
}

.refuse:hover {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.refuse:active {
  transform: translateY(0);
}

.approve {
  background: #22c55e;
  color: white;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.2);
}

.approve:hover {
  background: #16a34a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.approve:active {
  transform: translateY(0);
}

@media (max-width: 1024px) {
  .page {
    margin-left: 0;
    padding: 20px 16px;
  }

  .stat {
    padding-right: 28px;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .page {
    margin-left: 0;
    padding: 16px 12px;
  }

  .stats {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .stat {
    width: 100%;
    max-width: 300px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .badge {
    align-self: flex-start;
  }

  .actions {
    width: 100%;
    justify-content: flex-start;
  }

  .refuse,
  .approve {
    flex: 1;
    min-width: auto;
  }

  .title h1 {
    font-size: 22px;
  }
}

@media (max-width: 480px) {
  .page {
    padding: 12px 8px;
  }

  .header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .stats {
    gap: 12px;
  }

  .stat {
    padding: 12px;
  }

  .conge-card {
    padding: 12px 16px;
  }

  .card-header {
    gap: 12px;
  }

  .refuse,
  .approve {
    font-size: 12px;
    padding: 6px 12px;
  }
}
</style>