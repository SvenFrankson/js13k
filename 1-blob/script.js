class Engine {
    constructor(w, h) {
        this.cX = 0;
        this.cY = 0;
        this.width = w;
        this.height = h;
        this.canvas = document.getElementsByTagName("canvas")[0];
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = this.canvas.getContext("2d");
        this.gameObjects = [];
    }

    update() {
        this.gameObjects.forEach(
            go => {
                if (go.update) {
                    go.update();
                }
            }
        )
    }

    draw() {
        this.context.fillStyle = "#e1f0f4";
        this.context.fillRect(0, 0, this.width, this.height);
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
    }

    draw() {
        let ctx = this.engine.context;
        let oX = this.engine.width * 0.5 + this.engine.cX;
        let oY = this.engine.height * 0.5 + this.engine.cY;
        ctx.beginPath();
        ctx.arc(oX + this.pBod.x, oY + this.pBod.y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = "#8f21dd";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(oX + this.pNuc.x, oY + this.pNuc.y, 10 * this.nucTemp, 0, 2 * Math.PI);
        ctx.fillStyle = "#662a91";
        ctx.fill();
    }

    update() {
        if (this.nucFreezing) {
            this.nucTemp -= 1 / 60;
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

        this.vNuc.x *= 0.99 * this.nucTemp;
        this.vNuc.y *= 0.99 * this.nucTemp;
        this.vBod.x *= 0.99;
        this.vBod.y *= 0.99;

        this.pNuc.x += this.vNuc.x / 60;
        this.pNuc.y += this.vNuc.y / 60;

        if (!this.nucFreezing) {
            this.pBod.x += this.vBod.x / 60;
            this.pBod.y += this.vBod.y / 60;
        }
    }
}

window.addEventListener("load", () => {
    let e = new Engine(400, 400);
    let b = new Blob(e);
    b.instantiate();
    let loop = () => {
        e.update();
        e.draw();
        requestAnimationFrame(loop);
    }
    loop();
    let pdX = NaN;
    let pdY = NaN;
    e.canvas.addEventListener("pointerdown", (e) => {
        if (b.nucTemp === 1) {
            b.nucFreezing = true;
            pdX = e.clientX;
            pdY = e.clientY;
        }
    });
    e.canvas.addEventListener("pointermove", (e) => {
        if (!b.nucFreezing) {
            return;
        }
        let x = e.clientX - pdX;
        let y = e.clientY - pdY;
        pdX = e.clientX;
        pdY = e.clientY;
        b.pBod.x += x;
        b.pBod.y += y;
    });
    e.canvas.addEventListener("pointerup", (e) => {
        b.nucFreezing = false;
    });
});