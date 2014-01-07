/* global animatedQubits, jsqubits, document, alert */

(function (globals) {
"use strict";

var animation = animatedQubits(jsqubits("|101>"), {maxRadius: 50});
var svgElement = document.getElementById("svg");
animation.display(svgElement);

var naturalDimensions = animation.getNaturalDimensions();

svgElement.setAttribute("height", naturalDimensions.height);
svgElement.setAttribute("width", naturalDimensions.width);

globals.hadamardAll = function () {
    animation.applyOperation(function hadamardAll(qstate) {
        return qstate.hadamard(jsqubits.ALL);
    }).fail(function (msg) {
        alert(msg);
    });
};

})(this);

