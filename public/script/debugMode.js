function waitForKonamiCode(){

  const konamiCode = [
    'arrowup', 'arrowup', 'arrowdown', 'arrowdown',
    'arrowleft', 'arrowright', 'arrowleft', 'arrowright',
    'b','a'
  ];

  let konamiIndex = 0;

  const isDebugModeEnabled = localStorage.getItem("DEBUG_MODE") === "true";

  if (isDebugModeEnabled) {
    showDebugElement();
  }

  window.addEventListener('keydown', function (e) {
    if (e.key.toLowerCase() === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {

        const localIsDebugModeEnabled = localStorage.getItem("DEBUG_MODE") === "true";

        if (localIsDebugModeEnabled) {
          window.showToast("You are already in debug mode!", "success");
        } else {
          localStorage.setItem("DEBUG_MODE", "true");
          window.showToast("You are now in debug mode!", "success");
        }
        showDebugElement();
        konamiIndex = 0;
      }
    } else {
      konamiIndex = 0;
    }
  });
}

function showDebugElement(){
  const elementToHidden = document.querySelectorAll("[data-debug-only]");

  elementToHidden.forEach(element => {
    element.removeAttribute("hidden");
  });
}

waitForKonamiCode();