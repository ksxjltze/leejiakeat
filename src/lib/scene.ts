import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const cube = new THREE.Mesh(geometry, material);
const clock = new THREE.Clock();

let renderer;
let scene;
let camera;
let controls;
let surfaceContainer: HTMLElement;
let initialized = false;

let keys = [];
const moveSpeed = 15;

const spinCube = () => {
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
};

const animate = () => {
	const dt = clock.getDelta();
	if (!renderer || !camera || !scene) return;

	requestAnimationFrame(animate);
	spinCube();

	moveWASD(keys, dt);

	renderer.render(scene, camera);
};

const moveWASD = (keys, dt: number) => {
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		switch (key) {
			case 'w':
				controls.moveForward(moveSpeed * dt);
				break;
			case 'a':
				controls.moveRight(-moveSpeed * dt);
				break;
			case 's':
				controls.moveForward(-moveSpeed * dt);
				break;
			case 'd':
				controls.moveRight(moveSpeed * dt);
				break;
			case ' ':
				camera.position.y += moveSpeed * dt;
				break;
			case 'shift':
				camera.position.y -= moveSpeed * dt;
				break;
		}
	}
};

export const resize = () => {
	if (!renderer || !camera || !window) return;

	if (document.fullscreenElement) {
		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		return;
	}

	if (surfaceContainer) {
		renderer.setSize(surfaceContainer.clientWidth, surfaceContainer.clientHeight);
		camera.aspect = surfaceContainer.clientWidth / surfaceContainer.clientHeight;
		camera.updateProjectionMatrix();
	}
};

const loadSkyboxTextures = () => {
	const ft = new THREE.TextureLoader().load("./images/skybox/purple-nebula_front5.png");
	const bk = new THREE.TextureLoader().load("./images/skybox/purple-nebula_back6.png");
	const up = new THREE.TextureLoader().load("./images/skybox/purple-nebula_top3.png");
	const dn = new THREE.TextureLoader().load("./images/skybox/purple-nebula_bottom4.png");
	const rt = new THREE.TextureLoader().load("./images/skybox/purple-nebula_right1.png");
	const lf = new THREE.TextureLoader().load("./images/skybox/purple-nebula_left2.png");
	
	return [rt, lf, up, dn, ft, bk];
}

const loadSkybox = () => {
	const textures = loadSkyboxTextures();
	const materialArray = textures.map((texture) => new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide }));

	const skyboxGeom = new THREE.BoxGeometry(10000, 10000, 10000);
	const skybox = new THREE.Mesh(skyboxGeom, materialArray);
	return skybox;
}

const init = () => {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10001);

	//scene setup
	cube.position.z = -20;
	cube.scale.setScalar(10);

	scene.add(cube);
	camera.position.z = 0;

	//skybox
    scene.add(loadSkybox());

	//make a room
	const roomSize = 60;
	const roomGeometry = new THREE.BoxGeometry(roomSize, roomSize, roomSize);
	const roomMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, side: THREE.BackSide });
	const room = new THREE.Mesh(roomGeometry, roomMaterial);
	// scene.add(room);

	//add lighting
	const light = new THREE.PointLight(0xffffff, 100, 0, 2);
	light.position.set(0, 0, 0);
	scene.add(light);

	//global light
	const globalLight = new THREE.AmbientLight(0xffffff, 1);
	scene.add(globalLight);

	//ceiling light
	const ceilingLight = new THREE.PointLight(0xffffff, 100, 0, 0.25);
	ceilingLight.position.set(0, 20, 0);
	scene.add(ceilingLight);

	const loader = new FontLoader();
	loader.load('fonts/helvetiker_regular.typeface.json', function (font) {
		const geometry = new TextGeometry('Hello World!', {
			font: font,
			size: 1,
			height: 0.25,
			curveSegments: 8,
			bevelEnabled: false,
			bevelThickness: 0.125,
			bevelSize: 0.025,
			bevelOffset: 0,
			bevelSegments: 1
		});
		geometry.center();

		const material = new THREE.MeshBasicMaterial();
		const text = new THREE.Mesh(geometry, material);
		text.position.z = -10;
		scene.add(text);
	});

	window.addEventListener('resize', resize);
};

export const createSceneWithContainer = (surface: HTMLCanvasElement, container: HTMLElement) => {
	init();

	renderer = new THREE.WebGLRenderer({ antialias: true, canvas: surface });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(surface.width, surface.height);

	surfaceContainer = container;

	//add controls
	controls = new PointerLockControls(camera, surface);
	controls.pointerSpeed = 0.8;

	//wasd
	const onKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    if (!keys.includes(key)) {
      keys.push(key);
    }
	};
	const onKeyUp = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    if (keys.includes(key)) {
      keys = keys.filter((k) => k !== key);
    }
	};
	document.addEventListener('keydown', onKeyDown);
	document.addEventListener('keyup', onKeyUp);

	resize();

	if (initialized)
		return;
	initialized = true;

	animate();
};

export const lockControls = () => {
	if (!controls) return;
	controls.lock();
};
