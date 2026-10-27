// js/geometries/CliffGeometry.js
import { Geometry } from "../core/Geometry.js";

export class CliffGeometry extends Geometry {
    constructor(baseWidth = 20.0, topWidth = 8.5, height = 8.0, depth = 18.0) {
        super();

        const SEGMENTS = 14;
        const bw = baseWidth / 2;
        const tw = topWidth / 2;
        const bd = depth / 2;
        const td = (depth * 0.78) / 2;

        const rand = (seed) => {
            const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
            return x - Math.floor(x);
        };

        const rings = [];
        const levels = [
            { y: -2.0, rx: bw * 1.05, rz: bd * 1.05, jitterAmt: 0.18, seedOffset: 1 },
            { y: height * 0.35, rx: bw * 0.85, rz: bd * 0.85, jitterAmt: 0.22, seedOffset: 20 },
            { y: height * 0.72, rx: tw * 1.18, rz: td * 1.18, jitterAmt: 0.16, seedOffset: 40 },
            { y: height, rx: tw, rz: td, jitterAmt: 0.08, seedOffset: 60 }
        ];

        for (let r = 0; r < levels.length; r++) {
            const lvl = levels[r];
            const ring = [];
            for (let i = 0; i < SEGMENTS; i++) {
                const a = (i / SEGMENTS) * Math.PI * 2;
                const jitter = (1.0 - lvl.jitterAmt * 0.5) + rand(i + lvl.seedOffset) * lvl.jitterAmt;
                const yJitter = (r > 0 && r < levels.length - 1) ? (rand(i + lvl.seedOffset + 100) - 0.5) * 0.6 : 0.0;
                ring.push({
                    x: Math.cos(a) * lvl.rx * jitter,
                    y: lvl.y + yJitter,
                    z: Math.sin(a) * lvl.rz * jitter
                });
            }
            rings.push(ring);
        }

        const positionsWithNormals = [];
        const indices = [];
        let indexCounter = 0;

        // Agrega un triángulo asegurando que la normal apunte siempre hacia afuera del risco
        const addTriangleOutward = (a, b, c) => {
            const abx = b.x - a.x, aby = b.y - a.y, abz = b.z - a.z;
            const acx = c.x - a.x, acy = c.y - a.y, acz = c.z - a.z;

            let nx = aby * acz - abz * acy;
            let ny = abz * acx - abx * acz;
            let nz = abx * acy - aby * acx;
            const len = Math.hypot(nx, ny, nz) || 1.0;
            nx /= len; ny /= len; nz /= len;

            // Centroide del triángulo respecto al eje Y central del risco
            const mx = (a.x + b.x + c.x) / 3.0;
            const mz = (a.z + b.z + c.z) / 3.0;

            // Si la normal apunta hacia adentro, la invertimos junto con el orden de vértices
            if (nx * mx + nz * mz < 0) {
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

        // Caras laterales entre anillos
        for (let r = 0; r < rings.length - 1; r++) {
            const lower = rings[r];
            const upper = rings[r + 1];
            for (let i = 0; i < SEGMENTS; i++) {
                const iNext = (i + 1) % SEGMENTS;
                addTriangleOutward(lower[i], upper[i], upper[iNext]);
                addTriangleOutward(lower[i], upper[iNext], lower[iNext]);
            }
        }

        // Meseta superior plana donde se apoya el faro (Normal hacia +Y)
        const topRing = rings[rings.length - 1];
        const centerTop = { x: 0, y: height, z: 0 };
        for (let i = 0; i < SEGMENTS; i++) {
            const iNext = (i + 1) % SEGMENTS;
            const a = topRing[i];
            const b = topRing[iNext];
            positionsWithNormals.push(centerTop.x, centerTop.y, centerTop.z, 0, 1, 0); indices.push(indexCounter++);
            positionsWithNormals.push(b.x, b.y, b.z, 0, 1, 0); indices.push(indexCounter++);
            positionsWithNormals.push(a.x, a.y, a.z, 0, 1, 0); indices.push(indexCounter++);
        }

        this.vertices = new Float32Array(positionsWithNormals);
        this.indices = new Uint16Array(indices);
        this.indexCount = indices.length;
    }
}