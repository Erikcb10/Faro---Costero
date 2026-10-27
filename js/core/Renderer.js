// js/core/Renderer.js
export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext("webgl2", { antialias: true });

        if (!this.gl) {
            throw new Error("WebGL 2.0 is not supported in this browser.");
        }

        const gl = this.gl;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        this.program = this.createProgram();
        this.locations = this.getLocations();

        this.spotlightPosition = [-12.0, 19.5, -8.0];
        this.spotlightDirection = [1.0, -0.15, 0.0];
        this.sunDirection = [0.6, 0.8, -0.5];
        this.isNight = true;
        this.clearColor = [0.02, 0.04, 0.09];
    }

    compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const err = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error("Shader Compilation Error:\n" + err);
        }
        return shader;
    }

    createProgram() {
        const gl = this.gl;

        const vsSource = `#version 300 es
        in vec3 aPosition;
        in vec3 aNormal;

        uniform mat4 uModelMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uProjectionMatrix;

        out vec3 vWorldPosition;
        out vec3 vNormal;

        void main() {
            vec4 worldPos = uModelMatrix * vec4(aPosition, 1.0);
            vWorldPosition = worldPos.xyz;
            // Transformación segura de normales
            mat3 normalMatrix = transpose(inverse(mat3(uModelMatrix)));
            vNormal = normalize(normalMatrix * aNormal);
            gl_Position = uProjectionMatrix * uViewMatrix * worldPos;
        }
        `;

        const fsSource = `#version 300 es
        precision highp float;

        in vec3 vWorldPosition;
        in vec3 vNormal;

        uniform vec3 uBaseColor;
        uniform float uOpacity;
        uniform bool uEmissive;
        uniform bool uIsWater;
        uniform bool uIsNight;

        uniform vec3 uCameraPos;
        uniform vec3 uSunDir;
        uniform vec3 uSpotlightPos;
        uniform vec3 uSpotlightDir;
        uniform vec3 uFogColor;

        out vec4 outColor;

        void main() {
            vec3 N = normalize(vNormal);
            vec3 V = normalize(uCameraPos - vWorldPosition);

            // Objetos emisivos (Foco, haz de luz, ventanas encendidas, sol/luna)
            if (uEmissive) {
                outColor = vec4(uBaseColor, uOpacity);
                return;
            }

            vec3 baseColor = uBaseColor;

            // Espuma en las crestas de las olas del agua
            if (uIsWater && vWorldPosition.y > 0.22) {
                float foam = clamp((vWorldPosition.y - 0.22) * 2.2, 0.0, 0.65);
                vec3 foamColor = uIsNight ? vec3(0.45, 0.60, 0.78) : vec3(0.88, 0.96, 1.0);
                baseColor = mix(baseColor, foamColor, foam);
            }

            // 1. Iluminación Direccional (Sol en el Día / Luna en la Noche)
            vec3 L_dir = normalize(uSunDir);
            float diffDir = max(dot(N, L_dir), 0.0);
            vec3 H_dir = normalize(L_dir + V);
            float shininess = uIsWater ? 96.0 : 28.0;
            float specDir = pow(max(dot(N, H_dir), 0.0), shininess);

            vec3 ambient;
            vec3 dirLightColor;
            float specStrength;

            if (uIsNight) {
                ambient = baseColor * vec3(0.16, 0.22, 0.34);
                dirLightColor = vec3(0.38, 0.50, 0.75) * 0.65;
                specStrength = uIsWater ? 0.55 : 0.12;
            } else {
                ambient = baseColor * vec3(0.48, 0.52, 0.58);
                dirLightColor = vec3(1.0, 0.96, 0.88) * 0.95;
                specStrength = uIsWater ? 0.85 : 0.20;
            }

            vec3 lit = ambient + (baseColor * dirLightColor * diffDir) + (dirLightColor * specDir * specStrength);

            // 2. Luz del Foco del Faro (Activa en la Noche)
            if (uIsNight) {
                vec3 toFrag = vWorldPosition - uSpotlightPos;
                float dist = length(toFrag);
                vec3 lightToFrag = toFrag / max(dist, 0.0001);
                vec3 spotDir = normalize(uSpotlightDir);

                // Doble haz opuesto (frente y espalda del rotor)
                float spotAngleCos = abs(dot(lightToFrag, spotDir));
                float innerCutoff = 0.975;
                float outerCutoff = 0.915;

                float spotIntensity = clamp((spotAngleCos - outerCutoff) / (innerCutoff - outerCutoff), 0.0, 1.0);
                float attenuation = 1.0 / (1.0 + 0.008 * dist + 0.00025 * dist * dist);

                vec3 L_spot = -lightToFrag;
                float diffSpot = max(dot(N, L_spot), 0.0);
                vec3 H_spot = normalize(L_spot + V);
                float specSpot = pow(max(dot(N, H_spot), 0.0), uIsWater ? 64.0 : 24.0);

                vec3 spotColor = vec3(1.0, 0.93, 0.65);
                lit += (baseColor * spotColor * diffSpot + spotColor * specSpot * (uIsWater ? 1.2 : 0.3)) * spotIntensity * attenuation * 3.2;
            }

            // 3. Niebla de horizonte + Fusión circular de los bordes del océano
            float camDist = length(uCameraPos - vWorldPosition);
            float radialDist = length(vWorldPosition.xz);

            // Desvanece suavemente el borde circular del mar (a partir de radio 190 hasta 255)
            float edgeHorizonFade = 1.0 - smoothstep(190.0, 255.0, radialDist);
            float distFog = clamp(exp(-pow(camDist * 0.0028, 2.0)), 0.0, 1.0);
            float finalFog = distFog * edgeHorizonFade;

            lit = mix(uFogColor, lit, finalFog);

            outColor = vec4(lit, uOpacity);
        }
        `;

        const vs = this.compileShader(gl.VERTEX_SHADER, vsSource);
        const fs = this.compileShader(gl.FRAGMENT_SHADER, fsSource);

        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error(gl.getProgramInfoLog(program));
        }
        return program;
    }

    getLocations() {
        const gl = this.gl;
        const p = this.program;
        return {
            position: gl.getAttribLocation(p, "aPosition"),
            normal: gl.getAttribLocation(p, "aNormal"),
            model: gl.getUniformLocation(p, "uModelMatrix"),
            view: gl.getUniformLocation(p, "uViewMatrix"),
            projection: gl.getUniformLocation(p, "uProjectionMatrix"),
            baseColor: gl.getUniformLocation(p, "uBaseColor"),
            opacity: gl.getUniformLocation(p, "uOpacity"),
            emissive: gl.getUniformLocation(p, "uEmissive"),
            isWater: gl.getUniformLocation(p, "uIsWater"),
            isNight: gl.getUniformLocation(p, "uIsNight"),
            cameraPos: gl.getUniformLocation(p, "uCameraPos"),
            sunDir: gl.getUniformLocation(p, "uSunDir"),
            spotlightPos: gl.getUniformLocation(p, "uSpotlightPos"),
            spotlightDir: gl.getUniformLocation(p, "uSpotlightDir"),
            fogColor: gl.getUniformLocation(p, "uFogColor")
        };
    }

    initGeometry(geometry) {
        if (geometry.initialized) return;

        const gl = this.gl;
        const loc = this.locations;

        geometry.vao = gl.createVertexArray();
        gl.bindVertexArray(geometry.vao);

        geometry.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, geometry.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.vertices, gl.DYNAMIC_DRAW);

        geometry.ebo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);

        const stride = 6 * Float32Array.BYTES_PER_ELEMENT;

        if (loc.position !== -1) {
            gl.enableVertexAttribArray(loc.position);
            gl.vertexAttribPointer(loc.position, 3, gl.FLOAT, false, stride, 0);
        }

        if (loc.normal !== -1) {
            gl.enableVertexAttribArray(loc.normal);
            gl.vertexAttribPointer(loc.normal, 3, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);
        }

        gl.bindVertexArray(null);
        geometry.initialized = true;
    }

    render(scene, camera) {
        const gl = this.gl;

        gl.clearColor(this.clearColor[0], this.clearColor[1], this.clearColor[2], 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        camera.updateViewMatrix();
        scene.updateMatrixWorld();

        gl.useProgram(this.program);
        gl.uniformMatrix4fv(this.locations.view, false, camera.viewMatrix);
        gl.uniformMatrix4fv(this.locations.projection, false, camera.projectionMatrix);

        gl.uniform3f(this.locations.cameraPos, camera.position.x, camera.position.y, camera.position.z);
        gl.uniform3fv(this.locations.sunDir, new Float32Array(this.sunDirection));
        gl.uniform3fv(this.locations.spotlightPos, new Float32Array(this.spotlightPosition));
        gl.uniform3fv(this.locations.spotlightDir, new Float32Array(this.spotlightDirection));
        gl.uniform3fv(this.locations.fogColor, new Float32Array(this.clearColor));
        gl.uniform1i(this.locations.isNight, this.isNight ? 1 : 0);

        const opaqueList = [];
        const transparentList = [];

        const collect = (node) => {
            if (!node.visible) return;
            if (node.geometry && node.material) {
                if (node.material.transparent || node.material.opacity < 1.0) {
                    transparentList.push(node);
                } else {
                    opaqueList.push(node);
                }
            }
            for (let i = 0; i < node.children.length; i++) {
                collect(node.children[i]);
            }
        };

        collect(scene);

        // 1. Primero todos los objetos opacos
        gl.depthMask(true);
        gl.disable(gl.BLEND);
        for (let i = 0; i < opaqueList.length; i++) {
            this.drawMesh(opaqueList[i]);
        }

        // 2. Después los objetos transparentes (cristal y haz de luz)
        gl.depthMask(false);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        for (let i = 0; i < transparentList.length; i++) {
            this.drawMesh(transparentList[i]);
        }
        gl.depthMask(true);
    }

    drawMesh(mesh) {
        const gl = this.gl;
        const geom = mesh.geometry;
        const mat = mesh.material;

        this.initGeometry(geom);
        gl.bindVertexArray(geom.vao);

        gl.uniformMatrix4fv(this.locations.model, false, mesh.matrixWorld);
        gl.uniform3fv(this.locations.baseColor, new Float32Array(mat.color));
        gl.uniform1f(this.locations.opacity, mat.opacity);
        gl.uniform1i(this.locations.emissive, mat.emissive ? 1 : 0);
        gl.uniform1i(this.locations.isWater, mat.isWater ? 1 : 0);

        gl.drawElements(gl.TRIANGLES, geom.indexCount, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    }
}