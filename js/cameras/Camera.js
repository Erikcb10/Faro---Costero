import { Object3D } from "../core/Object3D.js";
import { Matrix4 } from "../math/Matrix4.js";

export class Camera extends Object3D {
    constructor() {
        super();
        this.target = { x: 0, y: 0, z: 0 };
        this.up = { x: 0, y: 1, z: 0 };
        this.viewMatrix = Matrix4.identity();
        this.projectionMatrix = Matrix4.identity();
    }

    updateViewMatrix() {
        this.viewMatrix = Matrix4.lookAt(
            [this.position.x, this.position.y, this.position.z],
            [this.target.x, this.target.y, this.target.z],
            [this.up.x, this.up.y, this.up.z]
        );
    }
}