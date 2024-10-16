/**
 * moduleScaleControl.js
 * @module moduleScaleControl
 * @description Módulo para controlar la escala de los objetos.
 * @requires three
 * @see {@link https://threejs.org/docs/index.html#api/en/core/Object3D.scale|Object3D.scale}
 */
import * as THREE from 'three';

let targetScale = new THREE.Vector3(1, 1, 1); // Escala objetivo

/**
 * Función para ajustar la escala del objeto.
 * @param {THREE.Mesh} object - El objeto al que quieres ajustar la escala.
 * @param {number} hoverScaleFactor - El factor de escala al hacer hover (ej: 1.2).
 * @param {number} lerpFactor - La suavidad del escalado.
 * @param {boolean} isOverObject - Si el mouse está sobre el objeto.
 */
function adjustObjectScale(object, hoverScaleFactor = 1.2, lerpFactor = 0.1, isOverObject) {
    // Establecer el objetivo de escala dependiendo si el mouse está sobre el objeto o no
    targetScale.set(
        isOverObject ? hoverScaleFactor : 1,
        isOverObject ? hoverScaleFactor : 1,
        isOverObject ? hoverScaleFactor : 1
    );

    // Suavizar la transición usando lerp
    object.scale.lerp(targetScale, lerpFactor);
}

export { adjustObjectScale };
