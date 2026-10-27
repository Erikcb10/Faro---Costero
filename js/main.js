// js/main.js
import { Renderer } from "./core/Renderer.js";
import { Scene } from "./core/Scene.js";
import { Object3D } from "./core/Object3D.js";
import { Mesh } from "./objects/Mesh.js";
import { Material } from "./materials/Material.js";
import { PerspectiveCamera } from "./cameras/PerspectiveCamera.js";
import { OrbitControls } from "./controls/OrbitControls.js";

import { CylinderGeometry } from "./geometries/CylinderGeometry.js";
import { ConeGeometry } from "./geometries/ConeGeometry.js";
import { BoxGeometry } from "./geometries/BoxGeometry.js";
import { PlaneGridGeometry } from "./geometries/PlaneGridGeometry.js";
import { CliffGeometry } from "./geometries/CliffGeometry.js";
import { RockSpikesGeometry } from "./geometries/RockSpikesGeometry.js";
import { DomeGeometry } from "./geometries/DomeGeometry.js";
import { SphereGeometry } from "./geometries/SphereGeometry.js";
import { SpotlightConeGeometry } from "./geometries/SpotlightConeGeometry.js";
import { MountainGeometry } from "./geometries/MountainGeometry.js";
import { SeagullGeometry } from "./geometries/SeagullGeometry.js";
import { ShipFleet } from "./objects/ShipFleet.js";

// ==================== 1. INICIALIZACIÓN Y CÁMARA ====================
const canvas = document.getElementById("glCanvas");
const renderer = new Renderer(canvas);
const scene = new Scene();

const camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.5, 800.0);
camera.target = { x: -8.0, y: 8.5, z: -5.0 };

const controls = new OrbitControls(camera, canvas);
controls.distance = 48.0;
controls.azimuth = 0.68;
controls.elevation = 0.36;
controls.maxDistance = 190.0;
controls.updateCamera();

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (renderer.gl) {
        renderer.gl.viewport(0, 0, canvas.width, canvas.height);
    }
    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();
    controls.updateCamera();
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ==================== 2. TODOS LOS MATERIALES ====================
const oceanMat        = new Material({ color: [0.03, 0.14, 0.28], isWater: true });
const cliffMat        = new Material({ color: [0.24, 0.26, 0.29] });
const rockSpikesMat   = new Material({ color: [0.16, 0.18, 0.21] });

// Faro Costero
const graniteBaseMat  = new Material({ color: [0.46, 0.48, 0.50] });
const whiteStripeMat  = new Material({ color: [0.95, 0.95, 0.93] });
const redStripeMat    = new Material({ color: [0.80, 0.14, 0.12] });
const darkMetalMat    = new Material({ color: [0.13, 0.15, 0.18] });
const copperDomeMat   = new Material({ color: [0.74, 0.12, 0.10] });
const lanternGlassMat = new Material({ color: [0.82, 0.94, 1.0], opacity: 0.34, transparent: true });
const bulbMat         = new Material({ color: [1.0, 0.97, 0.75], emissive: true });
const beamMat         = new Material({ color: [1.0, 0.95, 0.68], emissive: true, opacity: 0.32, transparent: true });
const windowMat       = new Material({ color: [1.0, 0.85, 0.42], emissive: true });

const navRedMat       = new Material({ color: [1.0, 0.15, 0.15], emissive: true });
const navGreenMat     = new Material({ color: [0.15, 1.0, 0.30], emissive: true });

// Paisaje
const sandMat         = new Material({ color: [0.86, 0.78, 0.58] });
const wetSandMat      = new Material({ color: [0.65, 0.57, 0.42] });
const grassCoastMat   = new Material({ color: [0.22, 0.42, 0.20] });
const mountainMat     = new Material({ color: [0.30, 0.33, 0.38] });
const mountainFarMat  = new Material({ color: [0.24, 0.28, 0.35] });
const snowCapMat      = new Material({ color: [0.92, 0.95, 0.98] });
const trunkMat        = new Material({ color: [0.38, 0.25, 0.15] });
const pineLeavesMat   = new Material({ color: [0.14, 0.34, 0.16] });
const seagullBodyMat  = new Material({ color: [0.95, 0.96, 0.98] });

const celestialMat    = new Material({ color: [1.0, 0.95, 0.75], emissive: true });

// ==================== 3. OCÉANO Y RISCO ====================
const oceanGeom = new PlaneGridGeometry(520.0, 520.0, 140, 140);
const oceanMesh = new Mesh(oceanGeom, oceanMat);
scene.add(oceanMesh);

