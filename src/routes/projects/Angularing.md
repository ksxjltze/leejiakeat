---
layout: project
title: "Angularing"
permalink: "projects/angularing/"
game-engine:

start-date: 2023-06-13
github-link: https://github.com/ksxjltze/angularing
description: Learning how to use Angular for frontend development.

project-icon: /images/angularing/angularing-logo.png
icon-animation: spin
icon-scale: 1.5
background: /images/angularing/angularing-background.png

text-color: white
text-background-color: rgba(0.0, 0.0, 0.0, 0.6)
text-background-offset-x: 95%
text-background-offset-y: 10%
text-background-size: 80%
text-background-repeat: no-repeat;
---

A simple project for learning the Angular framework.
Thanks to Vercel, you can see it in action [here](https://angularing.vercel.app/).

The project name is a work-in-progress, I'll most likely change it after I decide what I actually want to make (after the tutorial).

## Diary of sorts
<hr/>

### Day One - 03/06/2023
Created a repository from the Vercel Angular quickstart template. Went to sleep.

### Day Two - 04/06/2023
Did the Hello World on the tutorial and worked on the following lessons every once in a while. Learned about components, templates, routing, HTML interpolation, property binding, input/output pattern, services, etc.

I called it a day after completing lesson 11 (Route parameters).

Tutorial Link: [https://angular.io/tutorial/first-app](https://angular.io/tutorial/first-app)

### Day Three - 05/06/2023
Completed the tutorial and messed around with adding in custom filters for the search feature. Learned how to use a json server to fake a REST API, how to use template variables, how to fetch data from an endpoint using async methods, how to bind events and use array functions, etc.

After finishing the tutorial, I wasted a few hours trying to hack in a MongoDB integration for the vercel deployment to retrieve data from. Ultimately I gave up after running into polyfill problems and getting a massive headache. Instead, I created a second vercel project to act as a json server and fetched the data from there instead (courtesy of Ivo Culic on Medium, see the article [here](https://ivo-culic.medium.com/create-restful-api-with-json-server-and-deploy-it-to-vercel-d56061c1157a)).

Check out the API [here](https://quick-and-dirty-restful-api.vercel.app/).

As for setting up a proper database and REST APIs, that will have to wait for another day; when I get around to learning Spring (my future choice of backend framework).
I decided to end the day here, I'll need some time to think about what to do next.

### Some Day - 22/06/2023
Finally moving forward with something more interesting. I set up a backend using Spring Boot and MongoDB, finally I can start making the web apps of my dreams.
Learn more about my backend project [here](/projects/spring-booter/).

## Media
### Day One
<img src="/images/angularing/angularing-day-one.png"/>
<i>First day's results of working on the Angular tutorial.</i>

### Day Three
<div id="day-three">
    <img src="/images/angularing/angularing-day-three-home.png"/>
    <i>Home page.</i>
    <br><br>
    <img src="/images/angularing/angularing-day-three-filter.png"/>
    <i>Filtering by city name.</i>
    <br><br>
    <img src="/images/angularing/angularing-day-three-details.png"/>
    <i>Details page with form.</i>
</div>