import whiteLogo from "../img/GitHero_logo_blanc.png";
import profile from "../img/image_profil.png";
import {getUserSessionData} from "./Session.js";


let navBar = document.querySelector("#navbar");

const Navbar = () => { 
    let navbarHtml;
    let user = getUserSessionData();
    if(user){ // connecté
        navbarHtml = `
            <nav class="navbar navbar-expand-sm bg-primary navbar-dark" id="navbar">
                <img id="whiteLogo" src="` + whiteLogo + `" alt="whiteLogo" href="#" data-uri="/">
                <ul class="navbar-nav">
                    <li class="nav-item"><button type="button" class="btn btn-danger active" href="#" data-uri="/list">Jouer</button></li>
                    <li class="nav-item"><button type="button" class="btn btn-secondary active" href="#" data-uri="/edit">Editer</button></li>
                    
                </ul>
                <ul class="navbar-nav ml-auto">
                    <li class="nav-item"><button type="button" class="btn btn-secondary active" href="#" data-uri="/logout">Déconnexion</button></li>
                    <li class="nav-item"><img id="profile" src="` + profile + `" alt="profil" href="#" data-uri="/login"/></li>
                </ul>
            </nav>`;
    } else { // pas connecté
        navbarHtml = `
            <nav class="navbar navbar-expand-sm bg-primary navbar-dark" id="navbar">
                <img id="whiteLogo" src="` + whiteLogo + `" alt="whiteLogo" href="#" data-uri="/">
                <ul class="navbar-nav mr-auto">
                    <li class="nav-item"><button type="button" class="btn btn-danger active" href="#" data-uri="/list">Jouer</button></li>
                </ul>
                <ul class="navbar-nav">
                    <li class="nav-item"><button type="button" class="btn btn-secondary active" href="#" data-uri="/login">Se connecter</button></li>
                    <li class="nav-item"><button type="button" class="btn btn-secondary active" href="#" data-uri="/register">S'inscrire</button></li>
                </ul>
            </nav>`;
    }
    navBar.innerHTML = navbarHtml;
};

export default Navbar;






