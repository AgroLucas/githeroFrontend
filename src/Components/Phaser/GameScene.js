import Phaser, { Math } from 'phaser';
import simple_note from "../../img/game_assets/star.png";

// array of [noteType, lineNumber, timeStart (, timeEnd if longNote)]
var map = [[0,0,1000], [0,0,3000], [0,2,3000]];

export default class GameScene extends Phaser.Scene
{
    
	constructor()
	{
        super('game-scene');
        this.width = 1600; //hardcoded -> TODO to find in properties ?
        this.height = 900; //hardcoded -> TODO to find in properties ?
        this.noteTravelTime = 3000;
        this.btnSideLen=60;
	}

	preload()
	{
        this.load.image("simple_note", simple_note);
	}

	create()
	{
        this.graphics = this.add.graphics();

        this.createLines(this.width, this.height);

        
        this.createSquareBtns(this.height, this.width);

        let i=1
        this.createNote(i);

        this.drawAll();
    }

    createNote(i) {
        var follower = this.add.follower(this.lines[i], 0, 0, "simple_note");

        follower.startFollow({
            positionOnPath: true,
            duration: this.noteTravelTime,
            yoyo: true,
            repeat: -1,
            rotateToPath: true,
            verticalAdjust: true
        });
    }
    
    createSquareBtns(height, width) {
        let y = height - this.btnSideLen;
        this.squareBtns = [];
        for (let i = 0; i < 4; i++) {
            let x = calcLineX(i, 150, width) - this.btnSideLen / 2;
            this.squareBtns[i] = new Phaser.Geom.Rectangle(x, y, this.btnSideLen, this.btnSideLen);
        }
    }

    createLines(width, height) {
        this.lines = [];
        for (let i = 0; i < 4; i++) {
            this.lines[i] = this.add.path(calcLineX(i, 50, width), 0);
            this.lines[i].lineTo(calcLineX(i, 150, width), height);
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

/**
 * returns the x coordonate of the line to draw
 * @param i the number of the line (from left to right )
 * @param deltaX the distance between 2 lines
 * @param sceneWidth width of the scene 
 */
const calcLineX = (i, deltaX, sceneWidth) => {
    let center = sceneWidth/2;
    let coeficients = [-1.5, -0.5, 0.5, 1.5];
    return center + coeficients[i]*deltaX;
}

const calcNoteXFromY = (startX, endX, screenHeight, y) => {
    let maxDisplacement = endX - startX;
    return maxDisplacement * (y/screenHeight);
}