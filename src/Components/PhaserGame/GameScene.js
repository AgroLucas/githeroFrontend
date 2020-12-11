import Phaser, {Game, Time ,Base64} from 'phaser';
import { RedirectUrl } from "../Router.js";
import {getUserSessionData} from "../../utils/Session.js";

import simple_note from "../../img/game_assets/note_simple.png";
import long_note_head from "../../img/game_assets/note_longue_tete.png";
import long_note_body from "../../img/game_assets/note_longue_sentinelle.png";
import btnInactive from "../../img/game_assets/btn_inactive.png";
import btnActive from "../../img/game_assets/btn_active.png";
import flash from "../../img/game_assets/flash.png";
import fail from "../../img/game_assets/fail.png";
import NoteF from "../../img/game_assets/NoteF.png";
import NoteE from "../../img/game_assets/NoteE.png";
import NoteD from "../../img/game_assets/NoteD.png";
import NoteC from "../../img/game_assets/NoteC.png";
import NoteB from "../../img/game_assets/NoteB.png";
import NoteA from "../../img/game_assets/NoteA.png";
import NoteS from "../../img/game_assets/NoteS.png";
import NoteS1 from "../../img/game_assets/NoteS+.png";
import NoteS2 from "../../img/game_assets/NoteS++.png";
import arrow from "../../img/game_assets/arrow.png";

import hitSound1 from "../../audio/hit1.mp3";
import hitSound2 from "../../audio/hit2.mp3";
import hitSound3 from "../../audio/hit3.mp3";
import hitSound4 from "../../audio/hit4.mp3";
import failSound from "../../audio/fail.mp3";
import slideSound1 from "../../audio/slide1.mp3";
import slideSound2 from "../../audio/slide2.mp3";
import slideSound3 from "../../audio/slide3.mp3";
import slideSound4 from "../../audio/slide4.mp3";


export default class GameScene extends Phaser.Scene {
    
	constructor(beatmap, audioHtmlElement, userPreferences, audioFileDuration, beatmapId) {
        super('game-scene');
        this.beatmap = beatmap; //array -> [0]:type, [1]:line's number, [2]:beginTime(, [3]:endTime)
        this.beatmapId = beatmapId;
        this.audioHtmlElement = audioHtmlElement;
        this.height = window.innerHeight;
        this.width = window.innerWidth;
        this.setProportions();

        this.noteTravelTime = 3000;
        this.lowestPoint = 50
        this.longNoteValueIncreaseTime = 10;
        this.shortNoteInterval = 50; 
        this.longNoteIntervalTime = 250;
        this.longNoteIntervalTimeMalus = 500;
        this.btnEffectLifeTime = 250;

        this.isStarted = true;
        this.stackTimeout = []; //contain all timeout -> useful for clearing them all
        this.stackInterval = []; //contain all interval -> useful for clearing them all
        this.btns = [];
        this.lines = [];

        this.btnSize = 80; //sprite of 80px TODO scale dynamicly to screen size
        this.btnYOffset = this.btnSize/2;


        this.masterVolume = userPreferences.volume.master;
        this.soundEffectVolume = userPreferences.volume.effect;
        

        let tweak = 1.5;        
        let distanceToBtnCenter = this.height-(tweak * this.btnSize/2);
        this.noteTravelTimeToBtnCenter = this.calcTimeToGetToY(distanceToBtnCenter); 
        let distanceToBtn = this.height-(tweak * this.btnSize);
        this.noteTravelTimeToBtn = this.calcTimeToGetToY(distanceToBtn);
        this.valueMiddleButton = (Math.round((this.noteTravelTime - this.noteTravelTimeToBtn)/this.shortNoteInterval)); //the value the short note should get for having a perfect shot
        this.valueToGive = Math.round((this.noteTravelTime - this.noteTravelTimeToBtn)%this.shortNoteInterval); //the value given while doing a perfect shot

        this.songDuration = audioFileDuration;


        this.arrayKeys = [];
        this.arrayKeys[0] = userPreferences.keyBinding[1];
        this.arrayKeys[1] = userPreferences.keyBinding[2];
        this.arrayKeys[2] = userPreferences.keyBinding[3];
        this.arrayKeys[3] = userPreferences.keyBinding[4];
        this.queuesTimestampToValidate = [];
        for (let i = 0; i < 4; i++)
            this.queuesTimestampToValidate[i] = [];

        this.nbrHits = 0;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;

    }

