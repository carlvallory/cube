/** 
 * moduleModelLoader.js
 * @module moduleModelLoader
 * @description Módulo para cargar modelos 3D en la escena.
 * @requires three
 * @requires OBJLoader
 * @requires GLTFLoader
 * @requires FBXLoader
 */

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

/**
 * Cargar un modelo OBJ en la escena.
 * @param {string} path - Ruta del archivo OBJ.
 * @param {THREE.Scene} scene - La escena a la que se añadirá el modelo.
 */
function loadOBJModel(path, scene) {
    const loader = new OBJLoader();
    loader.load(path, (object) => {
        scene.add(object);
    });
}

/**
 * Cargar un modelo GLTF en la escena.
 * @param {string} path - Ruta del archivo GLTF.
 * @param {THREE.Scene} scene - La escena a la que se añadirá el modelo.
 */
function loadGLTFModel(path, scene) {
    const loader = new GLTFLoader();
    loader.load(path, (gltf) => {
        scene.add(gltf.scene);
    });
}

/**
 * Cargar un modelo FBX en la escena.
 * @param {string} path - Ruta del archivo FBX.
 * @param {THREE.Scene} scene - La escena a la que se añadirá el modelo.
 */
function loadFBXModel(path, scene) {
    const loader = new FBXLoader();
    loader.load(path, (object) => {
        scene.add(object);
    });
}

export { loadOBJModel, loadGLTFModel, loadFBXModel };
