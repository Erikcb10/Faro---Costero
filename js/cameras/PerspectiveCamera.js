import { Camera } from "./Camera.js";
import { Matrix4 } from "../math/Matrix4.js";

export class PerspectiveCamera extends Camera {
    constructor(fov = 60, aspect = 1.5, near = 0.1, far = 200.0) {
        super();
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.updateProjectionMatrix();
    }

    updateProjectionMatrix() {
        const fovRad = (this.fov * Math.PI) / 180.0;
        this.projectionMatrix = Matrix4.perspective(
            fovRad,
            this.aspect,
            this.near,
            this.far
        );
    }
}