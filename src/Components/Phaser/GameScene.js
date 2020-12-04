import Phaser, { Game, Time ,Base64} from 'phaser';
import simple_note from "../../img/game_assets/note_simple.png";
import long_note_head from "../../img/game_assets/note_longue_tete.png";
import long_note_body from "../../img/game_assets/note_longue_sentinelle.png";
import hitSound1 from "../../audio/hit1.mp3";
import hitSound2 from "../../audio/hit2.mp3";
import hitSound3 from "../../audio/hit3.mp3";
import hitSound4 from "../../audio/hit4.mp3";
import failSound from "../../audio/fail.mp3";
import slideSound from "../../audio/slide.mp3";
//import song from "../../audio/ldd.mp3"; //TODO fetch from backend
import btnInactive from "../../img/game_assets/btn_inactive.png";
import btnActive from "../../img/game_assets/btn_active.png";
import flash from "../../img/game_assets/flash.png";

const ldd = [[0, 0, 3500], [0, 1, 3780], [0, 0, 4100], [0, 1, 4420], //libre de droits ... 
    [0, 3, 7320], [0, 2, 7630], [0, 1, 7975], [0, 0, 8310], [0, 1, 8640], [0, 2, 8890], [1, 3, 9185, 9975], // générique libre de droiiits ...
    [0, 0, 10740], [0, 1, 11010], [0, 0, 11300], [0, 1, 11605], // (libre de droits...)
    [0, 2, 12300], [0, 3, 12300], [0, 0, 12650], [0, 1, 12650], [0, 2, 13065], [0, 3, 13065], [0, 0, 13395], [0, 3, 13395], [0,1,13675], [0,2,13675], [0, 0, 13960], [0, 3, 13960], //cette chanson est à moi ... (double)
    [0, 3, 15190], [0, 2, 15435], [0, 3, 15790], [0, 2, 16100], [0, 3, 16410], // YouTube l'enlève pas ...
    [0, 0, 17615], [0, 1, 17890], [0, 0, 18195], [0, 1, 18496], [0, 0, 18738], // c'est libre de doits ...
    [1, 3, 19550, 20000], [1, 2, 20000, 20600], [1, 1, 20600, 21230], [1, 0, 21230, 22100], // liiiiiibreuuuuuuuh deuuuuuuuuuh droiiiiiiiits ...
    [0, 2, 22650], [0, 0, 22990], [0, 3, 23255], [0, 1, 23565], // libre de droits ...
    [0, 0, 26540], [0, 1, 26750], [0, 0, 27135], [0, 1, 27455], [0, 0, 27810], [0, 1, 28095], [1, 0, 28395, 29185], [1, 1, 28395, 29185], //générique libre de droiiits ...
    [0, 3, 29930], [0, 2, 30200], [0, 1, 30630], [0, 0, 30845],  //(libre de droiiits ...)
    [0, 0, 31670], [0, 1, 31985], [0, 2, 32280], [0, 3, 32530], [0, 3, 32875], [0, 2, 33210],   //cette chanson est à moi ... (double) 
    [0, 0, 34385], [0, 1, 34650], [0, 0, 35015], [0, 1, 35300], [0, 0, 35610], //YouTube l'enlèves pas ...
    [0, 0, 36810], [0, 2, 36810], [0, 1, 37100], [0, 3, 37100], [0, 0, 37420], [0, 2, 37420], [0, 1, 37700], [0, 3, 37700], [1, 0, 38020, 38840], [1, 2, 38020, 38840], // c'est libre de droits.
    [0, 1, 40665], //Libre ...
    [0, 1, 41710], [0, 0, 41920] // de droits.
]

//var beatmap = [[1,0,3000, 5000], [0,1,3400], [0,1,3600], [0,1,3800], [0,1,4200], [0,1,4600], [0,1,4800], [0,1,5000], [0,0,5400], [0, 0, 6000], [0,1,6000], [0,2,6000], [0,3,6000], [0,0,6400], [0,1,6800], [0,1,7000], [0,1,7200], [0,1,7400], [0,1,10000]];
//var beatmap = [[0,0,1000], [0,0,1200]];
//var beatmap = [[0,1,800], [0,1,1000], [0,1,1200], [0,1,1400], [0,1,1600]];
//var beatmap = [[0,1,800]];

