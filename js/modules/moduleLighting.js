/**
 * moduleLighting.js
 * @module moduleLighting
 * @description Modulo para añadir luces a la escena.
 * @requires three
 * @see {@link https://threejs.org/docs/index.html#api/en/lights/AmbientLight|AmbientLight}
 */
import * as THREE from 'three';

/**
 * Añade una luz ambiental a la escena.
 * @param {THREE.Scene} scene - La escena en la que se añadirá la luz.
 * @param {number} intensity - La intensidad de la luz.
 */
function addAmbientLight(scene, intensity = 0.5) {
    const ambientLight = new THREE.AmbientLight(0xffffff, intensity);
    scene.add(ambientLight);
}

/**
 * Añade una luz direccional a la escena.
 * @param {THREE.Scene} scene - La escena en la que se añadirá la luz.
 * @param {THREE.Vector3} position - La posición de la luz.
 * @param {number} intensity - La intensidad de la luz.
 */
function addDirectionalLight(scene, position = new THREE.Vector3(10, 10, 10), intensity = 1) {
    const directionalLight = new THREE.DirectionalLight(0xffffff, intensity);
    directionalLight.position.copy(position);
    scene.add(directionalLight);
}

export { addAmbientLight, addDirectionalLight };
