import Phaser from "phaser";
import GameScene from "./GameScene.js";
import {getUserPreferences} from "../OptionsPage.js";


const hideExternalElements = () => {
  let navbar = document.querySelector("#navbar");
  let footer = document.querySelector("#footer");
  navbar.className += " d-none";
  footer.className += " d-none";
}

const PhaserGamePage = async () => {
  hideExternalElements();
  let phaserGame = `
  
  <div id="divAudio"></div>
  <div id="gameDiv" class="d-flex justify-content-center my-0">
    <!-- Modal -->
    <div class="modal fade" id="gameModal" data-backdrop="static">
      <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header"> </div>
            <div class="modal-body">
              <div id="contentGameModal"></div>
            </div>
            <div class="modal-footer"> </div>
          </div>
      </div>
    </div>
  <div>
  <div class="alert alert-danger mt-2 d-none" id="messageBoard"></div><span id="errorMessage"></span>`;

  let page = document.querySelector("#page");
  page.innerHTML = phaserGame;
  let divAudio = document.querySelector("#divAudio");
  /*
  let userPreferences = {
    keyBinding: {
      key1: "d",
      key2: "f",
      key3: "j",
      key4: "k",
    },
    volume: {
      master: 1,
      bgm: 0.20,
      effect: 1,
    }
  }*/

  let userPreferences = getUserPreferences();
  console.log(userPreferences);

  let config = {
    type: Phaser.AUTO,
    height: window.innerHeight,
    width: window.innerWidth,
    backgroundColor: '#eeeeee',
    scene: [GameScene],
    //  parent DOM element into which the canvas created by the renderer will be injected.
    parent: "gameDiv",
  };

  let beatmapID = 0;
  let ret = await fetch("/api/beatmaps/"+beatmapID)
  .then((response) => {
    if (!response.ok) throw new Error("Error code : " + response.status + " : " + response.statusText);
    return response.json();
  })
  .then((data) => {
    divAudio.innerHTML = `<audio id="audio" src="${data.musicData}"/>`;
    let audioElement = document.querySelector("#audio");
    let volumeBgm = userPreferences.volume.master * userPreferences.volume.bgm;
    audioElement.volume = volumeBgm;
    let scene = new GameScene(data.noteList, audioElement, userPreferences);
    
    let config = {
      type: Phaser.AUTO,
      height: window.innerHeight,
      width: window.innerWidth,
      backgroundColor: '#eeeeee',
      scene: [scene],
      parent: "gameDiv",
    };
    let game = new Phaser.Game(config);
    //game.noteList = data.noteList;
    //game.musicData = data.musicData;
    return game;
  })
  .catch((err) => onError(err));
  return ret;
};

const onError = (err) => {
  let messageBoard = document.querySelector("#messageBoard");
  let errorMessage = err.message;
  messageBoard.innerText = errorMessage;
  // show the messageBoard div (add relevant Bootstrap class)
  messageBoard.classList.add("d-block");  
};

export default PhaserGamePage;
