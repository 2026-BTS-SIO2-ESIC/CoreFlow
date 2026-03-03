<template>
    <div class="sidebar">
        <div class="logo">
            <div class="logo-icon">C</div>
            <div class="logo-text">CoreFlow</div>
        </div>
        <nav class="nav-menu">
            <a href="#" class="nav-item active">
                <div class="nav-icon">
                    <svg viewBox="0 0 24 24">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                </div>
                Tableau de bord
            </a>

            <router-link to="/conges/demande" class="nav-item">
                <div class="nav-icon">
                    <svg viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
                Mes Congés
            </router-link>

            <a href="#" class="nav-item">
                <div class="nav-icon">
                    <svg viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                </div>
                Événements
            </a>

            <a href="#" class="nav-item">
                <div class="nav-icon">
                    <svg viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                </div>
                Tickets & Support
            </a>
            <div v-if="user && (user.role === 'admin' || user.role === 'manager')">
                <a href="#" class="nav-item">
                    <div class="nav-icon">
                        <svg viewBox="0 0 24 24">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    Gestion utilisateurs
                </a>
            </div>
        </nav>
        <div class="user-profile">
            <div v-if="user">
                <div class="user-name">{{ user.nom }}</div>
                <div class="user-role">{{ user.role }}</div>
            </div>
            <button @click="logout" class="btn-logout">Déconnexion</button>
        </div>
    </div>
    <div class="conges-container">
        <h1>Nouvelle demande de congé</h1>

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
                <button type="submit " class="btn btn-primary">📤 Soumettre la demande</button>
            </div>
        </form>
        <!-- Liste des demandes (sous le formulaire) -->
        <div class="liste">
            <div class="liste-header">
                <h2>Mes demandes</h2>
                <button type="button" class="btn btn-secondary" @click="chargerDemandes">
                    🔄 Rafraîchir
                </button>
            </div>

            <div v-if="loading" class="empty">
                Chargement des demandes...
            </div>

            <div v-else-if="demandes.length === 0" class="empty">
                Aucune demande pour le moment.
            </div>

            <table v-else class="table">
                <thead>
                    <tr>
                        <th>Date demande</th>
                        <th>Date début</th>
                        <th>Date fin</th>
                        <th>Motif</th>
                        <th>Statut</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="d in demandes" :key="d.id">
                        <td>{{ formatDateTime(d.date_demande) }}</td>
                        <td>{{ formatDate(d.date_debut) }}</td>
                        <td>{{ formatDate(d.date_fin) }}</td>
                        <td>{{ d.motif || '-' }}</td>
                        <td>
                            <span :class="['badge', d.statut]">
                                {{ d.statut }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onMounted } from "vue";
import { getMesConges, creerConge } from "../services/congesApi";

const demandes = ref([]);
const loading = ref(false);

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
    chargerDemandes();
});

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
        if (d.statut !== "EN_ATTENTE") return false
        const dDebut = new Date(d.date_debut)
        const dFin = new Date(d.date_fin)
        return debut <= dFin && fin >= dDebut // chevauchement
    })

    if (conflit) {
        messageType.value = "error"
        message.value = "Vous avez déjà une demande en attente sur cette période."
        return
    }

    try {
        // 🔵 1) On appelle le backend
        await creerConge({
            date_debut: dateDebut.value,
            date_fin: dateFin.value,
            motif: motif.value || null
        });

        // 🟢 2) Message succès
        messageType.value = "success";
        message.value = "✅ Demande envoyée.";

        // 🟢 3) Reset formulaire
        dateDebut.value = "";
        dateFin.value = "";
        motif.value = "";

        // 🟢 4) Recharger la liste
        await chargerDemandes();

    } catch (e) {
        messageType.value = "error";
        message.value = e.message;
    }
}
function formatDate(dateStr) {
    if (!dateStr) return '-'
    // dateStr attendu: "YYYY-MM-DD"
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
}

function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '-'
    const dt = new Date(dateTimeStr)
    if (Number.isNaN(dt.getTime())) return dateTimeStr
    return dt.toLocaleString('fr-FR')
}
</script>

<style scoped>
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
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
}

.badge.EN_ATTENTE {
    background: #fef3c7;
    color: #92400e;
}

.badge.APPROUVEE,
.badge.VALIDEE {
    background: #d1fae5;
    color: #065f46;
}

.badge.REFUSEE {
    background: #fee2e2;
    color: #991b1b;
}

.badge.ANNULEE {
    background: #e5e7eb;
    color: #374151;
}

.empty {
    margin-top: 12px;
    color: #6b7280;
}

.sidebar {
    width: 240px;
    height: 100vh;
    background-color: #fafafa;
    border-right: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 0;
}

.logo {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 24px 16px;
}

.logo-icon {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 18px;
}

.logo-text {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
}

.nav-menu {
    flex: 1;
    padding: 16px 0;
    overflow-y: auto;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    color: #6b7280;
    text-decoration: none;
    transition: all 0.2s ease;
    cursor: pointer;
    font-size: 15px;
    border-left: 3px solid transparent;
}

.nav-item:hover {
    background-color: #f3f4f6;
    color: #14b8a6;
}

.nav-item.active {
    background-color: transparent;
    color: #14b8a6;
    border-left: 3px solid #14b8a6;
}

.nav-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.user-profile {
    padding: 16px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.user-avatar {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    background-color: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
    font-weight: 600;
    font-size: 18px;
}

.user-info {
    text-align: center;
}

.user-name {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 2px;
}

.user-role {
    font-size: 12px;
    color: #9ca3af;
    margin-bottom: 12px;
}

.logout-btn {
    background-color: #ef4444;
    color: white;
    border: none;
    padding: 8px 24px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.logout-btn:hover {
    background-color: #dc2626;
}

.btn-logout {
    padding: 10px 20px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}

.btn-logout:hover {
    background: #c82333;
}

.user-info {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 40px;
}

.user-info h2 {
    margin-top: 0;
    color: #333;
}

.user-info p {
    margin: 10px 0;
    color: #666;
}

.conges-container {
    margin-left: 260px;
    /* 240 sidebar + marge */
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
</style>