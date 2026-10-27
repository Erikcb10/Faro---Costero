// js/objects/ShipFleet.js
import { Object3D } from "../core/Object3D.js";
import { Mesh } from "./Mesh.js";
import { Material } from "../materials/Material.js";

import { HullGeometry } from "../geometries/HullGeometry.js";
import { BoxGeometry } from "../geometries/BoxGeometry.js";
import { CylinderGeometry } from "../geometries/CylinderGeometry.js";
import { SphereGeometry } from "../geometries/SphereGeometry.js";
import { ConeGeometry } from "../geometries/ConeGeometry.js";

export class ShipFleet {
    constructor(scene, sharedMaterials) {
        this.scene = scene;
        this.sharedMaterials = sharedMaterials;
        this.ships = [];

        // Geometrías reutilizables para optimizar memoria en la GPU
        this.geoms = {
            hull: new HullGeometry(5.6, 2.2, 1.3),
            waterline: new HullGeometry(5.68, 2.26, 0.35),
            deck: new BoxGeometry(1.75, 0.12, 4.2),
            cabin: new BoxGeometry(1.45, 0.85, 2.1),
            bridge: new BoxGeometry(1.30, 0.65, 1.15),
            winFront: new BoxGeometry(1.05, 0.28, 0.08),
            winSide: new BoxGeometry(0.08, 0.24, 0.32),
            chimney: new CylinderGeometry(0.22, 0.26, 1.1, 14),
            chimneyTop: new CylinderGeometry(0.23, 0.23, 0.25, 14),
            mast: new CylinderGeometry(0.04, 0.06, 2.6, 10),
            tallMast: new CylinderGeometry(0.04, 0.07, 4.8, 10),
            navLight: new SphereGeometry(0.09, 8, 8),
            container: new BoxGeometry(1.35, 0.75, 1.6),
            sailMain: new BoxGeometry(0.06, 3.4, 1.65),
            sailJib: new BoxGeometry(0.05, 2.5, 1.05)
        };

        this.initFleet();
    }

    createSteamerMesh(hullColor, chimneyColor, scale = 1.0) {
        const root = new Object3D();
        root.scale = { x: scale, y: scale, z: scale };

        const hullMat = new Material({ color: hullColor });
        const waterlineMat = new Material({ color: [0.75, 0.14, 0.12] });
        const deckMat = new Material({ color: [0.58, 0.38, 0.22] });
        const cabinMat = new Material({ color: [0.92, 0.93, 0.95] });
        const chimneyMat = new Material({ color: chimneyColor });
        const mastMat = new Material({ color: [0.82, 0.70, 0.35] });

        const hull = new Mesh(this.geoms.hull, hullMat);
        hull.position.y = 0.25;
        root.add(hull);

        const waterline = new Mesh(this.geoms.waterline, waterlineMat);
        waterline.position.y = -0.15;
        root.add(waterline);

        const deck = new Mesh(this.geoms.deck, deckMat);
        deck.position = { x: 0.0, y: 0.68, z: -0.2 };
        root.add(deck);

        const mainCabin = new Mesh(this.geoms.cabin, cabinMat);
        mainCabin.position = { x: 0.0, y: 1.15, z: -0.45 };
        root.add(mainCabin);

        const bridge = new Mesh(this.geoms.bridge, cabinMat);
        bridge.position = { x: 0.0, y: 1.85, z: -0.15 };
        root.add(bridge);

        const bridgeWinFront = new Mesh(this.geoms.winFront, this.sharedMaterials.windowMat);
        bridgeWinFront.position = { x: 0.0, y: 1.92, z: 0.41 };
        root.add(bridgeWinFront);

        for (let i = -1; i <= 1; i++) {
            const winRight = new Mesh(this.geoms.winSide, this.sharedMaterials.windowMat);
            winRight.position = { x: 0.71, y: 1.22, z: -0.45 + i * 0.55 };
            root.add(winRight);

            const winLeft = new Mesh(this.geoms.winSide, this.sharedMaterials.windowMat);
            winLeft.position = { x: -0.71, y: 1.22, z: -0.45 + i * 0.55 };
            root.add(winLeft);
        }

        const chimney = new Mesh(this.geoms.chimney, chimneyMat);
        chimney.position = { x: 0.0, y: 2.05, z: -1.05 };
        root.add(chimney);

        const chimneyTop = new Mesh(this.geoms.chimneyTop, this.sharedMaterials.darkMetalMat);
        chimneyTop.position = { x: 0.0, y: 2.50, z: -1.05 };
        root.add(chimneyTop);

        const mast = new Mesh(this.geoms.mast, mastMat);
        mast.position = { x: 0.0, y: 1.85, z: 1.15 };
        root.add(mast);

        const portLight = new Mesh(this.geoms.navLight, this.sharedMaterials.navRedMat);
        portLight.position = { x: -0.68, y: 1.95, z: 0.2 };
        root.add(portLight);

        const starboardLight = new Mesh(this.geoms.navLight, this.sharedMaterials.navGreenMat);
        starboardLight.position = { x: 0.68, y: 1.95, z: 0.2 };
        root.add(starboardLight);

        return root;
    }

