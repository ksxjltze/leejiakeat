
import * as THREE from 'three';

export class Scene {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  readonly geometry = new THREE.BoxGeometry();
  readonly material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  readonly cube = new THREE.Mesh(this.geometry, this.material);

  renderer: any;
  surfaceContainer: HTMLElement;
  
  constructor() {
    this.scene.add(this.cube);
    this.camera.position.z = 5;
    
    window.addEventListener('resize', this.resize);
  }

  private spinCube() {
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;
  }
  
  private animate() {
    requestAnimationFrame(this.animate);
    this.spinCube();
    this.renderer.render(this.scene, this.camera);
  };
  
  private resize() {
    if (this.surfaceContainer) {
      this.renderer.setSize(this.surfaceContainer.clientWidth, this.surfaceContainer.clientHeight)
      this.camera.aspect = this.surfaceContainer.clientWidth / this.surfaceContainer.clientHeight;
      this.camera.updateProjectionMatrix();
      return;
    }
  
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  };

  createSceneWithContainer(surface: HTMLCanvasElement, container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: surface });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(surface.width, surface.height);
  
    this.surfaceContainer = container;
  
    this.resize();
    this.animate();
  }

}