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
            
            function phase3(phases) {
                return renderer.renderState.bind(null, phases.phase3);
            }
            
            function phase4(phases) {
                return renderer.renderState.bind(null, phases.phase4, {duration: 0});
            }
            
            function phase5(phases) {
                return renderer.renderState.bind(null, phases.phase5);
            }
            
            function applyOperation(operation, options) {
                var phases = calculator.createPhases(stateComponents, operation),
                    newStateComponents = phases.phase1.map(_.clone),
                    newQState = operation(qstate),
                    phase5Promise;

                qstate = newQState;
                stateComponents = calculator.augmentState(qstate);
                
                if (options && options.skipInterferenceSteps) {
                    phase5Promise = phase1(newStateComponents).then(phase5(phases));
                } else {
                    phase5Promise = phase1(newStateComponents)
                        .then(phase2(phases, newStateComponents))
                        .then(phase3(phases))
                        .then(phase4(phases))
                        .then(phase5(phases));
                }
                
                return phase5Promise.then(function returnNewQState() {
                    return newQState;
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