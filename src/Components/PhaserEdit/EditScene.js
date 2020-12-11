import Phaser from 'phaser';
import simple_note from "../../img/game_assets/note_simple.png";
import long_note_head from "../../img/game_assets/note_longue_tete.png";
import long_note_body from "../../img/game_assets/note_longue_sentinelle.png";
import primary_gradation from "../../img/game_assets/primary_gradation.png";
import secondary_gradation from "../../img/game_assets/secondary_gradation.png";

const sNoteKey = "simple_note";
const lNoteHeadKey = "long_note_head";
const lNoteBodyKey = "long_note_body";
const pGradKey = "primary_gradation_line";
const sGradKey = "secondary_gradation_line";

const addColor = 0x34EB3D;
const delColor = 0xD12B4E;
const visualizeColor = 0xFFFF00;

const gradLineImgHeight = 200;

export default class EditScene extends Phaser.Scene {
    constructor(width, height, duration) {
        super('game-scene');

        //proportions
        this.width = width;
        this.height = height;

        //time
        this.duration = duration;
        this.screenTimeSpan = 2500; //ms (time between oposing ends of the screen)
        this.currentTime = 0; //ms (time at x=0)
        this.longNoteBodyStep = 7; //ms spacing between two body sprites (long note)

        //lines
        this.lines = [];
        this.gradLineSprites = [];

        //notes
        this.beatmap = []; //contains notes & sprites
        console.log(this.beatmap);

        //state
        this.preventAddNote = false;
        this.noteType = 0; //0 = simple; 1 = long

        this.primaryGradationDelay = 1000; //ms between 2 primary grad. lines
        this.secondaryGradationNumber = 3; //number of sec. grad. lines between 2 primary
        this.gradLineScale = this.height / gradLineImgHeight;
    }

    preload() {
        this.load.image(sNoteKey, simple_note);
        this.load.image(lNoteHeadKey, long_note_head);
        this.load.image(lNoteBodyKey, long_note_body);
        this.load.image(pGradKey, primary_gradation);
        this.load.image(sGradKey, secondary_gradation);
    }

    create() {
        this.graphics = this.add.graphics();
        
        this.createLines();
        this.drawLines();

        //for adding notes
        this.sNoteGhost = this.add.sprite(-150,-150,sNoteKey);
        this.sNoteGhost.setTint(addColor);

        //for adding long notes
        this.headGhost = this.add.sprite(0, 0, lNoteHeadKey);
        this.headGhost.setTint(visualizeColor);
        this.headGhost.visible = false;
        this.tailGhost = this.add.sprite(0, 0, lNoteBodyKey);
        this.tailGhost.setTint(visualizeColor);
        this.tailGhost.visible = false;
        this.currentLongNoteLine = 0;

        this.lNoteGhost = this.add.sprite(0, 0, lNoteHeadKey);
        this.lNoteGhost.setTint(addColor);
        this.lNoteGhost.visible = false;

        this.createGradationLines();

        this.input.on("pointermove", this.ghostFollow);
        this.input.on("pointermove", this.tailGhostFollow);
        this.input.on("pointerdown", this.addNote);
    }

    createLines() {
        for(let i=0; i<4; i++){
            let y=this.getYFromLineNum(i);
            this.lines[i] = this.add.path(0, y);
            this.lines[i].lineTo(this.width, y);
        }
    }

    drawLines() {
        this.setToLineStyle();
        for(let i=0; i<4; i++){
            this.lines[i].draw(this.graphics);
        }
    }

    createGradationLines() {
        let timeIncrement = this.primaryGradationDelay / (1+this.secondaryGradationNumber);
        for(let time=0; time < this.duration; time += timeIncrement){
            let textureKey;
            if(time%this.primaryGradationDelay === 0){
                textureKey = pGradKey;
            }else{
                textureKey = sGradKey;
            }
            let bundle = {
               time: time,
               sprite: this.createOneGradLine(textureKey, time),
            }
            this.gradLineSprites.push(bundle);
        }
    }

    //returns the new sprite
    createOneGradLine(textureKey, time){
        let x = this.getXFromTime(time);
        let y = this.height/2;
        let res = this.add.sprite(x, y, textureKey);
        res.setScale(1, this.gradLineScale);
        return res;
    }

