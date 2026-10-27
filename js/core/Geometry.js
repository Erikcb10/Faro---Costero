export class Geometry {
    constructor() {
        this.vertices = null; // Stride of 6 floats: px, py, pz, nx, ny, nz
        this.indices = null;
        this.indexCount = 0;
        this.vao = null;
        this.vbo = null;
        this.ebo = null;
        this.initialized = false;
    }
}