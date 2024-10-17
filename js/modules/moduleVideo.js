// video.js
import * as THREE from 'three';

function setupVideo() {
    const video = document.createElement('video');
    video.muted = true;

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.wrapS = THREE.ClampToEdgeWrapping;
    videoTexture.wrapT = THREE.ClampToEdgeWrapping;
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBFormat;

    return { video, videoTexture };
}

function loadVideo(video, videoSrc) {
    video.src = videoSrc;
    video.load();
    video.play();
}

export { setupVideo, loadVideo };