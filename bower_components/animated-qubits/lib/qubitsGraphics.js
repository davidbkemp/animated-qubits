/* global define, module, require */

(function (globals) {
    "use strict";
    
    var createModule = function (Q, d3, d3MeasureText) {

        var amplitudeDiskTransform;

        var initialize = function () {
            Q = Q || globals.Q;
            d3 = d3 || globals.d3;
            d3MeasureText = d3MeasureText || globals.d3MeasureText;
            amplitudeDiskTransform = d3.svg.transform()
                .translate(function (stateComponent) {
                    return [stateComponent.x, stateComponent.y];
                })
                .scale(function (stateComponent) {
                    return stateComponent.amplitude.magnitude();
                })
                .rotate(function (stateComponent) {
                    return -180 * stateComponent.amplitude.phase() / Math.PI;
                });
        };
    
        var qubitsGraphicsFromDomElement = function (svgElement) {
            initialize();
            return qubitsGraphicsFromD3Element(d3.select(svgElement));
        };
    
        var qubitsGraphicsFromD3Element = function (d3Element) {
            d3MeasureText.d3 = d3MeasureText.d3 || d3;
            var textDim = d3MeasureText("M");

            function appendArrows(d3Selection, options) {
        
                var length = options.length;
                var lineClass = options.lineClass;
                var headClass = options.headClass;
        
                d3Selection
                    .append("line")
                    .attr('class', lineClass)
                    .attr('x1', 0)
                    .attr('y1', 0)
                    .attr('x2', length)
                    .attr('y2', 0);
        
                var headLength = length / 4;
                var x1 = length - headLength;
                var y1 = -headLength / 2;
                var x2 = x1;
                var y2 = y1 + headLength;
                var x3 = length;
                var y3 = 0;
        
                d3Selection
                    .append("polygon")
                    .attr('class', headClass)
                    .attr('points', '' + x1 + "," + y1 + " " + x2 + "," + y2 + " " + x3 + "," + y3);
            }

            var renderNewAmplitudeDiscs = function (amplitudeDiscGroup, stateComponents, config) {
                    
                var newDiscs = amplitudeDiscGroup.enter()
                    .append('g')
                    .attr('class', 'animatedQubitsAmplitudeDisc')
                    .attr('transform', amplitudeDiskTransform);
        
                newDiscs
                    .append('circle')
                    .attr('class', 'animatedQubitsAmplitudeCircle')
                    .attr('cx', 0)
                    .attr('cy', 0)
                    .attr('r', config.maxRadius);

                appendArrows(newDiscs, {
                    length: config.maxRadius,
                    lineClass: 'animatedQubitsPhaseArrow',
                    headClass: 'animatedQubitsPhaseArrowEnd'
                });
            };

            var transitionExistingAmplitudeDiscs = function (amplitudeDiscGroup, stateComponents, config, options) {
                var transitionEndDeferreds = [];
                var transitionEndPromises = [];
                amplitudeDiscGroup.transition()
                    .duration(options.duration == null ? 1000 : options.duration)
                    .attr('transform', amplitudeDiskTransform)
                    .each(function() {
                        var deferred = Q.defer();
                        transitionEndDeferreds.push(deferred);
                        transitionEndPromises.push(deferred.promise);
                    })
                    .each('end', function () {
                        transitionEndDeferreds.pop().resolve();
                    });
                return Q.all(transitionEndPromises);
            };

            return {
                getTextHeight: function () {
                    return textDim.height;
                },
                getTextWidth: function () {
                    return textDim.width * 1.5;
                },
                setHeight: function (height) {
                    d3Element.attr('height', height);
                },
                setWidth: function (width) {
                    d3Element.attr('width', width);
                },
                addText: function (options) {
                    var cssClass = options['class'];
                    var x = options.x || 0;
                    var y = options.y || 0;
                    var text = options.text;
                    d3Element.append('text')
                        .attr('x', x)
                        .attr('y', y)
                        .attr('class', cssClass)
                        .text(text);
                },
                addTextWithSubscript: function (text, subscript, x, y) {
                    var textElem = d3Element.append('g').append('text').attr('x', x);
                    textElem.append('tspan').text(text).attr('y', y);
                    textElem.append('tspan').text(subscript)
                        .attr('class', 'animatedTextSubscript')
                        .attr('y', y + textDim.height / 2);
                },
                createGroup: function (options) {
                    var cssClass = options['class'];
                    var x = options.x || 0;
                    var y = options.y || 0;
                    var transform = d3.svg.transform().translate([x, y]);
                    var element = d3Element.append('g')
                        .attr('class', cssClass)
                        .attr('transform', transform);
                    return(qubitsGraphicsFromD3Element(element));
                },
                renderAmplitudeDiscs: function (stateComponents, config, options) {
                    options = options || {};
                    var amplitudeDiscGroup = d3Element.selectAll('.animatedQubitsAmplitudeDisc')
                        .data(stateComponents, function (stateComponent) {
                            return stateComponent.key;
                        });
            
                    var transitionsEndedPromise = transitionExistingAmplitudeDiscs(amplitudeDiscGroup, stateComponents, config, options);
                    renderNewAmplitudeDiscs(amplitudeDiscGroup, stateComponents, config);
                    amplitudeDiscGroup.exit().remove();
                    return transitionsEndedPromise;
                }
            };
        };
        return qubitsGraphicsFromDomElement;
    };
    
    /* Support AMD and CommonJS, with a fallback of putting animatedQubits in the global namespace */
    if (typeof define !== 'undefined' && define.amd) {
        define(["q", "d3", "d3MeasureText"], createModule);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = createModule(require('q'), require('d3'), require('d3-measure-text'));
    } else {
        globals.animatedQubitsInternal = globals.animatedQubitsInternal || {};
        globals.animatedQubitsInternal.graphicsFactory = createModule();
    }

    
})(this);