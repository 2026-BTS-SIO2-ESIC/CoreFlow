<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay">
        <div class="modal-backdrop" aria-hidden="true" @click="$emit('close')" />
        <div
          class="modal-box"
          role="dialog"
          @click.stop
          aria-labelledby="detail-modal-title"
          aria-modal="true"
        >
          <div class="modal-header">
            <div class="header-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 id="detail-modal-title">Détails de l'événement</h2>
            <button type="button" class="btn-close" aria-label="Fermer" @click="$emit('close')">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div v-if="loading" class="detail-loading">
              <div class="spinner" />
              <span>Chargement...</span>
            </div>
            <div v-else-if="error" class="detail-error">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {{ error }}
            </div>
            <div v-else-if="event" class="detail-content">
              <div class="detail-hero">
                <span class="detail-type-badge">{{ formatType(event.type_evenement) }}</span>
                <h3 class="detail-title">{{ event.titre }}</h3>
                <span class="detail-badge" :class="'badge-' + (event.statut || 'planifie')">
                  {{ formatStatut(event.statut) }}
                </span>
              </div>

              <p v-if="event.description" class="detail-desc">{{ event.description }}</p>

              <div class="detail-section">
                <h4 class="section-title">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Horaires
                </h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="item-icon item-icon-start">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </span>
                    <div>
                      <span class="item-label">Début</span>
                      <span class="item-value">{{ formatDateTime(event.date_debut) }}</span>
                    </div>
                  </div>
                  <div class="detail-item">
                    <span class="item-icon item-icon-end">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </span>
                    <div>
                      <span class="item-label">Fin</span>
                      <span class="item-value">{{ formatDateTime(event.date_fin) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="event.lieu" class="detail-section">
                <h4 class="section-title">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Lieu
                </h4>
                <p class="detail-lieu">{{ event.lieu }}</p>
              </div>

              <div class="detail-section detail-meta">
                <div class="meta-item" v-if="event.nb_places_max != null">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span>{{ event.nb_places_max }} place{{ event.nb_places_max > 1 ? 's' : '' }} max</span>
                </div>
                <div class="meta-item">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span>{{ event.est_obligatoire ? 'Obligatoire' : 'Optionnel' }}</span>
                </div>
                <div class="meta-item">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span>{{ event.niveau === '1' ? 'Entreprise' : 'Département' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="canDelete" class="modal-footer">
  <button @click="handleDelete" :disabled="deleting" class="btn-delete-full">
    <svg v-if="!deleting" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
    <span>{{ deleting ? 'Suppression...' : 'Supprimer cet événement' }}</span>
  </button>
</div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { API_URL } from '../composables/useAuth'

const TYPE_LABELS = {
  reunion: 'Réunion',
  formation: 'Formation',
  conference: 'Conférence',
  atelier: 'Atelier',
  afterwork: 'Afterwork',
  seminaire: 'Séminaire',
  autre: 'Autre',
}

const STATUT_LABELS = {
  planifie: 'Planifié',
  en_cours: 'En cours',
  termine: 'Terminé',
  annule: 'Annulé',
}

export default {
  name: 'DetailCardEvent',
  props: {
    show: { type: Boolean, default: false },
    eventId: { type: [Number, String], default: null },
  },
  emits: ['close'],
  data() {
    return {
      event: null,
      loading: false,
      error: null,
      deleting: false,
    }
  },
  computed: {
    canDelete() {
      if (!this.event) return false;

      const token = localStorage.getItem('token');
      if (!token) return false;

      try {
        // Décode le milieu du JWT (le payload) qui contient id et role
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Vérifie si l'ID utilisateur du token match l'organisateur_id de la DB
        const isOwner = this.event.organisateur_id === payload.id;
        const isAdmin = payload.role === 'admin' || payload.role === 'manager';

        return isOwner || isAdmin;
      } catch (e) {
        return false;
      }
    }
  },
  watch: {
    eventId: {
      handler(newId) {
        if (newId && this.show) this.fetchEvent(newId)
        else this.resetState()
      },
      immediate: true,
    },
    show(newVal) {
      if (newVal && this.eventId) this.fetchEvent(this.eventId)
      else if (!newVal) this.resetState()
    },
  },
  methods: {
    resetState() {
      this.event = null
      this.loading = false
      this.error = null
    },
    async fetchEvent(id) {
      if (!id) return
      this.resetState()
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_URL}/event/list/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok && data.event && data.event.length) {
          this.event = data.event[0]
        } else if (data.error?.message) {
          this.error = data.error.message
        } else {
          this.error = "L'événement est introuvable."
        }
      } catch (e) {
        this.error = "Erreur lors du chargement de l'événement."
        console.error(e)
      } finally {
        this.loading = false
      }
    },
    formatType(type) {
      return (type && TYPE_LABELS[type]) || type || '-'
    },
    formatStatut(statut) {
      return (statut && STATUT_LABELS[statut]) || statut || '-'
    },
    formatDateTime(str) {
      if (!str) return '-'
      const d = new Date(str.replace(' ', 'T'))
      if (isNaN(d.getTime())) return str
      return d.toLocaleString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },

    async handleDelete() {
  if (!confirm("Voulez-vous vraiment supprimer cet événement ?")) return;

  try {
    const token = localStorage.getItem('token');
    if (!token) return alert("Session expirée");

    // 1. Décodage du token pour récupérer tes infos (id et role)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentUserId = payload.id;
    const currentUserRole = payload.role;

    // 2. Construction de l'URL exacte qui a marché dans ton test
    // Format: /delete/:id/:userRole/:user_id/
    const deleteUrl = `${API_URL}/event/delete/${this.event.id}/${currentUserRole}/${currentUserId}`;

    console.log("Tentative de suppression via :", deleteUrl);

    this.deleting = true;
    const res = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (res.ok) {
      alert("Événement supprimé avec succès !");
      this.$emit('close'); 
      location.reload(); // Pour rafraîchir le dashboard et libérer la salle (Point 4)
    } else {
      const data = await res.json();
      alert(data.error || "Erreur lors de la suppression");
    }
  } catch (e) {
    console.error("Erreur suppression:", e);
    alert("Erreur technique lors de la suppression.");
  } finally {
    this.deleting = false;
  }
}

  },
}


</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
}
.modal-box {
  position: relative;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
  border-radius: 16px 16px 0 0;
  color: #fff;
}
.header-icon {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}
.header-icon svg {
  width: 1.35rem;
  height: 1.35rem;
}
.modal-header h2 {
  margin: 0;
  flex: 1;
  font-size: 1.125rem;
  font-weight: 600;
  color: #fff;
}
.btn-close {
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  color: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}
.btn-close:hover {
  background: rgba(255, 255, 255, 0.35);
}
.btn-close svg {
  width: 1.125rem;
  height: 1.125rem;
}