var beatmap;

export default class GameScene extends Phaser.Scene {
    
	constructor(beatmap, audioHtmlElement) {
        super('game-scene');
        this.beatmap = beatmap;
        console.log(this.beatmap);
        this.audioHtmlElement = audioHtmlElement;
        this.height = window.innerHeight;
        this.width = window.innerWidth;
        this.setProportions();

        console.log(this.game);

        this.noteTravelTime = 3000;

        this.lowestPoint = 50
        this.longNoteIncrease = 10; // score increase by 10 every 250ms holding long note

        this.isStarted = true;
        this.stackTimeout = []; //contain all timeout -> useful if we need to clear them all
        this.stackInterval = []; //contain all interval -> useful if we need to clear them all
        this.btns = [];
        this.lines = [];

        this.btnSize = 80; //sprite of 80px TODO scale dynamicly to screen size
        this.btnYOffset = this.btnSize/2;

        this.musicVolume = 0.75;
        this.soundEffectVolume = 1;
        
        //calc noteTravelTimeToBtnCenter

        let tweak = 1.5;        
        let distanceToBtnCenter = this.height-(tweak * this.btnSize/2);
        this.noteTravelTimeToBtnCenter = this.calcTimeToGetToY(distanceToBtnCenter); 

        let distanceToBtn = this.height-(tweak * this.btnSize);
        this.noteTravelTimeToBtn = this.calcTimeToGetToY(distanceToBtn); 
        console.log(distanceToBtn);
        console.log(this.noteTravelTimeToBtn);
        console.log(distanceToBtnCenter);
        console.log(this.noteTravelTimeToBtnCenter);
        

        /**** TODO need to be given ****/
        this.songDuration = 45000 + this.noteTravelTime; //song duration -> to change
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

        this.flashLifeTime = 250;
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
        this.load.image("flash", flash);
        this.load.image("btnActive", btnActive);
        this.load.audio("hitSound1", hitSound1);
        this.load.audio("hitSound2", hitSound2);
        this.load.audio("hitSound3", hitSound3);
        this.load.audio("hitSound4", hitSound4);
        this.load.audio("failSound", failSound);
        this.load.audio("slideSound", slideSound);
        //this.load.audio("song", this.song);
	}

	create() {
        this.graphics = this.add.graphics();
        this.createLines();
        this.createBtns();
        this.drawAll();

        //text display
        this.scoreDisplay = this.add.text(100, 100, "Score: 0", { font: '48px Arial', fill: '#000000' });
        this.comboDisplay = this.add.text(this.width-200, 100, "X0", { font: '48px Arial', fill: '#000000' });

        let soundEffectAudioConfig = {
            mute: false,
            volume: this.soundEffectVolume,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: false,
            delay: 0
        }
        let musicAudioConfig = {
            mute: false,
            volume: this.musicVolume,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: false,
            delay: 0
        }
        
        this.hitSoundSelect=1;
        this.hitSoundMax=4;
        this.sound.add("hitSound1", soundEffectAudioConfig);
        this.sound.add("hitSound2", soundEffectAudioConfig);
        this.sound.add("hitSound3", soundEffectAudioConfig);
        this.sound.add("hitSound4", soundEffectAudioConfig);
        this.sound.add("failSound", soundEffectAudioConfig);
        this.sound.add("slideSound", soundEffectAudioConfig);
        //this.music = this.sound.add("song", musicAudioConfig);

        //notes
        this.createNoteEvents(this);

        document.addEventListener("touchstart", event => this.onClick(event));
        document.addEventListener("touchend", event => this.onEndClick(event));
        document.addEventListener("keypress", event => this.onKeypress(event));
        document.addEventListener("keyup", event => this.onKeyup(event));

        setTimeout(()=> {
            this.stackTimeout.push(setTimeout(this.endGame, this.songDuration, this));
            this.playMusic();
        }, this.noteTravelTime);
    }

    playMusic(){
        this.audioHtmlElement.play();
    }

    //const createNoteEvents = () => {}
    //createNoteEvents = createNoteEnvents.bind(this);

