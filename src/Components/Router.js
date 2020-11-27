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

const Router = () => {
    window.addEventListener("load", onLoadHandler);
    navbar.addEventListener("click", onNavigateHandler);
    window.addEventListener("popstate", onHistoryHandler);
}

//onLoadHandler
const onLoadHandler = (e) => {
    console.log("onLoad : ", window.location.pathname);
    componentToRender = routes[window.location.pathname];
    if(!componentToRender){
        ErrorPage(window.location.pathname)
        return;
    }
    componentToRender();
};

//onNavigateHandler
const onNavigateHandler = (e) => {
    let uri;
    if(e.target.id === "logo"){
        e.preventDefault();
        uri = "/";
    }else if(e.target.tagName === "A") {
        e.preventDefault();
        uri = e.target.dataset.uri;
    }
    if(uri) {
        console.log("onNavigate : ", uri);
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
    console.log("onHistory : ", window.location.pathname);
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

export { Router, RedirectUrl };