const cliffX = -12.0;
const cliffZ = -8.0;
const cliffHeight = 8.0;
const cliffCollisionRadius = 15.2;

const cliffGeom = new CliffGeometry(21.0, 9.2, cliffHeight, 19.0);
const cliffMesh = new Mesh(cliffGeom, cliffMat);
cliffMesh.position = { x: cliffX, y: 0.0, z: cliffZ };
scene.add(cliffMesh);

const rockSpikesGeom = new RockSpikesGeometry(11.2, 24, 1.0, 3.2, 0.7, 1.5);
const rockSpikesMesh = new Mesh(rockSpikesGeom, rockSpikesMat);
rockSpikesMesh.position = { x: cliffX, y: 0.0, z: cliffZ };
scene.add(rockSpikesMesh);

// ==================== 4. FARO COSTERO ====================
const lighthouseRoot = new Object3D();
lighthouseRoot.position = { x: cliffX, y: cliffHeight - 0.1, z: cliffZ };
scene.add(lighthouseRoot);

const baseFoundation = new Mesh(new CylinderGeometry(2.6, 2.9, 1.6, 24), graniteBaseMat);
baseFoundation.position.y = 0.8;
lighthouseRoot.add(baseFoundation);

const baseLip = new Mesh(new CylinderGeometry(2.45, 2.65, 0.35, 28), graniteBaseMat);
baseLip.position.y = 1.75;
lighthouseRoot.add(baseLip);

const numStripes = 6;
const stripeH = 1.65;
const rBotTower = 2.35;
const rTopTower = 1.50;
let curY = 1.90;

for (let i = 0; i < numStripes; i++) {
    const t0 = i / numStripes;
    const t1 = (i + 1) / numStripes;
    const rB = rBotTower + t0 * (rTopTower - rBotTower);
    const rT = rBotTower + t1 * (rTopTower - rBotTower);
    const stripeMat = (i % 2 === 0) ? whiteStripeMat : redStripeMat;

    const section = new Mesh(new CylinderGeometry(rT, rB, stripeH, 32), stripeMat);
    section.position.y = curY + stripeH * 0.5;
    lighthouseRoot.add(section);

    if (i === 1 || i === 3 || i === 4) {
        const midR = (rB + rT) * 0.5;
        const ang = i * 1.05;
        const winFrame = new Mesh(new BoxGeometry(0.38, 0.58, 0.18), darkMetalMat);
        winFrame.position = {
            x: Math.sin(ang) * midR,
            y: curY + stripeH * 0.5,
            z: Math.cos(ang) * midR
        };
        winFrame.rotation.y = ang;
        lighthouseRoot.add(winFrame);

        const winPane = new Mesh(new BoxGeometry(0.25, 0.44, 0.22), windowMat);
        winPane.position = { ...winFrame.position };
        winPane.rotation.y = ang;
        lighthouseRoot.add(winPane);
    }

    curY += stripeH;
}

const corbelRing = new Mesh(new CylinderGeometry(1.92, 1.50, 0.55, 32), whiteStripeMat);
corbelRing.position.y = curY + 0.275;
lighthouseRoot.add(corbelRing);

const numCorbels = 16;
for (let i = 0; i < numCorbels; i++) {
    const angle = (i / numCorbels) * Math.PI * 2.0;
    const corbel = new Mesh(new BoxGeometry(0.14, 0.48, 0.35), graniteBaseMat);
    corbel.position = {
        x: Math.sin(angle) * 1.68,
        y: curY + 0.26,
        z: Math.cos(angle) * 1.68
    };
    corbel.rotation.y = angle;
    lighthouseRoot.add(corbel);
}
curY += 0.55;

const mainGalleryFloor = new Mesh(new CylinderGeometry(2.15, 2.15, 0.28, 32), graniteBaseMat);
mainGalleryFloor.position.y = curY + 0.14;
lighthouseRoot.add(mainGalleryFloor);
curY += 0.28;

const numRailingPosts = 24;
const railRadius = 2.04;
for (let i = 0; i < numRailingPosts; i++) {
    const angle = (i / numRailingPosts) * Math.PI * 2.0;
    const post = new Mesh(new CylinderGeometry(0.035, 0.035, 0.72, 8), darkMetalMat);
    post.position = {
        x: Math.sin(angle) * railRadius,
        y: curY + 0.36,
        z: Math.cos(angle) * railRadius
    };
    lighthouseRoot.add(post);
}
const topRail = new Mesh(new CylinderGeometry(railRadius + 0.03, railRadius - 0.03, 0.07, 32), darkMetalMat);
topRail.position.y = curY + 0.72;
lighthouseRoot.add(topRail);

