---
layout: project
title: "SeeSay"
date: '2023-08-21'

background: "/images/seesay/seesayclient.png"
description: "SUTD What The Hack 2023 Submission"
---

Simple Web App built for SUTD What The Hack 2023.
SeeSay is a simple web application that utilizes third party APIs to describe an image captured using the device's camera, using text-to-speech to play audio back to the user.

## Demo
Check out the demo video [here](https://www.youtube.com/watch?v=4rTVPL7go5M).
<iframe width="100%" height="600" src="https://www.youtube.com/embed/4rTVPL7go5M" title="SeeSay Demo 2 Web App" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### Client
If the link still works, you can view the client application [here](https://wth-so-good-2023-see-say.vercel.app/).
Unforunately, unlike the client, which was hosted on Vercel, hosting the backend on Azure costs money (or well, student credits), so it's been taken down indefinitely.
As a result, none of the functional parts of the application actually work.

Here's a screenshot of the client:
<img alt="Client Screenshot" src="/images/seesay/seesayclient.png"/>

<br/>

## Responsibilities
As part of team SoGood, my role in this project was to implement and host the web application and its backend.
Angular was used to build the front-end application and Flask was used for the backend service.

My team mates were responsible for everything else, including the UX design, coming up with ideas, client assets, prompting, LLM research, API experimentation,

## Looking Back
Personally, this project largely served as practice for my then upcoming job at PSA International as a full-stack Software Engineer Intern.
The Angular frontend and Flask backend communicated using REST APIs, with the backend forwarding data to and from the frontend to third party APIs for processing by LLMs.

This project helped to polish my at the time nascent frontend development skills, while also providing me the opportunity to try using Flask.
Flask is cool, it's so lightweight and it just works, barely, if any configuration is needed out of the box. 
I imagine that its nature lends itself very well to quick iteration and rapid prototyping.

The frontend client application was deployed on Vercel.
The backend application was deployed on Microsoft Azure Cloud using its Web App service.
As for why I chose Azure, it was because I had free student credits to spare and I didn't want them to go to waste.

Hackathons are fun.

## Random Social Media Plug
Click [me](https://www.linkedin.com/posts/wilfred-ng_last-weekend-at-the-sutd-what-the-hack-activity-7103237214892933120-fyNE?utm_source=share&utm_medium=member_desktop).