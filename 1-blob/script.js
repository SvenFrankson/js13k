function scaleColor(hC, s) {
    let o = hC.length === 7 ? 1 : 0;
    let r = mf(pi(hC.substring(o, o + 2), 16) * s);
    let g = mf(pi(hC.substring(o + 2, o + 4), 16) * s);
    let b = mf(pi(hC.substring(o + 4, o + 6), 16) * s);
    return (o === 1 ? "#" : "") + r.toString(16).padStart(2, "0") + g.toString(16).padStart(2, "0") + b.toString(16).padStart(2, "0");
}

function lerpColor(hC1, hC2, d) {
    let o = hC1.length === 7 ? 1 : 0;
    let r1 = pi(hC1.substring(o, o + 2), 16);
    let g1 = pi(hC1.substring(o + 2, o + 4), 16);
    let b1 = pi(hC1.substring(o + 4, o + 6), 16);
    let r2 = pi(hC2.substring(o, o + 2), 16);
    let g2 = pi(hC2.substring(o + 2, o + 4), 16);
    let b2 = pi(hC2.substring(o + 4, o + 6), 16);
    let r = mf(r1 * (1 - d) + r2 * d);
    let g = mf(g1 * (1 - d) + g2 * d);
    let b = mf(b1 * (1 - d) + b2 * d);
    return (o === 1 ? "#" : "") + r.toString(16).padStart(2, "0") + g.toString(16).padStart(2, "0") + b.toString(16).padStart(2, "0");
}

var gk = 0;
var mf = Math.floor;
var mr = Math.random;
var mc = Math.cos;
var ms = Math.sin;
var pi = parseInt;
var sc = 0;
var cBlk = "#475250";
var cLBlk = "#556663";
var cGrn = "#b5eecb";

class Engine {
    constructor(w, h) {
        this.cX = 0;
        this.cY = 0;
        this.speed = 1;
        this.w = w;
        this.h = h;
        this.cnv = document.getElementsByTagName("canvas")[0];
        this.cnv.width = this.w;
        this.cnv.height = this.h;
        this.ctx = this.cnv.getContext("2d");
        this.gos = [];
        this.txts = [];
        this.tiles = [];

        let bgC = document.createElement("canvas");
        bgC.width = 2 * w;
        bgC.height = 2 * h;
        let bgCtx = bgC.getContext("2d");
        bgCtx.fillStyle = cBlk;
        bgCtx.fillRect(0, 0, 2 * w, 2 * h);
        for (let i = 0; i < 20; i++) {
            bgCtx.lineWidth = 1;
            let x = mr() * 2 * w;
            let y = mr() * 2 * h;
            let r = mr() * 200 + 50;
            for (let ii = -1; ii <= 1; ii++) {
                for (let jj = -1; jj <= 1; jj++) {
                    bgCtx.beginPath();
                    bgCtx.arc(ii * 2 * w + x, jj * 2 * h + y, r, 0, 2 * Math.PI);
                    bgCtx.strokeStyle = cLBlk;
                    bgCtx.stroke();
                }
            }
        }
        this.bgData = bgCtx.getImageData(0, 0, 2 * w, 2 * h);
    }

    destroy() {
        while (this.gos[0]) {
            this.gos[0].destroy();
        }
    }

    update() {
        gk++;
        this.updateTiles();
        this.gos.forEach(
            go => {
                if (go.update) {
                    go.update();
                }
            }
        )
        if (this.blob) {
            this.blob.update();
            if (!this.blob.nFrz) {
                let newCX = (this.blob.pN.x + this.blob.pB.x) * 0.5;
                let newCY = (this.blob.pN.y + this.blob.pB.y) * 0.5;
                let dX = newCX - this.cX;
                if (dX > this.blob.nT * 2) {
                    dX = this.blob.nT * 2;
                }
                if (dX < - this.blob.nT * 2) {
                    dX = - this.blob.nT * 2;
                }
                let dY = newCY - this.cY;
                if (dY > this.blob.nT * 2) {
                    dY = this.blob.nT * 2;
                }
                if (dY < - this.blob.nT * 2) {
                    dY = - this.blob.nT * 2;
                }
                this.cX += dX;
                this.cY += dY;
            }
        }
        document.getElementById("score").innerText = sc.toFixed(0).padStart(6, "0");
    }

