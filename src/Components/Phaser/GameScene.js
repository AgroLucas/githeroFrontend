import Phaser, { Game, Math, Time } from 'phaser';
import simple_note from "../../img/game_assets/note_simple.png";
import long_note_head from "../../img/game_assets/note_longue_tete.png";
import long_note_body from "../../img/game_assets/note_longue_sentinelle.png";
import hitSound1 from "../../audio/hit1.mp3";
import hitSound2 from "../../audio/hit2.mp3";
import hitSound3 from "../../audio/hit3.mp3";
import hitSound4 from "../../audio/hit4.mp3";
import failSound from "../../audio/fail.mp3";
import btnInactive from "../../img/game_assets/btn_inactive.png";
import btnActive from "../../img/game_assets/btn_active.png";

var beatmap = [[1,0,3000, 5000], [0,1,3400], [0,1,3600], [0,1,3800], [0,1,4200], [0,1,4600], [0,1,4800], [0,1,5000], [0,0,5400], [0, 0, 6000], [0,1,6000], [0,2,6000], [0,3,6000], [0,0,6400], 
[0,1,6800], [0,1,7000], [0,1,7200], [0,1,7400], [0,1,7600]];
//var beatmap = [[1,0,3000,5500], [1,1,3500,5000]];


export default class GameScene extends Phaser.Scene {
    
	constructor() {
        super('game-scene');
        this.height = window.innerHeight;
        this.width = window.innerWidth;//hardcoded -> TODO to find in properties ?
        this.noteTravelTime = 3000;
        this.setProportions();
        this.leway = 170; //delay in ms

        this.lowestPoint = 50
        this.longNoteIncrease = 10; // score increase by 10 every 250ms holding long note

        this.isStarted = true;
        this.stackTimeout = []; //contain all timeout -> useful if we need to clear them all
        this.stackInterval = []; //contain all interval -> useful if we need to clear them all
        this.btns = [];
        this.lines = [];

        this.btnYOffset = 20;

        /**** TODO need to be given ****/
        this.songDuration = 8000; //song duration -> to change
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
    }
    
    setProportions() {
        if(this.width < 1000){
            this.topSpacing = this.width/5;
            this.bottomSpacing = this.topSpacing;
        }
        else {
            this.topSpacing =  this.width/40, 0;
            this.bottomSpacing = 3*this.topSpacing;
        }
        this.endPathY = this.height;
    }

	preload() {
        this.load.image("simple_note", simple_note);
        this.load.image("long_note_head", long_note_head);
        this.load.image("long_note_body", long_note_body);
        this.load.image("btnInactive", btnInactive);
        this.load.image("btnActive", btnActive);
        this.load.audio("hitSound1", hitSound1);
        this.load.audio("hitSound2", hitSound2);
        this.load.audio("hitSound3", hitSound3);
        this.load.audio("hitSound4", hitSound4);
        this.load.audio("failSound", failSound);
	}

	create() {
        this.graphics = this.add.graphics();
        this.createLines();
        this.createBtns();
        this.drawAll();

        //text display
        this.scoreDisplay = this.add.text(100, 100, "Score: 0", { font: '48px Arial', fill: '#000000' });
        this.comboDisplay = this.add.text(this.width-200, 100, "X0", { font: '48px Arial', fill: '#000000' });

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
        this.hitSoundMax=4;
        this.sound.add("hitSound1", audioConfig);
        this.sound.add("hitSound2", audioConfig);
        this.sound.add("hitSound3", audioConfig);
        this.sound.add("hitSound4", audioConfig);
        this.sound.add("failSound", audioConfig);

        //notes
        this.createNoteEvents(this.noteTravelTime, this);

        this.stackTimeout.push(setTimeout(this.endGame, this.songDuration, this));
        document.addEventListener("keypress", event => this.onKeypress(event));
        document.addEventListener("keyup", event => this.onKeyup(event));
        
    }

