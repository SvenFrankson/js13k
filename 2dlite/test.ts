window.onload = () => {
    let canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
    canvas.width = 400;
    canvas.height = 400;
    canvas.style.width = "400px";
    canvas.style.height = "400px";
    let camera = new Camera();
    camera.setW(400, canvas);
    let mesh = new Mesh();
    mesh.points = [
        V.N(- 20, - 20),
        V.N(- 20, 20),
        V.N(20, 20),
        V.N(40, 0),
        V.N(20, - 20),
        V.N(- 20, - 20)
    ];
    let context = canvas.getContext("2d");
    let k = 0;
    let loop = () => {
        context.fillStyle = "black";
        context.fillRect(0, 0, 400, 400);
        mesh.p.x = 100 * Math.cos(k / 100);
        mesh.p.y = 50 * Math.sin(k / 50);
        mesh.r = k / 60;
        k++;
        mesh.draw(camera, canvas);
        requestAnimationFrame(loop);
    }
    loop();
}