    updateTiles() {
        if (this.blob) {
            let I = Math.floor(this.blob.pB.x / 2000);
            let J = Math.floor(this.blob.pB.y / 2000);
            let newTiles = [];
            let i = 0;
            while (i < this.tiles.length) {
                let t = this.tiles[i];
                if (Math.abs(t.i - I) < 3 && Math.abs(t.j - J) < 3) {
                    newTiles.push(t);
                    this.tiles.splice(i, 1);
                }
                else {
                    i++;
                }
            }
            this.tiles.forEach(t => {
                t.destroy();
            })
            for (let i = -1; i < 2; i++) {
                for (let j = -1; j < 2; j++) {
                    if (!newTiles.find(t => { return t.i === (I + i) && t.j === (J + j); })) {
                        let t = new Tile(this, I + i, J + j);
                        t.instantiate();
                        newTiles.push(t);
                    }
                }
            }
            this.tiles = newTiles;
        }
        this.tiles.forEach(t => {
            t.update();
        })
    }

    draw() {
        let x = - this.cX;
        while (x < 0) {
            x += 2 * this.w;
        }
        while (x > 2 * this.w) {
            x -= 2 * this.w;
        }
        let y = - this.cY;
        while (y < 0) {
            y += 2 * this.h;
        }
        while (y > 2 * this.h) {
            y -= 2 * this.h;
        }
        this.ctx.putImageData(this.bgData, x, y);
        this.ctx.putImageData(this.bgData, x - 2 * this.w, y);
        this.ctx.putImageData(this.bgData, x, y - 2 * this.h);
        this.ctx.putImageData(this.bgData, x - 2 * this.w, y - 2 * this.h);
        this.gos.forEach(
            go => {
                if (go.draw) {
                    go.draw();
                }
            }
        )
        if (this.blob) {
            this.blob.draw();
        }
        this.txts.forEach(
            t => {
                if (t.draw) {
                    t.draw();
                }
            }
        )
    }
}

class Tile {
    constructor(en, i, j) {
        this.en = en;
        this.i = i;
        this.j = j;
        this.x = i * 2000;
        this.y = j * 2000;
        this.k = 0;
        this.stns = [];
        this.spks = [];
        this.cons = [];
        this.strs = [];
    }

    rx() {
        return this.x + mr() * 2000;
    }

    ry() {
        return this.y + mr() * 2000;
    }

    addStone() {
        let s = new Stone(this, 2 + mf(5 * mr()), 5 + 10 * mr());
        s.p.x = this.rx();
        s.p.y = this.ry();
        if (this.check(s.p.x, s.p.y)) {
            s.instantiate();
            this.stns.push(s);
        }
    }

    addSpike() {
        let s = new Spike(this, 1 + mf(3 * mr()), 2 + 5 * mr());
        s.p.x = this.rx();
        s.p.y = this.ry();
        if (this.check(s.p.x, s.p.y)) {
            s.instantiate();
            this.spks.push(s);
        }
    }

    addCoin() {
        let c = new Coin(this, 1 + mf(3 * mr()), 2 + 5 * mr());
        c.p.x = this.rx();
        c.p.y = this.ry();
        if (this.check(c.p.x, c.p.y)) {
            c.instantiate();
            this.cons.push(c);
        }
    }
    
    addStruct() {
        let r = mr();
        let st;
        if (r < 0.25) {
            st = new Tunnel(this, 300);
        }
        else if (r < 0.5) {
            st = new Shell(this, 200);
        }
        else if (r < 0.75) {
            st = new Snake(this, 400);
        }
        else {
            st = new HotCore(this, 150);
        }
        st.p.x = this.rx();
        st.p.y = this.ry();
        if (this.check(st.p.x, st.p.y)) {
            st.dir = mr() * Math.PI * 2;
            st.instantiate();
            this.strs.push(st);
        }
    }

