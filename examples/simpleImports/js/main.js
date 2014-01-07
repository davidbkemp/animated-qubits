/* global animatedQubits, jsqubits, document, alert */

(function (globals) {
"use strict";

function applyOperation(operation, options) {
    animation.applyOperation(operation, options)
        .then(function displayNewQstate(qstate) {
            qstateElement.innerText = qstate.toString();
        })
        .fail(function (msg) {
            alert(msg);
        });
}

var qstateElement = document.getElementById("qstate");
var qstate = jsqubits("|101>").hadamard(0).T(0);
var animation = animatedQubits(qstate, {maxRadius: 50});
var svgElement = document.getElementById("svg");

qstateElement.innerText = qstate.toString();
animation.display(svgElement);

var naturalDimensions = animation.getNaturalDimensions();

svgElement.setAttribute("height", naturalDimensions.height);
svgElement.setAttribute("width", naturalDimensions.width);

globals.hadamardAll = function () {
    applyOperation(function hadamardAll(qstate) {
        return qstate.hadamard(jsqubits.ALL);
    });
};

globals.tAll = function () {
    applyOperation(function tAll(qstate) {
        return qstate.t(jsqubits.ALL);
    }, {skipInterferenceSteps: true});
};

globals.measure = function () {
    animation.measure(jsqubits.ALL)
        .then(function displayNewQstate(qstate) {
            qstateElement.innerText = qstate.toString();
        })
        .fail(function (msg) {
            alert(msg);
        });
};

})(this);