    createCargoMesh(scale = 1.35) {
        const root = new Object3D();
        root.scale = { x: scale, y: scale, z: scale };

        const hullMat = new Material({ color: [0.48, 0.14, 0.12] });
        const waterlineMat = new Material({ color: [0.15, 0.18, 0.22] });
        const deckMat = new Material({ color: [0.32, 0.35, 0.38] });
        const cabinMat = new Material({ color: [0.90, 0.92, 0.94] });
        const containerBlue = new Material({ color: [0.15, 0.42, 0.75] });
        const containerOrange = new Material({ color: [0.85, 0.42, 0.12] });

        const hull = new Mesh(this.geoms.hull, hullMat);
        hull.position.y = 0.25;
        root.add(hull);

        const waterline = new Mesh(this.geoms.waterline, waterlineMat);
        waterline.position.y = -0.15;
        root.add(waterline);

        const deck = new Mesh(this.geoms.deck, deckMat);
        deck.position = { x: 0.0, y: 0.68, z: -0.1 };
        root.add(deck);

        // Puente de mando en la popa (-Z)
        const rearTower = new Mesh(this.geoms.bridge, cabinMat);
        rearTower.position = { x: 0.0, y: 1.35, z: -1.45 };
        root.add(rearTower);

        const rearBridge = new Mesh(this.geoms.bridge, cabinMat);
        rearBridge.position = { x: 0.0, y: 1.95, z: -1.40 };
        root.add(rearBridge);

        const winFront = new Mesh(this.geoms.winFront, this.sharedMaterials.windowMat);
        winFront.position = { x: 0.0, y: 2.02, z: -0.81 };
        root.add(winFront);

        // Contenedores de carga en cubierta
        const c1 = new Mesh(this.geoms.container, containerBlue);
        c1.position = { x: 0.0, y: 1.10, z: 0.15 };
        root.add(c1);

        const c2 = new Mesh(this.geoms.container, containerOrange);
        c2.position = { x: 0.0, y: 1.10, z: 1.45 };
        root.add(c2);

        const c3 = new Mesh(this.geoms.container, containerOrange);
        c3.position = { x: 0.0, y: 1.82, z: 0.15 };
        root.add(c3);

        const portLight = new Mesh(this.geoms.navLight, this.sharedMaterials.navRedMat);
        portLight.position = { x: -0.70, y: 2.05, z: -1.1 };
        root.add(portLight);

        const starboardLight = new Mesh(this.geoms.navLight, this.sharedMaterials.navGreenMat);
        starboardLight.position = { x: 0.70, y: 2.05, z: -1.1 };
        root.add(starboardLight);

        return root;
    }

    createSailboatMesh(hullColor, sailColor, scale = 0.85) {
        const root = new Object3D();
        root.scale = { x: scale, y: scale, z: scale };

        const hullMat = new Material({ color: hullColor });
        const deckMat = new Material({ color: [0.68, 0.48, 0.28] });
        const mastMat = new Material({ color: [0.88, 0.88, 0.90] });
        const sailMat = new Material({ color: sailColor });

        const hull = new Mesh(this.geoms.hull, hullMat);
        hull.position.y = 0.20;
        root.add(hull);

        const deck = new Mesh(this.geoms.deck, deckMat);
        deck.position = { x: 0.0, y: 0.62, z: -0.15 };
        root.add(deck);

        const mast = new Mesh(this.geoms.tallMast, mastMat);
        mast.position = { x: 0.0, y: 2.8, z: 0.2 };
        root.add(mast);

        // Vela Mayor y Foque
        const mainSail = new Mesh(this.geoms.sailMain, sailMat);
        mainSail.position = { x: 0.0, y: 2.75, z: -0.70 };
        mainSail.rotation.y = 0.12;
        root.add(mainSail);

        const jibSail = new Mesh(this.geoms.sailJib, sailMat);
        jibSail.position = { x: 0.0, y: 2.45, z: 1.05 };
        jibSail.rotation.x = -0.18;
        jibSail.rotation.y = -0.10;
        root.add(jibSail);

        const mastLight = new Mesh(this.geoms.navLight, this.sharedMaterials.windowMat);
        mastLight.position = { x: 0.0, y: 5.25, z: 0.2 };
        root.add(mastLight);

        return root;
    }

