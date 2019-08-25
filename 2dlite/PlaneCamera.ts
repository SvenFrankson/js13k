class PlaneCamera extends Camera {

    constructor(
        public plane: Fighter
    ) {
        super("planeCamera");
    }

    public update(): void {
        this.p.x = this.p.x * 59 / 60 + this.plane.p.x / 60;
        this.p.y = this.p.y * 59 / 60 + this.plane.p.y / 60;
    }
}