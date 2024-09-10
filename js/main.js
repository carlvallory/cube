import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Escena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xfefefe);  // Fondo blanco

// Cámara
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Geometría del cubo
const cubeGeometry = new THREE.BoxGeometry(2.5, 2.5, 2.5);
const cubeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, // Color blanco
    opacity: 0.2, // Nivel de transparencia
    transparent: true, // Hacer el material translúcido
    roughness: 0.1, // Suavidad de la superficie
    metalness: 0.9, // Nivel de metalizado para reflejar la esfera
    reflectivity: 0.9, // Capacidad de reflejar
    clearcoat: 1, // Mejora los reflejos
    clearcoatRoughness: 0.1 // Rugosidad del recubrimiento
});
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);

// Crear una esfera azul dentro del cubo
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const texture = new THREE.TextureLoader().load( 'https://i.imgur.com/kFoWvzw.jpg' );
const sphereMaterial = new THREE.MeshBasicMaterial( { map: texture } );
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(0, 0, 0); // Posicionar la esfera en el centro del cubo
cube.add(sphere);

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

    // Oscilar la rotación del cubo
    cube.rotation.x = rotationAmplitudeX * Math.sin(Date.now() * rotationSpeedX);
    cube.rotation.y = rotationAmplitudeY * Math.sin(Date.now() * rotationSpeedY);
    cube.rotation.z = rotationAmplitudeZ * Math.sin(Date.now() * rotationSpeedZ);

    // Actualizar el raycaster con la posición del mouse
    raycaster.setFromCamera(mouse, camera);

    // Detectar la intersección con el cubo
    const intersects = raycaster.intersectObject(cube);

    // Calcular el factor de interpolación (0-1) para la transición
    let factor = intersects.length > 0 ? 1 : 0;

    // Aplicar easing para suavizar la transición
    factor = easeInOut(factor);

    // Ajustar la escala del cubo y la esfera
    const sphereScaleFactor = 0.95;
    targetScale.copy(factor === 1 ? hoverScale : originalScale);
    cube.scale.lerp(targetScale, 0.1); // Reducir la velocidad de interpolación para la escala
    sphere.scale.lerp(targetScale.clone().multiplyScalar(sphereScaleFactor), 0.1); // Aplicar la misma interpolación de escala a la esfera

    // Ajustar la rotación del cubo
    cube.rotation.x += (factor === 1 ? targetRotation.x - cube.rotation.x : originalRotation.x - cube.rotation.x) * easingFactor;
    cube.rotation.y += (factor === 1 ? targetRotation.y - cube.rotation.y : originalRotation.y - cube.rotation.y) * easingFactor;
    cube.rotation.z += (factor === 1 ? targetRotation.z - cube.rotation.z : originalRotation.z - cube.rotation.z) * easingFactor;

    //World rotation
    //sphere.rotation.x += 0.01;
    sphere.rotation.y += 0.01;

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
