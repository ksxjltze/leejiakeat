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

import * as CANNON from 'cannon-es';
import CannonUtils from './utils/cannonUtils';
import CannonDebugRenderer from './utils/cannonDebugRenderer';

const boxGeom = new THREE.BoxGeometry();
const sphereGeom = new THREE.SphereGeometry();

const standardMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

const clock = new THREE.Clock();
const modelLoader = new GLTFLoader();

const FORWARD = new THREE.Vector3(0, 0, -1);
const RIGHT = new THREE.Vector3(1, 0, 0);

let composer: EffectComposer;
let bloomComposer: EffectComposer;
let effectFXAA, outlinePass;

let stats;
let renderer;

let scene: THREE.Scene;

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
	fallCount: 0
};

let debugCanvas;

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
	body: undefined
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
	object3D: THREE.Object3D,
	body: CANNON.Body
};

function ToCannonVec3(vector) {
	return new CANNON.Vec3(vector.x, vector.y, vector.z);
}

function ToCannonQuat(quaternion) {
	return new CANNON.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
}

function ToCannonVec3Scaled(vector, scale) {
	return new CANNON.Vec3(vector.x * scale, vector.y * scale, vector.z * scale);
}

function createPhysicsObject(mesh: THREE.Object3D, body: CANNON.Body) {
	const object: PhysicsObject = {
		object3D: mesh,
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

	const boiSpeed = 5;
	const boundsLength = 50;

	if (!boi.object)
		return;

	const body = boi.object.body;

	//TODO: LOOK AT
	const flip = (body) => {
		const quat = new THREE.Quaternion();
		quat.copy(body.quaternion);

		quat.multiply(new THREE.Quaternion(0, 1, 0, 0));
		body.quaternion.set(quat.x, quat.y, quat.z, quat.w);
	};

	//walk if upright
	const upVector = new THREE.Vector3(0, 1, 0);
	const currentVector = upVector.clone().applyQuaternion(body.quaternion);

	if (upVector.dot(currentVector) < 0.2) {
		return;
	}

	switch (boi.state) {
		case 1:
			body.position.x += boiSpeed * dt;
			if (body.position.x > boundsLength) {
				boi.state = BoiState.WALK2;
				flip(body);
			}
			break;
		case 2:
			body.position.x -= boiSpeed * dt;
			if (body.position.x < -boundsLength) {
				boi.state = BoiState.WALK1;
				flip(body);
			}
			break;
	}
}

const update = (dt) => {
	updateBoi(dt);
}

const animate = () => {
	const dt = clock.getDelta();
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
};

const checkIntersectingObjects = () => {
	raycaster.setFromCamera(pointer, camera);

	// calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects(scene.children);

	if (intersects.length > 0) {
		const selectedObject = intersects[0].object;

		setSelectedObject(selectedObject);

		if (!selectedObject.userData.selectable)
			selectedObjects = [];

		outlinePass.selectedObjects = selectedObjects;
	}
}

const render = () => {
	checkIntersectingObjects();

	if (bloomComposer && settings.enableBloom) {
		scene.traverse(darkenNonBloomed);
		bloomComposer.render();
		scene.traverse(restoreMaterial);
	}

	composer.render();
}

const interactWithSelected = () => {
	if (selectedObjects.length == 0)
		return;

	const selected = selectedObjects[0];
	if (selected.userData.onInteract) {
		selected.userData.onInteract();
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
	const cameraForward = FORWARD.clone().applyEuler(camera.rotation);
	const cameraRight = RIGHT.clone().applyEuler(camera.rotation);

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

		object.object3D.position.copy(object.body.position);
		object.object3D.quaternion.copy(object.body.quaternion);
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

		if (bloomComposer)
			bloomComposer.setSize(width, height);

		composer.setSize(width, height);

		effectFXAA.uniforms['resolution'].value.set(1 / width, 1 / height);

		camera.aspect = width / height;
		camera.updateProjectionMatrix();
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

const createTexturePlane = (width, height, texture) => {
	const planeGeometry = new THREE.PlaneGeometry(width, height);
	const planeMaterial = new THREE.MeshStandardMaterial({ map: texture });
	const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);

	return planeMesh;
}

const createInteractableObject = (object, onInteract) => {
	object.userData.selectable = true;
	object.userData.onInteract = onInteract;
};

const GLTFGroupToStaticBodies = (gltf, scale?: THREE.Vector3) => {
	if (!scale)
		scale = new THREE.Vector3(1, 1, 1);

	const group = gltf.scene.children[0];
	const bodies = [];

	traverseGLTFSceneWithPredicate(gltf.scene, (object) => {
		if (object instanceof THREE.Mesh) {
			object.geometry.scale(scale.x, scale.y, scale.z);
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
const traverseGLTFSceneWithPredicate = (scene, fn: (object: any) => boolean) => {
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

	traverseGLTFSceneWithPredicate(scene, materialNameMatches);
	return result;
};

const setBoiFallCount = (newFallCount: number) => {
	boi.fallCount = newFallCount;

	const ctx: CanvasRenderingContext2D = debugCanvas.getContext("2d");
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, 256, 256);
	ctx.fillStyle = "black";
	ctx.font = "24px Arial bold";
	ctx.fillText("Times Kicked out: " + boi.fallCount.toString(), 24, 128);

	if (fallCountScreen) {
		fallCountScreen.material.map.dispose();
		const canvasTexture = new THREE.CanvasTexture(debugCanvas);
		fallCountScreen.material.map = canvasTexture;
	}
};

const init = () => {
	scene = new THREE.Scene();
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
			console.log(event);
			if (event.body === boi.object.body) {
				const ctx: CanvasRenderingContext2D = debugCanvas.getContext("2d");
				setBoiFallCount(boi.fallCount + 1);
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

		const isNameMatch = (object, name) => {
			return object.name == name;
		};

		//lazy hack 2
		let lightIndex = 0;
		traverseGLTFSceneWithPredicate(gltf.scene, (object) => {
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

			if (isNameMatch(object, "ScreenMesh_1")) {
				object.material.map = stronkBoiTexture;
				stronkBoiObject = object;

				createInteractableObject(object, () => {
					object.material.color = new THREE.Color(Math.random() * 0xFFFFFF);
				});
			};

			if (isNameMatch(object, "Screen2Face")) {
				fallCountScreen = object;
				const canvasTexture = new THREE.CanvasTexture(debugCanvas);
				object.material.map = canvasTexture;
			};

			if (isNameMatch(object, "Screen3Mesh_1")) {
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
		console.log("Loaded Skinned model: ", gltf);
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
			mass: 1
		});

		body.addShape(shape, new CANNON.Vec3(0, -1.4, 0));
		body.position = ToCannonVec3(gltf.scene.position);
		body.quaternion = ToCannonQuat(gltf.scene.quaternion);

		boi.object = createPhysicsObject(gltf.scene, body);
		// boi.object.body.angularFactor = new CANNON.Vec3(0, 1, 0);
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
		console.log("Loaded Skinned model: ", gltf);
		gltf.scene.position.set(10, -1.65, 8);
		scene.add(gltf.scene);
	},
		undefined,
		(err) => {
			console.error(err);
		});

	modelLoader.load('/models/table.glb', (gltf) => {
		console.log("Added model: ", gltf);
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
		console.log("Added model: ", gltf);
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
		traverseGLTFSceneWithPredicate(gltf.scene, (object) => {
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
	let lightPosition = new THREE.Vector3(0, 3, -10);
	const domeLight = new THREE.PointLight(0xFFFFFF, 100, 0, 1);
	lightPosition = new THREE.Vector3(-80, 20, 0);
	domeLight.position.set(lightPosition.x, lightPosition.y, lightPosition.z);
	scene.add(domeLight);

	const domeLightMat = standardMat.clone();
	domeLightMat.emissive = new THREE.Color(0xFFFFFF);
	domeLightMat.emissiveIntensity = 1;

	const domeLightMesh = new THREE.Mesh(sphereGeom, domeLightMat);
	domeLightMesh.position.copy(lightPosition);
	domeLightMesh.scale.setScalar(5);
	scene.add(domeLightMesh);

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
	outline.visibleEdgeColor = new THREE.Color(1, 0, 1);
	outline.hiddenEdgeColor = new THREE.Color(1, 0, 1);
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

export const createSceneWithContainer = (surface: HTMLCanvasElement, container: HTMLElement) => {
	renderer = rendererSetup(surface);
	init();

	surfaceContainer = container;

	//invisible DOM element to attach HTML stuff I guess
	const domAttachment = document.createElement("div");
	domAttachment.hidden = true;
	domAttachment.setAttribute("id", "attachment");

	//canvas for putting text and stuff
	debugCanvas = document.createElement("canvas");
	debugCanvas.setAttribute("id", "debugCanvas");
	debugCanvas.setAttribute("width", "256");
	debugCanvas.setAttribute("height", "256");

	setBoiFallCount(0);

	domAttachment.appendChild(debugCanvas);

	domAttachmentContainer = domAttachment;
	surfaceContainer.appendChild(domAttachment);

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
			interactWithSelected();
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

export const lockControls = () => {
	if (!controls) return;

	if (controls.isLocked)
		return;

	controls.lock();
	input.keys = [];
};
