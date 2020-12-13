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
const beforeAfterRatio = 1/10; //time offset

export default class EditScene extends Phaser.Scene {
    constructor(width, height, duration) {
        super('game-scene');

        //proportions
        this.width = width;
        this.height = height;

        //time
        this.duration = duration;
        this.screenTimeSpan = 2500; //ms (time between oposing ends of the screen)
        this.xOffset = beforeAfterRatio*this.width; //px
        this.currentTime = 0; //ms (time at x=0)
        this.longNoteBodyStep = 7; //ms spacing between two body sprites (long note)

        //lines
        this.lines = [];
        this.gradLineSprites = [];

        //notes
        this.beatmap = []; //contains notes & sprites
        console.log(this.beatmap);

        //state
        this.visualizing = false;
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

        this.createGradationLines();

        this.createNowLine();
        this.drawNowLine();

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

    createNowLine() {
        let x = this.getXFromTime(this.currentTime);
        this.nowLine = this.add.path(x, 0);
        this.nowLine.lineTo(x, this.height);
    }

    drawLines() {
        this.setToLineStyle();
        for(let i=0; i<4; i++){
            this.lines[i].draw(this.graphics);
        }
    }

    drawNowLine() {
        this.setToNowLineStyle();
        this.nowLine.draw(this.graphics);
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

    startVisualizing() {
        this.headGhost.visible = true;
        this.tailGhost.visible = true;
        this.visualizing = true;
    }

    stopVisualizing() {
        this.headGhost.visible = false;
        this.tailGhost.visible = false;
        this.visualizing = false;
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
            let time = this.getTimeFromX(pointer.x);
            let lineNbr = this.getLineNumFromY(pointer.y);
            if(this.isAvailableForSimple(time, lineNbr)){
                console.log("add s");
                this.createSimpleNote(lineNbr, time);
            }
        }
    }

    addLongNote(pointer) {
        if(!this.preventAddNote){
            let timeStart = this.getTimeFromX(pointer.x);
            let lineNum = this.getLineNumFromY(pointer.y);
            if(this.isAvailableForSimple(timeStart, lineNum)){
                console.log("add L");
                this.preventAdd();
                this.currentLongNoteLine = lineNum;
                this.headGhost.setX(this.getXFromTime(timeStart));
                this.headGhost.setY(this.getYFromLineNum(lineNum));
                this.startVisualizing();
                this.input.once("pointerdown", (pointer) =>this.completeLongNote(pointer, timeStart));
            }
        }
    }

    completeLongNote(pointer, timeStart){
        let scene = this.scene.scene;
        if(scene.visualizing){
            let timeEnd = scene.getTimeFromX(pointer.x);
            let lineNum = scene.currentLongNoteLine;
            if(this.isAvailableForLong(timeStart, timeEnd, lineNum)) {
                console.log("complete");
                this.stopVisualizing();
                scene.allowAdd();
                if(timeStart < timeEnd){
                    scene.createLongNote(scene.currentLongNoteLine, timeStart, timeEnd);
                }else {
                    if(timeStart != timeEnd){
                        scene.createLongNote(scene.currentLongNoteLine, timeEnd, timeStart); // end before start (swap)
                    }else {
                        console.log("impossible");
                    }
                }
            }
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
        let res = (time - this.currentTime) * pxPerMs;
        return res + this.xOffset;
    }

    getTimeFromX(x) {
        let msPerPx = this.screenTimeSpan / this.width;
        return this.currentTime + ((x - this.xOffset)*msPerPx);
    }

    //lineNum integer between 0 and 3
    getYFromLineNum(lineNum) {
        let spacing = 1/5 * this.height;
        return spacing*(1+lineNum);
    }

    setToLineStyle() {
        this.graphics.lineStyle(3, 0x000000);
    }

    setToNowLineStyle() {
        this.graphics.lineStyle(4, 0xFF0000);
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

    setNoteType(type){
        console.log("SCENE set type: ", type)
        if(type === 0 || type === 1){
            this.noteType = type;
            switch(type) {
                case 0:
                    this.sNoteGhost.visible = true;
                    this.lNoteGhost.visible = false;
                    this.stopVisualizing(); //edge case
                    this.allowAdd();
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

    //returns 
    isAvailableForSimple(time, lineNum) {
        if(time < 0){
            return false;
        }
        for(let i=0; i<this.beatmap.length; i++) {
            let note = this.beatmap[i].note;
            console.log("compare ", note);
            if(note[1] === lineNum) {
                if(note[0] === 0){ //simple x simple
                    if(note[2] === time) {
                        console.log("return false");
                        return false;
                    }
                }else { //simple x long 
                    if(this.overlapsSingleLong(time, note[2], note[3])) {
                        console.log("return false");
                        return false;
                    }
                }
            }
        }
        console.log("return true");
        return true;
    }

    isAvailableForLong(timeStart, timeEnd, lineNum) {
        if(timeStart < 0 || timeEnd < 0){
            return false;
        }
        for(let i=0; i<this.beatmap.length; i++) {
            let note = this.beatmap[i].note;
            console.log("compare ", note);
            if(note[1] === lineNum){
                if(note[0] === 0) { //long x simple
                    if(this.overlapsSingleLong(note[2], timeStart, timeEnd)) {
                        console.log("return false");
                        return false;
                    }
                }else { //long x long
                    if(this.overlapsLongLong(timeStart, timeEnd, note[2], note[3])) {
                        console.log("return false");
                        return false;
                    }
                }
            }
        }
        console.log("return true");
        return true;
    }

    //checks if target is between start & end
    overlapsSingleLong(target, start, end) {
        let min ,max;
        if(start < end){
            min = start;
            max = end;
        }else {
            min = end;
            max = start;
        }
        return min <= target && target <= max;
    }

    //checks if 2 timespans are overlaping
    overlapsLongLong(targetStart, targetEnd, start, end) {
        if(this.overlapsSingleLong(targetStart, start, end)) return true;
        if(this.overlapsSingleLong(targetEnd, start, end)) return true;
        
        //second time in case target covers start+end
        if(this.overlapsSingleLong(start, targetStart, targetEnd)) return true;
        if(this.overlapsSingleLong(end, targetStart, targetEnd)) return true;
        return false;
    }

    getBeatmap(){
        let res = [];
        this.beatmap.forEach(noteBundle => {
            res.push(noteBundle.note);            
        });
        return res;
    }

    //add notes to beatmap
    loadBeatmap(noteList){
        for(let i=0; i<noteList.length; i++){
            let note = noteList[i];
            let noteType = note[0];
            let lineNum = note[1];
            switch(noteType){
                case 0: //simple
                    let time = note[2];
                    this.createSimpleNote(lineNum, time);
                    break;
                case 1: //long
                    let timeStart = note[2];
                    let timeEnd = note[3];
                    this.createLongNote(lineNum, timeStart, timeEnd);
            }
        }
    }

}
