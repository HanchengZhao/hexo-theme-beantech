---
title: Treechart In D3
catalog: true
date: 2018-05-07 22:57:12
subtitle: Interactive and responsive
header-img: tree.jpg
tags: 
- D3.js
- React.js
---

# Interactive and responsive Tree Diagram in D3.js

The tree diagram is a very intuitive visualization to display the structure and relation between parent and child nodes. To give users a better interaction between different nodes, we could utilize the diagram from [Interactive d3.js tree diagram](http://bl.ocks.org/d3noob/8375092#index.html), make it more interactive and responsive.


<html>


<p data-height="669" data-theme-id="0" data-slug-hash="KoYbav" data-default-tab="result" data-user="HanchengZhao-1471862086" data-embed-version="2" data-pen-title="tree diagram expand" class="codepen">See the Pen <a href="https://codepen.io/HanchengZhao-1471862086/pen/KoYbav/">tree diagram expand</a> by Henry_Z (<a href="https://codepen.io/HanchengZhao-1471862086">@HanchengZhao-1471862086</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

</html>




## Prepare hierarchical tree node structure

The [default hierarchy](https://github.com/d3/d3-hierarchy#hierarchy) of a tree structure would be :
```
 {
   "name": "Top Level",
   "children": [
     { 
       "name": "Level 2: A",
       "children": [
         { "name": "Son of A" },
         { "name": "Daughter of A" }
       ]
     },
     { "name": "Level 2: B",
       "children":[
         { "name": "Son of B" },
         { "name": "Daughter of B" }
       ]
     }
   ]
 };
```
the default function to traverse the children is:

```js
function children(d) {
  return d.children;
}
```
so if we want to pass a different structure, we need to pass a different function accordingly.

For our use case, we have an array of tags
```
var fields =  [
        "id",
        "name",
        "tag.analytics.aggname",
        "tag.analytics.jobname",
        "tag.analytics.metric",
        "tag.kubernetes.namespace.creationTimestamp",
        "tag.kubernetes.namespace.name",
        ...
    ]
```
Here's our function to build a tree from it:

```js
const buildTree = (fields) => {
  let tree = {
    "name": "tags",
    "children": []
  }
  
  const addNodes = (tag) => {
    for (let i = 0; i < root.children.length; i++) {
      if (tag === root.children[i].name) {
        root = root.children[i];
        return;
      } 
    }
    root.children.push({
      'name': tag,
      children: []
    })
    root = root.children[root.children.length-1]
  }
  
  fields.forEach((field) => {
    tags = field.split('.');
    root = tree;
    tags.forEach(addNodes)
  })
  return tree;
}
```
Once we have the requested tree data, we can initialize our tree:
```js
var root = d3.hierarchy(treeData, function(d) { return d.children; });
```


## Normalize for the current depth
In the  [Interactive d3.js tree diagram](http://bl.ocks.org/d3noob/8375092#index.html), the height between the parent and child nodes would not change in regards to the tree height. As a result, the width of the tree chart will expand out of the screen width if there are too many layers. However, this is not responsive and we do not want a scroll bar at the bottom, so we want the whole tree to 'shrink' according to the tree height.

### Get current tree depth

We need to know the tree depth if we want to change the width dynamically. We could do this by a quick top-down traversal:

```js
/*
root.children are expanded children,
root._children are collapsed ones,
we only need to calculate expanded children when counting the tree height
*/
function getHeight(root) {
  if (!root) {
    return 0
  }
  let expandChildren = [0]
  // if has expanded children
  if (root.children) { 
    expandChildren = root.children.map(ea => getHeight(ea))
  }
  const max = expandChildren.reduce((a, b) => Math.max(a,b))
  return 1 + max
}
```

### Set each node's y position based on its current depth

```js
// inside update function

var currentHeight = getHeight(root);
// Normalize for current-depth.
nodes.forEach(function(d){ 
  d.y = d.depth * window.innerWidth / (currentHeight+ Math.log(currentHeight-1))
});
```
## Handle window resize

The tree chart should resize when we change the inner window size. Firstly, we set the tree chart width to be 
```
var width = window.innerWidth - margin.left - margin.right
```
Then we add a listener to the window resizing, we can debounce it a little by using `_.debounce` from `lodash.js`

```
window.addEventListener('resize', _.debounce(function(){
  update(root)
}, 500));
```
## Handle collapse

We could collapse all but root node:

```
// Collapse the node and all it's children
function collapse(d) {
  if (d.children) {
    d._children = d.children;
    d._children.forEach(collapse);
    d.children = null;
  }
}
collapse(root)
```

Then expand the nodes on the given path or key:

```js
//Expand the tree based on key
function expandOnKey(key, root) {
  var node = root;
  var tags = key.split(".");
  while (tags.length > 0) {
    var found = false;
    var next = tags[0]
    if (node._children) {
      node._children.forEach((child) => {
        if (child.data.name === next) {
          // expand this node
          node.children = node._children;
          node._children = null;
          node = child;
          found = true;
        }
      })
    }
    if (found) {
      tags.shift()
    } else {
      return;
    }
  }
}
```

## Handle click

We want to display 2 effects:
* highlight the path and node when clicking on the leaf node
* expand/collapse the subtree when clicking on non-leaf nodes

```
// Toggle children on click.
  const click = d => {
    if (!d.children && !d._children) {
      //leaf node
      const key = getPath(d);
      this.setState({ key });
      d.path = key;
      this.fetchAvailableValues(key);
    }
    //d.children is collapsed children
    //d._children is expanded children
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update(d);
     };
```
### Get path

```
// return the path from root to this node
  function getPath(d) {
    var path = [];
    while (d.parent !== null) {
      path.unshift(d.data.name);
      d = d.parent;
    }
    return path.join('.');
  }
```

### Highlight the clicked node
```
// Update the node attributes and style
  nodeUpdate.select('circle.node')
    .attr('r', 10)
    .style("fill", function(d) {
        if (getPath(d) === key) {
            // clicked leaf node
            return '#F88C36';
          } 
        return d._children ? "lightsteelblue" : "#fff";
    })
    .attr('cursor', 'pointer');
```

### Highlight the matched path

If we are given a path `var key = "tag.kubernetes.pod.label.release";`, we could mark each node on the path as `node.class = 'match'` when we expand the tree. Then we highlight the link between those marked nodes:
```
// Transition back to the parent element position
  linkUpdate.transition()
      .duration(duration)
      .attr('d', function(d){ return diagonal(d, d.parent) })
      .style("stroke", function(d){
          if(d.class === 'match') {
            return '#3fb986'
          }
        });
```

## Integrate D3 with react

A lot of web apps are built with react, what if you want to render a D3 chart inside react app?

Both libraries are declarative and provide a wrapper on top of native dom. We might have conflicts when we are trying to integrate them. So a common way to do is to expose dom through `ref` in react to D3. It's like isolating a land for D3 to play with itself.

In the meantime, we can put some attributes in theReact state to trigger re-rendering when necessary.

Inside `render()` function, set

```html
 <div ref={node => (this.node = node)} />
```

then in d3:

```js
createTreeChart = fields => {
    const node = this.node;
    ...
}
```