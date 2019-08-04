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
        this.canvas = document.getElementsByTagName("canvas")[0];
        this.canvas.width = this.w;
        this.canvas.height = this.h;
        this.context = this.canvas.getContext("2d");
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
            if (!this.blob.nucFreezing) {
                let newCX = (this.blob.pN.x + this.blob.pB.x) * 0.5;
                let newCY = (this.blob.pN.y + this.blob.pB.y) * 0.5;
                let dX = newCX - this.cX;
                if (dX > this.blob.nucTemp * 2) {
                    dX = this.blob.nucTemp * 2;
                }
                if (dX < - this.blob.nucTemp * 2) {
                    dX = - this.blob.nucTemp * 2;
                }
                let dY = newCY - this.cY;
                if (dY > this.blob.nucTemp * 2) {
                    dY = this.blob.nucTemp * 2;
                }
                if (dY < - this.blob.nucTemp * 2) {
                    dY = - this.blob.nucTemp * 2;
                }
                this.cX += dX;
                this.cY += dY;
            }
        }
        document.getElementById("score").innerText = sc;
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
            for (let i = -2; i < 3; i++) {
                for (let j = -2; j < 3; j++) {
                    if (!newTiles.find(t => { return t.i === (I + i) && t.j === (J + j); })) {
                        let t = new Tile(this, I + i, J + j);
                        t.instantiate();
                        newTiles.push(t);
                    }
                }
            }
            this.tiles = newTiles;
        }
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
        this.context.putImageData(this.bgData, x, y);
        this.context.putImageData(this.bgData, x - 2 * this.w, y);
        this.context.putImageData(this.bgData, x, y - 2 * this.h);
        this.context.putImageData(this.bgData, x - 2 * this.w, y - 2 * this.h);
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
    constructor(e, i, j) {
        this.e = e;
        this.i = i;
        this.j = j;
        this.x = i * 2000;
        this.y = j * 2000;
        this.gos = [];
    }
    
    instantiate() {
        for (let i = 0; i < 20; i++) {
            let s = new Stone(this.e, 2 + mf(5 * mr()), 5 + 10 * mr());
            s.p.x = this.x + mr() * 2000;
            s.p.y = this.y + mr() * 2000;
            this.gos.push(s);
        }

        for (let i = 0; i < 10; i++) {
            let s = new Spike(this.e, 1 + mf(3 * mr()), 2 + 5 * mr());
            s.p.x = this.x + mr() * 2000;
            s.p.y = this.y + mr() * 2000;
            this.gos.push(s);
        }

        for (let i = 0; i < 15; i++) {
            let c = new Coin(this.e, 1 + mf(3 * mr()), 2 + 5 * mr());
            c.p.x = this.x + mr() * 2000;
            c.p.y = this.y + mr() * 2000;
            this.gos.push(c);
        }
        
        for (let i = 0; i < 5; i++) {
            let r = Math.random();
            let st;
            if (r < 0.5) {
                st = new Tunnel(this.e, 300);
            }
            else if (r < 1) {
                st = new Shell(this.e, 200);
            }
            st.p.x = this.x + mr() * 2000;
            st.p.y = this.y + mr() * 2000;
            st.dir = mr() * Math.PI * 2;
            this.gos.push(st);
        }

        this.gos.forEach(g => {
            g.instantiate();
        });
    }

    destroy() {
        this.gos.forEach(g => {
            g.destroy();
        });
    }
}

class GameObject {
    constructor(e) {
        this.en = e;
    }

    instantiate() {
        this.en.gos.push(this);
    }

    destroy() {
        let i = this.en.gos.indexOf(this);
        if (i !== -1) {
            this.en.gos.splice(i, 1);
        }
    }
}

