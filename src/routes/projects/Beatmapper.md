---
layout: project
title: "Beatmapper"
permalink: "projects/beatmapper/"
engine: "Unity"
date: '2019-10-01'
endDate: '2020-01-01'
academic: True
school: Ngee Ann Polytechnic
module: Capstone Project

src: https://github.com/dylanhan99/BeatMapper
description: A novel 2D rhythm game editor concept.

icon: /images/beatmapper/beatmapper-mascot.png


background: /images/beatmapper/beatmapper-title.png
---

2D Vertical Scrolling Rhythm Game beatmap player and editor.
Heavily inspired by osu's mania gamemode and its beatmap format.

The unique part of this editor is its ability to record the key strokes of the user, allowing them to directly map their input into the beatmap.
The idea is that a sufficiently skilled user would be able to "play" the notes into a beatmap instead of manually placing them one by one.

We owe this novel idea to our beloved professor, Oon Wee Chong.

This project was developed for the Capstone Project module at Ngee Ann Polytechnic and developed using the Unity game engine.
As a programmer in a team of 3, I was responsible for coding the main gameplay logic and beatmap editor.
The beatmap format is a simplified version of osu!mania's beatmap format, and stored as a CSV file.

<iframe width="100%" height="450" src="https://www.youtube.com/embed/_OeJhXVq6NM" title="BeatMapper Showcase" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

#### Hindsight
I was quite disappointed with myself with the outcome of this project, mainly because of how much better it could have been if not for my complacency.
The editor could have been so much more polished if I had spent more time working on it during the holidays. In its current state, this project is nothing more than a rough prototype.

In retrospect, Unity was not the best choice for this project, but it was the most familiar tool to us at the time, so we stuck with it.<br/>
We could have achieved more impressive results if we had decided to build a custom engine instead, but that's all in the past now.

#### Future
If we ever revisit this project, it would definitely have to be rebuilt from scratch in a custom engine, with support for note snapping, audio processing, importing files from other games, etc.