// js/materials/Material.js
export class Material {
    constructor({
        color = [0.8, 0.8, 0.8],
        emissive = false,
        opacity = 1.0,
        transparent = false,
        isWater = false
    } = {}) {
        this.color = color;
        this.emissive = emissive;
        this.opacity = opacity;
        this.transparent = transparent;
        this.isWater = isWater;
    }
}