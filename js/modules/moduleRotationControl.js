/** 
 * moduleRotationControl.js
 * @module moduleRotationControl
 * @description Módulo para controlar la rotación de los objetos en Three.js.
 * @requires three
 */

import * as THREE from 'three';

/**
 * Suavizar la rotación de un objeto hacia una rotación objetivo.
 * Si no se especifica un eje, suaviza la rotación en todos los ejes.
 * @param {THREE.Object3D} object - El objeto cuya rotación se ajustará.
 * @param {THREE.Euler} targetRotation - La rotación objetivo en formato Euler.
 * @param {number} [lerpFactor=0.1] - La suavidad de la interpolación (valor entre 0 y 1).
 * @param {string} [axis=false] - El eje de rotación a ajustar ('x', 'y', 'z'). Si no se especifica, ajusta todos los ejes.
 * @throws {Error} Si el parámetro `axis` no es válido.
 */
function smoothRotation(object, targetRotation, lerpFactor = 0.1, axis = false) {
    console.log("Antes de smoothRotation", object.rotation)
    // Verifica si se proporciona un eje específico
    if (!axis) {
        // Suavizar la rotación en todos los ejes (X, Y, Z)
        object.rotation.x += (targetRotation.x - object.rotation.x) * lerpFactor;
        object.rotation.y += (targetRotation.y - object.rotation.y) * lerpFactor;
        object.rotation.z += (targetRotation.z - object.rotation.z) * lerpFactor;

        // Limitar la rotación entre -PI y PI para evitar acumulaciones excesivas
        object.rotation.x = THREE.MathUtils.clamp(object.rotation.x, -Math.PI, Math.PI);
        object.rotation.y = THREE.MathUtils.clamp(object.rotation.y, -Math.PI, Math.PI);
        object.rotation.z = THREE.MathUtils.clamp(object.rotation.z, -Math.PI, Math.PI);
    } else {
        // Verifica si el eje proporcionado es válido ('x', 'y' o 'z')
        if (['x', 'y', 'z'].includes(axis)) {
            object.rotation[axis] += (targetRotation[axis] - object.rotation[axis]) * lerpFactor;

            // Bloquear los otros ejes manteniendo su rotación original
            if (axis === 'y') {
                object.rotation.x = targetRotation.x; // Mantén X constante
                object.rotation.z = targetRotation.z; // Mantén Z constante
            } else if (axis === 'x') {
                object.rotation.y = targetRotation.x; // Mantén X constante
                object.rotation.z = targetRotation.z; // Mantén Z constante
            } else if (axis === 'z') {
                object.rotation.x = targetRotation.x; // Mantén X constante
                object.rotation.y = targetRotation.y; // Mantén Y constante
            }

            // Limitar la rotación del eje específico
            object.rotation[axis] = THREE.MathUtils.clamp(object.rotation[axis], -Math.PI, Math.PI);
        } else {
            throw new Error(`Eje inválido: ${axis}. Debe ser 'x', 'y' o 'z'.`);
        }
    }

    console.log("Despues de smoothRotation", object.rotation)
}

export { smoothRotation };