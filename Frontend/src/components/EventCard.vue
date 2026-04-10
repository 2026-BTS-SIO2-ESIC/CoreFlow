<template>
  <div class="event-card" :class="{ 'finished': event.statut === 'termine' }">
    <div class="card-header">
      <div class="card-title">
        <h4>{{ event.titre }}</h4>
        <span class="event-type">{{ formatEventType(event.type_evenement) }}</span>
      </div>
      <span class="event-status" :class="'status-' + event.statut">
        {{ formatEventStatus(event.statut) }}
      </span>
    </div>

    <div class="card-body">
      <div v-if="event.description" class="event-description">
        {{ truncateText(event.description, 100) }}
      </div>

      <div class="event-details">
        <div class="detail-item">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{{ formatDateTime(event.date_debut) }}</span>
        </div>

        <div v-if="event.lieu" class="detail-item">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
          </svg>
          <span>{{ event.lieu }}</span>
        </div>
      </div>

      <!-- Afficher la participation actuelle -->
      <div v-if="participationStatus && participationStatus !== 'en_attente'" class="participation-status">
        <span class="status-badge" :class="'badge-' + participationStatus">
          {{ getParticipationLabel(participationStatus) }}
        </span>
      </div>

      <!-- Boutons de réponse si l'événement n'est pas terminé et pas encore répondu -->
      <div v-if="!isEventFinished && (!participationStatus || participationStatus === 'en_attente')" class="response-buttons">
        <button @click="respondToEvent('confirme')" class="btn-confirm">
          ✓ Présent
        </button>
        <button @click="respondToEvent('absent')" class="btn-absent">
          ✗ Absent
        </button>
      </div>

      <!-- Bouton Check-in si l'événement est aujourd'hui et l'user a confirmé sa participation -->
      <div v-if="isEventToday && participationStatus === 'confirme' && !hasCheckedIn" class="check-in-section">
        <button @click="checkInEvent" class="btn-checkin" :disabled="isCheckingIn">
          <span v-if="!isCheckingIn">📍 Je suis arrivé</span>
          <span v-else>Chargement...</span>
        </button>
      </div>
    </div>

    <div class="card-footer">
      <button @click="openEventDetails" class="btn-view">
        Voir les détails →
      </button>
    </div>

    <!-- Modal pour les détails -->
    <DetailCardEvent
      :show="showDetails"
      :event-id="event.id"
      @close="showDetails = false"
    />

    <!-- Modal de bienvenue -->
    <WelcomeEventModal
      :show="showWelcomeModal"
      :eventName="event.titre"
      @close="showWelcomeModal = false"
    />
  </div>
</template>

<script>
import DetailCardEvent from './DetailCardEvent.vue';
import WelcomeEventModal from './WelcomeEventModal.vue';

