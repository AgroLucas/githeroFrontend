import Phaser, { Game, Math, Time } from 'phaser';
import simple_note from "../../img/game_assets/note_simple.png";

// array of [noteType, lineNumber, timeStart (, timeEnd if longNote)]
//timeStart must be > noteTravelTime
var beatmap = [[0,0,3000], [0,1,3400], [0,0,3600], [0,1,3800], [0,0,4200], [0,1,4600], [0,0,4800], [0,1,5000], [0,0,5400], [0, 0, 6000], [0,1,6000], [0,2,6000], [0,3,6000], [0,0,6400], 
    [0,1,6800], [0,1,7000], [0,1,7200], [0,1,7400], [0,1,7600]];

export default class GameScene extends Phaser.Scene {
    
	constructor() {
        super('game-scene');
        this.height = window.innerHeight;
        this.width = window.innerWidth;//hardcoded -> TODO to find in properties ?
        this.noteTravelTime = 3000;
        this.setProportions();
        this.leway = 170; //delay in ms
        this.isStarted = true;

        /**** TODO need to be given ****/
        this.songDuration = beatmap[beatmap.length-1][2]+500;
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
        this.nbrHits = 0;
        this.score = 0;
        this.combo = 0;
        this.nbrMissclicks = 0;
    }
    
    setProportions() {
        if(this.width < 1000){
            this.topSpacing = this.width/5;
            this.bottomSpacing = this.topSpacing;
            this.btnSideLen= Math.RoundTo(this.width/6, 0);
        }
        else {
            this.btnSideLen= Math.RoundTo(this.width/40, 0);
            this.topSpacing = this.width/40, 0;
            this.bottomSpacing = 3*this.topSpacing;
        }
        this.btnSideLenActive = Math.RoundTo(this.btnSideLen*0.9);
        this.endPathY = this.height;
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

    /**
     * Returns the x coordonate of the line to draw
     * @param i : the number of the line (from left to right )
     * @param deltaX : the distance between 2 lines
     */
    calcLineX (i, deltaX) {
        let center = this.width/2;
        let coeficients = [-1.5, -0.5, 0.5, 1.5];
        return center + coeficients[i]*deltaX;
    }

    createSquareBtns() {
        let y = this.endPathY - this.btnSideLen;
        this.squareBtns = [];
        for (let i = 0; i < 4; i++) {
            let x = this.calcLineX(i, this.bottomSpacing) - this.btnSideLen / 2;
            this.squareBtns[i] = new Phaser.Geom.Rectangle(x, y, this.btnSideLen, this.btnSideLen);
        }
    }

    createLines() {
        this.lines = [];
        for (let i = 0; i < 4; i++) {
            this.lines[i] = this.add.path(this.calcLineX(i, this.topSpacing), 0);
            this.lines[i].lineTo(this.calcLineX(i, this.bottomSpacing), this.endPathY+(this.btnSideLen/2));
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

    setBtnActive(i) {
        let x = this.calcLineX(i, this.bottomSpacing) - this.btnSideLenActive / 2;
        let y = this.height - this.btnSideLenActive;
        this.squareBtns[i].setTo(x, y, this.btnSideLenActive, this.btnSideLenActive);
    }

    setBtnInactive(i) {
        let x = this.calcLineX(i, this.bottomSpacing) - this.btnSideLen / 2;
        let y = this.height - this.btnSideLen;
        this.squareBtns[i].setTo(x, y, this.btnSideLen, this.btnSideLen);
        
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
        this.nbrHits++;
    }

    onKeypress (e) {
        //check if we clicked at the right time
        if (this.isStarted) {
            let queueToShift;
            switch(e.key) {
                case this.KEY1:
                    this.setBtnActive(0);
                    queueToShift = this.queuesTimestampToValidate[0];
                    break;
                case this.KEY2:
                    this.setBtnActive(1);
                    queueToShift = this.queuesTimestampToValidate[1];
                    break;
                case this.KEY3:
                    this.setBtnActive(2);
                    queueToShift = this.queuesTimestampToValidate[2];
                    break;
                case this.KEY4:
                    this.setBtnActive(3);
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
                this.setBtnInactive(0);
                break;
            case this.KEY2:
                this.setBtnInactive(1);
                break;
            case this.KEY3:
                this.setBtnInactive(2);
                break;
            case this.KEY4:
                this.setBtnInactive(3);
                break;          
        }
    }

    endGame (instance) {
        instance.isStarted = false;
        let pourcent = Math.RoundTo(instance.nbrHits/instance.nbrTimestamp*100,-2);
        console.log("Your precision is: " + pourcent + "%");
        console.log("You misclicked " + instance.nbrMissclicks + " times");

        instance.add.text(100, 300, "Game Over", { font: '48px Arial', fill: '#000000' });
        instance.add.text(100, 350, "Précision: " + pourcent + "%", { font: '24px Arial', fill: '#000000' })
    }
}