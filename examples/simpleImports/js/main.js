/* global animatedQubits, jsqubits, document, alert, console */

(function (globals) {
"use strict";

function applyOperation(operation, options) {
    animation.applyOperation(operation, options)
        .then(function displayNewQstate(qstate) {
            document.getElementById("qstate").innerText = qstate.toString();
        })
        .fail(function (msg) {
            if (console && console.log) console.log(msg);
            alert(msg);
        });
}

var qstate = jsqubits("|101>").hadamard(0).T(0);
document.getElementById("qstate").innerText = qstate.toString();
document.getElementById("bitCountSelection").value = qstate.numBits();

var animation = animatedQubits(qstate, {maxRadius: 50});

animation.display(document.getElementById("svg"));

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

globals.updateNumBits = function () {
    var numBits = parseInt(document.getElementById("bitCountSelection").value, 10);
    qstate = new jsqubits.QState(numBits);
    animation.resetQState(qstate).fail(function (msg) {
            if (console && console.log) console.log(msg);
            alert(msg);
        });
    document.getElementById("qstate").innerText = qstate.toString();
};

})(this);

