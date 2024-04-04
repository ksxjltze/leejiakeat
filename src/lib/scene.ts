import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

import Stats from 'three/examples/jsm/libs/stats.module.js';
import ThreeMeshUI from 'three-mesh-ui'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

import * as CANNON from 'cannon-es';
import CannonUtils from './utils/cannonUtils';
import CannonDebugRenderer from './utils/cannonDebugRenderer';
import { ToCannonVec3, ToCannonQuat, ToCannonVec3Scaled } from './utils/cannonUtils';
import { lerp } from 'three/src/math/MathUtils';

const clock = new THREE.Clock();
const modelLoader = new GLTFLoader();

const Constants = {
	forward: new THREE.Vector3(0, 0, -1),
	right: new THREE.Vector3(1, 0, 0)
};

const PRIMARY_BUTTON = 0 as const; //left mouse button
const SECONDARY_BUTTON = 2 as const; //right mouse button

let composer: EffectComposer;
let bloomComposer: EffectComposer;
let effectFXAA, outlinePass: OutlinePass;

//idk what to call these
const Outline = {
	Interactable: new THREE.Color(1, 0, 1),
	PhysicsInteractable: new THREE.Color(1, 0, 0),
	MovementInteractable: new THREE.Color(0, 1, 0)
};

const InteractionType = {
	Generic: 0,
	Physics: 1,
	Movement: 2,
	Talk: 3
} as const;

let stats;
let renderer: THREE.WebGLRenderer;
let css3DRenderer: CSS3DRenderer;
let uiOverlay: HTMLDivElement;

let scene: THREE.Scene;
let cssScene: THREE.Scene;
let crosshair: THREE.Sprite;

let camera;
let controls: PointerLockControls;

let surfaceContainer: HTMLElement;
let domAttachmentContainer: HTMLElement;
let initialized = false;

let mixer: THREE.AnimationMixer;
let world: CANNON.World;
let cannonDebugRenderer;

const BLOOM_SCENE = 1;
const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_SCENE);

const BoiState = {
	NONE: 0,
	WALK1: 1,
	WALK2: 2
} as const;

const boi = {
	object: null,
	state: null,
	enabled: true,
	fallCount: 0,
	speed: 5
};

const boi3 = {
	object: null
}

let renderCanvas: HTMLCanvasElement;
let canvasWidth: number, canvasHeight: number;

const settings = {
	debugDraw: false,
	enableBloom: true
};

let selectedObjects = [];

const PlayerSettings = {
	mass: 60
} as const;

const player = {
	velocity: new THREE.Vector3(0, 0, 0),
	grounded: true,

	moveSpeed: 12,
	jumpAmount: 4,
	body: undefined,
	strength: 2000
};

//temp
const cameraTurnSpeed = 5;
let fallCountScreen;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(0, 0);

const input = {
	keys: [],
	keysTriggered: [],
	mouseButtons: [],
	touches: [],
	stick: {
		strength: 0,
		angle: 0
	}
}

//bloom stuff
const bloom = {
	materials: [],
	darkMaterial: new THREE.MeshBasicMaterial({ color: 'black' })
};

let physicsObjects = [];

interface PhysicsObject {
	mesh: THREE.Object3D,
	body: CANNON.Body
};

function createPhysicsObject(mesh: THREE.Object3D, body: CANNON.Body) {
	const object: PhysicsObject = {
		mesh: mesh,
		body: body
	};

	physicsObjects.push(object);
	return object;
}

function createPhysicsObjectFrom3DObject(object: THREE.Object3D, shape: CANNON.Shape, mass: number, offset?: CANNON.Vec3) {
	const body = new CANNON.Body({
		mass: mass,
		position: new CANNON.Vec3(object.position.x, object.position.y, object.position.z),
		quaternion: new CANNON.Quaternion(object.quaternion.x, object.quaternion.y, object.quaternion.z, object.quaternion.w),
	});
	body.addShape(shape, offset);
	return createPhysicsObject(object, body);
}

//yoink
function darkenNonBloomed(obj) {
	if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
		bloom.materials[obj.uuid] = obj.material;
		obj.material = bloom.darkMaterial;
	}

}

function restoreMaterial(obj) {
	if (bloom.materials[obj.uuid]) {
		obj.material = bloom.materials[obj.uuid];
		delete bloom.materials[obj.uuid];
	}

}

const playVideoById = (id: string): THREE.Texture => {
	const videoElement = document.getElementById(id);

	if (videoElement instanceof HTMLVideoElement) {
		const video = videoElement as HTMLVideoElement;
		video.play();

		return new THREE.VideoTexture(video);
	}

	return null;
}

const playVideo = (path: string, id: string, loop: boolean) => {
	const existingVideo = playVideoById(id);
	if (existingVideo) {
		return existingVideo;
	}

	const video = document.createElement("video");

	video.src = path;
	video.setAttribute("id", id);
	video.loop = loop;

	video.play();

	domAttachmentContainer.appendChild(video);
	return new THREE.VideoTexture(video);
}

function onPointerMove(event) {

}