    check(x, y) {
        if (Math.abs(x - this.en.blob.pB.x) > 200) {
            if (Math.abs(x - this.en.blob.pB.x) > 200) {
                return true;
            }
        }
        return false;
    }

    instantiate() {
        for (let i = 0; i < 20; i++) {
            this.addStone();
        }

        for (let i = 0; i < 8; i++) {
            this.addSpike();
        }

        for (let i = 0; i < 12; i++) {
            this.addCoin();
        }
        
        for (let i = 0; i < 4; i++) {
            this.addStruct();
        }
    }

    destroy() {
        let gos = [...this.stns, ...this.spks, ...this.cons, ...this.strs];
        gos.forEach(g => {
            g.destroy(true);
        });
    }

    update() {
        if (this.cons.length < 12 * (1 + gk / 3600)) {
            this.addCoin();
        }
        if (this.spks.length < 8 * (1 + gk / 3600)) {
            this.addSpike();
        }
        if (this.strs.length < 4 * (1 + gk / 3600)) {
            this.addStruct();
        }
    }
}

class GameObject {
    constructor(t) {
        this.t = t;
        this.en = t.en;
    }

    instantiate() {
        this.en.gos.push(this);
    }

    destroy() {
        let i = this.en.gos.indexOf(this);
        if (i !== -1) {
            this.en.gos.splice(i, 1);
        }
        this.dstryd = true;
    }
}

class FloatingText {
    constructor(e, t) {
        this.en = e;
        this.t = t;
        this.s = 1;
        this.k = 0;
        this.p = { x: 0, y: 0};
        this.dx = mr() * 2 - 1;
        this.dy = mr() * 2;
    }

    instantiate() {
        this.en.txts.push(this);
    }

    destroy() {
        let i = this.en.txts.indexOf(this);
        if (i !== -1) {
            this.en.txts.splice(i, 1);
        }
    }

    draw() {
        this.k++;
        this.s = Math.sin(this.k / 60 * Math.PI) * 20;
        let ctx = this.en.ctx;
        let oX = this.en.w * 0.5 - this.en.cX;
        let oY = this.en.h * 0.5 - this.en.cY;

        let x = oX + this.p.x + this.k * this.dx;
        let y = oY + this.p.y - 2 * this.k * this.dy;

        ctx.font = this.s.toFixed(0) + "px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.fillText(this.t, x, y);

        if (this.k > 60) {
            this.destroy();
        }
    }
}

class Disc extends GameObject {

    constructor(t, s, h, color) {
        super(t);
        this.type = "disc";
        this.s = s;
        this.r = s * 10;
        this.h = h;
        this.p = { x: 0, y: 0};
        this.color = color;
        this.colorShadow = scaleColor(color, 0.5);
    }

    destroy(frc) {
        if (!frc) {
            let dstrydDisc = new DstryDisc(this);
            dstrydDisc.instantiate();
        }
        super.destroy();
    }

    draw() {
        let z = this;
        let ctx = z.en.ctx;
        ctx.lineWidth = 2;
        let oX = z.en.w * 0.5 - z.en.cX;
        let oY = z.en.h * 0.5 - z.en.cY;

        let x = oX + z.p.x;
        let y = oY + z.p.y;

        if (x > - 20 - z.r) {
            if (y > - 20 - z.r) {
                if (x < z.en.w + 20 + z.r) {
                    if (y < z.en.h + 20 + z.r) {
                        let dx = z.h - 2 * z.h * x / z.en.w;
                        let dy = z.h - 2 * z.h * y / z.en.h;
                        
                        ctx.beginPath();
                        ctx.arc(x + dx, y + dy, z.r, 0, 2 * Math.PI);
                        ctx.strokeStyle = z.colorShadow;
                        ctx.stroke();
                        
                        ctx.beginPath();
                        ctx.arc(x, y, z.r, 0, 2 * Math.PI);
                        ctx.strokeStyle = z.color;
                        ctx.stroke();
                    }
                }
            }
        }
    }

    collide(x, y, r) {
        let dx = x - this.p.x;
        let dy = y - this.p.y;
        let dd = dx * dx + dy * dy;
        return dd < (r + this.r) * (r + this.r);
    }