	preload() {
        this.load.image("simple_note", simple_note);
        this.load.image("long_note_head", long_note_head);
        this.load.image("long_note_body", long_note_body);
        this.load.image("btnInactive", btnInactive);
        this.load.image("flash", flash);
        this.load.image("fail", fail);
        this.load.image("arrow", arrow);
        this.load.image("btnActive", btnActive);

        this.load.audio("hitSound1", hitSound1);
        this.load.audio("hitSound2", hitSound2);
        this.load.audio("hitSound3", hitSound3);
        this.load.audio("hitSound4", hitSound4);
        this.load.audio("failSound", failSound);
        this.load.audio("slideSound1", slideSound1);
        this.load.audio("slideSound2", slideSound2);
        this.load.audio("slideSound3", slideSound3);
        this.load.audio("slideSound4", slideSound4);
	}

	create() {
        this.displayGame(this);
        this.addAudio(this);
        this.addEvents(this);   
        this.createNoteEvents(this);
     
        //Start the game after noteTravelTimeToBtnCenter and Ending it after songDuration
        this.stackTimeout.push(setTimeout(()=> {
            this.stackTimeout.push(setTimeout(this.endGame, this.songDuration, this)); 
            this.playMusic();
        }, this.noteTravelTimeToBtnCenter));
    }

    displayGame (instance) {
        instance.graphics = instance.add.graphics();
        instance.createLines();
        instance.createBtns();
        instance.createBtnLabels();
        instance.drawAll();
        instance.scoreDisplay = instance.add.text(100, 100, "Score: 0", { font: '48px Arial', fill: '#000000' }); //TODO responsive
        instance.comboDisplay = instance.add.text(instance.width-200, 100, "X0", { font: '48px Arial', fill: '#000000' });
        let returnImage = instance.add.sprite(instance.width/30, instance.height/20, "arrow").setInteractive({useHandCursor: true});
        returnImage.on("pointerdown", () => instance.quitPage());
    }


    addAudio (instance) {
        instance.soundEffectAudioConfig = {
            mute: false,
            volume: instance.soundEffectVolume * instance.masterVolume,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: false,
            delay: 0
        }
        console.log(instance.soundEffectAudioConfig);
        instance.hitSoundSelect=1;
        instance.slideSoundSelect=1;
        instance.hitSoundMax=4;
        instance.slideSoundMax=4;
        instance.sound.add("hitSound1");
        instance.sound.add("hitSound2");
        instance.sound.add("hitSound3");
        instance.sound.add("hitSound4");
        instance.sound.add("failSound");
        instance.sound.add("slideSound1");
        instance.sound.add("slideSound2");
        instance.sound.add("slideSound3");
        instance.sound.add("slideSound4");
    }

    addEvents (instance) {
        document.addEventListener("touchstart", e => instance.onClick(e));
        document.addEventListener("touchend", e => instance.onEndClick(e));
        document.addEventListener("keypress", e => instance.onKeypress(e));
        document.addEventListener("keyup", e => instance.onKeyup(e));
        window.addEventListener("blur",  e => instance.quitPage(e));
    }


    playMusic(){
       this.audioHtmlElement.play(); 
    }

    quitPage() {
        if (this.isStarted) {
            this.isStarted = false;
            RedirectUrl("/list", "Vous avez quitté la page de jeu, retour dans la page de liste des musiques");
        }
    }

    /**** Notes'creations ****/

    /**
     * Create all beatmaps'notes at the right time
     * @param {*} instance 
     */
    createNoteEvents(instance) {
        let beatmap = instance.beatmap;
        for (let n = 0; n < beatmap.length; n++) {
            let lineNbr = beatmap[n][1];
             if (beatmap[n][0] == 0) //simple notes
                instance.stackTimeout.push(setTimeout(instance.createSimpleNote, beatmap[n][2], lineNbr, instance));
            else //long notes
                instance.stackTimeout.push(setTimeout(instance.createLongNote, beatmap[n][2], lineNbr, instance, beatmap[n][3]-beatmap[n][2]))
        }
    }

