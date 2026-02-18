import { canvas, ctx } from "../canvas.js";
import { Point } from "../util.js";

const img = new Image();
img.src = "./img/map.png";

class Stage {
    static LOCKED = 0;
    static UNCLEARED = 1;
    static CLEARED = 2;

    constructor(pos, state) {
        this.pos = pos;
        this.state = state;
    }
}

//ステージの情報に、クリア後のマップの演出のスクリプトを持たせる
let stages = [
    new Stage(new Point(0, 300), Stage.CLEARED),
    new Stage(new Point(400, 300), Stage.UNCLEARED),
    new Stage(new Point(800, 300), Stage.LOCKED),
    new Stage(new Point(1200, 300), Stage.LOCKED),
    new Stage(new Point(1600, 300), Stage.LOCKED)
];

export class Map {
    constructor(script=null) { //scriptでステージ解放の演出とか
        this.player = new Player(0, 0);
    }
    update() {
        this.player.update();
    }
    draw() {
        const center = this.player.pos;
        ctx.fillStyle = "#0000ff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let stageSize = 100;

        for (let stage of stages) {
            let sx, sy;
            if (stage.state == Stage.LOCKED) { sx = 128; sy = 0; }
            if (stage.state == Stage.UNCLEARED) { sx = 64; sy = 0; }
            if (stage.state == Stage.CLEARED) { sx = 0; sy = 0; }

            let dx = stage.pos.x - center.x + 350;
            let dy = stage.pos.y - center.y;

            ctx.drawImage(img, sx, sy, 64, 64, dx, dy, stageSize, stageSize);
        }
    }
}

export class Player {
    constructor(x, y) {
        this.pos = new Point(x, y);
        this.dir = 0;
    }
    update() {
        if (window.game.isPressedKey["ArrowLeft"]) { this.dir = -1; }
        if (window.game.isPressedKey["ArrowRight"]) { this.dir = 1; }
        this.pos.x += this.dir * 20;
        this.pos.x = Math.min(Math.max(this.pos.x, 0), 1600);
        if (this.pos.x % 400 == 0) { this.dir = 0; }
    }
    draw() {
        
    }

}