    collisionNormal(x, y, r) {
        let dx = x - this.p.x;
        let dy = y - this.p.y;
        let dd = dx * dx + dy * dy;
        if (dd < (r + this.r) * (r + this.r)) {
            let d = Math.sqrt(dd);
            let n = { x: dx / d, y: dy / d}
            return n;
        }
    }
}

class DstryDisc extends Disc {

    constructor(d) {
        super(d.t, d.s, d.h, d.color);
        this.type = "dstryd";
        this.p = d.p;
    }

    destroy() {
        super.destroy(true);
    }

    update() {
        this.r *= 0.8;
        if (this.r < 1) {
            this.destroy();
        }
    }
}

class Structure extends GameObject {

    constructor(e, r) {
        super(e);
        this.dir = 0;
        this.k = 0;
        this.p = { x: 0, y: 0};
        this.r = r;
        this.a = 0;
    }

    instantiate() {
        this.en.gos.push(this);
        this.coins.forEach(c => {
            c.instantiate();
        })
        this.spikes.forEach(s => {
            s.instantiate();
        })
    }

    destroy() {
        let i = this.en.gos.indexOf(this);
        if (i !== -1) {
            this.en.gos.splice(i, 1);
        }
        i = this.t.strs.indexOf(this);
        if (i !== -1) {
            this.t.strs.splice(i, 1);
        }
        this.coins.forEach(c => {
            c.destroy();
        })
        this.spikes.forEach(s => {
            s.destroy();
        })
    }

    check() {
        let alv = false;
        let i = 0;
        this.coins.forEach(c => {
            if (!c.dstryd) {
                alv = true;
            }
        })
        if (!alv) {
            this.destroy();
            return false;
        }
        alv = false;
        this.spikes.forEach(s => {
            if (!s.dstryd) {
                alv = true;
            }
        })
        if (!alv) {
            this.destroy();
            return false;
        }
        return true;
    }

    update() {
        let cosd = mc(this.dir);
        let sind = mc(this.dir);
        this.p.x += cosd * 0.2
        this.p.y += sind * 0.2;
        this.dir = mc(this.k / 1000) * Math.PI;
        this.k++;
        this.a += Math.PI / 1200;
    }
}

class Tunnel extends Structure {

    constructor(t, r) {
        super(t, r);
        this.coins = [
            new Coin(t, 2, 5),
            new Coin(t, 2, 5),
            new Coin(t, 2, 5),
            new Coin(t, 2, 5)
        ];
        this.spikes = [
            new Spike(t, 1, 5),
            new Spike(t, 1, 5),
            new Spike(t, 1, 5),
            new Spike(t, 1, 5)
        ];
    }

    update() {
        if (this.check()) {
            super.update();
            let cosa = mc(this.a);
            let sina = ms(this.a);
            this.coins.forEach(
                (c, i) => {
                    c.p.x = cosa * this.r * (i - 2) / 3 + this.p.x;
                    c.p.y = sina * this.r * (i - 2) / 3 + this.p.y;
                }
            );
            this.spikes.forEach(
                (s, i) => {
                    let c = this.coins[i];
                    let sign = i % 2 === 0 ? 1 : -1;
                    s.p.x = c.p.x + sign * sina * this.r / 3;
                    s.p.y = c.p.y - sign * cosa * this.r / 3;
                }
            );
        }
    }
}

class Shell extends Structure {

    constructor(t, r) {
        super(t, r);
        this.coins = [
            new Coin(t, 2, 5),
            new Coin(t, 2, 5),
            new Coin(t, 2, 5),
            new Coin(t, 2, 5)
        ];
        this.spikes = [
            new Spike(t, 1, 5),
            new Spike(t, 1, 5),
            new Spike(t, 1, 5),
            new Spike(t, 1, 5)
        ];
    }

