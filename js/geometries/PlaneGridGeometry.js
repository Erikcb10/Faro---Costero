// js/geometries/PlaneGridGeometry.js
import { Geometry } from "../core/Geometry.js";

export class PlaneGridGeometry extends Geometry {
    constructor(sizeX = 520.0, sizeZ = 520.0, segmentsX = 140, segmentsZ = 140) {
        super();

        // Seguridad para no superar el límite de Uint16Array (65535 vértices)
        this.segmentsX = Math.min(segmentsX, 240);
        this.segmentsZ = Math.min(segmentsZ, 240);
        this.sizeX = sizeX;
        this.sizeZ = sizeZ;

        const positions = [];
        const indices = [];

        const halfX = sizeX / 2.0;
        const halfZ = sizeZ / 2.0;
        const dx = sizeX / this.segmentsX;
        const dz = sizeZ / this.segmentsZ;

        this.baseCoords = new Float32Array((this.segmentsX + 1) * (this.segmentsZ + 1) * 2);
        let coordIdx = 0;

        for (let iz = 0; iz <= this.segmentsZ; iz++) {
            const z = -halfZ + iz * dz;
            for (let ix = 0; ix <= this.segmentsX; ix++) {
                const x = -halfX + ix * dx;
                this.baseCoords[coordIdx++] = x;
                this.baseCoords[coordIdx++] = z;
                // Formato stride = 6: px, py, pz, nx, ny, nz
                positions.push(x, 0.0, z, 0.0, 1.0, 0.0);
            }
        }

        const cols = this.segmentsX + 1;
        for (let iz = 0; iz < this.segmentsZ; iz++) {
            for (let ix = 0; ix < this.segmentsX; ix++) {
                const a = iz * cols + ix;
                const b = a + cols;

                indices.push(a, b, a + 1);
                indices.push(b, b + 1, a + 1);
            }
        }

        this.vertices = new Float32Array(positions);
        this.indices = new Uint16Array(indices);
        this.indexCount = this.indices.length;
    }

    updateWaves(gl, time) {
        const stride = 6;
        const totalVertices = this.baseCoords.length / 2;

        const t1 = time * 2.0;
        const t2 = time * 1.5;
        const t3 = time * 1.1;
        const t4 = time * 0.7;

        for (let i = 0; i < totalVertices; i++) {
            const x = this.baseCoords[i * 2];
            const z = this.baseCoords[i * 2 + 1];

            // Olas cortas y medianas + mar de fondo (swell largo para océano extenso)
            const w1 = Math.sin(x * 0.22 + t1) * 0.28;
            const w2 = Math.cos(z * 0.18 + t2) * 0.24;
            const w3 = Math.sin((x + z) * 0.10 + t3) * 0.20;
            const w4 = Math.cos((x * 0.04 - z * 0.05) + t4) * 0.42;

            const waveY = w1 + w2 + w3 + w4;
            const vIdx = i * stride;
            this.vertices[vIdx + 1] = waveY;

            // Derivadas parciales analíticas para normales precisas de iluminación
            const dydx = 0.22 * 0.28 * Math.cos(x * 0.22 + t1) +
                         0.10 * 0.20 * Math.cos((x + z) * 0.10 + t3) -
                         0.04 * 0.42 * Math.sin((x * 0.04 - z * 0.05) + t4);

            const dydz = -0.18 * 0.24 * Math.sin(z * 0.18 + t2) +
                          0.10 * 0.20 * Math.cos((x + z) * 0.10 + t3) +
                          0.05 * 0.42 * Math.sin((x * 0.04 - z * 0.05) + t4);

            const invLen = 1.0 / Math.hypot(-dydx, 1.0, -dydz);
            this.vertices[vIdx + 3] = -dydx * invLen;
            this.vertices[vIdx + 4] = invLen;
            this.vertices[vIdx + 5] = -dydz * invLen;
        }

        if (this.vbo) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
        }
    }
}