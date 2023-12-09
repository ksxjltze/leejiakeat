---
layout: project
title: "Spring Booter"
permalink: "projects/spring-booter/"
game-engine:

start-date: 2023-06-16
github-link: https://github.com/ksxjltze/rest-service
description: Learning how to use Spring boot for backend development.

project-icon: /images/spring-booter/spring-booter-logo.png
icon-animation: bulge
icon-scale: 1.25
icon-radius: 100%

background: /images/spring-booter/spring-booter-background.png
text-background-color: rgba(0.0, 0.0, 0.0, 0.5)
text-background-offset-x: 95%
text-background-offset-y: 10%

text-color: white
---

A simple project for learning the Spring Boot framework.
See the tutorial [here](https://spring.io/guides/gs/rest-service/#scratch).

The plan is to use this project to complement another project that I have, [Angularing](/projects/angularing/).
This backend project uses various Spring libraries and MongoDB for quick development.
Using Spring HATEOAS, the REST API has support for hypermedia through the HAL format.
Check the API out [here](https://oyster-app-k3g3w.ondigitalocean.app/).

<hr/>

## Dependencies:
- Spring Data REST
- Spring Data MongoDB
- Spring Web
- MongoDB Atlas

## CI/CD:
To make things easier for me, I decided to go with a CI/CD approach, allowing me to focus more on development instead of fussing about with deploying my application.

Initially I was going to use GitHub Actions as my CI/CD platform, but I got so frustrated getting sidetracked and trying to get Kubernetes to work that I decided to just use DigitalOcean's App platform. Now when I push a commit, it automatically deploys my backend application to the cloud, hassle free.

### How it works
When I push a commit, the DigitalOcean App platform builds a docker image using the Dockerfile in my repository. It runs some tests, then deploys it to the cloud.
This process is surprisingly simple and intuitive, considering the absolute pain that Kubernetes is.

```docker
FROM eclipse-temurin:17-jdk-alpine
ARG DB_USER
ARG DB_PASSWORD
ARG DB_DATABASE
COPY . .
RUN ./gradlew build
ENTRYPOINT ["java","-jar","build/libs/rest-service-0.0.1-SNAPSHOT.jar"]
```
<i>The docker file used for deployment.</i>

The docker file that I'm using isn't quite the best, I could further improve it by using a multi-stage build to reduce the size of the final image and improve performance. But I'm pretty happy with what I have, and I decided that I would just move on for now.

### Environment Variables
For some reason, I struggled a lot with these. At first, I was simply wondering how I could keep sensitive data (Database credentials) out of prying eyes, so I created an env.properties file to read in during runtime and added it to my .gitignore file. It was all fine and dandy until I tried to put the app into a docker image, then I ran into the headache of figuring out how to pass my variables to the app without exposing it in the image. I couldn't simply copy the env.properties file, so I had to do a little digging. 

Fortunately, docker supports environment variables, and I got it working fine locally; but then I had a huge headache wondering why my environment variables weren't being set properly when building in the cloud. 

This drove me insane, and I wasted a good few hours trying figure this out. In the end I gave up, went to sleep, and somehow immediately figured it out when I woke up the next day. It turns out that I forgot to set the build time variables in my docker file, so the secrets that I had in my cloud weren't being set for build time. 

As for why this didn't affect my local build, I forgot to account for my env.properties file still being read into my project's application.properties, which meant that the environment variables were still accessible during build time locally, but not on the cloud.

### Why DigitalOcean
It has a nice 2 month trial period where you can play around with $200 worth of credits. This was good enough for me, so I decided to just go with it and think about changing cloud providers 2 months later.

## Project Icon
<img width="100%" src="/images/spring-booter/spring-booter-logo.png"/>

Curious about where the icon comes from? I generated it using Stable Diffusion, I like to think that it looks pretty decent for a beginner.
See the beginner's guide [here](https://stable-diffusion-art.com/beginners-guide/).
