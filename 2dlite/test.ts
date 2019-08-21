class FatArrow extends LineMesh {

    private _target: V = V.N();

    public start(): void {
        this.lines = [
            new Line(
                "yellow",
                V.N(- 20, - 20),
                V.N(- 20, 20),
                V.N(0, 40),
                V.N(20, 20),
                V.N(20, - 20),
                V.N(- 20, - 20)
            )
        ];
        this.collider = new SCollider(this, 20);
    }

    public update(): void {
        let dir = this._target.sub(this.p);
        let r = V.dirToR(dir);
        if (isFinite(r)) {
            this.r = Angle.lerp(this.r, r, 0.1);
        }
        this.p.x = this.p.x * 0.9 + this._target.x * 0.1;
        this.p.y = this.p.y * 0.9 + this._target.y * 0.1;
    }

    public onPointerMove(pW: V): void {
        pW.copy(this._target);
    }
}

class SpaceShip extends LineMesh {

    private _k: number = 0;

    public start(): void {
        this.lines = [
            Line.Parse("white:-10,-10 -10,10 0,25 10,10 10,-10 -10,-10"),
            Line.Parse("red:16,-5 16,10 40,0 40,-10 16,-5"),
            Line.Parse("red:-16,-5 -16,10 -40,0 -40,-10 -16,-5")
        ];
    }

    public update(): void {
        this.p.x = 100 * Math.cos(this._k / 100);
        this.p.y = 50 * Math.sin(this._k / 50);
        this.r = this._k / 60;
        this.s = 1.5 + Math.sin(this._k / 50);
        this._k++;
    }
}

class AltSpaceShip extends LineMesh {

    private _k: number = 0;

    public start(): void {
        let body = new LineMesh("body", V.N(), 0, 1);
        body.parent = this;
        body.lines = [Line.Parse("white:-10,-10 -10,10 0,25 10,10 10,-10 -10,-10")];
        body.instantiate();
        let wingR = new LineMesh("wingR", V.N(20, 0), 0, 1);
        wingR.parent = body;
        wingR.lines = [Line.Parse("red:-4,-5 -4,10 20,0 20,-10 -4,-5")];
        wingR.instantiate();
        let wingL = new LineMesh("wingL", V.N(0, -5), 0, 1);
        wingL.parent = body;
        wingL.lines = [Line.Parse("red:-16,0 -16,15 -40,5 -40,-5 -16,0")];
        wingL.instantiate();
    }

    public update(): void {
        this.p.x = 100 * Math.cos(this._k / 100);
        this.p.y = 50 * Math.sin(this._k / 50);
        this.r = this._k / 60;
        this.s = 1.5 + Math.sin(this._k / 50);
        this._k++;
    }
}

class KeyboardCam extends Camera {

    private _l: boolean = false;
    private _r: boolean = false;
    private _u: boolean = false;
    private _d: boolean = false;
    private _rP: boolean = false;
    private _rM: boolean = false;

    public update(): void {
        if (this._l) {
            this.p.x -= this.xW.x * 2;
            this.p.y -= this.xW.y * 2;
        }
        if (this._r) {
            this.p.x += this.xW.x * 2;
            this.p.y += this.xW.y * 2;
        }
        if (this._d) {
            this.p.x -= this.yW.x * 2;
            this.p.y -= this.yW.y * 2;
        }
        if (this._u) {
            this.p.x += this.yW.x * 2;
            this.p.y += this.yW.y * 2;
        }
        if (this._rP) {
            this.r += 0.05;
        }
        if (this._rM) {
            this.r -= 0.05;
        }
    }

    public onKeyDown(key: number): void {
        if (key === 37) {
            this._l = true;
        }
        if (key === 39) {
            this._r = true;
        }
        if (key === 38) {
            this._u = true;
        }
        if (key === 40) {
            this._d = true;
        }
        if (key === 65) {
            this._rP = true;
        }
        if (key === 69) {
            this._rM = true;
        }
    }

    public onKeyUp(key: number): void {
        if (key === 37) {
            this._l = false;
        }
        if (key === 39) {
            this._r = false;
        }
        if (key === 38) {
            this._u = false;
        }
        if (key === 40) {
            this._d = false;
        }
        if (key === 65) {
            this._rP = false;
        }
        if (key === 69) {
            this._rM = false;
        }
    }
}

window.onload = () => {
    let canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
    canvas.width = 400;
    canvas.height = 400;
    canvas.style.width = "400px";
    canvas.style.height = "400px";
    let en = new Engine(canvas);
    let camera = new KeyboardCam();
    camera.r = 0.8;
    camera.setW(400, canvas);
    camera.instantiate();
    let center = new RectMesh(50, 50, "red");
    center.instantiate();
    let centerOut = new RectMesh(100, 100);
    centerOut.instantiate();
    let pointer = new FatArrow();
    pointer.instantiate();
    en.start();
}