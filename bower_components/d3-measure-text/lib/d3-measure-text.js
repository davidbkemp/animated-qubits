//this code is modified from http://stackoverflow.com/a/14615428/10333
(function(globals){

//UMD
if (typeof define !== 'undefined' && define.amd) { //require.js / AMD
  define([], function() {
    return d3MeasureText
  })
} else if (typeof module !== 'undefined' && module.exports) { //CommonJS
  module.exports = d3MeasureText
} else {
  globals.d3MeasureText = d3MeasureText
}

//lowercase because it's not a constructor function
function d3MeasureText (text, className) {
  if (!text || text.length === 0)
    return {height: 0, width: 0}

  var container = d3MeasureText.d3.select('body').append('svg')
  if (className)
    container.attr('class', className)

  container.append('text').attr({x: -1000, y: -1000}).text(text)

  var bbox = container.node().getBBox()
  container.remove()

  return {height: bbox.height, width: bbox.width}
}

d3MeasureText.d3 = d3MeasureText.d3 || globals.d3 //<--- if this doesn't exist, user will have to set it

})(this);