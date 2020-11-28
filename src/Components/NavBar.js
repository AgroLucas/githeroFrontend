import logo from "../img/GitHero_logo_blanc.png";
import profile from "../img/image_profil.png";

let navBarHtml = `
<nav class="navbar navbar-expand-sm bg-primary navbar-dark" id="navbar">
    <img id="logo" src="` + logo + `" alt="logo" href="#" data-uri="/">
    <ul class="navbar-nav">
        <li class="nav-item"><button type="button" class="btn btn-danger active" href="#" data-uri="/list">Jouer</button></li>
        <li class="nav-item"><button type="button" class="btn btn-secondary active" href="#" data-uri="/">Editer</button></li>
    </ul>
    <ul class="navbar-nav ml-auto">
        <li class="nav-item"><img id="profile" src="` + profile + `" alt="profil" href="#" data-uri="/"/></li>
    </ul>
</nav>`;

let navbar = document.querySelector("#navbar");

const NavBar = () => {
    console.log(navbar);
    navbar.innerHTML = navBarHtml;
}

export default NavBar;