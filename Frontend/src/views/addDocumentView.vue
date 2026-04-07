<template>
  <main class="page-layout main-content">
      <DashboardSidebar
        :user="user"
        :loading="false"
        @logout="logout"
      />
      
    <div class="content-centered">
      
      <div class="form-wrapper">
        <div class="header-section">
          <h1 class="page-title">Publier un nouveau document</h1>
        </div>

        <div class="form-card">
          
          <form @submit.prevent="envoyerDocument">
            
            <div @click="declencherInputFichier" class="upload-zone">
              <div class="upload-icon-wrapper">
                <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                </svg>
              </div>
              <p class="upload-title">
                {{ nomFichier ? nomFichier : 'Glissez vos fichiers ici ou parcourez' }}
              </p>
              <p class="upload-subtitle">
                PDF, DOCX, XLSX jusqu'à 10 Mo
              </p>
              <input type="file" ref="inputFichier" class="hidden" @change="captureFichier" accept=".pdf,.doc,.docx,.xls,.xlsx"/>
            </div>

            <div class="form-group">
              <label>Titre du document</label>
              <input v-model="titre" type="text" required class="custom-input" placeholder="Ex: Rapport trimestriel Q4" />
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea v-model="description" required class="custom-input" rows="4" placeholder="Ajoutez une description du document..."></textarea>
            </div>

            <div class="form-group">
              <label>Service associé</label>
              <select v-model="service_id" required class="custom-input bg-white">
                <option value="" disabled>Sélectionnez un service</option>
                <option value="1">IT</option>
                <option value="2">Ressources Humaines</option>
                <option value="3">Commercial</option>
                <option value="4">Direction</option>
              </select>
            </div>

            <div class="form-group">
              <label>Niveau de confidentialité</label>
              <select v-model="cible_role" class="custom-input bg-white">
                <option value="Tous">Public</option>
                <option value="Admin">Admin</option>
                <option value="RH">RH</option>
              </select>
            </div>

            <div v-if="message" :class="isSuccess ? 'success-msg' : 'error-msg'">
              {{ message }}
            </div>

            <div class="action-buttons">
              <button type="button" @click="reinitialiser" class="btn-cancel">
                Annuler
              </button>
              <button type="submit" :disabled="isLoading" class="btn-submit">
                {{ isLoading ? 'Envoi...' : 'Publier' }}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import DashboardSidebar from '@/components/DashboardSidebar.vue';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const user = ref(null);

const titre = ref('');
const description = ref('');
const cible_role = ref('Tous');
const service_id = ref('');
const fichierSelectionne = ref(null);
const nomFichier = ref(''); 
const inputFichier = ref(null);
const message = ref('');
const isSuccess = ref(false);
const isLoading = ref(false);

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
});

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
};

const declencherInputFichier = () => inputFichier.value.click();
const captureFichier = (event) => {
  const file = event.target.files[0];
  if (file) {
    fichierSelectionne.value = file;
    nomFichier.value = file.name;
  }
};

const reinitialiser = () => {
  titre.value = '';
  description.value = '';
  service_id.value = '';
  cible_role.value = 'Tous';
  fichierSelectionne.value = null;
  nomFichier.value = '';
  message.value = '';
};

