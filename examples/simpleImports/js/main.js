/* global animatedQubits, jsqubits, document, alert, console */

(function (globals) {
"use strict";

function applyOperation(operation, options) {
    animation.applyOperation(operation, options)
        .fail(function (msg) {
            if (console && console.log) console.log(msg);
            alert(msg);
        });
}

var animation = animatedQubits(jsqubits("|101>").hadamard(0).T(0), {maxRadius: 50});

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

})(this);

