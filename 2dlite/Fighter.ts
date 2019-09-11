class Fighter extends LineMesh {

    public static instances: Map<number, Fighter[]> = new Map<number, Fighter[]>();

    public lod0: Line[];
    public lod1: Line[];

    public maxThrust: number = 100;
    public minThrust: number = 20;
    public airBrake: number = 1;
    public speed: V = V.N();
    private cX: number = 0.01;
    private cY: number = 0.0001;
    public rSpeed: number = 0;
    private cR: number = 2;

    public _thrust: number = 30;
    public dirinput: number = 0;
    public powInput: number = 0;

    public debugU: Line;
    public debugD: Line;
    public debugL: Line;
    public debugR: Line;

    public gunCoolDown: number = 0.5;
    private _gunTimer: number = 0;

    public isAlive: boolean = true;
    public hitPoint: number = 5;

    constructor(
        public squadron: Squadron,
        public color: string = "white",
        name: string = "noname",  
        p: V = V.N(),
        r: number = 0,
        s: number = 1,
    ) {
        super(name, p, r, s);
        this.squadron.fighters.push(this);
    }

    public instantiate(): void {
        super.instantiate();
        let teamInstances = Fighter.instances.get(this.squadron.team);
        if (!teamInstances) {
            teamInstances = [];
            Fighter.instances.set(this.squadron.team, teamInstances);
        }
        teamInstances.push(this);
    }

    public destroy(): void {
        super.destroy();
        let teamInstances = Fighter.instances.get(this.squadron.team);
        if (teamInstances) {
            let i = teamInstances.indexOf(this);
            if (i !== -1) {
                teamInstances.splice(i, 1);
            }
            i = this.squadron.fighters.indexOf(this);
            if (i !== -1) {
                this.squadron.fighters.splice(i, 1);
            }
        }
    }

    public update(): void {
        if (Engine.instance.activeCamera instanceof PlaneCamera) {
            this.isVisible = true;
            this.isScreenSized = false;
            this.size = 4;
            this.lines = this.lod0;
            if (Engine.instance.activeCamera.pixelRatio < 0.25) {
                this.isScreenSized = true;
                this.size = 1;
                this.lines = this.lod1;
            }
            if (Engine.instance.activeCamera.pixelRatio < 0.1) {
                this.isVisible = false;
            }
        }
        
        /*
        while (this.lines.length > 14) {
            this.lines.pop();
        }
        if (this.powInput > 0) {
            this.lines.push(this.debugU);
        }
        else if (this.powInput < 0) {
            this.lines.push(this.debugD);
        }
        if (this.dirinput > 0) {
            this.lines.push(this.debugL);
        }
        else if (this.dirinput < 0) {
            this.lines.push(this.debugR);
        }
        */
        if (this.powInput > 0) {
            this._thrust = (this.maxThrust - this.minThrust) * this.powInput + this.minThrust;
            this.airBrake = 1;
        }
        else {
            this._thrust = this.minThrust;
            this.airBrake = 1 + (- this.powInput);
        }

        this.rSpeed += Math.PI * 0.5 * dt * this.dirinput;
        this.rSpeed = Math.min(this.rSpeed, Math.PI * 0.5);
        this.rSpeed = Math.max(this.rSpeed, - Math.PI * 0.5);

        let sX = this.speed.dot(this.xW);
        let sY = this.speed.dot(this.yW);
        let fX = this.xW.mul(- sX * Math.abs(sX) * this.cX);
        let fY = this.yW.mul(- sY * Math.abs(sY) * this.cY * this.airBrake);
        this.speed = this.speed.add(this.yW.mul(this._thrust * dt));
        this.speed = this.speed.add(fX.mul(dt));
        this.speed = this.speed.add(fY.mul(dt));
        this.p = this.p.add(this.speed.mul(dt));
        this.rSpeed = this.rSpeed - (this.rSpeed * Math.abs(this.rSpeed) * this.cR * dt);
        this.r += this.rSpeed * dt;

        this._gunTimer -= dt;
    }

    public shoot(): void {
        if (this._gunTimer <= 0) {
            this._gunTimer = this.gunCoolDown;
            let bullet = new Bullet(this);
            bullet.instantiate();
        }
    }

    public wound(): void {
        this.hitPoint--;
        if (this.hitPoint <= 0) {
            this.destroy();
            this.isAlive = false;
        }
    }

    public start(): void {
        this.size = 3;
        let line = new Line(this.color);
        line.pts = [
            V.N(0, 7),
            V.N(1, 7),
            V.N(2, 6),
            V.N(2, 3),
            V.N(17, 2),
            V.N(18, 1),
            V.N(18, -1),
            V.N(17, -2),
            V.N(2, -4,),
            V.N(1, -12),
            V.N(5, -13),
            V.N(5, -15),
            V.N(1, -16),
            V.N(0, -15)
        ]
        let last = line.pts.length - 1;
        for (let i = last; i >= 0; i--) {
            let p = line.pts[i].copy();
            p.x *= -1;
            line.pts.push(p);
        }
        this.lod0 = [
            line,
            Line.Parse(this.color + ":-2,5 2,5"),
            new Line(
                this.color,
                V.N(1, 2),
                V.N(2, -1),
                V.N(1, -2),
                V.N(-1, -2),
                V.N(-2, -1),
                V.N(-1, 2),
                V.N(1, 2),
            ),
            new Line(
                this.color,
                V.N(16, 0),
                V.N(17, -2),
                V.N(10, -3),
                V.N(10, -1),
                V.N(16, 0)
            ),
            new Line(
                this.color,
                V.N(-16, 0),
                V.N(-17, -2),
                V.N(-10, -3),
                V.N(-10, -1),
                V.N(-16, 0)
            ),
            new Line(
                this.color,
                V.N(10, -2),
                V.N(10, -3),
                V.N(2, -4),
                V.N(2, -3),
                V.N(10, -2)
            ),
            new Line(
                this.color,
                V.N(-10, -2),
                V.N(-10, -3),
                V.N(-2, -4),
                V.N(-2, -3),
                V.N(-10, -2)
            ),
            Line.Parse(this.color + ":0,-15 5,-14"),
            Line.Parse(this.color + ":0,-15 -5,-14"),
            Line.Parse(this.color + ":0,7 0,8 4,8 -4,8"),
            new Line(
                this.color,
                V.N(6, 2),
                V.N(6, -1),
                V.N(5, -1),
                V.N(5, 2),
                V.N(6, 2)
            ),
            new Line(
                this.color,
                V.N(9, 1),
                V.N(9, -1),
                V.N(8, -1),
                V.N(8, 1),
                V.N(9, 1)
            ),
            new Line(
                this.color,
                V.N(-6, 2),
                V.N(-6, -1),
                V.N(-5, -1),
                V.N(-5, 2),
                V.N(-6, 2)
            ),
            new Line(
                this.color,
                V.N(-9, 1),
                V.N(-9, -1),
                V.N(-8, -1),
                V.N(-8, 1),
                V.N(-9, 1)
            )
        ];
        this.lod1 = [line];
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
            this.debugD.pts.push(square[i].add(V.N(0, -18)));
        }
        this.debugL = new Line("red");
        for (let i = 0; i < square.length; i++) {
            this.debugL.pts.push(square[i].add(V.N(-20, 0)));
        }
        this.debugR = new Line("red");
        for (let i = 0; i < square.length; i++) {
            this.debugR.pts.push(square[i].add(V.N(20, 0)));
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
            this.plane.dirinput = 1;
        }
        if (key === 39) {
            this.plane.dirinput = -1;
        }
        if (key === 38) {
            this.plane.powInput = 1;
        }
        if (key === 40) {
            this.plane.powInput = -1;
        }
    }

    public onKeyUp(key: number): void {
        if (key === 37) {
            this.plane.dirinput = 0;
        }
        if (key === 39) {
            this.plane.dirinput = 0;
        }
        if (key === 38) {
            this.plane.powInput = 0;
        }
        if (key === 40) {
            this.plane.powInput = 0;
        }
        if (key === 32) {
            this.plane.shoot();
        }
    }
}

class Bullet extends LineMesh {

    private _speed: V = V.N();
    private _life: number = 3;

    constructor(public owner: Fighter) {
        super("bullet");
        this.size = 2.5;
        this.p = owner.pLToPW(V.N(4.5, 6).mul(owner.size));
        this.r = owner.r;
        this.updateTransform();
        this._speed = this.yW.mul(800).add(owner.speed);
    }

    public start(): void {
        this.lines = [
            Line.Parse("white:-1,-2 -1,2 0,3 1,2 1,-2 -1,-2")
        ];
    }

    public update(): void {
        this.p = this.p.add(this._speed.mul(dt));
        for (let i = 0; i < 2; i++) {
            let fighters = Fighter.instances.get(i);
            if (fighters) {
                for (let j = 0; j < fighters.length; j++) {
                    let f = fighters[j];
                    if (f !== this.owner) {
                        if (V.sqrDist(this.pW, f.pW) < 50 * 50) {
                            f.wound();
                            this.destroy();
                            return;
                        }
                    }
                }
            }
        }
        this._life -= dt;
        if (this._life < 0) {
            this.destroy();
        }
    }
}