var EngineState;
(function (EngineState) {
    EngineState[EngineState["Off"] = 0] = "Off";
    EngineState[EngineState["Running"] = 1] = "Running";
    EngineState[EngineState["Paused"] = 2] = "Paused";
})(EngineState || (EngineState = {}));
var dt = 0.15;
class Engine {
    constructor(canvas) {
        this.canvas = canvas;
        this.state = EngineState.Off;
        this.objects = [];
        this.destroyTask = [];
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
        let t = Date.now();
        let loop = () => {
            let now = Date.now();
            dt = Math.min((now - t) / 1000, 1);
            t = now;
            if (this.state === EngineState.Running) {
                this.objects.forEach(o => {
                    o.update();
                });
                while (this.destroyTask.length > 0) {
                    this.destroyTask.pop().destroyNow();
                }
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
            this.objects[0].destroyNow();
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
    mul(f) {
        let z = this;
        return V.N(z.x * f, z.y * f);
    }
    unit() {
        let l = this.len();
        return V.N(this.x / l, this.y / l);
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
        if (this._parent) {
            this._parent.children.push(this);
        }
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
        if (en.state === EngineState.Running) {
            this.start();
        }
    }
    destroy() {
        Engine.instance.destroyTask.push(this);
    }
    destroyNow() {
        let en = Engine.instance;
        let i = en.objects.indexOf(this);
        if (i !== -1) {
            en.objects.splice(i, 1);
        }
    }
    pLToPW(pL) {
        let z = this;
        let cr = Math.cos(z.rW);
        let sr = Math.sin(z.rW);
        return V.N(((cr * pL.x - sr * pL.y) * z.sW + z.pW.x), ((sr * pL.x + cr * pL.y) * z.sW + z.pW.y));
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
class Line {
    constructor(col, ...points) {
        this.col = col;
        this.pts = [];
        this.col = col;
        this.pts = points;
    }
    static Parse(s) {
        let sS = s.split(":");
        let c = sS[0];
        let pts = [];
        sS = sS[1].split(" ");
        for (let i = 0; i < sS.length; i++) {
            let xy = sS[i].split(",");
            let x = parseInt(xy[0]);
            let y = parseInt(xy[1]);
            pts.push(V.N(x, y));
        }
        return new Line(c, ...pts);
    }
}
class LineMesh extends GameObject {
    constructor() {
        super(...arguments);
        this.lines = [];
        this.size = 5;
    }
    draw(camera, canvas) {
        let ctx = canvas.getContext("2d");
        ctx.lineCap = "round";
        ctx.lineWidth = 2;
        let pW = this.pW;
        let rW = this.rW;
        let sW = this.sW;
        let cr = Math.cos(rW);
        let sr = Math.sin(rW);
        this.lines.forEach(l => {
            if (l.pts.length === 0) {
                return;
            }
            let ptsS = [];
            for (let i = 0; i < l.pts.length; i++) {
                let pt = l.pts[i];
                let ptW = V.N(((cr * pt.x - sr * pt.y) * this.size * sW + pW.x), ((sr * pt.x + cr * pt.y) * this.size * sW + pW.y));
                ptsS.push(camera.pWToPS(ptW));
            }
            ctx.beginPath();
            ctx.moveTo(ptsS[0].x, ptsS[0].y);
            for (let i = 1; i < ptsS.length; i++) {
                let p = ptsS[i];
                ctx.lineTo(p.x, p.y);
            }
            ctx.strokeStyle = l.col;
            ctx.stroke();
        });
    }
}
class RectMesh extends LineMesh {
    constructor(w, h, col = "white") {
        super("rect");
        this.w = w;
        this.h = h;
        this.lines = [new Line(col, V.N(-w * 0.5, -h * 0.5), V.N(w * 0.5, -h * 0.5), V.N(w * 0.5, h * 0.5), V.N(-w * 0.5, h * 0.5), V.N(-w * 0.5, -h * 0.5))];
    }
}
class Fighter extends LineMesh {
    constructor() {
        super(...arguments);
        this.speed = V.N();
        this.cX = 0.005;
        this.cY = 0.0001;
        this._rSpeed = 0;
        this.cR = 2;
        this._thrust = 10;
        this._l = false;
        this._r = false;
        this._u = false;
        this._d = false;
    }
    update() {
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
            this._rSpeed = Math.max(this._rSpeed, -Math.PI * 0.5);
        }
        console.log(this._thrust.toFixed(0) + " " + (this._rSpeed / (Math.PI * 2)).toFixed(2));
        let sX = this.speed.dot(this.xW);
        let sY = this.speed.dot(this.yW);
        let fX = this.xW.mul(-sX * Math.abs(sX) * this.cX);
        let fY = this.yW.mul(-sY * Math.abs(sY) * this.cY);
        this.speed = this.speed.add(this.yW.mul(this._thrust * dt));
        this.speed = this.speed.add(fX.mul(dt));
        this.speed = this.speed.add(fY.mul(dt));
        this.p = this.p.add(this.speed.mul(dt));
        this._rSpeed = this._rSpeed - (this._rSpeed * Math.abs(this._rSpeed) * this.cR * dt);
        this.r += this._rSpeed * dt;
    }
    onKeyDown(key) {
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
    onKeyUp(key) {
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
    start() {
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
    constructor(owner) {
        super("bullet");
        this.owner = owner;
        this._speed = V.N();
        this._life = 1;
        this.size = 2.5;
        this.p = owner.pLToPW(V.N(4.5, 6).mul(owner.size));
        this.r = owner.r;
        this.updateTransform();
        this._speed = this.yW.mul(200).add(owner.speed);
    }
    start() {
        this.lines = [
            Line.Parse("white:-1,-2 -1,2 0,3 1,2 1,-2 -1,-2")
        ];
    }
    update() {
        this.p = this.p.add(this._speed.mul(dt));
        this._life -= dt;
        if (this._life < 0) {
            this.destroy();
        }
    }
}
class PlaneCamera extends Camera {
    constructor(plane) {
        super("planeCamera");
        this.plane = plane;
    }
    update() {
        this.p.x = this.p.x * 59 / 60 + this.plane.p.x / 60;
        this.p.y = this.p.y * 59 / 60 + this.plane.p.y / 60;
    }
}
class EditableLine extends LineMesh {
    constructor() {
        super(...arguments);
        this.colors = [
            "red",
            "lime",
            "blue",
            "yellow",
            "cyan",
            "magenta",
            "white"
        ];
        this.colorIndex = 0;
        this.currentLineIndex = -1;
        this.currentPointIndex = -1;
        this.isCreationMode = false;
        this.isDeletionMode = false;
    }
    start() {
        this.size = 10;
        this.lines = [];
        this._preview = new LineMesh();
        this._preview.size = 10;
        this._preview.instantiate();
    }
    pWToLineIndex(pW) {
        let index = -1;
        let bestDD = Infinity;
        this.lines.forEach((l, lIndex) => {
            l.pts.forEach(p => {
                let dd = V.sqrDist(pW, p.mul(this.size));
                if (dd < bestDD) {
                    bestDD = dd;
                    index = lIndex;
                }
            });
        });
        return index;
    }
    pWToPointIndex(pW, l) {
        let index = -1;
        let bestDD = Infinity;
        l.pts.forEach((p, pIndex) => {
            let dd = V.sqrDist(pW, p.mul(this.size));
            if (dd < bestDD) {
                bestDD = dd;
                index = pIndex;
            }
        });
        return index;
    }
    onPointerDown(pW) {
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
        console.log(this.currentLineIndex + " / " + this.lines.length + " " + this.currentPointIndex);
    }
    onPointerMove(pW) {
        if (this.isCreationMode) {
            if (pW.sqrLen() < 150 * 150) {
                let cursor = V.N(Math.round(pW.x / this.size), Math.round(pW.y / this.size));
                let currentLine = this.lines[this.currentLineIndex];
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
    _hidePreview() {
        this._preview.lines = [];
    }
    onPointerUp(pW) {
        if (pW.sqrLen() > 150 * 150) {
            return;
        }
        if (this.isDeletionMode) {
            this.isDeletionMode = false;
            let cursor = V.N(Math.round(pW.x / this.size), Math.round(pW.y / this.size));
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
                let newLine = new Line(this.colors[this.colorIndex], V.N(Math.round(pW.x / this.size), Math.round(pW.y / this.size)));
                this.colorIndex = (this.colorIndex + 1) % this.colors.length;
                this.lines.push(newLine);
                this.currentLineIndex = 0;
            }
            else if (this.currentLineIndex === -1) {
                this.currentLineIndex = this.pWToLineIndex(pW);
            }
            else {
                this.lines[this.currentLineIndex].pts.push(V.N(Math.round(pW.x / this.size), Math.round(pW.y / this.size)));
            }
        }
        else {
            this.currentPointIndex = -1;
        }
    }
}
class EditableLineNewLineButton extends LineMesh {
    start() {
        this.size = 5;
        this.p = V.N(-180, 180);
        this.lines = [
            Line.Parse("blue:-1,-1 -1,1 1,1 1,-1 -1,-1")
        ];
        this._check = Line.Parse("blue:-1,0 1,0 0,0 0,-1 0,1");
        this.collider = new SCollider(this, 5);
    }
    update() {
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
    onPickedUp() {
        this.target.isCreationMode = !this.target.isCreationMode;
        if (this.target.isCreationMode) {
            let newLine = new Line(this.target.colors[this.target.colorIndex]);
            this.target.colorIndex = (this.target.colorIndex + 1) % this.target.colors.length;
            this.target.lines.push(newLine);
            this.target.currentLineIndex = this.target.lines.length - 1;
        }
    }
}
class EditableLineDeleteButton extends LineMesh {
    start() {
        this.size = 5;
        this.p = V.N(-180, 160);
        this.lines = [
            Line.Parse("red:-1,-1 -1,1 1,1 1,-1 -1,-1")
        ];
        this._check = Line.Parse("red:-1,0 1,0 0,0 0,-1 0,1");
        this.collider = new SCollider(this, 5);
    }
    update() {
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
    onPickedUp() {
        this.target.isDeletionMode = !this.target.isDeletionMode;
    }
}
class Grid extends LineMesh {
    start() {
        this.lines = [];
        for (let i = -100; i <= 100; i += 5) {
            let hLine = new Line("rgb(32, 64, 64)");
            hLine.pts = [V.N(-100, i), V.N(100, i)];
            let vLine = new Line("rgb(32, 64, 64)");
            vLine.pts = [V.N(i, -100), V.N(i, 100)];
            this.lines.push(hLine, vLine);
        }
    }
}
class FatArrow extends LineMesh {
    constructor() {
        super(...arguments);
        this._target = V.N();
    }
    start() {
        this.lines = [
            new Line("yellow", V.N(-20, -20), V.N(-20, 20), V.N(0, 40), V.N(20, 20), V.N(20, -20), V.N(-20, -20))
        ];
        this.collider = new SCollider(this, 20);
    }
    update() {
        let dir = this._target.sub(this.p);
        let r = V.dirToR(dir);
        if (isFinite(r)) {
            this.r = Angle.lerp(this.r, r, 0.1);
        }
        this.p.x = this.p.x * 0.9 + this._target.x * 0.1;
        this.p.y = this.p.y * 0.9 + this._target.y * 0.1;
    }
    onPointerMove(pW) {
        pW.copy(this._target);
    }
}
class AltSpaceShip extends LineMesh {
    constructor() {
        super(...arguments);
        this._k = 0;
    }
    start() {
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
    update() {
        this.p.x = 100 * Math.cos(this._k / 100);
        this.p.y = 50 * Math.sin(this._k / 50);
        this.r = this._k / 60;
        this.s = 1.5 + Math.sin(this._k / 50);
        this._k++;
    }
}
class KeyboardCam extends Camera {
    constructor() {
        super(...arguments);
        this._l = false;
        this._r = false;
        this._u = false;
        this._d = false;
        this._rP = false;
        this._rM = false;
    }
    update() {
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
    onKeyDown(key) {
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
    onKeyUp(key) {
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
    let canvas = document.getElementById("canvas");
    canvas.width = 800;
    canvas.height = 800;
    canvas.style.width = "800px";
    canvas.style.height = "800px";
    let en = new Engine(canvas);
    let grid = new Grid();
    grid.instantiate();
    let fighter = new Fighter();
    fighter.instantiate();
    let camera = new PlaneCamera(fighter);
    //let camera = new KeyboardCam();
    //camera.r = 0.8;
    camera.setW(800, canvas);
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
};
