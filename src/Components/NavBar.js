import whiteLogo from "../img/GitHero_logo_blanc.png";
import {getUserSessionData} from "../utils/Session.js";


let navBar = document.querySelector("#navbar");

const Navbar = () => { 
    let navbarHtml;
    let user = getUserSessionData();
    if(user){ // connecté
        navbarHtml = `
            <nav class="navbar navbar-expand-sm navbar-dark" id="navbar">
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <img id="whiteLogo" src="` + whiteLogo + `" alt="whiteLogo" href="#" data-uri="/">
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav">
                        <li class="nav-item mt-2 mb-2"><button type="button" class="btn btn-danger active" href="#" data-uri="/list">Jouer</button></li>
                        <li class="nav-item mt-2 mb-2"><button type="button" class="btn btn-secondary active" href="#" data-uri="/edit">Editer</button></li>
                    </ul>
                    <ul class="navbar-nav ml-auto">
                        <li class="nav-item mt-2 mb-2"><button type="button" class="btn btn-secondary active" href="#" data-uri="/logout">Déconnexion</button></li>
                    </ul>
                </div>
            </nav>`;
    } else { // pas connecté
        navbarHtml = `
            <nav class="navbar navbar-expand-sm bg-primary navbar-dark" id="navbar">
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <img id="whiteLogo" src="` + whiteLogo + `" alt="whiteLogo" href="#" data-uri="/"/>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav mr-auto">
                        <li class="nav-item mt-2 mb-2"><button type="button" class="btn btn-danger active" href="#" data-uri="/list">Jouer</button></li>
                    </ul>
                    <ul class="navbar-nav">
                        <li class="nav-item mt-2 mb-2"><button type="button" class="btn btn-secondary active" href="#" data-uri="/login">Se connecter</button></li>
                        <li class="nav-item mt-2 mb-2"><button type="button" class="btn btn-secondary active" href="#" data-uri="/register">S'inscrire</button></li>
                    </ul>
                </div>
            </nav>`;
    }
    navBar.innerHTML = navbarHtml;
};

export default Navbar;