const watchRoom = new Mesh(new CylinderGeometry(1.40, 1.46, 0.95, 28), redStripeMat);
watchRoom.position.y = curY + 0.475;
lighthouseRoot.add(watchRoom);
curY += 0.95;

const upperGallery = new Mesh(new CylinderGeometry(1.65, 1.58, 0.18, 28), darkMetalMat);
upperGallery.position.y = curY + 0.09;
lighthouseRoot.add(upperGallery);
curY += 0.18;

const lanternH = 1.75;
const lanternR = 1.28;
const lanternCenterY = curY + lanternH * 0.5;

for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2.0;
    const mullion = new Mesh(new CylinderGeometry(0.038, 0.038, lanternH, 8), darkMetalMat);
    mullion.position = {
        x: Math.sin(angle) * lanternR,
        y: lanternCenterY,
        z: Math.cos(angle) * lanternR
    };
    lighthouseRoot.add(mullion);
}

const lensPedestal = new Mesh(new CylinderGeometry(0.48, 0.62, 0.45, 16), darkMetalMat);
lensPedestal.position.y = curY + 0.225;
lighthouseRoot.add(lensPedestal);

const bulbMesh = new Mesh(new SphereGeometry(0.60, 14, 18), bulbMat);
bulbMesh.position.y = lanternCenterY + 0.05;
lighthouseRoot.add(bulbMesh);

const beaconPivot = new Object3D();
beaconPivot.position.y = lanternCenterY + 0.05;
lighthouseRoot.add(beaconPivot);

const lightBeamGeom = new SpotlightConeGeometry(0.42, 8.2, 48.0, 32);
const lightBeam1 = new Mesh(lightBeamGeom, beamMat);
lightBeam1.rotation.x = -0.15;
beaconPivot.add(lightBeam1);

const lightBeam2 = new Mesh(lightBeamGeom, beamMat);
lightBeam2.rotation.y = Math.PI;
lightBeam2.rotation.x = 0.15;
beaconPivot.add(lightBeam2);

const lanternGlass = new Mesh(new CylinderGeometry(lanternR - 0.03, lanternR - 0.03, lanternH, 28), lanternGlassMat);
lanternGlass.position.y = lanternCenterY;
lighthouseRoot.add(lanternGlass);
curY += lanternH;

const domeRim = new Mesh(new CylinderGeometry(1.44, 1.36, 0.18, 28), darkMetalMat);
domeRim.position.y = curY + 0.09;
lighthouseRoot.add(domeRim);

const lanternDome = new Mesh(new DomeGeometry(1.34, 8, 28), copperDomeMat);
lanternDome.position.y = curY + 0.14;
lighthouseRoot.add(lanternDome);

const ventBall = new Mesh(new SphereGeometry(0.24, 12, 14), copperDomeMat);
ventBall.position.y = curY + 1.50;
lighthouseRoot.add(ventBall);

const lightningRod = new Mesh(new CylinderGeometry(0.015, 0.045, 0.85, 8), darkMetalMat);
lightningRod.position.y = curY + 1.95;
lighthouseRoot.add(lightningRod);

// ==================== 5. FLOTA DE BARCOS ====================
const fleet = new ShipFleet(scene, {
    windowMat,
    darkMetalMat,
    navRedMat,
    navGreenMat
});

// ==================== 6. PAISAJE COSTERO ====================
const coastGroup = new Object3D();
const coastCenterX = -68.0;
const coastCenterZ = -62.0;
const coastCollisionRadius = 47.5;
coastGroup.position = { x: coastCenterX, y: 0.0, z: coastCenterZ };
scene.add(coastGroup);

const worldObstacles = [
    { x: cliffX,       z: cliffZ,       radius: cliffCollisionRadius },
    { x: coastCenterX, z: coastCenterZ, radius: coastCollisionRadius }
];

const wetShore = new Mesh(new CylinderGeometry(42.0, 48.0, 0.9, 36), wetSandMat);
wetShore.position = { x: 4.0, y: -0.1, z: 4.0 };
coastGroup.add(wetShore);

const mainBeach = new Mesh(new CylinderGeometry(34.0, 43.0, 1.8, 36), sandMat);
mainBeach.position = { x: 2.0, y: 0.55, z: 2.0 };
coastGroup.add(mainBeach);

