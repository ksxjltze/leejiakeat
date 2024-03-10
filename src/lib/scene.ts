import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

import * as CANNON from 'cannon-es';
import CannonUtils from './utils/cannonUtils';
import CannonDebugRenderer from './utils/cannonDebugRenderer';

const boxGeom = new THREE.BoxGeometry();
const sphereGeom = new THREE.SphereGeometry();
const standardMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
const clock = new THREE.Clock();
const modelLoader = new GLTFLoader();

const FORWARD = new THREE.Vector3(0, 0, -1);
const RIGHT = new THREE.Vector3(1, 0, 0);

let renderer;
let scene;
let camera;
let controls;
let surfaceContainer: HTMLElement;
let initialized = false;

let mixer;

let world;
let cannonDebugRenderer;
let floorMesh;

let selectedObject = undefined;
let isSelected = false;

const player = {
	velocity: new THREE.Vector3(0, 0, 0),
	grounded: true,

	moveSpeed: 12,
	jumpAmount: 4,
	body: undefined
};

let ground;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(0, 0);

let keys = [];
let physicsObjects = [];

interface PhysicsObject {
	mesh: THREE.Mesh,
	body: CANNON.Body
};

function createPhysicsObject(mesh: THREE.Mesh, body: CANNON.Body) {
	const object: PhysicsObject = {
		mesh: mesh,
		body: body
	};

	physicsObjects.push(object);
	return object;
}

function createPhysicsObjectFromMesh(mesh: THREE.Mesh, shape: CANNON.Shape, mass: number) {
	const body = new CANNON.Body({
		mass: mass,
		position: new CANNON.Vec3(mesh.position.x, mesh.position.y, mesh.position.z),
		quaternion: new CANNON.Quaternion(mesh.quaternion.x, mesh.quaternion.y, mesh.quaternion.z, mesh.quaternion.w),
	});
	body.addShape(shape);
	return createPhysicsObject(mesh, body);
}

function onPointerMove(event) {

}

const animate = () => {
	const dt = clock.getDelta();
	if (!renderer || !camera || !scene) return;

	requestAnimationFrame(animate);
	updatePhysics(dt);
	updateController(keys, dt);
	updateAnimations(dt);

	render();

	if (!cannonDebugRenderer)
		return;

	cannonDebugRenderer.update();
};

const updateAnimations = (dt) => {
	if (!mixer)
		return;

	mixer.update(dt);
}

const render = () => {
	raycaster.setFromCamera(pointer, camera);

	//lazy highlighting
	// calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects(scene.children);
	if (selectedObject) {
		const intersected = raycaster.intersectObject(selectedObject)

		if (intersected.length == 0) {
			isSelected = false;
			selectedObject.material.emissive.setHex(0);
		}
	}

	for (let i = 0; i < intersects.length; i++) {
		const object: any = intersects[i].object;

		if (object.name != "Interactable")
			continue;

		selectedObject = object;
		isSelected = true;

		if (object.material) {
			object.material.emissive.setHex(0x3355ff);
		}
	}

	renderer.render(scene, camera);
}

const updateController = (keys: any[], dt: number) => {
	updatePlayerController(keys, dt);

	if (!isSelected || !selectedObject)
		return;

	//temp interact
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		switch (key) {
			case 'f':
				selectedObject.rotation.z -= 2 * dt;
		}
	}
}

const updatePlayerController = (keys: any[], dt: number) => {
	const body: CANNON.Body = player.body;

	//scuffed but works
	const cameraForward = FORWARD.clone().applyEuler(camera.rotation);
	const cameraRight = RIGHT.clone().applyEuler(camera.rotation);

	const forward = new CANNON.Vec3(cameraForward.x, 0, cameraForward.z); //let's just remove y movement for now
	const right = new CANNON.Vec3(cameraRight.x, cameraRight.y, cameraRight.z);

	forward.normalize();
	right.normalize();

	const left = right.negate();
	const backwards = forward.negate();

	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];

		switch (key) {
			case 'w':
				body.position = body.position.addScaledVector(player.moveSpeed * dt, forward);
				break;
			case 'a':
				body.position = body.position.addScaledVector(player.moveSpeed * dt, left);
				break;
			case 's':
				body.position = body.position.addScaledVector(player.moveSpeed * dt, backwards);
				break;
			case 'd':
				body.position = body.position.addScaledVector(player.moveSpeed * dt, right);
				break;
			case ' ': //jump
				if (player.grounded) { //scuffed
					body.velocity.y += player.jumpAmount;
					player.grounded = false;
				}
				break;
		}
	}

};

function updatePhysics(dt) {
	// Step the physics world
	world.step(dt);

	physicsObjects.forEach((object: PhysicsObject) => {
		if (object.body.mass == 0)
			return;

		object.mesh.position.copy(object.body.position);
		object.mesh.quaternion.copy(object.body.quaternion);
	});

	if (!player.body)
		return;

	//temp
	camera.position.copy(player.body.position);
	// player.body.quaternion.copy(camera.quaternion);
}

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

