export class Matrix4 {
    static identity() {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    static multiply(a, b) {
        const out = new Float32Array(16);
        for (let col = 0; col < 4; col++) {
            for (let row = 0; row < 4; row++) {
                let sum = 0;
                for (let k = 0; k < 4; k++) {
                    sum += a[k * 4 + row] * b[col * 4 + k];
                }
                out[col * 4 + row] = sum;
            }
        }
        return out;
    }

    static translation(x, y, z) {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        ]);
    }

    static scaling(x, y, z) {
        return new Float32Array([
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        ]);
    }

    static rotationX(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Float32Array([
            1,  0, 0, 0,
            0,  c, s, 0,
            0, -s, c, 0,
            0,  0, 0, 1
        ]);
    }

    static rotationY(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Float32Array([
             c, 0, -s, 0,
             0, 1,  0, 0,
             s, 0,  c, 0,
             0, 0,  0, 1
        ]);
    }

    static rotationZ(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Float32Array([
             c, s, 0, 0,
            -s, c, 0, 0,
             0, 0, 1, 0,
             0, 0, 0, 1
        ]);
    }

    static compose(position, rotation, scale) {
        const T = Matrix4.translation(position.x, position.y, position.z);
        const Rx = Matrix4.rotationX(rotation.x);
        const Ry = Matrix4.rotationY(rotation.y);
        const Rz = Matrix4.rotationZ(rotation.z);
        const S = Matrix4.scaling(scale.x, scale.y, scale.z);

        const R = Matrix4.multiply(Rz, Matrix4.multiply(Ry, Rx));
        return Matrix4.multiply(T, Matrix4.multiply(R, S));
    }

    static perspective(fovRad, aspect, near, far) {
        const f = 1.0 / Math.tan(fovRad / 2.0);
        const nf = 1.0 / (near - far);
        return new Float32Array([
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far + near) * nf, -1,
            0, 0, (2.0 * far * near) * nf, 0
        ]);
    }

    static lookAt(eye, target, up) {
        const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
        const length = v => Math.hypot(v[0], v[1], v[2]);
        const norm = v => {
            const l = length(v);
            return l > 0 ? [v[0] / l, v[1] / l, v[2] / l] : [0, 0, 0];
        };
        const cross = (a, b) => [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ];

        const zAxis = norm(sub(eye, target));
        const xAxis = norm(cross(up, zAxis));
        const yAxis = cross(zAxis, xAxis);

        return new Float32Array([
            xAxis[0], yAxis[0], zAxis[0], 0,
            xAxis[1], yAxis[1], zAxis[1], 0,
            xAxis[2], yAxis[2], zAxis[2], 0,
            -(xAxis[0] * eye[0] + xAxis[1] * eye[1] + xAxis[2] * eye[2]),
            -(yAxis[0] * eye[0] + yAxis[1] * eye[1] + yAxis[2] * eye[2]),
            -(zAxis[0] * eye[0] + zAxis[1] * eye[1] + zAxis[2] * eye[2]),
            1
        ]);
    }
}