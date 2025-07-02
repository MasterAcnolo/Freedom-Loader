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

// Liste des thèmes disponibles (clé = nom, valeur = label affiché)
const themes = {
  default: "Default",
  dark: "Sombre",
  light: "Clair",
  chirac: "Chirac",
  fanatic: "Fanatic",
  cyberpunk: "Cyberpunk",
  spicy: "Spicy",
  vilbrequin: "Vilbrequin"
};

const themeSubtitles = {
  default: "Because why not?",
  dark: "Darkness is my ally",
  light: "Qui aime ce thème ?",
  chirac: "J'aime les pommes",
  fanatic: "Always Fnatic !",
  cyberpunk: "Wake up, choom. We’ve got a city to burn.",
  spicy: "The Spiciest One",
  vilbrequin: "Rend l'argent"
};

const themeSelect = document.getElementById("themeSelect");

// Remplir le select avec les options
function populateThemeSelect() {
  for (const [key, label] of Object.entries(themes)) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = label;
    themeSelect.appendChild(option);
  }
}

// Appliquer le thème sur le body et changer le subtitle
function applyTheme(themeName) {
  // Supprime les classes thème précédentes
  document.body.classList.remove(...Object.keys(themes));
  // Ajoute la classe du thème actuel
  document.body.classList.add(themeName);

  // Modifier le subtitle
  const subtitle = document.getElementById("subtitle");
  if (subtitle && themeSubtitles[themeName]) {
    subtitle.textContent = themeSubtitles[themeName];
  }

  // Optionnel : animation spéciale Chirac
  if (themeName === "chirac") {
    requestAnimationFrame(() => {
      document.body.classList.add("theme-active");
    });
  } else {
    document.body.classList.remove("theme-active");
  }
}

// Sauvegarder le thème en localStorage
function saveTheme(themeName) {
  localStorage.setItem("selectedTheme", themeName);
}

// Charger le thème au démarrage
function loadTheme() {
  const savedTheme = localStorage.getItem("selectedTheme");
  if (savedTheme && themes[savedTheme]) {
    applyTheme(savedTheme);
    themeSelect.value = savedTheme;
  } else {
    applyTheme("dark");
    themeSelect.value = "dark";
  }
}

// Quand l’utilisateur change le select
themeSelect.addEventListener("change", (e) => {
  const selected = e.target.value;
  if (themes[selected]) {
    applyTheme(selected);
    saveTheme(selected);
  }
});

// Initialisation
populateThemeSelect();
loadTheme();
