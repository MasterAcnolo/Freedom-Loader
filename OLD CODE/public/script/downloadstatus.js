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

// Élément où on affichera l’état du téléchargement (en cours, erreur, succès)
const statusDiv = document.getElementById("downloadStatus");

// Récupération du bouton de soumission pour pouvoir le désactiver pendant la requête
const button = form.querySelector("button");

// Écouteur d’événement pour intercepter la soumission du formulaire
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Empêche le rechargement automatique de la page

  // Désactive le bouton pour éviter les clics multiples pendant la requête
  button.disabled = true;

  // Affiche un message d’attente pour informer l’utilisateur
  statusDiv.textContent = "Téléchargement en cours...";

  // Prépare les données du formulaire au format URL-encoded
  const formData = new FormData(form);
  const params = new URLSearchParams(formData);

  try {
    // Envoie la requête POST vers /download avec les données du formulaire
    const res = await fetch("/download", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    // Si la réponse n’est pas un succès (code HTTP 4xx ou 5xx)
    if (!res.ok) {
      statusDiv.textContent = "❌ Erreur pendant le téléchargement.";
      return;
    }

    // Récupère le texte envoyé par le serveur (message de succès ou erreur)
    const text = await res.text();

    // Affiche le message retourné par le serveur
    statusDiv.textContent = text;
  } catch {
    // Gestion des erreurs réseau ou autres exceptions
    statusDiv.textContent = "❌ Une erreur s’est produite.";
  } finally {
    // Réactive le bouton pour permettre d’autres soumissions
    button.disabled = false;

    // Efface le message d’état après 5 secondes pour garder l’interface propre
    setTimeout(() => {
      statusDiv.textContent = "";
    }, 5000);
  }
});
