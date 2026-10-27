import { Geometry } from "../core/Geometry.js";

export class SphereGeometry extends Geometry {
    constructor(radius = 1.0, rings = 8, segments = 12) {
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

        const grid = [];
        for (let r = 0; r <= rings; r++) {
            const phi = (r / rings) * Math.PI;
            const y = Math.cos(phi) * radius;
            const ringRadius = Math.sin(phi) * radius;
            const ringVerts = [];
            for (let s = 0; s <= segments; s++) {
                const theta = (s / segments) * Math.PI * 2;
                ringVerts.push({
                    x: Math.cos(theta) * ringRadius,
                    y: y,
                    z: Math.sin(theta) * ringRadius
                });
            }
            grid.push(ringVerts);
        }

        for (let r = 0; r < rings; r++) {
            for (let s = 0; s < segments; s++) {
                const a = grid[r][s];
                const b = grid[r][s + 1];
                const c = grid[r + 1][s];
                const d = grid[r + 1][s + 1];
                addTriangle(a.x, a.y, a.z, c.x, c.y, c.z, b.x, b.y, b.z);
                addTriangle(b.x, b.y, b.z, c.x, c.y, c.z, d.x, d.y, d.z);
            }
        }

        this.vertices = new Float32Array(positionsWithNormals);
        this.indices = new Uint16Array(indices);
        this.indexCount = indices.length;
    }
}