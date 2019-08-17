---
title: Automatically create merge requests through gitlab api
catalog: true
date: 2019-04-03 22:14:12
subtitle: Laziness creates efficiency
header-img: gitlab-blog-cover.png
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

Before we proceed, we need a set of command line tools to boost our efficiency.

### jq

> jq is like sed for JSON data
> You can use `jq` to easily extract useful information and format them in the way you want. For example:

- extract the first element from a `json array`:

`cat json | jq .[0]`

- get a new json in the given format:

`jq '.[] | {message: .commit.message, name: .commit.committer.name}'`

You can even use conditional operator or loop functions with `jq`, which is definitely worth checking out the [manual](https://stedolan.github.io/jq/manual/) if you are dealing with json form cli a lot.

### yq

yq is similar to jq, but especially for `yaml` files. It's also written in python.

### gsed(sed)

`sed` is a very handy tool on the unix system to perform basic text transformations on an input stream. However, `sed` on the `linux` and `mac` has slight differences, so we can use `gsed` here to keep it consistent.

### curl

`curl` is basically the postman on the command line, which will be our best friend to test apis from the terminal.

### base64

`base64` encoding is a common way to use textual data to store the binary data or serialize the files.

## Step by step

I'm using [node client](https://www.npmjs.com/package/gitlab) from gitlab here, but you can use any language to write the script.

### Import the dependencies

Here's the modules that I use:

```js
const { ProjectsBundle } = require("gitlab");
const yaml = require("js-yaml");
const fs = require("fs");
const exec = require("await-exec");
const _ = require("lodash");
const moment = require("moment");
```

### Fetch helm-chart file

We use gitlab client to set up the project info:

```js
const service = new ProjectsBundle({
  url: HOST,
  token: PRIVATE_TOKEN,
});
```

Then we fetched the `values.yaml` file.

```js
try {
  var valuesFile = await service.RepositoryFiles.show(
    HELM_CHART_PROJECT_ID,
    "path/to/values.yaml",
    "master"
  );
} catch (e) {
  console.error("Unable to fetch values.yaml file. ❌");
  process.exit(1);
}
```

The response we get from the api so far is encoded in `base64`, so we need to decode it in plain text:

```js
const { content } = valuesFile;
const generatedFile = await exec(
  `echo ${content} | base64 --decode > values.yaml`,
  puts
);
```

### Compare the commit diff and time diff

Next, We check whether the commit hash changed and whether time interval met our requirement, otherwise we don't need to make next move.

```js
 // get commit hash from helm chart
  try {
    const doc = yaml.safeLoad(fs.readFileSync("./values.yaml", "utf8"));
    hashInHelm = doc.image.tag;
  } catch (e) {
    console.error(e);
  }

  const oldCommit = await service.Commits.show(PROJECT_ID, hashInHelm);
  lastCommitTime = oldCommit["created_at"];
  let sinceTime = moment(lastCommitTime)
    .add(1, "minutes")
    .format();
  const fetchMasterCommits = await exec(
    `curl -H "PRIVATE-TOKEN:${PRIVATE_TOKEN}" ${HOST}/api/v4/projects/${PROJECT_ID}/repository/commits?since=${sinceTime}`
  );
  if (fetchMasterCommits.error) {
    console.error(`fetchMasterCommits error: ${fetchMasterCommits.error} ❌`);
  }
  masterCommits = JSON.parse(fetchMasterCommits.stdout);
  if (masterCommits.length === 0) {
    console.log("The hash in the helm chart is the latest one.");
    process.exit(0);
  }
  hashInRepo = masterCommits[0].short_id;
  const currentDate = new Date();
  const lastUpdateDate = new Date(lastCommitTime)
  // only continue the script when the hash changed and the time diff is large than the setting
  if (
    hashInHelm !== hashInManifold &&
    currentDate - lastUpdateDate > TIME_INTERVAL
  ) {
    ...
  }
```

- get related `merge requests` and `commit messages`

In order to create a merge request with enough information, we can fetch merge requests and commit messages that are related to this specific commit.

```js
const description = {
  commits: [],
  issues: [],
};
masterCommits
  .map(commit => commit.id)
  .forEach(async id => {
    let mergeRequests;
    try {
      mergeRequests = await service.Commits.mergeRequests(PROJECT_ID, id);
    } catch (e) {
      console.error(`Unable to fetch merge requests for ${id}. ${e} ❌`);
    }
    // if no merge requests found, just use the commit message
    if (Array.isArray(mergeRequests) && mergeRequests.length === 0) {
      const c = _.find(masterCommits, o => o.id === id);
      description.commits.push(`${c.short_id} - ${c.message}`);
    } else {
      // otherwise, format the description as [title](web_url)
      mergeRequests
        .map(m => m.iid)
        .forEach(async iid => {
          const closedIssues = await service.MergeRequests.closesIssues(
            PROJECT_ID,
            iid
          );
          closedIssues.forEach(issue => {
            description.issues.push(`[${issue.title}](${issue.web_url})\n`);
          });
        });
    }
  });
```

- Create a new merge request

In the final step, we create a new branch and apply the hash change that we made. Then we make a new merge request with all the useful information.

```js
const newBranch = `change-hash-${hashInManifold}`;
// replace the hash
let updatedFile = await exec(
  `sed -i 's/${hashInHelm}/${hashInManifold}/' values.yaml`,
  puts
);
console.log("Updated hash in values.yaml. ✅");
let BASE64_yaml = base64_encode("values.yaml");
const Payload = {
  branch: newBranch,
  content: BASE64_yaml,
  commit_message: `update hash to ${hashInManifold}`,
  encoding: "base64",
};
const createNewBranch = await service.Branches.create(
  HELM_CHART_PROJECT_ID,
  newBranch,
  "master"
);
console.log(`Created a branch ${newBranch} in helm-chart repo. ✅`);
try {
  const updatedFileInHelm = await exec(`curl --request PUT --header 'PRIVATE-TOKEN:${PRIVATE_TOKEN}' --header "Content-Type: application/json" \
      --data '${JSON.stringify(
        Payload
      )}' "${HOST}/api/v4/projects/${HELM_CHART_PROJECT_ID}/repository/files/charts%2Fdata-engine%2Fvalues.yaml"`);
  console.log(`Updated value.yaml file in helm-chart repo. ✅`);
} catch (e) {
  console.error(`Unable to update file. ❌`);
}

/**
 * projectId: ProjectId,
 * sourceBranch: string,
 * targetBranch: string,
 * title: string,
 * options: RequestOptions,
 */
const createMr = await service.MergeRequests.create(
  HELM_CHART_PROJECT_ID,
  newBranch,
  "master",
  "WIP: update manifold hash",
  {
    description: `
## Description
### related commits
${_.uniq(description.commits).join("\n")}

### related issues:
${_.uniq(description.issues).join("\n")}`,
  }
);
console.log("Created a merge request in helm-chart repo. ✅");
console.log(`Here is the link: ${createMr.web_url}`);
```

## Things to improve

Above are a relatively simple and straightforward way to create merge requests base on changes. We did observe several problems in the process and find improvements to be done in future.

- Only create MRs in batches or close the MRs that are included in the current MR. MRs are created for each change now, then populate the whole merge list if the previous ones are not merge in time.

- It would be nice that we provide a link with `Create MR` button for users to trigger the creation.

- Better code abstraction for different project usage.

- Better organization of description and commit messages.
