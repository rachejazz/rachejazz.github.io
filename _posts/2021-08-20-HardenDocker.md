---
title: Making Your Docker Experience More Secure, Image Hardening
layout: posts
author: Divya
---

## Little little server have you any hole? yes sir yes sir /bin /etc and more!

### History
While I was working as an intern few months back, I was told to build docker images and upload them to the [ECR](https://aws.amazon.com/ecr/])
That's an easy task right? Just a couple of `docker build` and `docker push` (tagging, etc) and you're done.
Not when you also happen to work with the security team who said this:

> Have you hardened it?

**I'M SORRY WHAT?**<br>

Turns out I was too inexperienced while dealing with Container security.

### Why don't we just continue about docker. Hardening looks over-done...?
No. Security walks WITH Operations. Read on.


### What's Hardening
An example of a Dockerfile:
```
FROM alpine:3.8

LABEL maintainer rachejazz

ARG SERVICE_USER
ARG SERVICE_HOME

ENV SERVICE_USER ${SERVICE_USER:-app}
ENV SERVICE_HOME ${SERVICE_HOME:-/home/${SERVICE_USER}}

RUN \
	mkdir -p ${SERVICE_HOME} && \
	adduser -h ${SERVICE_HOME} --disabled-password -s /bin/bash -u 1000 ${SERVICE_USER} && \
	chown -R ${SERVICE_USER}:${SERVICE_USER} ${SERVICE_HOME}

USER ${SERVICE_USER}
WORKDIR ${SERVICE_HOME}
VOLUME ${SERVICE_HOME}

ENTRYPOINT [ "/bin/ash" ]
```
Having a docker container with only the above settings makes it simple open a linux machine running alpine with a given user and home directory.
Now, to run an application on this container, you probably wouldn't need `chmod` or `bash` for it to run, right?
But a potential threat actor would need :)
To get priviledged access of the running containers.

### Potential "harmful" directories/binaries of a linux system
To name a few, 
