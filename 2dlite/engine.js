var EngineState;
(function (EngineState) {
    EngineState[EngineState["Off"] = 0] = "Off";
    EngineState[EngineState["Running"] = 1] = "Running";
    EngineState[EngineState["Paused"] = 2] = "Paused";
})(EngineState || (EngineState = {}));
class Engine {
    constructor(canvas) {
        this.canvas = canvas;
        this.state = EngineState.Off;
        this.objects = [];
        Engine.instance = this;
    }
    start() {
        if (this.state === EngineState.Off) {
            this.objects.forEach(o => {
                o.start();
            });
            this.state = EngineState.Running;
        }
        let loop = () => {
            if (this.state === EngineState.Running) {
                this.objects.forEach(o => {
                    o.update();
                });
                if (!this.activeCamera) {
                    this.activeCamera = this.objects.find(o => { return o instanceof Camera; });
                }
                if (this.activeCamera) {
                    let context = this.canvas.getContext("2d");
                    context.fillStyle = "black";
                    context.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    this.objects.forEach(o => {
                        o.draw(this.activeCamera, this.canvas);
                    });
                }
            }
            if (this.state !== EngineState.Off) {
                requestAnimationFrame(loop);
            }
        };
        loop();
    }
    pause() {
        if (this.state === EngineState.Running) {
            this.state = EngineState.Paused;
        }
        else if (this.state === EngineState.Paused) {
            this.state = EngineState.Running;
        }
    }
    destroy() {
        this.state = EngineState.Off;
        while (this.objects.length > 0) {
            this.objects[0].destroy();
        }
    }
}
class V {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    static N(x, y) {
        return new V(x, y);
    }
    copy(v) {
        if (!v) {
            v = V.N();
        }
        v.x = this.x;
        v.y = this.y;
        return v;
    }
}
class GameObject {
    constructor(name = "noname", p = V.N(), r = 0) {
        this.name = name;
        this.p = p;
        this.r = r;
    }
    pW() {
        let z = this;
        let parent = z.parent;
        if (!parent) {
            return z.p.copy();
        }
        let cr = Math.cos(parent.rW());
        let sr = Math.sin(parent.rW());
        return V.N(cr * z.p.x - sr * z.p.y + parent.pW().x, sr * z.p.x + cr * z.p.y + parent.pW().y);
    }
    rW() {
        let z = this;
        let parent = z.parent;
        if (!parent) {
            return this.r;
        }
        return parent.rW() + this.r;
    }
    instantiate() {
        let en = Engine.instance;
        if (en.objects.indexOf(this) === -1) {
            en.objects.push(this);
        }
    }
    destroy() {
        let en = Engine.instance;
        let i = en.objects.indexOf(this);
        if (i !== -1) {
            en.objects.splice(i, 1);
        }
    }
    start() { }
    ;
    update() { }
    ;
    draw(camera, canvas) { }
    ;
}
class Camera extends GameObject {
    constructor() {
        super(...arguments);
        this.w = 200;
        this.h = 200;
    }
    setW(w, canvas) {
        let z = this;
        z.w = w;
        if (canvas) {
            z.h = canvas.height / canvas.width * w;
        }
    }
    setH(h, canvas) {
        let z = this;
        z.h = h;
        if (canvas) {
            z.h = canvas.width / canvas.height * h;
        }
    }
}
class Mesh extends GameObject {
    constructor() {
        super(...arguments);
        this.points = [];
    }
    draw(camera, canvas) {
        let ctx = canvas.getContext("2d");
        let pW = this.pW();
        let rW = this.rW();
        let cr = Math.cos(rW);
        let sr = Math.sin(rW);
        let pCW = camera.pW();
        let rCW = camera.rW();
        let cCr = Math.cos(-rCW);
        let sCr = Math.sin(-rCW);
        let transformedPoints = [];
        for (let i = 0; i < this.points.length; i++) {
            let p = this.points[i];
            let wP = V.N((cr * p.x - sr * p.y + pW.x), (sr * p.x + cr * p.y + pW.y));
            let sP = V.N((cCr * wP.x - sCr * wP.y - pCW.x) / camera.w * canvas.width, (sCr * wP.x + cCr * wP.y - pCW.y) / camera.h * canvas.height);
            transformedPoints.push(sP);
        }
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.5 + transformedPoints[0].x, canvas.height * 0.5 - transformedPoints[0].y);
        for (let i = 1; i < transformedPoints.length; i++) {
            let p = transformedPoints[i];
            ctx.lineTo(canvas.width * 0.5 + p.x, canvas.height * 0.5 - p.y);
        }
        ctx.lineCap = "round";
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}
