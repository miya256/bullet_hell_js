import { wait, Point, calcAngle } from "../../util.js";
import { Stage } from "./stage.js";
import { Boss } from "../enemy/boss.js";

export class Stage2 extends Stage {
    constructor(manager) {
        super(manager);
    }

    *script() {
        yield* wait(120);
        let enemy = new Boss(this.manager, 600, 300, 10000);
        this.manager.addEnemy(enemy);
      
        while(enemy.alive) yield* wait(1);
    }
}