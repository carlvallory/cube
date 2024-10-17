/** 
 * CameraUtils.js
 * @module CameraUtils
 * @description Módulo con utilidades para cámaras en Three.js.
 * @requires three
 */

export class CameraUtils {

    // Método para calcular el tamaño del plano en función de la distancia de la cámara
    static calculatePlaneSizeAtDistance(camera, planeZ, viewWidth, viewHeight) {
        const cameraZ = camera.position.z;
        const distance = cameraZ - planeZ;
        const aspect = viewWidth / viewHeight;
        const vFov = camera.fov * Math.PI / 180; // Convierte el FOV a radianes
        const planeHeightAtDistance = 2 * Math.tan(vFov / 2) * distance;
        const planeWidthAtDistance = planeHeightAtDistance * aspect;

        return {
            width: planeWidthAtDistance,
            height: planeHeightAtDistance
        };
    }

    // Método para ajustar el FOV de la cámara para que un objeto tenga la altura deseada
    static adjustCameraFovToFitHeight(camera, mesh, desiredHeight) {
        const dist = camera.position.z - mesh.position.z;
        const fov = 2 * Math.atan(desiredHeight / (2 * dist)) * (180 / Math.PI); // Convierte a grados
        camera.fov = fov;
        camera.updateProjectionMatrix(); // Actualiza la proyección de la cámara
    }
}
