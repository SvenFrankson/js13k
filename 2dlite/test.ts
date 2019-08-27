class EditableLine extends LineMesh {

    public colors: string[] = [
        "red",
        "lime",
        "blue",
        "yellow",
        "cyan",
        "magenta",
        "white"
    ];
    public colorIndex: number = 0;

    public currentLineIndex: number = -1;
    public currentPointIndex: number = -1;
    public isCreationMode: boolean = false;
    public isDeletionMode: boolean = false;

    private _preview: LineMesh;

    public start(): void {
        this.size = 10;
        this.lines = [];
        this._preview = new LineMesh();
        this._preview.size = 10;
        this._preview.instantiate();
    }

    public pWToLineIndex(pW: V): number {
        let index: number = -1;
        let bestDD: number = Infinity;
        this.lines.forEach(
            (l, lIndex) => {
                l.pts.forEach(
                    p => {
                        let dd = V.sqrDist(pW, p.mul(this.size));
                        if (dd < bestDD) {
                            bestDD = dd;
                            index = lIndex;
                        }
                    }
                )
            }
        );
        return index;
    }

    public pWToPointIndex(pW: V, l: Line): number {
        let index: number = -1;
        let bestDD: number = Infinity;
        l.pts.forEach(
            (p, pIndex) => {
                let dd = V.sqrDist(pW, p.mul(this.size));
                if (dd < bestDD) {
                    bestDD = dd;
                    index = pIndex;
                }
            }
        )
        return index;
    }

    public onPointerDown(pW: V): void {
        if (!this.isCreationMode && !this.isDeletionMode) {
            this.currentPointIndex = -1;
            let currentLine = this.lines[this.currentLineIndex];
            if (!currentLine) {
                this.currentLineIndex = this.pWToLineIndex(pW);
                currentLine = this.lines[this.currentLineIndex];
            }
            if (currentLine) {
                this.currentPointIndex = this.pWToPointIndex(pW, currentLine);
            }
        }
        console.log(this.currentLineIndex + " / " + this.lines.length + " " + this.currentPointIndex)
    }

    public onPointerMove(pW: V): void {
        if (this.isCreationMode) {
            if (pW.sqrLen() < 150 * 150) {
                let cursor = V.N(
                    Math.round(pW.x / this.size),
                    Math.round(pW.y / this.size)
                );
                let currentLine = this.lines[this.currentLineIndex]
                if (currentLine) {
                    let pt0 = currentLine.pts[currentLine.pts.length - 1];
                    if (pt0) {
                        this._preview.lines = [new Line("grey", pt0, cursor)];
                        return;
                    }
                }
            }
        }
        this._hidePreview();
        if (!this.isCreationMode && !this.isDeletionMode) {
            let currentLine = this.lines[this.currentLineIndex];
            if (currentLine) {
                let currentPoint = currentLine.pts[this.currentPointIndex];
                if (currentPoint) {
                    currentPoint.x = Math.round(pW.x / this.size);
                    currentPoint.y = Math.round(pW.y / this.size);
                }
            }
        }
    }

    private _hidePreview(): void {
        this._preview.lines = [];
    }

    public onPointerUp(pW: V): void {
        if (pW.sqrLen() > 150 * 150) {
            return;
        }
        if (this.isDeletionMode) {
            this.isDeletionMode = false;
            let cursor = V.N(
                Math.round(pW.x / this.size),
                Math.round(pW.y / this.size)
            );
            for (let i = 0; i < this.lines.length; i++) {
                let l = this.lines[i];
                for (let j = 0; j < l.pts.length; j++) {
                    let pt = l.pts[j];
                    if (pt.x === cursor.x && pt.y === cursor.y) {
                        this.lines.splice(i, 1);
                        this.currentLineIndex = -1;
                        return;
                    }
                }
            }
        }
        else if (this.isCreationMode) {
            if (this.lines.length === 0) {
                let newLine = new Line(
                    this.colors[this.colorIndex],
                    V.N(
                        Math.round(pW.x / this.size),
                        Math.round(pW.y / this.size)
                    )
                );
                this.colorIndex = (this.colorIndex + 1) % this.colors.length;
                this.lines.push(newLine);
                this.currentLineIndex = 0;
            }
            else if (this.currentLineIndex === -1) {
                this.currentLineIndex = this.pWToLineIndex(pW);
            }
            else {
                this.lines[this.currentLineIndex].pts.push(
                    V.N(
                        Math.round(pW.x / this.size),
                        Math.round(pW.y / this.size)
                    )
                );
            }
        }
        else {
            this.currentPointIndex = -1;
        }
    }
}

