/**
 * moduleCubeHover.js
 * @module moduleCubeHover
 * @description Módulo para detectar el mouse sobre un cubo.
 * @requires three
 * @see {@link https://threejs.org/docs/index.html#api/en/core/Raycaster|Raycaster}
 */
import * as THREE from 'three';

let isOverCube = false;  // Variable que queremos exportar
let isMouseDown = false; // Variable para verificar si el mouse está presionado

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

/**
 * Función para detectar el mouse sobre el cubo.
 * @param {THREE.Camera} camera - La cámara de la escena.
 * @param {THREE.Mesh} cube - El cubo visible.
 * @param {number} marginFactor - Factor de expansión del área de detección (ej: 1.2 para 20% más grande).
 */
function detectCubeHover(camera, cube, marginFactor = 1.2) {
    // Crear un cubo invisible más grande para la detección
    const detectionCubeGeometry = new THREE.BoxGeometry(
        cube.geometry.parameters.width * marginFactor,
        cube.geometry.parameters.height * marginFactor,
        cube.geometry.parameters.depth * marginFactor
    );

    const detectionCubeMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true, // Mostrar en wireframe si quieres visualizar el área de detección
        visible: false   // Hacerlo invisible para la escena
    });

    const detectionCube = new THREE.Mesh(detectionCubeGeometry, detectionCubeMaterial);
    detectionCube.position.copy(cube.position); // Asegurarse de que tenga la misma posición que el cubo original

    // Ahora el detectionCube se usa solo para detectar el hover del mouse
    window.addEventListener('mousemove', function(event) {
        // Convertir las coordenadas del mouse a coordenadas normalizadas (-1 a 1)
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Actualizar el raycaster con la posición del mouse
        raycaster.setFromCamera(mouse, camera);

        // Revisar si el mouse está intersectando con el cubo de detección (invisible)
        const intersects = raycaster.intersectObject(detectionCube);

        // Si el mouse está presionado, mantener isOverCube como true
        if (isMouseDown) {
            return;  // No hacemos nada si el mouse está presionado
        }

        if (intersects.length > 0) {
            if (!isOverCube) {
                // Simula el evento mouseover
                console.log("Mouse sobre el cubo (área extendida)");
                isOverCube = true;
            }
        } else {
            if (isOverCube) {
                // Simula el evento mouseout
                console.log("Mouse fuera del cubo (área extendida)");
                isOverCube = false;
            }
        }
    });

    // Evento mousedown para mantener isOverCube como true mientras el mouse está presionado
    window.addEventListener('mousedown', function(event) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(detectionCube);

        if (intersects.length > 0) {
            isOverCube = true;
            isMouseDown = true;
            console.log('Mouse presionado sobre el cubo');
        }
    });

    // Evento mouseup para permitir que isOverCube se actualice cuando se suelte el mouse
    window.addEventListener('mouseup', function() {
        isMouseDown = false;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(detectionCube);

        // Si el mouse está sobre el cubo después de soltar, mantener isOverCube
        if (intersects.length === 0) {
            isOverCube = false;
            console.log('Mouse soltado y fuera del cubo');
        }
    });

    // Retornamos el cubo de detección si se quiere agregar manualmente a la escena para depuración
    return detectionCube;
}

export { isOverCube, detectCubeHover };
