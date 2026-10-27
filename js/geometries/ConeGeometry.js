import { Geometry } from "../core/Geometry.js";

export class ConeGeometry extends Geometry {
    // apexAtOrigin: true hace que el vértice puntual esté en (0,0,0)
    // y la base ancha se proyecte a lo largo de -Z
    constructor(radius = 3.5, length = 20.0, radialSegments = 32) {
        super();

        const positions = [];
        const indices = [];

        // Vértice 0: Punto emisor de luz (origen del foco)
        positions.push(0, 0, 0, 0, 0, 1);

        // Vértices de la base proyectada en -Z
        for (let i = 0; i <= radialSegments; i++) {
            const theta = (i / radialSegments) * Math.PI * 2.0;
            const cosT = Math.cos(theta);
            const sinT = Math.sin(theta);

            const px = radius * cosT;
            const py = radius * sinT;
            const pz = -length; // Proyección frontal hacia adelante

            // Normales apuntando hacia afuera del cono
            const nx = cosT;
            const ny = sinT;
            const nz = radius / length;
            const len = Math.hypot(nx, ny, nz);

            positions.push(px, py, pz, nx / len, ny / len, nz / len);
        }

        // Caras laterales triangulares
        for (let i = 1; i <= radialSegments; i++) {
            indices.push(0, i, i + 1);
        }

        this.vertices = new Float32Array(positions);
        this.indices = new Uint16Array(indices);
        this.indexCount = this.indices.length;
    }
}