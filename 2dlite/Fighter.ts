class Fighter extends LineMesh {

    public speed: V = V.N();
    private cX: number = 0.005;
    private cY: number = 0.0001;
    private _rSpeed: number = 0;
    private cR: number = 2;

    private _thrust: number = 10;
    private _l: boolean = false;
    private _r: boolean = false;
    private _u: boolean = false;
    private _d: boolean = false;

    public update(): void {
        if (this._u) {
            this._thrust += 10 * dt;
            this._thrust = Math.min(this._thrust, 100);
        }
        if (this._d) {
            this._thrust -= 20 * dt;
            this._thrust = Math.max(this._thrust, 10);
        }
        if (this._l) {
            this._rSpeed += Math.PI * 0.5 * dt;
            this._rSpeed = Math.min(this._rSpeed, Math.PI * 0.5);
        }
        if (this._r) {
            this._rSpeed -= Math.PI * 0.5 * dt;
            this._rSpeed = Math.max(this._rSpeed, - Math.PI * 0.5);
        }
        console.log(this._thrust.toFixed(0) + " " + (this._rSpeed / (Math.PI * 2)).toFixed(2));
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
        if (key === 32) {
            let bullet = new Bullet(this);
            bullet.instantiate();
            console.log(bullet);
        }
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
            V.N(1, -17)
        ];
        let last = line.pts.length - 1;
        for (let i = last; i >= 0; i--) {
            let p = line.pts[i].copy();
            p.x *= -1;
            line.pts.push(p);
        }
        line.pts.push(line.pts[0].copy());
        this.lines = [
            line,
            Line.Parse("blue:-1,-1 -2,-1 -2,0 -4,0 -2,0 -2,1 -1,1"),
            Line.Parse("white:-1,0 1,0 0,0 0,-2 0,2"),
            Line.Parse("red:1,-1 2,-1 2,0 4,0 2,0 2,1 1,1")
        ];
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