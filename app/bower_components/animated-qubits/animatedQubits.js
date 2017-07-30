/* global define, module, require */

(function (globals) {
    "use strict";
    
    function createModule(_, Q, rendererFactory, calculatorFactory) {

        function ensureDependenciesAreSet() {
            _ = _ || globals._;
            Q = Q || globals.Q;
            rendererFactory = rendererFactory || globals.animatedQubitsInternal.rendererFactory;
            calculatorFactory = calculatorFactory || globals.animatedQubitsInternal.calculatorFactory;
        }
    
        return function animatedQubits(qstate, config) {
            ensureDependenciesAreSet();
            var stateComponents,
                numBits = qstate.numBits(),
                renderer,
                calculator = calculatorFactory(config),
                currentOperationPromise = Q.when();

            function phase1(newStateComponents) {
                return renderer.renderState(newStateComponents, {duration: 0});
            }
            
            function phase2(phases, newStateComponents) {
                return function () {
                    var promise = Q.when();
                    phases.stateComponentIndexesGroupedBySource.forEach(function(indexGroup) {
                        promise = promise.then(phase2a(phases, newStateComponents, indexGroup))
                            .then(phase2b(phases, newStateComponents, indexGroup));
                    });
                    return promise;
                };
            }
            
            function phase2a(phases, newStateComponents, indexGroup) {
                return function () {
                    indexGroup.forEach(function(index) {
                        var key = newStateComponents[index].key;
                        newStateComponents[index] = phases.phase2a[key];
                    });
                    return renderer.renderState(newStateComponents, {duration: 0});
                };
            }
            
            function phase2b(phases, newStateComponents, indexGroup) {
                return function () {
                    indexGroup.forEach(function(index) {
                        var key = newStateComponents[index].key;
                        newStateComponents[index] = phases.phase2b[key];
                    });
                    return renderer.renderState(newStateComponents);
                };
            }
            
            function createStateRendererFor(stateComponents, options) {
                return renderer.renderState.bind(null, stateComponents, options);
            }

            function applyOperation(operation, options) {
                var phases = calculator.createPhases(stateComponents, operation),
                    newStateComponents = phases.phase1.map(_.clone),
                    newQState = operation(qstate),
                    phase5Promise;

                qstate = newQState;
                stateComponents = calculator.augmentState(qstate);
                
                if (options && options.skipInterferenceSteps) {
                    phase5Promise = phase1(newStateComponents)
                        .then(createStateRendererFor(phases.phase5))
                        .then(createStateRendererFor(stateComponents, {duration: 0}));
                } else {
                    phase5Promise = phase1(newStateComponents)
                        .then(phase2(phases, newStateComponents))
                        .then(createStateRendererFor(phases.phase3))
                        .then(createStateRendererFor(phases.phase4, {duration: 0}))
                        .then(createStateRendererFor(phases.phase5))
                        .then(createStateRendererFor(stateComponents, {duration: 0}));
                }
                
                return phase5Promise.then(function returnNewQState() {
                    return newQState;
                });
            }
            
            function measure(bits) {
                var intermediateStateComponents, newStateComponents;
                qstate = qstate.measure(bits).newState;
                newStateComponents = calculator.augmentState(qstate);
                intermediateStateComponents = calculator.createIntermediateState(stateComponents, newStateComponents);
                stateComponents = newStateComponents;
                return renderer.renderState(intermediateStateComponents)
                    .then(function measurementPhase2() {
                        return renderer.renderState(newStateComponents, {duration: 0});
                    }).then(function returnNewQState() {
                        return qstate;
                    });
            }

            return {
                display: function (svgElement) {
                    renderer = rendererFactory({
                        element: svgElement,
                        numBits: numBits,
                        maxRadius: config.maxRadius
                    });
                    renderer.renderBitLabels();
                    renderer.renderStateLabels();
                    stateComponents = calculator.augmentState(qstate);
                    renderer.renderState(stateComponents);
                },
                getNaturalDimensions: function () {
                    if (!renderer) throw "Sorry, you must call display() before calling getNaturalDimensions()";
                    return renderer.getNaturalDimensions();
                },
                applyOperation: function (operation, options) {
                    currentOperationPromise = currentOperationPromise.then(function () {
                        return applyOperation(operation, options);
                    });
                    return currentOperationPromise;
                },
                measure: function (bits) {
                    currentOperationPromise = currentOperationPromise.then(function () {
                        return measure(bits);
                    });
                    return currentOperationPromise;
                }
            };
        };
    }

    /* Support AMD and CommonJS, with a fallback of putting animatedQubits in the global namespace */
    if (typeof define !== 'undefined' && define.amd) {
        define(['lodash', 'q', 'animatedQubitsRenderer', 'qubitAnimationCalculator'], createModule);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = createModule(
            require('lodash'),
            require('q'),
            require('./lib/animatedQubitsRenderer'),
            require('./lib/qubitAnimationCalculator'));
    } else {
        globals.animatedQubits = createModule();
    }

})(this);

// (c) 2012-2014 David Kemp
// animated-qubits may be freely distributed under the MIT license.
