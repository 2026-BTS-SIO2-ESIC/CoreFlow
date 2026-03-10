<template>
  <div class="event-view">
    <AppSidebar :user="user" active-item="events" @logout="logout" />
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
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h2>{{ currentMonthName }} {{ currentYear }}</h2>
          <button type="button" aria-label="Mois suivant" @click="nextMonth">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        <div class="calendar-weekdays">
          <span v-for="day in ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']" :key="day">{{
            day
          }}</span>
        </div>

        <div class="calendar-grid">
          <div
            v-for="(cell, index) in calendarCells"
            :key="index"
            class="calendar-cell"
            :class="{
              'cell-empty': cell.isEmpty,
              'cell-past': !cell.isEmpty && isPast(cell),
              'cell-selected': !cell.isEmpty && isSelected(cell),
              'cell-today': !cell.isEmpty && !isSelected(cell) && !isPast(cell) && isToday(cell),
            }"
            @click="onDayClick(cell)"
          >
            {{ cell.day }}
          </div>
        </div>
      </div>

      <CreateEventModal
        :show="showCreateModal"
        :initial-date="selectedDate"
        :user="user"
        @close="closeModal"
        @submit="onEventCreated"
      />
    </div>
  </div>
</template>

<script>
import AppSidebar from '../components/AppSidebar.vue'
import CreateEventModal from '../components/CreateEventModal.vue'
import { fetchUserFromToken, hasRole } from '../composables/useAuth'

export default {
  name: 'EventView',
  components: { AppSidebar, CreateEventModal },
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
      showCreateModal: false,
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
      this.$router.push('/login')
      alert('Session expirée. Veuillez vous reconnecter.')
      return
    }
    this.user = verifiedUser
    this.authVerified = true
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
    onEventCreated() {
      this.closeModal()
    },
    onDayClick(cell) {
      if (!hasRole(this.user, 'admin', 'manager')) {
        alert("Vous n'avez pas les permissions pour créer un événement")
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
  min-height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  cursor: pointer;
  border-radius: 8px;
  font-weight: 500;
  color: #334155;
  transition:
    background 0.15s ease,
    color 0.15s ease;
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
