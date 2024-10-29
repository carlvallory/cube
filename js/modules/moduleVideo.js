// video.js
import * as THREE from 'three';

function createVideoElement(src) {
    const video = document.createElement('video');
    video.src = src;
    video.load();
    video.muted = true;
    video.play();

    return video;
}

function createVideoMaterial(videoElement) {
    const videoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.wrapS = THREE.ClampToEdgeWrapping;
    videoTexture.wrapT = THREE.ClampToEdgeWrapping;
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBFormat;

    return new THREE.MeshBasicMaterial({
        map: videoTexture,
        side: THREE.DoubleSide
    });
}

function loadVideo(video, src) {
    video.src = src;
    video.load();
    video.play();
}

export { createVideoElement, createVideoMaterial, loadVideo };