    initFleet() {
        const fleetSpecs = [
            // 1. Barco Principal Costero (Órbita cercana al faro)
            {
                mesh: this.createSteamerMesh([0.14, 0.22, 0.34], [0.82, 0.22, 0.15], 1.0),
                centerX: -6.0, centerZ: -2.0,
                orbitRx: 26.0, orbitRz: 22.0,
                angle: 0.4, angularSpeed: 0.20, dir: 1,
                speed: 4.5, radius: 3.4, bobPhase: 0.0
            },
            // 2. Barco Pesquero Verde (Sentido contrario en zona media)
            {
                mesh: this.createSteamerMesh([0.12, 0.34, 0.26], [0.85, 0.68, 0.18], 0.92),
                centerX: 10.0, centerZ: 12.0,
                orbitRx: 32.0, orbitRz: 28.0,
                angle: 2.5, angularSpeed: 0.17, dir: -1,
                speed: 4.1, radius: 3.1, bobPhase: 1.4
            },
            // 3. Buque Carguero Grande (Ruta amplia de mar abierto)
            {
                mesh: this.createCargoMesh(1.38),
                centerX: 16.0, centerZ: 18.0,
                orbitRx: 58.0, orbitRz: 48.0,
                angle: 1.1, angularSpeed: 0.11, dir: 1,
                speed: 3.6, radius: 4.8, bobPhase: 2.8
            },
            // 4. Velero Blanco (Cerca de la bahía y la playa)
            {
                mesh: this.createSailboatMesh([0.94, 0.95, 0.97], [0.98, 0.96, 0.90], 0.88),
                centerX: -22.0, centerZ: 16.0,
                orbitRx: 24.0, orbitRz: 20.0,
                angle: 4.2, angularSpeed: 0.22, dir: 1,
                speed: 3.9, radius: 2.8, bobPhase: 3.9
            },
            // 5. Velero Turquesa (Vela cálida naranja/crema)
            {
                mesh: this.createSailboatMesh([0.15, 0.52, 0.62], [0.96, 0.82, 0.58], 0.85),
                centerX: 28.0, centerZ: -18.0,
                orbitRx: 30.0, orbitRz: 25.0,
                angle: 5.1, angularSpeed: 0.19, dir: -1,
                speed: 3.8, radius: 2.8, bobPhase: 5.1
            }
        ];

        for (let i = 0; i < fleetSpecs.length; i++) {
            const spec = fleetSpecs[i];
            const startX = spec.centerX + spec.orbitRx * Math.cos(spec.angle);
            const startZ = spec.centerZ + spec.orbitRz * Math.sin(spec.angle);

            spec.mesh.position = { x: startX, y: 0.22, z: startZ };
            this.scene.add(spec.mesh);

            this.ships.push({
                ...spec,
                x: startX,
                z: startZ,
                vx: 0.0,
                vz: 0.0,
                pushX: 0.0,
                pushZ: 0.0,
                heading: 0.0,
                impactRoll: 0.0
            });
        }
    }

