import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ==========================================
// 1. SCENE SETUP - Dunkle Winternacht
// ==========================================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Kamera Position
camera.position.set(50, 35, 50);
camera.lookAt(0, 12, 0);

// Dunkles Marineblau für Nachthimmel
scene.background = new THREE.Color(0x191940);
scene.fog = new THREE.FogExp2(0x191940, 0.008);

// ==========================================
// 2. LIGHTING
// ==========================================
const ambientLight = new THREE.AmbientLight(0x4466aa, 0.5);
scene.add(ambientLight);

const moonLight = new THREE.DirectionalLight(0x6688cc, 0.3);
moonLight.position.set(30, 80, 30);
moonLight.castShadow = true;
scene.add(moonLight);

// ==========================================
// 3. UTILITY FUNCTIONS
// ==========================================
const createBlock = (x, y, z, w, h, d, color) => {
    const geometry = new THREE.BoxGeometry(w, h, d);
    const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.85,
        metalness: 0.05
    });
    const block = new THREE.Mesh(geometry, material);
    block.position.set(x, y, z);
    block.castShadow = true;
    block.receiveShadow = true;
    return block;
};

const createEmissiveBlock = (x, y, z, w, h, d, color, emissiveColor, intensity) => {
    const geometry = new THREE.BoxGeometry(w, h, d);
    const material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: emissiveColor,
        emissiveIntensity: intensity,
        roughness: 0.5
    });
    const block = new THREE.Mesh(geometry, material);
    block.position.set(x, y, z);
    return block;
};

// ==========================================
// 4. GROUND - Schneebedeckter Boden
// ==========================================
const groundSize = 120;
const groundBlock = createBlock(0, -0.5, 0, groundSize, 1, groundSize, 0xcccccc);
scene.add(groundBlock);

// Vorplatz/Einfahrtsbereich (Pflaster)
const drivewayBlock = createBlock(0, 0.05, 25, 40, 0.1, 30, 0x777777);
scene.add(drivewayBlock);

// Grünfläche um Gebäude
const grassBlock = createBlock(0, 0.1, 5, 50, 0.2, 20, 0x2d5a27);
scene.add(grassBlock);

// Schnee auf Grünfläche
for (let i = 0; i < 20; i++) {
    const x = (Math.random() - 0.5) * 45;
    const z = (Math.random() - 0.5) * 15 + 5;
    const size = Math.random() * 2 + 1;
    const snowPatch = createBlock(x, 0.25, z, size, 0.1, size, 0xeeeeee);
    scene.add(snowPatch);
}

