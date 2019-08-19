class AABB {

    constructor(
        public width: number = 1,
        public height: number = 1,
        public x: number = 0,
        public y: number = 0
    ) {

    }
}

class M4 {
    
    public m: Float32Array = new Float32Array(16);
    public get m00(): number { return this.m[0]; }
    public get m01(): number { return this.m[1]; }
    public get m02(): number { return this.m[2]; }
    public get m03(): number { return this.m[3]; }
    public get m10(): number { return this.m[4]; }
    public get m11(): number { return this.m[5]; }
    public get m12(): number { return this.m[6]; }
    public get m13(): number { return this.m[7]; }
    public get m20(): number { return this.m[8]; }
    public get m21(): number { return this.m[9]; }
    public get m22(): number { return this.m[10]; }
    public get m23(): number { return this.m[11]; }
    public get m30(): number { return this.m[12]; }
    public get m31(): number { return this.m[13]; }
    public get m32(): number { return this.m[14]; }
    public get m33(): number { return this.m[15]; }
    
    public determinant(): number {
        var temp1 = (this.m[10] * this.m[15]) - (this.m[11] * this.m[14]);
        var temp2 = (this.m[9] * this.m[15]) - (this.m[11] * this.m[13]);
        var temp3 = (this.m[9] * this.m[14]) - (this.m[10] * this.m[13]);
        var temp4 = (this.m[8] * this.m[15]) - (this.m[11] * this.m[12]);
        var temp5 = (this.m[8] * this.m[14]) - (this.m[10] * this.m[12]);
        var temp6 = (this.m[8] * this.m[13]) - (this.m[9] * this.m[12]);

        return ((((this.m[0] * (((this.m[5] * temp1) - (this.m[6] * temp2)) + (this.m[7] * temp3))) - (this.m[1] * (((this.m[4] * temp1) -
            (this.m[6] * temp4)) + (this.m[7] * temp5)))) + (this.m[2] * (((this.m[4] * temp2) - (this.m[5] * temp4)) + (this.m[7] * temp6)))) -
            (this.m[3] * (((this.m[4] * temp3) - (this.m[5] * temp5)) + (this.m[6] * temp6))));
    }

    public toArray(): Float32Array {
        return this.m;
    }

    public asArray(): Float32Array {
        return this.toArray();
    }

    public invert(): M4 {
        this.invertToRef(this);
        return this;
    }

    public reset(): M4 {
        for (var index = 0; index < 16; index++) {
            this.m[index] = 0.0;
        }
        return this;
    }

    public add(other: M4): M4 {
        var result = new M4();
        this.addToRef(other, result);
        return result;
    }

    public addToRef(other: M4, result: M4): M4 {
        for (var index = 0; index < 16; index++) {
            result.m[index] = this.m[index] + other.m[index];
        }
        return this;
    }

    public addToSelf(other: M4): M4 {
        for (var index = 0; index < 16; index++) {
            this.m[index] += other.m[index];
        }
        return this;
    }

