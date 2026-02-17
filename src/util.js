export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    clone() {
        return new Point(this.x, this.y);
    }
}

export class Circle {
    constructor(x, y, r) {
        this.center = new Point(x, y);
        this.r = r;
    }
}

export function calcDistanceSquared(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return dx * dx + dy * dy;
}

export function calcAngle(fromPos, toPos) {
    return Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);
}

export function isOnScreen(obj, canvas, margin=0, offsetX=0, offsetY=0) {
    return (
        obj.pos.x + offsetX > -margin &&
        obj.pos.x + offsetX < canvas.width + margin &&
        obj.pos.y + offsetY > -margin &&
        obj.pos.y + offsetY < canvas.height + margin
    );
}

export function toWorldPos(obj, localPos) {
    return new Point(
        obj.pos.x + localPos.x * Math.cos(obj.angle) - localPos.y * Math.sin(obj.angle),
        obj.pos.y + localPos.x * Math.sin(obj.angle) + localPos.y * Math.cos(obj.angle)
    );
}

export function isColliding(obj1, obj2) {
    for (const circle1 of obj1.hitCircles) {
        for (const circle2 of obj2.hitCircles) {
            const pos1 = toWorldPos(obj1, circle1.center);
            const pos2 = toWorldPos(obj2, circle2.center);
            
            const dx = pos1.x - pos2.x;
            const dy = pos1.y - pos2.y;
            const dr = circle1.r + circle2.r;
            if (dx*dx + dy*dy < dr*dr) {
                return true;
            }
        }
    }
    return false;
}

export function* wait(frame) {
    while (frame > 0) {
        frame--;
        yield;
    }
}