// ==========================================
// 5. OGE BUILDING - Nach Referenzbild
// ==========================================
const createOGEBuilding = () => {
    const buildingGroup = new THREE.Group();

    // Farben
    const structureWhite = 0xe8e8e8;
    const structureGray = 0xcccccc;
    const blueAccent = 0x1a4ba0;
    const darkGlass = 0x3a5a7a;

    // Gebäudemaße
    const floorHeight = 3;
    const floorCount = 8;
    const totalHeight = floorCount * floorHeight;
    const buildingWidth = 36;
    const buildingDepth = 20;

    // ==========================================
    // ERDGESCHOSS - Auf Stelzen/Säulen
    // ==========================================
    const groundFloorHeight = 4;

    // Stützsäulen im Erdgeschoss (weiß)
    const pillarPositions = [
        [-14, 6], [-7, 6], [0, 6], [7, 6], [14, 6],
        [-14, -6], [-7, -6], [0, -6], [7, -6], [14, -6]
    ];

    pillarPositions.forEach(pos => {
        const pillar = createBlock(pos[0], groundFloorHeight / 2, pos[1], 1.5, groundFloorHeight, 1.5, structureWhite);
        buildingGroup.add(pillar);
    });

    // Erdgeschoss-Decke
    const groundCeiling = createBlock(0, groundFloorHeight, 0, buildingWidth, 0.5, buildingDepth, structureGray);
    buildingGroup.add(groundCeiling);

    // Eingangsbereich/Vordach
    const entranceRoof = createBlock(0, groundFloorHeight - 0.5, buildingDepth / 2 + 3, 12, 0.3, 6, structureGray);
    buildingGroup.add(entranceRoof);

    // ==========================================
    // HAUPTGEBÄUDE - 8 Stockwerke
    // ==========================================

    // 4 BLAUE ECKSÄULEN - Das markanteste Merkmal!
    // Diese Säulen sind nach außen geneigt (trapezförmig)
    const columnWidth = 2;
    const columnTopOffset = 3; // Wie weit die Säulen oben nach außen gehen

    // Funktion für geneigte Säule
    const createAngledColumn = (baseX, baseZ, topOffsetX, topOffsetZ) => {
        const columnGroup = new THREE.Group();
        const segmentCount = 16;
        const segmentHeight = totalHeight / segmentCount;

        for (let i = 0; i < segmentCount; i++) {
            const t = i / segmentCount;
            const x = baseX + topOffsetX * t;
            const z = baseZ + topOffsetZ * t;
            const y = groundFloorHeight + i * segmentHeight + segmentHeight / 2;

            const segment = createBlock(x, y, z, columnWidth, segmentHeight + 0.1, columnWidth, blueAccent);
            columnGroup.add(segment);
        }
        return columnGroup;
    };

    // Vier blaue Ecksäulen (nach außen geneigt)
    const col1 = createAngledColumn(-buildingWidth / 2 + 1, -buildingDepth / 2 + 1, -columnTopOffset, -columnTopOffset);
    const col2 = createAngledColumn(buildingWidth / 2 - 1, -buildingDepth / 2 + 1, columnTopOffset, -columnTopOffset);
    const col3 = createAngledColumn(-buildingWidth / 2 + 1, buildingDepth / 2 - 1, -columnTopOffset, columnTopOffset);
    const col4 = createAngledColumn(buildingWidth / 2 - 1, buildingDepth / 2 - 1, columnTopOffset, columnTopOffset);
    buildingGroup.add(col1, col2, col3, col4);

    // ==========================================
    // GLASFASSADE MIT HORIZONTALEN BÄNDERN
    // ==========================================

    const glassMaterial = new THREE.MeshStandardMaterial({
        color: darkGlass,
        transparent: true,
        opacity: 0.75,
        metalness: 0.4,
        roughness: 0.1
    });

    const litWindowMaterial = new THREE.MeshStandardMaterial({
        color: 0xffeedd,
        emissive: 0xffaa55,
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: 0.9
    });

    // Jede Etage
    for (let floor = 0; floor < floorCount; floor++) {
        const floorY = groundFloorHeight + floor * floorHeight;

        // Horizontales weißes Band (Decke jeder Etage)
        const floorSlab = createBlock(0, floorY + floorHeight, 0, buildingWidth - 2, 0.4, buildingDepth - 2, structureWhite);
        buildingGroup.add(floorSlab);

        // Fensterreihe - Vorderseite
        const windowsPerSide = 10;
        const windowWidth = (buildingWidth - 8) / windowsPerSide;

        for (let w = 0; w < windowsPerSide; w++) {
            const isLit = Math.random() > 0.5;
            const wx = -buildingWidth / 2 + 4 + w * windowWidth + windowWidth / 2;
            const wy = floorY + floorHeight / 2 + 0.3;

            // Vorderseite
            const windowFront = new THREE.Mesh(
                new THREE.BoxGeometry(windowWidth - 0.3, floorHeight - 0.8, 0.2),
                isLit ? litWindowMaterial : glassMaterial
            );
            windowFront.position.set(wx, wy, buildingDepth / 2 - 0.5);
            buildingGroup.add(windowFront);

            // Rückseite
            const windowBack = new THREE.Mesh(
                new THREE.BoxGeometry(windowWidth - 0.3, floorHeight - 0.8, 0.2),
                Math.random() > 0.5 ? litWindowMaterial : glassMaterial
            );
            windowBack.position.set(wx, wy, -buildingDepth / 2 + 0.5);
            buildingGroup.add(windowBack);
        }

        // Seitenfenster
        const sideWindows = 5;
        const sideWindowWidth = (buildingDepth - 6) / sideWindows;

        for (let w = 0; w < sideWindows; w++) {
            const isLit = Math.random() > 0.5;
            const wz = -buildingDepth / 2 + 3 + w * sideWindowWidth + sideWindowWidth / 2;
            const wy = floorY + floorHeight / 2 + 0.3;

            // Linke Seite
            const windowLeft = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, floorHeight - 0.8, sideWindowWidth - 0.3),
                isLit ? litWindowMaterial : glassMaterial
            );
            windowLeft.position.set(-buildingWidth / 2 + 0.5, wy, wz);
            buildingGroup.add(windowLeft);

            // Rechte Seite
            const windowRight = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, floorHeight - 0.8, sideWindowWidth - 0.3),
                Math.random() > 0.5 ? litWindowMaterial : glassMaterial
            );
            windowRight.position.set(buildingWidth / 2 - 0.5, wy, wz);
            buildingGroup.add(windowRight);
        }

        // Vertikale weiße Streifen zwischen Fenstern
        for (let v = 0; v <= windowsPerSide; v++) {
            const vx = -buildingWidth / 2 + 4 + v * windowWidth;
            const vy = floorY + floorHeight / 2;

            // Vorne
            const stripFront = createBlock(vx, vy, buildingDepth / 2 - 0.3, 0.3, floorHeight - 0.4, 0.5, structureWhite);
            buildingGroup.add(stripFront);

            // Hinten
            const stripBack = createBlock(vx, vy, -buildingDepth / 2 + 0.3, 0.3, floorHeight - 0.4, 0.5, structureWhite);
            buildingGroup.add(stripBack);
        }
    }

    // ==========================================
    // DACH
    // ==========================================
    const roofY = groundFloorHeight + totalHeight;

    // Hauptdach
    const roofMain = createBlock(0, roofY + 0.5, 0, buildingWidth - 4, 1, buildingDepth - 4, structureGray);
    buildingGroup.add(roofMain);

    // Dachaufbauten (technische Anlagen)
    const roofBox1 = createBlock(-8, roofY + 2, 0, 6, 3, 5, structureGray);
    const roofBox2 = createBlock(8, roofY + 2, 0, 6, 3, 5, structureGray);
    buildingGroup.add(roofBox1, roofBox2);

    // Antennen auf dem Dach
    const antenna1 = createBlock(-12, roofY + 4, 3, 0.3, 6, 0.3, 0x555555);
    const antenna2 = createBlock(12, roofY + 4, -3, 0.3, 6, 0.3, 0x555555);
    buildingGroup.add(antenna1, antenna2);

    return buildingGroup;
};

