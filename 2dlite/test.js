class FatArrow extends LineMesh {
    constructor() {
        super(...arguments);
        this._k = 0;
    }
    start() {
        this.lines = [
            new Line("yellow", V.N(-20, -20), V.N(-20, 20), V.N(20, 20), V.N(40, 0), V.N(20, -20), V.N(-20, -20))
        ];
    }
    update() {
        this.p.x = 100 * Math.cos(this._k / 100);
        this.p.y = 50 * Math.sin(this._k / 50);
        this.r = this._k / 60;
        this._k++;
    }
}
class SpaceShip extends LineMesh {
    constructor() {
        super(...arguments);
        this._k = 0;
    }
    start() {
        this.lines = [
            Line.Parse("white:-10,-10 -10,10 0,25 10,10 10,-10 -10,-10"),
            Line.Parse("red:16,-5 16,10 40,0 40,-10 16,-5"),
            Line.Parse("red:-16,-5 -16,10 -40,0 -40,-10 -16,-5")
        ];
    }
    update() {
        this.p.x = 100 * Math.cos(this._k / 100);
        this.p.y = 50 * Math.sin(this._k / 50);
        this.r = this._k / 60;
        this.s = 1.5 + Math.sin(this._k / 50);
        this._k++;
    }
}
window.onload = () => {
    let canvas = document.getElementById("canvas");
    canvas.width = 400;
    canvas.height = 400;
    canvas.style.width = "400px";
    canvas.style.height = "400px";
    let en = new Engine(canvas);
    let camera = new Camera();
    camera.setW(400, canvas);
    camera.instantiate();
    let mesh = new SpaceShip();
    mesh.instantiate();
    en.start();
    setTimeout(() => {
        en.pause();
        setTimeout(() => {
            en.pause();
        }, 3000);
    }, 3000);
};
