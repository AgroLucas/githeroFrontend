import { RedirectUrl } from "../Router.js";
import { getUserSessionData } from "../../utils/Session.js";
import EditScene from "./EditScene.js";
import Phaser from "phaser";

let page = document.querySelector("#page");

let pageHtml = `
<div class="row mt-5 mr-2">
    <div class="col-11"></div>
    <div class="col-1 pr-2">
        <button class="btn btn-danger p-3">Publier</button>
    </div>
</div>
<div class="row mt-5 ml-5 mr-2">
    <div id="editScreen" class="col-10">
    </div>
    <div class="col-1"></div>
    <div class="col-1 pr-2 my-5">
        <div class="btn-group-vertical">
            <button type="button" class="btn btn-primary py-3 active">Simple</button>
            <button type="button" class="btn btn-primary py-3">Longues</button>
        </div>
    </div>
</div>
<div class="row mt-5 ml-5 mr-2">
    <div class="col-10">
        <input id="timeLine" type="range" class="form-control-range" min="0" max="1" step="0.001" value="0"/>
    </div>
    <div class="col-1">
        <button id="playBtn" class="btn btn-secondary">Play</button>
    </div>
    <div class="col-1">
        <p><span id="currentTimer">00:00</span>/<span id="endTimer">00:45</span></p>
    </div>
</div>
<div class="row mt-5">
    <div class="col-3"></div>
    <div class="col-6">
        <div class="alert alert-danger mt-2 d-none" id="messageBoard"></div><span id="errorMessage"></span>
    </div>
</div>
`;

let duration;
let timeLine;
let playBtn;
let currentTimer;
let endTimer;
let scene;
let refreshIntervalID;
let state = 0; //0 = pause; 1 = play
let currentTime = 0;

const refreshTime = 25; //ms

const EditPage = (data) => {
    /*
    if(!data){
        RedirectUrl("/addBeatmap");
        return;
    }
    let user = getUserSessionData();
    if(!user){
        RedirectUrl("/");
        return;
    }
    console.log(user);

    let beatmap = {
        noteList: ldd,
        difficulty: data.difficulty,
        musicTitle: data.title,
        musicData: data.audioData,
        musicArtist: data.artist,
        musicDuration: data.duration,
        bmCreator: user.username "Baptiste",
    }
    */

    duration = 45000; //STUB (get from data)

    page.innerHTML = pageHtml;

    timeLine = document.querySelector("#timeLine");
    currentTimer = document.querySelector("#currentTimer");
    endTimer = document.querySelector("#endTimer");
    playBtn = document.querySelector("#playBtn");

    initTimer();

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

    /*
    let btn = document.querySelector("#publish");
    btn.addEventListener("click", () => {publish(beatmap, user)});
    */

    return game;
}

const publish = (beatmap, user) => {
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


const onBeatmapPublication = (data) => {
    console.log("Success: res = ", data);
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
    if(state === 0){
        displayPauseBtn();
        timeLine.disabled = true;
        refreshIntervalID = setInterval(incrementTime, refreshTime); 
        state = 1;   
    }
}

const pause = () => {
    if(state === 1){
        displayPlayBtn();
        timeLine.disabled = false;
        clearInterval(refreshIntervalID);
        state = 0;
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
        case 0:
            play();
            break;
        case 1:
            pause();
    }
}

//increments timeline by [refreshTime] ms
const incrementTime = () => {
    console.log("time++");
    currentTime += refreshTime;
    setTimelineTo(currentTime);
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

export default EditPage;