
import * as THREE from 'three';

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);

let renderer;
let scene;
let camera;
let surfaceContainer: HTMLElement;

const spinCube = () => {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
}

const animate = () => {
  if (!renderer || !camera || !scene)
    return;

  requestAnimationFrame(animate);
  spinCube();
  renderer.render(scene, camera);
};

const resize = () => {
  if (!renderer || !camera || !window)
    return;

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


const init = () => {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  scene.add(cube);
  camera.position.z = 5;

  window.addEventListener('resize', resize);
}

export const createSceneWithContainer = (surface: HTMLCanvasElement, container: HTMLElement) => {
  init();
  
  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: surface });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(surface.width, surface.height);

  surfaceContainer = container;

  resize();
  animate();
}