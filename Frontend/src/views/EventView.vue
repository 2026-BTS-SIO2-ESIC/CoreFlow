<template>
  <div class="event-container">
    <AppSidebar :user="user" active-item="events" @logout="logout" />
    <div class="main-content">
      Zone Principale

      <div>
        My super duper interactive calendar
        <div v-if="new Date(year, month - 1, 1).getDay() === 0">premier jour du mois</div>
        <div v-if="new Date(year, month, 0).getDate() > 0">tout les reste jours du mois</div>
      </div>
      <button
        v-if="user && (user.role === 'manager' || user.role === 'admin')"
        @click="showCreateModal = true"
      >
        Afficher le formulaire de création d'un Evenement
      </button>
      <button v-if="showCreateModal" @click="closeModal()">
        Fermer la creation d'un Evenement
      </button>
      <form @submit.prevent="createEvent">
        <div v-if="showCreateModal">
          <div>
            <label>Titre <span>*</span></label>
            <input v-model="formData.titre" type="text" placeholder="Titre de l'evenement" />
          </div>

          <div>
            <label>description <span>*</span></label>
            <input v-model="formData.description" type="text" placeholder="Titre de l'evenement" />
          </div>

          <div>
            <label>type de evenement <span>*</span></label>
            <input
              v-model="formData.type_evenement"
              type="text"
              placeholder="Titre de l'evenement"
            />
          </div>

          <div>
            <label>date debut <span>*</span></label>
            <input
              v-model="formData.date_debut"
              type="datetime-local"
              placeholder="Titre de l'evenement"
            />
          </div>

          <div>
            <label>date fin<span>*</span></label>
            <input
              v-model="formData.date_fin"
              type="datetime-local"
              placeholder="Titre de l'evenement"
            />
          </div>

          <div>
            <label>lieu<span>*</span></label>
            <input v-model="formData.lieu" type="text" placeholder="Titre de l'evenement" />
          </div>

          <div>
            <label>est obligatoire?<span>*</span></label>
            <input
              v-model="formData.est_obligatoire"
              type="text"
              placeholder="Titre de l'evenement"
            />
          </div>

          <div>
            <label>Nombre de places maximum<span>*</span></label>
            <input
              v-model="formData.nb_places_max"
              type="text"
              placeholder="Titre de l'evenement"
            />
          </div>

          <div>
            <label>Statut<span>*</span></label>
            <input v-model="formData.statut" type="text" placeholder="Titre de l'evenement" />
          </div>

          <div>
            <label>Niveau<span>*</span></label>
            <input v-model="formData.niveau" type="text" placeholder="Titre de l'evenement" />
          </div>

          <div>
            <label>inviter<span>*</span></label>
            <input v-model="formData.inviter" type="text" placeholder="Titre de l'evenement" />
          </div>

          <div>
            <label>departement<span>*</span></label>
            <input v-model="formData.departement" type="text" placeholder="Titre de l'evenement" />
          </div>

          <div>
            <label>commentaire<span>*</span></label>
            <input v-model="formData.commentaire" type="text" placeholder="Titre de l'evenement" />
          </div>

          <div v-if="errorMessage">{{ errorMessage }}</div>
          <button type="submit" :disabled="loading">Crees l'evenement</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import AppSidebar from '../components/AppSidebar.vue'

export default {
  name: 'EventView',
  components: { AppSidebar },
  data() {
    return {
      user: null,
      showCreateModal: false,
      loading: false,
      errorMessage: null,

      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth(),
      selectedDate: null,
      lastClickedDate: null,
      clickCount: 0,

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
        statut: 'planifie',
        niveau: '1',

        statut_participation: 'inscrit',
        inviter: '',
        departement: '',
        commentaire: '',
      },
    }
  },
  async mounted() {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      this.user = JSON.parse(userStr)
    } else {
      this.$router.push('/login')
      alert('Veuillez vous connecter pour acceder a cette page')
    }
  },
  methods: {
    // Fonction de creation d'evenement
    async createEvent() {
      const body = {
        titre: this.formData.titre,
        description: this.formData.description,
        type_evenement: this.formData.type_evenement,
        date_debut: this.formData.date_debut.replace('T', ' ') + ':00',
        date_fin: this.formData.date_fin.replace('T', ' ') + ':00',
        lieu: this.formData.lieu,
        organisateur_id: this.user.id,
        est_obligatoire: this.formData.est_obligatoire,
        nb_places_max: this.formData.nb_places_max,
        statut: this.formData.statut,
        niveau: this.formData.niveau,
        inviter: this.formData.inviter,
        departement: this.formData.departement,
        commentaire: this.formData.commentaire,
      }

      this.loading = true
      this.errorMessage = null

      if (this.user.role !== 'manager' && this.user.role !== 'admin') {
        this.errorMessage = 'Que admin et manager peuvent crees des evenements'
        return
      }

      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`http://localhost:3000/api/event/create/${this.user.role}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        })

        const data = await response.json()

        if (response.status === 201) {
          this.closeModal()
          alert('✅ Evenement créé avec succès !')
        } else {
          data.error?.error === 'PERMISSION_DENIED'
            ? (this.errorMessage = 'Que admin et manager peuvent crees des evenements')
            : (this.errorMessage = data.error?.message)
        }
      } catch (error) {
        console.error('Erreur creation evenement:', error)
        this.errorMessage = "Erreur lors de la creation de l'evenement"
      } finally {
        this.loading = false
      }
    },

    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$router.push('/login')
    },
    closeModal() {
      //   this.closeCreateModal = false
      this.showCreateModal = false
      this.formData = {
        titre: '',
        description: '',
        type_evenement: 'meeting',
        date_debut: '',
        date_fin: '',
        lieu: '',
        organisateur_id: null,
        est_obligatoire: 1,
        nb_places_max: 0,
        statut: 'planifie',
        niveau: '1',

        statut_participation: 'inscrit',
        inviter: '',
        departement: '',
        commentaire: '',
      }
    },
    handleClickedDate(date) {
      if (this.lastClickedDate && selectedDate) {
        clickCount++
      } else {
        ;((clickCount = 1), (lastClickedDate = null))
      }

      if (this.clickCount === 2) {
        this.selectedDate = date
        this.showCreateModal = true
      }
    },
    CalculateDayOfMonth(month) {
      //   some calculation wowowowo there is your number of the days of the month
      return this.nbOfDaysInMonth
    },
    CalculateDayOfMonth(week) {
      //   some calculation wowowowo there is your day of the week
      return this.dayOfTheWeek
    },

    getDaysInMonth(month) {
      return new Date(this.currentYear, month, 0).getDate()
    },
    getFirstDayOfTheMonth(month) {
      return new Date(this.currentYear, month, -1, 1).getDay()
    },
  },
}
</script>

<style scoped>
.event-container {
  font-family: 'Mulish', sans-serif;
  background: #f0fdfa;
  min-height: 100vh;
}

.main-content {
  margin-left: 240px;
  padding: 20px;
}
</style>
