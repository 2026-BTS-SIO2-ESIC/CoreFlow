const API_BASE = "http://localhost:3000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getMesConges() {
  const res = await fetch(`${API_BASE}/api/conges`, {
    headers: getAuthHeaders(),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Impossible de récupérer les congés");
  }

  return json.data;
}

export async function creerConge(payload) {
  const res = await fetch(`${API_BASE}/api/conges`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (!res.ok) {
    
    throw new Error(json.message || "Erreur lors de la création");
  }

  return json.data;
}

export async function annulerConge(id) {
  const res = await fetch(`${API_BASE}/api/conges/${id}/annuler`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Erreur lors de l'annulation");
  }

  return json.data;
}

export async function getSoldeConges() {
  const res = await fetch(`${API_BASE}/api/conges/solde`, {
    headers: getAuthHeaders(),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Erreur lors de la récupération du solde");
  }

  return json.data;
}