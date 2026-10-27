// js/geometries/MountainGeometry.js
import { Geometry } from "../core/Geometry.js";

export class MountainGeometry extends Geometry {
    /**
     * Genera una montaña o colina irregular de estilo low-poly con múltiples anillos.
     * @param {number} radiusX   Radio base en el eje X
     * @param {number} radiusZ   Radio base en el eje Z
     * @param {number} height    Altura total de la cumbre
     * @param {number} segments  Divisiones angulares (lados)
     * @param {number} seed      Semilla para variar la forma de cada montaña
     */
    constructor(radiusX = 28.0, radiusZ = 22.0, height = 26.0, segments = 16, seed = 1.0) {
        super();

        const rand = (s) => {
            const x = Math.sin(s * 127.1 + seed * 311.7) * 43758.5453;
            return x - Math.floor(x);
        };

        const levels = [
            { y: -2.5,          scale: 1.05, jitter: 0.16, sOff: 10 },
            { y: height * 0.28, scale: 0.82, jitter: 0.24, sOff: 30 },
            { y: height * 0.58, scale: 0.52, jitter: 0.25, sOff: 60 },
            { y: height * 0.84, scale: 0.24, jitter: 0.20, sOff: 90 }
        ];

        const rings = [];
        for (let r = 0; r < levels.length; r++) {
            const lvl = levels[r];
            const ring = [];
            for (let i = 0; i < segments; i++) {
                const angle = (i / segments) * Math.PI * 2.0;
                const radialVar = (1.0 - lvl.jitter * 0.5) + rand(i + lvl.sOff) * lvl.jitter;
                const yVar = (r > 0) ? (rand(i + lvl.sOff + 50) - 0.5) * (height * 0.08) : 0.0;

                ring.push({
                    x: Math.cos(angle) * radiusX * lvl.scale * radialVar,
                    y: lvl.y + yVar,
                    z: Math.sin(angle) * radiusZ * lvl.scale * radialVar
                });
            }
            rings.push(ring);
        }

        const peak = {
            x: (rand(200) - 0.5) * radiusX * 0.12,
            y: height,
            z: (rand(250) - 0.5) * radiusZ * 0.12
        };

        const positionsWithNormals = [];
        const indices = [];
        let indexCounter = 0;

        const addTriangleOutward = (a, b, c) => {
            const abx = b.x - a.x, aby = b.y - a.y, abz = b.z - a.z;
            const acx = c.x - a.x, acy = c.y - a.y, acz = c.z - a.z;

            let nx = aby * acz - abz * acy;
            let ny = abz * acx - abx * acz;
            let nz = abx * acy - aby * acx;
            const len = Math.hypot(nx, ny, nz) || 1.0;
            nx /= len; ny /= len; nz /= len;

            const mx = (a.x + b.x + c.x) / 3.0;
            const mz = (a.z + b.z + c.z) / 3.0;

            if (nx * mx + nz * mz < 0 && ny < 0.85) {
                nx = -nx; ny = -ny; nz = -nz;
                positionsWithNormals.push(a.x, a.y, a.z, nx, ny, nz); indices.push(indexCounter++);
                positionsWithNormals.push(c.x, c.y, c.z, nx, ny, nz); indices.push(indexCounter++);
                positionsWithNormals.push(b.x, b.y, b.z, nx, ny, nz); indices.push(indexCounter++);
            } else {
                positionsWithNormals.push(a.x, a.y, a.z, nx, ny, nz); indices.push(indexCounter++);
                positionsWithNormals.push(b.x, b.y, b.z, nx, ny, nz); indices.push(indexCounter++);
                positionsWithNormals.push(c.x, c.y, c.z, nx, ny, nz); indices.push(indexCounter++);
            }
        };

        // Conectar anillos laterales
        for (let r = 0; r < rings.length - 1; r++) {
            const lower = rings[r];
            const upper = rings[r + 1];
            for (let i = 0; i < segments; i++) {
                const iNext = (i + 1) % segments;
                addTriangleOutward(lower[i], upper[i], upper[iNext]);
                addTriangleOutward(lower[i], upper[iNext], lower[iNext]);
            }
        }

        // Conectar el último anillo con la cumbre
        const topRing = rings[rings.length - 1];
        for (let i = 0; i < segments; i++) {
            const iNext = (i + 1) % segments;
            addTriangleOutward(topRing[i], peak, topRing[iNext]);
        }

        this.vertices = new Float32Array(positionsWithNormals);
        this.indices = new Uint16Array(indices);
        this.indexCount = this.indices.length;
    }
}