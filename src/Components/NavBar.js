import logo from "../img/GitHero_logo_blanc.png";
import profile from "../img/image_profil.png";

let navBarHtml = `
<nav class="navbar navbar-expand-sm bg-primary navbar-dark" id="navbar">
    <img id="logo" src="${logo}" alt="logo" style="width:40px;">
    <ul class="navbar-nav">
        <li class="nav-item"><button type="button" class="btn btn-danger active"><a class="nav-link" href="#" data-uri="/list">Jouer</a></button>
        <li class="nav-item active"><button type="button" class="btn btn-secondary active"><a class="nav-link" href="#">Editer</a></button>
    </ul>
    <ul class="navbar-nav ml-auto">
        <li class="nav-item"><a class="navbar-brand" href="#"><img src="${profile}" alt="profil" style="width:40px;"></a></li>
    </ul>
</nav>`;

let navbar = document.querySelector("#navbar");

const NavBar = () => {
    console.log(navbar);
    navbar.innerHTML = navBarHtml;
}

export default NavBar;