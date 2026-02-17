import { wait, Point, calcAngle } from "../../util.js";
import { Stage } from "./stage.js";
import { MinorEnemy, MoveScripts, ShootScripts } from "../enemy/minor_enemies.js";

export class Stage1 extends Stage {
    constructor(manager) {
        super(manager);
    }

    *script() {
        yield* wait(120);
        let enemy;

        const angle = calcAngle(new Point(830, 10), this.manager.player.pos);
        for(let i=0; i<5; i++) {
            enemy = new MinorEnemy(
                this.manager, 5,
                MoveScripts.straight(830, 10, 7, angle),
                ShootScripts.burst(16, this.manager.player, 3, 0, 1, 10, 120)
            );
            this.manager.addEnemy(enemy);
            yield* wait(5);
        }yield* wait(60);

        enemy = new MinorEnemy(
            this.manager, 30,
            MoveScripts.stopAt(600, 100, 600),
            ShootScripts.burst(10, this.manager.player, 3, Math.PI/6, 5, 5, 120)
        );
        this.manager.addEnemy(enemy);
        while(enemy.alive) yield* wait(1);

        enemy = new MinorEnemy(
            this.manager, 30,
            MoveScripts.stopAt(600, 400, 600),
            ShootScripts.burst(25, this.manager.player, 10, Math.PI, 16, 5, 60)
        );
        this.manager.addEnemy(enemy);
        while(enemy.alive) yield* wait(1);

        enemy = new MinorEnemy(
            this.manager, 30,
            MoveScripts.stopAt(600, 300, 600),
            ShootScripts.burst(34, this.manager.player, 1, Math.PI*2, 21, 5, 30)
        );
        this.manager.addEnemy(enemy);
        while(enemy.alive) yield* wait(1);
    }
}