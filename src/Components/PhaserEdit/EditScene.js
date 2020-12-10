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

        this.sNoteGhost = this.add.sprite(150,150,sNoteKey);
        this.sNoteGhost.setTint(0x34eb3d);

        this.input.on("pointermove", this.ghostFollow);

        this.createSimpleNote(1, 1000);
        this.createSimpleNote(2, 1500);
        this.createSimpleNote(3, 2000);
    }

    ghostFollow(pointer) {
        let sprite = this.scene.sNoteGhost;
        sprite.setX(pointer.x);
        let lineNum = this.scene.getLineNumFromY(this.scene.mapWindowYToSceneY(pointer.y));
        sprite.setY(this.scene.getYFromLineNum(lineNum));
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
        let pxPerMs = this.width / this.screenTimeSpan //number of pixels/ms
        return (time - this.currentTime) * pxPerMs;
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
        return Math.floor(y/this.width * 4); //4 = line cnt
    }

    //lineNum integer between 0 and 3
    getYFromLineNum(lineNum) {
        let spacing = 1/5 * this.height;
        return spacing*(1+lineNum);
    }

    setToLineStyle() {
        this.graphics.lineStyle(3, 0x000000);
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

    deleteNote(sprite) {
        console.log(this.beatmap);
        let i = this.findBMIndexFromSprite(sprite);
        if(i===-1) return;
        this.beatmap.splice(i, 1);
        sprite.destroy();
        console.log(this.beatmap);
    }

    highlightNote(sprite) {
        sprite.setTint(0xD12B4E);
    }

    removeNoteHighlight(sprite){
        sprite.clearTint();
    }

    findBMIndexFromSprite(sprite) {
        for(let i=0; i<this.beatmap.length; i++){
            if(sprite === this.beatmap[i].sprite){
                return i;
            }
        }
        return -1;
    }

    mapWindowYToSceneY(windowY) {
        let ratio = window.innerHeight/this.height;
        return (windowY)*ratio;
    }

}