    update() {
        if (this.check()) {
            super.update(); 
            this.coins.forEach(
                (c, i) => {
                    let cosa = mc(this.a + i * Math.PI / 2);
                    let sina = ms(this.a + i * Math.PI / 2);
                    c.p.x = cosa * this.r / 3 + this.p.x;
                    c.p.y = sina * this.r / 3 + this.p.y;
                }
            );
            this.spikes.forEach(
                (s, i) => {
                    let cosa = mc(this.a + i * Math.PI / 2);
                    let sina = ms(this.a + i * Math.PI / 2);
                    s.p.x = cosa * this.r + this.p.x;
                    s.p.y = sina * this.r + this.p.y;
                }
            );
        }
    }
}

class HotCore extends Structure {

    constructor(t, r) {
        super(t, r);
        this.coins = [
            new Coin(t, 2, 5),
            new Coin(t, 2, 5),
            new Coin(t, 2, 5),
            new Coin(t, 2, 5)
        ];
        this.spikes = [
            new Spike(t, 1, 5),
            new Spike(t, 1, 5),
            new Spike(t, 1, 5),
            new Spike(t, 1, 5)
        ];
    }

    update() {
        if (this.check()) {
            super.update();
            let z = this;
            z.coins.forEach(
                (c, i) => {
                    let cosa = mc(z.a + i * Math.PI / 2);
                    let sina = ms(z.a + i * Math.PI / 2);
                    c.p.x = cosa * z.r + z.p.x;
                    c.p.y = sina * z.r + z.p.y;
                }
            );
            z.spikes.forEach(
                (s, i) => {
                    let cosa = mc(z.a + i * Math.PI / 2 + Math.PI / 4);
                    let sina = ms(z.a + i * Math.PI / 2 + Math.PI / 4);
                    s.p.x = cosa * z.r * 0.5 + z.p.x;
                    s.p.y = sina * z.r * 0.5 + z.p.y;
                }
            );
        }
    }
}

class Snake extends Structure {

    constructor(t, l) {
        super(t);
        this.l = l;
        this.r = l / 6;
        this.coins = [
            new Coin(t, 2, 5),
            new Coin(t, 2, 5),
            new Coin(t, 2, 5),
            new Coin(t, 2, 5)
        ];
        this.spikes = [
            new Spike(t, 1, 5)
        ];
    }

    update() {
        if (this.check()) {
            let b = this.en.blob;
            let dx = b.pN.x - this.p.x;
            let dy = b.pN.y - this.p.y;
            let d = Math.sqrt(dx * dx + dy * dy);
            dx /= d;
            dy /= d;
            if (d < 800) {
                this.p.x += dx * 0.5;
                this.p.y += dy * 0.5;
            }
            else {
                super.update();
            }
            this.spikes[0].p.x = this.p.x;
            this.spikes[0].p.y = this.p.y;
            let pr = this.spikes[0];
            for (let i = 0; i < this.coins.length; i++) {
                let c = this.coins[i];
                if (c) {
                    let dx = c.p.x - pr.p.x;
                    let dy = c.p.y - pr.p.y;
                    let d = dx * dx + dy * dy;
                    if (d > this.r * this.r) {
                        d = Math.sqrt(d);
                        dx /= d;
                        dy /= d;
                        c.p.x = pr.p.x + dx * this.r;
                        c.p.y = pr.p.y + dy * this.r;
                    }
                    pr = c;
                }
            }
        }
    }
}

var coins = [];
class Coin extends Disc {
    
    constructor(t, r, h) {
        super(t, r, h, "#b5eecb");
        this.type = "coin";
    }

    instantiate() {
        super.instantiate();
        coins.push(this);
    }

    destroy() {
        super.destroy();
        let i = coins.indexOf(this);
        if (i !== -1) {
            coins.splice(i, 1);
        }
        i = this.t.cons.indexOf(this);
        if (i !== -1) {
            this.t.cons.splice(i, 1);
        }
    }
}

class Spike extends Disc {
    constructor(t, r, h) {
        super(t, r, h, "#f8a2a8");
        this.type = "spike";
    }

    destroy() {
        super.destroy();
        let i =  this.t.spks.indexOf(this);
        if (i !== -1) {
            this.t.spks.splice(i, 1);
        }
    }
}

