/* global animatedQubits, jsqubits, document, alert, console */

(function (globals) {
"use strict";

var animation = animatedQubits(jsqubits("|101>"), {maxRadius: 50});
animation.display(document.getElementById("svg"));

globals.hadamardAll = function () {
    animation.applyOperation(function hadamardAll(qstate) {
        return qstate.hadamard(jsqubits.ALL);
    }).fail(function (msg) {
        if (console && console.log) console.log(msg);
        alert(msg);
    });
};

})(this);

