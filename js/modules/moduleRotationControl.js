/** 
 * moduleRotationControl.js
 * @module moduleRotationControl
 * @description Módulo para controlar la rotación de los objetos.
 * @requires three
 */

/**
 * Suavizar la rotación de un objeto hacia una rotación objetivo.
 * @param {THREE.Object3D} object - El objeto cuya rotación se ajustará.
 * @param {THREE.Euler} targetRotation - La rotación objetivo.
 * @param {number} lerpFactor - La suavidad de la interpolación.
 */
function smoothRotation(object, targetRotation, lerpFactor = 0.1) {
    object.rotation.x += (targetRotation.x - object.rotation.x) * lerpFactor;
    object.rotation.y += (targetRotation.y - object.rotation.y) * lerpFactor;
    object.rotation.z += (targetRotation.z - object.rotation.z) * lerpFactor;
}

export { smoothRotation };