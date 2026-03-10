<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay">
        <div class="modal-backdrop" aria-hidden="true" @click="$emit('close')" />
        <div
          class="modal-box"
          role="dialog"
          @click.stop
          aria-labelledby="modal-title"
          aria-modal="true"
        >
          <div class="modal-header">
            <h2 id="modal-title">Créer un événement</h2>
            <button type="button" aria-label="Fermer" @click="$emit('close')">
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

          <form @submit.prevent="handleSubmit" class="modal-form">
            <div class="modal-body">
              <section class="form-section">
                <h3>Informations principales</h3>
                <div class="form-grid form-grid-2">
                  <div class="form-field form-field-full">
                    <label>Titre *</label>
                    <input
                      v-model="formData.titre"
                      type="text"
                      required
                      placeholder="Ex. Réunion équipe"
                    />
                  </div>
                  <div class="form-field form-field-full">
                    <label>Description</label>
                    <textarea v-model="formData.description" rows="2" placeholder="Description" />
                  </div>
                  <div class="form-field">
                    <label>Type *</label>
                    <select v-model="formData.type_evenement" required>
                      <option value="meeting">Réunion</option>
                      <option value="formation">Formation</option>
                      <option value="conference">Conférence</option>
                      <option value="atelier">Atelier</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label>Lieu</label>
                    <input v-model="formData.lieu" type="text" placeholder="Ex. Salle A" />
                  </div>
                </div>
              </section>

              <section class="form-section">
                <h3>Horaires</h3>
                <div class="form-grid form-grid-2">
                  <div class="form-field">
                    <label>Date/heure de début *</label>
                    <input
                      v-model="formData.date_debut"
                      type="datetime-local"
                      :min="minDateStart"
                      required
                    />
                  </div>
                  <div class="form-field">
                    <label>Date/heure de fin *</label>
                    <input
                      v-model="formData.date_fin"
                      type="datetime-local"
                      :min="minDateEnd"
                      required
                    />
                  </div>
                </div>
              </section>

              <section class="form-section">
                <button
                  type="button"
                  class="form-toggle"
                  @click="showAdvancedOptions = !showAdvancedOptions"
                >
                  <span>Options avancées</span>
                  <svg
                    class="chevron"
                    :class="{ open: showAdvancedOptions }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div v-show="showAdvancedOptions" class="form-grid form-grid-2 form-section-inner">
                  <div class="form-field">
                    <label>Niveau *</label>
                    <select v-model="formData.niveau" required>
                      <option value="1">Entreprise</option>
                      <option value="2">Service</option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label>Obligatoire</label>
                    <select v-model="formData.est_obligatoire">
                      <option :value="0">Non</option>
                      <option :value="1">Oui</option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label>Places max</label>
                    <input
                      v-model.number="formData.nb_places_max"
                      type="number"
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>
              </section>

              <section class="form-section">
                <h3>Invitations</h3>
                <div class="form-grid form-grid-2">
                  <div class="form-field form-field-full">
                    <label>Emails (séparés par virgules)</label>
                    <input
                      v-model="formData.inviter"
                      type="text"
                      placeholder="email1@x.com, email2@x.com"
                    />
                  </div>
                  <div class="form-field">
                    <label>Département</label>
                    <input v-model="formData.departement" type="text" placeholder="IT, RH" />
                  </div>
                  <div class="form-field form-field-full">
                    <label>Commentaire</label>
                    <textarea v-model="formData.commentaire" rows="2" placeholder="Commentaire" />
                  </div>
                </div>
              </section>

              <div v-if="errorMessage" class="form-error" role="alert">
                <template v-if="Array.isArray(errorMessages)">
                  <ul>
                    <li v-for="(msg, i) in errorMessages" :key="i">{{ msg }}</li>
                  </ul>
                </template>
                <template v-else>{{ errorMessage }}</template>
              </div>

              <div class="form-actions">
                <button type="button" @click="$emit('close')">Annuler</button>
                <button type="submit" :disabled="loading">
                  {{ loading ? 'Création...' : "Créer l'événement" }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
export default {
  name: 'CreateEventModal',
  props: {
    show: { type: Boolean, default: false },
    initialDate: { type: Object, default: null },
    user: { type: Object, default: null },
  },
  emits: ['close', 'submit'],
  data() {
    return {
      formData: {
        titre: '',
        description: '',
        type_evenement: 'meeting',
        date_debut: '',
        date_fin: '',
        lieu: '',
        organisateur_id: null,
        est_obligatoire: 1,
        nb_places_max: 0,
        niveau: '1',
        statut_participation: 'inscrit',
        inviter: '',
        departement: '',
        commentaire: '',
      },
      loading: false,
      errorMessage: null,
      errorMessages: null,
      showAdvancedOptions: false,
    }
  },
  computed: {
    formattedSelectedDate() {
      if (!this.initialDate) return '—'
      return this.initialDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    },
    minDateStart() {
      const now = new Date()
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, '0')
      const d = String(now.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}T00:00`
    },
    minDateEnd() {
      if (this.formData.date_debut) return this.formData.date_debut
      return this.minDateStart
    },
  },
  watch: {
    initialDate(newVal) {
      if (newVal) this.prefillDates(newVal)
    },
    show(isShown) {
      if (isShown && this.initialDate) this.prefillDates(this.initialDate)
      if (isShown) this.$nextTick(() => this.setupEscapeHandler())
      else this.removeEscapeHandler()
    },
  },
  methods: {
    setupEscapeHandler() {
      this._escapeHandler = (e) => {
        if (e.key === 'Escape') this.$emit('close')
      }
      document.addEventListener('keydown', this._escapeHandler)
    },
    removeEscapeHandler() {
      if (this._escapeHandler) {
        document.removeEventListener('keydown', this._escapeHandler)
        this._escapeHandler = null
      }
    },
    parseApiError(res, data) {
      if (!data || typeof data !== 'object') {
        return { message: `Erreur ${res.status || 500}`, messages: null }
      }
      const err = data.error
      if (!err) {
        return { message: data.message || `Erreur ${res.status}`, messages: null }
      }
      const details = err.details ?? err.detail
      const messages = Array.isArray(details)
        ? details
        : typeof details === 'string'
          ? [details]
          : null
      const message = err.message || data.message || `Erreur ${res.status}`
      return { message, messages }
    },
    async handleSubmit() {
      this.errorMessage = null
      this.errorMessages = null
      this.loading = true
      const token = localStorage.getItem('token')
      const user = this.user || JSON.parse(localStorage.getItem('user') || '{}')
      const role = user?.role
      const organisateurId = user?.id

      if (!token || !role || !organisateurId) {
        this.errorMessage = 'Session expirée. Veuillez vous reconnecter.'
        this.loading = false
        return
      }
      if (role !== 'admin' && role !== 'manager') {
        this.errorMessage = 'Seuls admin et manager peuvent créer un événement.'
        this.loading = false
        return
      }

      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const startVal = this.formData.date_debut
      if (startVal) {
        const startDate = new Date(startVal.replace('T', ' '))
        if (startDate < todayStart) {
          this.errorMessage = 'La date de début ne peut pas être avant aujourd\'hui.'
          this.errorMessages = null
          this.loading = false
          return
        }
      }

      const toBackendDate = (s) => {
        if (!s) return null
        const normalized = s.replace('T', ' ')
        return normalized.length === 16 ? `${normalized}:00` : normalized.slice(0, 19)
      }
      const body = {
        titre: this.formData.titre,
        description: this.formData.description || '',
        type_evenement: this.formData.type_evenement,
        date_debut: toBackendDate(this.formData.date_debut),
        date_fin: toBackendDate(this.formData.date_fin),
        lieu: this.formData.lieu || '',
        organisateur_id: organisateurId,
        niveau: this.formData.niveau,
        est_obligatoire: this.formData.est_obligatoire,
        nb_places_max: this.formData.nb_places_max || 0,
        inviter: this.formData.inviter || '',
        departement: this.formData.departement || '',
        commentaire: this.formData.commentaire || '',
      }

      try {
        const res = await fetch(`http://localhost:3000/api/event/create/${role}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        })
        let data = null
        try {
          data = await res.json()
        } catch {
          data = null
        }

        if (!res.ok) {
          const { message, messages } = this.parseApiError(res, data)
          this.errorMessage = message
          this.errorMessages = messages
          this.loading = false
          return
        }
        this.$emit('submit')
      } catch (e) {
        this.errorMessage = 'Erreur réseau. Vérifiez que le serveur est démarré.'
        this.errorMessages = null
      } finally {
        this.loading = false
      }
    },
    prefillDates(date) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const d = date < today ? today : date
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      this.formData.date_debut = `${y}-${m}-${day}T09:00`
      this.formData.date_fin = `${y}-${m}-${day}T10:00`
    },
  },
  beforeUnmount() {
    this.removeEscapeHandler()
  },
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.modal-backdrop {
  position: fixed;
  inset: 0;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.45);
}
.modal-box {
  position: relative;
  z-index: 10;
  max-height: 90vh;
  width: 100%;
  max-width: 42rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  padding: 0;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}
