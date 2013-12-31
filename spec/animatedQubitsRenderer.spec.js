/* global require, describe, it, expect, beforeEach, afterEach, spyOn */

(function () {
"use strict";

var mockery = require('mockery'),
    _ = require('lodash'),
    jsqubits = require('jsqubits').jsqubits;

describe("animatedQubitsRenderer using npm/commonjs dependencies", function () {
    it('should should load without error', function () {
        expect(require('../lib/animatedQubitsRenderer')).not.toBeFalsy();
    });
});

describe("animatedQubitsRenderer", function () {

    var mockQubitsGraphicsModule,
        mockQubitsGraphics,
        mockCalculatorModule,
        mockCalculator,
        mockGraphicsGroup,
        config,
        textHeight = 13,
        textWidth = 17;
        
    beforeEach(function () {
        config = {
            element: "the svg element",
            maxRadius: 21,
            numBits: 3
        };
        
        mockQubitsGraphics = {
            setHeight: function () {},
            setWidth: function () {},
            getTextHeight: function () {return textHeight;},
            getTextWidth: function () {return textWidth;},
            addText: function () {},
            addTextWithSubscript: function () {},
            createGroup: function () {return mockGraphicsGroup;},
            renderAmplitudeDiscs: function () {}
        };
        
        mockGraphicsGroup = _.clone(mockQubitsGraphics);
    
        mockQubitsGraphicsModule = function (element) {
            mockQubitsGraphicsModule.svgElement = element;
            return mockQubitsGraphics;
        };
    
        mockCalculator = {
            yOffSetForState: function () {
            }
        };
        
        mockCalculatorModule = function () {
            return mockCalculator;
        };
    
        mockery.enable({useCleanCache: true});
        mockery.registerAllowable('../lib/animatedQubitsRenderer');
        mockery.registerMock('./qubitsGraphics', mockQubitsGraphicsModule);
        mockery.registerMock('./qubitAnimationCalculator', mockCalculatorModule);
    });
    
    afterEach(function () {
        mockery.deregisterAll();
        mockery.disable();
    });
    
    
    it("should pass the svgElement to qubitsGraphics", function name() {
        require('../lib/animatedQubitsRenderer')(config);
        expect(mockQubitsGraphicsModule.svgElement).toBe(config.element);
    });
        
    describe('#updateDimensions', function () {
        var renderer,
            numStates;
            
        beforeEach(function () {
            numStates = 1 << config.numBits;
            renderer = require('../lib/animatedQubitsRenderer')(config);
        });
        
        it("should set the height", function () {
            spyOn(mockCalculator, 'yOffSetForState').andReturn(100);
            spyOn(mockQubitsGraphics, 'setHeight');
               
            renderer.updateDimensions();
            
            expect(mockCalculator.yOffSetForState).toHaveBeenCalledWith(numStates - 1);
            expect(mockQubitsGraphics.setHeight).toHaveBeenCalledWith(config.maxRadius + 100);
        });


        it('should set the width', function () {
            spyOn(mockQubitsGraphics, 'setWidth');
            
            renderer.updateDimensions();
            
            expect(mockQubitsGraphics.setWidth)
                .toHaveBeenCalledWith((1 + config.numBits) * textWidth + 6 * config.maxRadius);

        });
    });
    
    describe('#renderBitLabels', function () {
        var renderer;
            
        beforeEach(function () {
            renderer = require('../lib/animatedQubitsRenderer')(config);
        });

        it('should create bit labels', function () {
            spyOn(mockQubitsGraphics, 'addTextWithSubscript');
            
            renderer.renderBitLabels();
            
            var expectedY = 2 * textHeight / 3;
            expect(mockQubitsGraphics.addTextWithSubscript)
                .toHaveBeenCalledWith('q', '2', 0, expectedY);
            expect(mockQubitsGraphics.addTextWithSubscript)
                .toHaveBeenCalledWith('q', '1', textWidth, expectedY);
            expect(mockQubitsGraphics.addTextWithSubscript)
                .toHaveBeenCalledWith('q', '0', textWidth * 2, expectedY);
        });
    });

    describe("#renderStateLabels", function () {
        var renderer;
            
        beforeEach(function () {
            config.numBits = 2;
            renderer = require('../lib/animatedQubitsRenderer')(config);
        });

        it('should create state labels', function () {
        
            spyOn(mockQubitsGraphics, 'createGroup').andReturn(mockGraphicsGroup);
            spyOn(mockGraphicsGroup, 'addText');
            spyOn(mockCalculator, 'yOffSetForState').andCallFake(function (state) {
                return state * 100;
            });
            
            renderer.renderStateLabels();
            
            expect(mockQubitsGraphics.createGroup).toHaveBeenCalledWith({
                'class': 'animatedQubitsStateLabel', 'y': textHeight/3
            });
            expect(mockGraphicsGroup.addText).toHaveBeenCalledWith({
                'class': 'animatedQubitsStateBitLabel', 'x': 0, 'text': '0'
            });
            expect(mockGraphicsGroup.addText).toHaveBeenCalledWith({
                'class': 'animatedQubitsStateBitLabel', 'x': textWidth, 'text': '0'
            });
            
            expect(mockQubitsGraphics.createGroup).toHaveBeenCalledWith({
                'class': 'animatedQubitsStateLabel',
                'y': 100 + textHeight/3
            });
            expect(mockGraphicsGroup.addText).toHaveBeenCalledWith({
                'class': 'animatedQubitsStateBitLabel', 'x': 0, 'text': '0'
            });
            expect(mockGraphicsGroup.addText).toHaveBeenCalledWith({
                'class': 'animatedQubitsStateBitLabel', 'x': textWidth, 'text': '1'
            });
            
            expect(mockQubitsGraphics.createGroup).toHaveBeenCalledWith({
                'class': 'animatedQubitsStateLabel',
                'y': 200 + textHeight/3
            });
            expect(mockGraphicsGroup.addText).toHaveBeenCalledWith({
                'class': 'animatedQubitsStateBitLabel', 'x': 0, 'text': '1'
            });
            expect(mockGraphicsGroup.addText).toHaveBeenCalledWith({
                'class': 'animatedQubitsStateBitLabel', 'x': textWidth, 'text': '0'
            });
            
            expect(mockQubitsGraphics.createGroup).toHaveBeenCalledWith({
                'class': 'animatedQubitsStateLabel',
                'y': 300 + textHeight/3
            });
            expect(mockGraphicsGroup.addText).toHaveBeenCalledWith({
                'class': 'animatedQubitsStateBitLabel', 'x': 0, 'text': '1'
            });
            expect(mockGraphicsGroup.addText).toHaveBeenCalledWith({
                'class': 'animatedQubitsStateBitLabel', 'x': textWidth, 'text': '1'
            });
            
        });
   
    });
    
    describe("renderState", function () {
    
        var renderer, stateComponents;
            
        beforeEach(function () {
            config.numBits = 2;
            renderer = require('../lib/animatedQubitsRenderer')(config);
            var amplitude = jsqubits.complex(Math.SQRT1_2, -Math.SQRT1_2);
            var stateComponent = new jsqubits.StateWithAmplitude(2, '3', amplitude);
            stateComponent.x = 5;
            stateComponent.y = 7;
            stateComponents = [stateComponent];
        });
        
        it("should create the amplitude disc group for the first time", function () {
            spyOn(mockQubitsGraphics, 'createGroup').andReturn(mockGraphicsGroup);
            renderer.renderState(stateComponents);
            expect(mockQubitsGraphics.createGroup.calls.length).toBe(1);
            expect(mockQubitsGraphics.createGroup).toHaveBeenCalledWith({
                "class": "animatedQubitsAmplitudeDiscs",
                "x": config.maxRadius + (config.numBits + 1) * textWidth
            });
        });
        
        it("should not re-create the amplitude disc group on subsequent calls", function () {
            spyOn(mockQubitsGraphics, 'createGroup').andReturn(mockGraphicsGroup);
            renderer.renderState(stateComponents);
            renderer.renderState(stateComponents);
            expect(mockQubitsGraphics.createGroup.calls.length).toBe(1);
        });

        it("should render amplitude discs", function () {
            spyOn(mockGraphicsGroup, 'renderAmplitudeDiscs');
            var options = {duration: 400};
            renderer.renderState(stateComponents, options);
            expect(mockGraphicsGroup.renderAmplitudeDiscs)
                .toHaveBeenCalledWith(stateComponents, config, options);
        });
    });

});

})();
