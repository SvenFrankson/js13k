class Fighter extends LineMesh {

    public speed: V = V.N();
    private cX: number = 0.01;
    private cY: number = 0.0001;
    private _rSpeed: number = 0;
    private cR: number = 2;

    public _thrust: number = 20;
    public lrInput: number = 0;
    public udInput: number = 0;

    public debugU: Line;
    public debugD: Line;
    public debugL: Line;
    public debugR: Line;

    public update(): void {
        while (this.lines.length > 4) {
            this.lines.pop();
        }
        if (this.udInput > 0) {
            this.lines.push(this.debugU);
        }
        else if (this.udInput < 0) {
            this.lines.push(this.debugD);
        }
        if (this.lrInput > 0) {
            this.lines.push(this.debugL);
        }
        else if (this.lrInput < 0) {
            this.lines.push(this.debugR);
        }
        this._thrust += 20 * dt * this.udInput;
        this._thrust = Math.min(this._thrust, 100);
        this._thrust = Math.max(this._thrust, 20);

        this._rSpeed += Math.PI * 0.5 * dt * this.lrInput;
        this._rSpeed = Math.min(this._rSpeed, Math.PI * 0.5);
        this._rSpeed = Math.max(this._rSpeed, - Math.PI * 0.5);

        let sX = this.speed.dot(this.xW);
        let sY = this.speed.dot(this.yW);
        let fX = this.xW.mul(- sX * Math.abs(sX) * this.cX);
        let fY = this.yW.mul(- sY * Math.abs(sY) * this.cY);
        this.speed = this.speed.add(this.yW.mul(this._thrust * dt));
        this.speed = this.speed.add(fX.mul(dt));
        this.speed = this.speed.add(fY.mul(dt));
        this.p = this.p.add(this.speed.mul(dt));
        this._rSpeed = this._rSpeed - (this._rSpeed * Math.abs(this._rSpeed) * this.cR * dt);
        this.r += this._rSpeed * dt;
    }

    public start(): void {
        this.size = 5;
        let line = new Line("white");
        line.pts = [
            V.N(1, 8),
            V.N(2, 4),
            V.N(2, 2),
            V.N(4, 2),
            V.N(4, 6),
            V.N(5, 6),
            V.N(5, 2),
            V.N(14, 1),
            V.N(15, 0),
            V.N(14, -1),
            V.N(6, -2),
            V.N(2, -2),
            V.N(1, -14),
            V.N(3, -14),
            V.N(4, -15),
            V.N(4, -16),
            V.N(1, -16),
            V.N(1, -17),
        ];
        let last = line.pts.length - 1;
        for (let i = last; i >= 0; i--) {
            let p = line.pts[i].copy();
            p.x *= -1;
            line.pts.push(p);
        }
        line.pts.push(line.pts[0].copy());
        line.pts.push(
            V.N(60, -60)
        );
        this.lines = [
            line,
            Line.Parse("blue:-1,-1 -2,-1 -2,0 -4,0 -2,0 -2,1 -1,1"),
            Line.Parse("white:-1,0 1,0 0,0 0,-2 0,2"),
            Line.Parse("red:1,-1 2,-1 2,0 4,0 2,0 2,1 1,1")
        ];
        let square = [
            V.N(-1, -1),
            V.N(-1, 1),
            V.N(1, 1),
            V.N(1, -1),
            V.N(-1, -1)
        ];
        this.debugU = new Line("red");
        for (let i = 0; i < square.length; i++) {
            this.debugU.pts.push(square[i].add(V.N(0, 10)));
        }
        this.debugD = new Line("red");
        for (let i = 0; i < square.length; i++) {
            this.debugD.pts.push(square[i].add(V.N(0, -19)));
        }
        this.debugL = new Line("red");
        for (let i = 0; i < square.length; i++) {
            this.debugL.pts.push(square[i].add(V.N(-17, 0)));
        }
        this.debugR = new Line("red");
        for (let i = 0; i < square.length; i++) {
            this.debugR.pts.push(square[i].add(V.N(17, 0)));
        }
    }
}

class PlayerControl extends GameObject {

    constructor(
        public plane: Fighter
    ) {
        super("playerControler");
    }

