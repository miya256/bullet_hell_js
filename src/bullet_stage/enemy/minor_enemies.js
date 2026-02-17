import { canvas, ctx } from "../../canvas.js";
import { wait, Point, calcDistanceSquared, isOnScreen, calcAngle } from "../../util.js";
import { Enemy } from "./enemy.js";
import { StraightBullet } from "../bullet/bullet.js";

export class MinorEnemy extends Enemy {
    constructor(manager, hp, moveScript=null, shootScript=null) {
        super(manager, hp);
        this.moveScript = moveScript ? moveScript(this) : null;
        this.shootScript = shootScript ? shootScript(manager, this) : null;
    }
    update() {
        if (this.moveScript) this.moveScript.next();
        if (this.shootScript) this.shootScript.next();
        super.update();
    }
}

export const MoveScripts = {
    /**直線移動 */
    straight: function (startX, startY, speed, angle) {
        return function* (enemy) {
            enemy.pos = new Point(startX, startY);
            while (enemy.alive) {
                enemy.pos.x += speed * Math.cos(angle);
                enemy.pos.y += speed * Math.sin(angle);
                yield* wait(1);
            }
        }
    },
    /**指定位置まで行き、止まる */
    stopAt: function (targetX, targetY, waitFrame) {
        return function* (enemy) {
            enemy.pos = new Point(canvas.width+50, targetY);

            let speed = -25;
            while (enemy.pos.x > targetX) {
                enemy.pos.x += speed;
                speed = Math.min(speed + 1, -1);
                yield* wait(1);
            }enemy.pos = new Point(targetX, targetY);

            yield* wait(waitFrame);

            speed = 1;
            while (enemy.alive) {
                enemy.pos.x += speed;
                speed++;
                yield* wait(1);
            }
        }
    },
    /**ランダムな方向に、指定した距離速度で移動し、指定した時間待機 */
    random: function (dist, speed, waitFrame) {
        return function* (enemy) {
            enemy.pos = new Point(canvas.width, Math.random() * canvas.height);
            while (enemy.alive) {
                let angle, dx, dy;
                do {
                    angle = Math.random() * 2 * Math.PI;
                    dx = dist * Math.cos(angle);
                    dy = dist * Math.sin(angle);
                } while (!isOnScreen(enemy, canvas, 0, dx, dy));

                const target = new Point(enemy.pos.x + dx, enemy.pos.y + dy);
                const stepX = speed * Math.cos(angle);
                const stepY = speed * Math.sin(angle);

                while (calcDistanceSquared(enemy.pos, target) >= speed * speed) {
                    enemy.pos.x += stepX;
                    enemy.pos.y += stepY;
                    yield* wait(1);
                }
                enemy.pos = target;
                yield* wait(waitFrame);
            }
        }
    }
};

export const ShootScripts = {
    /**
     * だだだんって感じではなつ。n点バースト的な
     * @param id        弾の種類や見た目
     * @param target    自機や狙いたい座標
     * @param burst     何点バーストか
     * @param angleRange targetを中心に何度の範囲か(0~2pi)
     * @param way       その範囲で何方向に弾を撃つか(偶数なら自機には弾はこない)
     * @param speed     弾の速度
     * @param period    打ち終わってから次を打ち始めるまでのフレーム
     */
    burst: function (id, target, burst, angleRange, way, speed, period) {
        return function* (manager, enemy) {
            yield* wait(60);
            let angleStep = way > 1 ? angleRange / (way - 1) : 0;
            while (enemy.alive) {
                let centerAngle = calcAngle(enemy.pos, target.pos);
                for(let i=0; i<burst; i++) {
                    let angle = centerAngle - angleRange/2;
                    for (let j=0; j<way; j++) {
                        manager.addEnemyBullet(new StraightBullet(id, enemy.pos.x, enemy.pos.y, speed, angle));
                        angle += angleStep;
                    }
                    yield* wait(5);
                }
                yield* wait(period);
            }
        }
    }
}