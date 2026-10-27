// js/geometries/HullGeometry.js
import { Geometry } from "../core/Geometry.js";

export class HullGeometry extends Geometry {
    constructor(length = 5.2, width = 2.0, height = 1.3) {
        super();

        const L = length / 2;
        const W = width / 2;
        const H = height / 2;

        const positionsWithNormals = [];
        const indices = [];
        let indexCounter = 0;

        // Calcula la normal y se asegura de que apunte hacia el exterior respecto al centro (0,0,0)
        const addFace = (ax, ay, az, bx, by, bz, cx, cy, cz, forceUp = null) => {
            const abx = bx - ax, aby = by - ay, abz = bz - az;
            const acx = cx - ax, acy = cy - ay, acz = cz - az;
            let nx = aby * acz - abz * acy;
            let ny = abz * acx - abx * acz;
            let nz = abx * acy - aby * acx;
            const len = Math.hypot(nx, ny, nz) || 1.0;
            nx /= len; ny /= len; nz /= len;

            const mx = (ax + bx + cx) / 3.0;
            const my = (ay + by + cy) / 3.0;
            const mz = (az + bz + cz) / 3.0;

            const dotOut = (forceUp !== null) ? (ny * forceUp) : (nx * mx + ny * my + nz * mz);
            if (dotOut < 0) {
                nx = -nx; ny = -ny; nz = -nz;
                positionsWithNormals.push(ax, ay, az, nx, ny, nz); indices.push(indexCounter++);
                positionsWithNormals.push(cx, cy, cz, nx, ny, nz); indices.push(indexCounter++);
                positionsWithNormals.push(bx, by, bz, nx, ny, nz); indices.push(indexCounter++);
            } else {
                positionsWithNormals.push(ax, ay, az, nx, ny, nz); indices.push(indexCounter++);
                positionsWithNormals.push(bx, by, bz, nx, ny, nz); indices.push(indexCounter++);
                positionsWithNormals.push(cx, cy, cz, nx, ny, nz); indices.push(indexCounter++);
            }
        };

        const addQuad = (a, b, c, d, forceUp = null) => {
            addFace(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2], forceUp);
            addFace(a[0], a[1], a[2], c[0], c[1], c[2], d[0], d[1], d[2], forceUp);
        };

        // Estaciones longitudinales desde popa (-Z) hasta proa (+Z)
        const stations = [
            { z: -L,        wTop: W * 0.75, wBot: W * 0.45, yTop: H * 0.65, yBot: -H },
            { z: -L * 0.45, wTop: W,        wBot: W * 0.65, yTop: H * 0.55, yBot: -H },
            { z:  L * 0.25, wTop: W,        wBot: W * 0.60, yTop: H * 0.60, yBot: -H },
            { z:  L * 0.70, wTop: W * 0.55, wBot: W * 0.20, yTop: H * 0.75, yBot: -H * 0.85 },
            { z:  L,        wTop: 0.0,      wBot: 0.0,      yTop: H * 0.90, yBot: -H * 0.40 }
        ];

        for (let i = 0; i < stations.length - 1; i++) {
            const s0 = stations[i];
            const s1 = stations[i + 1];

            // Costado Estribor (+X)
            addQuad(
                [s0.wTop, s0.yTop, s0.z],
                [s1.wTop, s1.yTop, s1.z],
                [s1.wBot, s1.yBot, s1.z],
                [s0.wBot, s0.yBot, s0.z]
            );

            // Costado Babor (-X)
            addQuad(
                [-s0.wTop, s0.yTop, s0.z],
                [-s0.wBot, s0.yBot, s0.z],
                [-s1.wBot, s1.yBot, s1.z],
                [-s1.wTop, s1.yTop, s1.z]
            );

            // Cubierta Superior (+Y)
            addQuad(
                [-s0.wTop, s0.yTop, s0.z],
                [-s1.wTop, s1.yTop, s1.z],
                [ s1.wTop, s1.yTop, s1.z],
                [ s0.wTop, s0.yTop, s0.z],
                1
            );

            // Fondo del casco (-Y)
            addQuad(
                [-s0.wBot, s0.yBot, s0.z],
                [ s0.wBot, s0.yBot, s0.z],
                [ s1.wBot, s1.yBot, s1.z],
                [-s1.wBot, s1.yBot, s1.z],
                -1
            );
        }

        // Espejo de Popa (-Z)
        const st = stations[0];
        addQuad(
            [-st.wTop, st.yTop, st.z],
            [ st.wTop, st.yTop, st.z],
            [ st.wBot, st.yBot, st.z],
            [-st.wBot, st.yBot, st.z]
        );

        this.vertices = new Float32Array(positionsWithNormals);
        this.indices = new Uint16Array(indices);
        this.indexCount = indices.length;
    }
}