    update(deltaTime, timeSec, obstacles) {
        // 1. Movimiento hacia su ruta + Evasión y Colisión contra Obstáculos (Risco y Playa)
        for (let i = 0; i < this.ships.length; i++) {
            const s = this.ships[i];
            s.angle += s.angularSpeed * s.dir * deltaTime;

            const targetX = s.centerX + s.orbitRx * Math.cos(s.angle);
            const targetZ = s.centerZ + s.orbitRz * Math.sin(s.angle);

            const toX = targetX - s.x;
            const toZ = targetZ - s.z;
            const distToTarget = Math.hypot(toX, toZ) || 1.0;

            let desiredVx = (toX / distToTarget) * s.speed;
            let desiredVz = (toZ / distToTarget) * s.speed;

            // Verificar cada obstáculo estático (Risco del Faro y Playa Costera)
            for (let o = 0; o < obstacles.length; o++) {
                const obs = obstacles[o];
                const dx = s.x - obs.x;
                const dz = s.z - obs.z;
                const dist = Math.hypot(dx, dz) || 0.001;
                const minDist = obs.radius + s.radius;
                const avoidMargin = minDist + 6.5; // Margen de maniobra preventiva

                const nx = dx / dist;
                const nz = dz / dist;

                // Maniobra suave tangencial antes de chocar
                if (dist < avoidMargin && dist >= minDist) {
                    const factor = 1.0 - (dist - minDist) / 6.5;
                    const tangentX = -nz * s.dir;
                    const tangentZ =  nx * s.dir;
                    desiredVx += (nx * 1.5 + tangentX * 2.8) * factor;
                    desiredVz += (nz * 1.5 + tangentZ * 2.8) * factor;
                }

                // Choque físico directo: impide estrictamente atravesar el risco o la playa
                if (dist < minDist) {
                    const penetration = minDist - dist;
                    s.x = obs.x + nx * minDist;
                    s.z = obs.z + nz * minDist;

                    const dotVel = desiredVx * nx + desiredVz * nz;
                    if (dotVel < 0.0) {
                        desiredVx -= 1.8 * dotVel * nx;
                        desiredVz -= 1.8 * dotVel * nz;
                    }

                    // Deslizamiento tangencial + impulso de rebote
                    const tangentX = -nz * s.dir;
                    const tangentZ =  nx * s.dir;
                    s.pushX = nx * (penetration * 3.0 + 2.2) + tangentX * 2.0;
                    s.pushZ = nz * (penetration * 3.0 + 2.2) + tangentZ * 2.0;
                    s.impactRoll = 0.24;
                }
            }

            s.vx = desiredVx + s.pushX;
            s.vz = desiredVz + s.pushZ;
        }

        // 2. Colisión Elástica Barco contra Barco (Ship vs. Ship)
        for (let i = 0; i < this.ships.length; i++) {
            for (let j = i + 1; j < this.ships.length; j++) {
                const a = this.ships[i];
                const b = this.ships[j];

                const dx = b.x - a.x;
                const dz = b.z - a.z;
                const dist = Math.hypot(dx, dz) || 0.001;
                const minDist = a.radius + b.radius + 1.2;

                if (dist < minDist) {
                    const nx = dx / dist;
                    const nz = dz / dist;
                    const overlap = (minDist - dist) * 0.5;

                    // Separar ambos barcos equitativamente
                    a.x -= nx * overlap;
                    a.z -= nz * overlap;
                    b.x += nx * overlap;
                    b.z += nz * overlap;

                    // Impulso de rebote mutuo y escora por choque
                    a.pushX -= nx * 2.6;
                    a.pushZ -= nz * 2.6;
                    b.pushX += nx * 2.6;
                    b.pushZ += nz * 2.6;

                    a.impactRoll = 0.22;
                    b.impactRoll = 0.22;
                }
            }
        }

        // 3. Integrar posiciones, amortiguar rebotes y orientar proas suavemente
        for (let i = 0; i < this.ships.length; i++) {
            const s = this.ships[i];

            s.pushX *= Math.pow(0.14, deltaTime);
            s.pushZ *= Math.pow(0.14, deltaTime);
            s.impactRoll *= Math.pow(0.12, deltaTime);

            s.x += s.vx * deltaTime;
            s.z += s.vz * deltaTime;

            s.mesh.position.x = s.x;
            s.mesh.position.z = s.z;
            s.mesh.position.y = 0.22 + Math.sin(timeSec * 2.3 + s.bobPhase) * 0.14;

            if (Math.hypot(s.vx, s.vz) > 0.05) {
                const targetHeading = Math.atan2(s.vx, s.vz);
                // Interpolación angular suave para evitar giros bruscos
                let diff = targetHeading - s.heading;
                while (diff > Math.PI) diff -= Math.PI * 2.0;
                while (diff < -Math.PI) diff += Math.PI * 2.0;
                s.heading += diff * Math.min(1.0, deltaTime * 5.5);
            }

            s.mesh.rotation.y = s.heading;
            s.mesh.rotation.z = Math.sin(timeSec * 2.1 + s.bobPhase) * 0.05 + Math.sin(timeSec * 9.5) * s.impactRoll;
            s.mesh.rotation.x = Math.cos(timeSec * 1.7 + s.bobPhase) * 0.035;
        }
    }
}