class Line {

    public points: V[] = [];

    constructor(
        public color: string,
        ...points: V[]
    ) {
        this.color = color;
        this.points = points;
    }

    public static Parse(s: string) {
        let sS = s.split(":");
        let c = sS[0];
        let pts: V[] = [];
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

    public lines: Line[] = [];
    
    public draw(camera: Camera, canvas: HTMLCanvasElement): void {
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
        let cCr = Math.cos(- rCW);
        let sCr = Math.sin(- rCW);
        this.lines.forEach(
            l => {
                let transformedPoints: V[] = [];
                for (let i = 0; i < l.points.length; i++) {
                    let p = l.points[i];
                    let wP = V.N(
                        ((cr * p.x - sr * p.y) * sW + pW.x),
                        ((sr * p.x + cr * p.y) * sW + pW.y)
                    );
                    /*
                    let pS = V.N(
                        (cCr * wP.x - sCr * wP.y - pCW.x) / camera.w * canvas.width,
                        (sCr * wP.x + cCr * wP.y - pCW.y) / camera.h * canvas.height
                    )
                    */
                    let pS = camera.pWToPS(wP);
                    transformedPoints.push(pS);
                }
                ctx.beginPath();
                ctx.moveTo(
                    transformedPoints[0].x,
                    transformedPoints[0].y
                )
                for (let i = 1; i < transformedPoints.length; i++) {
                    let p = transformedPoints[i];
                    ctx.lineTo(
                        p.x,
                        p.y
                    );
                }
                ctx.strokeStyle = l.color;
                ctx.stroke();
            }
        )
    }
}