const envoyerDocument = async () => {
  if (!fichierSelectionne.value) {
    message.value = "⚠️ Veuillez sélectionner un fichier.";
    isSuccess.value = false;
    return;
  }

  isLoading.value = true;
  message.value = '';

  const formData = new FormData();
  formData.append('titre', titre.value);
  formData.append('description', description.value);
  formData.append('cible_role', cible_role.value);
  formData.append('service_id', service_id.value); 
  formData.append('fichier', fichierSelectionne.value); 

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/documents`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      isSuccess.value = true;
      message.value = "🎉 Document publié avec succès !";
      setTimeout(() => reinitialiser(), 3000);
    } else {
      isSuccess.value = false;
      message.value = "Erreur du serveur : " + (data.message || "Une erreur est survenue");
    }
  } catch (error) {
    isSuccess.value = false;
    message.value = "❌ Impossible de contacter le serveur.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* =========================================
   1. LAYOUT PRINCIPAL (Ta solution blindée)
   ========================================= */
.page-layout { 
  min-height: 100vh; 
  background-color: #F0FDFA; 
}

.main-content { 
  padding: 24px; 
}

@media (min-width: 1025px) {  
  .main-content {     
    padding-left: calc(248px + 32px);    
    padding-right: 32px;  
  } 
} 

.content-centered {  
  max-width: 1152px;  
  margin: 0 auto;    
  width: 100%; 
}

/* =========================================
   2. LE FORMULAIRE & LA CARTE (Aéré et propre)
   ========================================= */
.form-wrapper {
  max-width: 750px; /* Évite que le formulaire soit trop large sur grand écran */
  margin: 0 auto;
}

.header-section {
  margin-bottom: 30px;
}

.page-title {
  color: #111827;
  font-family: 'Poppins', sans-serif; 
  font-weight: 700; 
  font-size: 32px;
}

.form-card {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #F3F4F6;
  padding: 40px; /* LE SECRET DE L'AÉRATION EST ICI */
}

/* =========================================
   3. LES CHAMPS (Inputs & Selects)
   ========================================= */
.form-group {
  margin-bottom: 24px; /* Espace généreux entre chaque champ */
}

.form-group label {
  display: block;
  color: #374151;
  font-family: 'Mulish', sans-serif; 
  font-weight: 600; 
  font-size: 14px;
  margin-bottom: 8px; /* Espace entre le texte et le champ */
}

.custom-input {
  width: 100%;
  padding: 14px 16px; /* Des champs bien larges et confortables */
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-family: 'Mulish', sans-serif;
  transition: all 0.2s ease;
  outline: none;
}

.custom-input:focus {
  border-color: #0D9488;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
}

.custom-input textarea {
  resize: none;
}

/* =========================================
   4. ZONE D'UPLOAD DE FICHIER
   ========================================= */
.upload-zone {
  border: 2px dashed rgba(13, 148, 136, 0.4);
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  background-color: rgba(240, 253, 250, 0.5);
  transition: background-color 0.2s ease;
  margin-bottom: 32px;
}

.upload-zone:hover {
  background-color: #F0FDFA;
}

.upload-icon-wrapper {
  width: 56px;
  height: 56px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px auto;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  border: 1px solid #F9FAFB;
}

.upload-icon {
  width: 24px;
  height: 24px;
  color: #0D9488;
}

.upload-title {
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
  font-family: 'Mulish', sans-serif;
  font-size: 15px;
}

.upload-subtitle {
  font-size: 13px;
  color: #6B7280;
  font-family: 'Mulish', sans-serif;
}

/* =========================================
   5. BOUTONS & MESSAGES
   ========================================= */
.action-buttons {
  display: flex;
  gap: 16px; /* Espace entre les deux boutons */
  margin-top: 40px;
  padding-top: 32px;
  border-top: 1px solid #F9FAFB;
}

.btn-cancel, .btn-submit {
  flex: 1;
  padding: 14px 24px;
  border-radius: 8px;
  font-family: 'Mulish', sans-serif; 
  font-weight: 600; 
  font-size: 15px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-cancel {
  background-color: white;
  border: 1px solid #E5E7EB;
  color: #374151;
}

.btn-cancel:hover {
  background-color: #F9FAFB;
}

.btn-submit {
  background-color: #0D9488;
  border: none;
  color: white;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.btn-submit:hover {
  background-color: #0F766E;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.success-msg, .error-msg {
  padding: 12px;
  margin-top: 24px;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
}

.success-msg { color: #16A34A; background-color: #F0FDF4; }
.error-msg { color: #DC2626; background-color: #FEF2F2; }

/* =========================================
   6. RESPONSIVE MOBILE (Écrans < 768px)
   ========================================= */
@media (max-width: 768px) {
  .main-content {
    padding: 16px; /* Moins de marge sur les bords de l'écran */
  }
  
  .page-title {
    font-size: 24px; /* Titre un peu plus petit */
  }
  
  .form-card {
    padding: 24px 16px; /* On réduit le padding interne de la carte pour laisser la place aux champs */
  }
  
  .upload-zone {
    padding: 24px 16px; /* Zone de glisser-déposer moins haute */
  }

  .action-buttons {
    flex-direction: column-reverse; /* UX Mobile : on empile les boutons (Annuler en bas) */
    gap: 12px;
  }

  .btn-cancel, .btn-submit {
    width: 100%; /* Les boutons prennent toute la largeur pour faciliter le clic au pouce */
  }
}
</style>