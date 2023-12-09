---
layout: project
title: "Canvars"
permalink: "projects/canvars/"
game-engine: "AWS Amplify"

start-date: 2023-03-01
end-date: 2023-04-01

school-project: True
school: DigiPen Institute of Technology Singapore
module: CSD3156 - Mobile and Cloud Computing 

github-link: https://github.com/CloudyBestFriends/canvars
description: Portfolio Showcase Cloud Web App.

project-icon: /images/canvars/matt.png
icon-animation: bulge
icon-radius: 100%
icon-scale: 1.25
background: /images/canvars/canvars-carousel.png

text-color: white
text-background-color: rgba(0.0, 0.0, 0.0, 0.4)
text-background-offset-y: 0
---

Canvars is a simple portfolio showcase web app created using AWS Amplify and ReactJS.
Initially planned to have a Django backend, which was unfortunately scrapped due to time constraints.
The web app is longer in service.

<hr/>

## Responsibilites
### AWS Administration
I was responsible for setting up the IAM Identity Centre accounts and roles for my team members.
I created an AWS organization and setup the necessary permissions for collaboration on the project.

<img src="/images/canvars/canvars-iam-users.png" width="100%">
<i>IAM Identity Center Users</i>

### Development
I was responsible for implementing the project management page, user authorization, as well as the carousel on the home page.
The projects page allows users to create and delete projects that they wish to display. Only authorized users, i.e. project owners are allowed to view and delete their own projects.

## Frontend
ReactJS was used to build the UI of the web app, using additional frameworks such as React Bootstrap and React Router to speed up the development process.
AWS Amplify components were also used, to some extent, to import UI designed in figma.

## Backend
The backend framework that we used was AWS Amplify, which lets us focus our efforts on the front end.
The AWS Amplify backend automatically allocates AWS resources such as AppSync for the GraphQL API, S3 storage for images, DynamoDB for database, etc.

Modifying the database was done through AWS Amplify Studio, making it easy to create and modify database schemas using Data Models (No Code).

<img src="/images/canvars/canvars-amplify-data-model.png" width="100%">
<i>Example Data Model</i>
<img src="/images/canvars/canvars-ci-cd.png" width="100%">
<i>Example Deployment</i>

### Authentication
AWS Auth was used for user authentication.

### Original Plan
The original plan for this project was to use the Django python framework for the backend, and React for the frontend.
The Django backend would then communicate with the React frontend through REST API calls.
Unfortunately, due to a rushed project schedule, unfamiliarity with the framework, and the steep learning curve, we dropped this approach in favour of AWS Amplify.

## Media
### Projects Page
<img src="/images/canvars/canvars-projectlist.png">

### Project Demo
<iframe src="https://drive.google.com/file/d/1ccyuTSwQmTK3wzOKlm3AU4OC7l_bZoag/preview" width="100%" height="480em" allow="autoplay" allowfullscreen="allowfullscreen"></iframe>