.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
}
.modal-header button {
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
}
.modal-header button:hover {
  background: #e2e8f0;
  color: #1e293b;
}
.modal-header button svg {
  width: 1.25rem;
  height: 1.25rem;
}
.modal-form {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 1.5rem;
}
.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.form-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.form-section h3 {
  font-size: 0.8125rem;
  font-weight: 600;
  margin: 0;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.form-hint {
  font-size: 0.875rem;
  margin: 0;
  color: #64748b;
}
.form-grid {
  display: grid;
  gap: 1rem;
}
.form-grid-2 {
  grid-template-columns: repeat(2, 1fr);
}
@media (max-width: 640px) {
  .form-grid-2 {
    grid-template-columns: 1fr;
  }
}
.form-field-full {
  grid-column: 1 / -1;
}
.form-field label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.35rem;
  color: #334155;
}
.form-field input,
.form-field select,
.form-field textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.9375rem;
  background: #fff;
  transition: border-color 0.15s ease;
}
.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #14b8a6;
  box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.2);
}
.form-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  color: #334155;
  transition: background 0.15s ease;
}
.form-toggle:hover {
  background: #f1f5f9;
}
.form-toggle .chevron {
  width: 1.25rem;
  height: 1.25rem;
  color: #64748b;
  transition: transform 0.2s ease;
}
.form-toggle .chevron.open {
  transform: rotate(180deg);
}
.form-section-inner {
  padding: 1rem 1.25rem;
  background: #fff;
  border-radius: 8px;
  margin-top: 0.5rem;
  border: 1px solid #e2e8f0;
}
.form-error {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
}
.form-error ul {
  margin: 0.25rem 0 0 0;
  padding-left: 1.25rem;
}
.form-error li {
  margin: 0.2rem 0;
}
.form-actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 0.5rem;
}
.form-actions button {
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    opacity 0.15s ease,
    background 0.15s ease;
}
.form-actions button[type='button'] {
  background: #fff;
  border: 1px solid #cbd5e1;
  color: #475569;
}
.form-actions button[type='button']:hover {
  background: #f1f5f9;
}
.form-actions button[type='submit'] {
  background: #14b8a6;
  color: #fff;
  border: none;
}
.form-actions button[type='submit']:hover:not(:disabled) {
  background: #0d9488;
}
.form-actions button[type='submit']:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .modal-box,
.modal-leave-active .modal-box {
  transition: transform 0.2s ease;
}
.modal-enter-from .modal-box,
.modal-leave-to .modal-box {
  transform: scale(0.96);
}
</style>
