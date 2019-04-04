---
title: Automatically create merge requests through gitlab api
catalog: true
date: 2019-04-03 22:14:12
subtitle: Laziness creates efficiency
header-img: tree.jpg
tags:
  - gitlab
  - bash
  - node
---

## Background

Kubernetes is the new trend to manage cloud-based applications and also our main tool for orchestration. Each of our service is running inside an individual docker container and we use [helm charts](https://helm.sh/docs/developing_charts/) to configure each pod. For codebase management, we use gitlab, which is perfect for collaboration inside a team that hosts code server by themselves.

In production, everytime that we update our service version (either front end or back end), we need to update the hash inside the helm charts. Since we have a requirement for release notes to include **bug fix** or **new features**, **related commits** or **tickets** have to be included inside the body of gitlab merge request.

We are all lazy developers and try to avoid tedious work that could be automated by codes.

So the **workflow** I want to achieve is that whenever we merge a feature branch to the **master**, we collect all the **related issues** and **squashed commits**. Ideally, we set a merge request **interval** to avoid too frequent merge requests. Then we compare the latest master hash and the one in the helm charts, checking if the interval is longer enough for us to create a new merge request. Last but not the least, the whole step should be a phase in the gitlab CI.

Luckily, [gitlab API](https://docs.gitlab.com/ee/api/) provides all the functions we need.

## Tools

- jq
- yq
- gsed(sed)
- curl

## Step by step

## Things to improve

## Summary
