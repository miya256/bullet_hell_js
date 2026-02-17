import { canvas, ctx } from "../../canvas.js";
import { PLAYER } from "../../constants.js";
import { Circle, Point, toWorldPos } from "../../util.js";
import { ShockWave, StraightBullet } from "../bullet/bullet.js";

export class Player {
    constructor(manager, x, y) {
        this.manager = manager;
        this.pos = new Point(x, y);
        this.angle = 0;
        this.hitCircles = [new Circle(-5, 0, 5), new Circle(5, 0, 5)];
        this.speed = PLAYER.SPEED;
        this.hp = PLAYER.MAX_HP;
        this.alive = true;
        this.chargeFrame = 0;

        this.scripts = []; //弾の効果とか受ける
        //行動強制用と一部のパラメータだけ修飾用でわけたり？
        //まあいったんなかったことにします。
    }
    setScript(script) {
        this.scripts.push(script(this));
    }

    onHit(bullet) {
        this.hp -= bullet.damage;
    }
    update() {
        //スクリプトがあれば、そちらの処理を優先
        if (this.scripts.length > 0) {
            this.scripts = this.scripts.filter(script => !script.next().done);
            return;
        }

        if (this.hp <= 0) {
            this.alive = false;
            return;
        }
        this.speed = window.game.isPressedKey["ShiftLeft"] ? PLAYER.SLOW_SPEED : PLAYER.SPEED;

        if (window.game.isPressedKey["ArrowLeft"])  this.pos.x = Math.max(this.pos.x - this.speed, 0);
        if (window.game.isPressedKey["ArrowRight"]) this.pos.x = Math.min(this.pos.x + this.speed, canvas.width);
        if (window.game.isPressedKey["ArrowUp"])    this.pos.y = Math.max(this.pos.y - this.speed, 0)
        if (window.game.isPressedKey["ArrowDown"])  this.pos.y = Math.min(this.pos.y + this.speed, canvas.height);

        if (window.game.isPressedKey["KeyZ"] && window.game.frame % 5 == 0) {
            const bullet = new StraightBullet(10+window.game.frame%8, this.pos.x, this.pos.y, 20, 0);
            this.manager.addPlayerBullet(bullet);
        }
        if (window.game.isPressedKey["ShiftLeft"]) {
            this.chargeFrame++;
        } else {
            if (this.chargeFrame > 30) {
                const bullet = new ShockWave(this.pos.x, this.pos.y, 10, 0);
                this.manager.addPlayerBullet(bullet);
            }this.chargeFrame = 0;
        }
    }
    draw() {
        if (this.chargeFrame == 30) {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(this.pos.x+10, this.pos.y, 20, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.chargeFrame < 30) {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(this.pos.x+10, this.pos.y, this.chargeFrame/3, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.chargeFrame > 30 && window.game.frame/6&1) {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(this.pos.x+10, this.pos.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        //当たり判定表示
        ctx.fillStyle = "#00ff00";
        for (const circle of this.hitCircles) {
            const pos = toWorldPos(this, circle.center);
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, circle.r, 0, Math.PI * 2);
            ctx.fill();
        }
        
        //hp表示
        ctx.fillStyle = "#000000";
        ctx.fillRect(5, 5, 300, 5);
        ctx.fillStyle = `rgb(${255 * (1 - this.hp/PLAYER.MAX_HP)},${255 * this.hp/PLAYER.MAX_HP},${0})`;
        ctx.fillRect(5, 5, 300 * this.hp/PLAYER.MAX_HP, 5)
    }
}