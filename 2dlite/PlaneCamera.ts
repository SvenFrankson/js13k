class PlaneCamera extends Camera {

    public pixelRatio: number;

    constructor(
        public plane: Fighter
    ) {
        super("planeCamera");
    }

    public update(): void {
        let value = parseFloat((document.getElementById("zoom") as HTMLInputElement).value);
        this.setW(Math.pow(10, value), Engine.instance.canvas);
        this.pixelRatio = Engine.instance.canvas.width / this.w;
        document.getElementById("output").innerText = this.pixelRatio.toFixed(2);
        this.p.x = this.p.x * 59 / 60 + this.plane.p.x / 60;
        this.p.y = this.p.y * 59 / 60 + this.plane.p.y / 60;
    }
}