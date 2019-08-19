class Test {
    static V3asString(v3) {
        return "{ x : " + v3.x.toFixed(3) + ", y : " + v3.y.toFixed(3) + ", z : " + v3.z.toFixed(3) + " }";
    }
    static V4asString(v4) {
        return "{ x : " + v4.x.toFixed(3) + ", y : " + v4.y.toFixed(3) + ", z : " + v4.z.toFixed(3) + ", w : " + v4.w.toFixed(3) + " }";
    }
    static TestMath() {
        let pos = V3.N(0, 0, 3);
        let mTranslate = M4.Translation(0, 3, 0);
        let posT = mTranslate.mulV3P(pos);
        let mRotateY = M4.RotationY(Math.PI / 2);
        let posRY = mRotateY.mulV3P(posT);
        return Test.V3asString(pos) + " translates to " + Test.V3asString(posT) + " rotates to " + Test.V3asString(posRY);
    }
}
window.onload = () => {
    let output = document.getElementById("output");
    output.innerText += Test.TestMath();
    let camera = new Camera();
    camera.pos.x = 2;
    camera.pos.y = 1;
    camera.pos.z = -3;
    let mesh = new Mesh(camera);
    /*
    mesh.vertices = [
        V3.N(- 1, -1, -1),
        V3.N(- 1, -1, 1),
        V3.N(1, -1, 1),
        V3.N(1, -1, -1),
        V3.N(- 1, 1, -1),
        V3.N(- 1, 1, 1),
        V3.N(1, 1, 1),
        V3.N(1, 1, -1),
    ];
    mesh.edges = [
        0, 4,
        1, 5,
        2, 6,
        3, 7,
        0, 1,
        1, 2,
        2, 3,
        3, 0,
        4, 5,
        5, 6,
        6, 7,
        7, 4
    ];
    mesh.colors = [
        "red",
        "red",
        "red",
        "red",
        "green",
        "green",
        "green",
        "green",
        "blue",
        "blue",
        "blue",
        "blue"
    ]
    */
    mesh.vertices = [
        V3.N(-1, 0, 0),
        V3.N(0, 0, 1),
        V3.N(1, 0, 0),
        V3.N(0, 0, -1),
        V3.N(0, 1, 0)
    ];
    mesh.edges = [
        0, 1,
        1, 2,
        2, 3,
        3, 0,
        0, 4,
        1, 4,
        2, 4,
        3, 4
    ];
    mesh.colors = [
        "green",
        "green",
        "green",
        "green",
        "white",
        "white",
        "white",
        "white"
    ];
    let canvas = document.getElementById("canvas");
    canvas.width = 400;
    canvas.height = 400;
    canvas.style.width = "400px";
    canvas.style.height = "400px";
    let context = canvas.getContext("2d");
    let k = 0;
    let loop = () => {
        context.fillStyle = "black";
        context.fillRect(0, 0, 400, 400);
        camera.pos.x = 5 * Math.sin(k / 200);
        camera.pos.y = 2;
        camera.pos.z = 5 * Math.cos(k / 200);
        let l = (Math.cos(k / 100) + 2) * 5;
        camera.pos.x = 1 * l;
        camera.pos.y = 2 * l;
        camera.pos.z = -3 * l;
        output.innerText = Test.V3asString(camera.pos);
        camera.vM = M4.LookAtLH(camera.pos, V3.N(0, 0.5, 0), V3.N(0, 1, 0));
        output.innerText += "\n" + camera.vM.m00.toFixed(5) + " " + camera.vM.m10.toFixed(5) + " " + camera.vM.m20.toFixed(5) + " " + camera.vM.m30.toFixed(5);
        output.innerText += "\n" + camera.vM.m01.toFixed(5) + " " + camera.vM.m11.toFixed(5) + " " + camera.vM.m21.toFixed(5) + " " + camera.vM.m31.toFixed(5);
        output.innerText += "\n" + camera.vM.m02.toFixed(5) + " " + camera.vM.m12.toFixed(5) + " " + camera.vM.m22.toFixed(5) + " " + camera.vM.m32.toFixed(5);
        output.innerText += "\n" + camera.vM.m03.toFixed(5) + " " + camera.vM.m13.toFixed(5) + " " + camera.vM.m23.toFixed(5) + " " + camera.vM.m33.toFixed(5);
        k++;
        mesh.draw(context);
        requestAnimationFrame(loop);
    };
    loop();
};
