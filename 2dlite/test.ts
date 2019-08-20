class FatArrow extends LineMesh {

    private _k: number = 0;

    public start(): void {
        this.lines = [
            new Line(
                "yellow",
                V.N(- 20, - 20),
                V.N(- 20, 20),
                V.N(20, 20),
                V.N(40, 0),
                V.N(20, - 20),
                V.N(- 20, - 20)
            )
        ];
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

window.onload = () => {
    let canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
    canvas.width = 400;
    canvas.height = 400;
    canvas.style.width = "400px";
    canvas.style.height = "400px";
    let en = new Engine(canvas);
    let camera = new Camera();
    camera.setW(400, canvas);
    camera.r = Math.PI / 8;
    camera.instantiate();
    let mesh = new AltSpaceShip();
    mesh.instantiate();
    let pointer = new FatArrow();
    pointer.instantiate();
    en.start();
    setTimeout(
        () => {
            en.pause();
            setTimeout(
                () => {
                    en.pause();
                },
                1000
            );
        },
        3000
    );
    window.addEventListener(
        "pointerup",
        (e) => {
            let b = canvas.getBoundingClientRect();
            let x = e.clientX - b.left;
            let y = e.clientY - b.top;
            pointer.p = camera.pSToPW(V.N(x, y));
            console.log(pointer.p.x + " " + pointer.p.y);
        }
    )
}