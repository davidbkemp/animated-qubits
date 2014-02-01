/* global define, module, require */

(function (globals) {
    "use strict";
    
    function createModule(graphicsFactory, calculatorFactory) {
        
        function ensureDependenciesAreSet() {
            graphicsFactory = graphicsFactory || globals.animatedQubitsInternal.graphicsFactory;
            calculatorFactory = calculatorFactory || globals.animatedQubitsInternal.calculatorFactory;
        }
    
        function rendererFactory(config) {
            ensureDependenciesAreSet();
            
            var graphics = graphicsFactory(config.element),
                animationCalculator = calculatorFactory(config),
                maxRadius = config.maxRadius,
                numBits = config.numBits,
                numStates = 1 << numBits,
                textHeight = graphics.getTextHeight(),
                textWidth = graphics.getTextWidth(),
                amplitudeDiscsGroup;

            function determineTotalHeight() {
                return animationCalculator.yOffSetForState(numStates - 1) + maxRadius;
            }
            
            function determineTotalWidth() {
                return (1 + numBits) * textWidth + 4 *  maxRadius;
            }
            
            function asBitString(state) {
                return ('0000000000000000' + state.toString(2)).slice(-numBits);
            }
            
            function renderStateBitLabels(state, graphicsGroup) {
                var bitString = asBitString(state);
                for(var bitPos = 0; bitPos < numBits; bitPos++) {
                    graphicsGroup.addText({
                        cssClass: 'animatedQubitsStateBitLabel',
                        x: bitPos * textWidth,
                        text: bitString.charAt(bitPos)
                    });
                }
            }

            return {
            
                getNaturalDimensions: function () {
                    return {
                        height: determineTotalHeight(),
                        width: determineTotalWidth()
                    };
                },

                renderBitLabels: function () {
                    var bitLabelGroup = graphics.createGroup({
                        cssClass: "animatedQubitsBitLabels",
                        y: 2 * textHeight / 3
                    });
                    for (var i = 0; i < numBits; i++) {
                        var subscript = (numBits - i - 1).toString();
                        var x = i * textWidth;
                        bitLabelGroup.addText({
                            text: 'q',
                            subscript: subscript,
                            x: x});
                    }
                },
                
                renderStateLabels: function () {
                    for (var state = 0; state < numStates; state++) {
                        renderStateBitLabels(state, graphics.createGroup({
                            'cssClass': 'animatedQubitsStateLabel',
                            'y': animationCalculator.yOffSetForState(state) + textHeight/3
                        }));
                    }
                },
                
                renderState: function (stateComponents, options) {
                    amplitudeDiscsGroup = amplitudeDiscsGroup || graphics.createGroup({
                        'cssClass': 'animatedQubitsAmplitudeDiscs',
                        'x': maxRadius + (numBits + 1) * textWidth
                    });
                    return amplitudeDiscsGroup.renderAmplitudeDiscs(stateComponents, config, options);
                }
                
            };
        }
        return rendererFactory;
    }
    
    /* Support AMD and CommonJS, with a fallback of using the global namespace */
    if (typeof define !== 'undefined' && define.amd) {
        define(["qubitsGraphics", "qubitAnimationCalculator"], createModule);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = createModule(
            require('./qubitsGraphics'),
            require('./qubitAnimationCalculator'));
    } else {
        globals.animatedQubitsInternal = globals.animatedQubitsInternal || {};
        globals.animatedQubitsInternal.rendererFactory = createModule();
    }

    
})(this);