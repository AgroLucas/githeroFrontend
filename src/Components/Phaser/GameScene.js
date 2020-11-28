import Phaser, { Game, Math, Time } from 'phaser';
import simple_note from "../../img/game_assets/note_simple.png";
import Note from "./Note.js"
import hitSound1 from "../../audio/hit1.mp3";
import hitSound2 from "../../audio/hit2.mp3";
import failSound from "../../audio/fail.mp3";

var beatmap = [[0,0,3000], [0,1,3400], [0,0,3600], [0,1,3800], [0,0,4200], [0,1,4600], [0,0,4800], [0,1,5000], [0,0,5400], [0, 0, 6000], [0,1,6000], [0,2,6000], [0,3,6000], [0,0,6400], 
    [0,1,6800], [0,1,7000], [0,1,7200], [0,1,7400], [0,1,7600]];
//var beatmap = [[0,0,3000]];


export default class GameScene extends Phaser.Scene {
    
	constructor() {
        super('game-scene');
        this.height = window.innerHeight;
        this.width = window.innerWidth;//hardcoded -> TODO to find in properties ?
        this.noteTravelTime = 3000;
        this.setProportions();
        this.leway = 170; //delay in ms
        this.lowestPoint = 50
        this.isStarted = true;
        this.stackTimeout = []; //contain all timeout -> useful if we need to clear them all
        this.stackInterval = []; //contain all interval -> useful if we need to clear them all

        /**** TODO need to be given ****/
        this.songDuration = beatmap[beatmap.length-1][2]+500;
        this.arrayKeys = [];
        this.arrayKeys[0] = "d";
        this.arrayKeys[1] = "f";
        this.arrayKeys[2] = "j";
        this.arrayKeys[3] = "k";
        this.queuesTimestampToValidate = [];
        for (let i = 0; i < 4; i++)
            this.queuesTimestampToValidate[i] = [];

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
            this.topSpacing =  this.width/40, 0;
            this.bottomSpacing = 3*this.topSpacing;
        }
        this.btnSideLenActive = Math.RoundTo(this.btnSideLen*0.9);
        this.endPathY = this.height;
    }

	preload() {
        this.load.image("simple_note", simple_note);
        this.load.audio("hitSound1", hitSound1);
        this.load.audio("hitSound2", hitSound2);
        this.load.audio("failSound", failSound);
	}

	create() {
        this.graphics = this.add.graphics();
        this.createLines();
        this.createSquareBtns();
        this.drawAll();

        //text display
        this.scoreDisplay = this.add.text(100, 100, "Score: 0", { font: '48px Arial', fill: '#000000' });
        this.comboDisplay = this.add.text(this.width-200, 100, "X0", { font: '48px Arial', fill: '#000000' });

        //sounds
        this.sound.decodeAudio([["hitSound1", hitSound1], ["hitSound2", hitSound2], ["failSound", failSound]]);
        let audioConfig = {
            mute: false,
            volume: 1,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: false,
            delay: 0
        }
        this.hitSoundSelect=1;
        this.hitSoundMax=2;
        this.sound.add("hitSound1", audioConfig);
        this.sound.add("hitSound2", audioConfig);
        this.sound.add("failSound", audioConfig);

        //notes
        this.createNoteEvents(this.noteTravelTime, this.createNote, this);

        this.stackTimeout.push(setTimeout(this.endGame, this.songDuration, this));
        document.addEventListener("keypress", event => this.onKeypress(event));
        document.addEventListener("keyup", event => this.onKeyup(event));
        
    }

    createNoteEvents(travelTime, createNote, instance) {
        for (let n = 0; n < beatmap.length; n++) {
            let lineNbr = beatmap[n][1];
            let delay = beatmap[n][2] - travelTime; //when the note display
             if (beatmap[n][0] == 0) //simple notes
                instance.stackTimeout.push(setTimeout(createNote, delay, lineNbr, instance, beatmap[n][2]));
        }
    }

    createNote(lineNbr, instance, time) {
        let follower = instance.add.follower(instance.lines[lineNbr], 0, 0, "simple_note");
        let activationDelay = instance.noteTravelTime-instance.leway;
        instance.stackTimeout.push(setTimeout(instance.setFollowerToValidate, activationDelay, lineNbr, follower, instance));

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
                instance.onNoKeypress(instance.queuesTimestampToValidate[lineNbr], lineNbr, time);
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
        this.squareBtns = [];
        let y = this.endPathY - this.btnSideLen;
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
        if(this.combo > 10){
            this.playFailSound();
        }
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
            clearInterval(queueToShift.shift().getIntervalID());
            console.log("FAILED :: line " + lineNbr + " at " + time + " ms");
        }
    }
    
    onKeypressTooEarly () { //suggested to remove ??? 
        console.log("WRONGGG");
        this.nbrMissclicks++;
    }
    
    onKeypressRightTime (queueToShift) {
        this.playHitSound();
        let note = queueToShift.shift();
        clearInterval(note.getIntervalID());
        note.getFollower().destroy();
        
        console.log("Well Done");
        this.incrementCombo();
        let precisionMultiplier = note.getScore();
        this.updateScore(this.lowestPoint*note.getScore());
        console.log("precisionMultiplier: " + precisionMultiplier);
        this.nbrHits += 1/3 * precisionMultiplier;
    }

    /**
     * push into queuesTimestampToValidate a new note and increment this note'score every 100ms
     * @param {*} timeoutID, the setTimeout's id of the follower
     * @param {*} lineNbr, the line's number of the follower 
     * @param {*} follower, the follower created 
     * @param {*} instance, this 
     */
    setFollowerToValidate(lineNbr, follower, instance) {
        let note = new Note(follower);
        console.log("push");
        instance.queuesTimestampToValidate[lineNbr].push(note); //on rend la note clicable => sera plus clicable a onComplete ou si on a valide avant
        let intervalID = setInterval(function() {note.incrementScore()}, 100); //incremente le score toute les 100ms
        note.setIntervalID(intervalID);
        instance.stackInterval.push(intervalID); 
    }

    onKeypress (e) {
        //check if we clicked at the right time
        if (this.isStarted) {
            let queueToShift;
            switch(e.key) {
                case this.arrayKeys[0]:
                    this.setBtnActive(0);
                    queueToShift = this.queuesTimestampToValidate[0];
                    break;
                case this.arrayKeys[1]:
                    this.setBtnActive(1);
                    queueToShift = this.queuesTimestampToValidate[1];
                    break;
                case this.arrayKeys[2]:
                    this.setBtnActive(2);
                    queueToShift = this.queuesTimestampToValidate[2];
                    break;
                case this.arrayKeys[3]:
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
            case this.arrayKeys[0]:
                this.setBtnInactive(0);
                break;
            case this.arrayKeys[1]:
                this.setBtnInactive(1);
                break;
            case this.arrayKeys[2]:
                this.setBtnInactive(2);
                break;
            case this.arrayKeys[3]:
                this.setBtnInactive(3);
                break;          
        }
    }

    //audio
    playHitSound() {
        this.sound.play("hitSound"+this.hitSoundSelect);
        this.hitSoundSelect++;
        if(this.hitSoundSelect > this.hitSoundMax){
            this.hitSoundSelect = 1;
        }
    }

    playFailSound() {
        this.sound.play("failSound");
    }


    endGame (instance) {
        instance.isStarted = false;
        let pourcent = Math.RoundTo(instance.nbrHits/beatmap.length*100,-2);
        console.log("Your precision is: " + pourcent + "%");
        console.log("You misclicked " + instance.nbrMissclicks + " times");

        instance.add.text(100, 300, "Game Over", { font: '48px Arial', fill: '#000000' });
        instance.add.text(100, 350, "Précision: " + pourcent + "%", { font: '24px Arial', fill: '#000000' })
    }
}