    createNoteEvents(instance) {
        console.log(instance);
        let beatmap = instance.beatmap;
        for (let n = 0; n < beatmap.length; n++) {
            //console.log(n, beatmap[n][2]);
            let lineNbr = beatmap[n][1];
             if (beatmap[n][0] == 0) //simple notes
                instance.stackTimeout.push(setTimeout(instance.createSimpleNote, beatmap[n][2], lineNbr, instance, beatmap[n][2]));
            else { //long notes
                instance.stackTimeout.push(setTimeout(instance.createLongNote, beatmap[n][2], lineNbr, instance, beatmap[n][3]-beatmap[n][2]))
            }
        }
    }

    createSimpleNote(lineNbr, instance, time) {
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
                instance.onNoKeypress(instance.queuesTimestampToValidate[lineNbr], lineNbr, time);
            },
        });       
   }

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
        this.btns[i].active = true;
    }

    setBtnInactive(i) {
        this.btns[i].button.setTexture("btnInactive");
        this.btns[i].active = false;
    }

    displayPerfectFlash(i){
        console.log("perfect: "+i);
        let flash = this.add.sprite(this.calcLineXFromY(i, this.height-this.btnYOffset), this.height-this.btnYOffset, "flash");
        flash.setScale(3,3);
        setTimeout(()=>{flash.destroy()}, this.flashLifeTime);
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

    playSlideSound(){
        this.sound.play("slideSound");
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
        switch(precisionMultiplier){
            case 1:
                this.nbrHits += 0.5; // x1 -> 50%
                break;
            /*case 2: 
                this.nbrHits += 0.8; // x2 -> 80%
                break;*/
            default:
                this.nbrHits += 1; // x2+ -> 100% + flash animation
                this.displayPerfectFlash(note.line);
        }
    }

    /**
     * push into queuesTimestampToValidate[lineNbr] a new simple note and increment this note'score every 100ms
     * only if the button wasn't active
     * @param {*} lineNbr, the line's number of the simple note 
     * @param {*} follower, the follower created 
     * @param {*} instance, this 
     */
    setFollowerToValidate(lineNbr, follower, instance) {
        let note = {follower:follower, intervalID:undefined, score:1, line:lineNbr};
        instance.queuesTimestampToValidate[lineNbr].push(note);
        if (!instance.btns[lineNbr].active) {
            console.log("push single");
            let intervalID = setInterval(function() {note.score++}, 100); //TODO GIVE MORE POINTS AT MIDDLE
            note.intervalID = intervalID;
            instance.stackInterval.push(intervalID); 
        }
    }

    /**
     * push into queuesTimestampToValidate[lineNbr] a new long note 
     * if the button was active before push less point is given
     * @param {*} lineNbr, the line's number of the long note
     * @param {*} instance, this
     * @param {*} end, the time the long note should stay clickable
     */
    setLongFollowerToValidate(lineNbr, instance, end) {
        let checkTime = 250;
        if (instance.btns[lineNbr].active)
            checkTime = 500;
        let note = {follower:undefined, intervalID:undefined, score:0};
        instance.queuesTimestampToValidate[lineNbr].push(note);
        console.log("push long");
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
            note.score += instance.longNoteIncrease
            instance.playSlideSound();
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
        let percent = Math.round(instance.nbrHits/beatmap.length*10000)/100;
        console.log("Your precision is: " + percent + "%");

        instance.add.text(100, 300, "Game Over", { font: '48px Arial', fill: '#000000' });
        instance.add.text(100, 350, "Précision: " + percent + "%", { font: '24px Arial', fill: '#000000' })

        let note;
        if (percent == 100) {
            note = "S++";
        } else if (percent >= 95) {
            note = "S+";
        } else if (percent >= 90) {
            note = "S";
        } else if (percent >= 80) {
            note = "A";
        } else if (percent >= 60) {
            note = "B";
        } else if (percent >= 50) {
            note = "C";
        } else if (percent >= 35) {
            note = "D";
        } else if (percent >= 20) {
            note = "E";
        } else {
            note = "F";
        } 
        $('#gameModal').modal({show:true});
        let modalBody = document.querySelector("#contentGameModal");
        modalBody.innerHTML = "Précision : " + percent +"%</br>Note : " + note;
    }
}