import { canvas, ctx } from "./canvas.js";
import { SCENE, PATH } from "./constants.js";
import { Map } from "./map/map.js";
import { BulletStage } from "./bullet_stage/BulletStage.js";
import { loadBulletData } from "./loader.js";

//Gameクラスにまとめよう
//カプセルかしましょう

canvas.width = 800;
canvas.height = 600;

class Game {
    constructor() {
        this.isPressedKey = {};
        document.addEventListener('keydown', (event) => this.isPressedKey[event.code] = true);
        document.addEventListener('keyup', (event) => this.isPressedKey[event.code] = false);
        this._frame = 0;

        this._scene = null;
        this._manager = null;
    }

    get frame() { return this._frame; }

    play() {
        document.getElementById('titleScene').style.display = 'none';
        canvas.style.display = 'block';

        this.startMap();

        this.gameLoop();
    }
    gameLoop() {
        let mapScript = this._manager.update();
        if (mapScript) {
            this.startMap();
        }
        this._manager.draw();
        
        switch (this._scene) {
            case SCENE.MAP:
                //マップのノードにステージのファイルパスをもたせて、それを動的にimport
                if (this.isPressedKey["Enter"]) {
                    //弾幕ステージなのかミニゲームなのか判定もする
                    this.startBulletStage();
                }
                break;
            case SCENE.BULLET_STAGE:
                break;
        }

        this._frame++;
        requestAnimationFrame(() => this.gameLoop());
    }

    startMap(script=null) {
        this._scene = SCENE.MAP;
        this._manager = new Map(script);
    }
    startBulletStage() {
        this._scene = SCENE.BULLET_STAGE;
        this._manager = new BulletStage();
    }
}


export let bulletData = null;

async function loadData() {
    bulletData = await loadBulletData(PATH.BULLET_DATA)
}

window.game = new Game();

document.getElementById('playButton').addEventListener('click', async () => {
    await loadData();      // ここでロード完了を待つ
    window.game.play();    // データが揃った状態でゲーム開始
});