const building = createOGEBuilding();
scene.add(building);

// ==========================================
// 6. DREI GROSSE GELBE STERNE AUF DEM DACH
// ==========================================
const createPixelStar = (x, y, z, size) => {
    const starGroup = new THREE.Group();
    const starColor = 0xffff00;
    const starMaterial = new THREE.MeshStandardMaterial({
        color: starColor,
        emissive: starColor,
        emissiveIntensity: 1.5
    });

    const blockSize = size * 0.25;

    // Stern aus Blöcken
    const positions = [
        [0, 0, 0],
        [0, blockSize, 0], [0, blockSize * 2, 0], [0, blockSize * 3, 0],
        [0, -blockSize, 0], [0, -blockSize * 2, 0], [0, -blockSize * 3, 0],
        [blockSize, 0, 0], [blockSize * 2, 0, 0], [blockSize * 3, 0, 0],
        [-blockSize, 0, 0], [-blockSize * 2, 0, 0], [-blockSize * 3, 0, 0],
        [blockSize, blockSize, 0], [blockSize * 2, blockSize * 2, 0],
        [-blockSize, blockSize, 0], [-blockSize * 2, blockSize * 2, 0],
        [blockSize, -blockSize, 0], [blockSize * 2, -blockSize * 2, 0],
        [-blockSize, -blockSize, 0], [-blockSize * 2, -blockSize * 2, 0]
    ];

    positions.forEach(pos => {
        const block = new THREE.Mesh(new THREE.BoxGeometry(blockSize, blockSize, blockSize * 0.5), starMaterial);
        block.position.set(pos[0], pos[1], pos[2]);
        starGroup.add(block);
    });

    starGroup.position.set(x, y, z);

    const starLight = new THREE.PointLight(starColor, 3, 20);
    starLight.position.set(x, y, z);
    scene.add(starLight);

    return starGroup;
};

