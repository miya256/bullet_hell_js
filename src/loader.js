import { Circle } from "./util.js";

export async function loadBulletData(path) {
    const res = await fetch(path);
    const text = await res.text();
    const lines = text.trim().split("\r\n");
    const header = lines[0].split(",");

    const bulletData = {};

    for (const line of lines.slice(1)) {
        const values = line.split(",").map(Number);
        const obj = {};

        for (let i=1; i<8; i++) {
            obj[header[i]] = values[i];
        }

        let hitCircles = [];
        for (let i=8; i<values.length; i+=3) {
            hitCircles.push(new Circle(values[i], values[i+1], values[i+2]));
        }
        obj.hitCircles = hitCircles;

        bulletData[values[0]] = obj;
    }

    return bulletData;
}