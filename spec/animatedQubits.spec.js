/*global require, describe, it, expect, beforeEach, afterEach, spyOn, jasmine */

(function () {
"use strict";

var mockery = require('mockery'),
    _ = require('lodash'),
    jsqubits = require('jsqubits').jsqubits;

var createMockPromise = function () {
    return {
        when: function (f) {
            if (f) f();
            return createMockPromise();
        },
        then: function (f) {
            if (f) f();
            return createMockPromise();
        }
    };
};

describe("animatedQubits using npm/commonjs dependencies", function () {
    it("should load without error", function () {
        var animatedQubits = require('../animatedQubits');
        expect(animatedQubits).not.toBeFalsy();
    });
});

describe("animatedQubits", function () {

    var mockRendererModule,
        mockRenderer,
        mockCalculatorModule,
        mockCalculator,
        mockQ,
        mockInitialPromise,
        config;
        
    beforeEach(function () {
        config = {
            maxRadius: 21
        };
        
        mockRenderer = {
            updateDimensions: function () {},
            renderBitLabels: function () {},
            renderStateLabels: function () {},
            renderState: function () {
                return createMockPromise();
            }
        };
        
        mockRendererModule = function (params) {
            mockRendererModule.params = params;
            return mockRenderer;
        };
        
        mockCalculator = {
            augmentState: function () { return []; },
            createPhases: function () { return {}; }
        };
        
        mockCalculatorModule = function () {
            return mockCalculator;
        };

        mockInitialPromise = createMockPromise();

        mockQ = {
            when: function () {}
        };

        spyOn(mockQ, 'when').andReturn(mockInitialPromise);

        mockery.enable({useCleanCache: true});
        mockery.registerAllowable('../animatedQubits');
        mockery.registerAllowable('lodash');
        mockery.registerMock('./lib/animatedQubitsRenderer', mockRendererModule);
        mockery.registerMock('./lib/qubitAnimationCalculator', mockCalculatorModule);
        mockery.registerMock('q', mockQ);
    });
    
    afterEach(function () {
        mockery.deregisterAll();
        mockery.disable();
    });
    
    it("should return an object with a display() method", function () {
        var qstate = jsqubits('|110>'),
            animation = require('../animatedQubits')(qstate, config);
        
        expect(typeof animation.display).toBe("function");
    });

    describe('#display', function () {
        var qstate,
            numStates,
            animation;
            
        beforeEach(function () {
            qstate = jsqubits('|101>');
            numStates = 1 << qstate.numBits();
            animation = require('../animatedQubits')(qstate, config);
        });
        
        it("should pass the required params to the renderer", function () {
            animation.display("the svg element");
            
            expect(mockRendererModule.params).toEqual({
                element: "the svg element",
                numBits: 3,
                maxRadius: config.maxRadius
            });
        });
        
        it("should render the labels", function () {
            spyOn(mockRenderer, 'updateDimensions');
            spyOn(mockRenderer, 'renderBitLabels');
            spyOn(mockRenderer, 'renderStateLabels');
               
            animation.display("the svg element");

            expect(mockRenderer.updateDimensions).toHaveBeenCalled();
            expect(mockRenderer.renderBitLabels).toHaveBeenCalled();
            expect(mockRenderer.renderStateLabels).toHaveBeenCalled();
        });

        it("should augment the state", function () {
            spyOn(mockCalculator, 'augmentState');
        
            animation.display("the svg element");
            
            expect(mockCalculator.augmentState).toHaveBeenCalledWith(qstate);
        });
        
        it("should render the augmented state", function () {
            spyOn(mockCalculator, 'augmentState').andReturn("augmented state");
            spyOn(mockRenderer, 'renderState');
            
            animation.display("the svg element");
            
            expect(mockRenderer.renderState).toHaveBeenCalledWith("augmented state");
        });

    });
    
    describe("#applyOperation", function () {
    
        var animation,
            qstate,
            operation,
            operationReturnState,
            operationCalls,
            renderStateCalls,
            phase1, phase2a, phase2b,
            options;
            
            
        beforeEach(function () {
            options = {someOption: 42};
            qstate = jsqubits('|101>').hadamard(0);
            animation = require('../animatedQubits')(qstate, config);
            animation.display('svg element');
            phase1 = [
                {key:'k1',amplitude:'a1-1'},
                {key:'k2',amplitude:'a1-2'},
                {key:'k3',amplitude:'a1-3'},
                {key:'k4',amplitude:'a1-4'}
            ];

            phase2a = {
                'k1':{key:'k1',amplitude:'a2a-1'},
                'k2':{key:'k2',amplitude:'a2a-2'},
                'k3':{key:'k3',amplitude:'a2a-3'},
                'k4':{key:'k4',amplitude:'a2a-4'}
            };

            phase2b = {
                'k1':{key:'k1',amplitude:'a2b-1'},
                'k2':{key:'k2',amplitude:'a2b-2'},
                'k3':{key:'k3',amplitude:'a2b-3'},
                'k4':{key:'k4',amplitude:'a2b-4'}
            };
            
            // Roll our own mockRenderer so we can clone the call arguments.
            renderStateCalls = [];
            mockRenderer.renderState = function renderState() {
                renderStateCalls.push(_.cloneDeep(arguments));
                return createMockPromise();
            };
            
            spyOn(mockCalculator, 'createPhases').andReturn({
                phase1: phase1,
                phase2a: phase2a,
                phase2b: phase2b,
                phase3: 'phase3',
                phase4: 'phase4',
                phase5: 'phase5',
                stateComponentIndexesGroupedBySource: [[0, 1], [2, 3]]
            });
            operationCalls = [];
            operationReturnState = qstate.T(0);
            operation = function op(state) {
                operationCalls.push(state);
                return operationReturnState;
            };
        });
    
        it("should wait for any exisiting operation to complete", function () {
            var nextPromise = createMockPromise();
            spyOn(mockInitialPromise, 'then').andReturn(nextPromise);
            
            var returnValue = animation.applyOperation(operation, options);
            
            expect(mockQ.when).toHaveBeenCalledWith();
            expect(mockInitialPromise.then).toHaveBeenCalled();
            expect(returnValue).toBe(nextPromise);
        });
        
        it("should create phases", function () {
            animation.applyOperation(operation, options);
            expect(mockCalculator.createPhases)
                .toHaveBeenCalledWith(jasmine.any(Array), operation);
        });
        
        it("should render phase1", function () {
            animation.applyOperation(operation, options);
            expect(renderStateCalls[0][0]).toEqual(phase1);
            expect(renderStateCalls[0][1]).toEqual({duration: 0});
        });
        
        it("should render phase2a and phase2b one group at a time", function () {
            animation.applyOperation(operation, options);
            expect(renderStateCalls[1][0]).toEqual([
                {key:'k1',amplitude:'a2a-1'},
                {key:'k2',amplitude:'a2a-2'},
                {key:'k3',amplitude:'a1-3'},
                {key:'k4',amplitude:'a1-4'}
            ]);
            expect(renderStateCalls[1][1]).toEqual({duration: 0});
            
            expect(renderStateCalls[2][0]).toEqual([
                {key:'k1',amplitude:'a2b-1'},
                {key:'k2',amplitude:'a2b-2'},
                {key:'k3',amplitude:'a1-3'},
                {key:'k4',amplitude:'a1-4'}
            ]);
            expect(renderStateCalls[2][1]).toBeUndefined();
            
            expect(renderStateCalls[3][0]).toEqual([
                {key:'k1',amplitude:'a2b-1'},
                {key:'k2',amplitude:'a2b-2'},
                {key:'k3',amplitude:'a2a-3'},
                {key:'k4',amplitude:'a2a-4'}
            ]);
            expect(renderStateCalls[3][1]).toEqual({duration: 0});
            
            expect(renderStateCalls[4][0]).toEqual([
                {key:'k1',amplitude:'a2b-1'},
                {key:'k2',amplitude:'a2b-2'},
                {key:'k3',amplitude:'a2b-3'},
                {key:'k4',amplitude:'a2b-4'}
            ]);
            expect(renderStateCalls[4][1]).toBeUndefined();
        });
        
        it("should render phase3 states", function () {
            animation.applyOperation(operation, options);
            expect(renderStateCalls[5][0]).toEqual('phase3');
            expect(renderStateCalls[5][1]).toBeUndefined();
        });
        
        it("should render phase4 states", function () {
            animation.applyOperation(operation, options);
            expect(renderStateCalls[6][0]).toEqual('phase4');
            expect(renderStateCalls[6][1]).toEqual({duration: 0});
        });
        
        it("should render phase4 states", function () {
            animation.applyOperation(operation, options);
            expect(renderStateCalls[7][0]).toEqual('phase5');
            expect(renderStateCalls[7][1]).toBeUndefined();
        });
        
        it("should apply the operation to qstate and its components", function () {
            animation.applyOperation(operation, options);
            expect(operationCalls.length).toBe(1);
            expect(operationCalls[0]).toBe(qstate);
        });
        
        it("should augment the new state", function () {
            spyOn(mockCalculator, 'augmentState');
            animation.applyOperation(operation, options);
            expect(mockCalculator.augmentState).toHaveBeenCalledWith(operationReturnState);
        });
        
        describe("when applied for a second time", function () {
            it("should create phases based on the new state", function () {
                spyOn(mockCalculator, 'augmentState').andReturn(["newAugmentedState"]);
                animation.applyOperation(operation, options);
                animation.applyOperation(operation, options);
                expect(mockCalculator.createPhases.calls.length).toBe(2);
                expect(mockCalculator.createPhases.calls[1].args[0]).toEqual(["newAugmentedState"]);
            });
        });
        
        describe('when skipInterferenceSteps is specified', function () {
            it('should only apply phases 1 and 5', function () {
                animation.applyOperation(operation, {skipInterferenceSteps: true});
                expect(renderStateCalls[0][0]).toEqual(phase1);
                expect(renderStateCalls[0][1]).toEqual({duration: 0});
                expect(renderStateCalls[1][0]).toEqual('phase5');
                expect(renderStateCalls[1][1]).toBeUndefined();
            });
        });
    });

});



})();