class FloatingText {
    constructor(e, t) {
        this.en = e;
        this.t = t;
        this.s = 1;
        this.k = 0;
        this.p = { x: 0, y: 0};
        this.dx = Math.random() * 2 - 1;
        this.dy = Math.random() * 2;
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
        let ctx = this.en.context;
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

    constructor(e, s, h, color) {
        super(e);
        this.type = "disc";
        this.s = s;
        this.r = s * 10;
        this.h = h;
        this.p = { x: 0, y: 0};
        this.color = color;
        this.colorShadow = scaleColor(color, 0.5);
    }

    draw() {
        let ctx = this.en.context;
        ctx.lineWidth = 2;
        let oX = this.en.w * 0.5 - this.en.cX;
        let oY = this.en.h * 0.5 - this.en.cY;

        let x = oX + this.p.x;
        let y = oY + this.p.y;

        if (x > - 20 - this.r) {
            if (y > - 20 - this.r) {
                if (x < this.en.w + 20 + this.r) {
                    if (y < this.en.h + 20 + this.r) {
                        let dx = this.h - 2 * this.h * x / this.en.w;
                        let dy = this.h - 2 * this.h * y / this.en.h;
                        
                        ctx.beginPath();
                        ctx.arc(x + dx, y + dy, this.r, 0, 2 * Math.PI);
                        ctx.strokeStyle = this.colorShadow;
                        ctx.stroke();
                        
                        ctx.beginPath();
                        ctx.arc(x, y, this.r, 0, 2 * Math.PI);
                        ctx.strokeStyle = this.color;
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
        this.coins.forEach(c => {
            c.destroy();
        })
        this.spikes.forEach(s => {
            s.destroy();
        })
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

    constructor(e, r) {
        super(e, r);
        this.coins = [
            new Coin(e, 2, 5),
            new Coin(e, 2, 5),
            new Coin(e, 2, 5),
            new Coin(e, 2, 5)
        ];
        this.spikes = [
            new Spike(e, 1, 5),
            new Spike(e, 1, 5),
            new Spike(e, 1, 5),
            new Spike(e, 1, 5)
        ];
    }

    update() {
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

class Shell extends Structure {

    constructor(e, r) {
        super(e, r);
        this.coins = [
            new Coin(e, 2, 5),
            new Coin(e, 2, 5),
            new Coin(e, 2, 5),
            new Coin(e, 2, 5)
        ];
        this.spikes = [
            new Spike(e, 1, 5),
            new Spike(e, 1, 5),
            new Spike(e, 1, 5),
            new Spike(e, 1, 5)
        ];
    }

    update() {
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

var coins = [];
class Coin extends Disc {
    
    constructor(e, r, h) {
        super(e, r, h, "#b5eecb");
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
    }
}

class Spike extends Disc {
    constructor(e, r, h) {
        super(e, r, h, "#f8a2a8");
        this.type = "spike";
    }
}

class Stone extends Disc {
    constructor(e, r, h) {
        super(e, r, h, "#9589a9");
        this.type = "stone";
        this.bump = 0;
        this.bumping = false;
    }

    draw() {
        if (this.bumping) {
            this.bump += 1 + this.s * 0.5;
            this.bumping = this.bump < 3 * this.size;
        }
        else {
            this.bump = Math.max(this.bump - 0.5, 0);
        }
        let ctx = this.en.context;
        ctx.lineWidth = 2;
        let oX = this.en.w * 0.5 - this.en.cX;
        let oY = this.en.h * 0.5 - this.en.cY;

        let x = oX + this.p.x;
        let y = oY + this.p.y;

        if (x > - 20 - this.r) {
            if (y > - 20 - this.r) {
                if (x < this.en.w + 20 + this.r) {
                    if (y < this.en.h + 20 + this.r) {
                        let dx = this.h - 2 * this.h * x / this.en.w;
                        let dy = this.h - 2 * this.h * y / this.en.h;
                        
                        ctx.beginPath();
                        ctx.arc(x + dx, y + dy, this.r + this.bump, 0, 2 * Math.PI);
                        ctx.strokeStyle = this.colorShadow;
                        ctx.stroke();
                        
                        ctx.beginPath();
                        ctx.arc(x, y, this.r + this.bump, 0, 2 * Math.PI);
                        ctx.strokeStyle = this.color;
                        ctx.stroke();
                    }
                }
            }
        }
    }
}

class Blob {

    constructor(e) {
        this.en = e;
        this.combo = 1;
        this.hpM = 20;
        this.hp = this.hpM;
        this.springK = 6;
        this.mBod = 3;
        this.mNuc = 1;
        this.nucFreezing = false;
        this.nucTemp = 1;
        this.pN = { x: 50, y: 30 };
        this.vN = { x: 0, y: 0 };
        this.pB = { x: -50, y: 20 };
        this.vB = { x: 0, y: 0 };
        this.pA = { x: 0, y: 0};
    }

    draw() {
        if (!playing) {
            return;
        }
        let ctx = this.en.context;
        let oX = this.en.w * 0.5 - this.en.cX;
        let oY = this.en.h * 0.5 - this.en.cY;

        let rN = 20;
        let rB = 30;

        let dX = this.pB.x - this.pN.x;
        let dY = this.pB.y - this.pN.y;
        let d = Math.sqrt(dX * dX + dY * dY);
        dX /= d;
        dY /= d;

        rB -= d / 10;
        rB = Math.max(rB, rN);

        let c = lerpColor(cGrn, cBlk, 1 - this.hp / this.hpM);

        ctx.beginPath();
        ctx.arc(oX + this.pB.x, oY + this.pB.y, rB + 2, 0, 2 * Math.PI);
        ctx.fillStyle = c;
        ctx.fill();

        for (let i = 0; i < d * 0.5; i += 2) {
            let dd = 1 - i / (0.5 * d);
            dd = dd * dd;
            let r = rN * dd + rN * 0.5 * (1 - dd);
            ctx.beginPath();
            ctx.arc(oX + this.pN.x + dX * i, oY + this.pN.y + dY * i, r + 2, 0, 2 * Math.PI);
            ctx.fill();
        }

        for (let i = d * 0.5; i < d; i += 2) {
            let dd = (i - 0.5 * d) / (0.5 * d);
            dd = Math.pow(dd, 1.5);
            let r = rN * 0.5 * (1 - dd) + rB * dd;
            ctx.beginPath();
            ctx.arc(oX + this.pN.x + dX * i, oY + this.pN.y + dY * i, r + 2, 0, 2 * Math.PI);
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(oX + this.pN.x, oY + this.pN.y, rN + 2, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = cBlk;
        ctx.beginPath();
        ctx.arc(oX + this.pB.x, oY + this.pB.y, rB, 0, 2 * Math.PI);
        ctx.fill();

        for (let i = 0; i < d * 0.5; i += 2) {
            let dd = 1 - i / (0.5 * d);
            dd = dd * dd;
            let r = rN * dd + rN * 0.5 * (1 - dd);
            ctx.beginPath();
            ctx.arc(oX + this.pN.x + dX * i, oY + this.pN.y + dY * i, r, 0, 2 * Math.PI);
            ctx.fill();
        }

        for (let i = d * 0.5; i < d; i += 2) {
            let dd = (i - 0.5 * d) / (0.5 * d);
            dd = Math.pow(dd, 1.5);
            let r = rN * 0.5 * (1 - dd) + rB * dd;
            ctx.beginPath();
            ctx.arc(oX + this.pN.x + dX * i, oY + this.pN.y + dY * i, r, 0, 2 * Math.PI);
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(oX + this.pN.x, oY + this.pN.y, rN, 0, 2 * Math.PI);
        ctx.fill();

        if (this.nucFreezing) {
            ctx.beginPath();
            ctx.arc(oX + this.pA.x, oY + this.pA.y, 10, 0, 2 * Math.PI);
            ctx.fillStyle = "red";
            ctx.fill();
        }
    }

    update() {
        if (this.hp <= 0) {
            gameover();
        }
        if (this.nucFreezing) {
            this.nucTemp -= 1 / 120;
        }
        else {
            this.nucTemp += 1 / 90;
            this.nucTemp = Math.min(this.nucTemp, 1);
        }

        if (this.nucTemp < 0) {
            this.nucFreezing = false;
            this.nucTemp = 0;
        }

        let fBoNX = this.pB.x - this.pN.x;
        let fBoNY = this.pB.y - this.pN.y;
        let d = Math.sqrt(fBoNX * fBoNX + fBoNY * fBoNY);
        if (d > 0) {
            fBoNX /= d;
            fBoNY /= d;
            let fNoBX = - fBoNX;
            let fNoBY = - fBoNY;

            this.vN.x += fBoNX * d * this.springK / 60 / this.mNuc;
            this.vN.y += fBoNY * d * this.springK / 60 / this.mNuc;

            this.vB.x += fNoBX * d * this.springK / 60 / this.mBod;
            this.vB.y += fNoBY * d * this.springK / 60 / this.mBod;
        }

        coins = coins.sort((c1, c2) => { 
            let dx1 = (c1.p.x - this.pN.x);
            dx1 *= dx1;
            let dy1 = (c1.p.y - this.pN.y);
            dy1 *= dy1;
            let dx2 = (c2.p.x - this.pN.x);
            dx2 *= dx2;
            let dy2 = (c2.p.y - this.pN.y);
            dy2 *= dy2;
            return (dx1 + dy1) - (dx2 + dy2);
        })

        let cC = coins[0];
        if (cC) {
            let fCoNX = cC.p.x - this.pN.x;
            let fCoNY = cC.p.y - this.pN.y;
            let d = Math.sqrt(fCoNX * fCoNX + fCoNY * fCoNY);
            if (d > 0) {
                fCoNX /= d;
                fCoNY /= d;
                let g = (50 / (d / 100) / (d / 100));
                fCoNX *= g / 60 / this.mNuc;
                fCoNY *= g / 60 / this.mNuc;
                this.vN.x += fCoNX;
                this.vN.y += fCoNY;
            }
        }

        if (this.nucFreezing) {
            let fAoBX = this.pA.x - this.pB.x;
            let fAoBY = this.pA.y - this.pB.y;
            let dA = Math.sqrt(fAoBX * fAoBX + fAoBY * fAoBY);
            if (dA > 0) {
                fAoBX /= dA;
                fAoBY /= dA;
    
                this.vB.x += fAoBX * dA * this.springK * 100 / 60 / this.mBod;
                this.vB.y += fAoBY * dA * this.springK * 100 / 60 / this.mBod;
            }
        }

        this.vN.x *= 0.99 * this.nucTemp;
        this.vN.y *= 0.99 * this.nucTemp;
        this.vB.x *= 0.9925 * (0.8 + (this.nucFreezing ? 0 : 0.2));
        this.vB.y *= 0.9925 * (0.8 + (this.nucFreezing ? 0 : 0.2));

        for (let i = 0; i < this.en.gos.length; i++) {
            let go = this.en.gos[i];
            if (go.collide) {
                let bCollide = go.collide(this.pB.x, this.pB.y, 30);
                if (bCollide) {
                    if (go.type === "stone") {
                        let nB = go.collisionNormal(this.pB.x, this.pB.y, 30);
                        let dn = this.vB.x * nB.x + this.vB.y * nB.y;
                        this.pB.x = go.p.x + nB.x * (30 + go.r + 1);
                        this.pB.y = go.p.y + nB.y * (30 + go.r + 1);
                        this.vB.x -= 2 * dn * nB.x;
                        this.vB.y -= 2 * dn * nB.y;
                        go.bumping = true;
                        let t = new FloatingText(this.en, "BUMP !");
                        t.p.x = this.pB.x;
                        t.p.y = this.pB.y;
                        t.instantiate();
                    }
                    else if (go.type === "spike") {
                        this.hp = Math.max(this.hp - go.s, 0);
                        go.destroy();
                        this.combo = 1;
                    }
                }
                let nCollide = go.collide(this.pN.x, this.pN.y, 20);
                if (nCollide) {
                    if (go.type === "stone") {
                        let nN = go.collisionNormal(this.pN.x, this.pN.y, 20);
                        let dn = this.vN.x * nN.x + this.vN.y * nN.y;
                        this.pN.x = go.p.x + nN.x * (20 + go.r + 1);
                        this.pN.y = go.p.y + nN.y * (20 + go.r + 1);
                        this.vN.x -= 2 * dn * nN.x;
                        this.vN.y -= 2 * dn * nN.y;
                        go.bumping = true;
                        let t = new FloatingText(this.en, "BUMP !");
                        t.p.x = this.pN.x;
                        t.p.y = this.pN.y;
                        t.instantiate();
                    }
                    else if (go.type === "coin") {
                        sc += go.s * this.combo;
                        let t = new FloatingText(this.en, "+ " + (go.s * this.combo).toFixed(0));
                        t.p.x = this.pB.x;
                        t.p.y = this.pB.y;
                        t.instantiate();
                        go.destroy();
                        this.combo += 1;
                    }
                    else if (go.type === "spike") {
                        this.hp = Math.max(this.hp - go.s, 0);
                        go.destroy();
                        this.combo = 1;
                    }
                }
            }
        }

        this.pN.x += this.vN.x / 60;
        this.pN.y += this.vN.y / 60;

        this.pB.x += this.vB.x / 60;
        this.pB.y += this.vB.y / 60;
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
    en.canvas.addEventListener("pointerdown", (e) => {
        if (b.nucTemp === 1) {
            b.combo = 1;
            b.nucFreezing = true;
            b.pA.x = e.clientX - 9 + en.cX - en.w * 0.5;
            b.pA.y = e.clientY - 9 + en.cY - en.h * 0.5;
        }
    });
    en.canvas.addEventListener("pointermove", (e) => {
        if (!b.nucFreezing) {
            return;
        }
        b.pA.x = e.clientX - 9 + en.cX - en.w * 0.5;   
        b.pA.y = e.clientY - 9 + en.cY - en.h * 0.5;
    });
    en.canvas.addEventListener("pointerup", (e) => {
        if (!b.nucFreezing) {
            return;
        }
        b.nucFreezing = false;
        b.nucTemp = 0;
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