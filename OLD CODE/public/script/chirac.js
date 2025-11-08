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