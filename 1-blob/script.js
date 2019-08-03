function scaleColor(hexColor, s) {
    let o = hexColor.length === 7 ? 1 : 0;
    let r = Math.floor(parseInt(hexColor.substring(o, o + 2), 16) * s);
    let g = Math.floor(parseInt(hexColor.substring(o + 2, o + 4), 16) * s);
    let b = Math.floor(parseInt(hexColor.substring(o + 4, o + 6), 16) * s);
    return (o === 1 ? "#" : "") + r.toString(16).padStart(2, "0") + g.toString(16).padStart(2, "0") + b.toString(16).padStart(2, "0");
}

class Engine {
    constructor(w, h) {
        this.cX = 0;
        this.cY = 0;
        this.speed = 1;
        this.width = w;
        this.height = h;
        this.canvas = document.getElementsByTagName("canvas")[0];
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = this.canvas.getContext("2d");
        this.gameObjects = [];

        let backgroundCanvas = document.createElement("canvas");
        backgroundCanvas.width = 2 * w;
        backgroundCanvas.height = 2 * h;
        let backgroundContext = backgroundCanvas.getContext("2d");
        backgroundContext.fillStyle = "#e1f0f4";
        backgroundContext.fillRect(0, 0, 2 * w, 2 * h);
        for (let i = 0; i < 10; i++) {
            backgroundContext.lineWidth = 10 + Math.random() * 10;
            let x = Math.random() * 2 * w;
            let y = Math.random() * 2 * h;
            let r = Math.random() * 200 + 50;
            for (let ii = -1; ii <= 1; ii++) {
                for (let jj = -1; jj <= 1; jj++) {
                    backgroundContext.beginPath();
                    backgroundContext.arc(ii * 2 * w + x, jj * 2 * h + y, r, 0, 2 * Math.PI);
                    backgroundContext.strokeStyle = "#b1b6c4";
                    backgroundContext.stroke();
                }
            }
        }
        this.backgroundData = backgroundContext.getImageData(0, 0, 2 * w, 2 * h);
    }

