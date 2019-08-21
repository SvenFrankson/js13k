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
        this._pntrUp = false;
        this._pntrMv = false;
        this._pntrDn = false;
        this.pntrS = V.N();
        this.pntrW = V.N();
        Engine.instance = this;
        this.register();
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
                this.objects.forEach(o => {
                    o.updateTransform();
                });
                if (!this.activeCamera) {
                    this.activeCamera = this.objects.find(o => { return o instanceof Camera; });
                }
                if (this.activeCamera) {
                    if (this._pntrDn || this._pntrMv || this._pntrUp) {
                        this.pntrW = this.activeCamera.pSToPW(this.pntrS);
                        let picked = undefined;
                        let sqrDist = Infinity;
                        this.objects.forEach(o => {
                            if (o.collider) {
                                if (o.collider.containsPW(this.pntrW)) {
                                    let dd = V.sqrDist(o.p, this.pntrW);
                                    if (dd < sqrDist) {
                                        sqrDist = dd;
                                        picked = o;
                                    }
                                }
                            }
                        });
                        if (this._pntrDn) {
                            this._pntrDn = false;
                            this.objects.forEach(o => {
                                o.onPointerDown(this.pntrW);
                            });
                            if (picked) {
                                picked.onPickedDown(this.pntrW);
                            }
                        }
                        if (this._pntrMv) {
                            this._pntrMv = false;
                            this.objects.forEach(o => {
                                o.onPointerMove(this.pntrW);
                            });
                            if (picked) {
                                picked.onPickedMove(this.pntrW);
                            }
                        }
                        if (this._pntrUp) {
                            this._pntrUp = false;
                            this.objects.forEach(o => {
                                o.onPointerUp(this.pntrW);
                            });
                            if (picked) {
                                picked.onPickedUp(this.pntrW);
                            }
                        }
                    }
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
    register() {
        this.canvas.addEventListener("pointerdown", e => {
            let b = this.canvas.getBoundingClientRect();
            this._pntrDn = true;
            this.pntrS.x = e.clientX - b.left;
            this.pntrS.y = e.clientY - b.top;
        });
        this.canvas.addEventListener("pointermove", e => {
            let b = this.canvas.getBoundingClientRect();
            this._pntrMv = true;
            this.pntrS.x = e.clientX - b.left;
            this.pntrS.y = e.clientY - b.top;
        });
        this.canvas.addEventListener("pointerup", e => {
            let b = this.canvas.getBoundingClientRect();
            this._pntrUp = true;
            this.pntrS.x = e.clientX - b.left;
            this.pntrS.y = e.clientY - b.top;
        });
        window.addEventListener("keydown", e => {
            let k = e.keyCode;
            this.objects.forEach(o => {
                o.onKeyDown(k);
            });
        });
        window.addEventListener("keyup", e => {
            let k = e.keyCode;
            this.objects.forEach(o => {
                o.onKeyUp(k);
            });
        });
    }
}
class Angle {
    static lerp(a1, a2, t = 0.5) {
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
    sqrLen() {
        let z = this;
        return z.x * z.x + z.y * z.y;
    }
    len() {
        return Math.sqrt(this.sqrLen());
    }
    add(v) {
        let z = this;
        return V.N(z.x + v.x, z.y + v.y);
    }
    sub(v) {
        let z = this;
        return V.N(z.x - v.x, z.y - v.y);
    }
    dot(v) {
        let z = this;
        return z.x * v.x + z.y * v.y;
    }
    static sqrDist(v1, v2) {
        let dx = v2.x - v1.x;
        let dy = v2.y - v1.y;
        return dx * dx + dy * dy;
    }
    static angle(v1, v2) {
        let dot = v1.dot(v2) / v1.len() / v2.len();
        let a = Math.acos(dot);
        if (v1.x * v2.y - v1.y * v2.x < 0) {
            a *= -1;
        }
        return a;
    }
    static dirToR(v) {
        return V.angle(V.N(0, 1), v);
    }
}
class SCollider {
    constructor(obj, radius = 10) {
        this.obj = obj;
        this.radius = radius;
    }
    containsPW(p) {
        let pOW = this.obj.pW;
        return V.sqrDist(pOW, p) < this.radius * this.radius;
    }
}
class GameObject {
    constructor(name = "noname", p = V.N(), r = 0, s = 1) {
        this.name = name;
        this.p = p;
        this.r = r;
        this.s = s;
        this.children = [];
        this.pW = V.N();
        this.xW = V.N();
        this.yW = V.N();
        this.rW = 0;
        this.sW = 0;
    }
    get parent() {
        return this._parent;
    }
    set parent(o) {
        if (this._parent) {
            let i = this._parent.children.indexOf(this);
            if (i !== -1) {
                this.parent.children.splice(i, 1);
            }
        }
        this._parent = o;
        o.children.push(this);
    }
    updateTransform() {
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
        z.yW.x = -Math.sin(this.r);
        z.yW.y = Math.cos(this.r);
        this.children.forEach(c => { c.updateTransform(); });
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
    update() { }
    draw(camera, canvas) { }
    onPickedDown(pW) { }
    onPickedMove(pW) { }
    onPickedUp(pW) { }
    onPointerDown(pW) { }
    onPointerMove(pW) { }
    onPointerUp(pW) { }
    onKeyDown(k) { }
    onKeyUp(k) { }
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
    pWToPS(pW) {
        let canvas = Engine.instance.canvas;
        let pCW = this.pW;
        let rCW = this.rW;
        let cCr = Math.cos(-rCW);
        let sCr = Math.sin(-rCW);
        return V.N(canvas.width * 0.5 + (cCr * (pW.x - pCW.x) - sCr * (pW.y - pCW.y)) / this.w * canvas.width, canvas.height * 0.5 - (sCr * (pW.x - pCW.x) + cCr * (pW.y - pCW.y)) / this.h * canvas.height);
    }
    pSToPW(pS) {
        let canvas = Engine.instance.canvas;
        let pCW = this.pW;
        let rCW = this.rW;
        let cCr = Math.cos(rCW);
        let sCr = Math.sin(rCW);
        let x = pS.x / canvas.width * this.w - this.w * 0.5;
        let y = -pS.y / canvas.height * this.h + this.h * 0.5;
        return V.N(cCr * x - sCr * y + pCW.x, sCr * x + cCr * y + pCW.y);
    }
}
