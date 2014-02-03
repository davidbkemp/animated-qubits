/* global require, alert, jQuery */

(function () {
"use strict";

var animatedQubits = require("animated-qubits"),
    jsqubits = require("jsqubits").jsqubits,
    Q = require("q");

var naturalDimensions,
    qstate,
    animation,
    numBits = 3,
    range = 1 << numBits,
    inputBits = {from: 1, to: numBits},
    requiredNumberOfAmplifications = Math.floor(Math.sqrt(range) * Math.PI / 4),
    qstateElement = jQuery("#qstate"),
    statusElement = jQuery("#status"),
    solutionElement = jQuery("#solution"),
    svgElement = jQuery("#groverSvg"),
    currentOperationPromise = Q.when();

function functionToSolve(x) {return x === 2 ? 1 : 0;}

function reset() {
    qstate = new jsqubits.QState(numBits)
        .tensorProduct(jsqubits("|1>"))
        .hadamard(jsqubits.ALL);
    animation = animatedQubits(qstate, {maxRadius: 50});
    qstateElement.text(qstate.toString());
    svgElement.empty();
    return animation.display(svgElement[0]);
}

function run() {
    var amplifications;

    function applyOperation(operation, options) {
        return animation.applyOperation(operation, options)
            .then(function displayNewQstate(qstate) {
                qstateElement.text(qstate.toString());
            });
    }
    
    function phaseFlip(qstate) {
        return qstate.applyFunction(inputBits, 0, functionToSolve);
    }
    
    function reflectAboutMean(qstate) {
        return qstate
            .hadamard(inputBits)
            .applyFunction(inputBits, 0, function(x){return x === 0 ? 1 : 0;})
            .hadamard(inputBits);
    }
    
    function amplify() {
        return applyOperation(phaseFlip, {skipInterferenceSteps: true})
            .then(applyOperation.bind(null, reflectAboutMean));
    }

    currentOperationPromise = currentOperationPromise.then(reset);

    for (amplifications = 0; amplifications < requiredNumberOfAmplifications; amplifications++) {
        currentOperationPromise = currentOperationPromise.then(amplify);
    }
    
    currentOperationPromise = currentOperationPromise.then(function measureState() {
            return animation.measure(inputBits);
        })
        .then(function reportOnResult(qstate) {
            var result;
            qstateElement.text(qstate.toString());
            result = qstate.measure(inputBits).result;
            if (functionToSolve(result) === 1) {
                statusElement.text("Solved.");
                solutionElement.text("f(x) = 1 for x = " + result);
            } else {
                solutionElement.text("Failed. Retrying.");
                run();
            }
        });
        
    return currentOperationPromise;
}

function start() {
    statusElement.text("Running");
    solutionElement.text("");
    return run();
}

function onClick() {
    currentOperationPromise.then(start).fail(function error(msg) {
        alert(msg);
    });
}

reset();
naturalDimensions = animation.getNaturalDimensions();
svgElement.attr("height", naturalDimensions.height);

jQuery("#run").click(onClick);

})();

