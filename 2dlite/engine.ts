enum EngineState {
    Off,
    Running,
    Paused
}

var dt: number = 0.15;

class Engine {

    public static instance: Engine;

    public state: EngineState = EngineState.Off;
    public activeCamera: Camera;
    public objects: GameObject[] = [];
    public destroyTask: GameObject[] = [];
    private _pntrUp: boolean = false;
    private _pntrMv: boolean = false;
    private _pntrDn: boolean = false;
    public pntrS: V = V.N();
    public pntrW: V = V.N(); 

    constructor(
        public canvas: HTMLCanvasElement
    ) {
        Engine.instance = this;
        this.register();
    }

    public start(): void {
        if (this.state === EngineState.Off) {
            this.objects.forEach(
                o => {
                    o.start();
                }
            )
            this.state = EngineState.Running;
        }
        let t: number = Date.now();
        let loop = () => {
            let now = Date.now();
            dt = Math.min((now - t) / 1000, 1);
            t = now;
            if (this.state === EngineState.Running) {
                this.objects.forEach(
                    o => {
                        o.update();
                    }
                )
                while (this.destroyTask.length > 0) {
                    this.destroyTask.pop().destroyNow();
                }
                this.objects.forEach(
                    o => {
                        o.updateTransform();
                    }
                )
                if (!this.activeCamera) {
                    this.activeCamera = this.objects.find(o => { return o instanceof Camera; }) as Camera;
                }
                if (this.activeCamera) {
                    if (this._pntrDn || this._pntrMv || this._pntrUp) {
                        this.pntrW = this.activeCamera.pSToPW(this.pntrS);
                        let picked: GameObject = undefined;
                        let sqrDist: number = Infinity;
                        this.objects.forEach(
                            o => {
                                if (o.collider) {
                                    if (o.collider.containsPW(this.pntrW)) {
                                        let dd = V.sqrDist(o.p, this.pntrW);
                                        if (dd < sqrDist) {
                                            sqrDist = dd;
                                            picked = o;
                                        }
                                    }
                                }
                            }
                        )
                        if (this._pntrDn) {
                            this._pntrDn = false;
                            this.objects.forEach(
                                o => {
                                    o.onPointerDown(this.pntrW);
                                }
                            )
                            if (picked) {
                                picked.onPickedDown(this.pntrW);
                            }
                        }
                        if (this._pntrMv) {
                            this._pntrMv = false;
                            this.objects.forEach(
                                o => {
                                    o.onPointerMove(this.pntrW);
                                }
                            )
                            if (picked) {
                                picked.onPickedMove(this.pntrW);
                            }
                        }
                        if (this._pntrUp) {
                            this._pntrUp = false;
                            this.objects.forEach(
                                o => {
                                    o.onPointerUp(this.pntrW);
                                }
                            )
                            if (picked) {
                                picked.onPickedUp(this.pntrW);
                            }
                        }
                    }
                    let context = this.canvas.getContext("2d");
                    context.fillStyle = "black";
                    context.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    this.objects.forEach(
                        o => {
                            if (o.isVisible) {
                                o.draw(this.activeCamera, this.canvas);
                            }
                        }
                    )
                }
            }
            if (this.state !== EngineState.Off) {
                requestAnimationFrame(loop);
            }
        }
        loop();
    }

    public pause(): void {
        if (this.state === EngineState.Running) {
            this.state = EngineState.Paused;
        }
        else if (this.state === EngineState.Paused) {
            this.state = EngineState.Running;
        }
    }

    public destroy() {
        this.state = EngineState.Off;
        while (this.objects.length > 0) {
            this.objects[0].destroyNow();
        }
    }

    public register() {
        this.canvas.addEventListener("pointerdown", e => {
            let b = this.canvas.getBoundingClientRect();
            this._pntrDn = true;
            this.pntrS.x = e.clientX - b.left;
            this.pntrS.y = e.clientY - b.top;
        })
        this.canvas.addEventListener("pointermove", e => {
            let b = this.canvas.getBoundingClientRect();
            this._pntrMv = true;
            this.pntrS.x = e.clientX - b.left;
            this.pntrS.y = e.clientY - b.top;
        })
        this.canvas.addEventListener("pointerup", e => {
            let b = this.canvas.getBoundingClientRect();
            this._pntrUp = true;
            this.pntrS.x = e.clientX - b.left;
            this.pntrS.y = e.clientY - b.top;
        })
        window.addEventListener("keydown", e => {
            let k = e.keyCode;
            this.objects.forEach(
                o => {
                    o.onKeyDown(k);
                }
            )
        })
        window.addEventListener("keyup", e => {
            let k = e.keyCode;
            this.objects.forEach(
                o => {
                    o.onKeyUp(k);
                }
            )
        })
    }
}

class Angle {

