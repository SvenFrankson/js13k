class Squadron extends LineMesh {

    public fighters: Fighter[] = [];

    constructor(
        public team: number = 0
    ) {
        super("squadron");
    }

    public start(): void {
        this.size = 4;
        let line = new Line("white");
        for (let i = 0; i <= 16; i++) {
            let cosa = Math.cos(i * Math.PI * 2 / 16);
            let sina = Math.sin(i * Math.PI * 2 / 16);
            let pt = V.N(cosa * 4, sina * 4);
            line.pts.push(pt);
        }
        this.lines = [line];
        this.isScreenSized = true;
        this.size = 4;
    }

    public update(): void {
        if (Engine.instance.activeCamera instanceof PlaneCamera) {
            this.isVisible = false;
            if (Engine.instance.activeCamera.pixelRatio < 0.1 && this.fighters[0]) {
                this.isVisible = true;
                this.fighters[0].pW.copy(this.p);
            }
        }
    }
}