# animatedQubits.js

<img src="http://davidbkemp.github.io/animated-qubits/animated-qubits.png" height="180">

JavaScript library for animating quantum computations.

To see an example of it in use, see the [Quantum Gate Playground](http://davidbkemp.github.io/quantum-gate-playground/) and the [Animation of Grover's Quantum Search Algorithm](http://davidbkemp.github.io/animated-qubits/grover.html).

Home page:  http://davidbkemp.github.io/animated-qubits

Usage
-----

Include animatedQubits.min.js and its dependencies in your web page. Possibly the easiest way to do this is to use [bower](http://bower.io/):

    $ bower install animated-qubits

You should find animatedQubits.min.js and its dependencies installed in bower_components, and so you can include them as follows:

    <script src="bower_components/animated-qubits/animatedQubits.min.js" type="text/javascript"></script>
    <script src="bower_components/d3/d3.min.js" type="text/javascript"></script>
    <script src="bower_components/d3-measure-text/lib/d3-measure-text.js" type="text/javascript"></script>
    <script src="bower_components/d3-transform/src/d3-transform.js" type="text/javascript"></script>
    <script src="bower_components/jsqubits/lib/jsqubits.js" type="text/javascript"></script>
    <script src="bower_components/q/q.js" type="text/javascript"></script>
    <script src="bower_components/lodash/dist/lodash.min.js" type="text/javascript"></script>


Add an svg element to the page:

    <svg id="mySvg"></svg>


Create a jsqubits object, pass it to the animatedQubits function to create an animatedQubits object, and ask it to display itself in the svg element (see also http://davidbkemp.github.io/jsqubits/ )

    var qstate = jsqubits("|101>").hadamard(0).t(0);
    var animation = animatedQubits(qstate, {maxRadius: 50});
    var svgElement = document.getElementById("mySvg");
    
    animation.display(svgElement);
    
    var naturalDimensions = animation.getNaturalDimensions();
    
    svgElement.setAttribute("height", naturalDimensions.height);
    svgElement.setAttribute("width", naturalDimensions.width);

Style the quantum state amplitude discs using css:

    .animatedQubitsAmplitudeCircle {
        fill: hsla(195, 53%, 60%, 0.5);
    }
    
    .animatedQubitsPhaseArrow {
        stroke: red;
        stroke-width: 2px;
    }
    
    .animatedQubitsPhaseArrowEnd {
        fill: red;
    }


Animate an operation

    animation.applyOperation(function hadamardAll(qstate) {
        return qstate.hadamard(jsqubits.ALL);
    }).then(function onSuccess(newQState) {
        // Invoked asynchronously when the animation successfully completes
    }).fail(function (msg) {
        // Invoked asynchronously if an error occurs.
        alert(msg);
    });

Measure qubits 0 and 2 (where qubit 0 is the least significant i.e. right-most qubit):

    animation.measure([0, 2])
        .then(function onSuccess(newQState) {
        // Invoked asynchronously when the animation successfully completes
    }).fail(function (msg) {
        // Invoked asynchronously if an error occurs.
        alert(msg);
    });

The applyOperation() and measure() methods return "promise" objects
with then() and fail() methods that take callbacks that get invoked upon
completion of the animation
(See http://promises-aplus.github.io/promises-spec/ ).
These promises will pass on the resultant QState object.
See the examples to see how this can be used.

Development
-----------

To run specs and validate the JavaScript and create animatedQubits.min.js:

    npm run build

License
-------

The MIT License (MIT)

Copyright (c) 2013-2014 David Kemp

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
