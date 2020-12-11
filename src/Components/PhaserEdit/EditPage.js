import { RedirectUrl } from "../Router.js";
import { getUserSessionData } from "../../utils/Session.js";
import EditScene from "./EditScene.js";
import Phaser from "phaser";

let page = document.querySelector("#page");

let pageHtml = `
<div class="row pt-5 pr-2 jumbotron">
    <div class="col-11 text-center"><h1 id="mapTitle"></h1></div>
    <div class="col-1 pr-2">
        <button id="publish" class="btn btn-danger p-3">Publier</button>
    </div>
</div>
<div class="row mt-5 ml-5 mr-2">
    <div id="editScreen" class="col-10">
    </div>
    <div class="col-1"></div>
    <div class="col-1 pr-2 my-5">
        <div class="btn-group-vertical">
            <button id="btnSimple" type="button" class="btn btn-primary py-3 active">Simple</button>
            <button id="btnLong" type="button" class="btn btn-primary py-3">Longues</button>
        </div>
    </div>
</div>
<div class="row mt-5 ml-5 mr-2">
    <div class="col-10">
        <input id="timeLine" type="range" class="form-control-range" min="0" max="1" step="0.001" value="0"/>
    </div>
    <div class="col-1">
        <p><span id="currentTimer">00:00</span>/<span id="endTimer">00:45</span></p>
    </div>
    <div class="col-1">
        <button id="playBtn" class="btn btn-secondary">Play</button>
    </div>
</div>
<div class="row mt-5">
    <div class="col-3"></div>
    <div class="col-6">
        <div class="alert alert-danger mt-2 d-none" id="messageBoard"></div><span id="errorMessage"></span>
    </div>
</div>
<audio id="audio"/>
`;

let timeLine;
let playBtn;
let simpleBtn;
let longBtn;
let publishBtn;
let currentTimer;
let endTimer;
let title;
let audio;
let scene;
let refreshIntervalID;

let currentTime = 0; //ms
const refreshTime = 25; //ms between frames while playing

let difficulty;
let musicTitle;
let musicData;
let musicArtist;
let duration;

const possibleStates = {
    pause: 0,
    play: 1,
}
let state = possibleStates.pause;

const possibleNoteTypes = {
    simple: 0,
    long: 1,
}
let noteType = possibleNoteTypes.simple;


const EditPage = (data) => {
    if(!data){
        RedirectUrl("/addBeatmap");
        return;
    }
    let user = getUserSessionData();
    if(!user){
        RedirectUrl("/");
        return;
    }
    
    
    difficulty = data.difficulty;
    musicTitle = data.title;
    musicData = data.audioData;
    musicArtist = data.artist;
    duration = data.duration;

    page.innerHTML = pageHtml;

    timeLine = document.querySelector("#timeLine");
    currentTimer = document.querySelector("#currentTimer");
    endTimer = document.querySelector("#endTimer");
    playBtn = document.querySelector("#playBtn");
    simpleBtn = document.querySelector("#btnSimple");
    longBtn = document.querySelector("#btnLong");
    publishBtn = document.querySelector("#publish");
    title = document.querySelector("#mapTitle")
    title.innerText = data.title;
    audio = document.querySelector("#audio");
    audio.src = musicData;

    initTimer(); //sets timer (time display) to 0

    const editScreenWidth = 4/5 * window.innerWidth; 
    const editScreenHeight = 1/2 * window.innerHeight;
    

    scene = new EditScene(editScreenWidth, editScreenHeight, duration)

    let config = {
        type: Phaser.AUTO,
        width: editScreenWidth,
        height: editScreenHeight,
        backgroundColor: '#FFFFFF',
        scene: [scene],
        parent: "editScreen",
    }

    let game = new Phaser.Game(config);
    
    timeLine.addEventListener("change", onTimeChange);
    playBtn.addEventListener("click", togglePlay);
    simpleBtn.addEventListener("click", onClickSimpleNotesBtn);
    longBtn.addEventListener("click", onClickLongNotesBtn);

    
    publishBtn.addEventListener("click", () => {
        publish(scene, user)
    });
    

    return game;
}

