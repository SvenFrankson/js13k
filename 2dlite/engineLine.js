class Line {
    constructor(col, ...points) {
        this.col = col;
        this.pts = [];
        this.col = col;
        this.pts = points;
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
        let pW = this.pW;
        let rW = this.rW;
        let sW = this.sW;
        let cr = Math.cos(rW);
        let sr = Math.sin(rW);
        this.lines.forEach(l => {
            let ptsS = [];
            for (let i = 0; i < l.pts.length; i++) {
                let pt = l.pts[i];
                let ptW = V.N(((cr * pt.x - sr * pt.y) * sW + pW.x), ((sr * pt.x + cr * pt.y) * sW + pW.y));
                ptsS.push(camera.pWToPS(ptW));
            }
            ctx.beginPath();
            ctx.moveTo(ptsS[0].x, ptsS[0].y);
            for (let i = 1; i < ptsS.length; i++) {
                let p = ptsS[i];
                ctx.lineTo(p.x, p.y);
            }
            ctx.strokeStyle = l.col;
            ctx.stroke();
        });
    }
}
class RectMesh extends LineMesh {
    constructor(w, h, col = "white") {
        super("rect");
        this.w = w;
        this.h = h;
        this.lines = [new Line(col, V.N(-w * 0.5, -h * 0.5), V.N(w * 0.5, -h * 0.5), V.N(w * 0.5, h * 0.5), V.N(-w * 0.5, h * 0.5), V.N(-w * 0.5, -h * 0.5))];
    }
}
