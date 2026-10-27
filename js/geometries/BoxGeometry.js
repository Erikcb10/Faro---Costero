import { Geometry } from "../core/Geometry.js";

export class BoxGeometry extends Geometry {
    constructor(width = 1.0, height = 1.0, depth = 1.0) {
        super();

        const w = width / 2.0;
        const h = height / 2.0;
        const d = depth / 2.0;

        // 24 unique vertices with flat face normals (px, py, pz, nx, ny, nz)
        const rawVertices = [
            // Front face (+Z)
            -w, -h,  d,  0,  0,  1,
             w, -h,  d,  0,  0,  1,
             w,  h,  d,  0,  0,  1,
            -w,  h,  d,  0,  0,  1,

            // Back face (-Z)
             w, -h, -d,  0,  0, -1,
            -w, -h, -d,  0,  0, -1,
            -w,  h, -d,  0,  0, -1,
             w,  h, -d,  0,  0, -1,

            // Top face (+Y)
            -w,  h,  d,  0,  1,  0,
             w,  h,  d,  0,  1,  0,
             w,  h, -d,  0,  1,  0,
            -w,  h, -d,  0,  1,  0,

            // Bottom face (-Y)
            -w, -h, -d,  0, -1,  0,
             w, -h, -d,  0, -1,  0,
             w, -h,  d,  0, -1,  0,
            -w, -h,  d,  0, -1,  0,

            // Right face (+X)
             w, -h,  d,  1,  0,  0,
             w, -h, -d,  1,  0,  0,
             w,  h, -d,  1,  0,  0,
             w,  h,  d,  1,  0,  0,

            // Left face (-X)
            -w, -h, -d, -1,  0,  0,
            -w, -h,  d, -1,  0,  0,
            -w,  h,  d, -1,  0,  0,
            -w,  h, -d, -1,  0,  0
        ];

        const rawIndices = [
            0,  1,  2,      0,  2,  3,    // Front
            4,  5,  6,      4,  6,  7,    // Back
            8,  9,  10,     8,  10, 11,   // Top
            12, 13, 14,     12, 14, 15,   // Bottom
            16, 17, 18,     16, 18, 19,   // Right
            20, 21, 22,     20, 22, 23    // Left
        ];

        this.vertices = new Float32Array(rawVertices);
        this.indices = new Uint16Array(rawIndices);
        this.indexCount = this.indices.length;
    }
}