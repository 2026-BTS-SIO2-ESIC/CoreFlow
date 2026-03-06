const API_BASE = "http://localhost:3000";

export async function getMesConges() {
  const res = await fetch(`${API_BASE}/api/conges`);
  if (!res.ok) throw new Error("Impossible de récupérer les congés");
  const json = await res.json();
  return json.data; // car ton backend renvoie { success, data: [...] }
}

export async function creerConge(payload) {
  const res = await fetch(`${API_BASE}/api/conges`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (!res.ok) {
    // ton backend renvoie { success:false, message:"..." }
    throw new Error(json.message || "Erreur lors de la création");
  }

  return json.data; // { ...newConge }
}

export async function annulerConge(id) {
  const response = await fetch(`${API_BASE}/api/conges/${id}/annuler`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    }
  });

  const text = await response.text();

  let data = {};
  if (text) {
    data = JSON.parse(text);
  }

  if (!response.ok) {
    throw new Error(data.message || "Erreur lors de l'annulation");
  }

  return data;
}