const dune1 = new Mesh(new MountainGeometry(28.0, 24.0, 4.2, 18, 1.5), sandMat);
dune1.position = { x: -4.0, y: 0.8, z: -2.0 };
coastGroup.add(dune1);

const greenHill = new Mesh(new MountainGeometry(30.0, 26.0, 7.5, 18, 2.7), grassCoastMat);
greenHill.position = { x: -8.0, y: 1.2, z: -6.0 };
coastGroup.add(greenHill);

const mountainSpecs = [
    { x: -16.0, z: -14.0, rx: 24.0, rz: 20.0, h: 32.0, seed: 3.1, snow: true },
    { x:   8.0, z: -20.0, rx: 20.0, rz: 18.0, h: 25.0, seed: 5.4, snow: true },
    { x: -34.0, z:   4.0, rx: 21.0, rz: 19.0, h: 22.0, seed: 7.8, snow: false },
    { x: -42.0, z: -28.0, rx: 32.0, rz: 28.0, h: 42.0, seed: 9.2, snow: true },
    { x:  26.0, z: -36.0, rx: 28.0, rz: 24.0, h: 36.0, seed: 11.6, snow: true }
];

for (let i = 0; i < mountainSpecs.length; i++) {
    const m = mountainSpecs[i];
    const mMat = (i >= 3) ? mountainFarMat : mountainMat;
    const mMesh = new Mesh(new MountainGeometry(m.rx, m.rz, m.h, 16, m.seed), mMat);
    mMesh.position = { x: m.x, y: 0.0, z: m.z };
    coastGroup.add(mMesh);

    if (m.snow) {
        const snowH = m.h * 0.34;
        const snowMesh = new Mesh(
            new MountainGeometry(m.rx * 0.36, m.rz * 0.36, snowH, 16, m.seed),
            snowCapMat
        );
        snowMesh.position = { x: m.x, y: m.h * 0.67, z: m.z };
        coastGroup.add(snowMesh);
    }
}

const treeCoords = [
    [6, 12], [12, 6], [-2, 15], [16, -2], [-14, 14],
    [-20, 8], [2, 8], [10, 14], [-8, 18], [18, 8],
    [-16, 18], [4, 18]
];
const trunkGeom = new CylinderGeometry(0.18, 0.28, 1.6, 8);
const foliageGeom1 = new CylinderGeometry(0.05, 1.35, 2.8, 10);
const foliageGeom2 = new CylinderGeometry(0.04, 1.05, 2.4, 10);

for (let i = 0; i < treeCoords.length; i++) {
    const [tx, tz] = treeCoords[i];
    const tree = new Object3D();
    tree.position = { x: tx, y: 1.5, z: tz };
    const s = 0.85 + (i % 3) * 0.2;
    tree.scale = { x: s, y: s, z: s };

    const trunk = new Mesh(trunkGeom, trunkMat);
    trunk.position.y = 0.8;
    tree.add(trunk);

    const leaves1 = new Mesh(foliageGeom1, pineLeavesMat);
    leaves1.position.y = 2.4;
    tree.add(leaves1);

    const leaves2 = new Mesh(foliageGeom2, pineLeavesMat);
    leaves2.position.y = 3.8;
    tree.add(leaves2);

    coastGroup.add(tree);
}

const seagulls = [];
const rightWingGeom = new SeagullGeometry(0.95, 0.30, 1);
const leftWingGeom  = new SeagullGeometry(0.95, 0.30, -1);
const birdBodyGeom  = new BoxGeometry(0.16, 0.12, 0.52);

const numSeagulls = 14;
for (let i = 0; i < numSeagulls; i++) {
    const birdRoot = new Object3D();

    const body = new Mesh(birdBodyGeom, seagullBodyMat);
    birdRoot.add(body);

    const rightWingPivot = new Object3D();
    rightWingPivot.position.x = 0.06;
    const rWing = new Mesh(rightWingGeom, seagullBodyMat);
    rightWingPivot.add(rWing);
    birdRoot.add(rightWingPivot);

    const leftWingPivot = new Object3D();
    leftWingPivot.position.x = -0.06;
    const lWing = new Mesh(leftWingGeom, seagullBodyMat);
    leftWingPivot.add(lWing);
    birdRoot.add(leftWingPivot);

    scene.add(birdRoot);

    const nearLighthouse = i < 8;
    seagulls.push({
        root: birdRoot,
        rightWing: rightWingPivot,
        leftWing: leftWingPivot,
        centerX: nearLighthouse ? cliffX - 2.0 : coastCenterX + 22.0,
        centerZ: nearLighthouse ? cliffZ + 2.0 : coastCenterZ + 24.0,
        radiusX: (nearLighthouse ? 12.0 : 22.0) + (i % 5) * 3.8,
        radiusZ: (nearLighthouse ? 10.0 : 18.0) + (i % 4) * 3.5,
        baseHeight: (nearLighthouse ? 18.0 : 15.0) + (i % 6) * 2.2,
        speed: 0.32 + (i % 4) * 0.06,
        angle: (i / numSeagulls) * Math.PI * 2.0,
        flapSpeed: 6.5 + (i % 3) * 1.4,
        flapPhase: i * 1.3
    });
}

