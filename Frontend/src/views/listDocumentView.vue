<template>
  <div class="flex min-h-screen bg-[#F0FDFA]">
    <DashboardSidebar :user="user" @logout="logout" />
    <main class="flex-1 lg:ml-[248px] p-4 sm:p-6 lg:p-10 overflow-auto">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
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

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
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

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div class="overflow-x-auto">
        <table class="w-full min-w-[760px]">
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
        </div>

        <div v-if="documents.length === 0" class="text-center py-10 text-gray-400 italic">
          Aucun document trouvé.
        </div>
      </div>

     <div v-if="isEditModalOpen" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal-card">
          <h2 class="modal-title">Modifier le document</h2>
          
          <form @submit.prevent="submitEdit">
            <div class="form-group">
              <label>Titre du document</label>
              <input v-model="documentToEdit.titre" type="text" required class="custom-input" />
            </div>
            
            <div class="form-group">
              <label>Description</label>
              <textarea v-model="documentToEdit.description" rows="3" class="custom-input"></textarea>
            </div>

            <div class="form-group">
              <label>Visibilité (Cible)</label>
              <select v-model="documentToEdit.cible_role" class="custom-input">
                <option value="Tous">Tous les employés</option>
                <option value="admin">Administrateurs uniquement</option>
                <option value="rh">Ressources Humaines</option>
                <option value="manager">Managers</option>
              </select>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeEditModal" class="btn-cancel">
                Annuler
              </button>
              <button type="submit" class="btn-submit">
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, Filter, Download, Eye, Trash2, Pencil } from 'lucide-vue-next';

const router = useRouter();
const user = ref(null);
const documents = ref([]);

// Variables pour la modale
const isEditModalOpen = ref(false);
const documentToEdit = ref({ id: null, titre: '', description: '', cible_role: 'Tous' });

// La fameuse variable d'environnement de ton équipe !
const apiBase = import.meta.env.VITE_API_BASE;

const fetchDocuments = async () => {
  try {
    const response = await fetch(`${apiBase}/api/documents`);
    const data = await response.json();
    documents.value = data;
    console.log("Données reçues du Backend :", data);
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
  }
};

const telecharger = async (doc) => {
  try {
    const response = await fetch(`${apiBase}/uploads/${doc.fichier_path}`);
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

const confirmerSuppression = (id) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
        fetch(`${apiBase}/api/documents/${id}`, {
        method: 'DELETE'
        })
        .then(response => {
        if (response.ok) {
            documents.value = documents.value.filter(doc => doc.id !== id);
        } else {
            console.error("Erreur suppression", response.statusText);
        }
        })
        .catch(e => console.error("Erreur suppression", e));
    }
};

// --- FONCTIONS POUR LA MODIFICATION ---

const openEditModal = (doc) => {
  documentToEdit.value = {
    id: doc.id,
    titre: doc.titre,
    description: doc.description || '',
    cible_role: doc.cible_role || 'Tous'
  };
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
};

const submitEdit = async () => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${apiBase}/api/documents/${documentToEdit.value.id}`, {
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
<style scoped>
/* =========================================
   MODALE DE MODIFICATION (100% CSS)
   ========================================= */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 20px;
}

.modal-card {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 40px; /* Aération généreuse de 40px comme sur la création */
  width: 100%;
  max-width: 550px;
}

.modal-title {
  color: #111827;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 24px;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  color: #374151;
  font-family: 'Mulish', sans-serif;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
}

.custom-input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-family: 'Mulish', sans-serif;
  transition: all 0.2s ease;
  outline: none;
  background-color: white;
}

.custom-input:focus {
  border-color: #0D9488;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
}

.custom-input textarea {
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #F3F4F6;
}

.btn-cancel, .btn-submit {
  padding: 12px 24px;
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

/* =========================================
   RESPONSIVE MOBILE MODALE (Écrans < 768px)
   ========================================= */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 16px; /* Évite que la modale touche les bords de l'écran */
  }

  .modal-card {
    padding: 24px 16px; /* Moins de marge intérieure */
  }

  .modal-title {
    font-size: 20px; /* Titre réduit */
  }

  .modal-actions {
    flex-direction: column-reverse; /* UX Mobile : on empile les boutons l'un sur l'autre */
    gap: 12px;
  }

  .btn-cancel, .btn-submit {
    width: 100%; /* Gros boutons pour le tactile */
    text-align: center;
  }
}
</style>