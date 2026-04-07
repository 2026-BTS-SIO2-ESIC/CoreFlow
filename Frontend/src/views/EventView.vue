<template>
  <div class="event-view">
    <DashboardSidebar :user="user" :loading="false" @logout="logout" />
    <div class="event-main">
      <div class="page-header">
        <h1>Calendrier des événements</h1>
        <p v-if="canCreateEvent">Cliquez sur un jour pour créer un nouvel événement</p>
        <p v-else>Consultez le calendrier des événements</p>
      </div>

      <div class="calendar">
        <div class="calendar-nav">
          <button type="button" aria-label="Mois précédent" @click="prevMonth">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2>{{ currentMonthName }} {{ currentYear }}</h2>
          <button type="button" aria-label="Mois suivant" @click="nextMonth">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div class="calendar-weekdays">
          <span v-for="day in ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']" :key="day">{{
            day
            }}</span>
        </div>

        <div class="calendar-grid">
          <div v-for="(cell, index) in calendarCells" :key="index" class="calendar-cell" :class="{
            'cell-empty': cell.isEmpty,
            'cell-past': !cell.isEmpty && isPast(cell),
            'cell-selected': !cell.isEmpty && isSelected(cell),
            'cell-today': !cell.isEmpty && !isSelected(cell) && !isPast(cell) && isToday(cell),
          }" @click="onDayClick(cell)">
            <div class="cell-day">{{ cell.day }}</div>
            <div v-if="getEventsForDay(cell).length" class="cell-events">
              <div v-for="ev in getEventsForDay(cell)" :key="ev.id" class="cell-event"
                :class="ev.niveau === '2' ? 'cell-event-lvl2' : 'cell-event-lvl1'"
                :title="`${ev.titre} - ${ev.type_evenement || ''}`" @click.stop="onEventClick(ev.id)">
                {{ ev.titre }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateEventModal :show="showCreateModal" :initial-date="selectedDate" :user="user" @close="closeModal"
        @submit="onEventCreated" />
      <DetailCardEvent :show="showDetailModal" :event-id="selectedEventId" :user="user" @close="closeDetailModal"
        @updated="onEventUpdated" />
    </div>
  </div>
</template>

<script>
import CreateEventModal from '../components/CreateEventModal.vue'
import DetailCardEvent from '../components/DetailCardEvent.vue'
import { fetchUserFromToken, hasRole, API_URL } from '../composables/useAuth'
import DashboardSidebar from '../components/DashboardSidebar.vue'
import { showWarningAlert } from '../utils/swal'

export default {
  name: 'EventView',
  components: { CreateEventModal, DetailCardEvent, DashboardSidebar },
  data() {
    const monthNames = [
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre',
    ]
    const now = new Date()
    return {
      user: null,
      authVerified: false,
      events: [],
      eventsLoading: false,
      showCreateModal: false,
      showDetailModal: false,
      selectedEventId: null,
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth(),
      monthNames,
      selectedDate: null,
    }
  },
  async mounted() {
    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/login')
      return
    }
    const verifiedUser = await fetchUserFromToken()
    if (!verifiedUser) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      await showWarningAlert({
        title: 'Session expirée',
        text: 'Veuillez vous reconnecter.',
      })
      this.$router.push('/login')
      return
    }
    this.user = verifiedUser
    this.authVerified = true
    await this.fetchEvents()
  },
  methods: {
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$router.push('/login')
    },
    closeModal() {
      this.selectedDate = null
      this.showCreateModal = false
    },
    onEventClick(eventId) {
      this.selectedEventId = eventId
      this.showDetailModal = true
    },
    closeDetailModal() {
      this.showDetailModal = false
      this.selectedEventId = null
    },
    async onEventCreated() {
      this.closeModal()
      await this.fetchEvents()
    },
    async onEventUpdated() {
      await this.fetchEvents()
    },
    async fetchEvents() {
      if (!this.user?.id || !this.user?.role) return
      this.eventsLoading = true
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(
          `${API_URL}/event/list/participation/${this.user.id}/${this.user.role}`,
          { headers: { Authorization: `Bearer ${token}` } },
        )
        const data = await res.json()
        if (res.ok) {
          if (data.eventAdmin) {
            this.events = data.eventAdmin || []
          } else {
            const l1 = data.eventLevelOne || []
            const l2 = data.eventLevelTwo || []
            const seen = new Set()
            this.events = [...l1, ...l2].filter((e) => {
              if (seen.has(e.id)) return false
              seen.add(e.id)
              return true
            })
          }
        } else {
          this.events = []
        }
      } catch {
        this.events = []
      } finally {
        this.eventsLoading = false
      }
    },
    getEventsForDay(cell) {
      if (!cell.date || cell.isEmpty || !this.events.length) return []
      const y = cell.date.getFullYear()
      const m = cell.date.getMonth()
      const d = cell.date.getDate()
      const cellStart = new Date(y, m, d).getTime()
      const cellEnd = new Date(y, m, d, 23, 59, 59).getTime()
      return this.events.filter((ev) => {
        const start = new Date(ev.date_debut.replace(' ', 'T')).getTime()
        const end = new Date(ev.date_fin.replace(' ', 'T')).getTime()
        return start <= cellEnd && end >= cellStart
      })
    },
    onDayClick(cell) {
      if (!hasRole(this.user, 'admin', 'manager')) {
        showWarningAlert({
          title: 'Accès refusé',
          text: "Vous n'avez pas les permissions pour créer un événement.",
        })
        return
      }
      if (cell.isEmpty || !cell.date || this.isPast(cell)) return
      this.selectedDate = cell.date
      this.showCreateModal = true
    },
    isPast(cell) {
      if (!cell.date || cell.isEmpty) return false
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const d = new Date(cell.date)
      d.setHours(0, 0, 0, 0)
      return d < today
    },
    prevMonth() {
      if (this.currentMonth === 0) {
        this.currentMonth = 11
        this.currentYear--
      } else {
        this.currentMonth--
      }
    },
    nextMonth() {
      if (this.currentMonth === 11) {
        this.currentMonth = 0
        this.currentYear++
      } else {
        this.currentMonth++
      }
    },
    isSelected(cell) {
      if (!this.selectedDate || cell.isEmpty) return false
      return cell.date.toDateString() === this.selectedDate.toString()
    },
    isToday(cell) {
      if (cell.isEmpty || !cell.date) return false
      return cell.date.toDateString() === new Date().toDateString()
    },
  },
  computed: {
    canCreateEvent() {
      return hasRole(this.user, 'admin', 'manager')
    },
    currentMonthName() {
      return this.monthNames[this.currentMonth]
    },
    calendarCells() {
      const year = this.currentYear
      const month = this.currentMonth
      const firstDay = new Date(year, month, 1).getDay()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const cells = []
      for (let i = 0; i < firstDay; i++) cells.push({ day: null, isEmpty: true })
      for (let d = 1; d <= daysInMonth; d++)
        cells.push({ day: d, isEmpty: false, date: new Date(year, month, d) })
      while (cells.length < 31) cells.push({ day: null, isEmpty: true })
      return cells
    },
  },
}
</script>