//TODO: ECS or something
const updateBoi = (dt) => {
	if (!boi.enabled)
		return;

	if (!boi.state) //TODO: stuff
		boi.state = BoiState.WALK1;

	if (!boi.object)
		return;

	const body: CANNON.Body = boi.object.body;

	const pointA = new CANNON.Vec3(-15, 0, 0);
	const pointB = new CANNON.Vec3(65, 0, 0);

	//walk if upright
	const upVector = new THREE.Vector3(0, 1, 0);
	const currentVector = upVector.clone().applyQuaternion(body.quaternion);

	if (upVector.dot(currentVector) < 0.2) {
		return;
	}

	let waypoint: CANNON.Vec3;
	const triggerDistanceSq = 5;

	switch (boi.state) {
		case 1:
			waypoint = pointA;
			break;
		case 2:
			waypoint = pointB;
			break;
	}

	if (!waypoint)
		return;

	const targetDir = waypoint.vsub(body.position);
	targetDir.normalize();

	const direction = new THREE.Vector3(0, 5, 0);
	direction.copy(targetDir);

	const right = Constants.right.clone().applyEuler(new THREE.Euler(0, Math.PI, 0));
	const dot = direction.dot(right);
	let angle = Math.acos(dot / (direction.length() * right.length()));

	if (direction.dot(Constants.forward) > 0)
		angle = -angle;

	//lets just assume he won't fall down
	body.quaternion = body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), angle);
	body.position = body.position.vadd(targetDir.scale(boi.speed * dt));

	if (body.position.distanceSquared(waypoint) <= triggerDistanceSq) {
		boi.state = (boi.state == BoiState.WALK1) ? BoiState.WALK2 : BoiState.WALK1;
	}
}

const update = (dt) => {
	updateBoi(dt);

	//scuffed
	physicsObjects.forEach((physicsObject: PhysicsObject) => {
		const object = physicsObject.mesh;
		if (!object)
			return;

		if (!object.userData)
			return;

		if (object.userData.enabled) {
			object.userData.update(dt);
		}
	})

}

let deltaTime = 0;

const animate = () => {
	deltaTime = clock.getDelta();
	const dt = deltaTime;

	if (!renderer || !camera || !scene) return;

	requestAnimationFrame(animate);
	stats.begin();

	update(dt);
	updatePhysics(1 / 60); //hax
	updateController(input.keys, dt);
	updateAnimations(dt);

	render();

	if (settings.debugDraw)
		cannonDebugRenderer.update();

	stats.end();
};

const updateAnimations = (dt) => {
	if (!mixer)
		return;

	mixer.update(dt);
}

const setSelectedObject = (object) => {
	selectedObjects = [];
	selectedObjects.push(object);

	if (!object.userData)
		return;

	if (object.userData.interactType) {
		switch (object.userData.interactType) {
			case InteractionType.Generic:
				outlinePass.visibleEdgeColor = Outline.Interactable;
				outlinePass.hiddenEdgeColor = Outline.Interactable;
				break;
			case InteractionType.Physics:
				outlinePass.visibleEdgeColor = Outline.PhysicsInteractable;
				outlinePass.hiddenEdgeColor = Outline.PhysicsInteractable;
				break;
			case InteractionType.Movement:
				outlinePass.visibleEdgeColor = Outline.MovementInteractable;
				outlinePass.hiddenEdgeColor = Outline.MovementInteractable;
				break;
		}

		return;
	}

	outlinePass.visibleEdgeColor = Outline.Interactable;
	outlinePass.hiddenEdgeColor = Outline.Interactable;
};

const checkIntersectingObjectsForCSS3D = () => {
	//probably really expensive, TODO: optimize
	cssScene.children.forEach((child) => {
		raycaster.set(camera.position, child.position.clone().sub(camera.position));
		const intersects = raycaster.intersectObjects(scene.children);

		child.visible = false;

		let nearestObjectIndex = 0;
		while (intersects.length > nearestObjectIndex && intersects[nearestObjectIndex].object.type == "Sprite") {
			nearestObjectIndex++;
		}

		//temp hardcode
		if (intersects.length > nearestObjectIndex
			&& intersects[nearestObjectIndex].object.name == "Screen4Mesh"
			|| intersects[nearestObjectIndex].object.name == "Screen4Mesh_1") {
			child.visible = true;
		}
	});
};

const checkIntersectingObjects = () => {
	raycaster.setFromCamera(pointer, camera);

	// calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects(scene.children);

	if (intersects.length > 0) {
		let selectedObject;

		intersects.forEach((intersection) => {
			if (selectedObject)
				return;

			if (intersection.object.type == 'Sprite')
				return;

			selectedObject = intersection.object;
		});

		if (!selectedObject)
			return;

		setSelectedObject(selectedObject);
		if (!selectedObject.userData.selectable)
			selectedObjects = [];

		if (selectedObject.userData.root)
			setSelectedObject(selectedObject.userData.root);

		outlinePass.selectedObjects = selectedObjects;
	}
}

const render = () => {
	//crosshair (for now)
	const camPos: THREE.Vector3 = camera.position;
	const target = new THREE.Vector3(camPos.x, camPos.y, camPos.z - 1);

	const offset = target.sub(camPos);
	offset.applyEuler(camera.rotation);

	crosshair.position.copy(camPos.clone().add(offset));

	checkIntersectingObjectsForCSS3D();
	checkIntersectingObjects();

	if (bloomComposer && settings.enableBloom) {
		scene.traverse(darkenNonBloomed);
		bloomComposer.render();
		scene.traverse(restoreMaterial);
	}

	composer.render();
	css3DRenderer.render(cssScene, camera);
}

const interactWithSelected = (event: PointerEvent) => {
	if (selectedObjects.length == 0)
		return;

	const selected = selectedObjects[0];

	const rootObject = selected.userData.root;
	if (rootObject) {
		rootObject.userData.onInteract(event);
		return;
	}

	if (selected.userData.onInteract) {
		selected.userData.onInteract(event);
	}
}