const publish = (scene, user) => {
    console.log("publish");
    let noteList = scene.getBeatmap(); //TODO method EditScene
    let beatmap = {
        noteList: noteList,
        difficulty: difficulty,
        musicTitle: musicTitle,
        musicData: musicData,
        musicArtist: musicArtist,
        musicDuration: duration,
        bmCreator: user.username,
    }
    fetch("/api/beatmaps/",{
        method: "POST",
        body: JSON.stringify(beatmap),
        headers: {
            Authorization: user.token,
            "Content-Type": "application/json",
        },
    })
        .then((response) => {
            if (!response.ok) throw new Error("Error code : " + response.status + " : " + response.statusText);
            return response.json();
        })
        .then((data) => onBeatmapPublication(data))
        .catch((err) => onError(err));
}

//-- event handlers --

const onClickSimpleNotesBtn = () => {
    resestTypeBtns();
    console.log("simple");
    simpleBtn.className += " active";
    noteType = possibleNoteTypes.simple;
    scene.setNoteType(noteType);
}

const onClickLongNotesBtn = () => {
    resestTypeBtns();
    console.log("long");
    longBtn.className += " active";
    noteType = possibleNoteTypes.long;
    scene.setNoteType(noteType);
}

//change time with line
const onTimeChange = () => {
    currentTime = getTimeFromTimeline();
    console.log("update time to "+currentTime);
    setTimer(currentTime);
    scene.updateCurrentTime(currentTime);
}

const onError = (err) => {
    let messageBoard = document.querySelector("#messageBoard");
    let errorMessage = err.message;
    messageBoard.innerText = errorMessage;
    // show the messageBoard div (add relevant Bootstrap class)
    messageBoard.classList.add("d-block");  
};

const onBeatmapPublication = (data) => {
    console.log("Success: res = ", data);
    RedirectUrl("/");
}

// -- business methods --

const resestTypeBtns = () => {
    console.log("reset");
    let idleClass = "btn btn-primary py-3";
    simpleBtn.className = idleClass;
    longBtn.className = idleClass;
}

//returns current time in ms
const getTimeFromTimeline = () => {
    return duration * timeLine.value;
}

const setTimelineTo = (time) => {
    timeLine.value = time/duration;
    scene.updateCurrentTime(time);
    setTimer(time);
}

//converts time in ms to mm:ss format (returns string)
const convertMsToDisplay = (time) => {
    let allSeconds = Math.floor(time/1000);
    let seconds = allSeconds%60;
    let minutes = Math.floor(allSeconds/60);
    if(seconds < 10){
        seconds = "0"+seconds;
    }
    if(minutes < 10){
        minutes = "0"+minutes;
    }
    let res = minutes + ":" + seconds;
    return res;
}

//sets currentTimer
const setTimer = (time) => {
    currentTimer.innerText = convertMsToDisplay(time);
}

//sets timer to 0 and end time to duration
const initTimer = () => {
    currentTimer.innerText = convertMsToDisplay(0);
    endTimer.innerText = convertMsToDisplay(duration);
}

const play = () => {
    if(state === possibleStates.pause){
        displayPauseBtn();
        timeLine.disabled = true;
        audio.currentTime/*s*/= currentTime/*ms*/ / 1000 
        audio.play();
        refreshIntervalID = setInterval(incrementTime, refreshTime); 
        state = possibleStates.play;   
    }
}

const pause = () => {
    if(state === possibleStates.play){
        displayPlayBtn();
        timeLine.disabled = false;
        audio.pause();
        clearInterval(refreshIntervalID);
        state = possibleStates.pause;
    }
}

const displayPlayBtn = () => {
    playBtn.innerText = "Play";
}

const displayPauseBtn = () => {
    playBtn.innerText = "Pause";
}

const togglePlay = () => {
    switch(state){
        case possibleStates.pause:
            play();
            break;
        case possibleStates.play:
            pause();
    }
}

//increments timeline by [refreshTime] ms
const incrementTime = () => {
    currentTime += refreshTime;
    setTimelineTo(currentTime);
}

export default EditPage ;