// ==================== 7. ASTRO Y CICLO DÍA / NOCHE AUTOMÁTICO ====================
const celestialMesh = new Mesh(new SphereGeometry(3.2, 12, 16), celestialMat);
scene.add(celestialMesh);

// Control del ciclo (0.0 a 1.0 por día completo). Arranca en la noche (0.75)
let timeOfDay = 0.75; 
let cycleSpeed = 0.015; // Velocidad del ciclo (puedes ajustarla)
let autoCycle = true;   // Activa el ciclo automático progresivo

function lerpColor(c1, c2, t) {
    return [
        c1[0] + (c2[0] - c1[0]) * t,
        c1[1] + (c2[1] - c1[1]) * t,
        c1[2] + (c2[2] - c1[2]) * t
    ];
}

function updateDayNightCycle(dt) {
    if (autoCycle) {
        timeOfDay = (timeOfDay + cycleSpeed * dt) % 1.0;
    }

    const btn = document.getElementById("dayNightBtn");

    // Definición de colores clave para la interpolación fluida
    // 0.0: Amanecer | 0.25: Mediodía | 0.5: Atardecer | 0.75: Noche
    let skyColor, oceanColor, cliffColor, sandColor, snowColor, beamOpac, isNightState;

    if (timeOfDay >= 0.0 && timeOfDay < 0.22) {
        // Amanecer / Dawn
        const t = timeOfDay / 0.22;
        skyColor   = lerpColor([0.08, 0.12, 0.25], [0.85, 0.52, 0.32], t);
        oceanColor = lerpColor([0.03, 0.10, 0.22], [0.08, 0.32, 0.52], t);
        cliffColor = lerpColor([0.18, 0.20, 0.24], [0.35, 0.37, 0.40], t);
        sandColor  = lerpColor([0.24, 0.22, 0.20], [0.82, 0.72, 0.52], t);
        snowColor  = lerpColor([0.45, 0.52, 0.64], [0.90, 0.94, 0.98], t);
        beamOpac   = 0.30 * (1.0 - t * 0.5);
        isNightState = true;
        if (btn) btn.textContent = "🌅 Amanecer";
    } else if (timeOfDay >= 0.22 && timeOfDay < 0.52) {
        // Día / Midday
        const t = (timeOfDay - 0.22) / 0.30;
        skyColor   = lerpColor([0.85, 0.52, 0.32], [0.48, 0.76, 0.96], Math.min(1.0, t * 1.5));
        oceanColor = [0.08, 0.42, 0.68];
        cliffColor = [0.48, 0.46, 0.42];
        sandColor  = [0.88, 0.80, 0.60];
        snowColor  = [0.95, 0.97, 1.00];
        beamOpac   = 0.12; // Tenue de día
        isNightState = false;
        if (btn) btn.textContent = "☀️ Día";
    } else if (timeOfDay >= 0.52 && timeOfDay < 0.72) {
        // Atardecer / Sunset
        const t = (timeOfDay - 0.52) / 0.20;
        skyColor   = lerpColor([0.48, 0.76, 0.96], [0.78, 0.28, 0.15], t);
        oceanColor = lerpColor([0.08, 0.42, 0.68], [0.12, 0.18, 0.34], t);
        cliffColor = lerpColor([0.48, 0.46, 0.42], [0.25, 0.22, 0.26], t);
        sandColor  = lerpColor([0.88, 0.80, 0.60], [0.55, 0.42, 0.35], t);
        snowColor  = lerpColor([0.95, 0.97, 1.00], [0.82, 0.55, 0.50], t);
        beamOpac   = 0.12 + t * 0.22; // Se va intensificando al caer la noche
        isNightState = true;
        if (btn) btn.textContent = "🌇 Atardecer";
    } else {
        // Noche / Night
        const t = (timeOfDay - 0.72) / 0.28;
        skyColor   = lerpColor([0.78, 0.28, 0.15], [0.02, 0.04, 0.09], t);
        oceanColor = [0.03, 0.13, 0.26];
        cliffColor = [0.22, 0.24, 0.28];
        sandColor  = [0.28, 0.26, 0.22];
        snowColor  = [0.55, 0.62, 0.74];
        beamOpac   = 0.34;
        isNightState = true;
        if (btn) btn.textContent = "🌙 Noche";
    }

    renderer.isNight = isNightState;
    renderer.clearColor = skyColor;
    oceanMat.color = oceanColor;
    cliffMat.color = cliffColor;
    sandMat.color = sandColor;
    snowCapMat.color = snowColor;

    bulbMat.emissive = isNightState || timeOfDay < 0.25 || timeOfDay > 0.50;
    lightBeam1.visible = true;
    lightBeam2.visible = true;
    beamMat.opacity = beamOpac;

    windowMat.emissive = isNightState;
    navRedMat.emissive = isNightState;
    navGreenMat.emissive = isNightState;

    // Posición orbital de la esfera celeste (Sol / Luna)
    const sunAngle = timeOfDay * Math.PI * 2.0 - Math.PI * 0.5;
    const sx = Math.cos(sunAngle) * 85.0;
    const sy = Math.sin(sunAngle) * 65.0;
    const sz = -50.0;
    celestialMesh.position = { x: sx, y: sy, z: sz };
    renderer.sunDirection = [sx, sy, sz];

    celestialMat.color = isNightState ? [0.90, 0.94, 1.0] : [1.0, 0.94, 0.60];
}