class Stone extends Disc {
    constructor(t, r, h) {
        super(t, r, h, "#9589a9");
        this.type = "stone";
        this.bmp = 0;
        this.bmpg = false;
    }

    draw() {
        let z = this;
        if (z.bmpg) {
            z.bmp += 1 + z.s * 0.5;
            z.bmpg = z.bmp < 3 * z.size;
        }
        else {
            z.bmp = Math.max(z.bmp - 0.5, 0);
        }
        let ctx = z.en.ctx;
        ctx.lineWidth = 2;
        let oX = z.en.w * 0.5 - z.en.cX;
        let oY = z.en.h * 0.5 - z.en.cY;

        let x = oX + z.p.x;
        let y = oY + z.p.y;

        if (x > - 20 - z.r) {
            if (y > - 20 - z.r) {
                if (x < z.en.w + 20 + z.r) {
                    if (y < z.en.h + 20 + z.r) {
                        let dx = z.h - 2 * z.h * x / z.en.w;
                        let dy = z.h - 2 * z.h * y / z.en.h;
                        
                        ctx.beginPath();
                        ctx.arc(x + dx, y + dy, z.r + z.bmp, 0, 2 * Math.PI);
                        ctx.strokeStyle = z.colorShadow;
                        ctx.stroke();
                        
                        ctx.beginPath();
                        ctx.arc(x, y, z.r + z.bmp, 0, 2 * Math.PI);
                        ctx.strokeStyle = z.color;
                        ctx.stroke();
                    }
                }
            }
        }
    }
}

class Blob {

    constructor(e) {
        let z = this;
        z.en = e;
        z.combo = 1;
        z.hpM = 20;
        z.hp = z.hpM;
        z.springK = 6;
        z.mBod = 3;
        z.mNuc = 1;
        z.nFrz = false;
        z.nT = 1;
        z.pN = { x: 50, y: 30 };
        z.vN = { x: 0, y: 0 };
        z.pB = { x: -50, y: 20 };
        z.vB = { x: 0, y: 0 };
        z.pA = { x: 0, y: 0};
        z.flk = 0;
    }