    public onKeyDown(key: number): void {
        if (key === 37) {
            this.plane.lrInput = 1;
        }
        if (key === 39) {
            this.plane.lrInput = -1;
        }
        if (key === 38) {
            this.plane.udInput = 1;
        }
        if (key === 40) {
            this.plane.udInput = -1;
        }
    }

    public onKeyUp(key: number): void {
        if (key === 37) {
            this.plane.lrInput = 0;
        }
        if (key === 39) {
            this.plane.lrInput = 0;
        }
        if (key === 38) {
            this.plane.udInput = 0;
        }
        if (key === 40) {
            this.plane.udInput = 0;
        }
        if (key === 32) {
            let bullet = new Bullet(this.plane);
            bullet.instantiate();
            console.log(bullet);
        }
    }
}

enum AITask {
    Go,
    Follow,
    Avoid
}

class DummyControl extends GameObject {

    public leader: Fighter;
    public formationPos: V;

    constructor(
        public plane: Fighter,
        public target: Fighter
    ) {
        super("playerControler");
    }

    public task: AITask;

    public targetPos: V;

    public followPos: () => V;
    public followDir: () => number;
    public followSpeed: () => number;
    public followX: () => V;
    public followY: () => V;

    public update(): void {
        if (this.task === undefined) {
            this.targetPos = V.N(- 1000 + 2000 * Math.random(), - 1000 + 2000 * Math.random());
            this.task = AITask.Go;
        }

        this.plane.lrInput = 0;
        this.plane.udInput = 0;

        if (this.task === AITask.Go) {
            this.goToAction(this.targetPos);
            if (V.sqrDist(this.plane.pW, this.targetPos) < 100 * 100) {
                delete this.task;
            }
        }

        if (this.task === AITask.Follow) {
            this.followAction(
                this.followPos(),
                this.followDir(),
                this.followSpeed(),
                this.followX(),
                this.followY()
            );
        }
    }

    public goToAction(
        p: V
    ): void {
        let targetDir = p.sub(this.plane.p);
        let targetAngle = V.angle(this.plane.yW, targetDir);
        let targetDist = targetDir.len();
        if (targetAngle > 0) {
            this.plane.lrInput = 1;
        }
        else if (targetAngle < 0) {
            this.plane.lrInput = - 1;
        }
        if (targetDist < 400) {
            this.plane.lrInput = - this.plane.lrInput;
        }
        if (targetDist < 400 && Math.abs(targetAngle) > Math.PI / 2) {
            this.plane.udInput = - 1;
        }
        else if (targetDist > 800 && Math.abs(targetAngle) < Math.PI / 2) {
            this.plane.udInput = - 1;
        }
        else {
            this.plane.udInput = 1;
        }
    }

    public followAction(
        p: V,
        r: number,
        s: number,
        wX: V,
        wY: V
    ): void {
        let dP = this.plane.pW.sub(p);
        let dist = dP.sqrLen();
        if (dist > 400 * 400) {
            return this.goToAction(p);
        }
        let dA = Angle.shortest(this.plane.rW, r);
        if (dA > Math.PI / 3) {
            this.plane.lrInput = 2;
            return;
        }
        else if (dA < - Math.PI / 3) {
            this.plane.lrInput = - 2;
            return;
        }
        let currentS = this.plane.speed.len();
        let fS = currentS / s;
        if (fS > 1.5) {
            this.plane.udInput = - 2;
            return;
        }
        else if (fS < 0.6) {
            this.plane.udInput = 2;
            return;
        }
        let dX = dP.dot(wX);
        this.plane.lrInput = dX / 200;
        let dY = dP.dot(wY);
        this.plane.udInput = - dY / 200;
    }
}

class Bullet extends LineMesh {

    private _speed: V = V.N();
    private _life: number = 1;

    constructor(public owner: Fighter) {
        super("bullet");
        this.size = 2.5;
        this.p = owner.pLToPW(V.N(4.5, 6).mul(owner.size));
        this.r = owner.r;
        this.updateTransform();
        this._speed = this.yW.mul(200).add(owner.speed);
    }

    public start(): void {
        this.lines = [
            Line.Parse("white:-1,-2 -1,2 0,3 1,2 1,-2 -1,-2")
        ];
    }

    public update(): void {
        this.p = this.p.add(this._speed.mul(dt));
        this._life -= dt;
        if (this._life < 0) {
            this.destroy();
        }
    }
}