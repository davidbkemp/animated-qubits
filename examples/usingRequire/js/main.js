/* global requirejs, document, alert */

(function () {
"use strict";

var animatedQubitsPath = '../../',
    bowerPath = 'app/bower_components/';

requirejs.config({
    baseUrl: '.',
    paths: {
        animatedQubits: animatedQubitsPath + 'animatedQubits.min',
        jsqubits: bowerPath + 'jsqubits/lib/jsqubits',
        d3MeasureText: bowerPath + 'd3-measure-text/lib/d3-measure-text',
        d3: bowerPath + 'd3/d3.min',
        d3Transform: bowerPath + 'd3-transform/src/d3-transform',
        q: bowerPath + 'q/q',
        lodash: bowerPath + 'lodash/dist/lodash.min'
    },
    shim: {
        d3: {
            exports: 'd3'
        },
        d3Transform: {
            deps: ['d3']
        }
    }
});

// Unfortunately, we have to force d3Transform to load here.
requirejs(['animatedQubits', 'jsqubits', 'd3Transform'],
    function (animatedQubits, jsqubits) {
        var animation = animatedQubits(jsqubits("|101>"), {maxRadius: 50});
        var svgElement = document.getElementById("svg");
        animation.display(svgElement);
        
        var naturalDimensions = animation.getNaturalDimensions();

        svgElement.setAttribute("height", naturalDimensions.height);
        svgElement.setAttribute("width", naturalDimensions.width);

        function hadamardAllClick() {
            animation.applyOperation(function hadamardAll(qstate) {
                return qstate.hadamard(jsqubits.ALL);
            }).fail(function (msg) {
                alert(msg);
            });
        }

        document.getElementById("hadamardButton").onclick = hadamardAllClick;
    }
);

})();

