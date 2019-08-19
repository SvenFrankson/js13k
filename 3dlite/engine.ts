class V3 {
    
    constructor(
        public x: number = 0,
        public y: number = 0,
        public z: number = 0
    ) {

    }

    public static N(x?: number, y?: number, z?: number) {
        return new V3(x, y, z);
    }

    public toV4(w: number): V4 {
        let z = this;
        return V4.N(z.x, z.y, z.z, w);
    }

    public mul(a: number): V3 {
        let z = this;
        return V3.N(z.x * a, z.y * a, z.z * a);
    }

    public add(v: V3) {
        return V3.N(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    public sub(v: V3) {
        return V3.N(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    public l(): number {
        let z = this;
        return Math.sqrt(z.x * z.x + z.y * z.y + z.z * z.z);
    }

    public unit(): V3 {
        let z = this;
        let l = z.l();
        return z.mul(1 / l);
    }

    public dot(v: V3): number {
        let z = this;
        return z.x * v.x + z.y * v.y + z.z * v.z;
    }

    public cross(v: V3): V3 {
        let z = this;
        return V3.N(
            z.y * v.z - z.z * v.y,
            z.z * v.x - z.x * v.z,
            z.x * v.y - z.y * v.x
        );
    }
}

class V4 {
    
    constructor(
        public x: number = 0,
        public y: number = 0,
        public z: number = 0,
        public w: number = 1
    ) {

    }

    public static N(x?: number, y?: number, z?: number, w?: number): V4 {
        return new V4(x, y, z, w);
    }

    public toV3(): V3 {
        let z = this;
        return V3.N(z.x, z.y, z.z);
    }
}

class Camera {

    public pos: V3 = V3.N(0, 1, -1);
    public target: V3 = V3.N();
    public up: V3 = V3.N(0, 1, 0);

    public viewport: AABB;
    public vM: M4 = M4.Identity();
    public pM: M4 = M4.Identity();

    constructor() {
        this.pM = M4.PerspectiveFovLH(110 / 180 * 3.14, 1, 0.1, 1);
    }
}

class Mesh {

    public pos: V3 = V3.N();

    public vertices: V3[] = [];
    public edges: number[] = [];
    public colors: string[] = [];

    constructor(
        public camera: Camera
    ) {

    }

    public draw(context: CanvasRenderingContext2D): void {
        
        let tVerts: V3[] = [];
        let m: M4 = M4.Translation(this.pos.x, this.pos.y, this.pos.z);
        //let mvp: M4 = this.camera.pM.mul(this.camera.vM).mul(m);
        let mvp: M4 = m.mul(this.camera.vM).mul(this.camera.pM);
        //mvp.invert();
        //console.log(this.vertices);
        for (let i = 0; i < this.vertices.length; i++) {
            tVerts.push(mvp.mulV3P(this.vertices[i]));
        }
        //console.log(tVerts);
        context.lineWidth = 1;
        for (let i = 0; i < this.edges.length / 2; i++) {
            let v1 = tVerts[this.edges[2 * i]];
            let v2 = tVerts[this.edges[2 * i + 1]];
            context.beginPath();
            context.strokeStyle = this.colors[i];
            context.moveTo(200 + v1.x * 200, 200 - v1.y * 200);
            context.lineTo(200 + v2.x * 200, 200 - v2.y * 200);
            context.stroke();
        }
    }
}