// Sterne auf dem Dach
const roofHeight = 4 + 8 * 3 + 2;
const star1 = createPixelStar(-10, roofHeight + 6, 0, 2.5);
const star2 = createPixelStar(0, roofHeight + 8, 0, 3);
const star3 = createPixelStar(10, roofHeight + 6, 0, 2.5);
scene.add(star1, star2, star3);

// ==========================================
// 7. HECKEN VOR DEM GEBÄUDE
// ==========================================
const createHedge = (x, z, width, depth) => {
    const hedgeGroup = new THREE.Group();
    const hedgeColor = 0x2d5a27;
    const snowColor = 0xffffff;

    // Hecke
    const hedge = createBlock(0, 1, 0, width, 2, depth, hedgeColor);
    hedgeGroup.add(hedge);

    // Schnee auf der Hecke
    const snow = createBlock(0, 2.1, 0, width * 0.9, 0.2, depth * 0.9, snowColor);
    hedgeGroup.add(snow);

    hedgeGroup.position.set(x, 0, z);
    scene.add(hedgeGroup);
};

// Hecken links und rechts vom Eingang
createHedge(-12, 12, 10, 3);
createHedge(12, 12, 10, 3);

// ==========================================
// 8. TANNEN MIT SCHNEE
// ==========================================
const createSnowTree = (x, z, height = 5) => {
    const treeGroup = new THREE.Group();
    const trunkColor = 0x5c4033;
    const leafColor = 0x1a4a1a;
    const snowColor = 0xffffff;

    const trunkHeight = Math.max(2, height * 0.3);
    const trunk = createBlock(0, trunkHeight / 2, 0, 1, trunkHeight, 1, trunkColor);
    treeGroup.add(trunk);

    const layers = Math.floor(height * 0.8);
    for (let i = 0; i < layers; i++) {
        const layerSize = (layers - i) * 1.2 + 1.5;
        const yPos = trunkHeight + i * 1.4 + 0.7;

        const foliage = createBlock(0, yPos, 0, layerSize, 1.4, layerSize, leafColor);
        treeGroup.add(foliage);

        const snowLayer = createBlock(0, yPos + 0.75, 0, layerSize * 0.9, 0.15, layerSize * 0.9, snowColor);
        treeGroup.add(snowLayer);
    }

    const tipY = trunkHeight + layers * 1.4 + 1;
    const tip = createBlock(0, tipY, 0, 0.8, 1.2, 0.8, leafColor);
    const tipSnow = createBlock(0, tipY + 0.7, 0, 0.6, 0.2, 0.6, snowColor);
    treeGroup.add(tip, tipSnow);

    treeGroup.position.set(x, 0, z);
    scene.add(treeGroup);
    return treeGroup;
};

// Bäume um das Gebäude
const treePositions = [
    { x: -25, z: 8, h: 7 },
    { x: 25, z: 8, h: 6 },
    { x: -30, z: -5, h: 8 },
    { x: 30, z: -5, h: 7 },
    { x: 0, z: -18, h: 9 },
    { x: -20, z: -15, h: 6 },
    { x: 20, z: -15, h: 5 },
    { x: -35, z: 15, h: 8 },
    { x: 35, z: 15, h: 7 },
    { x: 0, z: 35, h: 8 },
    { x: -15, z: 30, h: 6 },
    { x: 15, z: 30, h: 7 }
];

const trees = treePositions.map(pos => createSnowTree(pos.x, pos.z, pos.h));