    public invertToRef(other: M4): M4 {
        var l1 = this.m[0];
        var l2 = this.m[1];
        var l3 = this.m[2];
        var l4 = this.m[3];
        var l5 = this.m[4];
        var l6 = this.m[5];
        var l7 = this.m[6];
        var l8 = this.m[7];
        var l9 = this.m[8];
        var l10 = this.m[9];
        var l11 = this.m[10];
        var l12 = this.m[11];
        var l13 = this.m[12];
        var l14 = this.m[13];
        var l15 = this.m[14];
        var l16 = this.m[15];
        var l17 = (l11 * l16) - (l12 * l15);
        var l18 = (l10 * l16) - (l12 * l14);
        var l19 = (l10 * l15) - (l11 * l14);
        var l20 = (l9 * l16) - (l12 * l13);
        var l21 = (l9 * l15) - (l11 * l13);
        var l22 = (l9 * l14) - (l10 * l13);
        var l23 = ((l6 * l17) - (l7 * l18)) + (l8 * l19);
        var l24 = -(((l5 * l17) - (l7 * l20)) + (l8 * l21));
        var l25 = ((l5 * l18) - (l6 * l20)) + (l8 * l22);
        var l26 = -(((l5 * l19) - (l6 * l21)) + (l7 * l22));
        var l27 = 1.0 / ((((l1 * l23) + (l2 * l24)) + (l3 * l25)) + (l4 * l26));
        var l28 = (l7 * l16) - (l8 * l15);
        var l29 = (l6 * l16) - (l8 * l14);
        var l30 = (l6 * l15) - (l7 * l14);
        var l31 = (l5 * l16) - (l8 * l13);
        var l32 = (l5 * l15) - (l7 * l13);
        var l33 = (l5 * l14) - (l6 * l13);
        var l34 = (l7 * l12) - (l8 * l11);
        var l35 = (l6 * l12) - (l8 * l10);
        var l36 = (l6 * l11) - (l7 * l10);
        var l37 = (l5 * l12) - (l8 * l9);
        var l38 = (l5 * l11) - (l7 * l9);
        var l39 = (l5 * l10) - (l6 * l9);

        other.m[0] = l23 * l27;
        other.m[4] = l24 * l27;
        other.m[8] = l25 * l27;
        other.m[12] = l26 * l27;
        other.m[1] = -(((l2 * l17) - (l3 * l18)) + (l4 * l19)) * l27;
        other.m[5] = (((l1 * l17) - (l3 * l20)) + (l4 * l21)) * l27;
        other.m[9] = -(((l1 * l18) - (l2 * l20)) + (l4 * l22)) * l27;
        other.m[13] = (((l1 * l19) - (l2 * l21)) + (l3 * l22)) * l27;
        other.m[2] = (((l2 * l28) - (l3 * l29)) + (l4 * l30)) * l27;
        other.m[6] = -(((l1 * l28) - (l3 * l31)) + (l4 * l32)) * l27;
        other.m[10] = (((l1 * l29) - (l2 * l31)) + (l4 * l33)) * l27;
        other.m[14] = -(((l1 * l30) - (l2 * l32)) + (l3 * l33)) * l27;
        other.m[3] = -(((l2 * l34) - (l3 * l35)) + (l4 * l36)) * l27;
        other.m[7] = (((l1 * l34) - (l3 * l37)) + (l4 * l38)) * l27;
        other.m[11] = -(((l1 * l35) - (l2 * l37)) + (l4 * l39)) * l27;
        other.m[15] = (((l1 * l36) - (l2 * l38)) + (l3 * l39)) * l27;

        return this;
    }

    public setTranslationFromFloats(x: number, y: number, z: number): M4 {
        this.m[12] = x;
        this.m[13] = y;
        this.m[14] = z;

        return this;
    }

    public setTranslation(V3: V3): M4 {
        this.m[12] = V3.x;
        this.m[13] = V3.y;
        this.m[14] = V3.z;

        return this;
    }

    public getTranslation(): V3 {
        return new V3(this.m[12], this.m[13], this.m[14]);
    }

    public getTranslationToRef(result: V3): M4 {
        result.x = this.m[12];
        result.y = this.m[13];
        result.z = this.m[14];

        return this;
    }

    public removeRotationAndScaling(): M4 {
        this.setRowFromFloats(0, 1, 0, 0, 0);
        this.setRowFromFloats(1, 0, 1, 0, 0);
        this.setRowFromFloats(2, 0, 0, 1, 0);
        return this;
    }

    public mulV3P(v: V3): V3 {
        return V3.N(
            this.m00 * v.x + this.m10 * v.y + this.m20 * v.z + this.m30,
            this.m01 * v.x + this.m11 * v.y + this.m21 * v.z + this.m31,
            this.m02 * v.x + this.m12 * v.y + this.m22 * v.z + this.m32
        );
    }

    public mulV3D(v: V3): V3 {
        return V3.N(
            this.m00 * v.x + this.m10 * v.y + this.m20 * v.z,
            this.m01 * v.x + this.m11 * v.y + this.m21 * v.z,
            this.m02 * v.x + this.m12 * v.y + this.m22 * v.z
        );
    }