const updateController = (keys: any[], dt: number) => {
	updatePlayerController(keys, dt);

	//laziness
	const onKeyTriggered = (key, callback) => {
		if (!input.keysTriggered[key]) {
			callback();
			input.keysTriggered[key] = true;
		}
	};

	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		switch (key) {
			case 'f':
				if (selectedObjects.length == 0)
					return;

				onKeyTriggered(key, () => {
					const selected = selectedObjects[0];
					if (selected.userData.onInteract) {
						selected.userData.onInteract();
					}

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
	const cameraForward = Constants.forward.clone().applyEuler(camera.rotation);
	const cameraRight = Constants.right.clone().applyEuler(camera.rotation);

	const forward = new CANNON.Vec3(cameraForward.x, 0, cameraForward.z); //let's just remove y movement for now
	const right = new CANNON.Vec3(cameraRight.x, cameraRight.y, cameraRight.z);

	forward.normalize();
	right.normalize();

	const left = right.negate();
	const backwards = forward.negate();

	//mobile, or joy stick or whatever
	if (input.stick.strength > 50) {
		const rotation = new THREE.Euler(0, -input.stick.angle, 0); //it kinda works, TODO: fix
		body.velocity = ToCannonVec3(cameraForward.applyEuler(rotation).normalize().multiplyScalar(player.moveSpeed));
		return;
	}

	//lol
	let speed = player.moveSpeed;
	if (keys.includes("shift")) {
		speed *= 1.5;
	}

	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];

		switch (key) {
			case 'w':
				body.position = body.position.addScaledVector(speed * dt, forward);
				break;
			case 'a':
				body.position = body.position.addScaledVector(speed * dt, left);
				break;
			case 's':
				body.position = body.position.addScaledVector(speed * dt, backwards);
				break;
			case 'd':
				body.position = body.position.addScaledVector(speed * dt, right);
				break;
			case ' ': //jump
				if (player.grounded) { //scuffed
					body.velocity.y += player.jumpAmount;
					player.grounded = false;
				}
				break;

			//keyboard camera controls
			case 'q':
				camera.rotation.y += cameraTurnSpeed * dt;
				break;
			case 'e':
				camera.rotation.y -= cameraTurnSpeed * dt;
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

	const updateSizes = (width, height) => {
		renderer.setSize(width, height);
		css3DRenderer.setSize(width, height);

		if (bloomComposer)
			bloomComposer.setSize(width, height);

		composer.setSize(width, height);

		effectFXAA.uniforms['resolution'].value.set(1 / width, 1 / height);

		camera.aspect = width / height;
		camera.updateProjectionMatrix();

		updateCrosshair(width, height);
	};

	if (document.fullscreenElement) {
		const width = window.innerWidth;
		const height = window.innerHeight;

		updateSizes(width, height);
		return;
	}

	if (surfaceContainer) {
		const width = surfaceContainer.clientWidth;
		const height = surfaceContainer.clientHeight;

		updateSizes(width, height);
		return;
	}
};

const loadSkyboxTextures = () => {
	const loader = new THREE.CubeTextureLoader();
	loader.setPath("/images/skybox/");

	const textureCube = loader.load([
		'left.png',
		'right.png',
		'top.png',
		'bottom.png',
		'back.png',
		'front.png',
	]);

	// textureCube.mapping = THREE.CubeRefractionMapping;
	// textureCube.flipY = true;

	return textureCube;
}

const meshToStaticCollider = (mesh: THREE.Mesh, position) => {
	const shape = CannonUtils.CreateTrimesh(mesh.geometry);
	const body = new CANNON.Body({
		mass: 0
	})

	body.addShape(shape);
	body.position = new CANNON.Vec3(position.x, position.y, position.z);

	return body;
};

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

const showPauseMenu = () => {

};

const createTexturePlane = (width, height, texture) => {
	const planeGeometry = new THREE.PlaneGeometry(width, height);
	const planeMaterial = new THREE.MeshStandardMaterial({ map: texture });
	const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);

	return planeMesh;
};

const getNormalsFromObject = (object3d: THREE.Object3D) => {
	const normals = [];

	const traverse = (node) => {
		if (node instanceof THREE.Mesh) {
			const geometry: THREE.BufferGeometry = node.geometry;
			const normal = geometry.attributes.normal.array;

			for (let i = 0; i < normal.length; i++) {
				normals.push(normal[i]);
			}
		}

		node.children.forEach((child) => {
			traverse(child);
		});
	}

	traverse(object3d);
	return new Float32Array(normals);
};

const getVerticesFromObject = (object3d: THREE.Object3D) => {
	const vertices = [];

	const traverse = (node) => {
		if (node instanceof THREE.Mesh) {
			const geometry: THREE.BufferGeometry = node.geometry;
			const positions = geometry.attributes.position.array;

			for (let i = 0; i < positions.length; i++) {
				vertices.push(positions[i]);
			}
		}

		node.children.forEach((child) => {
			traverse(child);
		});
	}

	traverse(object3d);
	return new Float32Array(vertices);
};

const computeBoundingSphere = (object: THREE.Object3D) => {
	const vertices = getVerticesFromObject(object);
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
	geometry.computeBoundingSphere();

	return geometry.boundingSphere;
}

const createInteractableObject = (object, onInteract, interactType?) => {
	object.userData.selectable = true;
	object.userData.onInteract = onInteract;
	object.userData.interactType = interactType;
};

const GLTFGroupToStaticBodies = (gltf, scale?: THREE.Vector3) => {
	if (!scale)
		scale = new THREE.Vector3(1, 1, 1);

	const group = gltf.scene.children[0];
	const bodies = [];

	traverseObjectTreeWithPredicate(gltf.scene, (object) => {
		if (object instanceof THREE.Mesh) {
			object.geometry.scale(scale.x, scale.y, scale.z);

			if (object.userData.skipStaticMeshSetup)
				return false;

			const body = meshToStaticCollider(object, gltf.scene.position);

			bodies.push(body);
			world.addBody(body);
		};

		return false;
	})

	return bodies;
};

/**
 * Traverse and apply function until it returns true
 * @param scene Scene (Group of Object3D)
 * @param fn Function to invoke
 */
const traverseObjectTreeWithPredicate = (scene, fn: (object: any) => boolean) => {
	const traverser = (child) => {
		if (fn(child))
			return;

		child.children.forEach(traverser);
	};

	scene.children.forEach(traverser);
};

const findMeshByMaterialName = (scene, name: string) => {
	let result = null;
	const materialNameMatches = (object) => {
		if (object instanceof THREE.Mesh && object.material.name == name) {
			result = object;
			return true;
		}

		return false;
	};

	traverseObjectTreeWithPredicate(scene, materialNameMatches);
	return result;
};

const updateCrosshair = (width, height) => {
	const crosshairCanvas = document.createElement("canvas");
	crosshairCanvas.setAttribute("id", "renderCanvas");
	crosshairCanvas.setAttribute("width", width.toString());
	crosshairCanvas.setAttribute("height", height.toString());

	const ctx: CanvasRenderingContext2D = crosshairCanvas.getContext("2d");
	ctx.fillStyle = "rgba(0, 0, 0, 0)";
	ctx.fillRect(0, 0, width, height);
	ctx.fillStyle = "green";

	const crosshairSize = 16;

	ctx.beginPath();
	ctx.ellipse(width / 2, height / 2, crosshairSize, crosshairSize / 2, 0, 0, 2 * Math.PI);
	ctx.fill();

	if (!crosshair) {
		const canvasCrosshairTexture = new THREE.CanvasTexture(crosshairCanvas);
		const material = new THREE.SpriteMaterial({ map: canvasCrosshairTexture });

		const sprite = new THREE.Sprite(material);
		scene.add(sprite);
		crosshair = sprite;

		crosshairCanvas.remove();
		return;
	}

	crosshair.material.map.dispose();
	const canvasCrosshairTexture = new THREE.CanvasTexture(crosshairCanvas);
	crosshair.material.map = canvasCrosshairTexture;

	crosshairCanvas.remove();
}

const setBoiFallCountAndUpdateCanvasTexture = (newFallCount: number) => {
	boi.fallCount = newFallCount;

	const width = canvasWidth;
	const height = canvasHeight;

	const fontSize = 48;

	const ctx: CanvasRenderingContext2D = renderCanvas.getContext("2d");
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, width, height);
	ctx.fillStyle = "black";
	ctx.font = fontSize + "px " + "Arial bold";

	const yeetCountText = "Yeet count:";
	const fallCountText = boi.fallCount.toString();

	const fontWidth = fontSize * 0.9;
	const fontHeight = fontSize * 0.9;

	const centerOffsetX = (yeetCountText.length / 2 + fallCountText.length / 2) * (fontWidth / 2);
	const centerOffsetY = fontHeight / 2;

	const textString = yeetCountText + " " + fallCountText;
	ctx.fillText(textString, width / 2 - centerOffsetX, height / 2 + centerOffsetY);

	if (fallCountScreen) {
		fallCountScreen.material.map.dispose();
		const canvasTexture = new THREE.CanvasTexture(renderCanvas);
		fallCountScreen.material.map = canvasTexture;
	}
};

const init = () => {
	scene = new THREE.Scene();
	cssScene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10001);
	const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

	//physics
	world = setupPhysics();

	//player physics settings
	player.body = new CANNON.Body({ mass: PlayerSettings.mass });
	player.body.addShape(new CANNON.Sphere(3.5));
	player.body.angularFactor = new CANNON.Vec3(0, 1, 0);

	const floorBody = new CANNON.Body({
		mass: 0,
		position: new CANNON.Vec3(0, -5, 0),
	});
	const planeShape = new CANNON.Plane();
	const quaternion = new THREE.Quaternion();
	quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);

	//GROUND
	floorBody.addShape(planeShape);
	floorBody.quaternion = new CANNON.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
	cannonDebugRenderer = new CannonDebugRenderer(scene, world);

	const onFloorLoaded = () => {
		//trigger plane (fall)
		const fallCollisionTriggerBody = new CANNON.Body({
			// mass: 0,
			isTrigger: true,
		});

		fallCollisionTriggerBody.addShape(new CANNON.Plane(), new CANNON.Vec3(0, -100, 0), new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2));
		world.addBody(fallCollisionTriggerBody);

		fallCollisionTriggerBody.addEventListener('collide', (event) => {
			if (event.body === boi.object.body || event.body === boi3.object.body) {
				setBoiFallCountAndUpdateCanvasTexture(boi.fallCount + 1);
				event.body.position.set(0, 0, 0);
			}

			if (event.body === player.body) {
				event.body.position.set(0, 0, 0);
			}
		});

		world.addBody(player.body);
	};

	const environment = new RoomEnvironment();
	const pmremGenerator = new THREE.PMREMGenerator(renderer);
	scene.environment = pmremGenerator.fromScene(environment).texture;
	environment.dispose();

	//persist
	let stronkBoiObject;
	const stronkBoiTexture = new THREE.TextureLoader().load("/images/stronk.jpg");

	//lobby
	modelLoader.load('/models/room.glb', (gltf) => {
		gltf.scene.position.setY(-5);
		scene.add(gltf.scene);

		//lazy hack
		const magicScale = new THREE.Vector3(5, 5, 5);

		const isMaterialMatch = (object, name) => {
			return object.material.name == name;
		};

		const isObjectNameMatch = (object, name) => {
			const match = object.name == name;
			if (match) {
				console.log("Found object: " + name);
			}
			return match;
		};

		const getObjectBoundingSphere = (object) => {
			const geometry: THREE.BufferGeometry = object.geometry;
			geometry.computeBoundingSphere();

			return geometry.boundingSphere;
		};

		const getObjectBoundingBox = (object) => {
			const geometry: THREE.BufferGeometry = object.geometry;
			geometry.computeBoundingBox();

			return geometry.boundingBox;
		};

		//lazy hack 2
		let lightIndex = 0;
		traverseObjectTreeWithPredicate(gltf.scene, (object) => {
			if (!(object instanceof THREE.Mesh))
				return false;

			if (isMaterialMatch(object, "CeilingLightMaterial")) {
				const light = new THREE.PointLight(0xCCCCCC, 20, 0, 1);

				light.position.set(lightIndex * 26.75 - 1.5, 10, 0);
				lightIndex++;

				// scene.add(new THREE.PointLightHelper(light, 1));
				scene.add(light);
				object.layers.toggle(BLOOM_SCENE);
			};

			if (isObjectNameMatch(object, "LauncherRod")) {
				const shape = new CANNON.Cylinder(16, 16, 24, 12);
				const physicsObject = createPhysicsObjectFrom3DObject(object, shape, 0, new CANNON.Vec3(0, 21, 0));
				world.addBody(physicsObject.body);

				physicsObject.body.position.set(-80, -40, 0);
				object.userData.skipStaticMeshSetup = true;

				const maxHeight = -15;
				const minHeight = -40;
				let goingUp = true;

				object.userData.update = (dt) => {
					const launchSpeed = 200;
					const retractSpeed = 10;

					let speed = launchSpeed;
					if (!goingUp)
						speed = retractSpeed;

					let movement = speed * dt;

					if (physicsObject.body.position.y > maxHeight) {
						goingUp = false;

						const offset = physicsObject.body.position.y - maxHeight;
						physicsObject.body.position.y -= offset;
						physicsObject.mesh.position.y -= offset;
						return;
					}
					else if (physicsObject.body.position.y < minHeight) {
						object.userData.enabled = false;
						goingUp = true;

						const offset = physicsObject.body.position.y - minHeight;
						physicsObject.body.position.y -= offset;
						physicsObject.mesh.position.y -= offset;
						return;
					}

					if (!goingUp)
						movement = -movement;

					physicsObject.body.position.y += movement;
					physicsObject.mesh.position.y += movement;
				};

				createInteractableObject(object, () => {
					object.userData.enabled = true;
				}, InteractionType.Physics);
				return false;
			}

			if (isObjectNameMatch(object, "LauncherIndicator")) {
				object.material.emissive = new THREE.Color(0x0011FF);
				object.material.emissiveIntensity = 20;
				object.layers.toggle(BLOOM_SCENE);
			}

			if (isObjectNameMatch(object, "ConnectorScreenMesh")) {
				const root = object.parent;
				const position = getObjectBoundingSphere(object).center;

				traverseObjectTreeWithPredicate(root, (object) => {
					object.userData.root = root;
					return false;
				});

				createInteractableObject(root, (pointerEvent: PointerEvent) => {
					if (pointerEvent.button == SECONDARY_BUTTON) {
						const pos = ToCannonVec3(position);
						const dir = pos.vsub(player.body.position);
						dir.normalize();

						const force = dir.scale(300000); //it just works
						player.body.applyForce(force);

						object.material.color = new THREE.Color(0xFFFFFF * Math.random());
					}
				}, InteractionType.Movement);

				root.layers.toggle(BLOOM_SCENE);
			}

			//Lobby screens
			{
				const setupLobbyScreens = () => {
					if (isObjectNameMatch(object, "ScreenMesh_1")) {
						object.material.map = stronkBoiTexture;
						stronkBoiObject = object;

						createInteractableObject(object, () => {
							object.material.color = new THREE.Color(Math.random() * 0xFFFFFF);
						});

						return false;
					}

					if (isObjectNameMatch(object, "Screen2Face")) {
						fallCountScreen = object;
						const canvasTexture = new THREE.CanvasTexture(renderCanvas);
						object.material.map = canvasTexture;

						return false;
					}

					if (isObjectNameMatch(object, "Screen3Mesh_1")) {
						const iconoclasmLogoTexture = new THREE.TextureLoader().load("/images/iconoclasm/iconoclasm-logo.jpg");
						iconoclasmLogoTexture.wrapS = THREE.RepeatWrapping;
						iconoclasmLogoTexture.wrapT = THREE.RepeatWrapping;
						object.material.map = iconoclasmLogoTexture;

						createInteractableObject(object, () => {
							object.material.emissive = new THREE.Color(Math.random() * 0xFFFFFF);
							const coinFlip = Math.round(Math.random());
							const offset = Math.random() * 0.5;

							if (coinFlip)
								object.material.map.offset.x += offset;
							else
								object.material.map.offset.y += offset;
						});

						return false;
					}

					//Embed Iconoclasm gameplay video
					if (isObjectNameMatch(object, "Screen4Mesh_1")) {
						// const boundingSphere = getObjectBoundingSphere(object);
						// const position = boundingSphere.center;

						// const boundingBox = getObjectBoundingBox(object);

						// const width = boundingBox.max.x - boundingBox.min.x;
						// const height = boundingBox.max.y - boundingBox.min.y;

						if (!document.getElementById("youtube-embed-api-script")) {
							const tag = document.createElement('script');
							tag.src = 'https://www.youtube.com/iframe_api';
							tag.id = 'youtube-embed-api-script'
							domAttachmentContainer.append(tag);
						};

						const element = document.createElement("iframe");
						element.id = "iconoclasm-iframe"
						element.style.width = "100vw";
						element.style.height = "100vh";

						const autoPlayURL = "https://www.youtube.com/embed/BCFzNFtZF_E?autoplay=1&mute=1&enablejsapi=1";
						const url = "https://www.youtube.com/embed/BCFzNFtZF_E";
						element.src = url;

						let isVideoPlaying = false;

						createInteractableObject(object, () => {
							isVideoPlaying = !isVideoPlaying;
							if (isVideoPlaying)
								element.src = autoPlayURL;
							else
								element.src = url;
						});

						css3DRenderer.domElement.append(element);

						//I'll just set it manually for now
						const css3DObject = new CSS3DObject(element);
						css3DObject.position.set(50, 2.5, 19.65);
						css3DObject.rotateY(Math.PI);
						css3DObject.scale.set(0.01, 0.01, 0.01);
						cssScene.add(css3DObject);
					}
				};
				setupLobbyScreens();
			}

			return false;
		});

		GLTFGroupToStaticBodies(gltf, magicScale.clone());
		onFloorLoaded();

	}, undefined,
		(err) => {
			console.error(err);
		});

	modelLoader.load('/models/boi2skinned.glb', (gltf) => {
		gltf.scene.position.set(-20, 0, 0);
		gltf.scene.rotation.set(0, 1 * Math.PI, 0);
		gltf.scene.scale.set(5, 5, 5);
		scene.add(gltf.scene);

		mixer = new THREE.AnimationMixer(gltf.scene);
		const clips = gltf.animations;

		// Play a specific animation
		const clip = THREE.AnimationClip.findByName(clips, "Walk.001");
		const action = mixer.clipAction(clip);
		action.play();

		const shape = new CANNON.Sphere(3.4);
		const body = new CANNON.Body({
			mass: 1000
		});

		body.addShape(shape, new CANNON.Vec3(0, -1.4, 0));
		body.position = ToCannonVec3(gltf.scene.position);
		body.quaternion = ToCannonQuat(gltf.scene.quaternion);

		boi.object = createPhysicsObject(gltf.scene, body);
		boi.object.body.angularFactor = new CANNON.Vec3(0, 1, 0);
		world.addBody(body);

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
		gltf.scene.position.set(10, -1.65, 8);
		scene.add(gltf.scene);
	},
		undefined,
		(err) => {
			console.error(err);
		});

	modelLoader.load('/models/boi3.glb', (gltf) => {
		const boundingSphere = computeBoundingSphere(gltf.scene);

		const shape = new CANNON.Sphere(boundingSphere.radius);
		const object = createPhysicsObjectFrom3DObject(gltf.scene, shape, 1, ToCannonVec3(boundingSphere.center));

		object.body.material = new CANNON.Material({ restitution: 10, friction: 0 });
		object.body.position.set(20, -1.5, 8);
		object.body.quaternion.setFromEuler(0, Math.PI, 0, "XYZ");

		world.addBody(object.body);
		scene.add(object.mesh);

		boi3.object = object;

		traverseObjectTreeWithPredicate(gltf.scene, (object) => {
			object.userData.root = boi3.object.mesh;
			return false;
		})

		createInteractableObject(object.mesh, (pointerEvent: PointerEvent) => {
			const dir = object.body.position.vsub(player.body.position);
			dir.normalize();

			if (pointerEvent.button == PRIMARY_BUTTON) {
				const force = dir.scale(player.strength);
				object.body.applyForce(force);
			}
			else if (pointerEvent.button == SECONDARY_BUTTON) {
				const force = dir.scale(player.strength).negate();
				object.body.applyForce(force);
			}

		}, InteractionType.Physics);
	});

	modelLoader.load('/models/table.glb', (gltf) => {
		gltf.scene.position.set(10, -4, -8);

		const mesh = gltf.scene.children[0] as THREE.Mesh;
		mesh.geometry.scale(2, 2, 2);

		const shape = CannonUtils.CreateTrimesh(mesh.geometry);
		const body = new CANNON.Body({
			mass: 0
		})
		body.addShape(shape);
		body.position = new CANNON.Vec3(gltf.scene.position.x, gltf.scene.position.y, gltf.scene.position.z);
		world.addBody(body);

		scene.add(gltf.scene);
	},
		undefined,
		(err) => {
			console.error(err);
		});

	modelLoader.load('/models/table2.glb', (gltf) => {
		gltf.scene.position.set(10, -4, 8);
		gltf.scene.scale.set(2, 2, 2);

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

	modelLoader.load('/models/console.glb', (gltf) => {
		gltf.scene.position.set(0, -5, -12);
		scene.add(gltf.scene);

		let isPlaying = false;

		GLTFGroupToStaticBodies(gltf);
		traverseObjectTreeWithPredicate(gltf.scene, (object) => {
			if (object instanceof THREE.Mesh) {
				createInteractableObject(object, () => {
					stronkBoiObject.material.color = new THREE.Color(1, 1, 1);

					if (isPlaying) {
						isPlaying = false;
						stronkBoiObject.material.map = stronkBoiTexture;
						return;
					}

					const videoTexture = playVideo("/videos/boii.mp4", "boiVideo", true);

					if (videoTexture) {
						stronkBoiObject.material.map = videoTexture;
					}

					isPlaying = true;
				});
			}
			return false;
		});

	});

	camera.position.z = 0;
	// camera.rotation.y = Math.PI;

	//skybox
	scene.background = loadSkyboxTextures();

	//add lighting
	let lightPosition = new THREE.Vector3(0, 0, 0);

	const domeLight = new THREE.PointLight(0xAACCFF, 100, 60, 0.1);
	lightPosition = new THREE.Vector3(-80, 20, 0);
	domeLight.position.set(lightPosition.x, lightPosition.y, lightPosition.z);
	scene.add(domeLight);

	const fontLoader = new FontLoader();
	fontLoader.load('/fonts/helvetiker_regular.typeface.json', function (font) {
		const geometry = new TextGeometry('Press F or Click to interact with glowy stuff!', {
			font: font,
			size: 0.5,
			height: 0.1,
			curveSegments: 4,
			bevelEnabled: false,
			bevelThickness: 0.125,
			bevelSize: 0.025,
			bevelOffset: 0,
			bevelSegments: 1,
		});
		geometry.center();

		const material = new THREE.MeshBasicMaterial();
		material.color = new THREE.Color(0, 0, 1);
		const text = new THREE.Mesh(geometry, material);
		text.position.z = -8;
		text.position.y = -1;
		scene.add(text);
	});

	// postprocessing
	composer = new EffectComposer(renderer);
	const renderPass = new RenderPass(scene, camera);

	outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
	const outline = (outlinePass as OutlinePass);
	outline.visibleEdgeColor = Outline.Interactable;
	outline.hiddenEdgeColor = Outline.Interactable;
	outline.edgeStrength = 10;
	outline.edgeThickness = 3;
	outline.edgeGlow = 1;

	const outputPass = new OutputPass();

	effectFXAA = new ShaderPass(FXAAShader);
	effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);

	//selective bloom
	const addSelectiveBloomPass = () => {
		if (settings.enableBloom) {
			const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.25, 0.5, 0.85);
			bloomComposer = new EffectComposer(renderer);
			bloomComposer.renderToScreen = false;
			bloomComposer.addPass(renderPass);
			bloomComposer.addPass(bloomPass);

			const mixPass = new ShaderPass(
				new THREE.ShaderMaterial({
					uniforms: {
						baseTexture: { value: null },
						bloomTexture: { value: bloomComposer.renderTarget2.texture }
					},
					vertexShader: document.getElementById('vertexshader').textContent,
					fragmentShader: document.getElementById('fragmentshader').textContent,
					defines: {}
				}), 'baseTexture'
			);
			mixPass.needsSwap = true;
			composer.addPass(mixPass)
		}
	}

	//compose passes
	composer.addPass(renderPass);
	composer.addPass(outlinePass);
	composer.addPass(effectFXAA);
	addSelectiveBloomPass();
	composer.addPass(outputPass);

	window.addEventListener('resize', resize);
	window.addEventListener('pointermove', onPointerMove);
};

