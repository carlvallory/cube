/** 
 * moduleRotationControl.js
 * @module moduleRotationControl
 * @description Módulo para controlar la rotación de los objetos en Three.js.
 * @requires three
 */

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
    // Verifica si se proporciona un eje específico
    if (!axis) {
        // Suavizar la rotación en todos los ejes (X, Y, Z)
        object.rotation.x += (targetRotation.x - object.rotation.x) * lerpFactor;
        object.rotation.y += (targetRotation.y - object.rotation.y) * lerpFactor;
        object.rotation.z += (targetRotation.z - object.rotation.z) * lerpFactor;
    } else {
        // Verifica si el eje proporcionado es válido ('x', 'y' o 'z')
        if (['x', 'y', 'z'].includes(axis)) {
            object.rotation[axis] += (targetRotation[axis] - object.rotation[axis]) * lerpFactor;
        } else {
            throw new Error(`Eje inválido: ${axis}. Debe ser 'x', 'y' o 'z'.`);
        }
    }
}

export { smoothRotation };