    public mulV4(v: V4): V4 {
        return V4.N(
            this.m00 * v.x + this.m10 * v.y + this.m20 * v.z + this.m30 * v.w,
            this.m01 * v.x + this.m11 * v.y + this.m21 * v.z + this.m31 * v.w,
            this.m02 * v.x + this.m12 * v.y + this.m22 * v.z + this.m32 * v.w,
            this.m03 * v.x + this.m13 * v.y + this.m23 * v.z + this.m33 * v.w
        );
    }

    public mul(m: M4): M4 {
        var result = new M4();
        this.multiplyToRef(m, result);
        return result;
    }

    public copyFrom(other: M4): M4 {
        for (var index = 0; index < 16; index++) {
            this.m[index] = other.m[index];
        }

        return this;
    }

    public copyToArray(array: Float32Array, offset: number = 0): M4 {
        for (var index = 0; index < 16; index++) {
            array[offset + index] = this.m[index];
        }
        return this;
    }

    public multiplyToRef(other: M4, result: M4): M4 {
        this.multiplyToArray(other, result.m, 0);

        return this;
    }

    public multiplyToArray(other: M4, result: Float32Array, offset: number): M4 {
        var tm0 = this.m[0];
        var tm1 = this.m[1];
        var tm2 = this.m[2];
        var tm3 = this.m[3];
        var tm4 = this.m[4];
        var tm5 = this.m[5];
        var tm6 = this.m[6];
        var tm7 = this.m[7];
        var tm8 = this.m[8];
        var tm9 = this.m[9];
        var tm10 = this.m[10];
        var tm11 = this.m[11];
        var tm12 = this.m[12];
        var tm13 = this.m[13];
        var tm14 = this.m[14];
        var tm15 = this.m[15];

        var om0 = other.m[0];
        var om1 = other.m[1];
        var om2 = other.m[2];
        var om3 = other.m[3];
        var om4 = other.m[4];
        var om5 = other.m[5];
        var om6 = other.m[6];
        var om7 = other.m[7];
        var om8 = other.m[8];
        var om9 = other.m[9];
        var om10 = other.m[10];
        var om11 = other.m[11];
        var om12 = other.m[12];
        var om13 = other.m[13];
        var om14 = other.m[14];
        var om15 = other.m[15];

        result[offset] = tm0 * om0 + tm1 * om4 + tm2 * om8 + tm3 * om12;
        result[offset + 1] = tm0 * om1 + tm1 * om5 + tm2 * om9 + tm3 * om13;
        result[offset + 2] = tm0 * om2 + tm1 * om6 + tm2 * om10 + tm3 * om14;
        result[offset + 3] = tm0 * om3 + tm1 * om7 + tm2 * om11 + tm3 * om15;

        result[offset + 4] = tm4 * om0 + tm5 * om4 + tm6 * om8 + tm7 * om12;
        result[offset + 5] = tm4 * om1 + tm5 * om5 + tm6 * om9 + tm7 * om13;
        result[offset + 6] = tm4 * om2 + tm5 * om6 + tm6 * om10 + tm7 * om14;
        result[offset + 7] = tm4 * om3 + tm5 * om7 + tm6 * om11 + tm7 * om15;

        result[offset + 8] = tm8 * om0 + tm9 * om4 + tm10 * om8 + tm11 * om12;
        result[offset + 9] = tm8 * om1 + tm9 * om5 + tm10 * om9 + tm11 * om13;
        result[offset + 10] = tm8 * om2 + tm9 * om6 + tm10 * om10 + tm11 * om14;
        result[offset + 11] = tm8 * om3 + tm9 * om7 + tm10 * om11 + tm11 * om15;

        result[offset + 12] = tm12 * om0 + tm13 * om4 + tm14 * om8 + tm15 * om12;
        result[offset + 13] = tm12 * om1 + tm13 * om5 + tm14 * om9 + tm15 * om13;
        result[offset + 14] = tm12 * om2 + tm13 * om6 + tm14 * om10 + tm15 * om14;
        result[offset + 15] = tm12 * om3 + tm13 * om7 + tm14 * om11 + tm15 * om15;
        return this;
    }

