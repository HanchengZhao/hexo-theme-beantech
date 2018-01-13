---
title: Deploy a react app in kubernetes
catalog: true
date: 2018-01-13 10:05:28
subtitle:
header-img: "tree.jpg"
tags:
- Kubernetes
- Reactjs
- Cloud
- Docker
---

## Task: Deploy a react app in kubernetes 
> make sure cli tools such as node, docker, kubectl are installed

## Steps:
1. Use [create-react-app](https://github.com/facebookincubator/create-react-app) tool to generate a new project
    - `create-react-app new-app`
    - `cd new-app`
2. Configure a [Dockerfile](https://docs.docker.com/engine/reference/builder/) for the react app
    - use [alpine-node](https://github.com/mhart/alpine-node) as base docker image(Minimal Node.js Docker Images)
        ```docker
        # example
        # create a production build
        FROM mhart/alpine-node AS build
        WORKDIR /app
        COPY . .
        RUN npm run build
        
        #serve the built app
        FROM mhart/alpine-node
        RUN npm install -g serve
        WORKDIR /app
        COPY --from=build /app/build .
        CMD [ "serve", "-p 80", "-s", "."]
        ```
    - build the image: `docker build -t $repo-name .`
    - run it with `docker run -p 8080:80 $repo-name`, go to `localhost:8080`
3. Deploy your app to kubenetes cluster
    - push your local image to a remote repo: `$ docker push $DOCKER_ID_USER/repo:tag` to docker hub 
    - create a new deployment: `kubectl run $deployment-name --image=$image-location --port=80`
    - expose your service through NodePort: `kubectl expose deployment/$deployment-name --type="NodePort" --port 80`
    - get the node $name: `kubectl get node`
    - get the service external $port: `kubectl describe services/$service-name`
    - check the app out in the brower: `$nodename:$port`

## References 

- [Running React app inside a Docker container](https://hackernoon.com/running-react-app-inside-a-docker-container-27136a75916b)
- [Building and Deploying a Containerised React App and Microservice Using the Same OpenAPI Contract](http://connect.cd/2017/11/building-and-deploying-a-containerised-react-app-and-microservice-using-the-same-openapi-contract/)
