/*
  This file is part of Freedom Loader.

  Copyright (C) 2025 MasterAcnolo

  Freedom Loader is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License.

  Freedom Loader is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

// Récupération du formulaire de téléchargement
const form = document.getElementById("downloadForm");

// Div où on affiche l'état de progression (en cours, erreur, succès)
const statusDiv = document.getElementById("downloadStatus");

// Récupération du bouton de validation pour pouvoir le désactiver pendant la requête
const button = form.querySelector("button");

// On intercepte la soumission du formulaire
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // empêche le rechargement de la page par le navigateur

  // On désactive le bouton pour éviter les clics multiples
  button.disabled = true;

  // Affiche un message d'attente à l'utilisateur
  statusDiv.textContent = "Téléchargement en cours...";

  // Prépare les données du formulaire sous forme URL-encoded
  const formData = new FormData(form);
  const params = new URLSearchParams(formData);

  try {
    // Envoi de la requête POST vers /download avec les données du formulaire
    const res = await fetch("/download", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    // Si la réponse n'est pas un succès (code 4xx ou 5xx)
    if (!res.ok) {
      statusDiv.textContent = "❌ Erreur pendant le téléchargement.";
      return;
    }

    // On récupère le texte de la réponse du serveur
    const text = await res.text();

    // Affiche le message de fin de téléchargement (par exemple « Téléchargement terminé »)
    statusDiv.textContent = text;
  } catch {
    // Gestion d'erreur en cas de problème réseau ou autre
    statusDiv.textContent = "❌ Une erreur s’est produite.";
  } finally {
    // Réactive le bouton pour autoriser d'autres soumissions
    button.disabled = false;

    // Efface le message de status après 5 secondes pour garder l'UI propre
    setTimeout(() => {
      statusDiv.textContent = "";
    }, 5000);
  }
});
