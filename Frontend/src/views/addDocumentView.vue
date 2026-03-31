<template>
  <main class="min-h-screen bg-[#F0FDFA] flex justify-center p-12">
      <DashboardSidebar
        :user="user"
        :loading="false"
        @logout="logout"
      />
      
    <div class="w-full max-w-2xl">
      
      <div class="mb-10">
        <h1 class="text-gray-900" style="font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 32px;">
          Publier un nouveau document
        </h1>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
        
        <form @submit.prevent="envoyerDocument">
          
          <div 
            @click="declencherInputFichier" 
            class="border-2 border-dashed border-[#0D9488]/40 rounded-xl p-10 mb-8 text-center cursor-pointer transition-colors bg-[#F0FDFA]/50 hover:bg-[#F0FDFA]"
          >
            <div class="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-50">
              <svg class="w-6 h-6 text-[#0D9488]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
              </svg>
            </div>
            <p class="font-semibold text-gray-900 mb-1 text-[15px]" style="font-family: 'Mulish', sans-serif;">
              {{ nomFichier ? nomFichier : 'Glissez vos fichiers ici ou parcourez' }}
            </p>
            <p class="text-[13px] text-gray-500" style="font-family: 'Mulish', sans-serif;">
              PDF, DOCX, XLSX jusqu'à 10 Mo
            </p>
            <input type="file" ref="inputFichier" class="hidden" @change="captureFichier" accept=".pdf,.doc,.docx,.xls,.xlsx"/>
          </div>

          <div class="space-y-8">
            
            <div>
              <label class="block text-gray-700 mb-2" style="font-family: 'Mulish', sans-serif; font-weight: 600; font-size: 14px;">
                Titre du document
              </label>
              <input
                v-model="titre"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] transition-colors"
                placeholder="Ex: Rapport trimestriel Q4"
              />
            </div>

            <div>
              <label class="block text-gray-700 mb-2" style="font-family: 'Mulish', sans-serif; font-weight: 600; font-size: 14px;">
                Description
              </label>
              <textarea
                v-model="description"
                required
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] resize-none transition-colors"
                rows="4"
                placeholder="Ajoutez une description du document..."
              ></textarea>
            </div>

            <div>
              <label class="block text-gray-700 mb-2" style="font-family: 'Mulish', sans-serif; font-weight: 600; font-size: 14px;">
                Service associé
              </label>
              <select
                v-model="service_id"
                required
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] bg-white transition-colors"
              >
                <option value="" disabled>Sélectionnez un service</option>
                <option value="1">IT</option>
                <option value="2">Ressources Humaines</option>
                <option value="3">Commercial</option>
                <option value="4">Direction</option>
              </select>
            </div>

            <div>
              <label class="block text-gray-700 mb-2" style="font-family: 'Mulish', sans-serif; font-weight: 600; font-size: 14px;">
                Niveau de confidentialité
              </label>
              <select 
                v-model="cible_role"
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] bg-white transition-colors"
              >
                <option value="Tous">Public</option>
                <option value="Admin">Admin</option>
                <option value="RH">RH</option>
              </select>
            </div>

          </div>

          <div v-if="message" :class="isSuccess ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'" class="p-3 mt-8 rounded-lg text-center font-semibold text-sm">
            {{ message }}
          </div>

          <div class="flex items-center gap-4 mt-10 pt-8 border-t border-gray-50">
            <button type="button" @click="reinitialiser" class="flex-1 px-6 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" style="font-family: 'Mulish', sans-serif; font-weight: 600; font-size: 15px;">
              Annuler
            </button>
            <button type="submit" :disabled="isLoading" class="flex-1 px-6 py-3.5 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors shadow-sm disabled:opacity-50" style="font-family: 'Mulish', sans-serif; font-weight: 600; font-size: 15px;">
              {{ isLoading ? 'Envoi...' : 'Publier' }}
            </button>
          </div>

        </form>

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

// Variables
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

// Fonctions d'interaction fichier
const declencherInputFichier = () => inputFichier.value.click();
const captureFichier = (event) => {
  const file = event.target.files[0];
  if (file) {
    fichierSelectionne.value = file;
    nomFichier.value = file.name;
  }
};

// Reset
const reinitialiser = () => {
  titre.value = '';
  description.value = '';
  service_id.value = '';
  cible_role.value = 'Tous';
  fichierSelectionne.value = null;
  nomFichier.value = '';
  message.value = '';
};

// Envoi
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
    const response = await fetch('${import.meta.env.VITE_API_BASE}/api/documents', {
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