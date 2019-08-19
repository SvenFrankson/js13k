class V {
    constructor(
        public x: number = 0,
        public y: number = 0
    ) {

    }

    public static N(x?: number, y?: number) {
        return new V(x, y);
    }

    public copy(v?: V): V {
        if (!v) {
            v = V.N();
        }
        v.x = this.x;
        v.y = this.y;
        return v;
    }
}

class GameObject {

    public p: V = V.N();
    public parent: GameObject;
    public r: number = 0;

    public pW(): V {
        let z = this;
        let parent = z.parent;
        if (!parent) {
            return z.p.copy();
        }
        let cr = Math.cos(parent.rW());
        let sr = Math.sin(parent.rW());
        return V.N(
            cr * z.p.x - sr * z.p.y + parent.pW().x,
            sr * z.p.x + cr * z.p.y + parent.pW().y
        );
    }

    public rW(): number {
        let z = this;
        let parent = z.parent;
        if (!parent) {
            return this.r;
        }
        return parent.rW() + this.r;
    }

    public start(): void {};
    public update(): void {};
    public draw(camera: Camera, canvas: HTMLCanvasElement): void {};
}

class Camera extends GameObject {

    public w: number = 200;
    public h: number = 200;

    public setW(w: number, canvas?: HTMLCanvasElement): void {
        let z = this;
        z.w = w;
        if (canvas) {
            z.h = canvas.height / canvas.width * w;
        }
    }

    public setH(h: number, canvas?: HTMLCanvasElement): void {
        let z = this;
        z.h = h;
        if (canvas) {
            z.h = canvas.width / canvas.height * h;
        }
    }
}

class Mesh extends GameObject {

    public points: V[] = [];
    
    public draw(camera: Camera, canvas: HTMLCanvasElement): void {
        let ctx = canvas.getContext("2d");
        let pW = this.pW();
        let rW = this.rW();
        let cr = Math.cos(rW);
        let sr = Math.sin(rW);
        let pCW = camera.pW();
        let rCW = camera.rW();
        let cCr = Math.cos(- rCW);
        let sCr = Math.sin(- rCW);
        let transformedPoints: V[] = [];
        for (let i = 0; i < this.points.length; i++) {
            let p = this.points[i];
            let wP = V.N(
                (cr * p.x - sr * p.y + pW.x),
                (sr * p.x + cr * p.y + pW.y)
            );
            let sP = V.N(
                (cCr * wP.x - sCr * wP.y - pCW.x) / camera.w * canvas.width,
                (sCr * wP.x + cCr * wP.y - pCW.y) / camera.h * canvas.height
            )
            transformedPoints.push(sP);
        }
        ctx.beginPath();
        ctx.moveTo(
            canvas.width * 0.5 + transformedPoints[0].x,
            canvas.height * 0.5 - transformedPoints[0].y
        )
        for (let i = 1; i < transformedPoints.length; i++) {
            let p = transformedPoints[i];
            ctx.lineTo(
                canvas.width * 0.5 + p.x,
                canvas.height * 0.5 - p.y
            );
        }
        ctx.lineCap = "round";
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}