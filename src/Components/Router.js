import GamePage from "./Phaser/GamePage.js";
import MusicListPage from "./MusicListPage.js";
import HomePage from "./HomePage.js";
import AboutUsPage from "./AboutUsPage.js";
import HelpPage from "./HelpPage.js";
import OptionsPage from "./OptionsPage.js";
import RankingPage from "./RankingPage.js";
import EditPage from "./EditPage.js";

import {stopMusic} from "./Phaser/GameScene.js";

const routes = {
    "/": HomePage,
    "/game": GamePage,
    "/list": MusicListPage,
    "/aboutus": AboutUsPage,
    "/help": HelpPage,
    "/ranking": RankingPage,
    "/options": OptionsPage,
    "/edit": EditPage,
};

let componentToRender;
let navbar = document.querySelector("#navbar");
let game;

const Router = () => {
    window.addEventListener("load", onLoadHandler);
    navbar.addEventListener("click", onNavigateHandler);
    window.addEventListener("popstate", onHistoryHandler);
}

//onLoadHandler
const onLoadHandler = (e) => {
    console.log("onLoad : ", window.location.pathname);
    if (window.location.pathname==="/game") {
        game = GamePage();
        return;
    }
    componentToRender = routes[window.location.pathname];
    if(!componentToRender){
        ErrorPage(window.location.pathname)
        return;
    }
    componentToRender();
};

//onNavigateHandler
const onNavigateHandler = (e) => {
    if (game){
        game.sound.stopAll();
        killGame();
    }
    let uri;
    e.preventDefault();
    uri = e.target.dataset.uri;
    if(uri) {
        console.log("onNavigate : ", uri);
        if (window.location.pathname==="/list")
            removeModals();
        if (uri==="/game") {
            window.history.pushState({}, uri, window.location.origin + uri);
            game = GamePage();
            return;
        }
        window.history.pushState({}, uri, window.location.origin + uri);
        componentToRender = routes[uri];
        if(!componentToRender) {
            ErrorPage(uri);
            return;
        }
        componentToRender();
       
    }
};

//onHistoryHandler (arrows <- -> )
const onHistoryHandler = (e) => {
    if (game){
        game.sound.stopAll();
        killGame();
    }
    console.log("onHistory : ", window.location.pathname);
    removeModals();
    if (window.location.pathname==="/game") {
        game = GamePage();
        return;
    }
    componentToRender = routes[window.location.pathname];
    if(!componentToRender){
        ErrorPage(window.location.pathname);
        return;
    }
    componentToRender();
};

const RedirectUrl = (uri, data) => {
    if (game){ //fonctionne pas
        game.sound.stopAll();
        killGame();
    }
    removeModals();
    window.history.pushState({}, uri, window.location.origin + uri);
    
    console.log(window.location.pathname);
    if (window.location.pathname==="/game") {
        game = GamePage();
        console.log(game);
        return;
    }
    componentToRender = routes[uri];
    
    if(!componentToRender){
        ErrorPage(uri);
        return;
    }
    if(!data){
        componentToRender();
    }else {
        componentToRender(data);
    }
};


const searchForPlayBtns = () => {
    let playBtnArray = document.querySelectorAll(".playBtn");
    for (let index = 0; index < playBtnArray.length; index++) {
        let playBtn = playBtnArray[index];
        playBtn.addEventListener("click", onNavigateHandler);
    }
}


const removeModals = () => {
    let modalArray = document.querySelectorAll(".modal-backdrop");
    for (let index = 0; index < modalArray.length; index++) {
        let m = modalArray[index];
        m.parentNode.removeChild(m);
    }
}

const killGame = () => {
    game.scene.scenes[0].stackTimeout.forEach(timeoutID => {
        clearTimeout(timeoutID);
    });
    game.scene.scenes[0].stackInterval.forEach(intervalID => {
        clearInterval(intervalID);
    });
    game = undefined;
    let navbar = document.querySelector("#navbar");
    navbar.className -= " d-none";
    let footer = document.querySelector("#footer");
    footer.className -= " d-none";
}

export { Router, RedirectUrl, searchForPlayBtns};