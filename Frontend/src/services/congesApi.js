const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

function handleResponse(res) {
  return res.json().then((json) => {
    if (!res.ok) {
      const message = json?.message || json?.error || `Réponse serveur ${res.status}`;
      const error = new Error(message);
      error.status = res.status;
      throw error;
    }
    return json;
  });
}

export async function getMesConges() {
  const res = await fetch(`${API_BASE}/api/conges`, {
    headers: getAuthHeaders(),
  });

  const json = await handleResponse(res);
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

export async function getStatsConges() {
  const res = await fetch(`${API_BASE}/api/conges/stats`, {
    headers: getAuthHeaders(),
  });

  const json = await handleResponse(res);
  return json.data ?? json;
}

export async function validerConge(id) {
  const res = await fetch(`${API_BASE}/api/conges/${id}/valider`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Erreur lors de la validation");
  }

  return json.data;
}

export async function refuserConge(id) {
  const res = await fetch(`${API_BASE}/api/conges/${id}/refuser`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Erreur lors du refus");
  }
  return json.data;
}

export async function getAllConges() {
  const res = await fetch(`${API_BASE}/api/conges`, {
    headers: getAuthHeaders(),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Impossible de récupérer les congés");
  }

  return json.data;

}