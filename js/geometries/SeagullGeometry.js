// js/geometries/SeagullGeometry.js
import { Geometry } from "../core/Geometry.js";

export class SeagullGeometry extends Geometry {
    /**
     * Genera un ala de ave marina con quiebre natural para animar el aleteo.
     * @param {number} wingSpan  Largo de un ala desde el torso hasta la punta
     * @param {number} chord     Ancho del ala de adelante hacia atrás
     * @param {number} side      1 para ala derecha (+X), -1 para ala izquierda (-X)
     */
    constructor(wingSpan = 1.15, chord = 0.34, side = 1) {
        super();

        const positionsWithNormals = [];
        const indices = [];
        let indexCounter = 0;

        const addFace = (a, b, c, forceUp = 1) => {
            const abx = b[0] - a[0], aby = b[1] - a[1], abz = b[2] - a[2];
            const acx = c[0] - a[0], acy = c[1] - a[1], acz = c[2] - a[2];

            let nx = aby * acz - abz * acy;
            let ny = abz * acx - abx * acz;
            let nz = abx * acy - aby * acx;
            const len = Math.hypot(nx, ny, nz) || 1.0;
            nx /= len; ny /= len; nz /= len;

            if (ny * forceUp < 0) {
                nx = -nx; ny = -ny; nz = -nz;
                positionsWithNormals.push(a[0], a[1], a[2], nx, ny, nz); indices.push(indexCounter++);
                positionsWithNormals.push(c[0], c[1], c[2], nx, ny, nz); indices.push(indexCounter++);
                positionsWithNormals.push(b[0], b[1], b[2], nx, ny, nz); indices.push(indexCounter++);
            } else {
                positionsWithNormals.push(a[0], a[1], a[2], nx, ny, nz); indices.push(indexCounter++);
                positionsWithNormals.push(b[0], b[1], b[2], nx, ny, nz); indices.push(indexCounter++);
                positionsWithNormals.push(c[0], c[1], c[2], nx, ny, nz); indices.push(indexCounter++);
            }
        };

        const s = side >= 0 ? 1.0 : -1.0;
        const midX = s * (wingSpan * 0.48);
        const tipX = s * wingSpan;
        const halfC = chord * 0.5;

        // Puntos de articulación del ala (raíz -> codo elevado -> punta hacia atrás)
        const rFront = [0.0,  0.02,  halfC];
        const rBack  = [0.0,  0.00, -halfC];
        const mFront = [midX, 0.14,  halfC * 0.85];
        const mBack  = [midX, 0.10, -halfC * 0.75];
        const tip    = [tipX, -0.04, -halfC * 0.90];

        // Cara superior del ala (+Y)
        addFace(rFront, mFront, mBack, 1);
        addFace(rFront, mBack,  rBack, 1);
        addFace(mFront, tip,    mBack, 1);

        // Cara inferior del ala (-Y) para que se vea sólida desde abajo
        addFace(rFront, mBack,  mFront, -1);
        addFace(rFront, rBack,  mBack,  -1);
        addFace(mFront, mBack,  tip,    -1);

        this.vertices = new Float32Array(positionsWithNormals);
        this.indices = new Uint16Array(indices);
        this.indexCount = this.indices.length;
    }
}