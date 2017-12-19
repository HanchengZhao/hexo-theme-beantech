---
title: Cloud-Based-Web-Tools-For-VIP
catalog: true
date: 2017-11-18 21:10:56
subtitle:
header-img: "longwood.JPG"
tags:
- Cloud
- Reactjs
- Firebase
categories:
- Projects
---


> Reactjs, Firebase, Cloud Functions, serverless architecture, material ui


The project that I have been working on recently is a cloud-based web tool for ASU to manage new teams, announcements, student/project application and peer evaluation. [Github link](https://github.com/HanchengZhao/VIP-web)

So it is basically a CMS(content management system), but far more lightweight than Drupal, Sharepoint or WordPress. It is still an SPA (single page application), yet a huge upgrade of my last year's peer evaluation tool for UD.

It has been a fun journey so far and I have tried many brand new things and received new experience, so it is worth recording some thoughts along the way.

## Why cloud-based serverless architecture?

This is a fundamental question why we choose firebase as our backend or even infrastructure. 
First of all, serveless does not mean **"no server at all"**, it only means that end users or developers no longer need to build or maintain their own servers. Rather, they borrow microservices that are wrapped from those giant tech companies servers, like Amazon Web Service(AWS) or Google Cloud Platform. Thus, developers can focus only on the app logic or ui side, which saves so much money and time especially for startups. Those platform usually provide all kinds of services from database storage to monitoring/testing, web hosting, email/message notification and cloud functions. This 'all in one' solution is so much more handy for developers. 

Besides, the selling point of serverless is that **"you only pay the compute that you need"**. There is no waiting time for servers to start, they are just constantly running and you only account for the computing power that you need. Nowadays, people share cars, houses, now even the computing power. 
Of course serverless architecture is not a panacea, but it meets our needs so far.

## Then why Firebase?

Simply because it provides the exact service that we need for our app. We need a Nosql database, a secure authentication system to implement role-based access control, a storage service to save posters or team logos, an easy-to-deploy hosting service, and backend cloud functions to handle light logic, sanitize data or send emails for us. Besides, it has nice ui and easy-to-use command line tool. After being acquired by Google last summer, it has stronger back and is well integrated into google cloud platform.

## Implementations

### Schedule (Cron) tasks with Cloud Functions

Cloud functions are so powerful that they can serve as a fast-loading server to deal with database and storage. However, they are usually triggered by events, such as `onWrite` action.

Firebase blog has a article explaining using App Engine from google cloud platform to do it:
> [How to Schedule (Cron) Jobs with Cloud Functions for Firebase](https://firebase.googleblog.com/2017/03/how-to-schedule-cron-jobs-with-cloud.html)

Here, we choose the site [Cron Job](https://cron-job.org/en/) to handle cron work for us. It has user-friendly interface and is easy to configure cron jobs. 

![cron job](cron_job.png)

Here we set the cron job to run once a day to remove overdue announcement and put scheduled ones in the page. It is important to add a key parameter after the url to avoid malicious access.

### Render elements iteratively in React

In React, components can be saved and passed as variables. It gives us a more flexible way to loop elements in an array, and interatively render components in the same format. Here is an example of 'formItem' component:

```js

let formItem = keys.map((key) => (
    <tr key = {key}>
        <td><Link to={`${team}/${key}`}>{forms[key].formName}</Link></td>
        <td>{forms[key].startDate.substr(0,15)}</td>
        <td>{forms[key].endDate.substr(0,15)}</td>
        <td>{forms[key].editDate.substr(0,15)}</td>
        <td>{key === defaultId ? 'default' : <a href="#" onClick = {(e) => this.setAsDefault(team, key,e) }>set as default</a>}</td>
        <td><i className ="glyphicon glyphicon-remove" style = {{cursor:"pointer"}} id = {key} onClick = {() => this.handleRemove(team, key)}/></td>
    </tr>
    ));

```
In es6, `()` after `=>` will be returned directly.
Then it wraps the component inside a table:
```
<tbody>
 {formItem}
</tbody>
```
after this, return the whole component inside a function called `teamTablegenerate`, then generating a table for each team is possible inside render function:
```js

Object.keys(this.state.questions).map((team) => {
    return this.teamTablegenerate(team)
})

```

![FormList](formlist.png)


<!-- ### deploy
### pagination
### auth
- only redirect in the first login  
    - sessionstorage 
- 

## react-router
### conditional rendering
- how to go back to last path with last state

## mobx

## announcement
### debounce -->