class EditableLineNewLineButton extends LineMesh {

    public target: EditableLine;
    private _check: Line;

    public start(): void {
        this.size = 5;
        this.p = V.N(-180, 180);
        this.lines = [
            Line.Parse("blue:-1,-1 -1,1 1,1 1,-1 -1,-1")
        ];
        this._check = Line.Parse("blue:-1,0 1,0 0,0 0,-1 0,1");
        this.collider = new SCollider(this, 5);
    }

    public update(): void {
        if (this.target.isCreationMode) {
            if (this.lines.length < 2) {
                this.lines.push(this._check);
            }
        }
        else {
            if (this.lines.length > 1) {
                this.lines.pop();
            }
        }
    }

    public onPickedUp(): void {
        this.target.isCreationMode = !this.target.isCreationMode;
        if (this.target.isCreationMode) {
            let newLine = new Line(
                this.target.colors[this.target.colorIndex]
            );
            this.target.colorIndex = (this.target.colorIndex + 1) % this.target.colors.length;
            this.target.lines.push(newLine);
            this.target.currentLineIndex = this.target.lines.length - 1;
        }
    }
}

class EditableLineDeleteButton extends LineMesh {

    public target: EditableLine;
    private _check: Line;

    public start(): void {
        this.size = 5;
        this.p = V.N(-180, 160);
        this.lines = [
            Line.Parse("red:-1,-1 -1,1 1,1 1,-1 -1,-1")
        ];
        this._check = Line.Parse("red:-1,0 1,0 0,0 0,-1 0,1");
        this.collider = new SCollider(this, 5);
    }

    public update(): void {
        if (this.target.isDeletionMode) {
            if (this.lines.length < 2) {
                this.lines.push(this._check);
            }
        }
        else {
            if (this.lines.length > 1) {
                this.lines.pop();
            }
        }
    }

    public onPickedUp(): void {
        this.target.isDeletionMode = !this.target.isDeletionMode;
    }
}

class Grid extends LineMesh {

    public start(): void {
        this.lines = [];
        for (let i = - 100; i <= 100; i += 5) {
            let hLine = new Line("rgb(32, 64, 64)");
            hLine.pts = [V.N(-100, i), V.N(100, i)];
            let vLine = new Line("rgb(32, 64, 64)");
            vLine.pts = [V.N(i, -100), V.N(i, 100)];
            this.lines.push(hLine, vLine);
        }
    }
}

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
    canvas.width = 800;
    canvas.height = 800;
    canvas.style.width = "800px";
    canvas.style.height = "800px";
    let en = new Engine(canvas);
    let grid = new Grid();
    grid.instantiate();
    let fighter = new Fighter();
    fighter.instantiate();
    let fighterControler = new PlayerControl(fighter);
    fighterControler.instantiate();

    let dummyFighter = new Fighter();
    dummyFighter.instantiate();
    let dummyFighterControler = new DummyControl(dummyFighter, fighter);
    dummyFighterControler.instantiate();

    let camera = new PlaneCamera(fighter);
    //let camera = new KeyboardCam();
    //camera.r = 0.8;
    camera.setW(1600, canvas);
    camera.instantiate();
    /*
    let center = new RectMesh(50, 50, "red");
    center.instantiate();
    let centerOut = new RectMesh(100, 100);
    centerOut.instantiate();
    let pointer = new FatArrow();
    pointer.instantiate();
    let drawing = new EditableLine();
    drawing.instantiate();
    let newLineButton = new EditableLineNewLineButton();
    newLineButton.target = drawing;
    newLineButton.instantiate();
    let deleteButton = new EditableLineDeleteButton();
    deleteButton.target = drawing;
    deleteButton.instantiate();
    */
    en.start();
}