const rendererSetup = (surface) => {
	const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: surface });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(surface.width, surface.height);
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1;

	return renderer;
};

const css3DRendererSetup = (surface: HTMLDivElement) => {
	const css3DRenderer = new CSS3DRenderer({ element: surface });
	css3DRenderer.setSize(window.innerWidth, window.innerHeight);
	return css3DRenderer;
}

export const destroyScene = () => {
	if (!scene)
		return;

	if (renderer)
		renderer.dispose();

	if (domAttachmentContainer)
		domAttachmentContainer.remove();

	scene.clear();
	initialized = false;
}

export const createSceneWithContainer = (surface: HTMLCanvasElement, container: HTMLElement, css3DRenderSurface?: HTMLDivElement, UIOverlay?: HTMLDivElement) => {
	renderer = rendererSetup(surface);
	css3DRenderer = css3DRendererSetup(css3DRenderSurface);
	uiOverlay = UIOverlay;

	surfaceContainer = container;

	//invisible DOM element to attach HTML stuff I guess
	const domAttachment = document.createElement("div");
	domAttachment.hidden = true;
	domAttachment.setAttribute("id", "attachment");

	//canvas for putting text and stuff
	canvasWidth = 512;
	canvasHeight = 512;

	renderCanvas = document.createElement("canvas");
	renderCanvas.setAttribute("id", "renderCanvas");
	renderCanvas.setAttribute("width", canvasWidth.toString());
	renderCanvas.setAttribute("height", canvasWidth.toString());

	setBoiFallCountAndUpdateCanvasTexture(0);

	domAttachment.appendChild(renderCanvas);

	domAttachmentContainer = domAttachment;
	surfaceContainer.appendChild(domAttachment);

	//init scene
	init();

	//crosshair
	updateCrosshair(window.innerWidth, window.innerHeight);

	//stats
	stats = new Stats();
	container.appendChild(stats.dom);

	//add controls
	controls = new PointerLockControls(camera, surface);
	controls.pointerSpeed = 0.8;

	//key events
	const onKeyDown = (event: KeyboardEvent) => {
		const key = event.key.toLowerCase();
		if (!input.keys.includes(key)) {
			input.keys.push(key);
		}
	};
	const onKeyUp = (event: KeyboardEvent) => {
		const key = event.key.toLowerCase();
		if (input.keys.includes(key)) {
			input.keys = input.keys.filter((k) => k !== key);
		}

		input.keysTriggered[key] = false;
	};

	document.addEventListener('keydown', onKeyDown);
	document.addEventListener('keyup', onKeyUp);
	document.addEventListener('click', (event) => {
		if (event instanceof PointerEvent) {
			interactWithSelected(event);
		}
	});

	let isTouchCameraControllerOn = false;
	let cameraControllerTouchEvent = null;
	let initialCameraRotation = null;

	let isTouchMovementControllerOn = false;
	let movementControllerTouchEvent = null;
	let initialMovementVector = null;

	const checkTouchesForCameraController = (touches) => {
		for (let index = 0; index < touches.length; index++) {
			const touch = touches[index];

			if (touch.clientX > window.innerWidth / 2) {
				isTouchCameraControllerOn = true;
				cameraControllerTouchEvent = touch;
				initialCameraRotation = camera.rotation.clone();
				return true;
			}
		}

		return false;
	}

	const checkTouchesForMovementController = (touches) => {
		for (let index = 0; index < touches.length; index++) {
			const touch = touches[index];

			if (touch.clientX < window.innerWidth / 2) {
				isTouchMovementControllerOn = true;
				movementControllerTouchEvent = touch;
				initialMovementVector = player.body.position.clone(); //temp
				return true;
			}
		}

		return false;
	}

	//mobile
	document.addEventListener('touchstart', (e: TouchEvent) => {
		if (e.changedTouches.length == 0)
			return;

		input.touches.push(...e.changedTouches);
		checkTouchesForCameraController(e.changedTouches);
		checkTouchesForMovementController(e.changedTouches);
	});

	document.addEventListener("touchend", (e: TouchEvent) => {
		for (let index = 0; index < e.changedTouches.length; index++) {
			const touchEvent = e.changedTouches[index];
			input.touches = input.touches.filter((t) => t.identifier != touchEvent.identifier);

			if (!checkTouchesForCameraController(input.touches)) {
				isTouchCameraControllerOn = false;
				initialCameraRotation = null;
				cameraControllerTouchEvent = null;
			}

			if (!checkTouchesForMovementController(e.changedTouches)) {
				isTouchMovementControllerOn = false;
				movementControllerTouchEvent = null;
				initialMovementVector = null;

				input.stick.strength = 0;
				input.stick.angle = 0;
			}
		}
	});

	document.addEventListener("touchcancel", (e) => {
		console.log(e);
	});

	document.addEventListener("touchmove", (e) => {
		for (let index = 0; index < e.changedTouches.length; index++) {
			const touchEvent = e.changedTouches[index];
			const initialTouch = input.touches.find((t) => {
				return t.identifier == touchEvent.identifier;
			});

			if (!initialTouch)
				continue;

			const dx = touchEvent.clientX - initialTouch.clientX;
			const dy = touchEvent.clientY - initialTouch.clientY;

			if (cameraControllerTouchEvent && initialTouch.identifier == cameraControllerTouchEvent.identifier) {
				const rotationOffsetY = (dx / window.innerWidth) * Math.PI;
				camera.rotation.y = initialCameraRotation.y + rotationOffsetY;
			}

			if (movementControllerTouchEvent && initialTouch.identifier == movementControllerTouchEvent.identifier) {
				const rotation = new THREE.Euler(camera.rotation.x, camera.rotation.y, camera.rotation.z, "XYZ");

				const stickDirection = new THREE.Vector2(dx, dy);
				const stickUp = new THREE.Vector2(0, -1);
				const moveAmount = stickDirection.length();

				stickDirection.normalize();
				const angle = Math.atan2(stickDirection.y, stickDirection.x) - Math.atan2(stickUp.y, stickUp.x);

				input.stick.strength = moveAmount;
				input.stick.angle = angle;
			}
		}
	});

	document.addEventListener("orientationchange", function (event) {
		switch (window.screen.orientation.type) {
			case "landscape-primary":
				console.log("That looks good.");
				break;
			case "landscape-secondary":
				console.log("Mmmh… the screen is upside down!");
				break;
			case "portrait-secondary":
			case "portrait-primary":
				console.log("Mmmh… you should rotate your device to landscape");
				break;
			default:
				console.log("The orientation API isn't supported in this browser :(");
		}
	});


	resize();

	if (initialized)
		return;
	initialized = true;

	animate();
};

