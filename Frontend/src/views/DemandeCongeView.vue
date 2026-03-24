<template>
    <div class="conges-page">
        <DashboardSidebar :user="user" :loading="false" @logout="logout" />

        <div class="conges-container">
            <h1>Nouvelle demande de congé</h1>
            <div v-if="solde" class="solde-box">
                <div class="solde-item">
                    <strong>RTT restants :</strong> {{ solde.rtt_restants }}
                </div>
            </div>
            <div v-if="message" :class="['message', messageType]">
                {{ message }}
            </div>

            <form class="form" @submit.prevent="submit">
                <div class="form-group">
                    <label for="date-debut">Date de début <span class="required">*</span></label>
                    <input id="date-debut" type="date" v-model="dateDebut" :min="today" required />
                </div>

                <div class="form-group">
                    <label for="date-fin">Date de fin <span class="required">*</span></label>
                    <input id="date-fin" type="date" v-model="dateFin" :min="dateDebut || today" required />
                </div>

                <div v-if="erreurDates" class="erreur">
                    ⚠️ La date de fin doit être après ou égale à la date de début.
                </div>

                <div class="duree" v-if="duree !== null">
                    Durée : <strong>{{ duree }}</strong> jour(s)
                </div>

                <div class="form-group full-width">
                    <label for="motif">Motif (optionnel)</label>
                    <textarea id="motif" v-model="motif" placeholder="Ex : Vacances, rendez-vous..."></textarea>
                </div>

                <div class="actions">
                    <button type="button" class="btn btn-secondary" @click="resetForm">Annuler</button>
                    <button type="submit " class="btn btn-primary"> Soumettre la demande</button>
                </div>
            </form>
            <!-- Liste des demandes (sous le formulaire) -->
            <div class="liste">
                <div class="liste-header">
                    <h2>Mes demandes</h2>
                    <button type="button" class="btn btn-secondary" @click="chargerDemandes">
                         Rafraîchir
                    </button>
                </div>

                <div v-if="loading" class="empty">
                    Chargement des demandes...
                </div>

                <div v-else-if="demandes.length === 0" class="empty">
                    Aucune demande pour le moment.
                </div>

                <div v-else>
                    <!-- Demandes en attente -->
                    <div v-if="demandesEnAttente.length > 0" class="section">
                        <h3 class="section-title"> Demandes en attente</h3>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Date demande</th>
                                    <th>Date début</th>
                                    <th>Date fin</th>
                                    <th>Motif</th>
                                    <th>Statut</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="d in demandesEnAttente" :key="d.id">
                                    <td>{{ formatDateTime(d.created_at) }}</td>
                                    <td>{{ formatDate(d.date_debut) }}</td>
                                    <td>{{ formatDate(d.date_fin) }}</td>
                                    <td>{{ d.motif || '-' }}</td>
                                    <td>
                                        <span :class="['badge', 'badge-en_attente']">
                                            En attente
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn btn-small btn-danger" @click="annuler(d.id)">
                                            Annuler
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Demandes traitées -->
                    <div v-if="demandesTraitees.length > 0" class="section">
                        <h3 class="section-title"> Demandes traitées</h3>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Date demande</th>
                                    <th>Date début</th>
                                    <th>Date fin</th>
                                    <th>Motif</th>
                                    <th>Statut final</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="d in demandesTraitees" :key="d.id"
                                    :class="{ 'row-refused': d.statut === 'refuse', 'row-approved': d.statut === 'approuve' }">
                                    <td>{{ formatDateTime(d.created_at) }}</td>
                                    <td>{{ formatDate(d.date_debut) }}</td>
                                    <td>{{ formatDate(d.date_fin) }}</td>
                                    <td>{{ d.motif || '-' }}</td>
                                    <td>
                                        <span :class="['badge', `badge-${d.statut}`]">
                                            {{ formatStatut(d.statut) }}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router';
import { getMesConges, creerConge, annulerConge, getSoldeConges } from "../services/congesApi";
import DashboardSidebar from '../components/DashboardSidebar.vue';

