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