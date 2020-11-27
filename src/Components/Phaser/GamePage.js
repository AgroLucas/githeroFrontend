import Phaser from "phaser";
import GameScene from "./GameScene.js";
import { setLayout } from "../../utils/render.js";

var game;

const hideExternalElements = () => {
  let header = document.querySelector("#header");
  header.className += " d-none";
}

const PhaserGamePage = () => {
  hideExternalElements();
  let phaserGame = `
<div id="gameDiv" class="d-flex justify-content-center my-0">
</div>`;

  let page = document.querySelector("#page");
  page.innerHTML = phaserGame;

  let config = {
    type: Phaser.AUTO,
    height: window.innerHeight,
    width: window.innerWidth,
    backgroundColor: '#eeeeee',
    /*
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 300 },
        fps: 30,
        debug: false,
      },
    },
    */
    scene: [GameScene],
    //  parent DOM element into which the canvas created by the renderer will be injected.
    parent: "gameDiv",
  };

  // there could be issues when a game was quit (events no longer working)
  // therefore destroy any started game prior to recreate it
  if(game)
    game.destroy(true);
  game = new Phaser.Game(config);
};

export default PhaserGamePage;
