// objects.js
import * as THREE from 'three';

export function createObjects(materials) {
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeCrystalClearGeometry = new THREE.BoxGeometry(2, 2, 2);

    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
        format: THREE.RGBFormat,
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter
    });
    const cubeCamera = new THREE.CubeCamera(0.1, 10, cubeRenderTarget);

    const materialsArray = [
        materials.crystalSideMaterial,
        materials.crystalSideMaterial,
        materials.crystalSideMaterial,
        materials.crystalSideMaterial,
        materials.crystalClearMaterial,
        materials.backFaceMaterial
    ];

    const cube = new THREE.Mesh(cubeGeometry, new THREE.MeshNormalMaterial());
    const cubeCrystalClear = new THREE.Mesh(cubeCrystalClearGeometry, materialsArray);
    cube.position.set(0, 0, 0);
    cubeCrystalClear.position.set(0, 0, 0);

    const planeGeometry = new THREE.PlaneGeometry(2, 2);
    const planeOne = new THREE.Mesh(planeGeometry, materials.videoMaterial);
    planeOne.position.set(0, 0, -1);

    const cubeGroup = new THREE.Group();
    cubeGroup.add(cubeCrystalClear);
    cubeGroup.add(planeOne);

    return { cubeGroup, cubeCamera };
}
