import { canvas, ctx } from "../../canvas.js";
import { Circle, isOnScreen, toWorldPos } from "../../util.js";

export class Enemy {
    constructor(manager, hp) {
        this.manager = manager;
        this.hp = hp;
        this.pos = null;
        this.angle = 0
        this.hitCircles = [new Circle(0, 0, 10)];
        this.alive = true;
        this.invincibleFrame = 12; //画面内に入って0.2秒は無敵
    }
    onHit(bullet) {
        if (this.invincibleFrame > 0) return;
        this.hp -= bullet.damage;
    }
  
    update() {
        if (this.invincibleFrame > 0 && isOnScreen(this, canvas, 100)) {
            this.invincibleFrame--;
            return;
        }

        if (this.hp <= 0) {
            this.alive = false;
        }
        if (!isOnScreen(this, canvas, 100)) {
            this.alive = false;
        }
    }
    draw() {
        ctx.fillStyle = "#ff0000";
        for (const circle of this.hitCircles) {
            const pos = toWorldPos(this, circle.center);
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, circle.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}