    public equals(value: M4): boolean {
        return value &&
            (this.m[0] === value.m[0] && this.m[1] === value.m[1] && this.m[2] === value.m[2] && this.m[3] === value.m[3] &&
                this.m[4] === value.m[4] && this.m[5] === value.m[5] && this.m[6] === value.m[6] && this.m[7] === value.m[7] &&
                this.m[8] === value.m[8] && this.m[9] === value.m[9] && this.m[10] === value.m[10] && this.m[11] === value.m[11] &&
                this.m[12] === value.m[12] && this.m[13] === value.m[13] && this.m[14] === value.m[14] && this.m[15] === value.m[15]);
    }

    public clone(): M4 {
        return M4.FromValues(this.m[0], this.m[1], this.m[2], this.m[3],
            this.m[4], this.m[5], this.m[6], this.m[7],
            this.m[8], this.m[9], this.m[10], this.m[11],
            this.m[12], this.m[13], this.m[14], this.m[15]);
    }

    public decompose(scale?: V3, rotation?: any, translation?: V3): boolean {
        if (translation) {
            translation.x = this.m[12];
            translation.y = this.m[13];
            translation.z = this.m[14];
        }

        scale.x = Math.sqrt(this.m[0] * this.m[0] + this.m[1] * this.m[1] + this.m[2] * this.m[2]);
        scale.y = Math.sqrt(this.m[4] * this.m[4] + this.m[5] * this.m[5] + this.m[6] * this.m[6]);
        scale.z = Math.sqrt(this.m[8] * this.m[8] + this.m[9] * this.m[9] + this.m[10] * this.m[10]);

        if (this.determinant() <= 0) {
            scale.y *= -1;
        }

        if (scale.x === 0 || scale.y === 0 || scale.z === 0) {
            if (rotation) {
                rotation.x = 0;
                rotation.y = 0;
                rotation.z = 0;
                rotation.w = 1;
            }

            return false;
        }

        if (rotation) {
            /*
            Matrix.FromValuesToRef(
                this.m[0] / scale.x, this.m[1] / scale.x, this.m[2] / scale.x, 0,
                this.m[4] / scale.y, this.m[5] / scale.y, this.m[6] / scale.y, 0,
                this.m[8] / scale.z, this.m[9] / scale.z, this.m[10] / scale.z, 0,
                0, 0, 0, 1, MathTmp.Matrix[0]);

            Quaternion.FromRotationMatrixToRef(MathTmp.Matrix[0], rotation);
            */
        }

        return true;
    }

    public getRow(index: number): V4 {
        if (index < 0 || index > 3) {
            return null;
        }
        var i = index * 4;
        return new V4(this.m[i + 0], this.m[i + 1], this.m[i + 2], this.m[i + 3]);
    }

    public setRow(index: number, row: V4): M4 {
        if (index < 0 || index > 3) {
            return this;
        }
        var i = index * 4;
        this.m[i + 0] = row.x;
        this.m[i + 1] = row.y;
        this.m[i + 2] = row.z;
        this.m[i + 3] = row.w;

        return this;
    }

    public transpose(): M4 {
        return M4.Transpose(this);
    }

    public transposeToRef(result: M4): M4 {
        M4.TransposeToRef(this, result);

        return this;
    }

    public setRowFromFloats(index: number, x: number, y: number, z: number, w: number): M4 {
        if (index < 0 || index > 3) {
            return this;
        }
        var i = index * 4;
        this.m[i + 0] = x;
        this.m[i + 1] = y;
        this.m[i + 2] = z;
        this.m[i + 3] = w;

        return this;
    }

    public scale(scale: number): M4 {
        var result = new M4();
        this.scaleToRef(scale, result);
        return result;
    }

    public scaleToRef(scale: number, result: M4): M4 {
        for (var index = 0; index < 16; index++) {
            result.m[index] = this.m[index] * scale;
        }
        return this;
    }          
    
    public scaleAndAddToRef(scale: number, result: M4): M4 {
        for (var index = 0; index < 16; index++) {
            result.m[index] += this.m[index] * scale;
        }
        return this;
    }          

    public toNormalMatrix(ref: M4): void {
        this.invertToRef(ref)
        ref.transpose();
        var m = ref.m;
        M4.FromValuesToRef(
            m[0], m[1], m[2], 0,
            m[4], m[5], m[6], 0,
            m[8], m[9], m[10], 0,
            0, 0, 0, 1, ref);
    }

