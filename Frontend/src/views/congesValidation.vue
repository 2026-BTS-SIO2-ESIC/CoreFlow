<template>
  <div class="page">

    <header class="header">
      <div class="logo">
        <span class="logo-icon">C</span>
        <h2>CoreFlow</h2>
      </div>

      <div class="user-role">
        Manager - RH
      </div>
    </header>

    <section class="title">
      <h1>Gestion des Congés</h1>
      <p>Validez ou refusez les demandes de congés de votre équipe</p>
    </section>

    <!-- STATS -->
    <div class="stats">

      <div class="stat orange">
        <p>En attente</p>
        <h2>{{ stats.en_attente }}</h2>
      </div>

      <div class="stat green">
        <p>Approuvées</p>
        <h2>{{ stats.valide }}</h2>
      </div>

      <div class="stat red">
        <p>Refusées</p>
        <h2>{{ stats.refuse }}</h2>
      </div>

      <div class="stat teal">
        <p>Total ce mois</p>
        <h2>{{ stats.total }}</h2>
      </div>

    </div>

    <!-- FILTRES -->

    <div class="filters">

      <div class="statut">
        <h4>Statut</h4>
        <select v-model="filtreStatut">
          <option value="">Tous</option>
          <option value="en_attente">En attente</option>
          <option value="valide">Approuvés</option>
          <option value="refuse">Refusés</option>
        </select>

      </div>
      <div class="type">
        <h4>Type</h4>
        <select v-model="filtreType">
          <option value="">Tous les types</option>
          <option value="conge_paye">Congé payé</option>
          <option value="conge_maladie">Congé maladie</option>
          <option value="conge_maternite">Congé maternité</option>
        </select>
      </div>

    </div>

    <!-- CARTES CONGES -->

    <div v-for="c in conges" :key="c.idCongés" class="conge-card">

      <div class="card-header">

        <div class="avatar">SM</div>

        <div>
          <h3>Sophie Martin</h3>
          <p>Développeuse Frontend • Équipe Dev</p>
        </div>

        <span class="badge">
          {{ c.statut }}
        </span>

      </div>

      <div class="card-body">

        <div>
          <p class="label">TYPE</p>
          <p>Congé payé</p>
        </div>

        <div>
          <p class="label">PÉRIODE</p>
          <p>{{ c.date_debut }} - {{ c.date_fin }}</p>
        </div>

        <div>
          <p class="label">DURÉE</p>
          <p class="duration">11 jours</p>
        </div>

      </div>

      <div class="motif">
        "{{ c.motif }}"
      </div>

      <div class="actions">

        <button class="refuse" @click="update(c.idCongés, 'refuse')">
          Refuser
        </button>

        <button class="approve" @click="update(c.idCongés, 'valide')">
          Approuver
        </button>

      </div>

    </div>

  </div>
</template>

<script>
import axios from "axios"

export default {

  data() {
    return {

      conges: [],

      stats: {
        total: 0,
        en_attente: 0,
        valide: 0,
        refuse: 0
      },

      filtreStatut: "",
      filtreType: ""

    }
  },

  async mounted() {

    const token = localStorage.getItem("token")

    const res = await axios.get(
      "http://localhost:3000/api/conges",
      { headers: { Authorization: `Bearer ${token}` } }
    )

    this.conges = res.data

    const statsRes = await axios.get(
      "http://localhost:3000/api/conges/stats",
      { headers: { Authorization: `Bearer ${token}` } }
    )

    this.stats = statsRes.data

  },

  methods: {

    async update(idCongés, statut) {

      const token = localStorage.getItem("token")

      await axios.put(
        `http://localhost:3000/api/conges/${idCongés}`,
        { statut },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      location.reload()

    }

  }

}
</script>

<style>
.page {
  background: none;
  min-height: 100vh;
  padding: 40px;
  font-family: Arial;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  background: #1e7f73;
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
}

.user-role {
  background: #1e7f73;
  color: white;
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 14px;
}

.title h1 {
  margin-bottom: 5px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin: 50px 0;
}

.stat {
  background: white;
  padding: 20px;
  padding-right: 100px;
  border-radius: 10px;
  border-left: 5px solid;
}

.orange {
  border-color: orange
}

.green {
  border-color: green
}

.red {
  border-color: red
}

.teal {
  border-color: #1e7f73
}

.filters {
  background: white;
  padding: 20px;
  border-radius: 10px;
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.filters select {
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.conge-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1e7f73;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.badge {
  background: #f4d7a3;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
}

.card-body {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 20px 0;
}

.label {
  font-size: 12px;
  color: #888;
}

.duration {
  color: #1e7f73;
  font-weight: bold;
}

.motif {
  margin-bottom: 20px;
  font-style: italic;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.refuse {
  background: #e74c3c;
  border: none;
  color: white;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
}

.approve {
  background: #27ae60;
  border: none;
  color: white;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
}
</style>