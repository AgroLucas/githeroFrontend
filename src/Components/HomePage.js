import logo from "../img/GitHero_logo.png";
import { RedirectUrl } from "./Router.js";
import { getUserSessionData } from "../utils/Session.js";

let pageHtml = `
<div class="row mx-0">
    <div class="col-4"></div>
    <div class="col-4 text-center mt-5">
        <img id="logo" class="mt-5 mb-3" src="`+ logo +`" alt="logo">
        <h1 id="titleHomePage" class="display-2 mb-5 text-center">GitHero</h1>
        <button type="button" class="btn btn-danger homepage_play_button mt-5" href="#" data-uri="/list">Jouer</button>
    </div>
</div>`;

let pageAuthHtml = `
<div class="row mx-0 text-center">
    <div class="col-4"></div>
    <div class="col-4 mt-5">
        <img id="logo" class="mt-5 mb-3" src="`+ logo +`" alt="logo">
        <h1 id="titleHomePage" class="display-2 mb-5">GitHero</h1>
        <div class="row">
            <div class="col-12"><button type="button" class="btn btn-danger homepage_play_button mt-5" href="#" data-uri="/list"><strong data-uri="/addBeatmap">Jouer</strong></button></div>
        </div><div class="row">
            <div class="col-12"><button type="button" class="btn btn-secondary homepage_edit_button" data-uri="/addBeatmap"><strong data-uri="/addBeatmap">Editer</strong></button></div>
        </div>
    </div>
</div>`;

let page = document.querySelector("#page");

const HomePage = () => {
    let htmlToDisplay;

    let user = getUserSessionData();
    if(!user) {
        htmlToDisplay = pageHtml;
    }else {
        htmlToDisplay = pageAuthHtml;
    }

    page.innerHTML = htmlToDisplay;
    page.querySelectorAll("button").forEach(button=>{
        button.addEventListener("click",(e)=>{
            RedirectUrl(e.target.dataset.uri);
        })
    })
}

export default HomePage;