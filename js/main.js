import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { loadOBJModel, loadGLTFModel, loadFBXModel } from './modules/moduleModelLoader.js';
import { isOverCube, detectCubeHover } from './modules/moduleCubeHover.js';
import { adjustObjectScale } from './modules/moduleScaleControl.js';
import { addAmbientLight, addDirectionalLight } from './modules/moduleLighting.js';
import { smoothRotation } from './modules/moduleRotationControl.js';

// Crear el LoadingManager
const loadingManager = new THREE.LoadingManager();

loadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
    document.getElementById('loading-screen').style.display = 'flex';
};

loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
    const progress = (itemsLoaded / itemsTotal) * 100;
    document.getElementById('loading-bar-progress').style.width = progress + '%';
};

loadingManager.onLoad = function () {
    document.getElementById('loading-screen').style.display = 'none';
};

loadingManager.onError = function (url) {
    console.error('Error al cargar ' + url);
};

// Escena
const sceneOne = new THREE.Scene();
sceneOne.background = new THREE.Color(0xfefefe);  // Fondo blanco

// Cámara
const cameraOne = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
cameraOne.position.z = 10;

// Renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//HDRI
const exrLoader = new EXRLoader(loadingManager);
exrLoader.load('hdri/background-studio-wall.exr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    
    // Establecer la textura de entorno para la escena
    sceneOne.environment = texture;
    sceneOne.background = texture;

    // También puedes aplicarlo como un mapa de entorno en el cubo cristalino para reflejos
    crystalSideMaterial.envMap = texture;
    crystalSideMaterial.needsUpdate = true;
},
undefined,
function (error) {
    console.error('Error al cargar la textura EXR', error);
});

// Geometría del cubo
const cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
// Crear un CubeCamera para las reflexiones
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
    format: THREE.RGBFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter
});
const cubeCamera = new THREE.CubeCamera(0.1, 10, cubeRenderTarget);
const cubeMaterial = new THREE.MeshPhysicalMaterial({
    envMap: cubeRenderTarget.texture, 
    envMapIntensity: 1,
    color: 0xaaaaaa, 
    opacity: 0.1, // Transparente
    transparent: true,
    roughness: 0.05, 
    metalness: 0, 
    reflectivity: 0.9,
    transmission: 1, // Permitir que la luz pase a través
    clearcoat: 1, 
    clearcoatRoughness: 0,
    thickness: -1,
    ior: 1,
    sheen: 1, // Simular efectos de dispersión de luz
    sheenColor: new THREE.Color(0xff00ff), // Efecto prismático con un color inicial
    side: THREE.DoubleSide // Para que las caras interiores reflejen
});

const crystalSideMaterial = new THREE.MeshPhysicalMaterial({
    envMap: cubeRenderTarget.texture, 
    envMapIntensity: 1,
    metalness: 0.2,  
    roughness: 0.1,
    transmission: 0.9, // Add transparency
    thickness: -1, // Add refraction
    reflectivity: 1,
    ior: 1.3,
    sheen: 1, // Simular efectos de dispersión de luz
    sheenColor: new THREE.Color(0x0000ff), // Efecto prismático con un color inicial
    side: THREE.DoubleSide,
    lightMapIntensity: 1,

});

const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
sceneOne.add(cube);

// Crear una esfera azul dentro del cubo
const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
const sphereTexture = new THREE.TextureLoader(loadingManager).load( 'https://i.imgur.com/kFoWvzw.jpg' );
const sphereMaterial = new THREE.MeshBasicMaterial( { map: sphereTexture } );
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(0, 0, 0); // Posicionar la esfera en el centro del cubo
cube.add(sphere);

