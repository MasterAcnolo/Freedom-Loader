function Chirac(){
    const title = document.getElementById("title");
    title.innerHTML = "Chirac Loader";

    const subtitle = document.getElementById("subtitle");
    subtitle.innerHTML = "J'aime les pommes";
    subtitle.style.color= "black";

    document.body.style.backgroundImage = "url('assets/images/goat2.webp')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";
    
    console.log("Je serai le président de tous les français");

}