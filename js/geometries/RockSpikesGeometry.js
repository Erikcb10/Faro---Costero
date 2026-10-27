// js/geometries/RockSpikesGeometry.js
import { Geometry } from "../core/Geometry.js";

export class RockSpikesGeometry extends Geometry {
    constructor(baseRadius = 11.5, count = 22, minHeight = 1.0, maxHeight = 3.2, minRadius = 0.7, maxRadius = 1.6) {
        super();

        const rand = (seed) => {
            const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
            return x - Math.floor(x);
        };

        const positionsWithNormals = [];
        const indices = [];
        let indexCounter = 0;

        const addRockTriangle = (a, b, c, rockCenterX, rockCenterZ) => {
            const abx = b.x - a.x, aby = b.y - a.y, abz = b.z - a.z;
            const acx = c.x - a.x, acy = c.y - a.y, acz = c.z - a.z;
            let nx = aby * acz - abz * acy;
            let ny = abz * acx - abx * acz;
            let nz = abx * acy - aby * acx;
            const len = Math.hypot(nx, ny, nz) || 1.0;
            nx /= len; ny /= len; nz /= len;

            const mx = (a.x + b.x + c.x) / 3.0 - rockCenterX;
            const mz = (a.z + b.z + c.z) / 3.0 - rockCenterZ;

            if (nx * mx + nz * mz < 0 && ny < 0) {
                nx = -nx; ny = -ny; nz = -nz;
            }

            positionsWithNormals.push(a.x, a.y, a.z, nx, ny, nz); indices.push(indexCounter++);
            positionsWithNormals.push(b.x, b.y, b.z, nx, ny, nz); indices.push(indexCounter++);
            positionsWithNormals.push(c.x, c.y, c.z, nx, ny, nz); indices.push(indexCounter++);
        };

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + (rand(i + 1) - 0.5) * 0.25;
            // Se ubican abrazando la base del acantilado en el agua
            const rx = Math.cos(angle) * baseRadius * (0.82 + rand(i + 10) * 0.22);
            const rz = Math.sin(angle) * baseRadius * 0.88 * (0.82 + rand(i + 20) * 0.22);

            const height = minHeight + rand(i + 30) * (maxHeight - minHeight);
            const radius = minRadius + rand(i + 50) * (maxRadius - minRadius);
            const sides = 5;

            const baseY = -1.2;
            const baseVerts = [];
            for (let s = 0; s < sides; s++) {
                const sa = (s / sides) * Math.PI * 2;
                const rJit = radius * (0.8 + rand(i * 10 + s) * 0.4);
                baseVerts.push({
                    x: rx + Math.cos(sa) * rJit,
                    y: baseY,
                    z: rz + Math.sin(sa) * rJit
                });
            }

            const tip = {
                x: rx + (rand(i + 90) - 0.5) * radius * 0.45,
                y: height,
                z: rz + (rand(i + 110) - 0.5) * radius * 0.45
            };

            for (let s = 0; s < sides; s++) {
                const a = baseVerts[s];
                const b = baseVerts[(s + 1) % sides];
                addRockTriangle(a, b, tip, rx, rz);
            }
        }

        this.vertices = new Float32Array(positionsWithNormals);
        this.indices = new Uint16Array(indices);
        this.indexCount = indices.length;
    }
}