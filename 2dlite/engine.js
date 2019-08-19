class V {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    static N(x, y) {
        return new V(x, y);
    }
    copy(v) {
        if (!v) {
            v = V.N();
        }
        v.x = this.x;
        v.y = this.y;
        return v;
    }
}
class GameObject {
    constructor() {
        this.p = V.N();
        this.r = 0;
    }
    pW() {
        let z = this;
        let parent = z.parent;
        if (!parent) {
            return z.p.copy();
        }
        let cr = Math.cos(parent.rW());
        let sr = Math.sin(parent.rW());
        return V.N(cr * z.p.x - sr * z.p.y + parent.pW().x, sr * z.p.x + cr * z.p.y + parent.pW().y);
    }
    rW() {
        let z = this;
        let parent = z.parent;
        if (!parent) {
            return this.r;
        }
        return parent.rW() + this.r;
    }
    start() { }
    ;
    update() { }
    ;
    draw(camera, canvas) { }
    ;
}
class Camera extends GameObject {
    constructor() {
        super(...arguments);
        this.w = 200;
        this.h = 200;
    }
    setW(w, canvas) {
        let z = this;
        z.w = w;
        if (canvas) {
            z.h = canvas.height / canvas.width * w;
        }
    }
    setH(h, canvas) {
        let z = this;
        z.h = h;
        if (canvas) {
            z.h = canvas.width / canvas.height * h;
        }
    }
}
class Mesh extends GameObject {
    constructor() {
        super(...arguments);
        this.points = [];
    }
    draw(camera, canvas) {
        let ctx = canvas.getContext("2d");
        let pW = this.pW();
        let rW = this.rW();
        let cr = Math.cos(rW);
        let sr = Math.sin(rW);
        let pCW = camera.pW();
        let rCW = camera.rW();
        let cCr = Math.cos(-rCW);
        let sCr = Math.sin(-rCW);
        let transformedPoints = [];
        for (let i = 0; i < this.points.length; i++) {
            let p = this.points[i];
            let wP = V.N((cr * p.x - sr * p.y + pW.x), (sr * p.x + cr * p.y + pW.y));
            let sP = V.N((cCr * wP.x - sCr * wP.y - pCW.x) / camera.w * canvas.width, (sCr * wP.x + cCr * wP.y - pCW.y) / camera.h * canvas.height);
            transformedPoints.push(sP);
        }
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.5 + transformedPoints[0].x, canvas.height * 0.5 - transformedPoints[0].y);
        for (let i = 1; i < transformedPoints.length; i++) {
            let p = transformedPoints[i];
            ctx.lineTo(canvas.width * 0.5 + p.x, canvas.height * 0.5 - p.y);
        }
        ctx.lineCap = "round";
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}
