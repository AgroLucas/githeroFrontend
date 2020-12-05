import {RedirectUrl} from "./Router.js";
let pageHtml = `
<div class="row">
    <div class="col-3"></div>
    <div class="col-6">
        <h2>Stub post beatmap</h2>
        <p>In this example, we use <code>.was-validated</code> to indicate what's missing before submitting the form:</p>
        <form action="/action_page.php">
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
                <select class="form-control" id="difficulty">
                    <option>Facile</option>
                    <option>Moyen</option>
                    <option>Difficile</option>
                </select>
            </div>
            <div class="form-group was-validated">
                <label for="musicFile">Musique:</label>
                <input id="musicFile" type="file" class="form-control-file border" name="musicFile" required>
                <div class="invalid-feedback">Ce champ est obligatoire.</div>
            </div>
            <button id="submit" type="submit" class="btn btn-primary">Editer</button>
            <div class="alert alert-danger mt-2 d-none" id="messageBoard"></div><span id="errorMessage"></span>
        </form>
        
    </div>
</div>`;

let page = document.querySelector("#page");
let formErrMsg = "Soumission invalide";


const AddMusicInfo = () => {
    page.innerHTML = pageHtml;
    let submitBtn = document.querySelector("#submit");
    submitBtn.addEventListener("click", onSubmitHandler)
}

const onSubmitHandler = (e) => {
    e.preventDefault();
    let username = "baptiste"; //TODO - stub -> get from session
    let musicTitle = document.querySelector("#musicTitle").value;
    let musicArtist = document.querySelector("#musicArtist").value;
    let difficulty = document.querySelector("#difficulty").value;
    let file = document.querySelector("#musicFile").files[0];
    if(!file){
        onError(formErrMsg);
        return;
    }
    
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () { //convert audio to base64
        let userRawInput = {
            difficulty: difficulty,
            title: musicTitle,
            file: file,
            audioData: reader.result,
            artist: musicArtist,
        }
    
        if(verifyInput(userRawInput)){ //verify input validity
            RedirectUrl("/edit", userRawInput);
        }else{
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
};

const verifyInput = (input) => {
    if(!input.title) return false;
    if(!input.artist) return false;
    console.log(input.file);
    return true;
}

export default AddMusicInfo;