    ghostFollow(pointer) {
        let simpleSprite = this.scene.sNoteGhost;
        let longSprite = this.scene.lNoteGhost;
        let lineNum = this.scene.getLineNumFromY(pointer.y);

        simpleSprite.setX(pointer.x);
        simpleSprite.setY(this.scene.getYFromLineNum(lineNum));

        longSprite.setX(pointer.x);
        longSprite.setY(this.scene.getYFromLineNum(lineNum));
    }

    setGhostVisible() {
        switch(this.noteType) {
            case 0:
                this.sNoteGhost.visible = true;
                this.lNoteGhost.visible = false;
                break;
            case 1:
                this.sNoteGhost.visible = false;
                this.lNoteGhost.visible = true;
        }
    }

    setGhostInvisible() {
        this.sNoteGhost.visible = false;
        this.lNoteGhost.visible = false;
    }

    preventAdd() {
        this.setGhostInvisible();
        this.preventAddNote = true;
    }

    allowAdd() {
        this.setGhostVisible();
        this.preventAddNote = false;
    }

    addNote(pointer) {
        let scene = this.scene;
        switch(scene.noteType) {
            case 0:
                scene.addSimpleNote(pointer);
                break;
            case 1:
                scene.addLongNote(pointer);
        }
    }

    addSimpleNote(pointer) {
        if(!this.preventAddNote){
            console.log("add s");
            let time = this.getTimeFromX(pointer.x);
            let lineNbr = this.getLineNumFromY(pointer.y);
            this.createSimpleNote(lineNbr, time);
        }
    }

    addLongNote(pointer) {
        if(!this.preventAddNote){
            console.log("add L");
            this.preventAdd();
            let timeStart = this.getTimeFromX(pointer.x);
            let lineNum = this.getLineNumFromY(pointer.y);
            this.currentLongNoteLine = lineNum;
            this.headGhost.setX(this.getXFromTime(timeStart));
            this.headGhost.setY(this.getYFromLineNum(lineNum));
            this.headGhost.visible = true;
            this.tailGhost.visible = true;
            this.input.once("pointerdown", (pointer) =>this.completeLongNote(pointer, timeStart));
        }
    }

    completeLongNote(pointer, timeStart){
        console.log("complete");
        let scene = this.scene.scene;
        console.log(scene);
        let timeEnd = scene.getTimeFromX(pointer.x);
        scene.headGhost.visible = false;
        scene.tailGhost.visible = false;
        scene.allowAdd();
        if(timeStart < timeEnd){
            scene.createLongNote(scene.currentLongNoteLine, timeStart, timeEnd);
        }else {
            console.log("imossible");
        }
    }

    //always follows pointer (but usually invisible)
    tailGhostFollow(pointer) {
        let scene = this.scene;
        let y = scene.getYFromLineNum(scene.currentLongNoteLine);
        let x = pointer.x;
        scene.tailGhost.setX(x);
        scene.tailGhost.setY(y);
    }

    getXFromTime(time) {
        let pxPerMs = this.width / this.screenTimeSpan; //number of pixels/ms
        return (time - this.currentTime) * pxPerMs;
    }

    getTimeFromX(x) {
        let msPerPx = this.screenTimeSpan / this.width;
        return this.currentTime + (x*msPerPx);
    }

    //changes currentTime and updates display (to be called by EditPage)
    updateCurrentTime(time) {
        this.currentTime = time;
        this.updateGradLines();
        this.updateNotes();
    }

    updateNotes() {
        this.beatmap.forEach(noteBundle => {
            if(noteBundle.note[0] === 0){//single note
                let time=noteBundle.note[2];
                noteBundle.sprite.setX(this.getXFromTime(time));
            }else { //note longue
                console.log("long: ", noteBundle);
                let timeStart = noteBundle.note[2];
                let timeEnd = noteBundle.note[3];
                noteBundle.sprite.setX(this.getXFromTime(timeStart)); //place head
                let i=0;
                for(let time =timeStart+this.longNoteBodyStep; time <= timeEnd; time+=this.longNoteBodyStep) {
                    noteBundle.body[i].setX(this.getXFromTime(time)); //place body part
                    i++;
                }
            }
        });
    }

    updateGradLines(){
        this.gradLineSprites.forEach(bundle => {
            bundle.sprite.setX(this.getXFromTime(bundle.time));
        });
    }

