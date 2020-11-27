import Phaser, { Game, Math, Time } from 'phaser';
import simple_note from "../../img/game_assets/star.png";

// array of [noteType, lineNumber, timeStart (, timeEnd if longNote)]
//timeStart must be > noteTravelTime
var beatmap = [[0,0,3000], [0,1,5000], [0,3,5000], [0,0,7000]];

export default class GameScene extends Phaser.Scene {
    
	constructor() {
        super('game-scene');
        this.width = 1600; //hardcoded -> TODO to find in properties ?
        this.height = 900; //hardcoded -> TODO to find in properties ?
        this.noteTravelTime = 3000;
        this.btnSideLen=60;
        this.btnSideLenActive = 120;
        this.topSpacing = 50;
        this.bottomSpacing = 150;
        this.leway = 150; //delay in ms
        this.isStarted = true;

        /**** TODO need to be given ****/
        this.songDuration = 8000;
        this.KEY1 = "d";
        this.KEY2 = "f";
        this.KEY3 = "j";
        this.KEY4 = "k";
        this.arraysTimestamps = [];
        for (let i = 0; i < 4; i++) {
            this.arraysTimestamps[i] = [];
        }

        beatmap.forEach(element => {
            this.arraysTimestamps[element[1]].push(element[2]);
        });

        //FIFO queue containing timestamps to be valitated
        this.queuesTimestampToValidate = [];
        for (let i = 0; i < 4; i++) {
            this.queuesTimestampToValidate[i] = [];
        }

        this.nbrTimestamp = this.arraysTimestamps[0].length + this.arraysTimestamps[1].length + this.arraysTimestamps[2].length + this.arraysTimestamps[3].length;
        this.score = 0;
        this.combo = 0;
        this.nbrMissclicks = 0;
	}

	preload() {
        this.load.image("simple_note", simple_note);
	}

	create() {
        this.graphics = this.add.graphics();
        this.createLines();
        this.createSquareBtns();
        this.drawAll();
        this.scoreDisplay = this.add.text(100, 100, "Score: 0", { font: '48px Arial', fill: '#000000' });
        this.comboDisplay = this.add.text(this.width-200, 100, "X0", { font: '48px Arial', fill: '#000000' });

        this.createNoteEvents(this.noteTravelTime, this.createNote, this);

        setTimeout(this.endGame, this.songDuration, this);
        document.addEventListener("keypress", event => this.onKeypress(event));
        document.addEventListener("keyup", event => this.onKeyup(event));
    }

    createNoteEvents(travelTime, createNote, instance) {
        for (let n = 0; n < beatmap.length; n++) {
            if (beatmap[n][0] == 0) { //simple notes
                let i = beatmap[n][1];
                let delay = beatmap[n][2] - travelTime;
                setTimeout(createNote, delay, i, instance, beatmap[n][2]);

            }
        }
    }

    createNote(i, instance, time) {
        var follower = instance.add.follower(instance.lines[i], 0, 0, "simple_note");

        setTimeout(function(){
            instance.queuesTimestampToValidate[i].push(follower);
            console.log("push");
        },instance.noteTravelTime-instance.leway);

        follower.startFollow({
            positionOnPath: true,
            duration: instance.noteTravelTime,
            yoyo: false,
            ease: "Sine.easeIn",
            repeat: 0,
            rotateToPath: false,
            verticalAdjust: true,
            onComplete: () => {
                follower.destroy();
                instance.onNoKeypress(instance.queuesTimestampToValidate[i], i, time);
            },
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

    update() {
        this.graphics.clear();
        this.drawAll();
    }

    updateScore(scoreAdded) {
        this.score += scoreAdded * this.combo;
        this.scoreDisplay.setText("Score: " + this.score);
    }

    incrementCombo() {
        this.combo++;
        this.comboDisplay.setText("X" +this.combo);
    }

    resetCombo(){
        this.combo = 0;
        this.comboDisplay.setText("X" +this.combo);
    }

    setBtnBig(i) {
        this.squareBtns[i].setSize(this.btnSideLenActive, this.btnSideLenActive);
    }

    setBtnNormal(i) {
        this.squareBtns[i].setSize(this.btnSideLen, this.btnSideLen);
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

    //algorithm methods

    onNoKeypress (queueToShift, lineNbr, time) {
        if (queueToShift.length!==0) {
            this.resetCombo();
            queueToShift.shift();
            console.log("FAILED :: line " + lineNbr + " at " + time + " ms");
        }
    }
    
    onKeypressTooEarly () { //suggested to remove ??? 
        console.log("WRONGGG");
        this.nbrMissclicks++;
    }
    
    onKeypressRightTime (queueToShift) {
        //clearTimeout(queueToShift.shift());
        let follower = queueToShift.shift()
        follower.destroy();
        console.log("Well Done");
        this.incrementCombo();
        this.updateScore(100);
    }

    onKeypress (e) {
        //check if we clicked at the right time
        if (this.isStarted) {
            let queueToShift;
            switch(e.key) {
                case this.KEY1:
                    this.setBtnBig(0);
                    queueToShift = this.queuesTimestampToValidate[0];
                    break;
                case this.KEY2:
                    this.setBtnBig(1);
                    queueToShift = this.queuesTimestampToValidate[1];
                    break;
                case this.KEY3:
                    this.setBtnBig(2);
                    queueToShift = this.queuesTimestampToValidate[2];
                    break;
                case this.KEY4:
                    this.setBtnBig(3);
                    queueToShift = this.queuesTimestampToValidate[3];
                    break;
            }
            if (typeof queueToShift!=="undefined") {
                if (queueToShift.length!==0)
                    this.onKeypressRightTime(queueToShift);
                else
                    this.onKeypressTooEarly();
            }
        }
    };

    onKeyup (e) {
        switch(e.key){
            case this.KEY1:
                this.setBtnNormal(0);
                break;
            case this.KEY2:
                this.setBtnNormal(1);
                break;
            case this.KEY3:
                this.setBtnNormal(2);
                break;
            case this.KEY4:
                this.setBtnNormal(3);
                break;          
        }
    }

    endGame (instance) {
        instance.isStarted = false;
        console.log("Your score is: " + instance.nbrTimestampSucceded + "/" + instance.nbrTimestamp);
        console.log("You misclicked " + instance.nbrMissclicks + " times");
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