<style scoped>
.event-view {
  min-height: 100vh;
  background: #f1f5f9;
}

.event-main {
  margin-left: 15rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}

.page-header {
  background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
  padding: 40px;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  color: white;
}

.page-header h1 {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 32px;
  margin: 0 0 8px 0;
}

.page-header p {
  margin: 0;
  opacity: 0.95;
  font-size: 16px;
}

.calendar {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 80vh;
  padding: 1.5rem;
  background: #fff;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.calendar-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.calendar-nav button {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  color: #475569;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.calendar-nav button:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #1e293b;
}

.calendar-nav button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.calendar-nav h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #334155;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  text-align: center;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 0.5rem;
}

.calendar-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.calendar-cell {
  min-height: 5rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  padding: 2rem;
  cursor: pointer;
  border-radius: 8px;
  font-weight: 500;
  color: #334155;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.cell-day {
  font-size: 0.9375rem;
  font-weight: 600;

  text-align: center;
  margin-bottom: 0.25rem;
}

.cell-events {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  min-height: 0;
}

.cell-event {
  font-size: 0.6875rem;
  font-weight: 500;
  text-align: center;
  padding: 10px 20px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.cell-event-lvl1 {
  color: #1e40af;
  background: #bfdbfe;
}

.cell-event-lvl1:hover {
  background: #93c5fd;
}

.cell-event-lvl2 {
  color: #0f766e;
  background: #ccfbf1;
}

.cell-event-lvl2:hover {
  background: #99f6e4;
}

.calendar-cell:not(.cell-empty):hover {
  background: #f1f5f9;
}

.calendar-cell.cell-empty {
  cursor: default;
  opacity: 0.35;
  color: #94a3b8;
}

.calendar-cell.cell-selected {
  background: #14b8a6;
  color: #fff;
}

.calendar-cell.cell-selected .cell-event-lvl1,
.calendar-cell.cell-selected .cell-event-lvl2 {
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
}

.calendar-cell.cell-selected:hover {
  background: #0d9488;
}

.calendar-cell.cell-today {
  background: #ccfbf1;
  color: #0f766e;
}

.calendar-cell.cell-today:hover {
  background: #99f6e4;
}

.calendar-cell.cell-past {
  color: #94a3b8;
  cursor: not-allowed;
  opacity: 0.6;
}

.calendar-cell.cell-past:hover {
  background: transparent;
}
</style>
