import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

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
    color: 0xffffff, 
    opacity: 0.1, // Transparente
    transparent: true,
    roughness: 0.05, 
    metalness: 0.5, 
    reflectivity: 0.9,
    refractionRatio: 0.1, // Efecto de refracción
    transmission: 1, // Permitir que la luz pase a través
    clearcoat: 1, 
    clearcoatRoughness: 0,
    thickness: 0.5,
    ior: 1,
    sheen: 1, // Simular efectos de dispersión de luz
    sheenColor: new THREE.Color(0xff0000), // Efecto prismático con un color inicial
    side: THREE.DoubleSide // Para que las caras interiores reflejen
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
        height: 0.05, // Profundidad del texto
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
const targetRotationY = (Math.PI / 6); // Rotar 30 grados
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

//
// Añadir el modelo OBJ con su MTL en la escena dos
// const mtlLoader = new MTLLoader(loadingManager);
// mtlLoader.load(
//     'models/comedor/room.mtl',  // Cambia esto por la ruta correcta a tu archivo .MTL
//     function (materials) {
//         materials.preload(); // Preprocesar los materiales

//         // Ahora, usar OBJLoader para cargar el OBJ con los materiales aplicados
//         const objLoader = new OBJLoader(loadingManager);
//         objLoader.setMaterials(materials); // Aplicar los materiales cargados
//         objLoader.load(
//             'models/comedor/room.obj',  // Cambia esto por la ruta correcta a tu archivo .OBJ
//             function (object) {
//                 object.position.set(0, 0, 0); // Ajustar la posición si es necesario
//                 object.scale.set(0.5, 0.5, 0.5); // Ajusta la escala según lo necesites
//                 sceneTwo.add(object);
//             },
//             function (xhr) {
//                 console.log((xhr.loaded / xhr.total * 100) + '% cargado');
//             },
//             function (error) {
//                 console.error('Error al cargar el modelo OBJ', error);
//             }
//         );
//     },
//     function (xhr) {
//         console.log((xhr.loaded / xhr.total * 100) + '% cargado');
//     },
//     function (error) {
//         console.error('Error al cargar los materiales MTL', error);
//     }
// );

// Cargar el archivo FBX
const fbxLoader = new FBXLoader(loadingManager);
fbxLoader.load(
    'models/room/room_by_deline.fbx',  // Cambia esto por la ruta correcta a tu archivo .FBX
    function (object) {
        object.position.set(0, 0, 0);  // Ajustar la posición si es necesario
        object.scale.set(2, 2, 2);  // Ajustar la escala según lo necesites
        sceneTwo.add(object);  // Añadir el modelo a la escena

        // Si el modelo tiene animaciones, puedes acceder a ellas aquí
        if (object.animations && object.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(object);
            const action = mixer.clipAction(object.animations[0]);
            action.play();  // Iniciar la animación si es necesario
        }
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% cargado');
    },
    function (error) {
        console.error('Error al cargar el modelo FBX', error);
    }
);

// Variables para la transición
let currentScene = sceneOne;  // Inicialmente mostrar sceneOne
let currentCamera = cameraOne;
let transitionActive = false;
let transitionProgress = 0;

// Controles de la cámara
const controls = new OrbitControls(currentCamera, renderer.domElement);
controls.enableDamping = true;  // Suaviza el movimiento
controls.dampingFactor = 0.1;

// Función de easing para suavizar la transición
function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}


// MOUSE ACTION
let isMouseOverCube = false;

// Evento de mousemove para detectar la posición del mouse
function onMouseMove(event) {
    // Convertir las coordenadas del mouse a coordenadas normalizadas (-1 a 1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

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
    }
});


// Animación
function animate() {
    requestAnimationFrame(animate);

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

        // Rotación del cubo
        if (factor === 1) {
            const mousePos = new THREE.Vector3(mouse.x, mouse.y, 0).unproject(currentCamera);
            const direction = mousePos.sub(cube.position).normalize();

            const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
            cube.quaternion.slerp(targetQuaternion, 0.1);
        } else {
            cube.rotation.x = rotationAmplitudeX * Math.sin(Date.now() * rotationSpeedX);
            cube.rotation.y = rotationAmplitudeY * Math.sin(Date.now() * rotationSpeedY);
            cube.rotation.z = rotationAmplitudeZ * Math.sin(Date.now() * rotationSpeedZ);

            cube.rotation.x += (originalRotation.x - cube.rotation.x) * easingFactor;
            cube.rotation.y += (originalRotation.y - cube.rotation.y) * easingFactor;
            cube.rotation.z += (originalRotation.z - cube.rotation.z) * easingFactor;
        }

        // Rotación de la esfera
        sphere.rotation.y += 0.01;
    }

    // Si la transición está activa, ejecutar la animación de la transición
    if (transitionActive) {
        transitionProgress += 0.02; // Ajustar la velocidad de la transición

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

// Función para cargar la nueva escena
function loadNewScene() {
    // Cambiar la escena actual por sceneTwo si estamos en sceneOne
    if (currentScene === sceneOne) {
        currentScene = sceneTwo;
        switchCamera();
    } else {
        currentCamera = cameraOne;  // Inicialmente usamos camera1
        currentScene = sceneOne;
        switchCamera();
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