    public getRotationMatrix(): M4 {
        var result = M4.Identity();
        this.getRotationMatrixToRef(result);
        return result;
    }

    public getRotationMatrixToRef(result: M4): M4 {
        var m = this.m;

        var sx = Math.sqrt(m[0] * m[0] + m[1] * m[1] + m[2] * m[2]);
        var sy = Math.sqrt(m[4] * m[4] + m[5] * m[5] + m[6] * m[6]);
        var sz = Math.sqrt(m[8] * m[8] + m[9] * m[9] + m[10] * m[10]);

        if (this.determinant() <= 0) {
            sy *= -1;
        }

        if (sx === 0 || sy === 0 || sz === 0) {
            M4.IdentityToRef(result);
        }
        else {
            M4.FromValuesToRef(
                m[0] / sx, m[1] / sx, m[2] / sx, 0,
                m[4] / sy, m[5] / sy, m[6] / sy, 0,
                m[8] / sz, m[9] / sz, m[10] / sz, 0,
                0, 0, 0, 1, result);
        }

        return this;
    }

    public static FromArray(array: ArrayLike<number>, offset?: number): M4 {
        var result = new M4();

        if (!offset) {
            offset = 0;
        }
        M4.FromArrayToRef(array, offset, result);
        return result;
    }
    
    public static FromArrayToRef(array: ArrayLike<number>, offset: number, result: M4) {
        for (var index = 0; index < 16; index++) {
            result.m[index] = array[index + offset];
        }
    }

    public static FromFloat32ArrayToRefScaled(array: Float32Array, offset: number, scale: number, result: M4) {
        for (var index = 0; index < 16; index++) {
            result.m[index] = array[index + offset] * scale;
        }

    }
    
    public static FromValuesToRef(initialM11: number, initialM12: number, initialM13: number, initialM14: number,
        initialM21: number, initialM22: number, initialM23: number, initialM24: number,
        initialM31: number, initialM32: number, initialM33: number, initialM34: number,
        initialM41: number, initialM42: number, initialM43: number, initialM44: number, result: M4): void {

        result.m[0] = initialM11;
        result.m[1] = initialM12;
        result.m[2] = initialM13;
        result.m[3] = initialM14;
        result.m[4] = initialM21;
        result.m[5] = initialM22;
        result.m[6] = initialM23;
        result.m[7] = initialM24;
        result.m[8] = initialM31;
        result.m[9] = initialM32;
        result.m[10] = initialM33;
        result.m[11] = initialM34;
        result.m[12] = initialM41;
        result.m[13] = initialM42;
        result.m[14] = initialM43;
        result.m[15] = initialM44;
    }    

    public static FromValues(initialM11: number, initialM12: number, initialM13: number, initialM14: number,
        initialM21: number, initialM22: number, initialM23: number, initialM24: number,
        initialM31: number, initialM32: number, initialM33: number, initialM34: number,
        initialM41: number, initialM42: number, initialM43: number, initialM44: number): M4 {

        var result = new M4();

        result.m[0] = initialM11;
        result.m[1] = initialM12;
        result.m[2] = initialM13;
        result.m[3] = initialM14;
        result.m[4] = initialM21;
        result.m[5] = initialM22;
        result.m[6] = initialM23;
        result.m[7] = initialM24;
        result.m[8] = initialM31;
        result.m[9] = initialM32;
        result.m[10] = initialM33;
        result.m[11] = initialM34;
        result.m[12] = initialM41;
        result.m[13] = initialM42;
        result.m[14] = initialM43;
        result.m[15] = initialM44;

        return result;
    }

    public static Compose(scale: V3, rotation: any, translation: V3): M4 {
        var result = M4.Identity();
        M4.ComposeToRef(scale, rotation, translation, result);
        return result;
    }

    public static ComposeToRef(scale: V3, rotation: any, translation: V3, result: M4): void {
        let tmp0 = new M4();
        let tmp1 = new M4();
        M4.FromValuesToRef(scale.x, 0, 0, 0,
            0, scale.y, 0, 0,
            0, 0, scale.z, 0,
            0, 0, 0, 1, tmp1);

        rotation.toRotationMatrix(tmp0);
        tmp1.multiplyToRef(tmp0, result);

        result.setTranslation(translation);
    }