const loadingScreenWidthPercent = 50;
const loadingScreenHeightPercent = 15;

let loadingScreenDiv: HTMLDivElement;
let loadingScreenInnerDiv: HTMLDivElement;

THREE.DefaultLoadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
	console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
	uiOverlay.style.setProperty("background-color", "black");

	uiOverlay.style.display = "flex";
	uiOverlay.style.alignItems = "center";
	uiOverlay.style.justifyContent = "center";

	loadingScreenDiv = document.createElement("div");
	loadingScreenInnerDiv = document.createElement("div")

	if (!loadingScreenDiv || !loadingScreenInnerDiv)
		return;

	loadingScreenDiv.style.display = "flex";
	loadingScreenDiv.style.alignItems = "center";
	loadingScreenDiv.style.justifyContent = "center";
	loadingScreenDiv.style.backgroundColor = "grey";
	loadingScreenDiv.style.width = loadingScreenWidthPercent.toString() + "%";
	loadingScreenDiv.style.height = loadingScreenHeightPercent.toString() + "%";
	loadingScreenDiv.style.position = "relative";
	loadingScreenDiv.style.borderRadius = "8rem";

	loadingScreenInnerDiv.style.backgroundColor = "white";
	loadingScreenInnerDiv.style.width = loadingScreenWidthPercent.toString() + "%";
	loadingScreenInnerDiv.style.height = "100%";
	loadingScreenInnerDiv.style.position = "absolute";
	loadingScreenInnerDiv.style.left = "0";
	loadingScreenInnerDiv.style.borderRadius = "inherit";

	uiOverlay.append(loadingScreenDiv);
	loadingScreenDiv.append(loadingScreenInnerDiv);
};

THREE.DefaultLoadingManager.onLoad = function () {
	console.log('Loading Complete!');

	if (!loadingScreenDiv)
		return;

	loadingScreenDiv.style.setProperty("display", "none");
	loadingScreenDiv.style.setProperty("background", "none");

	uiOverlay.style.background = "none";
	uiOverlay.style.transition = "background 2s";
};

THREE.DefaultLoadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
	console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');

	const progress = (itemsLoaded / itemsTotal) * 100;
	loadingScreenInnerDiv.style.width = progress.toString() + "%";

	console.log(progress);
};

THREE.DefaultLoadingManager.onError = function (url) {
	console.log('There was an error loading ' + url);
};

export const lockControls = () => {
	if (!controls) return;

	if (controls.isLocked)
		return;

	controls.lock();
	input.keys = [];
};