.modal-body {
  padding: 1.5rem;
}

.detail-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2.5rem;
  color: #64748b;
  font-size: 0.9375rem;
}
.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid #e2e8f0;
  border-top-color: #14b8a6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.detail-error {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  color: #b91c1c;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid #fecaca;
  border-radius: 12px;
  font-size: 0.9375rem;
}
.detail-error svg {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.detail-hero {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.75rem;
  margin-bottom: 0.25rem;
}
.detail-type-badge {
  padding: 0.25rem 0.6rem;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #0f766e;
  background: #ccfbf1;
  border-radius: 6px;
}
.detail-title {
  width: 100%;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
}
.detail-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 8px;
}
.badge-planifie {
  background: #e0f2fe;
  color: #0369a1;
}
.badge-en_cours {
  background: #fef3c7;
  color: #b45309;
}
.badge-termine {
  background: #f1f5f9;
  color: #475569;
}
.badge-annule {
  background: #fee2e2;
  color: #b91c1c;
}

.detail-desc {
  margin: 0;
  font-size: 0.9375rem;
  color: #475569;
  line-height: 1.6;
  padding: 1rem 1.25rem;
  background: #f8fafc;
  border-radius: 10px;
  border-left: 3px solid #14b8a6;
}

.detail-section {
  padding: 1rem 1.25rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.75rem 0;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.section-title svg {
  width: 1rem;
  height: 1rem;
  color: #14b8a6;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem 0;
}
.item-icon {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  flex-shrink: 0;
}
.item-icon svg {
  width: 1rem;
  height: 1rem;
}
.item-icon-start {
  background: #ccfbf1;
  color: #0d9488;
}
.item-icon-end {
  background: #e0f2fe;
  color: #0284c7;
}
.detail-item div {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.item-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #94a3b8;
}
.item-value {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #334155;
}

.detail-lieu {
  margin: 0;
  font-size: 0.9375rem;
  color: #334155;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
  padding: 1rem 1.25rem;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #475569;
}
.meta-item svg {
  width: 1.125rem;
  height: 1.125rem;
  color: #14b8a6;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .modal-box,
.modal-leave-active .modal-box {
  transition: transform 0.25s ease;
}
.modal-enter-from .modal-box,
.modal-leave-to .modal-box {
  transform: scale(0.95) translateY(8px);
}

/* --- NOUVEAU STYLE POUR LE BOUTON DE SUPPRESSION --- */

.modal-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0; /* Même couleur que le séparateur des sections */
  display: flex;
  justify-content: center;
}

.btn-delete-full {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem;
  
  /* On réutilise les couleurs de ton design pour le hover de close */
  background: #fff;
  color: #dc2626; /* Rouge clair pour le texte */
  
  /* On réutilise tes styles de bordures existants */
  border: 1px solid #fecaca;
  border-radius: 12px; /* Même arrondi que tes sections detail-section */
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  /* Style d'ombre léger comme tes modals-box */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-delete-full:hover:not(:disabled) {
  /* On s'assure que le rouge ne jure pas avec ton vert émeraude */
  background: #fef2f2;
  border-color: #dc2626;
  color: #b91c1c; /* Rouge plus foncé au hover */
  transform: translateY(-1px);
}

.btn-delete-full:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* --- FIN DU NOUVEAU STYLE --- */

</style>