    createNoteEvents(travelTime, instance) {
        for (let n = 0; n < beatmap.length; n++) {
            let lineNbr = beatmap[n][1];
            let delay = beatmap[n][2] - travelTime; //when the note display
             if (beatmap[n][0] == 0) //simple notes
                instance.stackTimeout.push(setTimeout(instance.createSimpleNote, delay, lineNbr, instance, beatmap[n][2]));
            else { //long notes
                instance.stackTimeout.push(setTimeout(instance.createLongNote, delay, lineNbr, instance, beatmap[n][3]-beatmap[n][2]))
            }
        }
    }

    createSimpleNote(lineNbr, instance, time) {
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

   createLongNote(lineNbr, instance, end) {
    let follower = instance.add.follower(instance.lines[lineNbr], 0, 0, "long_note_head");
    let activationDelay = instance.noteTravelTime-instance.leway;
    instance.stackTimeout.push(setTimeout(instance.setLongFollowerToValidate, activationDelay, lineNbr, instance, end));

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

    let intervalID = setInterval(instance.createLongNoteBodySprite, 1, lineNbr, instance);
    instance.stackInterval.push(intervalID);
    setTimeout(function() {clearInterval(intervalID)}, end);
   }

   createLongNoteBodySprite(lineNbr, instance) {
       let follower = instance.add.follower(instance.lines[lineNbr], 0, 0, "long_note_body");
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

    /**
     * Returns the x coordonate of the line to draw
     * @param {*} i : the number of the line (from left to right )
     * @param {*} deltaX : the distance between 2 lines
     */
    calcLineX (i, deltaX) {
        let center = this.width/2;
        let coeficients = [-1.5, -0.5, 0.5, 1.5];
        return center + coeficients[i]*deltaX;
    }

    calcLineXFromY(i, y){
        let deltaX = this.calcLineX(i, this.bottomSpacing) - this.calcLineX(i, this.topSpacing);
        return this.calcLineX(i, this.topSpacing) + (deltaX * y/this.height);
    }

    createBtns(){
        
        let y = this.endPathY - this.btnYOffset;
        for (let i = 0; i < 4; i++) {
            let x = this.calcLineXFromY(i, y);
            this.btns[i] = {button:this.add.sprite(x,y, "btnInactive"), active:false};
        }
    }

    createLines() {
        for (let i = 0; i < 4; i++) {
            this.lines[i] = this.add.path(this.calcLineX(i, this.topSpacing), 0);
            this.lines[i].lineTo(this.calcLineX(i, this.bottomSpacing), this.endPathY+(this.btnYOffset));
        }
    }

    update() {
    }

    /**
     * add the number to the global score and update the display
     * @param {*} number, the number to add to the score 
     */
    updateScore(number) {
        this.score += number * this.combo;
        this.scoreDisplay.setText("Score: " + this.score);
    }

    /**
     * increment the global combo and update the display
     */
    incrementCombo() {
        this.combo++;
        this.comboDisplay.setText("X" +this.combo);
    }

    /**
     * increment the global combo and update the display
     * play a sound if the combo was > 10
     */
    resetCombo(){
        if(this.combo > 10)
            this.playFailSound();
        this.combo = 0;
        this.comboDisplay.setText("X" +this.combo);
    }

    setBtnActive(i) {
        this.btns[i].button.setTexture("btnActive");
    }

    setBtnInactive(i) {
        this.btns[i].button.setTexture("btnInactive");
    }

    displayPerfectFlash(i){
        console.log("perfect: "+i);
        //TODO
    }

    drawAll() {
        this.drawLines();
    }

    drawLines() {
        this.graphics.lineStyle(2, 0x000000);
        for (let i = 0; i < 4; i++) {
            this.lines[i].draw(this.graphics);
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

    //algorithm methods

    /**
     * reset the global combo and stop the simple note's interval if it was not validated
     * @param {*} queueToShift, the queue containing the simple note to clear and remove 
     * @param {*} lineNbr, the number of the line containing the simple note 
     * @param {*} time, the time of the note's end 
     */
    onNoKeypress (queueToShift, lineNbr, time) {
        if (queueToShift.length!==0) {
            this.resetCombo();
            clearInterval(queueToShift.shift().intervalID);
            console.log("FAILED :: line " + lineNbr + " at " + time + " ms");
        }
    }
    
    /**
     * clear and remove the validated simple note from the queue, play a sound, increment the combo and score
     * @param {*} queueToShift, the queue containing the simple note to clear and remove 
     */
    onKeypressRightTime (queueToShift) {
        this.playHitSound();
        let note = queueToShift.shift();
        clearInterval(note.intervalID);
        note.follower.destroy();
        
        console.log("Well Done");
        this.incrementCombo();
        let precisionMultiplier = note.score;
        this.updateScore(this.lowestPoint*precisionMultiplier);
        this.nbrHits += 1/3 * precisionMultiplier;
        if(precisionMultiplier === 3){
            this.displayPerfectFlash(note.line);
        }
    }

    /**
     * push into queuesTimestampToValidate[lineNbr] a new simple note and increment this note'score every 100ms
     * @param {*} lineNbr, the line's number of the simple note 
     * @param {*} follower, the follower created 
     * @param {*} instance, this 
     */
    setFollowerToValidate(lineNbr, follower, instance) {
        let note = {follower:follower, intervalID:undefined, score:1, line:lineNbr};
        instance.queuesTimestampToValidate[lineNbr].push(note);
        console.log("push single");
        let intervalID = setInterval(function() {note.score++}, 100);
        note.intervalID = intervalID;
        instance.stackInterval.push(intervalID); 
    }

    /**
     * push into queuesTimestampToValidate[lineNbr] a new long note 
     * set the line's button inactive before setting the long note clickable
     * @param {*} lineNbr, the line's number of the long note
     * @param {*} instance, this
     * @param {*} end, the time the long note should stay clickable
     */
    setLongFollowerToValidate(lineNbr, instance, end) {
        instance.setBtnInactive(lineNbr);
        let note = {follower:undefined, intervalID:undefined, score:0};
        instance.queuesTimestampToValidate[lineNbr].push(note);
        console.log("push long");
        let intervalID = setInterval(instance.onLongNotePress, 250, lineNbr, note, instance);
        instance.stackInterval.push(intervalID); 
        note.intervalID = intervalID;

        instance.stackTimeout.push(setTimeout(instance.onEndLongFollower, end, lineNbr, note, end, instance));
    }

    /**
     * increment and display the long note'score every 250ms if the correct button is active, else reset the combo
     * @param {*} lineNbr, the line's number of the long note
     * @param {*} note, the long note containing the score 
     * @param {*} instance, this
     */
    onLongNotePress(lineNbr, note, instance) {
        if(instance.btns[lineNbr].active) {
            note.score += instance.longNoteIncrease
            if (note.score%4*instance.longNoteIncrease===0)
                instance.incrementCombo();
            instance.updateScore(note.score);
        } else {
            instance.resetCombo();
            note.score = 0;
        }
    }

    /**
     * clear and the remove the long note from the queue and increment the nbrHits if less than 30% of the note is missed
     * @param {*} lineNbr, the line's number of the long note
     * @param {*} note, the note to clear and remove
     * @param {*} end, the time the long note stayed clickable  
     * @param {*} instance, this
     */
    onEndLongFollower(lineNbr, note, end, instance) {
        clearInterval(note.intervalID);
        instance.queuesTimestampToValidate[lineNbr].shift();
        if ((end/250)*0.70 < note.score)
            instance.nbrHits++;
    }

    //check if we clicked at the right time
    onKeypress (e) {
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
            if (typeof queueToShift !== "undefined") {
                if (queueToShift.length!==0) {
                    if(typeof queueToShift[0].follower!== "undefined") //if the note is not long
                        this.onKeypressRightTime(queueToShift);
                }
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

    endGame (instance) {
        instance.isStarted = false;
        let pourcent = Math.RoundTo(instance.nbrHits/beatmap.length*100,-2);
        console.log("Your precision is: " + pourcent + "%");

        instance.add.text(100, 300, "Game Over", { font: '48px Arial', fill: '#000000' });
        instance.add.text(100, 350, "Précision: " + pourcent + "%", { font: '24px Arial', fill: '#000000' })
    }
}