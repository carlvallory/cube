// materials.js
import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

export function loadEnvironmentTexture(scene, texturePath) {
    return new Promise((resolve, reject) => {
        const exrLoader = new EXRLoader();
        exrLoader.load(texturePath, function (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.environment = texture;
            scene.background = texture;
            resolve(texture);
        }, undefined, reject);
    });
}

export function createMaterials(envTexture) {
    const videoMaterial = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide
    });

    const crystalClearMaterial = new THREE.MeshPhysicalMaterial({
        metalness: 0,
        roughness: 0.1,
        transmission: 1,
        transparent: true,
        thickness: 0.1,
        reflectivity: 1,
        ior: 1.3,
        side: THREE.DoubleSide,
    });

    const crystalSideMaterial = new THREE.MeshPhysicalMaterial({
        envMap: envTexture,
        envMapIntensity: 1,
        metalness: 0.2,
        roughness: 0.1,
        transmission: 0.9,
        thickness: -1,
        reflectivity: 1,
        ior: 1.3,
        sheen: 1,
        sheenColor: new THREE.Color(0x0000ff),
        side: THREE.DoubleSide,
        lightMapIntensity: 1,
    });

    const backFaceMaterial = new THREE.MeshPhysicalMaterial({
        metalness: 1,
        roughness: 1,
        transmission: 0,
        transparent: false,
    });

    return {
        videoMaterial,
        crystalClearMaterial,
        crystalSideMaterial,
        backFaceMaterial,
    };
}
