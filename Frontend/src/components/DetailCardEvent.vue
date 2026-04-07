<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay">
        <div class="modal-backdrop" aria-hidden="true" @click="$emit('close')" />
        <div class="modal-box" role="dialog" @click.stop aria-labelledby="detail-modal-title" aria-modal="true">
          <div class="modal-header">
            <div class="header-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 id="detail-modal-title">Détails de l'événement</h2>
            <button type="button" class="btn-close" aria-label="Fermer" @click="$emit('close')">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ error }}
            </div>
            <div v-else-if="event && !editMode" class="detail-content">
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
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Horaires
                </h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="item-icon item-icon-start">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Lieu
                </h4>
                <p class="detail-lieu">{{ event.lieu }}</p>
              </div>

              <div class="detail-section detail-meta">
                <div class="meta-item" v-if="event.nb_places_max != null">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{{ event.nb_places_max }} place{{
                    event.nb_places_max > 1 ? 's' : ''
                    }}
                    max</span>
                </div>
                <div class="meta-item">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>{{ event.est_obligatoire ? 'Obligatoire' : 'Optionnel' }}</span>
                </div>
                <div class="meta-item">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>{{ event.niveau === '1' ? 'Entreprise' : 'Département' }}</span>
                </div>
              </div>

              <div v-if="canEdit" class="detail-actions">
                <button type="button" class="btn-edit" @click="startEdit">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Modifier
                </button>
              </div>
            </div>

            <!-- Edit form -->
            <div v-else-if="event && editMode" class="detail-edit-form">
              <form @submit.prevent="handleUpdate">
                <div class="form-section">
                  <label>Titre *</label>
                  <input v-model="editForm.titre" type="text" required />
                </div>
                <div class="form-section">
                  <label>Description</label>
                  <textarea v-model="editForm.description" rows="2" />
                </div>
                <div class="form-section">
                  <label>Type *</label>
                  <select v-model="editForm.type_evenement" required>
                    <option value="reunion">Réunion</option>
                    <option value="formation">Formation</option>
                    <option value="afterwork">Afterwork</option>
                    <option value="seminaire">Séminaire</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div class="form-section form-grid-2">
                  <div>
                    <label>Date/heure début *</label>
                    <input v-model="editForm.date_debut" type="datetime-local" required />
                  </div>
                  <div>
                    <label>Date/heure fin *</label>
                    <input v-model="editForm.date_fin" type="datetime-local" required />
                  </div>
                </div>
                <div class="form-section">
                  <label>Lieu</label>
                  <input v-model="editForm.lieu" type="text" />
                </div>
                <div class="form-section form-grid-2">
                  <div>
                    <label>Statut</label>
                    <select v-model="editForm.statut">
                      <option value="planifie">Planifié</option>
                      <option value="en_cours">En cours</option>
                      <option value="termine">Terminé</option>
                      <option value="annule">Annulé</option>
                    </select>
                  </div>
                  <div>
                    <label>Niveau</label>
                    <select v-model="editForm.niveau">
                      <option value="1">Entreprise</option>
                      <option value="2">Département</option>
                    </select>
                  </div>
                </div>
                <div class="form-section form-grid-2">
                  <div>
                    <label>Places max</label>
                    <input v-model.number="editForm.nb_places_max" type="number" min="0" />
                  </div>
                  <div>
                    <label>Obligatoire</label>
                    <select v-model.number="editForm.est_obligatoire">
                      <option :value="0">Optionnel</option>
                      <option :value="1">Obligatoire</option>
                    </select>
                  </div>
                </div>
                <div v-if="updateError" class="form-error">{{ updateError }}</div>
                <div class="form-actions">
                  <button type="button" @click="cancelEdit">Annuler</button>
                  <button type="submit" :disabled="updateLoading">
                    {{ updateLoading ? 'Enregistrement...' : 'Enregistrer' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div v-if="canDelete" class="modal-footer">
            <button @click="handleDelete" :disabled="deleting" class="btn-delete-full">
              <svg v-if="!deleting" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
import { confirmAction, showErrorAlert, showInfoAlert } from '../utils/swal'

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
    user: { type: Object, default: null },
  },
  emits: ['close', 'updated'],
  data() {
    return {
      event: null,
      loading: false,
      error: null,
      deleting: false,
      editMode: false,
      editForm: {},
      updateError: null,
      updateLoading: false,
    }
  },
  computed: {
    canDelete() {
      const role = this.user?.role?.toLowerCase()
      return !!this.event && (role === 'admin' || role === 'manager')
    },
    canEdit() {
      return this.canDelete
    },
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
      this.deleting = false
      this.editMode = false
      this.editForm = {}
      this.updateError = null
      this.updateLoading = false
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
          console.log('DEBUG EVENT DATA:', data.event[0])
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
      if (!this.event?.id || !this.canDelete || this.deleting) return

      const confirmed = await confirmAction({
        title: 'Supprimer cet événement ?',
        text: 'Cette action est irréversible.',
        confirmButtonText: 'Oui, supprimer',
      })
      if (!confirmed) return

      this.deleting = true
      try {
        const token = localStorage.getItem('token')
        const role = this.user?.role
        const userId = this.user?.id

        if (!token || !role || !userId) {
          throw new Error('Informations utilisateur manquantes')
        }

        const res = await fetch(`${API_URL}/event/delete/${this.event.id}/${role}/${userId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error(data?.error || data?.message || 'Erreur lors de la suppression')
        }

        this.$emit('updated')
        this.$emit('close')
      } catch (e) {
        await showErrorAlert({
          title: 'Suppression impossible',
          text: e?.message || "Impossible de supprimer l'événement.",
        })
      } finally {
        this.deleting = false
      }
    },
    startEdit() {
      if (!this.event) return
      this.editMode = true
      this.editForm = { ...this.event }
      this.updateError = null
    },
    cancelEdit() {
      this.editMode = false
      this.editForm = {}
      this.updateError = null
    },
    async handleUpdate() {
      await showInfoAlert({
        title: 'Fonction à venir',
        text: "La modification d'événement n'est pas disponible pour le moment.",
      })
    },
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
  to {
    transform: rotate(360deg);
  }
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

.detail-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.btn-edit {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #0d9488;
  background: #ccfbf1;
  border: 1px solid #99f6e4;
  border-radius: 8px;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
}

.btn-edit:hover {
  background: #99f6e4;
  color: #0f766e;
}

.btn-edit svg {
  width: 1rem;
  height: 1rem;
}

.detail-edit-form {
  padding: 1rem 0;
}

.detail-edit-form .form-section {
  margin-bottom: 1rem;
}

.detail-edit-form label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 0.35rem;
}

.detail-edit-form input,
.detail-edit-form select,
.detail-edit-form textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.9375rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}

.detail-edit-form textarea {
  resize: vertical;
  min-height: 4rem;
}

.detail-edit-form .form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.detail-edit-form .form-error {
  color: #b91c1c;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #fef2f2;
  border-radius: 8px;
}

.detail-edit-form .form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.detail-edit-form .form-actions button {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.detail-edit-form .form-actions button[type='button'] {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.detail-edit-form .form-actions button[type='button']:hover {
  background: #e2e8f0;
}

.detail-edit-form .form-actions button[type='submit'] {
  background: #0d9488;
  color: #fff;
  border: none;
}

.detail-edit-form .form-actions button[type='submit']:hover:not(:disabled) {
  background: #0f766e;
}

.detail-edit-form .form-actions button[type='submit']:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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
  border-top: 1px solid #e2e8f0;
  /* Même couleur que le séparateur des sections */
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
  color: #dc2626;
  /* Rouge clair pour le texte */

  /* On réutilise tes styles de bordures existants */
  border: 1px solid #fecaca;
  border-radius: 12px;
  /* Même arrondi que tes sections detail-section */
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
  color: #b91c1c;
  /* Rouge plus foncé au hover */
  transform: translateY(-1px);
}

.btn-delete-full:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* --- FIN DU NOUVEAU STYLE --- */
</style>
