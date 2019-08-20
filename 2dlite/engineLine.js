class Line {
    constructor(color, ...points) {
        this.color = color;
        this.points = [];
        this.color = color;
        this.points = points;
    }
    static Parse(s) {
        let sS = s.split(":");
        let c = sS[0];
        let pts = [];
        sS = sS[1].split(" ");
        for (let i = 0; i < sS.length; i++) {
            let xy = sS[i].split(",");
            let x = parseInt(xy[0]);
            let y = parseInt(xy[1]);
            pts.push(V.N(x, y));
        }
        return new Line(c, ...pts);
    }
}
class LineMesh extends GameObject {
    constructor() {
        super(...arguments);
        this.lines = [];
    }
    draw(camera, canvas) {
        let ctx = canvas.getContext("2d");
        ctx.lineCap = "round";
        ctx.lineWidth = 2;
        let pW = this.pW();
        let rW = this.rW();
        let sW = this.sW();
        let cr = Math.cos(rW);
        let sr = Math.sin(rW);
        let pCW = camera.pW();
        let rCW = camera.rW();
        let cCr = Math.cos(-rCW);
        let sCr = Math.sin(-rCW);
        this.lines.forEach(l => {
            let transformedPoints = [];
            for (let i = 0; i < l.points.length; i++) {
                let p = l.points[i];
                let wP = V.N(((cr * p.x - sr * p.y) * sW + pW.x), ((sr * p.x + cr * p.y) * sW + pW.y));
                let sP = V.N((cCr * wP.x - sCr * wP.y - pCW.x) / camera.w * canvas.width, (sCr * wP.x + cCr * wP.y - pCW.y) / camera.h * canvas.height);
                transformedPoints.push(sP);
            }
            ctx.beginPath();
            ctx.moveTo(canvas.width * 0.5 + transformedPoints[0].x, canvas.height * 0.5 - transformedPoints[0].y);
            for (let i = 1; i < transformedPoints.length; i++) {
                let p = transformedPoints[i];
                ctx.lineTo(canvas.width * 0.5 + p.x, canvas.height * 0.5 - p.y);
            }
            ctx.strokeStyle = l.color;
            ctx.stroke();
        });
    }
}
