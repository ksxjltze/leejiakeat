---
layout: project
title: "Captain Jumper Boy"
permalink: "projects/captainjumperboy/"
engine: "Android Studio"

date: '2023-02-01'
endDate: '2023-03-01'

academic: True
school: DigiPen Institute of Technology Singapore
module: CSD3156 - Mobile and Cloud Computing 

src: https://github.com/ksxjltze/captain_jumper_boy
description: Simple Doodle Jump clone.

icon: /images/captainjumperboy/captainjumperboy-logo.png

background: /images/captainjumperboy/captainjumperboy-gameplay.png
priority: 2
---

CaptainJumperBoy is a simple 2D mobile game inspired by the classic Doodle Jump mobile game.
It was developed for the Mobile App Development portion of the CSD3156 module.

## Architecture
The game was developed solely in Android Studio, using Kotlin.
Due to project restrictions, game development solutions such as the Android NDK or Android GDK were not permitted for use in the development of this project.<br>

The engine uses a simple component-based entity system, achieved using object inheritance and polymorphism.
The rendering layer uses Android Canvas as its core, using matrix transformations to implement entity transform and camera systems.

## Cloud Features
Firebase Realtime database was used to store global leaderboard data. 
Using Firebase authentication, users of the application are able to sign up, log in, and save their highscores onto the cloud.

## Media

### Presentation
<iframe title="CaptainJumperBoy presentation" src="https://drive.google.com/file/d/127-aCRGw0gI-yyn3SyQKWkeVlIlS-4Rc/preview" width="100%" height="480em" allow="autoplay" allowfullscreen="allowfullscreen"></iframe>

### Gameplay
<iframe title="CaptainJumperBoy gameplay" src="https://drive.google.com/file/d/1kHi_ut2HEbvpUdRwsUdL6lzstrGT3kgg/preview" width="100%" height="480em" allow="autoplay" allowfullscreen="allowfullscreen"></iframe>