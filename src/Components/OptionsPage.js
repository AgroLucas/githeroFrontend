import {RedirectUrl} from "./Router.js";
import {detectMob} from "../utils/Utils.js"

let pageHtml = `
<div class="row mt-3 mx-0">
    <div class="col-md-3"></div>
    <div class="col-md-6">
        <h1>Options</h1>
        <form action="#" class="mb-5">
            <div class="border border-dark mt-5 pl-3 py-2">
                <h4>Volumes:</h4>
                <div class="form-group col-sm-12 col-md-8 col-lg-4">
                    <label for="masterVolume">Principal:</label>
                    <input type="range" id="masterVolume" name="masterVolume" class="form-control-range" min="0" max="1" step="0.05">
                </div>
                <div class="form-group col-sm-12 col-md-8 col-lg-4">
                    <label for="bgmVolume">Musique:</label>
                    <input type="range" id="bgmVolume" name="bgmVolume" class="form-control-range" min="0" max="1" step="0.05">
                </div>
                <div class="form-group col-sm-12 col-md-8 col-lg-4">
                    <label for="effectVolume">Effets sonores:</label>
                    <input type="range" id="effectVolume" name="effectVolume" class="form-control-range" min="0" max="1" step="0.05">
                </div>
            </div>`
            if (!detectMob()) {
                pageHtml+= `
            <div class="border border-dark mt-5 pl-3 pt-3 pb-5 mb-3">
                <h4>Configuration des touches:</h4>
                <div class="row mt-3 mx-0">
                    <div class="col-sm-2 pt-1">Bouton 1:</div>
                    <div class="col-sm-8"></div>
                    <div class="col-sm-1">
                        <button id="btnKey1" type="button" class="btn btn-outline-primary keyBindingBtn" data-toggle="popover" data-content="Appuiez sur une touche" data-trigger="focus"></button>
                    </div>
                </div>
                <div class="row mt-3 mx-0">
                    <div class="col-sm-2 pt-1">Bouton 2:</div>
                    <div class="col-sm-8"></div>
                    <div class="col-sm-1">
                        <button id="btnKey2" type="button" class="btn btn-outline-primary keyBindingBtn" data-toggle="popover" data-content="Appuiez sur une touche" data-trigger="focus"></button>
                    </div>
                </div>
                <div class="row mt-3 mx-0">
                    <div class="col-sm-2 pt-1">Bouton 3:</div>
                    <div class="col-sm-8"></div>
                    <div class="col-sm-1">
                        <button id="btnKey3" type="button" class="btn btn-outline-primary keyBindingBtn" data-toggle="popover" data-content="Appuiez sur une touche" data-trigger="focus"></button>
                    </div>
                </div>
                <div class="row my-3 mx-0">
                    <div class="col-sm-2 pt-1">Bouton 4:</div>
                    <div class="col-sm-8"></div>
                    <div class="col-sm-1">
                        <button id="btnKey4" type="button" class="btn btn-outline-primary keyBindingBtn" data-toggle="popover" data-content="Appuiez sur une touche" data-trigger="focus"></button>
                    </div>
                </div>
            </div>`
            }
            pageHtml+=`
            <button id="defaultBtn" class="mt-3 btn btn-secondary">Défaut</button>
        </form>
    </div>
</div>`;

let page = document.querySelector("#page");

let btnKey1;
let btnKey2;
let btnKey3;
let btnKey4;

let rangeEffect;
let rangeMaster;
let rangeBgm;

let currentPreferences;

const defaultPreferences = {
    keyBinding: {
        1: "d",
        2: "f",
        3: "j",
        4: "k",
      },
      volume: {
        master: 0.5,
        bgm: 0.5,
        effect: 0.5,
      }
}

const OptionsPage = () => {
    page.innerHTML = pageHtml;

    currentPreferences = getUserPreferences(); //previously stored prefs. or default
    console.log(currentPreferences);

    btnKey1 = document.querySelector("#btnKey1");
    btnKey2 = document.querySelector("#btnKey2");
    btnKey3 = document.querySelector("#btnKey3");
    btnKey4 = document.querySelector("#btnKey4");

    rangeMaster = document.querySelector("#masterVolume");
    rangeBgm = document.querySelector("#bgmVolume");
    rangeEffect = document.querySelector("#effectVolume");

    //bootstrap JQuery for popovers
    $(document).ready(function(){
        $('[data-toggle="popover"]').popover();
    });

    let defaultBtn = document.querySelector("#defaultBtn");
    defaultBtn.addEventListener("click", restoreDefault);

    rangeMaster.addEventListener("change", onVolumeChange);
    rangeEffect.addEventListener("change", onVolumeChange);
    rangeBgm.addEventListener("change", onVolumeChange);

    refreshFormInfo();
    if (!detectMob())
        addKeyBindingBtnListeners();
}

