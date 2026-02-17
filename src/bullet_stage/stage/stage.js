import { canvas, ctx } from "../../canvas.js";

export class Stage {
    constructor(manager) {
        this.manager = manager;
        this.gen = this.script();
    }
    *script() {
        
    }

    update() {
        let {done} = this.gen.next();
        return done;
    }
    draw() {
        ctx.fillStyle = "#0099ff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    //ステージごとに異なる
    *clearMapScript() {

    }
    *failMapScript() {

    }
}