// ==========================================
// 9. EINFAHRT MIT SCHRANKE
// ==========================================
const createEntrance = () => {
    const entranceGroup = new THREE.Group();

    // Schrankenpfosten
    const post1 = createBlock(-8, 1.5, 32, 0.5, 3, 0.5, 0xff3333);
    const post2 = createBlock(8, 1.5, 32, 0.5, 3, 0.5, 0xff3333);
    entranceGroup.add(post1, post2);

    // Schrankenbalken (rot-weiß)
    for (let i = 0; i < 8; i++) {
        const color = i % 2 === 0 ? 0xff3333 : 0xffffff;
        const segment = createBlock(-6 + i * 1.5, 2.8, 32, 1.5, 0.3, 0.3, color);
        entranceGroup.add(segment);
    }

    // Schrankenkasten
    const controlBox = createBlock(-10, 1.5, 32, 2, 3, 2, 0x444444);
    entranceGroup.add(controlBox);

    // Verkehrsschild (Richtungspfeil)
    const signPost = createBlock(12, 2, 32, 0.3, 4, 0.3, 0x666666);
    const sign = createBlock(12, 3.5, 32, 1.5, 1.5, 0.2, 0x0066cc);
    entranceGroup.add(signPost, sign);

    scene.add(entranceGroup);
};

createEntrance();

// ==========================================
// 10. FIRMENFLAGGEN
// ==========================================
const createFlag = (x, z, color) => {
    const flagGroup = new THREE.Group();

    // Fahnenmast
    const pole = createBlock(0, 4, 0, 0.2, 8, 0.2, 0xcccccc);
    flagGroup.add(pole);

    // Fahne
    const flag = createBlock(0.8, 7, 0, 1.5, 1, 0.1, color);
    flagGroup.add(flag);

    flagGroup.position.set(x, 0, z);
    scene.add(flagGroup);
};

createFlag(22, 18, 0x0066cc);
createFlag(25, 18, 0xffcc00);
createFlag(28, 18, 0x0066cc);

// ==========================================
// 11. LICHTERKETTEN
// ==========================================
let christmasLights = [];
const lightColorSequence = [0xff0000, 0x00ff00, 0xffff00, 0x0044ff];

const createLightString = (points, height) => {
    const lightGroup = new THREE.Group();

    points.forEach((point, index) => {
        const color = lightColorSequence[index % lightColorSequence.length];

        const bulbMaterial = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 1.2
        });

        const bulbGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
        bulb.position.set(point.x, height, point.z);
        lightGroup.add(bulb);

        const pointLight = new THREE.PointLight(color, 0.3, 5);
        pointLight.position.copy(bulb.position);
        lightGroup.add(pointLight);

        christmasLights.push({
            bulb,
            pointLight,
            material: bulbMaterial,
            baseIntensity: 1.2,
            phase: Math.random() * Math.PI * 2
        });
    });

    scene.add(lightGroup);
};

// Lichterkette um das Gebäude (auf Höhe 2. Etage)
const buildingLights = [];
const bw = 36, bd = 20;

for (let x = -bw / 2; x <= bw / 2; x += 2) {
    buildingLights.push({ x: x, z: bd / 2 + 0.5 });
}
for (let z = bd / 2; z >= -bd / 2; z -= 2) {
    buildingLights.push({ x: bw / 2 + 0.5, z: z });
}
for (let x = bw / 2; x >= -bw / 2; x -= 2) {
    buildingLights.push({ x: x, z: -bd / 2 - 0.5 });
}
for (let z = -bd / 2; z <= bd / 2; z += 2) {
    buildingLights.push({ x: -bw / 2 - 0.5, z: z });
}

createLightString(buildingLights, 10);

// Lichterkette an den Hecken
const hedgeLights = [];
for (let x = -17; x <= -7; x += 1.5) {
    hedgeLights.push({ x: x, z: 12 });
}
for (let x = 7; x <= 17; x += 1.5) {
    hedgeLights.push({ x: x, z: 12 });
}
createLightString(hedgeLights, 2.5);