const router = useRouter();
const user = ref(null);

const demandes = ref([]);
const loading = ref(false);
const solde = ref(null);

async function chargerDemandes() {
    loading.value = true;
    try {
        demandes.value = await getMesConges();
    } catch (e) {
        messageType.value = "error";
        message.value = e.message;
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    const token = localStorage.getItem('token');
    if (!token) {
        router.push('/login');
        return;
    }

    const userStr = localStorage.getItem('user');
    if (userStr) {
        user.value = JSON.parse(userStr);
    }

    chargerDemandes();
    chargerSolde();
});

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
}

/* -- Champs du formulaire -- */
const dateDebut = ref('')
const dateFin = ref('')
const motif = ref('')

/* -- Message utilisateur (affiché dans la page) -- */
const message = ref('')
const messageType = ref('') // 'success' | 'error'

/* -- Date minimale (aujourd'hui) format ISO yyyy-mm-dd -- */
const today = new Date().toISOString().split('T')[0]

/* -- Vérifie si la date de fin est avant la date de début -- */
const erreurDates = computed(() => {
    if (!dateDebut.value || !dateFin.value) return false
    const d = new Date(dateDebut.value)
    const f = new Date(dateFin.value)
    return f < d
})

/* -- Calcul de la durée (jours calendaires, inclusif) -- */
const duree = computed(() => {
    if (!dateDebut.value || !dateFin.value) return null
    if (erreurDates.value) return null
    const d = new Date(dateDebut.value)
    const f = new Date(dateFin.value)
    const diffMs = f - d
    const diffJours = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1
    return diffJours
})

/* -- Séparer les demandes en attente et traitées -- */
const demandesEnAttente = computed(() => {
    return demandes.value.filter(d => d.statut === 'en_attente')
})

const demandesTraitees = computed(() => {
    return demandes.value.filter(d => d.statut !== 'en_attente')
})

/* -- Réinitialiser le formulaire -- */
function resetForm() {
    dateDebut.value = ''
    dateFin.value = ''
    motif.value = ''
    message.value = ''
    messageType.value = ''
}

/* -- Soumettre (simulation) -- */
/* Remarque : plus tard, remplace la simulation par un appel à congesService.envoyerDemande(payload) */
async function submit() {

    if (!dateDebut.value || !dateFin.value) {
        messageType.value = "error";
        message.value = "Veuillez remplir les deux dates.";
        return;
    }

    if (new Date(dateFin.value) < new Date(dateDebut.value)) {
        messageType.value = "error";
        message.value = "La date de fin doit être après la date de début.";
        return;
    }



    const debut = new Date(dateDebut.value)
    const fin = new Date(dateFin.value)

    const conflit = demandes.value.some(d => {
        if (!['en_attente', 'approuve'].includes(d.statut)) return false

        const dDebut = new Date(d.date_debut)
        const dFin = new Date(d.date_fin)

        return debut <= dFin && fin >= dDebut
    })

    if (conflit) {
        messageType.value = "error"
        message.value = "Vous avez déjà une demande en attente ou approuvée sur cette période."
        return
    }

    try {
        await creerConge({
            date_debut: dateDebut.value,
            date_fin: dateFin.value,
            motif: motif.value || null
        })

        messageType.value = "success"
        message.value = " Demande envoyée."

        dateDebut.value = ""
        dateFin.value = ""
        motif.value = ""

        await chargerDemandes()
        await chargerSolde()
    } catch (error) {
        messageType.value = "error"
        message.value = error.message || "Erreur lors de la création du congé"
    }
}
async function annuler(id) {
    try {
        await annulerConge(id);

        messageType.value = "success";
        message.value = " Demande annulée avec succès.";

        await chargerDemandes();
    } catch (e) {
        messageType.value = "error";
        message.value = e.message;
    }
}
function formatDate(dateStr) {
    if (!dateStr) return '-'

    const date = new Date(dateStr)

    if (Number.isNaN(date.getTime())) return dateStr

    return date.toLocaleDateString('fr-FR')
}

