import GamePage from "./Phaser/GamePage.js";
import MusicListPage from "./MusicListPage.js";
import HomePage from "./HomePage.js";

const routes = {
    "/": HomePage,
    "/game": GamePage,
    "/list": MusicListPage,
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
    if (game)
        killGame();
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
    if (game)
        killGame();
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
    window.history.pushState({}, uri, window.location.origin + uri);
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
}

export { Router, RedirectUrl, searchForPlayBtns};