import {RedirectUrl} from "./Router.js";
import { getUserSessionData } from "../utils/Session.js";
import {escapeHtml, detectMob} from "../utils/Utils.js"

let pageHtml = `
<div class="row mx-0">
    <div class="col-md-1 col-lg-3"></div>
    <div class="col-12 col-md-10 col-lg-6">
        <header class="mt-4">
            <h1>Création de Beatmap</h1>
            <p>Entrez les informations sur la beatmap que vous voulez créer</p>
        </header>
        <form action="#" class="border border-dark px-5 py-3 mt-5">
            <div class="form-group was-validated">
                <label for="musicTitle">Titre de la musique:</label>
                <input type="text" class="form-control" id="musicTitle" placeholder="Titre" name="musicTitle" required>
                <div class="invalid-feedback">Ce champ est obligatoire.</div>
            </div>
            <div class="form-group was-validated">
                <label for="musicArtist">Artiste:</label>
                <input type="text" class="form-control" id="musicArtist" placeholder="Artiste" name="musicArtist" required>
                <div class="invalid-feedback">Ce champ est obligatoire.</div>
            </div>
            <div class="form-group">
                <label for="difficulty">Difficulté:</label>
                <select class="form-control w-25" id="difficulty">
                    <option>Facile</option>
                    <option>Moyen</option>
                    <option>Difficile</option>
                </select>
            </div>
            <div class="form-group was-validated">
                <label for="musicFile">Musique:</label>
                <input id="musicFile" type="file" class="form-control-file border border-dark" name="musicFile" required>
                <div class="invalid-feedback">Ce champ est obligatoire.</div>
            </div>
            <button id="submit" type="submit" class="btn btn-primary">Editer</button>
            <div class="alert alert-danger mt-2 d-none" id="messageBoard"></div><span id="errorMessage"></span>
        </form>
        <div id="audioDiv"></div>
    </div>
</div>`;

let page = document.querySelector("#page");
let formErrMsg = "Informations incomplètes";

const validMimeTypes = ["audio/mpeg", "audio/wav"];
const maxFileSize = 15000000; //15mb

const AddMusicInfo = () => {
    let user = getUserSessionData();
    if(!user || detectMob()){
        RedirectUrl("/");
        return;
    }
    page.innerHTML = pageHtml;
    let submitBtn = document.querySelector("#submit");
    submitBtn.addEventListener("click", onSubmitHandler)
}

const onSubmitHandler = (e) => {
    e.preventDefault();
    let musicTitle = escapeHtml("" + document.querySelector("#musicTitle").value);
    let musicArtist = escapeHtml("" + document.querySelector("#musicArtist").value);
    let difficulty = document.querySelector("#difficulty").value;
    let file = document.querySelector("#musicFile").files[0];
    if(!file){
        onError(formErrMsg);
        return;
    }
    
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () { //convert audio to base64
        
        let audioData = reader.result;

        //get duration from audioData
        let audioDiv = document.querySelector("#audioDiv");
        audioDiv.innerHTML = `<audio id="audio" src="`+audioData+`"/>`
        let audioElement = document.querySelector("#audio");
        
        let inputToVerify = {
            title: musicTitle,
            artist: musicArtist,
            file: file,
        }

        if(verifyInput(inputToVerify)){
            audioElement.onloadedmetadata = function() { //wait for the metadata to be loaded
                let duration = Math.floor(1000*audioElement.duration); //convert in ms
                let data = {
                    difficulty: difficulty,
                    title: musicTitle,
                    audioData: audioData,
                    artist: musicArtist,
                    duration: duration,
                }
                
                RedirectUrl("/edit", data);
            };
        }else {
            onError(formErrMsg);
        }
    }
    reader.onerror = (err) => onError(err.message);
}

const onError = (text) => {
    let messageBoard = document.querySelector("#messageBoard");
    let errorMessage = text;
    messageBoard.innerText = errorMessage;
    // show the messageBoard div (add relevant Bootstrap class)
    messageBoard.classList.add("d-block");  

    formErrMsg = "Informations incomplètes"; //reset formErrMsg for further submits
};

const verifyInput = (input) => {
    if(!verifyNoMissingInput(input)) return false;
    if(!verifyFileInput(input.file)) return false;
    return true;
}

const verifyNoMissingInput = (input) => {
    if(!input.title) return false;
    if(!input.artist) return false;
    if(!input.file) return false;
    return true;
}

const verifyFileInput = (file) => {
    if(!isValidType(file.type)) {
        formErrMsg = "Type de fichier non supporté";
        return false;
    }
    if(file.size > maxFileSize) {
        formErrMsg = "Fichier trop volumineux";
        return false;
    }
    return true;
}

const isValidType = (type) => {
    for(let i=0; i<validMimeTypes.length; i++) {
        if(type == validMimeTypes[i]) return true;
    }
    return false;
}

export default AddMusicInfo;