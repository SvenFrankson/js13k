class V3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    static N(x, y, z) {
        return new V3(x, y, z);
    }
    toV4(w) {
        let z = this;
        return V4.N(z.x, z.y, z.z, w);
    }
    mul(a) {
        let z = this;
        return V3.N(z.x * a, z.y * a, z.z * a);
    }
    add(v) {
        return V3.N(this.x + v.x, this.y + v.y, this.z + v.z);
    }
    sub(v) {
        return V3.N(this.x - v.x, this.y - v.y, this.z - v.z);
    }
    l() {
        let z = this;
        return Math.sqrt(z.x * z.x + z.y * z.y + z.z * z.z);
    }
    unit() {
        let z = this;
        let l = z.l();
        return z.mul(1 / l);
    }
    dot(v) {
        let z = this;
        return z.x * v.x + z.y * v.y + z.z * v.z;
    }
    cross(v) {
        let z = this;
        return V3.N(z.y * v.z - z.z * v.y, z.z * v.x - z.x * v.z, z.x * v.y - z.y * v.x);
    }
}
class V4 {
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    static N(x, y, z, w) {
        return new V4(x, y, z, w);
    }
    toV3() {
        let z = this;
        return V3.N(z.x, z.y, z.z);
    }
}
class Camera {
    constructor() {
        this.pos = V3.N(0, 1, -1);
        this.target = V3.N();
        this.up = V3.N(0, 1, 0);
        this.vM = M4.Identity();
        this.pM = M4.Identity();
        this.pM = M4.PerspectiveFovLH(110 / 180 * 3.14, 1, 0.1, 1);
    }
}
class Mesh {
    constructor(camera) {
        this.camera = camera;
        this.pos = V3.N();
        this.vertices = [];
        this.edges = [];
        this.colors = [];
    }
    draw(context) {
        let tVerts = [];
        let m = M4.Translation(this.pos.x, this.pos.y, this.pos.z);
        //let mvp: M4 = this.camera.pM.mul(this.camera.vM).mul(m);
        let mvp = m.mul(this.camera.vM).mul(this.camera.pM);
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
