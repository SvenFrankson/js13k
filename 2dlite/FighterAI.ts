enum AITask {
    Go,
    Follow,
    Avoid,
    Attack
}

class DummyControl extends GameObject {

    public leader: Fighter;
    public formationPos: V;

    constructor(
        public plane: Fighter,
        public target: Fighter
    ) {
        super("playerControler");
    }

    public task: AITask;

    public targetPos: V;

    public followPos: () => V;
    public followDir: () => number;
    public followSpeed: () => number;
    public followX: () => V;
    public followY: () => V;

    public update(): void {
        if (this.task === undefined) {
            this.targetPos = V.N(- 1000 + 2000 * Math.random(), - 1000 + 2000 * Math.random());
            this.task = AITask.Go;
        }

        this.plane.dirinput = 0;
        this.plane.powInput = 0;

        if (this.task !== AITask.Attack) {
            for (let i = 0; i < 2; i++) {
                if (i !== this.plane.team) {
                    let fighters = Fighter.instances.get(i);
                    if (fighters) {
                        for (let j = 0; j < fighters.length; j++) {
                            let f = fighters[j];
                            if (V.sqrDist(this.pW, f.pW) < 1000 * 1000) {
                                this.task = AITask.Attack;
                                this.target = f;
                            }
                        }
                    }
                }
            }
        }

        if (this.task === AITask.Go) {
            if (V.sqrDist(this.plane.pW, this.targetPos) < 100 * 100) {
                delete this.task;
                return;
            }
            return this.goToAction(this.targetPos);
        }

        if (this.task === AITask.Follow) {
            return this.followAction(
                this.followPos(),
                this.followDir(),
                this.followSpeed(),
                this.followX(),
                this.followY()
            );
        }

        if (this.task === AITask.Attack) {
            if (!this.target || !this.target.isAlive) {
                delete this.task;
                return;
            }
            return this.attackAction(this.target);
        }
    }

    public goToAction(
        p: V
    ): void {
        let targetDir = p.sub(this.plane.p);
        let targetAngle = V.angle(this.plane.yW, targetDir);
        let targetDist = targetDir.len();
        if (isFinite(targetAngle)) {
            this.plane.dirinput = targetAngle / (Math.PI / 2);
        }
        this.plane.powInput = - 1;
        if (Math.abs(targetAngle) < Math.PI / 2)  {
            this.plane.powInput = 1;
        }
    }

    public avoidAction(
        p: V
    ): void {
        let targetDir = p.sub(this.plane.p);
        let targetAngle = V.angle(this.plane.yW, targetDir);
        if (isFinite(targetAngle)) {
            if (targetAngle > 0) {
                this.plane.dirinput = targetAngle / (2 * Math.PI / 3) - 1;
            }
            else {
                this.plane.dirinput = 1 - targetAngle / (2 * Math.PI / 3);
            }
        }
        this.plane.powInput = 0;
        if (Math.abs(targetAngle) > Math.PI / 4) {
            this.plane.powInput = 1;
        }
    }

    public followAction(
        p: V,
        r: number,
        s: number,
        wX: V,
        wY: V
    ): void {
        let dGo = 500;
        let dP = this.plane.pW.sub(p);
        let dist = dP.sqrLen();
        if (true || dist > dGo * dGo) {
            this.goToAction(p);
        }
        let smallFix = true;
        let dA = Angle.shortest(this.plane.rW, r);
        if (Math.abs(dA) > Math.PI / 16) {
            this.plane.dirinput = Math.sign(dA) / Math.PI;
            smallFix = false;
        }
        let currentS = this.plane.speed.len();
        let fS = currentS / s;
        if (fS > 1.3) {
            this.plane.powInput = - 1;
            smallFix = false;
        }
        else if (fS < 0.7) {
            this.plane.powInput = 1;
            smallFix = false;
        }
        if (smallFix) {
            let dX = dP.dot(wX);
            this.plane.dirinput = (dX / dGo) * 2;
            let dY = dP.dot(wY);
            this.plane.powInput = (- dY / dGo);
        }
    }

    public attackAction(
        target: Fighter
    ): void {
        let dP = target.pW.sub(this.plane.pW);
        let dist = dP.len();
        if (dist > 400) {
            this.goToAction(target.pW);
        }
        else {
            return this.avoidAction(target.pW);
        }
        let dA = V.angle(this.plane.yW, dP);
        if (Math.abs(dA) < Math.PI / 16) {
            this.plane.shoot();
        }
    }
}
