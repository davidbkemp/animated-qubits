/* global animatedQubits, jsqubits, alert, setTimeout, Q, jQuery */

(function (globals) {
"use strict";

var naturalDimensions,
    qstate,
    animation,
    numBits = 3,
    range = 1 << numBits,
    inputBits = {from: 1, to: numBits},
    requiredNumberOfAmplifications = Math.floor(Math.sqrt(range) * Math.PI / 4),
    qstateElement = jQuery("#qstate"),
    svgElement = jQuery("#groverSvg");

function functionToSolve(x) {return x === 2 ? 1 : 0;}

function reset() {
    qstate = new jsqubits.QState(numBits)
        .tensorProduct(jsqubits("|1>"))
        .hadamard(jsqubits.ALL);
    animation = animatedQubits(qstate, {maxRadius: 50});
    qstateElement.text(qstate.toString());
    svgElement.empty();
    animation.display(svgElement[0]);
}

function sleepAndPassOnResult(millis) {
    return function doSleepAndPassOnResult(result) {
        var deferred = Q.defer();
        setTimeout(deferred.resolve.bind(deferred, result), millis);
        return deferred.promise;
    };
}

function run() {
    var amplifications,
        currentOperationPromise = Q.when();

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

    reset();

    for (amplifications = 0; amplifications < requiredNumberOfAmplifications; amplifications++) {
        currentOperationPromise = currentOperationPromise.then(amplify);
    }
    
    currentOperationPromise
        .then(function measureState() {
            return animation.measure(inputBits);
        })
        .then(sleepAndPassOnResult(1000))
        .then(function reportOnResult(qstate) {
            var result;
            qstateElement.text(qstate.toString());
            result = qstate.measure(inputBits).result;
            if (functionToSolve(result) === 1) {
                alert("f(x) === 1 for x = " + result);
            } else {
                alert("Failed to find desired result. Will try again");
                run();
            }
        })
        .fail(function error(msg) {
            alert(msg);
        });

}

globals.run = function () {
    run();
};

reset();
naturalDimensions = animation.getNaturalDimensions();
svgElement.attr("height", naturalDimensions.height);

})(this);