// Cargar la fuente
let textMesh;  // Declara textMesh para usarlo globalmente
const fontLoader = new FontLoader(loadingManager);
fontLoader.load('fonts/roboto/Roboto_Regular.typeface.json', function (font) {

    // Crear la geometría de texto
    const textGeometry = new TextGeometry('Start', {
        font: font,
        size: 0.25,   // Tamaño del texto
        depth: 0.05, // Profundidad del texto
        curveSegments: 12, // Curvatura de los bordes
        bevelEnabled: true, // Habilitar biselado
        bevelThickness: 0.02, // Grosor del biselado
        bevelSize: 0.005, // Tamaño del biselado
        bevelOffset: 0,
        bevelSegments: 5
    });

    // Material para el texto
    const textMaterial = new THREE.MeshPhongMaterial({ color: 0x000000, specular: 0xffffff, shininess: 100 });
    textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // Posicionar el texto en la cara frontal del cubo
    textMesh.position.set(-0.4, -0.5, 2);  // Ajusta las coordenadas según el tamaño del cubo
    cube.add(textMesh);
});

// Crear el grupo para contener el cubo y el plano
//const cubeSceneOneGroup = new THREE.Group();

// Añadir el cubo y el plano al grupo
//cubeSceneOneGroup.add(cube);

// const wallGeometry = new THREE.BoxGeometry(10,5,1);
// const wallTexture = new THREE.TextureLoader(loadingManager).load( 'https://i.imgur.com/onN1zfo.jpeg' );
// const wallMaterial = new THREE.MeshBasicMaterial( { map: wallTexture } );
// const wall = new THREE.Mesh(wallGeometry, wallMaterial);
// wall.position.set(0, 0, 10); // Posicionar la esfera en el centro del cubo
// sceneOne.add(wall);


// Iluminación
const ambientLight = new THREE.AmbientLight(0xfefefe, 0.5);  // Luz ambiental
sceneOne.add(ambientLight);

const pointLight = new THREE.PointLight(0xfefefe, 1);
pointLight.position.set(5, 5, 5);
sceneOne.add(pointLight);

// Parámetros de rotación
const rotationAmplitudeY = 0.15; // 15% de rotación
const rotationAmplitudeX = 0.15; // 15% de rotación
const rotationAmplitudeZ = 0.30; // 30% de rotación
const rotationSpeed = 0.005;
const rotationSpeedX = 0.0005; // Velocidad de oscilación en el eje X (más lenta)
const rotationSpeedY = 0.0004; // Velocidad de oscilación en el eje Y (más lenta)
const rotationSpeedZ = 0.0003; // Velocidad de oscilación en el eje Z (más lenta)
const easingFactor = 0.05; // Factor de suavizado para la rotación (más bajo para una transición más suave)

// Raycaster para la detección del mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Tamaño original del cubo y la esfera
const originalScalePercentage = 100;
const hoverScalePercentage = 25;
const originalScaleValue = 1;
const hoverScaleValue = originalScaleValue + ((originalScaleValue*hoverScalePercentage) / originalScalePercentage);
const originalScale = new THREE.Vector3(originalScaleValue, originalScaleValue, originalScaleValue);
const hoverScale = new THREE.Vector3(hoverScaleValue, hoverScaleValue, hoverScaleValue);
let targetScale = originalScale.clone(); // Inicialmente, el objetivo es el tamaño original

// Rotación objetivo
const targetRotationX = (-Math.PI / 6); // Rotar 30 grados
let targetRotationY = 0; // Rotar 30 grados
const targetRotationZ = 0;
const originalRotation = new THREE.Euler(0, 0, 0);
const targetRotation = new THREE.Euler(targetRotationX, targetRotationY, targetRotationZ); // Rotar para que el vértice inferior izquierdo apunte al frente


// ESCENA DOS
const sceneTwo = new THREE.Scene();
sceneTwo.background = new THREE.Color(0xfefefe);

// Cámara secundaria
const cameraTwo = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
cameraTwo.position.set(0, 0, 5);
cameraTwo.lookAt(0, 0, -2);

const directionalLightTwo = new THREE.DirectionalLight(0xffffff, 1);
directionalLightTwo.position.set(10, 10, 10);
sceneTwo.add(directionalLightTwo);

// Variables para la transición
let currentScene = sceneOne;  // Inicialmente mostrar sceneOne
let currentCamera = cameraOne;
let transitionActive = false;
let transitionProgress = 0;

