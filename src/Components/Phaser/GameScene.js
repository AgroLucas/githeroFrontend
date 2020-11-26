import Phaser, { Game, Math, Time } from 'phaser';
import simple_note from "../../img/game_assets/star.png";

// array of [noteType, lineNumber, timeStart (, timeEnd if longNote)]
var beatmap = [[0,0,3000], [0,0,4000], [0,2,4000], [0,3,5000]];

export default class GameScene extends Phaser.Scene
{
    
	constructor()
	{
        super('game-scene');
        this.width = 1600; //hardcoded -> TODO to find in properties ?
        this.height = 900; //hardcoded -> TODO to find in properties ?
        this.noteTravelTime = 3000;
        this.btnSideLen=60;
        this.topSpacing = 50;
        this.bottomSpacing = 150;
	}

	preload()
	{
        this.load.image("simple_note", simple_note);
	}

	create()
	{
        this.graphics = this.add.graphics();
        this.createLines();
        this.createSquareBtns();
        this.drawAll();
        this.createNoteEvents(this.noteTravelTime, this.createNote, this);
    }

    createNoteEvents(travelTime, createNote, instance) {
        for (let n = 0; n < beatmap.length; n++) {
            if (beatmap[n][0] == 0) { //simple notes
                let i = beatmap[n][1];
                let delay = beatmap[n][2] - travelTime;
                setTimeout(function () { createNote(i, instance); }, delay);
            }
        }
    }

    createNote(i, instance) {
        var follower = instance.add.follower(instance.lines[i], 0, 0, "simple_note");

        follower.startFollow({
            positionOnPath: true,
            duration: instance.noteTravelTime,
            yoyo: false,
            ease: "Sine.easeIn",
            repeat: 0,
            rotateToPath: false,
            verticalAdjust: true,
            onComplete: () => follower.destroy(),
        });
    }
    
    createSquareBtns() {
        let y = this.height - this.btnSideLen;
        this.squareBtns = [];
        for (let i = 0; i < 4; i++) {
            let x = calcLineX(i, this.bottomSpacing, this.width) - this.btnSideLen / 2;
            this.squareBtns[i] = new Phaser.Geom.Rectangle(x, y, this.btnSideLen, this.btnSideLen);
        }
    }

    createLines() {
        this.lines = [];
        for (let i = 0; i < 4; i++) {
            this.lines[i] = this.add.path(calcLineX(i, this.topSpacing, this.width), 0);
            this.lines[i].lineTo(calcLineX(i, this.bottomSpacing, this.width), this.height+20);
        }
    }

    update()
    {
    }

    drawAll() {
        this.drawLines();
        this.drawBtns();
    }


    drawBtns() {
        this.graphics.fillStyle(0xff0000);
        for (let i = 0; i < 4; i++) {
            this.graphics.fillRectShape(this.squareBtns[i]);
        }
    }

    drawLines() {
        this.graphics.lineStyle(2, 0x000000);
        for (let i = 0; i < 4; i++) {
            this.lines[i].draw(this.graphics);
        }
    }
}

//business methods

/**
 * Returns the x coordonate of the line to draw
 * @param i : the number of the line (from left to right )
 * @param deltaX : the distance between 2 lines
 * @param sceneWidth : width of the scene 
 */
const calcLineX = (i, deltaX, sceneWidth) => {
    let center = sceneWidth/2;
    let coeficients = [-1.5, -0.5, 0.5, 1.5];
    return center + coeficients[i]*deltaX;
}
