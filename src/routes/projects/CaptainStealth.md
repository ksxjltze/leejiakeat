---
layout: project
title: "Captain Stealth"
permalink: "projects/captainstealth/"
game-engine: "AlphaEngine"

start-date: 2021-01-01
end-date: 2021-04-01

school-project: True
school: DigiPen Institute of Technology Singapore
module: Software Engineering Project 2

github-link: https://github.com/ksxjltze/StarBangBang
description: Stealth game where the player has to juggle two characters.

project-icon: /images/captain-stealth/captain-stealth-player.png
icon-animation: flip
icon-scale: 1.5
background: /images/captain-stealth/captain-stealth-menu.png

text-color: white
text-background-color: rgba(0.0, 0.0, 0.0, 0.4)
text-background-offset-y: 15%
---

2D Top-down stealth game developed in C++. Switch between two characters to work together to escape the prison.
As the technical lead of a team of 4 programmers, I was responsible for designing and implementing the core architecture of the game.
Download and play it [here](https://drive.google.com/file/d/11V2Er6BbWhtEXWpuYWKSHtf8t8CjySkD/view?usp=sharing) (installer).

<hr/>

## Theme
Prison break.

## Gameplay
- Get to the end of the level while avoiding detection by the guards.
- Switch between two characters.
- Players need to find keys to open the door to the next area.
- Hide in vents to temporarily evade guards
- Interact with objects to distract guards.
- Enter stealth mode to sneak past guards.

## Architecture and Features
I was responsible for building the following systems.

### Component System
Really simple component based system inspired by Unity's scripting system (MonoBehaviour).
At this point in time I did not have a clear idea on what Entity Component Systems (ECS) really were.

Hence, I decided to go with a inheritance based component system.
Components inherit from a base component class, and override behaviours on functions such as Start(), Update(), etc.
As a side note, the CRTP C++ pattern was used for deep cloning.

### Scripting
Scripting is a loose term here, mainly used to seperate engine and gameplay code.
Scripts are functionally identical to components, just with a different class name and updated in a seperate loop.

### Audio
Fmod.

### Game State Manager
Simple GSM using function pointers to invoke behaviours for each scene.

### Message Bus
Simple Event System using listeners and inheritance.

### Level Editor
Edits tile maps and saves them on the disk.

#### Tile Map
Tile map is tile map.

### Camera
View Matrix does view matrix things.

## Graphics
Simple wrapper that calls AlphaEngine rendering code. All graphics in the game uses 2D quads for rendering.

## Other Features
These are some of the other features that were not implemented by me.
- Pathfinding
- Physics
- Collision

## Media
<iframe src="https://drive.google.com/file/d/1OaPQCj2O88W9qHDNm-h-FbGT-6YiNMLh/preview" width="100%" height="480" allow="autoplay" allowfullscreen></iframe>
<i>Gameplay Demo</i>

<img src="/images/captain-stealth/captain-stealth-menu.png">
<i>Main Menu</i>

<img src="/images/captain-stealth/captain-stealth-gameplay.png">
<i>Gameplay</i>

<img src="/images/captain-stealth/captain-stealth-vent.png">
<i>Vent</i>

<img src="/images/captain-stealth/captain-stealth-player.png">
<i>Captain Stealth Sprite</i>

<img src="/images/captain-stealth/captain-stealth-prisoner.png">
<i>Prisoner Sprite</i>