// Control manual por botón o tecla N para alternar fases o pausar ciclo automático
const btn = document.getElementById("dayNightBtn");
if (btn) {
    btn.addEventListener("click", () => {
        autoCycle = false;
        timeOfDay = (timeOfDay + 0.25) % 1.0; // Salta a la siguiente estación del ciclo
        updateDayNightCycle(0.0);
    });
}
window.addEventListener("keydown", (e) => {
    if (e.key === "n" || e.key === "N") {
        autoCycle = false;
        timeOfDay = (timeOfDay + 0.25) % 1.0;
        updateDayNightCycle(0.0);
    }
});

// ==================== 8. BUCLE DE ANIMACIÓN ====================
let previousTime = 0.0;

function animate(currentTimeMs) {
    const timeSec = currentTimeMs * 0.001;
    let deltaTime = timeSec - previousTime;
    previousTime = timeSec;
    if (deltaTime > 0.1 || deltaTime <= 0.0) deltaTime = 0.016;

    // 1. Actualizar ciclo continuo de día y noche
    updateDayNightCycle(deltaTime);

    // 2. Olas del océano
    oceanGeom.updateWaves(renderer.gl, timeSec);

    // 3. Giro de 360° de la linterna y haz del faro
    const sweepAngle = timeSec * 0.85;
    beaconPivot.rotation.y = sweepAngle;

    renderer.spotlightPosition = [
        lighthouseRoot.position.x,
        lighthouseRoot.position.y + beaconPivot.position.y,
        lighthouseRoot.position.z
    ];

    const tilt = -0.15;
    renderer.spotlightDirection = [
        -Math.sin(sweepAngle) * Math.cos(tilt),
        Math.sin(tilt),
        -Math.cos(sweepAngle) * Math.cos(tilt)
    ];

    // 4. Actualizar flota de barcos y colisiones
    fleet.update(deltaTime, timeSec, worldObstacles);

    // 5. Animación de vuelo de las gaviotas
    for (let i = 0; i < seagulls.length; i++) {
        const b = seagulls[i];
        b.angle += b.speed * deltaTime;

        const bx = b.centerX + Math.cos(b.angle) * b.radiusX;
        const bz = b.centerZ + Math.sin(b.angle) * b.radiusZ;
        const by = b.baseHeight + Math.sin(timeSec * 1.6 + b.flapPhase) * 1.1;

        const bvx = -Math.sin(b.angle) * b.radiusX;
        const bvz =  Math.cos(b.angle) * b.radiusZ;

        b.root.position = { x: bx, y: by, z: bz };
        b.root.rotation.y = Math.atan2(bvx, bvz);
        b.root.rotation.z = -0.18;

        const flap = Math.sin(timeSec * b.flapSpeed + b.flapPhase) * 0.52;
        b.rightWing.rotation.z =  flap;
        b.leftWing.rotation.z  = -flap;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);