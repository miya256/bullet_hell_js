import { canvas, ctx } from "../../canvas.js";
import { Circle, Point, isOnScreen, toWorldPos } from "../../util.js";
import { PATH } from "../../constants.js";
import { bulletData } from "../../main.js";

/*
0:赤, 1:橙, 2:黄, 3:緑, 4:水, 5:青, 6:紫, 7:白

0: 粒弾
1: 小弾
2: 枠小弾
3: 中弾
*/

const bulletImage = new Image();
bulletImage.src = PATH.BULLET_IMAGE;

export class Bullet {
    constructor(id, x, y, script=null) {
        this.pos = new Point(x, y);
        this.angle = 0;
        this.alive = true;
        this.script = script ? script(this) : null; //scriptはジェネレータ

        this.data = bulletData[id];
        this.hitCircles = this.data.hitCircles;
        this.damage = this.data.damage;

    }
    onHit() {
        this.alive = false;
    }

    update() {
        if (this.script) this.script.next();
        if (!isOnScreen(this, canvas, 100)) {
            this.alive = false;
        }
    }
    draw() {
        const dx = this.pos.x - this.data.dw / 2;
        const dy = this.pos.y - this.data.dh / 2;
        ctx.drawImage(
            bulletImage,
            this.data.sx, this.data.sy, this.data.sw, this.data.sh,
            dx, dy, this.data.dw, this.data.dh
        );

        //当たり判定の表示（デバッグ用）
        /*
        ctx.fillStyle = "#ff0000"
        for (const circle of this.hitCircles) {
            const pos = toWorldPos(this, circle.center);
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, circle.r, 0, Math.PI * 2);
            ctx.fill();
        }*/
    }
}

export class ShockWave {
    constructor(x, y, speed, angle) {
        this.pos = new Point(x, y);
        this.speed = speed;
        this.angle = angle;
        this.alive = true;
        this.damage = 50;
        this.hitCircles = [];
        for(let i=0; i<30; i++) {
            this.hitCircles.push(new Circle(0, 0, 10));
        }
    }
    onHit() {
        
    }

    update() {
        let angleDeg = -this.hitCircles.length/2;
        for (const circle of this.hitCircles) {
            const angle = this.angle + angleDeg * Math.PI / 180;
            circle.center.x += this.speed * Math.cos(angle);
            circle.center.y += this.speed * Math.sin(angle);
            angleDeg++;
        }
    }
    draw() {
        //当たり判定の表示（デバッグ用）
        ctx.fillStyle = "#ff0000"
        for (const circle of this.hitCircles) {
            const pos = toWorldPos(this, circle.center);
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, circle.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

export class StraightBullet extends Bullet {
    constructor(id, x, y, speed, angle, accel=0, script=null) {
        super(id, x, y, script);
        this.speed = speed;
        this.accel = accel;
        this.angle = angle;
    }
    update() {
        super.update();
        this.pos.x += this.speed * Math.cos(this.angle);
        this.pos.y += this.speed * Math.sin(this.angle);
        this.speed += this.accel;
    }
}

