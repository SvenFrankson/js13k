class FatArrow extends Mesh {
    constructor() {
        super(...arguments);
        this._k = 0;
    }
    start() {
        this.points = [
            V.N(-20, -20),
            V.N(-20, 20),
            V.N(20, 20),
            V.N(40, 0),
            V.N(20, -20),
            V.N(-20, -20)
        ];
    }
    update() {
        this.p.x = 100 * Math.cos(this._k / 100);
        this.p.y = 50 * Math.sin(this._k / 50);
        this.r = this._k / 60;
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
    let mesh = new FatArrow();
    mesh.instantiate();
    en.start();
    setTimeout(() => {
        en.pause();
        setTimeout(() => {
            en.pause();
        }, 3000);
    }, 3000);
};
