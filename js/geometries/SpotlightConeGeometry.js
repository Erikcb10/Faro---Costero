// js/geometries/SpotlightConeGeometry.js
import { Geometry } from "../core/Geometry.js";

export class SpotlightConeGeometry extends Geometry {
    constructor(startRadius = 0.35, endRadius = 7.0, length = 42.0, segments = 32) {
        super();

        const positionsWithNormals = [];
        const indices = [];
        let indexCounter = 0;

        const addTriangle = (ax, ay, az, bx, by, bz, cx, cy, cz) => {
            const abx = bx - ax, aby = by - ay, abz = bz - az;
            const acx = cx - ax, acy = cy - ay, acz = cz - az;
            let nx = aby * acz - abz * acy;
            let ny = abz * acx - abx * acz;
            let nz = abx * acy - aby * acx;
            const len = Math.hypot(nx, ny, nz) || 1.0;
            nx /= len; ny /= len; nz /= len;

            positionsWithNormals.push(ax, ay, az, nx, ny, nz); indices.push(indexCounter++);
            positionsWithNormals.push(bx, by, bz, nx, ny, nz); indices.push(indexCounter++);
            positionsWithNormals.push(cx, cy, cz, nx, ny, nz); indices.push(indexCounter++);
        };

        const startRing = [];
        const endRing = [];

        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2.0;
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);

            startRing.push({
                x: cosA * startRadius,
                y: sinA * startRadius,
                z: 0.0
            });

            endRing.push({
                x: cosA * endRadius,
                y: sinA * endRadius,
                z: -length
            });
        }

        for (let i = 0; i < segments; i++) {
            const iNext = (i + 1) % segments;
            const a = startRing[i];
            const b = startRing[iNext];
            const c = endRing[i];
            const d = endRing[iNext];

            addTriangle(a.x, a.y, a.z, c.x, c.y, c.z, b.x, b.y, b.z);
            addTriangle(b.x, b.y, b.z, c.x, c.y, c.z, d.x, d.y, d.z);
        }

        this.vertices = new Float32Array(positionsWithNormals);
        this.indices = new Uint16Array(indices);
        this.indexCount = this.indices.length;
    }
}