const restoreDefault = (e) => {
    e.preventDefault();
    currentPreferences.volume.master = defaultPreferences.volume.master;
    currentPreferences.volume.bgm = defaultPreferences.volume.bgm;
    currentPreferences.volume.effect = defaultPreferences.volume.effect;

    for(let i=1; i<=4; i++){
        currentPreferences.keyBinding[i] = defaultPreferences.keyBinding[i];
    }
    refreshFormInfo();
    setUserPreferences();
}

// --- KEY BINDING ---

const onVolumeChange = () => {
    currentPreferences.volume.master = rangeMaster.value;
    currentPreferences.volume.bgm = rangeBgm.value;
    currentPreferences.volume.effect = rangeEffect.value;
    setUserPreferences();
}

const refreshFormInfo = () => {
    if (!detectMob()) {
        btnKey1.innerText = currentPreferences.keyBinding[1].toUpperCase();
        btnKey2.innerText = currentPreferences.keyBinding[2].toUpperCase();
        btnKey3.innerText = currentPreferences.keyBinding[3].toUpperCase();
        btnKey4.innerText = currentPreferences.keyBinding[4].toUpperCase();
    }
    rangeMaster.value = currentPreferences.volume.master;
    rangeBgm.value = currentPreferences.volume.bgm;
    rangeEffect.value = currentPreferences.volume.effect;
}

const addKeyBindingBtnListeners = () => {
    console.log("add BTN EE");
    btnKey1.addEventListener("click", onKeyBindingBtn1);
    btnKey2.addEventListener("click", onKeyBindingBtn2);
    btnKey3.addEventListener("click", onKeyBindingBtn3);
    btnKey4.addEventListener("click", onKeyBindingBtn4);
}

const removeBtnListeners = () => {
    console.log("remove BTN EE");
    btnKey1.removeEventListener("click", onKeyBindingBtn1);
    btnKey2.removeEventListener("click", onKeyBindingBtn2);
    btnKey3.removeEventListener("click", onKeyBindingBtn3);
    btnKey4.removeEventListener("click", onKeyBindingBtn4);
}

//remove key binding related EventListeners
const removeKeyBindingListeners = () => {
    console.log("remove KB EE");
    window.removeEventListener("keypress", onKey1Binding);
    window.removeEventListener("keypress", onKey2Binding);
    window.removeEventListener("keypress", onKey3Binding);
    window.removeEventListener("keypress", onKey4Binding);
}

const onKeyBindingBtn1 = () => {
    onKeyBindingBtn(1);
}

const onKeyBindingBtn2 = () => {
    onKeyBindingBtn(2);
}

const onKeyBindingBtn3 = () => {
    onKeyBindingBtn(3);
}

const onKeyBindingBtn4 = () => {
    onKeyBindingBtn(4);
}

const onKeyBindingBtn = (num) => {
    removeBtnListeners();
    console.log("add CLICK EE");
    setTimeout(() => window.addEventListener("click", onClickOutside),100);
    console.log("add KB EE");
    switch(num){
        case 1:
            window.addEventListener("keypress", onKey1Binding);
            break;
        case 2:
            window.addEventListener("keypress", onKey2Binding);
            break;
        case 3:
            window.addEventListener("keypress", onKey3Binding);
            break;
        case 4:
            window.addEventListener("keypress", onKey4Binding);
    }
    
}

//cancels key binding
const onClickOutside = () => {
    removeKeyBindingListeners();
    console.log("remove CLICK EE");
    window.removeEventListener("click", onClickOutside);
    if (!detectMob())
        addKeyBindingBtnListeners();
}

const onKey1Binding = (e) => {
    onKeyBinding(e, 1);
}

const onKey2Binding = (e) => {
    onKeyBinding(e, 2);
}

const onKey3Binding = (e) => {
    onKeyBinding(e, 3);
}

const onKey4Binding = (e) => {
    onKeyBinding(e, 4);
}

const onKeyBinding = (e, num) => {
    let keyValue = e.key;
    let other = isUsedByOther(num, keyValue);
    if(other === -1){
        currentPreferences.keyBinding[num] = keyValue;
    }else{
        keySwap(num, other);
    }
    setUserPreferences();
    refreshFormInfo();
}

const isUsedByOther = (keyNum, keyValue) => {
    for(let i=1; i<=4; i++){
        if(i != keyNum && currentPreferences.keyBinding[i] === keyValue){
            return i;
        }
    }
    return -1;
}

const keySwap = (keyNum1, keyNum2) => {
    if(keyNum1 !== keyNum2){
        let temp = currentPreferences.keyBinding[keyNum1];
        currentPreferences.keyBinding[keyNum1] = currentPreferences.keyBinding[keyNum2];
        currentPreferences.keyBinding[keyNum2] = temp;
    }
}

// --- localStorage prefs. ---
const STORAGE_NAME = "user preferences";

const getUserPreferences = () => {
    let prefs = localStorage.getItem(STORAGE_NAME);
    if(prefs)
        return JSON.parse(prefs);
    return defaultPreferences;
}

const setUserPreferences = () => {
    let prefs = JSON.stringify(currentPreferences);
    localStorage.setItem(STORAGE_NAME, prefs);
}

export { OptionsPage, getUserPreferences };