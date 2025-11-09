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

// Définition des thèmes disponibles
// Chaque thème a un label (affiché dans le select) et un subtitle (texte sous le titre)
const themes = {
  default:    { label: "Default", subtitle: "Because why not?" },
  dark:       { label: "Sombre", subtitle: "Darkness is my ally" },
  light:      { label: "Clair", subtitle: "Qui aime ce thème ?" },
  neon:       { label: "Néon", subtitle: "How was your day ?"},
  nf:         { label: "NF", subtitle: "You call it music, i call it my Therapist" },
  drift:      { label: "Drift", subtitle: "Si la route t'appelle, contre appel" },
  fanatic:    { label: "Fanatic", subtitle: "Always Fnatic !" },
  cyberpunk:  { label: "Cyberpunk", subtitle: "Wake up, choom. We’ve got a city to burn." },
  chirac:     { label: "Chirac", subtitle: "J'aime les pommes" },
  spicy:      { label: "Spicy", subtitle: "The Spiciest One" },
  vilbrequin: { label: "Vilbrequin", subtitle: "Rend l'argent" }
};


const themeSelect = document.getElementById("themeSelect");

// Remplir le select avec les options à partir du dictionnaire
function populateThemeSelect() {
  for (const [themeKey, themeInfo] of Object.entries(themes)) {
    const option = document.createElement("option");
    option.value = themeKey;        
    option.textContent = themeInfo.label; 
    themeSelect.appendChild(option);
  }
}

// Appliquer un thème sur le body et mettre à jour le subtitle
function applyTheme(themeKey) {
  // Supprimer les classes de tous les thèmes
  document.body.classList.remove(...Object.keys(themes));
  // Ajouter la classe correspondant au thème sélectionné
  document.body.classList.add(themeKey);

  // Mettre à jour le subtitle
  const subtitleElement = document.getElementById("subtitle");
  if (subtitleElement && themes[themeKey]) {
    subtitleElement.textContent = themes[themeKey].subtitle;
  }

}

// Sauvegarder le thème choisi dans le navigateur
function saveTheme(themeKey) {
  localStorage.setItem("selectedTheme", themeKey);
}

// Charger le thème sauvegardé au démarrage
function loadTheme() {
  const savedTheme = localStorage.getItem("selectedTheme");

  if (savedTheme && themes[savedTheme]) {
    applyTheme(savedTheme);
    themeSelect.value = savedTheme;
  } else {
    applyTheme("dark");  // thème par défaut
    themeSelect.value = "dark";
  }
}

// Quand l'utilisateur change le thème depuis le select
themeSelect.addEventListener("change", (event) => {
  const selectedTheme = event.target.value;
  if (themes[selectedTheme]) {
    applyTheme(selectedTheme);
    saveTheme(selectedTheme);
  }
});

// Initialisation
populateThemeSelect();
loadTheme();