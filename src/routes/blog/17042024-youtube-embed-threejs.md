---
title: "Embedding a YouTube video into a threejs Scene"
date: '2024/04/17'
---

This is probably my first actual blog post.

## How do I render a YouTube video in a threejs WebGL scene?
It's not possible.

Although threejs does provides a [VideoTexture](https://threejs.org/docs/#api/en/textures/VideoTexture) class to render the contents of a HTML video element, YouTube does not allow users to directly access the underlying media source file.
Therefore, there is no way (that I know of) to render a youtube video onto a texture in the scene.

But fret not, for threejs has another trick up its sleeve. Enter the [CSS3DRenderer](https://threejs.org/docs/#examples/en/renderers/CSS3DRenderer), a renderer that applies 3D transformations to DOM elements via the CSS transform property.

Though it does come with several limitations, it is sufficient for the purposes of displaying a YouTube video together with WebGL content using threejs.

## How do I use the CSS3DRenderer to display the YouTube video?
The method that I use is simple, but probably kind of hacky.<br/>
Simply render the embedded YouTube video's iframe into an overlaying HTML Element.

The overlay sits on top of the WebGL canvas (using the 'z-index' CSS property), and perspective transformations done by the CSS3DRenderer make it seem as though the video is being rendered into the WebGL scene.

```css
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    outline: none;
    width: 100vw;
    height: 100vh;

    z-index: 2;
}
```
<p class="figure-label">Code Snippet: Overlay CSS</p>

```typescript
const css3DRendererSetup = (surface: HTMLDivElement) => {
	const css3DRenderer = new CSS3DRenderer({ element: surface });
	css3DRenderer.setSize(window.innerWidth, window.innerHeight);
	return css3DRenderer;
}
```
<p class="figure-label">Code Snippet: Initializing a CSS3DRenderer</p>

```typescript
const render = () => {
    ...
	css3DRenderer.render(cssScene, camera);
}
```
<p class="figure-label">Code Snippet: Rendering a scene using the CSS3DRenderer</p>

```typescript
if (object instanceof THREE.Mesh) {
    const geometry = object.geometry;
    geometry.computeBoundingBox();
    const boundingBox: THREE.Box3 = geometry.boundingBox;

    const magicOffset = 5;
    const magicScale = 0.01;

    boundingBox.min.y -= magicOffset;
    boundingBox.max.y -= magicOffset;

    const screenPosition = boundingBox.min.clone()
        .add(boundingBox.max)
        .divideScalar(2);

    //create css3D object
    css3DRenderer.domElement.append(element);
    const css3DObject = new CSS3DObject(element);
    css3DObject.position.copy(screenPosition);
    css3DObject.rotateY(Math.PI);
    css3DObject.scale.setScalar(magicScale);
}
```
<p class="figure-label">Code Snippet: Adding a CSS3DObject to the scene.</p>

Code quality aside, the above code creates a new CSS3DObject and adds it to the "CSS Scene", where it will later be rendered by the CSS3DRenderer.

As long as the transforms match up, the illusion of the YouTube video appearing to be part of the WebGL scene should appear nearly flawless (as long as the user doesn't decide to resize the browser's zoom, which is one of the limitations of the CSS3DRenderer at time of writing).

Side Note: Due to some bad decisions made during the 3D modeling process, I had to resort to using some magic numbers to make the geometry fit properly within the scene.

## How do I control the YouTube video from within the scene?
Say you want to have your users interact with objects in your scene, that correspond to controls on the embedded YouTube video player.
Enter the [YouTube Player API](https://developers.google.com/youtube/iframe_api_reference).

TODO

## I can see the YouTube video through walls! What do I do?

TODO

### Naive occlusion
Let us assume that we just want to display the YouTube video on some sort of plane.

Therefore, let us generate 4 "control points" to determine the visibility of said plane, and then perform some simple raycast checks to determine if the YouTube video should be rendered from the user's point of view.
```
if (object instanceof THREE.Mesh) {
    const geometry = object.geometry;
    geometry.computeBoundingBox();
    const boundingBox: THREE.Box3 = geometry.boundingBox;

    const magicOffset = 5;
    const magicScale = 0.01;

    boundingBox.min.y -= magicOffset;
    boundingBox.max.y -= magicOffset;

    const screenPosition = boundingBox.min.clone()
        .add(boundingBox.max)
        .divideScalar(2);

    //lets naively assume that z forward is normal for now
    //project to x and y

    const v = boundingBox.max.clone().sub(boundingBox.min);

    const pB = boundingBox.max.clone();
    const pC = boundingBox.min.clone();

    const vCA = v.clone().projectOnVector(new THREE.Vector3(0, 1, 0));
    const vCD = v.clone().projectOnVector(new THREE.Vector3(1, 0, 0));

    const pA = pC.clone().add(vCA);
    const pD = pC.clone().add(vCD);

    //create css3D object
    css3DRenderer.domElement.append(element);
    const css3DObject = new CSS3DObject(element);
    css3DObject.position.copy(screenPosition);
    css3DObject.rotateY(Math.PI);
    css3DObject.scale.setScalar(magicScale);

    //visibility points for occlusion check
    css3DObject.userData.visibilityPoints = [pA, pB, pC, pD];
    cssScene.add(css3DObject);
}
```
<p class="figure-label">Code Snippet: Computing visiblity points for occlusion check.</p>

```typescript
const checkIntersectingObjectsForCSS3D = () => {
	//naive intersect check for occlusion, idk
	cssScene.children.forEach((child) => {
		
		//making a kinda hacky assumption here
		if (!child.userData.visibilityPoints)
			return;

		//assume hidden unless any "control" point is visible, or something like that
		child.visible = false;
		child.userData.visibilityPoints.forEach((point) => {
			raycaster.set(camera.position, point.clone().sub(camera.position));
			const intersects = raycaster.intersectObjects(scene.children);

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
	});
};
```
<p class="figure-label">Code Snippet: Hardcoded checks for visibility</p>

### Proper occlusion
Somehow compute the occluding pixels using ShaderMaterial and do some clipping (or so I think)

TODO