export default {
  name: 'EventCard',
  components: { DetailCardEvent, WelcomeEventModal },
  props: {
    event: { type: Object, required: true }
  },
  data() {
    return {
      showDetails: false,
      participationStatus: null,
      respondingStatus: null,
      showWelcomeModal: false,
      isCheckingIn: false,
      hasCheckedIn: false
    }
  },
  computed: {
    isEventFinished() {
      const endDate = new Date(this.event.date_fin);
      const now = new Date();
      return endDate < now;
    },
    isEventToday() {
      const eventDate = new Date(this.event.date_debut);
      const today = new Date();
      
      return eventDate.getFullYear() === today.getFullYear() &&
             eventDate.getMonth() === today.getMonth() &&
             eventDate.getDate() === today.getDate();
    }
  },
  mounted() {
    this.loadParticipationStatus();
  },
  methods: {
    openEventDetails() {
      this.showDetails = true
    },
    loadParticipationStatus() {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');
      
      if (!user.id || !token) return;
      
      fetch(`http://localhost:3000/api/event/participation/status/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.participationStatus) {
          const participation = data.participationStatus.find(
            p => p.evenement_id === this.event.id
          );
          if (participation) {
            this.participationStatus = participation.participation_statut;
          }
        }
      })
      .catch(err => console.error('Erreur chargement participation:', err));
    },
    respondToEvent(status) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');
      
      if (!user.id || !token) return;
      
      this.respondingStatus = status;
      
      fetch('http://localhost:3000/api/event/participation/respond/' + user.id, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId: this.event.id,
          userId: user.id,
          status: status
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          this.participationStatus = status;
          this.respondingStatus = null;
          this.$emit('participation-updated');
        }
      })
      .catch(err => {
        console.error('Erreur réponse participation:', err);
        this.respondingStatus = null;
      });
    },
    getParticipationLabel(status) {
      const labels = {
        confirme: '✓ Présent',
        absent: '✗ Absent',
        inscrit: 'Inscrit',
        'en_attente': 'En attente de réponse'
      };
      return labels[status] || status;
    },
    formatEventType(type) {
      const types = {
        reunion: 'Réunion',
        formation: 'Formation',
        afterwork: 'Afterwork',
        seminaire: 'Séminaire',
        autre: 'Autre'
      }
      return types[type] || type
    },
    formatEventStatus(status) {
      const statuses = {
        planifie: 'Planifié',
        en_cours: 'En cours',
        termine: 'Terminé',
        annule: 'Annulé'
      }
      return statuses[status] || status
    },
    formatDateTime(dateTime) {
      if (!dateTime) return '—'
      const date = new Date(dateTime)
      return date.toLocaleDateString('fr-FR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    truncateText(text, length) {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
    },
    checkInEvent() {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');
      
      if (!user.id || !token) return;
      
      this.isCheckingIn = true;
      
      fetch('http://localhost:3000/api/event/participation/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId: this.event.id,
          userId: user.id
        })
      })
      .then(res => res.json())
      .then(data => {
        this.isCheckingIn = false;
        if (data.message) {
          this.hasCheckedIn = true;
          this.showWelcomeModal = true;
          this.$emit('check-in-success', {
            eventId: this.event.id,
            userId: user.id
          });
        }
      })
      .catch(err => {
        console.error('Erreur check-in:', err);
        this.isCheckingIn = false;
      });
    }
  }
}
</script>

<style scoped>
.event-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px 16px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.event-card:hover {
  border-color: #14b8a6;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.15);
  transform: translateY(-2px);
}

.event-card.finished {
  opacity: 0.75;
  background: #fafafa;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 12px;
}

.card-title {
  flex: 1;
}

.card-title h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.event-type {
  display: inline-block;
  font-size: 11px;
  background: #f0fdfa;
  color: #0d9488;
  padding: 3px 8px;
  border-radius: 4px;
  margin-top: 4px;
  font-weight: 500;
}

.event-status {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 4px;
  white-space: nowrap;
}

.status-planifie {
  background: #dbeafe;
  color: #1e40af;
}

.status-en_cours {
  background: #fef3c7;
  color: #92400e;
}

.status-termine {
  background: #d1fae5;
  color: #065f46;
}

.status-annule {
  background: #fee2e2;
  color: #7f1d1d;
}

.card-body {
  margin-bottom: 12px;
}

.event-description {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 10px;
  line-height: 1.4;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
}

.detail-item svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: #9ca3af;
}

.card-footer {
  border-top: 1px solid #f3f4f6;
  padding-top: 12px;
}

.btn-view {
  width: 100%;
  padding: 8px;
  background: transparent;
  border: 1px solid #14b8a6;
  color: #14b8a6;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-view:hover {
  background: #f0fdfa;
  color: #0d9488;
  border-color: #0d9488;
}

.participation-status {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f3f4f6;
}

.status-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 4px;
}

.badge-confirme {
  background: #d1fae5;
  color: #065f46;
}

.badge-absent {
  background: #fee2e2;
  color: #7f1d1d;
}

.badge-inscrit {
  background: #dbeafe;
  color: #1e40af;
}

.badge-en_attente {
  background: #fef3c7;
  color: #92400e;
}

.response-buttons {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f3f4f6;
}

.btn-confirm {
  flex: 1;
  padding: 6px;
  background: #d1fae5;
  border: 1px solid #10b981;
  color: #065f46;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-confirm:hover {
  background: #a7f3d0;
  border-color: #059669;
}

.btn-absent {
  flex: 1;
  padding: 6px;
  background: #fee2e2;
  border: 1px solid #ef4444;
  color: #7f1d1d;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-absent:hover {
  background: #fecaca;
  border-color: #dc2626;
}

.check-in-section {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f3f4f6;
}

.btn-checkin {
  width: 100%;
  padding: 8px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  border: none;
  color: white;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-checkin:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.btn-checkin:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