// ==========================================
// 12. GESCHENKBOXEN
// ==========================================
const createPresent = (x, y, z, size, color) => {
    const presentGroup = new THREE.Group();

    const box = createBlock(0, size / 2, 0, size, size, size, color);
    presentGroup.add(box);

    const ribbonColor = color === 0xff0000 ? 0xffff00 : (color === 0x00aa00 ? 0xff0000 : 0x00aa00);
    const ribbonH = createBlock(0, size / 2, 0, size + 0.1, size * 0.15, size * 0.15, ribbonColor);
    const ribbonV = createBlock(0, size / 2, 0, size * 0.15, size + 0.1, size * 0.15, ribbonColor);
    presentGroup.add(ribbonH, ribbonV);

    const bow = createBlock(0, size + 0.2, 0, size * 0.4, 0.3, size * 0.4, ribbonColor);
    presentGroup.add(bow);

    presentGroup.position.set(x, y, z);
    scene.add(presentGroup);
};

const presentColors = [0xff0000, 0x00aa00, 0xffffff];
const presentPositions = [
    { x: -25, z: 10, s: 1.2 },
    { x: -26, z: 9, s: 0.8 },
    { x: 25, z: 10, s: 1.0 },
    { x: 0, z: 37, s: 1.5 },
    { x: 2, z: 36, s: 1.0 },
    { x: -2, z: 38, s: 0.8 },
    { x: -30, z: -3, s: 0.9 },
    { x: 30, z: -3, s: 1.1 }
];

presentPositions.forEach((pos, i) => {
    createPresent(pos.x, 0, pos.z, pos.s, presentColors[i % presentColors.length]);
});

// ==========================================
// 13. STRASSENLATERNEN
// ==========================================
const createStreetLamp = (x, z) => {
    const lampGroup = new THREE.Group();
    const poleColor = 0x333333;
    const lampColor = 0xffe6a3;

    const pole = createBlock(0, 3, 0, 0.4, 6, 0.4, poleColor);
    lampGroup.add(pole);

    const head = createBlock(0, 6.5, 0, 1.2, 1.2, 1.2, poleColor);
    lampGroup.add(head);

    const lampLight = createEmissiveBlock(0, 6.5, 0, 0.8, 0.8, 0.8, lampColor, lampColor, 2);
    lampGroup.add(lampLight);

    const light = new THREE.PointLight(lampColor, 2, 15);
    light.position.set(0, 6, 0);
    lampGroup.add(light);

    lampGroup.position.set(x, 0, z);
    scene.add(lampGroup);
};

createStreetLamp(-20, 25);
createStreetLamp(20, 25);
createStreetLamp(-25, -10);
createStreetLamp(25, -10);

// ==========================================
// 14. DICHTER SCHNEEFALL
// ==========================================
const SNOW_COUNT = 25000;
const snowGeometry = new THREE.BufferGeometry();
const snowPositions = new Float32Array(SNOW_COUNT * 3);
const snowVelocities = new Float32Array(SNOW_COUNT);

for (let i = 0; i < SNOW_COUNT; i++) {
    snowPositions[i * 3] = (Math.random() - 0.5) * 140;
    snowPositions[i * 3 + 1] = Math.random() * 70;
    snowPositions[i * 3 + 2] = (Math.random() - 0.5) * 140;
    snowVelocities[i] = 0.012 + Math.random() * 0.018;
}

snowGeometry.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));

const snowMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.25,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const snow = new THREE.Points(snowGeometry, snowMaterial);
scene.add(snow);