    public static shortest(f: number, t: number): number {
        while (t < f) {
            t += 2 * Math.PI;
        }
        while (t - 2 * Math.PI > f) {
            t -= 2 * Math.PI;
        }
        let d = t - f;
        if (d < Math.PI) {
            return d;
        }
        return d - 2 * Math.PI;
    }
    public static lerp(a1: number, a2: number, t: number = 0.5): number {
        while (a2 < a1) {
            a2 += 2 * Math.PI;
        }
        while (a2 - 2 * Math.PI > a1) {
            a2 -= 2 * Math.PI;
        }
        if (a2 < a1 + Math.PI) {
            return a1 + (a2 - a1) * t;
        }
        else {
            return a1 - (2 * Math.PI - (a2 - a1)) * t;
        }
    }
}

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

    public sqrLen(): number {
        let z = this;
        return z.x * z.x + z.y * z.y;
    }

    public len(): number {
        return Math.sqrt(this.sqrLen());
    }

    public add(v: V): V {
        let z = this;
        return V.N(z.x + v.x, z.y + v.y);
    }

    public sub(v: V): V {
        let z = this;
        return V.N(z.x - v.x, z.y - v.y);
    }

    public mul(f: number): V {
        let z = this;
        return V.N(z.x * f, z.y * f);
    }

    public unit(): V {
        let l = this.len();
        return V.N(this.x / l, this.y / l);
    }

    public dot(v: V): number {
        let z = this;
        return z.x * v.x + z.y * v.y;
    }

    public static sqrDist(v1: V, v2: V): number {
        let dx = v2.x - v1.x;
        let dy = v2.y - v1.y;
        return dx * dx + dy * dy;
    }

    public static angle(v1: V, v2: V): number {
        let dot = v1.dot(v2) / v1.len() / v2.len();
        let a = Math.acos(dot);
        if (v1.x * v2.y - v1.y * v2.x < 0) {
            a *= -1;
        }
        return a;
    }

    public static dirToR(v: V): number {
        return V.angle(V.N(0, 1), v);
    }
}

class SCollider {

    constructor(
        public obj: GameObject,
        public radius: number = 10
    ) {

    }

    public containsPW(p: V): boolean {
        let pOW: V = this.obj.pW;
        return V.sqrDist(pOW, p) < this.radius * this.radius;
    }
}

class GameObject {

    private _parent: GameObject;
    public get parent(): GameObject {
        return this._parent;
    }
    public set parent(o: GameObject) {
        if (this._parent) {
            let i = this._parent.children.indexOf(this);
            if (i !== -1) {
                this.parent.children.splice(i, 1);
            }
        }
        this._parent = o;
        if (this._parent) {
            this._parent.children.push(this);
        }
    }
    public children: GameObject[] = [];
    public collider: SCollider;

    public isVisible: boolean = true;

    public pW: V = V.N();
    public xW: V = V.N();
    public yW: V = V.N();
    public rW: number = 0;
    public sW: number = 0;

    public updateTransform(): void {
        let z = this;
        let parent = z.parent;
        if (!parent) {
            z.p.copy(z.pW);
            z.rW = z.r;
            z.sW = z.s;
        }
        else {
            let cr = Math.cos(parent.rW);
            let sr = Math.sin(parent.rW);
            z.pW.x = (cr * z.p.x - sr * z.p.y) * parent.sW + parent.pW.x;
            z.pW.y = (sr * z.p.x + cr * z.p.y) * parent.sW + parent.pW.y;
            z.rW = z.r + parent.rW;
            z.sW = z.s * parent.sW;
        }
        z.xW.x = Math.cos(this.r);
        z.xW.y = Math.sin(this.r);
        z.yW.x = - Math.sin(this.r);
        z.yW.y = Math.cos(this.r);
        this.children.forEach(c => { c.updateTransform(); });
    }

    constructor(
        public name: string = "noname",  
        public p: V = V.N(),
        public r: number = 0,
        public s: number = 1
    ) {

    }

    public instantiate(): void {
        let en = Engine.instance;
        if (en.objects.indexOf(this) === -1) {
            en.objects.push(this);
        }
        if (en.state === EngineState.Running) {
            this.start();
        }
    }

    public destroy(): void {
        Engine.instance.destroyTask.push(this);
    }

    public destroyNow(): void {
        let en = Engine.instance;
        let i = en.objects.indexOf(this);
        if (i !== -1) {
            en.objects.splice(i, 1);
        }
    }

    public pLToPW(pL: V): V {
        let z = this;
        let cr = Math.cos(z.rW);
        let sr = Math.sin(z.rW);
        return V.N(
            ((cr * pL.x - sr * pL.y) * z.sW + z.pW.x),
            ((sr * pL.x + cr * pL.y) * z.sW + z.pW.y)
        );
    }

    public start(): void { }
    public update(): void { }
    public draw(camera: Camera, canvas: HTMLCanvasElement): void { }
    public onPickedDown(pW: V): void { }
    public onPickedMove(pW: V): void { }
    public onPickedUp(pW: V): void { }
    public onPointerDown(pW: V): void { }
    public onPointerMove(pW: V): void { }
    public onPointerUp(pW: V): void { }
    public onKeyDown(k: number): void { }
    public onKeyUp(k: number): void { }
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

    public pWToPS(pW: V): V {
        let canvas = Engine.instance.canvas;
        let pCW = this.pW;
        let rCW = this.rW;
        let cCr = Math.cos(- rCW);
        let sCr = Math.sin(- rCW);
        return V.N(
            canvas.width * 0.5 + (cCr * (pW.x - pCW.x) - sCr * (pW.y - pCW.y)) / this.w * canvas.width,
            canvas.height * 0.5 - (sCr * (pW.x - pCW.x) + cCr * (pW.y - pCW.y)) / this.h * canvas.height
        )
    }
    

    public pSToPW(pS: V): V {
        let canvas = Engine.instance.canvas;
        let pCW = this.pW;
        let rCW = this.rW;
        let cCr = Math.cos(rCW);
        let sCr = Math.sin(rCW);
        let x = pS.x / canvas.width * this.w - this.w * 0.5;
        let y = - pS.y / canvas.height * this.h + this.h * 0.5;
        return V.N(
            cCr * x - sCr * y + pCW.x,
            sCr * x + cCr * y + pCW.y
        )
    }
}