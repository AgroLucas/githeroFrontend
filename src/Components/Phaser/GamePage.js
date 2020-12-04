import Phaser from "phaser";
import GameScene from "./GameScene.js";
import { setLayout } from "../../utils/render.js";


const hideExternalElements = () => {
  let navbar = document.querySelector("#navbar");
  let footer = document.querySelector("#footer");
  navbar.className += " d-none";
  footer.className += " d-none";
}

const PhaserGamePage = () => {
  hideExternalElements();
  let phaserGame = `
  <div id="gameDiv" class="d-flex justify-content-center my-0">
    <!-- Modal -->
    <div class="modal fade" id="gameModal" data-backdrop="static">
      <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header"> </div>
            <div class="modal-body">
              <p id="contentGameModal">hello</p>
            </div>
            <div class="modal-footer"> </div>
          </div>
      </div>
    </div>
  <div>`;

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
  return new Phaser.Game(config);
};

export default PhaserGamePage;
