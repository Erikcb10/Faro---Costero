// js/geometries/CylinderGeometry.js
import { Geometry } from "../core/Geometry.js";

export class CylinderGeometry extends Geometry {
    constructor(radiusTop = 0.5, radiusBottom = 0.5, height = 2.0, radialSegments = 28) {
        super();

        const positionsWithNormals = [];
        const indices = [];
        const halfHeight = height / 2.0;

        // 1. Paredes laterales del cilindro / tronco de cono
        for (let y = 0; y <= 1; y++) {
            const py = (y === 0) ? -halfHeight : halfHeight;
            const radius = (y === 0) ? radiusBottom : radiusTop;

            for (let i = 0; i <= radialSegments; i++) {
                const u = i / radialSegments;
                const theta = u * Math.PI * 2.0;
                const sinT = Math.sin(theta);
                const cosT = Math.cos(theta);

                const px = radius * cosT;
                const pz = radius * sinT;

                const nx = cosT;
                const ny = (radiusBottom - radiusTop) / height;
                const nz = sinT;
                const nLen = Math.hypot(nx, ny, nz) || 1.0;

                positionsWithNormals.push(px, py, pz, nx / nLen, ny / nLen, nz / nLen);
            }
        }

        const ringVertexCount = radialSegments + 1;
        for (let i = 0; i < radialSegments; i++) {
            const bottom = i;
            const top = i + ringVertexCount;

            indices.push(bottom, top, bottom + 1);
            indices.push(top, top + 1, bottom + 1);
        }

        // 2. Tapa superior (+Y) para que los balcones y anillos del faro sean sólidos
        if (radiusTop > 0.0) {
            const topCenterIdx = positionsWithNormals.length / 6;
            positionsWithNormals.push(0.0, halfHeight, 0.0, 0.0, 1.0, 0.0);

            for (let i = 0; i <= radialSegments; i++) {
                const theta = (i / radialSegments) * Math.PI * 2.0;
                const px = radiusTop * Math.cos(theta);
                const pz = radiusTop * Math.sin(theta);
                positionsWithNormals.push(px, halfHeight, pz, 0.0, 1.0, 0.0);
            }

            for (let i = 0; i < radialSegments; i++) {
                indices.push(topCenterIdx, topCenterIdx + 1 + i + 1, topCenterIdx + 1 + i);
            }
        }

        // 3. Tapa inferior (-Y)
        if (radiusBottom > 0.0) {
            const botCenterIdx = positionsWithNormals.length / 6;
            positionsWithNormals.push(0.0, -halfHeight, 0.0, 0.0, -1.0, 0.0);

            for (let i = 0; i <= radialSegments; i++) {
                const theta = (i / radialSegments) * Math.PI * 2.0;
                const px = radiusBottom * Math.cos(theta);
                const pz = radiusBottom * Math.sin(theta);
                positionsWithNormals.push(px, -halfHeight, pz, 0.0, -1.0, 0.0);
            }

            for (let i = 0; i < radialSegments; i++) {
                indices.push(botCenterIdx, botCenterIdx + 1 + i, botCenterIdx + 1 + i + 1);
            }
        }

        this.vertices = new Float32Array(positionsWithNormals);
        this.indices = new Uint16Array(indices);
        this.indexCount = this.indices.length;
    }
}