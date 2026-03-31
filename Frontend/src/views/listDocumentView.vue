<template>
  <div class="flex min-h-screen bg-[#F0FDFA]">
    <DashboardSidebar :user="user" @logout="logout" />
    <main class="flex-1 p-10 overflow-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-gray-900 font-bold text-[32px] font-['Poppins']">
          Documents
        </h1>
        <button 
          @click="$router.push('/documents/add')"
          class="bg-[#0D9488] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#0D9488]/90 transition-colors shadow-sm font-semibold font-['Mulish'] text-[15px]"
        >
          <Plus :size="20" />
          Ajouter un document
        </button>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 text-gray-700 font-semibold font-['Mulish'] text-[14px]">
            <Filter :size="20" />
            Filtres :
          </div>
          <select class="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 bg-white font-['Mulish'] text-[14px]">
            <option>Filtrer par Service</option>
          </select>
          <select class="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 bg-white font-['Mulish'] text-[14px]">
            <option>Format</option>
          </select>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200 text-left">
              <th class="pb-4 text-gray-600 font-semibold font-['Mulish'] text-[14px]">Nom du fichier</th>
              <th class="pb-4 text-gray-600 font-semibold font-['Mulish'] text-[14px]">Service</th>
              <th class="pb-4 text-gray-600 font-semibold font-['Mulish'] text-[14px]">Taille</th>
              <th class="pb-4 text-gray-600 font-semibold font-['Mulish'] text-[14px]">Date d'ajout</th>
              <th class="pb-4 text-gray-600 font-semibold font-['Mulish'] text-[14px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="doc in documents" :key="doc.id" class="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
              <td class="py-4 text-gray-900 font-medium font-['Mulish'] text-[14px]">{{ doc.titre }}</td>
              <td class="py-4">
                <span class="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 font-['Mulish'] text-[13px]">
                  {{ doc.service_nom || 'Général' }}
                </span>
              </td>
              <td class="py-4 text-gray-600 font-['Mulish'] text-[14px]">{{ doc.taille_ko }} Ko</td>
              <td class="py-4 text-gray-600 font-['Mulish'] text-[14px]">{{ doc.date_affichage }}</td>
              <td class="py-4">
                <div class="flex items-center gap-2">
                  <button @click="telecharger(doc)" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Télécharger">
                    <Download :size="18" class="text-gray-600" />
                  </button>
                  <a :href="`${apiBase}/uploads/${doc.fichier_path}`" target="_blank" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Voir">
                    <Eye :size="18" class="text-gray-600" />
                  </a>
                  <button @click="confirmerSuppression(doc.id)" class="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                    <Trash2 :size="18" class="text-red-500" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="documents.length === 0" class="text-center py-10 text-gray-400 italic">
          Aucun document trouvé.
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
const apiBase = import.meta.env.VITE_API_BASE;

const router = useRouter();
const user = ref(null);
const documents = ref([]);

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, Filter, Download, Eye, Trash2 } from 'lucide-vue-next';
import DashboardSidebar from '@/components/DashboardSidebar.vue';


const fetchDocuments = async () => {
  try {
    const response = await fetch(`${apiBase}/api/documents`);
    const data = await response.json();
    // Correction cruciale : on assigne directement 'data' car ton backend 
    // renvoie directement un tableau
    documents.value = data;
    // Ajoute cette ligne pour voir dans Inspecter > Console
    console.log("Données reçues du Backend :", data);
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
  }
};

const telecharger = async (doc) => {
  // Méthode propre pour forcer le téléchargement malgré les ports différents
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE}/uploads/${doc.fichier_path}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', doc.titre);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (e) {
    console.error("Erreur téléchargement", e);
  }
};

//on appelle  pour l'api pour supprimer document api/documents/:id
const confirmerSuppression = (id) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
        fetch(`${import.meta.env.VITE_API_BASE}/api/documents/${id}`, {
        method: 'DELETE'
        })
        .then(response => {
        if (response.ok) {
            // Supprimer le document de la liste locale
            documents.value = documents.value.filter(doc => doc.id !== id);
        } else {
            console.error("Erreur suppression", response.statusText);
        }
        })
        .catch(e => console.error("Erreur suppression", e));
    }
    };

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
};

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

  fetchDocuments();
});
</script>