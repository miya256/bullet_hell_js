import { canvas, ctx } from "../canvas.js";
import { isColliding, isOnScreen, wait } from "../util.js";
import { Player } from "./player/player.js";
import { Stage1 } from "./stage/stage1.js";
import { Stage2 } from "./stage/stage2.js";

class Collision {
    static handle(
        player,
        enemies,
        playerBullets,
        enemyBullets
    ) {
        Collision.handleBullet(playerBullets, enemies);
        Collision.handleBullet(enemyBullets, [player]);
    }

    static handleBullet(bullets, actors) {
        for (let bullet of bullets) {
            if (!bullet.alive) continue
            for (let actor of actors) {
                if (!actor.alive) continue
                if (isColliding(bullet, actor)) {
                    actor.onHit(bullet);
                    bullet.onHit();
                }
            }
        }
    }
}

export class BulletStage {
    static PLAY = "play";
    static CLEAR = "clear";
    static FAIL = "fail";
    static PAUSE = "pause";

    constructor() {
        this._state = BulletStage.PLAY;
        this._stage = new Stage2(this);
        this._player = new Player(this, 100, 300);
        this._enemies = [];
        this._playerBullets = [];
        this._enemyBullets = [];

        this.updateClear = this.updateClearScript();
        this.drawClear = this.drawClearScript();
        this.updateFail = this.updateFailScript();
        this.drawFail = this.drawFailScript();
    }
    get player() { return this._player; }
    
    addEnemy(enemy) {
        this._enemies.push(enemy);
    }
    addPlayerBullet(bullet) {
        this._playerBullets.push(bullet);
    }
    addEnemyBullet(bullet) {
        this._enemyBullets.push(bullet);
    }

    update() {
        switch (this._state) {
            case BulletStage.PLAY:
                this.updatePlay();
                return null;
            case BulletStage.PAUSE:
                return null;
            case BulletStage.CLEAR:
                if (this.updateClear.next().done) {
                    return this._stage.clearMapScript;
                }return null;
            case BulletStage.FAIL:
                if (this.updateFail.next().done) {
                    return this._stage.failMapScript;
                }return null;
        }
    }
    draw() {
        switch (this._state) {
            case BulletStage.PLAY:
                this.drawPlay();
                return;
            case BulletStage.PAUSE:
                return;
            case BulletStage.CLEAR:
                this.drawClear.next();
                return;
            case BulletStage.FAIL:
                this.drawFail.next();
                return;
        }
    }

    updatePlay() {
        const isClear = this._stage.update();
        if (isClear) {
            this._state = BulletStage.CLEAR;
            return;
        }
        this._player.update();
        if (!this._player.alive) {
            this._state = BulletStage.FAIL;
            return;
        }
        this._enemies.forEach(e => e.update());
        this._playerBullets.forEach(b => b.update());
        this._enemyBullets.forEach(b => b.update());

        Collision.handle(
            this._player,
            this._enemies,
            this._playerBullets,
            this._enemyBullets
        );

        this._playerBullets = this._playerBullets.filter(b => b.alive);
        this._enemyBullets = this._enemyBullets.filter(b => b.alive);
        this._enemies = this._enemies.filter(e => e.alive);
    }
    drawPlay() {
        this._stage.draw();
        this._player.draw();
        this._enemies.forEach(e => e.draw());
        this._playerBullets.forEach(b => b.draw());
        this._enemyBullets.forEach(b => b.draw());
    }

    *updateClearScript() {
        yield* wait(120);
    }
    *drawClearScript() {
        //クリアの演出
        //残ってる敵や弾のアイテム化、アイテムの吸収、クリアの文字とスコア表示
        //スコアは一定時間表示して、自動でマップに戻るように
        //マップからは、最新のスコアと最高スコアをみれるように
        for(let i=0; i<120; i++) {
            ctx.fillStyle = "#ffff00"
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 文字設定
            ctx.font = "48px Arial";
            ctx.fillStyle = "#000000";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // 文字描画（画面中央）
            ctx.fillText("CLEAR!", canvas.width/2, canvas.height/2);
            yield* wait(1);
        }
    }

    *updateFailScript() {
        while (isOnScreen(this._player, canvas)) {
            this._enemies.forEach(e => e.update());
            this._playerBullets.forEach(b => b.update());
            this._enemyBullets.forEach(b => b.update());
            this._player.pos.x -= 2;
            this._player.pos.y += 4;
            yield* wait(1);
        }yield* wait(120);
    }
    *drawFailScript() {
        while (isOnScreen(this._player, canvas)) {
            this.drawPlay();
            yield* wait(1);
        }
        while (true) {
            ctx.fillStyle = "#555555"
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 文字設定
            ctx.font = "48px Arial";
            ctx.fillStyle = "#000000";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // 文字描画（画面中央）
            ctx.fillText("GAME OVER!", canvas.width/2, canvas.height/2);
            yield* wait(1);
        }
    }
}