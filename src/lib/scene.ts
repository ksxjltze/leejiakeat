import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

const boxGeom = new THREE.BoxGeometry();
const sphereGeom = new THREE.SphereGeometry();
const standardMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
const clock = new THREE.Clock();
const modelLoader = new GLTFLoader();

let renderer;
let scene;
let camera;
let controls;
let surfaceContainer: HTMLElement;
let initialized = false;

let keys = [];
const moveSpeed = 15;

const animate = () => {
	const dt = clock.getDelta();
	if (!renderer || !camera || !scene) return;

	requestAnimationFrame(animate);
	updateController(keys, dt);

	renderer.render(scene, camera);
};

const updateController = (keys: any[], dt: number) => {
	moveWASD(keys, dt);
}

const moveWASD = (keys: any[], dt: number) => {
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
	const ft = new THREE.TextureLoader().load("/images/skybox/purple-nebula_front5.png");
	const bk = new THREE.TextureLoader().load("/images/skybox/purple-nebula_back6.png");
	const up = new THREE.TextureLoader().load("/images/skybox/purple-nebula_top3.png");
	const dn = new THREE.TextureLoader().load("/images/skybox/purple-nebula_bottom4.png");
	const rt = new THREE.TextureLoader().load("/images/skybox/purple-nebula_right1.png");
	const lf = new THREE.TextureLoader().load("/images/skybox/purple-nebula_left2.png");
	
	return [rt, lf, up, dn, ft, bk];
}

const loadSkybox = () => {
	const textures = loadSkyboxTextures();
	const materialArray = textures.map((texture) => new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide }));

	const skyboxGeom = new THREE.BoxGeometry(10000, 10000, 10000);
	const skybox = new THREE.Mesh(skyboxGeom, materialArray);
	return skybox;
}

