# animatedQubits.js

JavaScript library for animating quantum computations.

Usage
-----

Include animatedQubits.min.js and its dependencies in your web page (TODO: elaborate):

    <script src="app/bower_components/animated-qubits/animatedQubits.min.js" type="text/javascript"></script>
    <script src="app/bower_components/d3/d3.min.js" type="text/javascript"></script>
    <script src="app/bower_components/d3-measure-text/lib/d3-measure-text.js" type="text/javascript"></script>
    <script src="app/bower_components/d3-transform/src/d3-transform.js" type="text/javascript"></script>
    <script src="app/bower_components/jsqubits/lib/jsqubits.js" type="text/javascript"></script>
    <script src="app/bower_components/q/q.js" type="text/javascript"></script>
    <script src="app/bower_components/lodash/dist/lodash.min.js" type="text/javascript"></script>


Add an svg element to the page:

    <svg id="svg" style="width: 600px; border: 1px solid black"></svg>


Create a jsqubits object, pass it to the animatedQubits function to create an animatedQubits object, and ask it to display itself in the svg element (see also http://davidbkemp.github.io/jsqubits/ )

    var animation = animatedQubits(jsqubits("|101>"), {maxRadius: 50});
    animation.display(document.getElementById("svg"));

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
    }).fail(function (msg) {
        if (console && console.log) console.log(msg);
        alert(msg);
    });


Development
-----------

To run specs and validate the JavaScript:

    npm test

To build animatedQubits.min.js:

    npm run-script build