    public static Identity(): M4 {
        return M4.FromValues(1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0);
    }

    public static IdentityToRef(result: M4): void {
        M4.FromValuesToRef(1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0, result);
    }

    public static Zero(): M4 {
        return M4.FromValues(0.0, 0.0, 0.0, 0.0,
            0.0, 0.0, 0.0, 0.0,
            0.0, 0.0, 0.0, 0.0,
            0.0, 0.0, 0.0, 0.0);
    }

    public static RotationX(angle: number): M4 {
        var result = new M4();
        M4.RotationXToRef(angle, result);
        return result;
    }

    public static Invert(source: M4): M4 {
        var result = new M4();
        source.invertToRef(result);
        return result;
    }

    public static RotationXToRef(angle: number, result: M4): void {
        var s = Math.sin(angle);
        var c = Math.cos(angle);

        result.m[0] = 1.0;
        result.m[15] = 1.0;

        result.m[5] = c;
        result.m[10] = c;
        result.m[9] = -s;
        result.m[6] = s;

        result.m[1] = 0.0;
        result.m[2] = 0.0;
        result.m[3] = 0.0;
        result.m[4] = 0.0;
        result.m[7] = 0.0;
        result.m[8] = 0.0;
        result.m[11] = 0.0;
        result.m[12] = 0.0;
        result.m[13] = 0.0;
        result.m[14] = 0.0;
    }

    public static RotationY(angle: number): M4 {
        var result = new M4();
        M4.RotationYToRef(angle, result);
        return result;
    }

    public static RotationYToRef(angle: number, result: M4): void {
        var s = Math.sin(angle);
        var c = Math.cos(angle);

        result.m[5] = 1.0;
        result.m[15] = 1.0;

        result.m[0] = c;
        result.m[2] = -s;
        result.m[8] = s;
        result.m[10] = c;

        result.m[1] = 0.0;
        result.m[3] = 0.0;
        result.m[4] = 0.0;
        result.m[6] = 0.0;
        result.m[7] = 0.0;
        result.m[9] = 0.0;
        result.m[11] = 0.0;
        result.m[12] = 0.0;
        result.m[13] = 0.0;
        result.m[14] = 0.0;
    }

    public static RotationZ(angle: number): M4 {
        var result = new M4();
        M4.RotationZToRef(angle, result);
        return result;
    }
    
    public static RotationZToRef(angle: number, result: M4): void {
        var s = Math.sin(angle);
        var c = Math.cos(angle);

        result.m[10] = 1.0;
        result.m[15] = 1.0;

        result.m[0] = c;
        result.m[1] = s;
        result.m[4] = -s;
        result.m[5] = c;

        result.m[2] = 0.0;
        result.m[3] = 0.0;
        result.m[6] = 0.0;
        result.m[7] = 0.0;
        result.m[8] = 0.0;
        result.m[9] = 0.0;
        result.m[11] = 0.0;
        result.m[12] = 0.0;
        result.m[13] = 0.0;
        result.m[14] = 0.0;
    }

    public static RotationAxis(axis: V3, angle: number): M4 {
        var result = M4.Zero();
        M4.RotationAxisToRef(axis, angle, result);
        return result;
    }

    public static RotationAxisToRef(axis: V3, angle: number, result: M4): void {
        var s = Math.sin(-angle);
        var c = Math.cos(-angle);
        var c1 = 1 - c;

        axis = axis.unit();

        result.m[0] = (axis.x * axis.x) * c1 + c;
        result.m[1] = (axis.x * axis.y) * c1 - (axis.z * s);
        result.m[2] = (axis.x * axis.z) * c1 + (axis.y * s);
        result.m[3] = 0.0;

        result.m[4] = (axis.y * axis.x) * c1 + (axis.z * s);
        result.m[5] = (axis.y * axis.y) * c1 + c;
        result.m[6] = (axis.y * axis.z) * c1 - (axis.x * s);
        result.m[7] = 0.0;

        result.m[8] = (axis.z * axis.x) * c1 - (axis.y * s);
        result.m[9] = (axis.z * axis.y) * c1 + (axis.x * s);
        result.m[10] = (axis.z * axis.z) * c1 + c;
        result.m[11] = 0.0;

        result.m[15] = 1.0;
    }
    