// ==========================================
// 15. PAPIERFLIEGER
// ==========================================
const createPaperPlane = () => {
    const planeGroup = new THREE.Group();
    const paperColor = 0xffffff;
    const paperMaterial = new THREE.MeshStandardMaterial({
        color: paperColor,
        roughness: 0.3,
        metalness: 0.1,
        side: THREE.DoubleSide
    });

    // Rumpf (Mitte)
    const bodyGeom = new THREE.BoxGeometry(0.3, 0.15, 2);
    const body = new THREE.Mesh(bodyGeom, paperMaterial);
    planeGroup.add(body);

    // Linker Flügel (schräg nach oben)
    const wingGeom = new THREE.BoxGeometry(2, 0.05, 1.5);
    const leftWing = new THREE.Mesh(wingGeom, paperMaterial);
    leftWing.position.set(-1, 0.1, -0.2);
    leftWing.rotation.z = Math.PI * 0.08;
    planeGroup.add(leftWing);

    // Rechter Flügel
    const rightWing = new THREE.Mesh(wingGeom, paperMaterial);
    rightWing.position.set(1, 0.1, -0.2);
    rightWing.rotation.z = -Math.PI * 0.08;
    planeGroup.add(rightWing);

    // Heckflossen
    const tailGeom = new THREE.BoxGeometry(0.6, 0.05, 0.8);
    const leftTail = new THREE.Mesh(tailGeom, paperMaterial);
    leftTail.position.set(-0.3, 0.05, -0.9);
    leftTail.rotation.z = Math.PI * 0.1;
    planeGroup.add(leftTail);

    const rightTail = new THREE.Mesh(tailGeom, paperMaterial);
    rightTail.position.set(0.3, 0.05, -0.9);
    rightTail.rotation.z = -Math.PI * 0.1;
    planeGroup.add(rightTail);

    // Spitze (vorne)
    const noseGeom = new THREE.BoxGeometry(0.2, 0.1, 0.5);
    const nose = new THREE.Mesh(noseGeom, paperMaterial);
    nose.position.set(0, 0, 1.2);
    planeGroup.add(nose);

    // Skalieren
    planeGroup.scale.set(1.5, 1.5, 1.5);

    return planeGroup;
};

const paperPlane = createPaperPlane();
paperPlane.position.set(0, 25, 40);
scene.add(paperPlane);

// Flugzeug-Steuerung
const planeState = {
    speed: 0.3,
    maxSpeed: 0.8,
    minSpeed: 0.1,
    rotationSpeed: 0.03,
    pitchSpeed: 0.02,
    velocity: new THREE.Vector3(0, 0, -0.3),
    banking: 0,
    pitch: 0
};

// Tastatureingaben
const keys = {
    forward: false,  // W - schneller
    backward: false, // S - langsamer
    left: false,     // A - links
    right: false,    // D - rechts
    up: false,       // Leertaste - hoch
    down: false,     // Shift - runter
    cameraFollow: true // F - Kamera-Modus wechseln
};

window.addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'KeyW': keys.forward = true; break;
        case 'KeyS': keys.backward = true; break;
        case 'KeyA': keys.left = true; break;
        case 'KeyD': keys.right = true; break;
        case 'Space': keys.up = true; e.preventDefault(); break;
        case 'ShiftLeft': case 'ShiftRight': keys.down = true; break;
        case 'KeyF': keys.cameraFollow = !keys.cameraFollow; break;
    }
});

window.addEventListener('keyup', (e) => {
    switch(e.code) {
        case 'KeyW': keys.forward = false; break;
        case 'KeyS': keys.backward = false; break;
        case 'KeyA': keys.left = false; break;
        case 'KeyD': keys.right = false; break;
        case 'Space': keys.up = false; break;
        case 'ShiftLeft': case 'ShiftRight': keys.down = false; break;
    }
});

