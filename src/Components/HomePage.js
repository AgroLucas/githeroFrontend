import logo from "../img/GitHero_logo.png";
import { RedirectUrl } from "./Router.js";

let pageHtml = `
<div class="text-center">
    <img id="logo" class="mt-3" src="`+ logo +`" alt="logo">
    <h1>Bienvenue sur GitHero</h1>
    <button type="button" class="btn btn-danger homepage_play_button" href="#" data-uri="/list">Jouer</button></br>
    
</div>`;

let page = document.querySelector("#page");

const HomePage = () => {
    page.innerHTML = pageHtml;
    page.querySelectorAll("button").forEach(button=>{
        button.addEventListener("click",(e)=>{
            RedirectUrl(e.target.dataset.uri);
        })
    })
}

export default HomePage;