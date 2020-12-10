import Phaser from 'phaser';
import simple_note from "../../img/game_assets/note_simple.png";
import long_note_head from "../../img/game_assets/note_longue_tete.png";
import long_note_body from "../../img/game_assets/note_longue_sentinelle.png";
const sNoteKey = "simple_note";
const lNoteHeadKey = "long_note_head";
const lNoteBodyKey = "long_note_body";

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

        //lines
        this.lines = [];

        //notes
        this.beatmap = []; //contains notes & sprites
        console.log(this.beatmap);

        //state
        this.preventAddNote = false;
        this.noteType = 0; //0 = simple; 1 = long
    }

    preload() {
        this.load.image(sNoteKey, simple_note);
        this.load.image(lNoteHeadKey, long_note_head);
        this.load.image(lNoteBodyKey, long_note_body);
    }

    create() {
        this.graphics = this.add.graphics();
        
        this.createLines();
        this.drawLines();

        this.sNoteGhost = this.add.sprite(-150,-150,sNoteKey);
        this.sNoteGhost.setTint(0x34eb3d);

        this.lNoteGhost = this.add.sprite(-150, -150, lNoteHeadKey);
        this.lNoteGhost.setTint(0x34eb3d);
        this.lNoteGhost.visible = false;

        this.input.on("pointermove", this.ghostFollow);
        this.input.on("pointerdown", this.addNote);
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
                console.log("add L");
        }
    }

    addSimpleNote(pointer) {
        if(!this.preventAddNote){
            console.log("add");
            let time = this.getTimeFromX(pointer.x);
            let lineNbr = this.getLineNumFromY(pointer.y);
            this.createSimpleNote(lineNbr, time);
        }
    }

    //lines
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
        this.updateNotes();
    }

    updateNotes() {
        this.beatmap.forEach(noteBundle => {
            if(noteBundle.note[0] === 0){//single note
                let time=noteBundle.note[2];
                noteBundle.sprite.setX(this.getXFromTime(time));
            }
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
        this.beatmap.push({
            note: note,
            sprite: sprite,
        })

        sprite.on("pointerdown", ()=>{
            this.deleteNote(sprite)
        });
        sprite.on("pointerover", ()=>{
            this.highlightNote(sprite);
        });
        sprite.on("pointerout", ()=>{
            this.removeNoteHighlight(sprite);
        });
    }

    createLongNote() {
        //TODO
    }

    deleteNote(sprite) {
        console.log("del");
        let i = this.findBMIndexFromSprite(sprite);
        if(i===-1) return;
        this.beatmap.splice(i, 1);
        sprite.destroy();
        this.allowAdd();
    }

    highlightNote(sprite) {
        sprite.setTint(0xD12B4E);
        this.preventAdd();
    }

    removeNoteHighlight(sprite){
        sprite.clearTint();
        this.allowAdd();
    }

    findBMIndexFromSprite(sprite) {
        for(let i=0; i<this.beatmap.length; i++){
            if(sprite === this.beatmap[i].sprite){
                return i;
            }
        }
        return -1;
    }

}