const setupPhysics = () => {
	const world = new CANNON.World();
	world.gravity.set(0, -9.82, 0); // m/s²

	//temp
	var upVector = new CANNON.Vec3(0, 1, 0);
	var contactNormal = new CANNON.Vec3(0, 0, 0);

	world.addEventListener('postStep', function () {
		// Get all contact pairs in the world
		const contacts = world.contacts;

		if (player.grounded)
			return;

		// Check if the dynamic body is in contact with the ground plane
		contacts.forEach(function (contact) {
			if (contact.bi === player.body) {
				//copy pasta
				if (contact.bi == player.body) {
					contact.ni.negate(contactNormal);
				} else {
					contact.ni.copy(contactNormal);
				}

				player.grounded = contactNormal.dot(upVector) > 0.5;
			}
		});
	});

	return world;
}

const createInteractableTexturePlane = (width, height, texture) => {
	const planeGeometry = new THREE.PlaneGeometry(width, height);
	const planeMaterial = new THREE.MeshStandardMaterial({ map: texture });
	const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
	planeMesh.name = "Interactable";

	return planeMesh;
}

//TODO: rework
const createGround = (length, wallThickness) => {
	const floorGeometry = new THREE.PlaneGeometry(length, length);
	const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xAAAAAA });
	const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);

	//??? why do I need to do this
	floorGeometry.translate(0, 0, length / 4);
	floorMesh.lookAt(new THREE.Vector3(0, 1, 0));
	floorMesh.position.y -= length / 4 - wallThickness / 2;
	floorMesh.position.x -= length;
	floorMesh.scale.set(1.025, 1.025, 1.0);

	return floorMesh;
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

	const iconoclasmLogoTexture = new THREE.TextureLoader().load("/images/iconoclasm/iconoclasm-logo.jpg");
	const iconoclasmBanner = createInteractableTexturePlane(wallLength, wallHeight, iconoclasmLogoTexture);
	iconoclasmBanner.position.set(0, wallHeight / 2, wallLength / 2 - wallThickness);
	iconoclasmBanner.scale.set(0.75, 0.8, 1.0);
	iconoclasmBanner.rotation.y = Math.PI;
	room.add(iconoclasmBanner);

	const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
	backWall.position.set(0, wallHeight / 2, -wallLength / 2);
	room.add(backWall);

	const stronkBoiTexture = new THREE.TextureLoader().load("/images/stronk.jpg");
	const stronkBoiPlane = createInteractableTexturePlane(wallLength, wallHeight, stronkBoiTexture);
	stronkBoiPlane.position.set(0, wallHeight / 2, -wallLength / 2 + wallThickness);
	stronkBoiPlane.scale.set(0.75, 0.8, 1.0);
	room.add(stronkBoiPlane);

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
	leftWallTop.position.set(-wallLength / 2, 7 / 8 * wallHeight, 0);
	leftWallTop.rotation.y = Math.PI / 2;
	leftWallTop.scale.set(0.34, 1 / 4, 1.0);
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
	rightWallTop.position.set(wallLength / 2, 7 / 8 * wallHeight, 0);
	rightWallTop.rotation.y = -Math.PI / 2;
	rightWallTop.scale.set(0.34, 1 / 4, 1.0);
	room.add(rightWallTop);

	// Create floor
	const floorGeometry = new THREE.PlaneGeometry(wallLength, wallLength);
	const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xAAAAAA });
	floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
	floorMesh.rotation.x = -Math.PI / 2;
	floorMesh.position.y = wallThickness / 2;
	floorMesh.scale.set(1.025, 1.025, 1.0);
	room.add(floorMesh);

	//scuffed
	const floorObject = createPhysicsObjectFromMesh(createGround(wallLength, wallThickness), new CANNON.Plane(), 0);
	ground = floorObject.body;
	world.addBody(floorObject.body);
	room.add(floorObject.mesh);

	//ball
	const ballMaterial = new CANNON.Material();
	const defaultMaterial = new CANNON.Material();
	const ballGroundContactMaterial = new CANNON.ContactMaterial(ballMaterial, defaultMaterial, {
		friction: 0.5, // Adjust friction as needed
		restitution: 0.2 // Adjust restitution (bounciness) as needed
	});
	world.addContactMaterial(ballGroundContactMaterial);

	const ballRadius = 0.5;
	const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
	const ballMeshMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
	const ballMesh = new THREE.Mesh(ballGeometry, ballMeshMaterial);

	ballMesh.position.copy(floorObject.mesh.position);
	ballMesh.position.y = 1;

	const ballObject = createPhysicsObjectFromMesh(ballMesh, new CANNON.Sphere(ballRadius), 0.2);
	// ballObject.body.material = ballMaterial;
	scene.add(ballMesh);
	world.addBody(ballObject.body);

	const floorGeometry3 = new THREE.PlaneGeometry(wallLength, wallLength);
	const floorMaterial3 = new THREE.MeshStandardMaterial({ color: 0xAAAAAA });
	const floorMesh3 = new THREE.Mesh(floorGeometry3, floorMaterial3);
	floorMesh3.rotation.x = -Math.PI / 2;
	floorMesh3.position.y = wallThickness / 2;
	floorMesh3.position.x += wallLength;
	floorMesh3.scale.set(1.025, 1.025, 1.0);
	room.add(floorMesh3);

	const skylightGeometry = new THREE.PlaneGeometry(wallLength, wallLength);
	const skylightMaterial = new THREE.MeshStandardMaterial({ color: 0xAAAAAA, transparent: true, opacity: 0.8 });
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

	//physics
	world = setupPhysics();

	//player physics settings
	player.body = new CANNON.Body({ mass: 60 });
	player.body.addShape(new CANNON.Sphere(3.5));
	player.body.angularFactor = new CANNON.Vec3(0, 1, 0);
	// player.body.addShape(new CANNON.Box(new CANNON.Vec3(2, 3, 2)));
	world.addBody(player.body);

	let lobby = constructLobbyRoom();
	lobby.position.setY(lobby.position.y - 5);
	scene.add(lobby);

	// cannonDebugRenderer = new CannonDebugRenderer(scene, world);
	modelLoader.load('/models/boi2.glb', (gltf) => {
		console.log("Added model: ", gltf);
		gltf.scene.position.set(-20, 2.5, -8);
		gltf.scene.rotation.set(0, 0.75 * Math.PI, 0);
		gltf.scene.scale.set(0.5, 0.5, 0.5);

		scene.add(gltf.scene);
	},
		undefined,
		(err) => {
			console.error(err);
		});

	modelLoader.load('/models/boi2skinned.glb', (gltf) => {
		console.log("Testing skinned model: ", gltf);
		gltf.scene.position.set(-20, 2.5, 8);
		gltf.scene.rotation.set(0, 1.25 * Math.PI, 0);
		gltf.scene.scale.set(0.5, 0.5, 0.5);
		scene.add(gltf.scene);

		mixer = new THREE.AnimationMixer(gltf.scene);
		console.log(mixer);
		console.log(gltf.animations);

		const clips = gltf.animations;

		// Play a specific animation
		const clip = THREE.AnimationClip.findByName(clips, "SkinnedBoiAction.001");
		const action = mixer.clipAction(clip);
		action.play();
	},
		undefined,
		(err) => {
			console.error(err);
		});

	modelLoader.load('/models/table.glb', (gltf) => {
		console.log("Added model: ", gltf);
		gltf.scene.position.set(20, -4, -5);

		const light = new THREE.PointLight(0xffffff, 10, 0, 1);
		const light2 = new THREE.PointLight(0xffffff, 30, 0, 1);
		light.position.set(gltf.scene.position.x, gltf.scene.position.y, gltf.scene.position.z);
		light2.position.set(gltf.scene.position.x, gltf.scene.position.y + 5, gltf.scene.position.z);

		const mesh = gltf.scene.children[0] as THREE.Mesh;
		mesh.geometry.scale(2, 2, 2);
		const shape = CannonUtils.CreateTrimesh(mesh.geometry);
		const body = new CANNON.Body({
			mass: 0
		})
		body.addShape(shape);
		body.position = new CANNON.Vec3(gltf.scene.position.x, gltf.scene.position.y, gltf.scene.position.z);
		world.addBody(body);

		scene.add(light2);
		scene.add(light);
		scene.add(gltf.scene);
	},
		undefined,
		(err) => {
			console.error(err);
		});

	modelLoader.load('/models/table2.glb', (gltf) => {
		console.log("Added model: ", gltf);
		gltf.scene.position.set(20, -4, 5);
		gltf.scene.scale.set(2, 2, 2);

		const light = new THREE.PointLight(0xffffff, 10, 0, 1);
		const light2 = new THREE.PointLight(0xffffff, 30, 0, 1);
		light.position.set(gltf.scene.position.x, gltf.scene.position.y, gltf.scene.position.z);
		light2.position.set(gltf.scene.position.x, gltf.scene.position.y + 5, gltf.scene.position.z);

		scene.add(light);
		scene.add(light2);
		scene.add(gltf.scene);
	},
		undefined,
		(err) => {
			console.error(err);
		});

	//scene setup
	const sphere = new THREE.Mesh(sphereGeom, standardMat)
	sphere.position.z = -30;
	sphere.scale.setScalar(5);

	scene.add(sphere);
	camera.position.z = 0;
	camera.rotation.y = Math.PI;

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
		const geometry = new TextGeometry('Press F to interact!', {
			font: font,
			size: 0.5,
			height: 0.1,
			curveSegments: 8,
			bevelEnabled: false,
			bevelThickness: 0.125,
			bevelSize: 0.025,
			bevelOffset: 0,
			bevelSegments: 1,
		});
		geometry.center();

		const material = new THREE.MeshBasicMaterial();
		material.color = new THREE.Color(0, 0, 0);
		const text = new THREE.Mesh(geometry, material);
		text.position.z = -8;
		scene.add(text);
	});

	window.addEventListener('resize', resize);
	window.addEventListener('pointermove', onPointerMove);
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

	keys = [];
};
