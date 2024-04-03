---
layout: project
title: "Parcels"
permalink: "projects/parcels/"
engine: "PogEngine"
date: '2021-09-01'
endDate: '2022-04-01'
academic: True
school: DigiPen Institute of Technology Singapore
module: Software Engineering Project 3-4

background: "/images/pog-engine/pogengine.jpg"
description: 2D Point and Click Adventure Game.
lastUpdated: '03-04-2024'
---

Parcels is a 2D Point and Click Adventure Game with Visual Novel elements.
I was the technical lead of a team of 4 programmers in a group of 8 people (2 designers and 2 artists).

My main role was designing and implementing the core architecture of the game engine, other than assigning tasks and managing the overall state of the engine's implementation, as well as serving as the communication bridge between the other teams in our group.

## Architecture and Features
I was responsible for building the following systems.

### Component System
Core object architecture system heavily inspired by Unity's component system.<br/>
Implemented using good old inheritance, with some C++ templating and meta-programming tricks sprinkled in between.<br/>
Seemed to work well for a 2D game.

### Scripting
C++ Native scripting inspired by Unity's MonoBehaviour classes.
This feature went through a few iterations due to changing requirements and time constraints:
Starting with Lua, then transitioning to Mono C#, then finally C++ scripting.

### Serialization
Binary Serialization system, there was an attempt at JSON serialization alongside, but the cost of maintaining two systems was eventually deemed to not be worth it.

In hindsight, we should have started with JSON, as visually inspecting scene files in binary format turned out to not be a very human-friendly prospect.

### Reflection
To make things easier for everyone working with components and game objects, a reflection library was integrated with much effort, which you can find at: <a href="https://gitlab.com/LIONant/properties">LIONant properties</a> on GitLab. It makes heavy use of C++ macros, std::variant as well as std::visit to iterate through properties.

### Message Bus
I like decoupling things, which is why I coupled the message bus into everything.<br/>
A simple global message bus/event system that I heavily abused and overused for convenience.

### Debugging
The usual logging systems, frame time profiling, etc.