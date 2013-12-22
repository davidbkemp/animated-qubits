/* global define, module, require */

(function (globals) {
    "use strict";
    
    var createModule = function (graphicsFactory, calculatorFactory) {
        
        var ensureDependenciesAreSet = function () {
            graphicsFactory = graphicsFactory || globals.animatedQubitsInternal.graphicsFactory;
            calculatorFactory = calculatorFactory || globals.animatedQubitsInternal.calculatorFactory;
        };
    
        var rendererFactory = function (config) {
            ensureDependenciesAreSet();
            
            var graphics = graphicsFactory(config.element),
                animationCalculator = calculatorFactory(config),
                maxRadius = config.maxRadius,
                numBits = config.numBits,
                numStates = 1 << numBits,
                textHeight = graphics.getTextHeight(),
                textWidth = graphics.getTextWidth(),
                amplitudeDiscsGroup;

            var determineTotalHeight = function () {
                return animationCalculator.yOffSetForState(numStates - 1) + maxRadius;
            };
            
            var determineTotalWidth = function () {
                return (1 + numBits) * textWidth + 6 *  maxRadius;
            };
            
            var asBitString = function (state) {
                return ('0000000000000000' + state.toString(2)).slice(-numBits);
            };
            
            var renderStateBitLabels = function (state, graphicsGroup) {
                var bitString = asBitString(state);
                for(var bitPos = 0; bitPos < numBits; bitPos++) {
                    graphicsGroup.addText({
                        'class': 'animatedQubitsStateBitLabel',
                        'x': bitPos * textWidth,
                        'text': bitString.charAt(bitPos)
                    });
                }
            };

            return {
            
                updateDimensions: function () {
                    graphics.setHeight(determineTotalHeight());
                    graphics.setWidth(determineTotalWidth());
                },
                
                renderBitLabels: function () {
                    var y = 2 * textHeight / 3;
                    for (var i = 0; i < numBits; i++) {
                        var subscript = (numBits - i - 1).toString();
                        var x = i * textWidth;
                        graphics.addTextWithSubscript('q', subscript, x, y);
                    }
                },
                
                renderStateLabels: function () {
                    for (var state = 0; state < numStates; state++) {
                        renderStateBitLabels(state, graphics.createGroup({
                            'class': 'animatedQubitsStateLabel',
                            'y': animationCalculator.yOffSetForState(state) + textHeight/3
                        }));
                    }
                },
                
                renderState: function (stateComponents, options) {
                    amplitudeDiscsGroup = amplitudeDiscsGroup || graphics.createGroup({
                        'class': 'animatedQubitsAmplitudeDiscs',
                        'x': maxRadius + (numBits + 1) * textWidth
                    });
                    return amplitudeDiscsGroup.renderAmplitudeDiscs(stateComponents, config, options);
                }
                
            };
        };
        return rendererFactory;
    };
    
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