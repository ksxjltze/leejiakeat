
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
let renderer: any;
scene.add(cube);
camera.position.z = 5;

let surfaceContainer: HTMLElement;

const spinCube = () => {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
}

const animate = () => {
  requestAnimationFrame(animate);
  spinCube();
  renderer.render(scene, camera);
};

const resize = () => {
  if (surfaceContainer) {
    renderer.setSize(surfaceContainer.clientWidth, surfaceContainer.clientHeight)
    camera.aspect = surfaceContainer.clientWidth / surfaceContainer.clientHeight;
    camera.updateProjectionMatrix();
    return;
  }

  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
};

export const createSceneWithContainer = (surface: HTMLCanvasElement, container: HTMLElement) => {
  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: surface });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(surface.width, surface.height);

  surfaceContainer = container;

  resize();
  animate();
}

window.addEventListener('resize', resize);