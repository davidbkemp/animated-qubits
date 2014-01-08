# animatedQubits.js

JavaScript library for animating quantum computations.

Usage
-----

Include animatedQubits.min.js and its dependencies in your web page. Possibly the easiest way to do this is to use bower ( http://bower.io/ ):

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
    }).fail(function (msg) {
        alert(msg);
    });


Development
-----------

To run specs and validate the JavaScript:

    npm test

To build animatedQubits.min.js:

    npm run-script build

