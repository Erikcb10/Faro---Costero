import { Matrix4 } from "../math/Matrix4.js";

export class Object3D {
    constructor() {
        this.position = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.scale = { x: 1, y: 1, z: 1 };

        this.parent = null;
        this.children = [];

        this.matrix = Matrix4.identity();
        this.matrixWorld = Matrix4.identity();
        this.visible = true;
    }

    add(child) {
        if (child.parent) {
            child.parent.remove(child);
        }
        child.parent = this;
        this.children.push(child);
        return this;
    }

    remove(child) {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            child.parent = null;
        }
        return this;
    }

    updateMatrix() {
        this.matrix = Matrix4.compose(this.position, this.rotation, this.scale);
    }

    updateMatrixWorld(parentMatrixWorld = null) {
        this.updateMatrix();
        if (parentMatrixWorld) {
            this.matrixWorld = Matrix4.multiply(parentMatrixWorld, this.matrix);
        } else {
            this.matrixWorld = this.matrix;
        }

        for (let i = 0; i < this.children.length; i++) {
            this.children[i].updateMatrixWorld(this.matrixWorld);
        }
    }
}