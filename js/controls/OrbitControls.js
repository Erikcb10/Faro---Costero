// js/controls/OrbitControls.js
export class OrbitControls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;

        this.distance = 45.0;
        this.azimuth = 0.68;
        this.elevation = 0.36;

        this.minDistance = 8.0;
        this.maxDistance = 190.0; // Ampliado para abarcar el mar extenso y el paisaje
        this.mouseSensitivity = 0.007;
        this.zoomSensitivity = 0.003;

        this.isDragging = false;
        this.previousMouseX = 0;
        this.previousMouseY = 0;

        this.initEvents();
        this.updateCamera();
    }

    clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    updateCamera() {
        const cosEl = Math.cos(this.elevation);
        this.camera.position.x = this.camera.target.x + this.distance * cosEl * Math.sin(this.azimuth);
        this.camera.position.y = this.camera.target.y + this.distance * Math.sin(this.elevation);
        this.camera.position.z = this.camera.target.z + this.distance * cosEl * Math.cos(this.azimuth);
        this.camera.updateViewMatrix();
    }

    reset() {
        this.distance = 45.0;
        this.azimuth = 0.68;
        this.elevation = 0.36;
        this.camera.target = { x: -8.0, y: 7.5, z: -5.0 };
        this.updateCamera();
    }

    initEvents() {
        this.domElement.addEventListener("mousedown", (e) => {
            this.isDragging = true;
            this.previousMouseX = e.clientX;
            this.previousMouseY = e.clientY;
        });

        window.addEventListener("mouseup", () => {
            this.isDragging = false;
        });

        window.addEventListener("mousemove", (e) => {
            if (!this.isDragging) return;

            const dx = e.clientX - this.previousMouseX;
            const dy = e.clientY - this.previousMouseY;
            this.previousMouseX = e.clientX;
            this.previousMouseY = e.clientY;

            this.azimuth -= dx * this.mouseSensitivity;
            this.elevation += dy * this.mouseSensitivity;

            const limit = Math.PI / 2.0 - 0.05;
            this.elevation = this.clamp(this.elevation, 0.04, limit);
            this.updateCamera();
        });

        this.domElement.addEventListener("wheel", (e) => {
            e.preventDefault();
            this.distance += e.deltaY * this.zoomSensitivity * (this.distance * 0.12);
            this.distance = this.clamp(this.distance, this.minDistance, this.maxDistance);
            this.updateCamera();
        }, { passive: false });

        window.addEventListener("keydown", (e) => {
            const step = 0.05;
            switch (e.key) {
                case "ArrowLeft":  this.azimuth += step; break;
                case "ArrowRight": this.azimuth -= step; break;
                case "ArrowUp":    this.elevation += step; break;
                case "ArrowDown":  this.elevation -= step; break;
                case "r":
                case "R":
                    this.reset();
                    break;
            }
            const limit = Math.PI / 2.0 - 0.05;
            this.elevation = this.clamp(this.elevation, 0.04, limit);
            this.updateCamera();
        });
    }
}