    getLineNumFromY(y) {
        let res = Math.floor(y*(4/this.height));
        if(res < 0) res = 0;
        if(res > 3) res = 3;
        return res;
    }

    //lineNum integer between 0 and 3
    getYFromLineNum(lineNum) {
        let spacing = 1/5 * this.height;
        return spacing*(1+lineNum);
    }

    setToLineStyle() {
        this.graphics.lineStyle(3, 0x000000);
    }

    setNoteType(type){
        console.log("SCENE set type: ", type)
        if(type === 0 || type === 1){
            this.noteType = type;
            switch(type) {
                case 0:
                    this.sNoteGhost.visible = true;
                    this.lNoteGhost.visible = false;
                    break;
                case 1:
                    this.sNoteGhost.visible = false;
                    this.lNoteGhost.visible = true;
            }
        }
    }

    createSimpleNote(lineNum, time){
        let note = [0, lineNum, time];
        let sprite = this.add.sprite(this.getXFromTime(time), this.getYFromLineNum(lineNum), sNoteKey).setInteractive();
        let noteBundle = {
            note: note,
            sprite: sprite,
        }
        this.beatmap.push(noteBundle);

        sprite.on("pointerdown", ()=>{
            this.deleteSimpleNote(sprite)
        });
        sprite.on("pointerover", ()=>{
            this.highlightSimpleNote(sprite);
        });
        sprite.on("pointerout", ()=>{
            this.removeSimpleNoteHighlight(sprite);
        });
    }

    createLongNote(lineNum, timeStart, timeEnd) {
        let note = [1, lineNum, timeStart, timeEnd];
        
        let body = [];
        for(let time=timeStart + this.longNoteBodyStep; time <= timeEnd; time += this.longNoteBodyStep){
            body.push(this.add.sprite(this.getXFromTime(time), this.getYFromLineNum(lineNum), lNoteBodyKey));
        }

        let head = this.add.sprite(this.getXFromTime(timeStart), this.getYFromLineNum(lineNum), lNoteHeadKey).setInteractive(); //head after body so head is in front (not covered)

        let noteBundle = {
            note: note,
            sprite: head,
            body: body,
        }
        console.log(noteBundle);
        this.beatmap.push(noteBundle);
        
        head.on("pointerdown", ()=>{
            this.deleteLongNote(head);
        });
        head.on("pointerover", ()=>{
            this.highlightLongNote(head, body);
        });
        head.on("pointerout", ()=>{
            this.removeLongNoteHighlight(head, body);
        });
    }

    deleteSimpleNote(sprite) {
        console.log("del s");
        let i = this.findBMIndexFromSprite(sprite);
        if(i===-1) {
            console.log("ERROR: note not found");
        }else {
            this.beatmap.splice(i, 1);
        }
        sprite.destroy();
        this.allowAdd();
    }

    deleteLongNote(sprite) {
        console.log("del L");
        let i = this.findBMIndexFromSprite(sprite)
        let body;
        if(i === -1){
            console.log("ERROR: note not found");
            return;
        }else {
            body = this.beatmap[i].body;
            this.beatmap.splice(i, 1);
            body.forEach(bSprite => {
                bSprite.destroy();
            });
        }
        sprite.destroy();
        this.allowAdd();
    }

    highlightSimpleNote(sprite) {
        sprite.setTint(delColor);
        this.preventAdd();
    }

    removeSimpleNoteHighlight(sprite){
        sprite.clearTint();
        this.allowAdd();
    }

    highlightLongNote(sprite, body){
        sprite.setTint(delColor);
        this.preventAdd();
        body.forEach(bSprite => {
            bSprite.setTint(delColor);
        });
    }

    removeLongNoteHighlight(sprite, body){
        sprite.clearTint();
        this.allowAdd();
        body.forEach(bSprite => {
            bSprite.clearTint();
        });
    }

    findBMIndexFromSprite(sprite) {
        for(let i=0; i<this.beatmap.length; i++){
            if(sprite === this.beatmap[i].sprite){
                return i;
            }
        }
        return -1;
    }

    getBeatmap(){
        let res = [];
        this.beatmap.forEach(noteBundle => {
            res.push(noteBundle.note);            
        });
        return res;
    }

}