    update() {
        if (this.blob) {
            if (!this.blob.nucFreezing) {
                let newCX = (this.blob.pNuc.x + this.blob.pBod.x) * 0.5;
                let newCY = (this.blob.pNuc.y + this.blob.pBod.y) * 0.5;
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
        this.gameObjects.forEach(
            go => {
                if (go.update) {
                    go.update();
                }
            }
        )
    }

    draw() {
        let x = - this.cX;
        while (x < 0) {
            x += 2 * this.width;
        }
        while (x > 2 * this.width) {
            x -= 2 * this.width;
        }
        let y = - this.cY;
        while (y < 0) {
            y += 2 * this.height;
        }
        while (y > 2 * this.height) {
            y -= 2 * this.height;
        }
        this.context.putImageData(this.backgroundData, x, y);
        this.context.putImageData(this.backgroundData, x - 2 * this.width, y);
        this.context.putImageData(this.backgroundData, x, y - 2 * this.height);
        this.context.putImageData(this.backgroundData, x - 2 * this.width, y - 2 * this.height);
        this.gameObjects.forEach(
            go => {
                if (go.draw) {
                    go.draw();
                }
            }
        )
    }
}

class GameObject {
    constructor(e) {
        this.engine = e;
    }

    instantiate() {
        this.engine.gameObjects.push(this);
    }

    destroy() {
        let i = this.engine.gameObjects.indexOf(this);
        if (i !== -1) {
            this.engine.gameObjects.splice(i, 1);
        }
    }
}

class Disc extends GameObject {

    constructor(e, r, h, color) {
        super(e);
        this.type = "disc";
        this.r = r;
        this.h = h;
        this.p = { x: 0, y: 0};
        this.color = color;
        this.colorShadow = scaleColor(color, 0.5);
    }

    draw() {
        let ctx = this.engine.context;
        let oX = this.engine.width * 0.5 - this.engine.cX;
        let oY = this.engine.height * 0.5 - this.engine.cY;

        let x = oX + this.p.x;
        let y = oY + this.p.y;

        if (x > - 20 - this.r) {
            if (y > - 20 - this.r) {
                if (x < this.engine.width + 20 + this.r) {
                    if (y < this.engine.height + 20 + this.r) {
                        let dx = this.h - 2 * this.h * x / this.engine.width;
                        let dy = this.h - 2 * this.h * y / this.engine.height;
                        
                        ctx.beginPath();
                        ctx.arc(x + dx, y + dy, this.r, 0, 2 * Math.PI);
                        ctx.fillStyle = this.colorShadow;
                        ctx.fill();
                        
                        ctx.beginPath();
                        ctx.arc(x, y, this.r, 0, 2 * Math.PI);
                        ctx.fillStyle = this.color;
                        ctx.fill();
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
        this.engine.gameObjects.push(this);
        this.coins.forEach(c => {
            c.instantiate();
        })
        this.spikes.forEach(s => {
            s.instantiate();
        })
    }

    destroy() {
        let i = this.engine.gameObjects.indexOf(this);
        if (i !== -1) {
            this.engine.gameObjects.splice(i, 1);
        }
        this.coins.forEach(c => {
            c.destroy();
        })
        this.spikes.forEach(s => {
            s.destroy();
        })
    }

    update() {
        let cosd = Math.cos(this.dir);
        let sind = Math.cos(this.dir);
        this.p.x += cosd * 0.2
        this.p.y += sind * 0.2;
        this.dir = Math.cos(this.k / 1000) * Math.PI;
        this.k++;
        this.a += Math.PI / 1200;
    }
}

class Tunnel extends Structure {

    constructor(e, r) {
        super(e, r);
        this.coins = [
            new Coin(e, 20, 5),
            new Coin(e, 20, 5),
            new Coin(e, 20, 5),
            new Coin(e, 20, 5)
        ];
        this.spikes = [
            new Spike(e, 10, 5),
            new Spike(e, 10, 5),
            new Spike(e, 10, 5),
            new Spike(e, 10, 5)
        ];
    }

    update() {
        super.update();
        let cosa = Math.cos(this.a);
        let sina = Math.sin(this.a);
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
            new Coin(e, 20, 5),
            new Coin(e, 20, 5),
            new Coin(e, 20, 5),
            new Coin(e, 20, 5)
        ];
        this.spikes = [
            new Spike(e, 10, 5),
            new Spike(e, 10, 5),
            new Spike(e, 10, 5),
            new Spike(e, 10, 5)
        ];
    }

    update() {
        super.update(); 
        this.coins.forEach(
            (c, i) => {
                let cosa = Math.cos(this.a + i * Math.PI / 2);
                let sina = Math.sin(this.a + i * Math.PI / 2);
                c.p.x = cosa * this.r / 3 + this.p.x;
                c.p.y = sina * this.r / 3 + this.p.y;
            }
        );
        this.spikes.forEach(
            (s, i) => {
                let cosa = Math.cos(this.a + i * Math.PI / 2);
                let sina = Math.sin(this.a + i * Math.PI / 2);
                s.p.x = cosa * this.r + this.p.x;
                s.p.y = sina * this.r + this.p.y;
            }
        );
    }
}

class Coin extends Disc {
    constructor(e, r, h) {
        super(e, r, h, "#e0ce19");
        this.type = "coin";
    }
}

class Spike extends Disc {
    constructor(e, r, h) {
        super(e, r, h, "#e01941");
        this.type = "spike";
    }
}

class Stone extends Disc {
    constructor(e, r, h) {
        super(e, r, h, "#d1d6e4");
        this.type = "stone";
    }
}

class Blob extends GameObject {

    constructor(e) {
        super(e);
        this.hp = 3;
        this.springK = 4;
        this.mBod = 2;
        this.mNuc = 1;
        this.nucFreezing = false;
        this.nucTemp = 1;
        this.pNuc = { x: 50, y: 30 };
        this.vNuc = { x: 0, y: 0 };
        this.pBod = { x: -50, y: 20 };
        this.vBod = { x: 0, y: 0 };
        this.pAnchor = { x: 0, y: 0};
        // 87 12 74 91
    }

    draw() {
        let ctx = this.engine.context;
        let oX = this.engine.width * 0.5 - this.engine.cX;
        let oY = this.engine.height * 0.5 - this.engine.cY;

        let rN = 15;
        let rB = 20;

        let dX = this.pBod.x - this.pNuc.x;
        let dY = this.pBod.y - this.pNuc.y;
        let d = Math.sqrt(dX * dX + dY * dY);
        dX /= d;
        dY /= d;

        rB -= d / 15;
        rB = Math.max(rB, rN);

        let c = scaleColor("#58bf21", this.hp / 3);
        let cN = scaleColor(c, 0.5);

        ctx.beginPath();
        ctx.arc(oX + this.pBod.x, oY + this.pBod.y, rB, 0, 2 * Math.PI);
        ctx.fillStyle = c;
        ctx.fill();

        for (let i = 0; i < d * 0.5; i += 2) {
            let dd = 1 - i / (0.5 * d);
            dd = dd * dd;
            let r = rN * dd + rN * 0.5 * (1 - dd);
            ctx.beginPath();
            ctx.arc(oX + this.pNuc.x + dX * i, oY + this.pNuc.y + dY * i, r, 0, 2 * Math.PI);
            ctx.fillStyle = c;
            ctx.fill();
        }

        for (let i = d * 0.5; i < d; i += 2) {
            let dd = (i - 0.5 * d) / (0.5 * d);
            dd = Math.pow(dd, 1.5);
            let r = rN * 0.5 * (1 - dd) + rB * dd;
            ctx.beginPath();
            ctx.arc(oX + this.pNuc.x + dX * i, oY + this.pNuc.y + dY * i, r, 0, 2 * Math.PI);
            ctx.fillStyle = c;
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(oX + this.pNuc.x, oY + this.pNuc.y, rN, 0, 2 * Math.PI);
        ctx.fillStyle = c;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(oX + this.pNuc.x, oY + this.pNuc.y, rN * 0.6 * this.nucTemp, 0, 2 * Math.PI);
        ctx.fillStyle = cN;
        ctx.fill();

        if (this.nucFreezing) {
            ctx.beginPath();
            ctx.arc(oX + this.pAnchor.x, oY + this.pAnchor.y, 10, 0, 2 * Math.PI);
            ctx.fillStyle = "red";
            ctx.fill();
        }
    }

    update() {
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

        let fBoNX = this.pBod.x - this.pNuc.x;
        let fBoNY = this.pBod.y - this.pNuc.y;
        let d = Math.sqrt(fBoNX * fBoNX + fBoNY * fBoNY);
        if (d > 0) {
            fBoNX /= d;
            fBoNY /= d;
            let fNoBX = - fBoNX;
            let fNoBY = - fBoNY;

            this.vNuc.x += fBoNX * d * this.springK / 60 / this.mNuc;
            this.vNuc.y += fBoNY * d * this.springK / 60 / this.mNuc;

            this.vBod.x += fNoBX * d * this.springK / 60 / this.mBod;
            this.vBod.y += fNoBY * d * this.springK / 60 / this.mBod;
        }

        if (this.nucFreezing) {
            let fAoBX = this.pAnchor.x - this.pBod.x;
            let fAoBY = this.pAnchor.y - this.pBod.y;
            let dA = Math.sqrt(fAoBX * fAoBX + fAoBY * fAoBY);
            if (dA > 0) {
                fAoBX /= dA;
                fAoBY /= dA;
    
                this.vBod.x += fAoBX * dA * this.springK * 20 / 60 / this.mBod;
                this.vBod.y += fAoBY * dA * this.springK * 20 / 60 / this.mBod;
            }
        }

        this.vNuc.x *= 0.992 * this.nucTemp;
        this.vNuc.y *= 0.992 * this.nucTemp;
        this.vBod.x *= 0.992;
        this.vBod.y *= 0.992;

        for (let i = 0; i < this.engine.gameObjects.length; i++) {
            let go = this.engine.gameObjects[i];
            if (go.collide) {
                let bCollide = go.collide(this.pBod.x, this.pBod.y, 20);
                if (bCollide) {
                    if (go.type === "stone") {
                        let nB = go.collisionNormal(this.pBod.x, this.pBod.y, 20);
                        let dn = this.vBod.x * nB.x + this.vBod.y * nB.y;
                        this.pBod.x = go.p.x + nB.x * (20 + go.r + 1);
                        this.pBod.y = go.p.y + nB.y * (20 + go.r + 1);
                        this.vBod.x -= 2 * dn * nB.x;
                        this.vBod.y -= 2 * dn * nB.y;
                    }
                    else if (go.type === "spike") {
                        this.hp = Math.max(this.hp - 1, 0);
                        go.destroy();
                    }
                }
                let nCollide = go.collide(this.pNuc.x, this.pNuc.y, 15);
                if (nCollide) {
                    if (go.type === "stone") {
                        let nN = go.collisionNormal(this.pNuc.x, this.pNuc.y, 15);
                        let dn = this.vNuc.x * nN.x + this.vNuc.y * nN.y;
                        this.pNuc.x = go.p.x + nN.x * (15 + go.r + 1);
                        this.pNuc.y = go.p.y + nN.y * (15 + go.r + 1);
                        this.vNuc.x -= 2 * dn * nN.x;
                        this.vNuc.y -= 2 * dn * nN.y;
                    }
                    else if (go.type === "coin") {
                        this.hp = Math.min(this.hp + 1, 3);
                        go.destroy();
                    }
                    else if (go.type === "spike") {
                        this.hp = Math.max(this.hp - 1, 0);
                        go.destroy();
                    }
                }
            }
        }

        this.pNuc.x += this.vNuc.x / 60;
        this.pNuc.y += this.vNuc.y / 60;

        this.pBod.x += this.vBod.x / 60;
        this.pBod.y += this.vBod.y / 60;

        /*
        if (this.pNuc.x < - 200) {
            this.pNuc.x = - 200;
            this.vNuc.x *= -1;
        }
        if (this.pNuc.y < - 200) {
            this.pNuc.y = - 200;
            this.vNuc.y *= -1;
        }
        if (this.pNuc.x > 200) {
            this.pNuc.x = 200;
            this.vNuc.x *= -1;
        }
        if (this.pNuc.y > 200) {
            this.pNuc.y = 200;
            this.vNuc.y *= -1;
        }

        if (this.pBod.x < - 200) {
            this.pBod.x = - 200;
            this.vBod.x *= -1;
        }
        if (this.pBod.y < - 200) {
            this.pBod.y = - 200;
            this.vBod.y *= -1;
        }
        if (this.pBod.x > 200) {
            this.pBod.x = 200;
            this.vBod.x *= -1;
        }
        if (this.pBod.y > 200) {
            this.pBod.y = 200;
            this.vBod.y *= -1;
        }
        */
    }
}

window.addEventListener("load", () => {
    let eng = new Engine(700, 700);
    let b = new Blob(eng);
    b.instantiate();
    eng.blob = b;

    let shell = new Tunnel(eng, 200);
    shell.p.x = 400;
    shell.p.y = 400;
    shell.instantiate();

    for (let i = 0; i < 100; i++) {
        let s = new Stone(eng, 10 + 50 * Math.random(), 5 + 10 * Math.random());
        s.p.x = - 2000 + Math.random() * 4000;
        s.p.y = - 2000 + Math.random() * 4000;
        s.instantiate();
    }

    for (let i = 0; i < 50; i++) {
        let s = new Spike(eng, 5 + 10 * Math.random(), 2 + 5 * Math.random());
        s.p.x = - 2000 + Math.random() * 4000;
        s.p.y = - 2000 + Math.random() * 4000;
        s.instantiate();
    }

    for (let i = 0; i < 50; i++) {
        let c = new Coin(eng, 5 + 10 * Math.random(), 2 + 5 * Math.random());
        c.p.x = - 2000 + Math.random() * 4000;
        c.p.y = - 2000 + Math.random() * 4000;
        c.instantiate();
    }

    let loop = () => {
        eng.update();
        eng.draw();
        requestAnimationFrame(loop);
    }
    loop();
    let pdX = NaN;
    let pdY = NaN;
    eng.canvas.addEventListener("pointerdown", (e) => {
        if (b.nucTemp === 1) {
            b.nucFreezing = true;
            b.pAnchor.x = e.clientX - 9 + eng.cX - eng.width * 0.5;
            b.pAnchor.y = e.clientY - 9 + eng.cY - eng.height * 0.5;
        }
    });
    eng.canvas.addEventListener("pointermove", (e) => {
        if (!b.nucFreezing) {
            return;
        }
        b.pAnchor.x = e.clientX - 9 + eng.cX - eng.width * 0.5;   
        b.pAnchor.y = e.clientY - 9 + eng.cY - eng.height * 0.5;
    });
    eng.canvas.addEventListener("pointerup", (e) => {
        b.nucFreezing = false;
        b.nucTemp = 0;
    });
});