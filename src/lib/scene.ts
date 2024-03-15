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
let ground;

let boi: THREE.Object3D;
let boiState;
const BoiState = {
	NONE: 0,
	WALK1: 1,
	WALK2: 2
} as const;

const settings = {
	debugDraw: false
};

let selectedObject = undefined;
let isSelected = false;

const player = {
	velocity: new THREE.Vector3(0, 0, 0),
	grounded: true,

	moveSpeed: 12,
	jumpAmount: 4,
	body: undefined
};

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(0, 0);

let keys = [];
let keysTriggered = {};
let physicsObjects = [];

interface PhysicsObject {
	mesh: THREE.Mesh,
	body: CANNON.Body
};

function ToCannonVec3(vector) {
	return new CANNON.Vec3(vector.x, vector.y, vector.z);
}

function ToCannonVec3Scaled(vector, scale) {
	return new CANNON.Vec3(vector.x * scale, vector.y * scale, vector.z * scale);
}


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

const update = (dt) => {
	if (!boiState) //TODO: stuff
		boiState = BoiState.WALK1;

	const boiSpeed = 5;
	const boundsLength = 20;

	if (!boi)
		return;

	switch (boiState) {
		case 1:
			boi.position.x += boiSpeed * dt;
			if (boi.position.x > boundsLength) {
				boiState = BoiState.WALK2;
				boi.rotateY(Math.PI);
			}
			break;
		case 2:
			boi.position.x -= boiSpeed * dt;
			if (boi.position.x < -boundsLength) {
				boiState = BoiState.WALK1;
				boi.rotateY(Math.PI);
			}
			break;
	}
}

const animate = () => {
	const dt = clock.getDelta();
	if (!renderer || !camera || !scene) return;

	requestAnimationFrame(animate);
	update(dt);
	updatePhysics(1 / 60); //hax
	updateController(keys, dt);
	updateAnimations(dt);

	render();

	if (!cannonDebugRenderer)
		return;

	if (settings.debugDraw) { //todo: actually make it toggle
		cannonDebugRenderer.update();
	}
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

	//laziness
	const onKeyTriggered = (key, callback) => {
		if (!keysTriggered[key]) {
			callback();
			keysTriggered[key] = true;
		}
	};

	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		switch (key) {
			case 'f':
				if (!isSelected || !selectedObject)
					continue;

				onKeyTriggered('f', () => {
					selectedObject.material.color.setHex(Math.random() * 0xFFFFFF);
				})
				break;
			case 'f2':
				onKeyTriggered('f2', () => {
					settings.debugDraw = !settings.debugDraw;
					cannonDebugRenderer.setVisible(settings.debugDraw); //I'll make this better later
				})
				break;
			case 'g':
				player.body.position.set(0, 0, 0);
				player.body.velocity.set(0, 0, 0);
				break;
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

const init = () => {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10001);

	//physics
	world = setupPhysics();

	//player physics settings
	player.body = new CANNON.Body({ mass: 60 });
	player.body.addShape(new CANNON.Sphere(3.5));
	player.body.angularFactor = new CANNON.Vec3(0, 1, 0);
	world.addBody(player.body);

	const floorBody = new CANNON.Body({
		mass: 0,
		position: new CANNON.Vec3(0, -5, 0),
	});
	const planeShape = new CANNON.Plane();
	const quaternion = new THREE.Quaternion();
	quaternion.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -Math.PI / 2 );

	//GROUND
	floorBody.addShape(planeShape);
	floorBody.quaternion = new CANNON.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w);

	ground = floorBody;
	world.addBody(floorBody);

	cannonDebugRenderer = new CannonDebugRenderer(scene, world);

	//lobby
	modelLoader.load('/models/room.glb', (gltf) => {
		gltf.scene.position.setY(-5);
		gltf.scene.scale.set(5, 5, 5);
		scene.add(gltf.scene);

	}, undefined,
	(err) => {
		console.error(err);
	});

	const length = 24;
	const height = 12;

	const iconoclasmLogoTexture = new THREE.TextureLoader().load("/images/iconoclasm/iconoclasm-logo.jpg");
	const iconoclasmBanner = createInteractableTexturePlane(length, height, iconoclasmLogoTexture);
	iconoclasmBanner.position.set(0, 2.5, 20);
	iconoclasmBanner.rotateY(Math.PI);
	scene.add(iconoclasmBanner);

	const stronkBoiTexture = new THREE.TextureLoader().load("/images/stronk.jpg");
	const stronkBoiPlane = createInteractableTexturePlane(length, height, stronkBoiTexture);
	stronkBoiPlane.position.set(0, 2.5, -20);
	scene.add(stronkBoiPlane);

	modelLoader.load('/models/boi2skinned.glb', (gltf) => {
		console.log("Loaded Skinned model: ", gltf);
		gltf.scene.position.set(-20, 0, 0);
		gltf.scene.rotation.set(0, 1 * Math.PI, 0);
		gltf.scene.scale.set(5, 5, 5);
		scene.add(gltf.scene);

		boi = gltf.scene;

		mixer = new THREE.AnimationMixer(gltf.scene);
		const clips = gltf.animations;

		// Play a specific animation
		const clip = THREE.AnimationClip.findByName(clips, "Walk.001");
		const action = mixer.clipAction(clip);
		action.play();

		let hand = null;
		const findHand = (child) => {
			if (hand)
				return;

			if (child.name == "LeftHand") {
				hand = child;
				return;
			}

			if (child.children) {
				child.children.forEach(findHand);
			}
		};

		gltf.scene.children.forEach(findHand);

		if (hand) {
			modelLoader.load('/models/sword2.glb', (swordGLTF) => {
				swordGLTF.scene.position.set(0.15, 0.15, 0.02);
				swordGLTF.scene.rotation.set(0, Math.PI, 0);
				swordGLTF.scene.scale.set(0.1, 0.1, 0.1);
				hand.add(swordGLTF.scene);
			},
				undefined,
				(err) => {
					console.error(err);
				});
		}
	},
		undefined,
		(err) => {
			console.error(err);
		});

	//laziness
	modelLoader.load('/models/boi2skinned.glb', (gltf) => {
		console.log("Loaded Skinned model: ", gltf);
		gltf.scene.position.set(10, -1.65, 5);
		scene.add(gltf.scene);
	},
		undefined,
		(err) => {
			console.error(err);
		});

	modelLoader.load('/models/table.glb', (gltf) => {
		console.log("Added model: ", gltf);
		gltf.scene.position.set(10, -4, -5);

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
		gltf.scene.position.set(10, -4, 5);
		gltf.scene.scale.set(2, 2, 2);

		const light = new THREE.PointLight(0xffffff, 10, 0, 1);
		const light2 = new THREE.PointLight(0xffffff, 30, 0, 1);
		light.position.set(gltf.scene.position.x, gltf.scene.position.y, gltf.scene.position.z);
		light2.position.set(gltf.scene.position.x, gltf.scene.position.y + 5, gltf.scene.position.z);

		scene.add(light);
		scene.add(light2);
		scene.add(gltf.scene);

		const body = new CANNON.Body({
			mass: 0
		});
		body.addShape(new CANNON.Box(ToCannonVec3(gltf.scene.scale)));
		body.position = ToCannonVec3(gltf.scene.position);
		world.addBody(body)
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
		const geometry = new TextGeometry('Hello there!', {
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

		keysTriggered[key] = false;
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
