---
title: I told my Alexa to merge develop to main
layout: posts
author: Divya
---
## Are you lazy like me? If you love automation, read on.

### How I came up with the idea
Like any good student, I am preparing for my certifications and hence looking around for potential
opportunities to learn more ways of automating infra workflow. This is when I stumbled on [this blog](https://www.jenkins.io/blog/2019/02/26/jenkins-alexa-voice-controlled-cicd/)

> and I had my Bodhi Tree moment.

### Deployment cycle - the usual
In a usual deployment cycle, a devops engineer might cover the following:

*	Creation of a release branch
*	Developers merge feature branches to this branch
*	Release branch with features, is sent for review
*	Once approved, feature gets merged into production branch
*	Deployment pipelines triggered
*	No errors? Voila, deployment is live!

### Alexa! Deploy my code: where?
Now for alexa to participate in this workflow, the following is the mind map I have taken:

*	Get any Conversational User Interface Design Platform
*	Need an Invocation Name
*	Use Intents
*	Have an Endpoint Action
*	Host It!
