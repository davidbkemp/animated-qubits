/* global require, window, document, alert */

(function () {
"use strict";

var animatedQubits = require("animated-qubits");
var jsqubits = require("jsqubits").jsqubits;

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

window.hadamardAll = function () {
    applyOperation(function hadamardAll(qstate) {
        return qstate.hadamard(jsqubits.ALL);
    });
};

window.tAll = function () {
    applyOperation(function tAll(qstate) {
        return qstate.t(jsqubits.ALL);
    }, {skipInterferenceSteps: true});
};

window.measure = function () {
    animation.measure(jsqubits.ALL)
        .then(function displayNewQstate(qstate) {
            qstateElement.innerText = qstate.toString();
        })
        .fail(function (msg) {
            alert(msg);
        });
};

})();