    draw() {
        let z = this;
        if (!playing) {
            return;
        }
        let ctx = z.en.ctx;
        let oX = z.en.w * 0.5 - z.en.cX;
        let oY = z.en.h * 0.5 - z.en.cY;

        let rN = 20;
        let rB = 30;

        let dX = z.pB.x - z.pN.x;
        let dY = z.pB.y - z.pN.y;
        let d = Math.sqrt(dX * dX + dY * dY);
        dX /= d;
        dY /= d;

        rB -= d / 10;
        rB = Math.max(rB, rN);

        z.flk = Math.max(z.flk - 1, 0);
        let c = lerpColor(cGrn, cBlk, 1 - z.hp / z.hpM);
        if (z.flk > 0) {
            let co = Math.cos(z.flk * Math.PI * 2 / 60 * 6) * 0.5 + 0.5;
            c = lerpColor(c, "#f8a2a8", co);
        }

        ctx.beginPath();
        ctx.arc(oX + z.pB.x, oY + z.pB.y, rB + 2, 0, 2 * Math.PI);
        ctx.fillStyle = c;
        ctx.fill();

        for (let i = 0; i < d * 0.5; i += 2) {
            let dd = 1 - i / (0.5 * d);
            dd = dd * dd;
            let r = rN * dd + rN * 0.5 * (1 - dd);
            ctx.beginPath();
            ctx.arc(oX + z.pN.x + dX * i, oY + z.pN.y + dY * i, r + 2, 0, 2 * Math.PI);
            ctx.fill();
        }

        for (let i = d * 0.5; i < d; i += 2) {
            let dd = (i - 0.5 * d) / (0.5 * d);
            dd = Math.pow(dd, 1.5);
            let r = rN * 0.5 * (1 - dd) + rB * dd;
            ctx.beginPath();
            ctx.arc(oX + z.pN.x + dX * i, oY + z.pN.y + dY * i, r + 2, 0, 2 * Math.PI);
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(oX + z.pN.x, oY + z.pN.y, rN + 2, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = cBlk;
        ctx.beginPath();
        ctx.arc(oX + z.pB.x, oY + z.pB.y, rB, 0, 2 * Math.PI);
        ctx.fill();

        for (let i = 0; i < d * 0.5; i += 2) {
            let dd = 1 - i / (0.5 * d);
            dd = dd * dd;
            let r = rN * dd + rN * 0.5 * (1 - dd);
            ctx.beginPath();
            ctx.arc(oX + z.pN.x + dX * i, oY + z.pN.y + dY * i, r, 0, 2 * Math.PI);
            ctx.fill();
        }

        for (let i = d * 0.5; i < d; i += 2) {
            let dd = (i - 0.5 * d) / (0.5 * d);
            dd = Math.pow(dd, 1.5);
            let r = rN * 0.5 * (1 - dd) + rB * dd;
            ctx.beginPath();
            ctx.arc(oX + z.pN.x + dX * i, oY + z.pN.y + dY * i, r, 0, 2 * Math.PI);
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(oX + z.pN.x, oY + z.pN.y, rN, 0, 2 * Math.PI);
        ctx.fill();
    }

    brk() {
        this.nFrz = false;
        this.nT = 0;
    }

    update() {
        let z = this;
        if (z.hp <= 0) {
            gameover();
        }
        if (z.nFrz) {
            z.nT -= 1 / 120;
        }
        else {
            z.nT += 1 / 90;
            z.nT = Math.min(z.nT, 1);
        }

        if (z.nT < 0) {
            z.brk;
        }

        let fBoNX = z.pB.x - z.pN.x;
        let fBoNY = z.pB.y - z.pN.y;
        let d = Math.sqrt(fBoNX * fBoNX + fBoNY * fBoNY);
        if (d > 0) {
            fBoNX /= d;
            fBoNY /= d;
            let fNoBX = - fBoNX;
            let fNoBY = - fBoNY;

            z.vN.x += fBoNX * d * z.springK / 60 / z.mNuc;
            z.vN.y += fBoNY * d * z.springK / 60 / z.mNuc;

            z.vB.x += fNoBX * d * z.springK / 60 / z.mBod;
            z.vB.y += fNoBY * d * z.springK / 60 / z.mBod;
        }

        coins = coins.sort((c1, c2) => { 
            let dx1 = (c1.p.x - z.pN.x);
            dx1 *= dx1;
            let dy1 = (c1.p.y - z.pN.y);
            dy1 *= dy1;
            let dx2 = (c2.p.x - z.pN.x);
            dx2 *= dx2;
            let dy2 = (c2.p.y - z.pN.y);
            dy2 *= dy2;
            return (dx1 + dy1) - (dx2 + dy2);
        })

        let cC = coins[0];
        if (cC) {
            let fCoNX = cC.p.x - z.pN.x;
            let fCoNY = cC.p.y - z.pN.y;
            let d = Math.sqrt(fCoNX * fCoNX + fCoNY * fCoNY);
            if (d > 0) {
                fCoNX /= d;
                fCoNY /= d;
                let g = (50 / (d / 100) / (d / 100));
                fCoNX *= g / 60 / z.mNuc;
                fCoNY *= g / 60 / z.mNuc;
                z.vN.x += fCoNX;
                z.vN.y += fCoNY;
            }
        }

        if (z.nFrz) {
            let fAoBX = z.pA.x - z.pB.x;
            let fAoBY = z.pA.y - z.pB.y;
            let dA = Math.sqrt(fAoBX * fAoBX + fAoBY * fAoBY);
            if (dA > 0) {
                fAoBX /= dA;
                fAoBY /= dA;
    
                z.vB.x += fAoBX * dA * z.springK * 100 / 60 / z.mBod;
                z.vB.y += fAoBY * dA * z.springK * 100 / 60 / z.mBod;
            }
        }

        z.vN.x *= 0.99 * z.nT;
        z.vN.y *= 0.99 * z.nT;
        z.vB.x *= 0.9925 * (0.8 + (z.nFrz ? 0 : 0.2));
        z.vB.y *= 0.9925 * (0.8 + (z.nFrz ? 0 : 0.2));

        for (let i = 0; i < z.en.gos.length; i++) {
            let go = z.en.gos[i];
            if (go.collide) {
                let bCollide = go.collide(z.pB.x, z.pB.y, 30);
                if (bCollide) {
                    if (go.type === "stone") {
                        let nB = go.collisionNormal(z.pB.x, z.pB.y, 30);
                        let dn = z.vB.x * nB.x + z.vB.y * nB.y;
                        z.pB.x = go.p.x + nB.x * (30 + go.r + 1);
                        z.pB.y = go.p.y + nB.y * (30 + go.r + 1);
                        z.vB.x -= 2 * dn * nB.x;
                        z.vB.y -= 2 * dn * nB.y;
                        go.bmpg = true;
                    }
                    else if (go.type === "spike") {
                        z.flk = 60;
                        z.hp = Math.max(z.hp - go.s, 0);
                        go.destroy();
                        z.combo = 1;
                    }
                }
                let nCollide = go.collide(z.pN.x, z.pN.y, 20);
                if (nCollide) {
                    if (go.type === "stone") {
                        let nN = go.collisionNormal(z.pN.x, z.pN.y, 20);
                        let dn = z.vN.x * nN.x + z.vN.y * nN.y;
                        z.pN.x = go.p.x + nN.x * (20 + go.r + 1);
                        z.pN.y = go.p.y + nN.y * (20 + go.r + 1);
                        z.vN.x -= 2 * dn * nN.x;
                        z.vN.y -= 2 * dn * nN.y;
                        go.bmpg = true;
                    }
                    else if (go.type === "coin") {
                        sc += go.s * z.combo;
                        let t = new FloatingText(z.en, "+ " + (go.s * z.combo).toFixed(0));
                        t.p.x = z.pB.x;
                        t.p.y = z.pB.y;
                        t.instantiate();
                        go.destroy();
                        z.combo += 1;
                    }
                    else if (go.type === "spike") {
                        z.flk = 60;
                        z.hp = Math.max(z.hp - go.s, 0);
                        go.destroy();
                        z.combo = 1;
                    }
                }
            }
        }

        z.pN.x += z.vN.x / 60;
        z.pN.y += z.vN.y / 60;

        z.pB.x += z.vB.x / 60;
        z.pB.y += z.vB.y / 60;
    }
}

var cw = 700;
var ch = 700;
var playing = false;
function play() {
    if (playing) {
        return;
    }
    document.getElementById("play").style.display = "none";
    playing = true;
    let en = new Engine(cw, ch);
    let b = new Blob(en);
    en.blob = b;
    let loop = () => {
        en.update();
        en.draw();
        if (playing) {
            requestAnimationFrame(loop);
        }
        else {
            en.destroy();
        }
    }
    loop();
    en.cnv.addEventListener("pointerdown", (e) => {
        if (b.nT === 1) {
            b.combo = 1;
            b.pA.x = e.clientX - 9 + en.cX - en.w * 0.5;
            b.pA.y = e.clientY - 9 + en.cY - en.h * 0.5;
            let dx = b.pA.x - b.pB.x;
            let dy = b.pA.y - b.pB.y;
            if (dx * dx + dy * dy < 60 * 60) {
                b.nFrz = true;
            }
        }
    });
    en.cnv.addEventListener("pointermove", (e) => {
        if (!b.nFrz) {
            return;
        }
        b.pA.x = e.clientX - 9 + en.cX - en.w * 0.5;   
        b.pA.y = e.clientY - 9 + en.cY - en.h * 0.5;
    });
    en.cnv.addEventListener("pointerup", (e) => {
        if (!b.nFrz) {
            return;
        }
        b.brk();
    });
}

function gameover() {
    document.getElementById("play").style.display = "";
    playing = false;
}

window.addEventListener("load", () => {
    let pBtn = document.getElementById("play");
    pBtn.style.width = "300px";
    pBtn.style.left = "200px";
    pBtn.style.top = "300px";
    play();
    requestAnimationFrame(gameover);
})