    public static RotationYawPitchRoll(yaw: number, pitch: number, roll: number): M4 {
        var result = new M4();
        M4.RotationYawPitchRollToRef(yaw, pitch, roll, result);
        return result;
    }

    public static RotationYawPitchRollToRef(yaw: number, pitch: number, roll: number, result: M4): void {
        //Quaternion.RotationYawPitchRollToRef(yaw, pitch, roll, this._tempQuaternion);
        //this._tempQuaternion.toRotationMatrix(result);
    }

    public static Scaling(x: number, y: number, z: number): M4 {
        var result = M4.Zero();
        M4.ScalingToRef(x, y, z, result);
        return result;
    }

    public static ScalingToRef(x: number, y: number, z: number, result: M4): void {
        result.m[0] = x;
        result.m[1] = 0.0;
        result.m[2] = 0.0;
        result.m[3] = 0.0;
        result.m[4] = 0.0;
        result.m[5] = y;
        result.m[6] = 0.0;
        result.m[7] = 0.0;
        result.m[8] = 0.0;
        result.m[9] = 0.0;
        result.m[10] = z;
        result.m[11] = 0.0;
        result.m[12] = 0.0;
        result.m[13] = 0.0;
        result.m[14] = 0.0;
        result.m[15] = 1.0;
    }

    public static Translation(x: number, y: number, z: number): M4 {
        var result = M4.Identity();
        M4.TranslationToRef(x, y, z, result);
        return result;
    }

    public static TranslationToRef(x: number, y: number, z: number, result: M4): void {
        M4.FromValuesToRef(1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            x, y, z, 1.0, result);
    }

    public static LookAtLH(eye: V3, target: V3, up: V3): M4 {
        var result = M4.Zero();
        M4.LookAtLHToRef(eye, target, up, result);
        return result;
    }

    public static LookAtLHToRef(eye: V3, target: V3, up: V3, result: M4): void {
        let zAx = target.sub(eye).unit();
        let xAx = up.cross(zAx).unit();
        let yAx = zAx.cross(xAx);
        
        var ex = - xAx.dot(eye);
        var ey = - yAx.dot(eye);
        var ez = - zAx.dot(eye);

        return M4.FromValuesToRef(
            xAx.x, yAx.x, zAx.x, 0,
            xAx.y, yAx.y, zAx.y, 0,
            xAx.z, yAx.z, zAx.z, 0,
            ex, ey, ez, 1,
            result
        );
    }

    public static OrthoLH(width: number, height: number, znear: number, zfar: number): M4 {
        var matrix = M4.Zero();
        M4.OrthoLHToRef(width, height, znear, zfar, matrix);
        return matrix;
    }

    public static OrthoLHToRef(width: number, height: number, znear: number, zfar: number, result: M4): void {
        let n = znear;
        let f = zfar;

        let a = 2.0 / width;
        let b = 2.0 / height;
        let c = 2.0 / (f - n);
        let d = -(f + n) / (f - n);

        M4.FromValuesToRef(
            a, 0.0, 0.0, 0.0,
            0.0, b, 0.0, 0.0,
            0.0, 0.0, c, 0.0,
            0.0, 0.0, d, 1.0,
            result
        );
    }

    public static OrthoOffCenterLH(left: number, right: number, bottom: number, top: number, znear: number, zfar: number): M4 {
        var matrix = M4.Zero();

        M4.OrthoOffCenterLHToRef(left, right, bottom, top, znear, zfar, matrix);

        return matrix;
    }

    public static OrthoOffCenterLHToRef(left: number, right: number, bottom: number, top: number, znear: number, zfar: number, result: M4): void {
        let n = znear;
        let f = zfar;

        let a = 2.0 / (right - left);
        let b = 2.0 / (top - bottom);
        let c = 2.0 / (f - n);
        let d = -(f + n) / (f - n);
        let i0 = (left + right) / (left - right);
        let i1 = (top + bottom) / (bottom - top);

        M4.FromValuesToRef(
            a, 0.0, 0.0, 0.0,
            0.0, b, 0.0, 0.0,
            0.0, 0.0, c, 0.0,
            i0, i1, d, 1.0,
            result
        );
    }

