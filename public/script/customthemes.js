const themes = {
  default:    { label: "Default", subtitle: "Because why not?" },
  dark:       { label: "Sombre", subtitle: "Darkness is my ally" },
  light:      { label: "Clair", subtitle: "Qui aime ce thème ?" },
  neon:       { label: "Néon", subtitle: "How was your day ?"},
  nf:         { label: "NF", subtitle: "You call it music, i call it my Therapist" },
  songbird:   { label: "Songbird", subtitle: "From Her to Eternity" },
  drift:      { label: "Drift", subtitle: "Si la route t'appelle, contre appel" },
  fanatic:    { label: "Fanatic", subtitle: "Always Fnatic !" },
  chirac:     { label: "Chirac", subtitle: "J'aime les pommes" },
  spicy:      { label: "Spicy", subtitle: "The Spiciest One" },
};

const themeSelect = document.getElementById("themeSelect");

function populateThemeSelect() {
  for (const [themeKey, themeInfo] of Object.entries(themes)) {
    const option = document.createElement("option");
    option.value = themeKey;        
    option.textContent = themeInfo.label; 
    themeSelect.appendChild(option);
  }
}

function applyTheme(themeKey) {
  document.body.classList.remove(...Object.keys(themes));
  document.body.classList.add(themeKey);

  const subtitleElement = document.getElementById("subtitle");
  if (subtitleElement && themes[themeKey]) {
    subtitleElement.textContent = themes[themeKey].subtitle;
  }

}

function saveTheme(themeKey) {
  localStorage.setItem("selectedTheme", themeKey);
}

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