<template>
  <div class="flex min-h-screen bg-[#F0FDFA]">

    

    <DashboardSidebar :user="user" @logout="logout" />
    <main class="flex-1 p-10 overflow-auto relative">

      <div class="flex items-center justify-between mb-8">
        <h1 class="text-gray-900 font-bold text-[32px] font-['Poppins']">
          Documents
        </h1>
        <button 
          v-if="user && ['admin', 'rh', 'manager'].includes(user.role.toLowerCase())"
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
                  <a :href="`http://localhost:3000/uploads/${doc.fichier_path}`" target="_blank" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Voir">
                    <Eye :size="18" class="text-gray-600" />
                  </a>

                  <button
                    v-if="user && ['admin', 'rh', 'manager'].includes(user.role.toLowerCase())"
                    @click="openEditModal(doc)" class="p-2 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
                    <Pencil :size="18" class="text-blue-500" />
                  </button>

                  <button
                    v-if="user && ['admin', 'rh', 'manager'].includes(user.role.toLowerCase())"
                    @click="confirmerSuppression(doc.id)" class="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
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

      <div v-if="isEditModalOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
          <h2 class="text-2xl font-bold mb-6 text-gray-900 font-['Poppins']">Modifier le document</h2>
          
          <form @submit.prevent="submitEdit" class="space-y-5">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2 font-['Mulish']">Titre du document</label>
              <input v-model="documentToEdit.titre" type="text" required class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488] font-['Mulish']" />
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2 font-['Mulish']">Description</label>
              <textarea v-model="documentToEdit.description" rows="3" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488] font-['Mulish']"></textarea>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2 font-['Mulish']">Visibilité (Cible)</label>
              <select v-model="documentToEdit.cible_role" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488] font-['Mulish']">
                <option value="Tous">Tous les employés</option>
                <option value="admin">Administrateurs uniquement</option>
                <option value="rh">Ressources Humaines</option>
                <option value="manager">Managers</option>
              </select>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" @click="closeEditModal" class="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-bold font-['Mulish'] transition-colors">
                Annuler
              </button>
              <button type="submit" class="px-5 py-2.5 bg-[#0D9488] text-white rounded-xl hover:bg-[#0D9488]/90 font-bold font-['Mulish'] transition-colors">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { Capacitor } from '@capacitor/core';
import { ref, onMounted } from 'vue';
 
import { Plus, Filter, Download, Eye, Trash2 } from 'lucide-vue-next';

import { useRouter } from 'vue-router';
// Ajout de l'icône Pencil ici !
import { Plus, Filter, Download, Eye, Trash2, Pencil } from 'lucide-vue-next';
import DashboardSidebar from '@/components/DashboardSidebar.vue';


const documents = ref([]);
// Detection de l'environnement (mobile ou desktop)
const API_BASE = Capacitor.isNativePlatform() 
  ? 'http:// 192.168.1.91:3000'  // Si on est sur l'émulateur Mobile
  : 'http://localhost:3000'; // Si on est sur le navigateur Desktop

// --- NOUVELLES VARIABLES POUR LA MODIFICATION ---
const isEditModalOpen = ref(false);
const documentToEdit = ref({
  id: null,
  titre: '',
  description: '',
  cible_role: 'Tous'
});

const fetchDocuments = async () => {
  try {
    const token = localStorage.getItem('token'); // Ajout du token de sécurité
    
    const response = await fetch(`${API_BASE}/api/documents`, {
      headers: {
        'Authorization': `Bearer ${token}` // On prouve notre identité au Backend
      }
    });
    
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
    const response = await fetch(`${API_BASE}/uploads/${doc.fichier_path}`);
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
        const token = localStorage.getItem('token'); // Ajout du token de sécurité
        
        fetch(`${API_BASE}/api/documents/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}` // On prouve qu'on a le droit de supprimer
          }
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

// --- NOUVELLES FONCTIONS POUR LA MODIFICATION ---

// Ouvre la modale et pré-remplit les informations
const openEditModal = (doc) => {
  documentToEdit.value = {
    id: doc.id,
    titre: doc.titre,
    description: doc.description || '',
    cible_role: doc.cible_role || 'Tous'
  };
  isEditModalOpen.value = true;
};

// Ferme la modale
const closeEditModal = () => {
  isEditModalOpen.value = false;
};

// Envoie la mise à jour à ton API
const submitEdit = async () => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE}/api/documents/${documentToEdit.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        titre: documentToEdit.value.titre,
        description: documentToEdit.value.description,
        cible_role: documentToEdit.value.cible_role
      })
    });

    if (response.ok) {
      // Si l'API dit OK, on met à jour l'affichage sans recharger la page
      const index = documents.value.findIndex(d => d.id === documentToEdit.value.id);
      if (index !== -1) {
        documents.value[index].titre = documentToEdit.value.titre;
        documents.value[index].description = documentToEdit.value.description;
        documents.value[index].cible_role = documentToEdit.value.cible_role;
      }
      closeEditModal();
    } else {
      alert("Erreur lors de la modification du document.");
    }
  } catch (error) {
    console.error("Erreur réseau :", error);
    alert("Impossible de contacter le serveur.");
  }
};

onMounted(fetchDocuments);
</script>