---
title: Python-Collections-And-Tricks
catalog: true
date: 2017-5-22 21:01:50
subtitle: Being pythonic
header-img: "us_map.JPG"
tags:
- python
---

> Introduction of Python unique data structures of high performance and summary of pythonic ways of coding

## Python collections
> Here is [collection ducumentation](https://docs.python.org/2.7/library/collections.html#collections.ChainMap)

Besides `list`, `dictionary`, `tuple`, python provides some high-performance container datatypes in the module `collections`, which I find extremely useful when dealing with hashtable or stack problems. You can always implement these by using basic `list` or `dictionary`, but it really eases your life if you know their existence and are familiar with their APIs beforehand.

### deque (pronounced "deck", not "D-queue")
Deque is basically a double-ended-queue structure and supports efficient operations like appends and pops from both sides. It has totally same operations as `list`, but runs in O(1) in operations like pop(0), appendleft(x).

**To initialize**: It takes a iterable and a maxlen. From official document:

>If maxlen is not specified or is None, deques may grow to an arbitrary length. Otherwise, the deque is bounded to the specified maximum length. Once a bounded length deque is full, when new items are added, a corresponding number of items are discarded from the opposite end.

```py
deque = collections.deque([],maxlen=3)
for i in range(4):
    deque.append(i)
print deque # deque([1, 2, 3], maxlen=3)    
```

**List of methods from official document**:

- append(x): Add x to the right side of the deque.

- appendleft(x): Add x to the left side of the deque.

- clear():Remove all elements from the deque leaving it with length 0.

- count(x): Count the number of deque elements equal to x.

- extend(iterable): Extend the right side of the deque by appending elements from the iterable argument.

  - if you extend a string, it will treat every char as an element
```py
for i in range(4):
    deque.append(i)
deque.extend("[4,5,6]")
print deque # deque([0, 1, 2, 3, '[', '4', ',', '5', ',', '6', ']'])
```

- extendleft(iterable):
Extend the left side of the deque by appending elements from iterable. Note, the series of left appends results in reversing the order of elements in the iterable argument.

- pop(): Remove and return an element from the right side of the deque. If no elements are present, raises an IndexError.

- popleft(): Remove and return an element from the left side of the deque. If no elements are present, raises an IndexError.

- remove(value): Removed the first occurrence of value. If not found, raises a ValueError.

- reverse(): Reverse the elements of the deque in-place and then return None.

- rotate(n): Rotate the deque n steps to the right. If n is negative, rotate to the left. Rotating one step to the right is equivalent to: d.appendleft(d.pop()).

### OrderedDict
If you want to keep the order of the items you insert into a dictionary, `OrderedDict` is the one you need.

 ```py
>>> # regular unsorted dictionary
>>> d = {'banana': 3, 'apple': 4, 'pear': 1, 'orange': 2}

>>> # dictionary sorted by key
>>> OrderedDict(sorted(d.items(), key=lambda t: t[0]))
OrderedDict([('apple', 4), ('banana', 3), ('orange', 2), ('pear', 1)])

>>> # dictionary sorted by value
>>> OrderedDict(sorted(d.items(), key=lambda t: t[1]))
OrderedDict([('pear', 1), ('orange', 2), ('banana', 3), ('apple', 4)])

>>> # dictionary sorted by length of the key string
>>> OrderedDict(sorted(d.items(), key=lambda t: len(t[0])))
OrderedDict([('pear', 1), ('apple', 4), ('orange', 2), ('banana', 3)])
```

**OrderedDict.popitem(last=True)**
The popitem() method for ordered dictionaries returns and removes a (key, value) pair. The pairs are returned in LIFO order if last is true or FIFO order if false.
(This method could be very useful in LRU cache design)

### defaultdict
This datatype provides a factory function to store customized key-value pairs into dictionaries.
From doc:

It is easy to group a sequence of key-value pairs into a dictionary of lists:
```py
>>> s = [('yellow', 1), ('blue', 2), ('yellow', 3), ('blue', 4), ('red', 1)]
>>> d = defaultdict(list)
>>> for k, v in s:
...     d[k].append(v)
...
>>> d.items()
[('blue', [2, 4]), ('red', [1]), ('yellow', [1, 3])]
```

This technique is simpler and faster than an equivalent technique using dict.setdefault():

```py
>>> d = {}
>>> for k, v in s:
...     d.setdefault(k, []).append(v)
...
>>> d.items()
[('blue', [2, 4]), ('red', [1]), ('yellow', [1, 3])]
```

### heapq



## Tricks
(to be filled)

### sorted()

### enumerate()

It is an efficient way to loop through a list and get the index and value at the same time.

```py
enumerate(sequence, start=0) # start is optional, from 0 as default
>>> seasons = ['Spring', 'Summer', 'Fall', 'Winter']
>>> list(enumerate(seasons))
[(0, 'Spring'), (1, 'Summer'), (2, 'Fall'), (3, 'Winter')]
>>> list(enumerate(seasons, start=1))
[(1, 'Spring'), (2, 'Summer'), (3, 'Fall'), (4, 'Winter')]

```

### zip()

### list comprehesion

Python provides a very natural way to construct list, no matter what dimension.

##### Basic syntax:

```py
[ expression for item in list if conditional ]
```

which is equivalent to

```py

for item in list:
    if conditional:
        expression

```

so to initialize an empty 2D array in python is:
```py

# Creates a list containing 5 lists, each of 8 items, all set to 0
w, h = 8, 5;
Matrix = [[0 for x in range(w)] for y in range(h)]

```

but note here, *append* does not work as expected in list comprehension, it only mutates array rather than returns value:
```py
a = [[1,2],[3,4],[5,6]]
a = [x.append('a') for x in a]
# return  [None,None,None]
```

another example:
<script src="https://gist.github.com/HanchengZhao/69e152c12509806653061c95c66d0ada.js"></script>

Here it returns the first node in a value list of a dictionary that has more than 1 node. `if node[1]` will cause `IndexError: list index out of range`, but `if node[1:]` works.

### sort() and sorted()
sort() sorts objects of list, it does not return list. So you can not use `''.join(list(str).sort())` to sort string. Instead, you can try `''.join(sorted(str))` because sorted will return a new sorted list from the items in iterable.