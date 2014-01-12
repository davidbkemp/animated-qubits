d3-measure-text
===============

A JavaScript component to measure the the width and height of SVG text. 



Why?
----

If you're creating a graph with SVG, it's especially nice to know the size of the axis labels' text so that you can position the graph appropriately.



Install
-------

### Node.js/Browserify

    npm install --save d3-measure-text


### Component

    component install jprichardson/d3-measure-text


### Bower

    bower install d3-measure-text


### Script

```html
<script src="/path/to/d3-measure-text.js"></script>
```



Usage
-----

### d3MeasureText(text, [className])


```js
var d3MeasureText = require('d3-measure-text')
d3MeasureText.d3 = d3 //<--- set d3 if it's not global.

var dim = d3MeasureText("Time (days)")
console.dir(dim) //{width: 33, height: 12}
```


Credits
-------

This code is modified from [Bill's](http://stackoverflow.com/users/1029936/bill) [answer](http://stackoverflow.com/a/14615428/10333) on StackOverflow.


License
-------

(MIT License)

Copyright 2013, JP Richardson  <jprichardson@gmail.com>