const constructLobbyRoom = () => {
	const room = new THREE.Group();

	// Create walls
	const wallHeight = 10;
	const wallThickness = 0.5;
	const wallLength = 20;

	const wallGeometry = new THREE.BoxGeometry(wallLength, wallHeight, wallThickness);
	const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xCCCCCC });

	const frontWall = new THREE.Mesh(wallGeometry, wallMaterial);
	frontWall.position.set(0, wallHeight / 2, wallLength / 2);
	room.add(frontWall);

	const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
	backWall.position.set(0, wallHeight / 2, -wallLength / 2);
	room.add(backWall);

	const texture = new THREE.TextureLoader().load("/images/stronk.jpg");
	const planeGeometry = new THREE.PlaneGeometry(wallLength, wallHeight);
	const planeMaterial = new THREE.MeshStandardMaterial({ map: texture });
	const plane = new THREE.Mesh(planeGeometry, planeMaterial);
	plane.position.set(0, wallHeight / 2, -wallLength / 2 + wallThickness);
	plane.scale.set(0.8, 0.8, 1.0);
	room.add(plane);

	const leftWallLeft = new THREE.Mesh(wallGeometry, wallMaterial);
	leftWallLeft.position.set(-wallLength / 2, wallHeight / 2, -wallLength / 3);
	leftWallLeft.rotation.y = Math.PI / 2;
	leftWallLeft.scale.set(0.333, 1.0, 1.0);
	room.add(leftWallLeft);

	const leftWallRight = new THREE.Mesh(wallGeometry, wallMaterial);
	leftWallRight.position.set(-wallLength / 2, wallHeight / 2, wallLength / 3);
	leftWallRight.rotation.y = Math.PI / 2;
	leftWallRight.scale.set(0.333, 1.0, 1.0);
	room.add(leftWallRight);

	const leftWallTop = new THREE.Mesh(wallGeometry, wallMaterial);
	leftWallTop.position.set(-wallLength / 2, 7/8 * wallHeight, 0);
	leftWallTop.rotation.y = Math.PI / 2;
	leftWallTop.scale.set(0.34, 1/4, 1.0);
	room.add(leftWallTop);

	const rightWallLeft = new THREE.Mesh(wallGeometry, wallMaterial);
	rightWallLeft.position.set(wallLength / 2, wallHeight / 2, -wallLength / 3);
	rightWallLeft.rotation.y = -Math.PI / 2;
	rightWallLeft.scale.set(0.333, 1.0, 1.0);
	room.add(rightWallLeft);

	const rightWallRight = new THREE.Mesh(wallGeometry, wallMaterial);
	rightWallRight.position.set(wallLength / 2, wallHeight / 2, wallLength / 3);
	rightWallRight.rotation.y = -Math.PI / 2;
	rightWallRight.scale.set(0.333, 1.0, 1.0);
	room.add(rightWallRight);

	const rightWallTop = new THREE.Mesh(wallGeometry, wallMaterial);
	rightWallTop.position.set(wallLength / 2, 7/8 * wallHeight, 0);
	rightWallTop.rotation.y = -Math.PI / 2;
	rightWallTop.scale.set(0.34, 1/4, 1.0);
	room.add(rightWallTop);

	// Create floor
	const floorGeometry = new THREE.PlaneGeometry(wallLength, wallLength);
	const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xAAAAAA });
	const floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.rotation.x = -Math.PI / 2;
	floor.position.y = wallThickness / 2;
	floor.scale.set(1.025, 1.025, 1.0);
	room.add(floor);

	const skylightGeometry = new THREE.PlaneGeometry(wallLength, wallLength);
	const skylightMaterial = new THREE.MeshStandardMaterial({ color: 0xAAAAAA, transparent: true, opacity: 0.5 });
	const skylight = new THREE.Mesh(skylightGeometry, skylightMaterial);
	skylight.rotation.x = Math.PI / 2;
	skylight.position.y = wallHeight;
	skylight.scale.set(0.8, 0.8, 1.0);
	room.add(skylight);

	const fakeLightGeometry = new THREE.PlaneGeometry(wallLength, wallLength);
	const fakeLightMaterial = new THREE.MeshStandardMaterial({ color: 0xCCCCCC });
	const fakeLight = new THREE.Mesh(fakeLightGeometry, fakeLightMaterial);
	fakeLight.rotation.x = Math.PI / 2;
	fakeLight.position.y = wallHeight - 0.1;
	fakeLight.scale.set(0.2, 0.2, 1.0);
	room.add(fakeLight);

	const ceilingGeometry = new THREE.PlaneGeometry(wallLength, wallLength);
	const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0xCCCCCC });

	const ceilingLeft = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
	ceilingLeft.rotation.x = Math.PI / 2;
	ceilingLeft.position.y = wallHeight;
	ceilingLeft.position.x = 0.9 * -wallHeight;
	ceilingLeft.scale.set(0.1, 1.0, 1.0);
	room.add(ceilingLeft);

	const ceilingRight = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
	ceilingRight.rotation.x = Math.PI / 2;
	ceilingRight.position.y = wallHeight;
	ceilingRight.position.x = 0.9 * wallHeight;
	ceilingRight.scale.set(0.1, 1.0, 1.0);
	room.add(ceilingRight);

	const ceilingFront = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
	ceilingFront.rotation.x = Math.PI / 2;
	ceilingFront.rotation.z = Math.PI / 2;
	ceilingFront.position.y = wallHeight;
	ceilingFront.position.z = 0.9 * wallLength / 2;
	ceilingFront.scale.set(0.1, 1.0, 1.0);
	room.add(ceilingFront);

	const ceilingBack = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
	ceilingBack.rotation.x = Math.PI / 2;
	ceilingBack.rotation.z = Math.PI / 2;
	ceilingBack.position.y = wallHeight;
	ceilingBack.position.z = 0.9 * -wallLength / 2;
	ceilingBack.scale.set(0.1, 1.0, 1.0);
	room.add(ceilingBack);

	return room;
};

const init = () => {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10001);

	let lobby = constructLobbyRoom();
	lobby.position.setY(lobby.position.y - 5);
	scene.add(lobby);

	// modelLoader.load('/models/room.glb', (gltf ) => {
	// 	console.log("Added model: ", gltf);
	// 	gltf.scene.position.set(0, -5, 0);
	// 	gltf.scene.rotation.set(0, Math.PI, 0);
	// 	scene.add(gltf.scene);
	// },
	// undefined,
	// (err) => {
	// 	console.error(err);
	// });

	//scene setup
	const sphere = new THREE.Mesh(sphereGeom, standardMat)
	sphere.position.z = -30;
	sphere.scale.setScalar(5);

	scene.add(sphere);
	camera.position.z = 0;

	//skybox
    scene.add(loadSkybox());

	//add lighting
	const light = new THREE.PointLight(0xffffff, 30, 0, 1);
	const lightPosition = new THREE.Vector3(0, 3.75, 0);
	light.position.set(lightPosition.x, lightPosition.y, lightPosition.z);

	const lightMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
	lightMaterial.emissive = new THREE.Color(0xffffff);

	const lightMesh = new THREE.Mesh(boxGeom, lightMaterial);
	lightMesh.scale.y = 2;
	lightMesh.position.set(lightPosition.x, lightPosition.y, lightPosition.z);
	
	scene.add(light);
	// scene.add(lightMesh);

	//global light
	// const globalLight = new THREE.AmbientLight(0xffffff, 1);
	// scene.add(globalLight);

	const fontLoader = new FontLoader();
	fontLoader.load('/fonts/helvetiker_regular.typeface.json', function (font) {
		const geometry = new TextGeometry('Hello!', {
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
		text.position.z = -25;
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