    public static PerspectiveLH(width: number, height: number, znear: number, zfar: number): M4 {
        var matrix = M4.Zero();

        let n = znear;
        let f = zfar;

        let a = 2.0 * n / width;
        let b = 2.0 * n / height;
        let c = (f + n) / (f - n);
        let d = -2.0 * f * n / (f - n);

        M4.FromValuesToRef(
            a, 0.0, 0.0, 0.0,
            0.0, b, 0.0, 0.0,
            0.0, 0.0, c, 1.0,
            0.0, 0.0, d, 0.0,
            matrix
        );

        return matrix;
    }

    public static PerspectiveFovLH(fov: number, aspect: number, znear: number, zfar: number): M4 {
        var matrix = M4.Zero();
        M4.PerspectiveFovLHToRef(fov, aspect, znear, zfar, matrix);
        return matrix;
    }

    public static PerspectiveFovLHToRef(fov: number, aspect: number, znear: number, zfar: number, result: M4, isVerticalFovFixed = true): void {
        let n = znear;
        let f = zfar;

        let t = 1.0 / (Math.tan(fov * 0.5));
        let a = isVerticalFovFixed ? (t / aspect) : t;
        let b = isVerticalFovFixed ? t : (t * aspect);
        let c = (f + n) / (f - n);
        let d = -2.0 * f * n / (f - n);

        M4.FromValuesToRef(
            a, 0.0, 0.0, 0.0,
            0.0, b, 0.0, 0.0,
            0.0, 0.0, c, 1.0,
            0.0, 0.0, d, 0.0,
            result
        );
    }

    public static GetFinalMatrix(viewport: AABB, world: M4, view: M4, projection: M4, zmin: number, zmax: number): M4 {
        var cw = viewport.width;
        var ch = viewport.height;
        var cx = viewport.x;
        var cy = viewport.y;

        var viewportMatrix = M4.FromValues(cw / 2.0, 0.0, 0.0, 0.0,
            0.0, -ch / 2.0, 0.0, 0.0,
            0.0, 0.0, zmax - zmin, 0.0,
            cx + cw / 2.0, ch / 2.0 + cy, zmin, 1);

        return world.mul(view).mul(projection).mul(viewportMatrix);
    }

    public static Transpose(matrix: M4): M4 {
        var result = new M4();

        M4.TransposeToRef(matrix, result);

        return result;
    }

    public static TransposeToRef(matrix: M4, result: M4): void {
        result.m[0] = matrix.m[0];
        result.m[1] = matrix.m[4];
        result.m[2] = matrix.m[8];
        result.m[3] = matrix.m[12];

        result.m[4] = matrix.m[1];
        result.m[5] = matrix.m[5];
        result.m[6] = matrix.m[9];
        result.m[7] = matrix.m[13];

        result.m[8] = matrix.m[2];
        result.m[9] = matrix.m[6];
        result.m[10] = matrix.m[10];
        result.m[11] = matrix.m[14];

        result.m[12] = matrix.m[3];
        result.m[13] = matrix.m[7];
        result.m[14] = matrix.m[11];
        result.m[15] = matrix.m[15];
    }

    public static FromXYZAxesToRef(xaxis: V3, yaxis: V3, zaxis: V3, result: M4) {

        result.m[0] = xaxis.x;
        result.m[1] = xaxis.y;
        result.m[2] = xaxis.z;

        result.m[3] = 0.0;

        result.m[4] = yaxis.x;
        result.m[5] = yaxis.y;
        result.m[6] = yaxis.z;

        result.m[7] = 0.0;

        result.m[8] = zaxis.x;
        result.m[9] = zaxis.y;
        result.m[10] = zaxis.z;

        result.m[11] = 0.0;

        result.m[12] = 0.0;
        result.m[13] = 0.0;
        result.m[14] = 0.0;

        result.m[15] = 1.0;
    }
}