    /**
     * Create a simple note at the right line
     * @param {*} lineNbr 
     * @param {*} instance 
     * @param {*} time 
     */
    createSimpleNote(lineNbr, instance) {
        let follower = instance.add.follower(instance.lines[lineNbr], 0, 0, "simple_note");
        instance.stackTimeout.push(setTimeout(instance.setFollowerToValidate, instance.noteTravelTimeToBtn, lineNbr, follower, instance));

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
                instance.onNoKeypress(instance.queuesTimestampToValidate[lineNbr], lineNbr);
            },
        });       
   }

   /**
     * push into queuesTimestampToValidate[lineNbr] a new simple note and increment this note'score every shortNoteInterval ms
     * only if the button wasn't active before
     * @param {*} lineNbr, the line's number of the simple note 
     * @param {*} follower, the follower created 
     * @param {*} instance, this 
     */
    setFollowerToValidate(lineNbr, follower, instance) {
        let note = {follower:follower, intervalID:undefined, score:0, line:lineNbr};
        instance.queuesTimestampToValidate[lineNbr].push(note);
        if (!instance.btns[lineNbr].active) {
            let intervalID = setInterval(function() {note.score++}, instance.shortNoteInterval);
            note.intervalID = intervalID;
            instance.stackInterval.push(intervalID); 
        }
    }

    /**
     * Create a long note's head at the right line and create his body
     * @param {*} lineNbr 
     * @param {*} instance 
     * @param {*} end 
     */
   createLongNote(lineNbr, instance, end) {
    let follower = instance.add.follower(instance.lines[lineNbr], 0, 0, "long_note_head");
    instance.stackTimeout.push(setTimeout(instance.setLongFollowerToValidate, instance.noteTravelTimeToBtn, lineNbr, instance, end));

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
    instance.stackTimeout.push(setTimeout( () => clearInterval(intervalID), end ));
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
     * push into queuesTimestampToValidate[lineNbr] a new long note 
     * if the button was active before the push less point is given
     * @param {*} lineNbr, the line's number of the long note
     * @param {*} instance, this
     * @param {*} end, the time the long note should stay clickable
     */
    setLongFollowerToValidate(lineNbr, instance, end) {
        let checkTime = instance.longNoteIntervalTime;
        if (instance.btns[lineNbr].active)
            checkTime = instance.longNoteIntervalTimeMalus;
        let note = {follower:undefined, intervalID:undefined, score:0};
        instance.queuesTimestampToValidate[lineNbr].push(note);
        let intervalID = setInterval(instance.onLongNotePress, checkTime, lineNbr, note, instance);
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
            note.score += instance.longNoteValueIncreaseTime
            instance.destroySlideSounds();
            instance.playSlideSound();
            if (note.score%4*instance.longNoteValueIncreaseTime===0)
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
        instance.destroySlideSounds();
        if ((end/250)*0.70 < note.score)
            instance.nbrHits++;
    }   

    /**** End game ****/

    async endGame (instance) {
        instance.isStarted = false;
        let percent = Math.round(instance.nbrHits/instance.beatmap.length*10000)/100;
        if(instance.combo > instance.maxCombo)
            instance.maxCombo = instance.combo;

        let arrayNote = instance.getNote(percent);
        let note = arrayNote[0];
        let imgNote = arrayNote[1];
        
        let scoreMessage = "Connectez-vous pour inscrire votre score";
        let user = getUserSessionData();
        if (user)
            scoreMessage = await instance.getSetHighscore(instance.beatmapId, user, instance.score);
        instance.displayModal(instance, scoreMessage, imgNote, note, percent);

    }

    /**
     * get the percent's note and his image
     * @param {*} percent 
     * return an array containing the note at [0] and the image at [1]
     */
    getNote (percent) {
        let toReturn = [];
        if (percent === 100) {
            toReturn[0] = "S++";
            toReturn[1] = NoteS2;
        }else if (percent >= 95) {
            toReturn[0] = "S+";
            toReturn[1] = NoteS1;
        }else if (percent >= 90) {
            toReturn[0] = "S";
            toReturn[1] = NoteS;
        }else if (percent >= 80) {
            toReturn[0] = "A";
            toReturn[1] = NoteA;
        }else if (percent >= 60) {
            toReturn[0] = "B";
            toReturn[1] = NoteB;
        }else if (percent >= 50) {
            toReturn[0] = "C";
            toReturn[1] = NoteC;
        }else if (percent >= 35) {
            toReturn[0] = "D";
            toReturn[1] = NoteD;
        }else if (percent >= 20) {
            toReturn[0] = "E";
            toReturn[1] = NoteE;
        }else {
            toReturn[0] = "F";
            toReturn[1] = NoteF;
        }
        return toReturn;
    }

    async getSetHighscore  (beatmapId, user, score) {
        let toReturn = "";
        await fetch("/api/users/score", {
            method: "POST", 
            body: JSON.stringify({beatmapId: beatmapId, username: user.username, score: score}), 
            headers: {
                Authorization: user.token,
                "Content-Type": "application/json",
            },
        })
        .then((response) => {
            if (!response.ok)
                throw new Error("Error code : " + response.status + " : " + response.statusText);
            return response.json();
        })
        .then((data) => {
            let oldHighscore = data.oldHighscore;
            if (oldHighscore>score) 
                toReturn = "Highscore : " + oldHighscore;
            else
                toReturn = "New highscore : " + score;
        })
        .catch((err) => console.log(err.message));
        return toReturn;
    }

    displayModal (instance, scoreMessage, imgNote, note, percent)  {
        let modalBody = document.querySelector("#contentGameModal");
        modalBody.innerHTML = `
            <div class="d-flex justify-content-center my-0" id="modalGameOverText">` + scoreMessage + `</br>Score: ` + instance.score + `</br>Précision : ` + percent +`%</br>Combo max : ` + instance.maxCombo + `</br>Note : ` + note + `</div>
            <div class="d-flex justify-content-center my-0"></br><img id="` + imgNote + `" class=mt-3 src="` + imgNote + `" alt="` + imgNote + `"></div></br><button type="button" id="replay" class="btn btn-primary modalGameButton" href="#" data-uri="/game">Rejouer</button>
            <button type="button" id="returnList" class="btn btn-primary modalGameButton" href="#" data-uri="/list">Retour à la liste de map</button> `;

        page.querySelector("#replay").addEventListener("click", (e) => RedirectUrl(e.target.dataset.uri, instance.beatmapId));
        page.querySelector("#returnList").addEventListener("click", (e) => RedirectUrl(e.target.dataset.uri));
        $('#gameModal').modal({show:true});
    }


    /**** Buttons'Interactions ****/

    onClick(e) {
        if (this.isStarted) {
            let pos = e.changedTouches[0].clientX;
            let quartTaille = window.innerWidth/4;
            let queueToShift;
    
            if (pos <= quartTaille) {
                this.setBtnActive(0);
                queueToShift = this.queuesTimestampToValidate[0];
            } else if (pos <= quartTaille*2) {
                this.setBtnActive(1);
                queueToShift = this.queuesTimestampToValidate[1];
            } else if (pos <= quartTaille*3) {
                this.setBtnActive(2);
                queueToShift = this.queuesTimestampToValidate[2];
            } else {
                this.setBtnActive(3);
                queueToShift = this.queuesTimestampToValidate[3];
            } 
            if (typeof queueToShift !== "undefined") {
                if (queueToShift.length!==0) {
                    if(typeof queueToShift[0].follower!== "undefined") //if the note is not long
                        this.onKeypressRightTime(queueToShift);
                }
            }
        }
    }
    
    onEndClick(e) {
        if (typeof this.queuesTimestampToValidate[0] === "undefined" || typeof this.queuesTimestampToValidate[0].follower === "undefined") //if there is no long note
            this.setBtnInactive(0);
        if (typeof this.queuesTimestampToValidate[1] === "undefined" || typeof this.queuesTimestampToValidate[1].follower === "undefined")
            this.setBtnInactive(1);
        if (typeof this.queuesTimestampToValidate[2] === "undefined" || typeof this.queuesTimestampToValidate[2].follower === "undefined") 
            this.setBtnInactive(2);
        if (typeof this.queuesTimestampToValidate[3] === "undefined" || typeof this.queuesTimestampToValidate[3].follower === "undefined") 
            this.setBtnInactive(3);  
    }  
    
    
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
    
    
    /**
    * reset the global combo and stop the simple note's interval if it was not validated
    * @param {*} queueToShift, the queue containing the simple note to clear and remove 
    * @param {*} lineNbr, the number of the line containing the simple note 
    * @param {*} time, the time of the note's end 
    */
    onNoKeypress (queueToShift, lineNbr) {
        if (queueToShift.length!==0) {
            this.resetCombo();
            this.displayBtnEffect(lineNbr, "fail");
            clearInterval(queueToShift.shift().intervalID);
        }
    }
        
    /**
    * clear and remove the validated simple note from the queue, play a sound, increment the combo and score
    * gives more point if perfect
    * @param {*} queueToShift, the queue containing the simple note to clear and remove 
    */
    onKeypressRightTime (queueToShift) {
        this.playHitSound();            
        let note = queueToShift.shift();
        clearInterval(note.intervalID);
        note.follower.destroy();
            
        this.incrementCombo();
        let value = note.score;
        //check if perfect
        if(value === Math.round(this.valueMiddleButton/2) || value === Math.round((this.valueMiddleButton)/2)-1) {
            this.nbrHits += 1;
            this.displayBtnEffect(note.line, "flash");
            this.updateScore(this.valueToGive);
        } else {
            this.nbrHits += 0.5;
            this.updateScore(Math.floor(this.valueToGive*0.5));
        }
    }

    /**** graphic creation/modification ****/

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


    calcTimeToGetToY(y) {
        let Y = y/this.height; // 0 <= Y <= 1
        let coefficient = 2* Math.acos(1 - Y)/(Math.PI);
        return this.noteTravelTime*coefficient;
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

    createBtnLabels(){
        let fntSize = 30; 
        let y = this.endPathY - this.btnYOffset ; //same y as btns
        for(let i=0; i<4; i++){
            let x = this.calcLineXFromY(i, this.height);
            let txt = this.add.text(x, y, this.arrayKeys[i].toUpperCase(), { font: '30px Arial', fill: '#FFFFFF' }); //set font size at the same value as fntSize
            this.centerText(txt);
        }
    }

    centerText(text) {
        //top left
        let tl_x = text.x;
        let tl_y = text.y;

        //center
        let c_x = text.getCenter().x;
        let c_y = text.getCenter().y;

        let xOffset = c_x - tl_x;
        let yOffset = c_y - tl_y;

        //new coord.
        let n_x = tl_x - xOffset;
        let n_y = tl_y - yOffset;

        text.setX(n_x);
        text.setY(n_y);
    }

    /**
     * add the number*combo to the global score and update the display
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
        if(this.combo > this.maxCombo)
            this.maxCombo = this.combo;
        this.combo = 0;
        this.comboDisplay.setText("X" +this.combo);
    }

    setBtnActive(i) {
        this.btns[i].button.setTexture("btnActive");
        this.btns[i].active = true;
    }

    setBtnInactive(i) {
        this.btns[i].button.setTexture("btnInactive");
        this.btns[i].active = false;
    }

    displayBtnEffect(i, spriteKey){
        let sprite = this.add.sprite(this.calcLineXFromY(i, this.height-this.btnYOffset), this.height-this.btnYOffset, spriteKey);
        sprite.setScale(3,3);
        setTimeout(()=>sprite.destroy(), this.btnEffectLifeTime);
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

    /**** Audio ****/

    //play a short note'sound
    playHitSound() {
        let soundToPlay = "hitSound"+this.hitSoundSelect;
        this.sound.play(soundToPlay, this.soundEffectAudioConfig);
        this.hitSoundSelect++;
        if (this.hitSoundSelect > this.hitSoundMax)
            this.hitSoundSelect = 1;
    }

    //play a long note'sound
    playSlideSound(){
        let soundToPlay = "slideSound"+this.slideSoundSelect;
        this.sound.play(soundToPlay, this.soundEffectAudioConfig);
        this.slideSoundSelect++;
        if (this.slideSoundSelect > this.slideSoundMax)
            this.slideSoundSelect=1;
    }

    //play a fail'sound
    playFailSound() {
        this.sound.play("failSound", this.soundEffectAudioConfig);
    }

    destroySlideSounds() {
        for (let i = 0; i <= this.slideSoundMax; i++) {
            let soundName = "slideSound"+i;
            let sound = this.sound.get(soundName);
            if (sound) 
                sound.destroy()
        }
    }
    
}