// Funktion zum Aktualisieren des Papierfliegers
const updatePaperPlane = (delta) => {
    // Geschwindigkeit anpassen
    if (keys.forward) {
        planeState.speed = Math.min(planeState.speed + 0.01, planeState.maxSpeed);
    }
    if (keys.backward) {
        planeState.speed = Math.max(planeState.speed - 0.01, planeState.minSpeed);
    }

    // Drehung (Gieren) - Links/Rechts
    if (keys.left) {
        paperPlane.rotation.y += planeState.rotationSpeed;
        planeState.banking = Math.min(planeState.banking + 0.05, 0.4);
    } else if (keys.right) {
        paperPlane.rotation.y -= planeState.rotationSpeed;
        planeState.banking = Math.max(planeState.banking - 0.05, -0.4);
    } else {
        // Banking zurücksetzen
        planeState.banking *= 0.95;
    }

    // Neigung (Pitch) - Hoch/Runter
    if (keys.up) {
        planeState.pitch = Math.min(planeState.pitch + 0.02, 0.3);
    } else if (keys.down) {
        planeState.pitch = Math.max(planeState.pitch - 0.02, -0.3);
    } else {
        planeState.pitch *= 0.95;
    }

    // Rotation anwenden
    paperPlane.rotation.z = planeState.banking;
    paperPlane.rotation.x = planeState.pitch;

    // Bewegungsrichtung berechnen
    const direction = new THREE.Vector3(0, 0, 1);
    direction.applyQuaternion(paperPlane.quaternion);
    direction.multiplyScalar(planeState.speed);

    // Vertikale Bewegung hinzufügen
    direction.y += planeState.pitch * planeState.speed * 2;

    // Position aktualisieren
    paperPlane.position.add(direction);

    // Grenzen prüfen (in der Szene bleiben)
    const bounds = 55;
    const minHeight = 2;
    const maxHeight = 60;

    paperPlane.position.x = Math.max(-bounds, Math.min(bounds, paperPlane.position.x));
    paperPlane.position.z = Math.max(-bounds, Math.min(bounds, paperPlane.position.z));
    paperPlane.position.y = Math.max(minHeight, Math.min(maxHeight, paperPlane.position.y));

    // Leichtes Wippen für realistischeren Flug
    paperPlane.position.y += Math.sin(Date.now() * 0.003) * 0.02;

    // Geschwindigkeitsanzeige aktualisieren
    const speedPercent = ((planeState.speed - planeState.minSpeed) / (planeState.maxSpeed - planeState.minSpeed)) * 100;
    const speedFill = document.getElementById('speed-fill');
    if (speedFill) {
        speedFill.style.width = speedPercent + '%';
    }
};

// ==========================================
// 16. ORBIT CONTROLS
// ==========================================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.05;
controls.minDistance = 30;
controls.maxDistance = 120;
controls.target.set(0, 12, 0);

// Kamera-Follow-Offset
const cameraOffset = new THREE.Vector3(0, 8, -20);

// ==========================================
// 17. ANIMATION LOOP
// ==========================================
const clock = new THREE.Clock();

const animate = () => {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // Papierflieger aktualisieren
    updatePaperPlane(delta);

    // Kamera-Modus
    if (keys.cameraFollow) {
        // Kamera folgt dem Papierflieger
        const offset = cameraOffset.clone();
        offset.applyQuaternion(paperPlane.quaternion);

        const targetCamPos = paperPlane.position.clone().add(offset);
        camera.position.lerp(targetCamPos, 0.05);

        const lookAtPos = paperPlane.position.clone();
        lookAtPos.y += 2;
        camera.lookAt(lookAtPos);

        controls.enabled = false;
    } else {
        controls.enabled = true;
        controls.update();
    }

    // Schneefall
    const positions = snow.geometry.attributes.position.array;
    for (let i = 0; i < SNOW_COUNT; i++) {
        positions[i * 3 + 1] -= snowVelocities[i];
        positions[i * 3] += Math.sin(elapsedTime * 0.5 + i * 0.01) * 0.002;
        positions[i * 3 + 2] += Math.cos(elapsedTime * 0.3 + i * 0.01) * 0.002;

        if (positions[i * 3 + 1] < 0) {
            positions[i * 3 + 1] = 65 + Math.random() * 5;
            positions[i * 3] = (Math.random() - 0.5) * 140;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 140;
        }
    }
    snow.geometry.attributes.position.needsUpdate = true;

    // Lichterketten flackern
    christmasLights.forEach((lightData) => {
        const flicker = Math.sin(elapsedTime * 4 + lightData.phase) * 0.3 + 0.7;
        lightData.material.emissiveIntensity = lightData.baseIntensity * flicker;
        lightData.pointLight.intensity = 0.2 + flicker * 0.2;
    });

    // Sterne pulsieren
    const starPulse = Math.sin(elapsedTime * 2) * 0.3 + 1.2;
    [star1, star2, star3].forEach(star => {
        star.children.forEach(child => {
            if (child.material && child.material.emissiveIntensity !== undefined) {
                child.material.emissiveIntensity = starPulse;
            }
        });
    });

    renderer.render(scene, camera);
};

// ==========================================
// 17. WINDOW RESIZE
// ==========================================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
console.log('OGE Building Christmas Scene loaded!');
