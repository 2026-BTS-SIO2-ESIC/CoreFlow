import { apiUrl } from "../config/api";

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
  const res = await fetch(apiUrl("conges"), {
    headers: getAuthHeaders(),
  });

  const json = await handleResponse(res);
  return json.data;
}

export async function creerConge(payload) {
  const res = await fetch(apiUrl("conges"), {
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
  const res = await fetch(apiUrl(`conges/${id}/annuler`), {
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
  const res = await fetch(apiUrl("conges/solde"), {
    headers: getAuthHeaders(),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Erreur lors de la récupération du solde");
  }

  return json.data;
}

export async function getStatsConges() {
  const res = await fetch(apiUrl("conges/stats"), {
    headers: getAuthHeaders(),
  });

  const json = await handleResponse(res);
  return json.data ?? json;
}

export async function validerConge(id, commentaire = null) {
  const res = await fetch(apiUrl(`conges/${id}/valider`), {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ commentaire })
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Erreur lors de la validation");
  }

  return json.data;
}

export async function refuserConge(id, commentaire = null) {
  const res = await fetch(apiUrl(`conges/${id}/refuser`), {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ commentaire })
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Erreur lors du refus");
  }

  return json.data;
}

export async function annulerValidationConge(id) {
  const res = await fetch(apiUrl(`conges/${id}/annuler-validation`), {
    method: "PUT",
    headers: getAuthHeaders()
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Erreur lors de l'annulation de la validation");
  }

  return json.data;
}

export async function annulerRefusConge(id) {
  const res = await fetch(apiUrl(`conges/${id}/annuler-refus`), {
    method: "PUT",
    headers: getAuthHeaders()
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Erreur lors de l'annulation du refus");
  }

  return json.data;
}

export async function getAllConges() {
  const res = await fetch(apiUrl("conges"), {
    headers: getAuthHeaders(),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Impossible de récupérer les congés");
  }

  return json.data;

}