// Controles de la cámara
const controls = new OrbitControls(currentCamera, renderer.domElement);
controls.enableDamping = true;  // Suaviza el movimiento
controls.dampingFactor = 0.1;
controls.enableZoom = false;
controls.enableRotate = false;

let cameraAnimationActive = false;
let cameraStartPosition = new THREE.Vector3();
let cameraEndPosition = new THREE.Vector3();
let cameraAnimationProgress = 0;

// Función de easing para suavizar la transición
function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function toRadians(angle) {
    return angle * (Math.PI / 180);
}

const margin = 2; // Factor de expansion del area de deteccion;
// Detección del hover con un margen expandido
const detectionCube = detectCubeHover(currentCamera, cube, margin);


// MOUSE ACTION
let mouseTarget = new THREE.Vector3();
let mouseSpeed = 0.1;
//let mouse: { x: 0; y: 0;}; // Usamos let porque los valores se actualizarán
let isDragging = false;
let isOver = isOverCube;
let previousMousePosition = { x: 0, y: 0 };
const lerpFactor = 0.1; // Smoothing factor for interpolation


// Evento de mousemove para detectar la posición del mouse
function onMouseMove(event) {
    // Convertir las coordenadas del mouse a coordenadas normalizadas (-1 a 1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (isDragging) {
        // Calculate the movement in X direction only, since we want to rotate on Y-axis
        let deltaMove = {
            x: event.movementX || event.mozMovementX || event.webkitMovementX || 0
        };

        // Update the target rotation on Y-axis
        targetRotationY += deltaMove.x * rotationSpeed;
    }
}

// Detect when the mouse is pressed to start dragging
renderer.domElement.addEventListener('mousedown', function (event) {
    isDragging = true;
});

// Detect when the mouse is released to stop dragging
renderer.domElement.addEventListener('mouseup', function () {
    isDragging = false;
});


// Agregar el evento de mousemove
window.addEventListener('mousemove', onMouseMove, false);

// Detectar el clic en el texto 'Start'
window.addEventListener('click', (event) => {
    // Convertir las coordenadas del mouse a coordenadas normalizadas (-1 a 1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Usar el raycaster para detectar la intersección con el texto en la sceneOne
    raycaster.setFromCamera(mouse, currentCamera);
    const intersects = raycaster.intersectObject(textMesh);  // Asegúrate de referenciar correctamente el 'textMesh'

    if (intersects.length > 0 && currentScene === sceneOne) {
        // Si el texto 'Start' es clicado en la sceneOne, iniciar la transición a sceneTwo
        transitionActive = true;
        transitionProgress = 0; // Reiniciar el progreso de la transición
        
        // Iniciar la animación de la cámara
        cameraAnimationActive = true;
        cameraAnimationProgress = 0;
        cameraStartPosition.copy(currentCamera.position);
        cameraEndPosition.copy(cube.position);
        cameraEndPosition.z += 2; // Ajustar para detenerse justo delante del cubo
    
    }
});


