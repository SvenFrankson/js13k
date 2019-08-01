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
                if (dX > this.blob.nucTemp) {
                    dX = this.blob.nucTemp;
                }
                if (dX < - this.blob.nucTemp) {
                    dX = - this.blob.nucTemp;
                }
                let dY = newCY - this.cY;
                if (dY > this.blob.nucTemp) {
                    dY = this.blob.nucTemp;
                }
                if (dY < - this.blob.nucTemp) {
                    dY = - this.blob.nucTemp;
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

class Stone extends GameObject {

    constructor(e) {
        super(e);
        this.p = { x: 0, y: 0};
    }

    draw() {
        let ctx = this.engine.context;
        let oX = this.engine.width * 0.5 - this.engine.cX;
        let oY = this.engine.height * 0.5 - this.engine.cY;
        
        ctx.beginPath();
        ctx.arc(oX + this.p.x, oY + this.p.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = "#d1d6e4";
        ctx.fill();
    }
}

class Blob extends GameObject {

    constructor(e) {
        super(e);
        this.springK = 4;
        this.mBod = 1;
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

        ctx.beginPath();
        ctx.arc(oX + this.pBod.x, oY + this.pBod.y, rB, 0, 2 * Math.PI);
        ctx.fillStyle = "#8f21dd";
        ctx.fill();

        for (let i = 0; i < d * 0.5; i += 1) {
            let dd = 1 - i / (0.5 * d);
            dd = dd * dd;
            let r = rN * dd + rN * 0.5 * (1 - dd);
            ctx.beginPath();
            ctx.arc(oX + this.pNuc.x + dX * i, oY + this.pNuc.y + dY * i, r, 0, 2 * Math.PI);
            ctx.fillStyle = "#8f21dd";
            ctx.fill();
        }

        for (let i = d * 0.5; i < d; i += 1) {
            let dd = (i - 0.5 * d) / (0.5 * d);
            dd = Math.pow(dd, 1.5);
            let r = rN * 0.5 * (1 - dd) + rB * dd;
            ctx.beginPath();
            ctx.arc(oX + this.pNuc.x + dX * i, oY + this.pNuc.y + dY * i, r, 0, 2 * Math.PI);
            ctx.fillStyle = "#8f21dd";
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(oX + this.pNuc.x, oY + this.pNuc.y, rN, 0, 2 * Math.PI);
        ctx.fillStyle = "#8f21dd";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(oX + this.pNuc.x, oY + this.pNuc.y, rN * 0.6 * this.nucTemp, 0, 2 * Math.PI);
        ctx.fillStyle = "#662a91";
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
            this.nucTemp += 1 / 60;
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
    
                this.vBod.x += fAoBX * dA * this.springK * 10 / 60 / this.mBod;
                this.vBod.y += fAoBY * dA * this.springK * 10 / 60 / this.mBod;
            }
        }

        this.vNuc.x *= 0.99 * this.nucTemp;
        this.vNuc.y *= 0.99 * this.nucTemp;
        this.vBod.x *= 0.99;
        this.vBod.y *= 0.99;

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
    let eng = new Engine(400, 400);
    let b = new Blob(eng);
    b.instantiate();
    eng.blob = b;

    for (let i = 0; i < 100; i++) {
        let s00 = new Stone(eng);
        s00.p.x = - 2000 + Math.random() * 4000;
        s00.p.y = - 2000 + Math.random() * 4000;
        s00.instantiate();
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
            console.log(e.clientX + " " + e.clientY);
            console.log(b.pAnchor.x + " " + b.pAnchor.y);
        }
    });
    eng.canvas.addEventListener("pointermove", (e) => {
        if (!b.nucFreezing) {
            return;
        }
        b.pAnchor.x = e.clientX - 9 + eng.cX - eng.width * 0.5;   
        b.pAnchor.y = e.clientY - 9 + eng.cY - eng.height * 0.5;
        console.log(e.clientX + " " + e.clientY);
        console.log(b.pAnchor.x + " " + b.pAnchor.y);
    });
    eng.canvas.addEventListener("pointerup", (e) => {
        b.nucFreezing = false;
        b.nucTemp = 0;
    });
});