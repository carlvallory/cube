import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Escena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xfefefe);  // Fondo blanco

// Cámara
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;

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
scene.add(cube);

// Crear una esfera azul dentro del cubo
const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
const sphereTexture = new THREE.TextureLoader().load( 'https://i.imgur.com/kFoWvzw.jpg' );
const sphereMaterial = new THREE.MeshBasicMaterial( { map: sphereTexture } );
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(0, 0, 0); // Posicionar la esfera en el centro del cubo
cube.add(sphere);

// Cargar la fuente
const loader = new FontLoader();
loader.load('fonts/roboto/Roboto_Regular.typeface.json', function (font) {

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
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // Posicionar el texto en la cara frontal del cubo
    textMesh.position.set(-0.4, -0.5, 2);  // Ajusta las coordenadas según el tamaño del cubo
    cube.add(textMesh);
});

// const wallGeometry = new THREE.BoxGeometry(10,5,1);
// const wallTexture = new THREE.TextureLoader().load( 'https://i.imgur.com/onN1zfo.jpeg' );
// const wallMaterial = new THREE.MeshBasicMaterial( { map: wallTexture } );
// const wall = new THREE.Mesh(wallGeometry, wallMaterial);
// wall.position.set(0, 0, 10); // Posicionar la esfera en el centro del cubo
// scene.add(wall);


// Iluminación
const ambientLight = new THREE.AmbientLight(0xfefefe, 0.5);  // Luz ambiental
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xfefefe, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Controles de la cámara
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;  // Suaviza el movimiento
controls.dampingFactor = 0.1;

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

// Función de easing para suavizar la transición
function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

let isMouseOverCube = false;

// Evento de mousemove para detectar la posición del mouse
function onMouseMove(event) {
    // Convertir las coordenadas del mouse a coordenadas normalizadas (-1 a 1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Agregar el evento de mousemove
window.addEventListener('mousemove', onMouseMove, false);

// Animación
function animate() {
    requestAnimationFrame(animate);

    // Actualizar la cámara cúbica para las reflexiones dinámicas
    //cube.visible = false;  // Oculta temporalmente el cubo para evitar reflejarse a sí mismo
    cubeCamera.update(renderer, scene);  // Actualiza el entorno de reflexión
    //cube.visible = true;

    // Actualizar el raycaster con la posición del mouse
    raycaster.setFromCamera(mouse, camera);

    // Detectar la intersección con el cubo
    const intersects = raycaster.intersectObject(cube);

    // Calcular el factor de interpolación (0-1) para la transición
    let factor = intersects.length > 0 ? 1 : 0;

    // Aplicar easing para suavizar la transición
    factor = easeInOut(factor);

    // Ajustar la escala del cubo y la esfera
    const sphereScaleFactor = 0.9;
    targetScale.copy(factor === 1 ? hoverScale : originalScale);
    cube.scale.lerp(targetScale, 0.1); // Reducir la velocidad de interpolación para la escala
    sphere.scale.lerp(targetScale.clone().multiplyScalar(sphereScaleFactor), 0.1); // Aplicar la misma interpolación de escala a la esfera

    // Si el mouse está sobre el cubo, hacer que el cubo siga el mouse
    if (factor === 1) {
        const mousePos = new THREE.Vector3(mouse.x, mouse.y, 0).unproject(camera);
        const direction = mousePos.sub(cube.position).normalize();

        // Rotar el cubo para que la cara frontal siga el mouse
        const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
        cube.quaternion.slerp(targetQuaternion, 0.1); // Suavizar la rotación
    } else {
        // Oscilar la rotación del cubo si el mouse no está sobre él
        cube.rotation.x = rotationAmplitudeX * Math.sin(Date.now() * rotationSpeedX);
        cube.rotation.y = rotationAmplitudeY * Math.sin(Date.now() * rotationSpeedY);
        cube.rotation.z = rotationAmplitudeZ * Math.sin(Date.now() * rotationSpeedZ);

        // Ajustar la rotación del cubo hacia su rotación original si no hay interacción
        cube.rotation.x += (originalRotation.x - cube.rotation.x) * easingFactor;
        cube.rotation.y += (originalRotation.y - cube.rotation.y) * easingFactor;
        cube.rotation.z += (originalRotation.z - cube.rotation.z) * easingFactor;
    }

    // Rotación del mundo (esfera)
    sphere.rotation.y += 0.01;

    // Actualizar los controles y renderizar la escena
    controls.update();
    renderer.render(scene, camera);
}

// Iniciar la animación
animate();

// Ajuste de la ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
