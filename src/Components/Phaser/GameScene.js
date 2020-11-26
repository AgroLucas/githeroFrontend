import Phaser from 'phaser'

export default class GameScene extends Phaser.Scene
{
    
	constructor()
	{
		super('game-scene')
	}

	preload()
	{
	}

	create()
	{
        let width = 1600; //hardcoded -> TODO to find in properties ?
        let height = 900; //hardcoded -> TODO to find in properties ?

        this.graphics = this.add.graphics();
        this.graphics.lineStyle(2,"#000000");
        this.graphics.fillStyle(0xff0000);

        this.createLines(width, height);

        let side=60;
        this.createSquareBtns(height, side, width);

        this.drawAll();
    }


    
    createSquareBtns(height, side, width) {
        let y = height - side;
        this.squareBtns = [];
        for (let i = 0; i < 4; i++) {
            let x = calcLineX(i, 150, width) - side / 2;
            this.squareBtns[i] = new Phaser.Geom.Rectangle(x, y, side, side);
        }
    }

    createLines(width, height) {
        this.lines = [];
        for (let i = 0; i < 4; i++) {
            this.lines[i] = this.add.path(calcLineX(i, 50, width), 0);
            this.lines[i].lineTo(calcLineX(i, 150, width), height);
        }
    }

    drawAll() {
        //lines
        for(let i=0; i<4; i++){
            this.lines[i].draw(this.graphics);
        }

        //square buttons
        for(let i=0; i<4; i++){
            this.graphics.fillRectShape(this.squareBtns[i]);
        }
    }
}

/**
 * returns the x coordonate of the line to draw
 * @param i the number of the line (from left to right )
 * @param deltaX the distance between 2 lines
 * @param sceneWidth width of the scene 
 */
const calcLineX = (i, deltaX, sceneWidth) => {
    let center = sceneWidth/2;
    let coeficients = [-1.5, -0.5, 0.5, 1.5];
    return center + coeficients[i]*deltaX;
}