// Animación
function animate() {
    requestAnimationFrame(animate);

    if(isOverCube) {
        // Smoothly interpolate the cube's Y-axis rotation to the target rotation
        //cube.rotation.y += (targetRotationY - cube.rotation.y) * lerpFactor;
        smoothRotation(cube, targetRotationY, lerpFactor, 'y');
    }

    // Actualizar controles
    controls.update();

    // Si estamos en sceneOne, realizar animaciones específicas
    if (currentScene === sceneOne) {
        // Actualizar la cámara cúbica para las reflexiones dinámicas
        cube.visible = false; // Evitar que el cubo se refleje a sí mismo
        cubeCamera.update(renderer, sceneOne);
        cube.visible = true;

        // Actualizar el raycaster
        raycaster.setFromCamera(mouse, currentCamera);

        // Detectar la intersección con el cubo
        const intersects = raycaster.intersectObject(cube);

        let factor = intersects.length > 0 ? 1 : 0;
        factor = easeInOut(factor);

        // Ajustar la escala del cubo y la esfera
        const sphereScaleFactor = 0.9;
        targetScale.copy(factor === 1 ? hoverScale : originalScale);
        cube.scale.lerp(targetScale, 0.1);
        sphere.scale.lerp(targetScale.clone().multiplyScalar(sphereScaleFactor), 0.1);

        // Rotación de la esfera
        sphere.rotation.y += 0.01;

        if(!isOverCube) {
            // Make the object look at the mouseTarget
            // Update target position based on mouse
            mouseTarget.x += (mouse.x - mouseTarget.x) * mouseSpeed;
            mouseTarget.y += (-mouse.y - mouseTarget.y) * mouseSpeed;
            mouseTarget.z = currentCamera.position.z; // Keep the Z consistent with the camera position
            cube.lookAt(mouseTarget);
        }

        
        // Animación de la cámara hacia adelante
        if (cameraAnimationActive) {
            // *** Modificación ***
            // Rotar el cubo continuamente alrededor del eje Y
            cube.rotation.y += 0.1; // Ajusta la velocidad de rotación según tus preferencias

            cameraAnimationProgress += 0.02; // Ajustar la velocidad de la animación

            // Interpolación suave de la posición de la cámara
            currentCamera.position.lerpVectors(
                cameraStartPosition,
                cameraEndPosition,
                cameraAnimationProgress
            );

            // Efecto de desvanecimiento sincronizado con el movimiento de la cámara
            renderer.domElement.style.opacity = 1 - cameraAnimationProgress;

            // Actualizar el objetivo de los controles para mantener el enfoque en el cubo
            controls.target.lerp(cube.position, 0.1);

            // Cuando la animación esté completa, iniciar la transición
            if (cameraAnimationProgress >= 1) {
                cameraAnimationActive = false;
                // Iniciar la transición de escena
                transitionActive = true;
                transitionProgress = 0;
            }
        }
    }

    // Si la transición está activa, ejecutar la animación de la transición
    if (transitionActive) {
        transitionProgress += 0.02; // Ajustar la velocidad de la transición

        // Aquí podrías agregar efectos adicionales durante la transición
        // Efecto de desvanecimiento (fade out)
        renderer.domElement.style.opacity = 1 - transitionProgress;

        // Cuando la transición esté completa, cambiar de escena
        if (transitionProgress >= 1) {
            transitionActive = false;
            loadNewScene();
        }
    }

    // Renderizar la escena actual con la cámara actual
    renderer.render(currentScene, currentCamera);
    
}

// Función para cambiar de cámara
function switchCamera() {
    if (currentCamera === cameraOne) {
        currentCamera = cameraTwo;
        cameraTwo.position.z = 5;
    } else {
        currentCamera = cameraOne;
        cameraOne.position.z = 10
    }
    controls.dispose();  // Eliminar controles anteriores
    controls = new OrbitControls(currentCamera, renderer.domElement);  // Crear nuevos controles para la cámara actual
}

function moveCamera(currentScene)
{
    if(currentScene === sceneOne) {
    
    } else {
        cameraOne.position.x = 2;
        cameraOne.position.z = 30;
        cameraOne.position.y = 15;
        
    }

}

function endingSceneOne() {

}

// Función para cargar la nueva escena
function loadNewScene() {
    // Cambiar la escena actual por sceneTwo si estamos en sceneOne
    if (currentScene === sceneOne) {
        currentScene = sceneTwo;
        moveCamera();
        //switchCamera();
    } else {
        currentCamera = cameraOne;  // Inicialmente usamos camera1
        currentScene = sceneOne;
    }

    if (currentScene === sceneOne) {
        currentCamera.position.copy(cameraStartPosition);
    }

    // Reiniciar el efecto de fade in (desvanecer la nueva escena)
    renderer.domElement.style.opacity = 0;
    let fadeInProgress = 0;
    function fadeIn() {
        fadeInProgress += 0.01;
        renderer.domElement.style.opacity = fadeInProgress;

        if (fadeInProgress < 1) {
            requestAnimationFrame(fadeIn);
        }
    }
    fadeIn();
}

// Ajuste de la ventana
window.addEventListener('resize', () => {
    currentCamera.aspect = window.innerWidth / window.innerHeight;
    currentCamera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

document.getElementById('loading-screen').style.display = 'flex';

// Iniciar la animación
animate();