function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '-'

    const date = new Date(dateTimeStr)

    if (Number.isNaN(date.getTime())) return dateTimeStr

    return date.toLocaleString('fr-FR')
}
function formatStatut(statut) {
    const labels = {
        en_attente: 'En attente',
        approuve: 'Approuvé',
        refuse: 'Refusé',
        annule: 'Annulé'
    }

    return labels[statut] || statut
}
async function chargerSolde() {
    try {
        solde.value = await getSoldeConges();
    } catch (e) {
        messageType.value = "error";
        message.value = e.message;
    }
}
</script>

<style scoped>
.conges-page {
    min-height: 100vh;
    background: #f4f6f8;
}

.liste {
    margin-top: 28px;
}

.liste-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 12px;
    background: white;
    border-radius: 8px;
    overflow: hidden;
}

.table th,
.table td {
    border: 1px solid #e6e6e6;
    padding: 10px;
    text-align: left;
    font-size: 14px;
}

.table th {
    background: #f8faf9;
}

.badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    border: 1px solid;
}

.badge-en_attente {
    background: #fed7aa;
    color: #92400e;
    border-color: #fbbf24;
}

.badge-approuve {
    background: #dcfce7;
    color: #166534;
    border-color: #22c55e;
}

.badge-refuse {
    background: #fee2e2;
    color: #991b1b;
    border-color: #ef4444;
}

.badge-annule {
    background: #e5e7eb;
    color: #374151;
    border-color: #d1d5db;
}

.section {
    margin-bottom: 28px;
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-title {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    padding-bottom: 12px;
    border-bottom: 2px solid #f0f0f0;
}

.liste-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.liste-header h2 {
    margin: 0;
    font-size: 18px;
    color: #111827;
}

.row-refused {
    background: #fef2f2;
}

.row-approved {
    background: #f0fdf4;
}

.empty {
    margin-top: 12px;
    color: #6b7280;
}

.conges-container {
    margin-left: 272px;
    padding: 28px 24px;
    max-width: 900px;
}

h1 {
    font-family: 'Poppins', sans-serif;
    margin-bottom: 12px;
}

.message {
    margin-bottom: 18px;
    padding: 12px;
    border-radius: 8px;
    font-size: 14px;
}

.message.success {
    background: #eefaf8;
    color: #065f46;
}

.message.error {
    background: #fdeaea;
    color: #b91c1c;
}

.form {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
    align-items: start;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group.full-width {
    grid-column: 1 / -1;
}

label {
    font-weight: 600;
    margin-bottom: 6px;
}

input[type="date"],
textarea {
    padding: 10px 12px;
    border: 1px solid #e6e6e6;
    border-radius: 8px;
    font-size: 14px;
    background: white;
}

textarea {
    min-height: 100px;
    resize: vertical;
}

.erreur {
    grid-column: 1 / -1;
    margin-top: 4px;
    padding: 10px;
    border-radius: 8px;
    background: #fdeaea;
    color: #b91c1c;
    font-size: 14px;
}

.duree {
    grid-column: 1 / -1;
    margin-top: 8px;
    padding: 10px;
    border-radius: 8px;
    background: #eefaf8;
    color: #065f46;
    font-weight: 600;
}

.actions {
    grid-column: 1 / -1;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 12px;
}

.btn {
    padding: 10px 16px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-weight: 600;
}

.btn-primary {
    background: #0d9488;
    color: white;
}

.btn-primary:hover {
    background: #0f766e;
}

.btn-secondary {
    background: transparent;
    border: 1px solid #e6e6e6;
    color: #374151;
}

.btn-secondary:hover {
    background: #f8faf9;
}

/* Responsive */
@media (max-width: 768px) {
    .form {
        grid-template-columns: 1fr;
    }

    .actions {
        justify-content: stretch;
        flex-direction: column-reverse;
    }

    .btn {
        width: 100%;
    }
}

.solde-box {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
    padding: 16px;
    background: #eefaf8;
    border-radius: 10px;
    border: 1px solid #d1fae5;
}

.solde-item {
    font-size: 14px;
    color: #065f46;
}
</style>