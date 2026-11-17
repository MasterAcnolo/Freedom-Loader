function waitForKonamiCode(){

  const konamiCode = [
    'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
    'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
    'b','a'
  ];

  let konamiIndex = 0;

  const isDebugModeEnabled = localStorage.getItem("DEBUG_MODE") ?? false;

  if (isDebugModeEnabled) {
    showDebugElement();

  } else {
    
    window.addEventListener('keydown', function(e){
      if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          localStorage.setItem('DEBUG_MODE', true);
          window.showToast("You are now in debug mode!", "success")
          showDebugElement();
        }
      } else {
        konamiIndex = 0;
      }
    });
  }
}

function showDebugElement(){
  const elementToHidden = document.querySelectorAll("[data-debug-only]");

  elementToHidden.forEach(element => {
    element.removeAttribute("hidden");
  })
}

waitForKonamiCode();