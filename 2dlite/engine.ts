enum EngineState {
    Off,
    Running,
    Paused
}

class Engine {

    public static instance: Engine;

    public state: EngineState = EngineState.Off;
    public activeCamera: Camera;
    public objects: GameObject[] = [];

    constructor(
        public canvas: HTMLCanvasElement
    ) {
        Engine.instance = this;
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
        let loop = () => {
            if (this.state === EngineState.Running) {
                this.objects.forEach(
                    o => {
                        o.update();
                    }
                )
                if (!this.activeCamera) {
                    this.activeCamera = this.objects.find(o => { return o instanceof Camera; }) as Camera;
                }
                if (this.activeCamera) {
                    let context = this.canvas.getContext("2d");
                    context.fillStyle = "black";
                    context.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    this.objects.forEach(
                        o => {
                            o.draw(this.activeCamera, this.canvas);
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
            this.objects[0].destroy();
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
}

class GameObject {

    public parent: GameObject;

    public pW(): V {
        let z = this;
        let parent = z.parent;
        if (!parent) {
            return z.p.copy();
        }
        let cr = Math.cos(parent.rW());
        let sr = Math.sin(parent.rW());
        return V.N(
            (cr * z.p.x - sr * z.p.y) * parent.sW() + parent.pW().x,
            (sr * z.p.x + cr * z.p.y) * parent.sW() + parent.pW().y
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

    public sW(): number {
        let z = this;
        let parent = z.parent;
        if (!parent) {
            return this.s;
        }
        return parent.sW() * this.s;
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
    }

    public destroy(): void {
        let en = Engine.instance;
        let i = en.objects.indexOf(this);
        if (i !== -1) {
            en.objects.splice(i, 1);
        }
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