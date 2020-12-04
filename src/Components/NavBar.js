"use strict"
import whiteLogo from "../img/GitHero_logo_blanc.png";
import profile from "../img/image_profil.png";


let navBar = document.querySelector("#navBar");

const Navbar = (userData) => { 
let navbar;
if(userData){ // connecté
    navbar = `
<nav class="navbar navbar-expand-sm bg-primary navbar-dark" id="navbar">
    <img id="whiteLogo" src="` + whiteLogo + `" alt="whiteLogo" href="#" data-uri="/">
    <ul class="navbar-nav">
        <li class="nav-item"><button type="button" class="btn btn-danger active" href="#" data-uri="/list">Jouer</button></li>
        <li class="nav-item"><button type="button" class="btn btn-secondary active" href="#" data-uri="/edit">Editer</button></li>
    </ul>
    <ul class="navbar-nav ml-auto">
        <li class="nav-item"><img id="profile" src="` + profile + `" alt="profil" href="#" data-uri="/login"/></li>
    </ul>
</nav>`;
} else { // pas connecté
    navbar = `
<nav class="navbar navbar-expand-sm bg-primary navbar-dark" id="navbar">
    <img id="whiteLogo" src="` + whiteLogo + `" alt="whiteLogo" href="#" data-uri="/">
    <ul class="navbar-nav">
        <li class="nav-item"><button type="button" class="btn btn-danger active" href="#" data-uri="/list">Jouer</button></li>
        
    </ul>
    <ul class="navbar-nav ml-auto">
        <li class="nav-item"><img id="profile" src="` + profile + `" alt="profil" href="#" data-uri="/login"/></li>
    </ul>
</nav>`;
}
Navbar.innerHTML = navbar;
};

export default { Navbar };






