import { canvas, ctx } from "../../canvas.js";
import { Point, Circle, isOnScreen, toWorldPos, wait } from "../../util.js";
import { Enemy } from "./enemy.js";
import { Bullet } from "../bullet/bullet.js";

export class Boss extends Enemy{
    constructor(manager, x, y, hp) {
        super(manager, hp);
        this.pos = new Point(x, y);
        this.bullets = [];
        this.hitCircles = [new Circle(0, 0, 30)];
        this.script = this.shootScript1();
    }
    update() {
        if (this.invincibleFrame > 0 && isOnScreen(this, canvas, 100)) {
            this.invincibleFrame--;
            return;
        }

        if (this.hp <= 0) {
            this.bullets.forEach(b => b.alive = false);
            this.alive = false;
            return;
        }
        if (this.script) this.script.next();
    }
    draw() {
        ctx.fillStyle = "#ff0000";
        for (const circle of this.hitCircles) {
            const pos = toWorldPos(this, circle.center);
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, circle.r, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = "#000000";
        ctx.fillRect(495, 5, 300, 5);
        ctx.fillStyle = `rgb(${255 * (1 - this.hp/10000)},${255 * this.hp/10000},${0})`;
        ctx.fillRect(495, 5, 300 * this.hp/10000, 5)
    }
    *shootScript1() {
        yield* wait(60);
        const step = 15;
        while (this.alive) {
            let angleDeg = 90 - 18;
            let x = this.pos.x;
            let y = this.pos.y - 75;
            for(let i=0; i<5; i++) {
                for(let j=0; j<10; j++) {
                    let moveAngleDeg = 0;
                    for(let k=0; k<5; k++) {
                        const bullet = new Bullet(15, x, y);
                        bullet.angle = moveAngleDeg * Math.PI / 180;
                        this.bullets.push(bullet);
                        this.manager.addEnemyBullet(bullet);
                        moveAngleDeg += 72;
                    }
                    x += step * Math.cos(angleDeg * Math.PI / 180);
                    y += step * Math.sin(angleDeg * Math.PI / 180);
                    yield* wait(1);
                }
                angleDeg += 180 - 36;
            }
            yield* wait(60);

            for(let i=0; i<30; i++) {
                for(const bullet of this.bullets) {
                    bullet.pos.x += 3 * Math.cos(bullet.angle);
                    bullet.pos.y += 3 * Math.sin(bullet.angle);
                }
                yield* wait(1);
            }
            yield* wait(60);

            angleDeg = 90 - 18;
            let idx = 0;
            for(let i=0; i<5; i++) {
                for(let j=0; j<10; j++) {
                    for(let k=0; k<5; k++) {
                        const bullet = this.bullets[idx];
                        bullet.script = straight((angleDeg + j*9) * Math.PI / 180, 2)(bullet);
                        idx++;
                    }
                }
                angleDeg += 180 - 36;
            }this.bullets = [];
            yield* wait(1);
        }
    }
}

function straight(angle, speed) {
    return function* (bullet) {
        while(true) {
            bullet.pos.x += speed * Math.cos(angle);
            bullet.pos.y += speed * Math.sin(angle);
            yield* wait(1);
        }
    }
}