/* global require, describe, it, expect, beforeEach */

(function () {
"use strict";

var jsqubits = require('jsqubits').jsqubits,
    _ = require('lodash');

describe("qubitAnimationRenderer", function () {
    var config, calculator, maxRadius = 64;

    var findStateComponentWithKey = function (stateComponents, key) {
        return _.find(stateComponents, function stateComponentHasKey(stateComponent) {
            return stateComponent.key === key;
        });
    };

    var stateComponentAsString = function (stateComponent) {
        var clone = _.clone(stateComponent);
        _.assign(clone, {amplitude : stateComponent.amplitude.toString()});
        return JSON.stringify(clone);
    };

    beforeEach(function () {
        config = {maxRadius: maxRadius};
        calculator = require('../lib/qubitAnimationCalculator')(config);
    });
    
    describe("yOffSetForState", function () {
        it("should return maxRadius for 0", function () {
            expect(calculator.yOffSetForState(0)).toBe(maxRadius);
        });
        it("should return maxRadius * (1 + state*Math.SQRT_2)", function () {
            expect(calculator.yOffSetForState(7)).toBe(maxRadius * (1 + 7 * Math.SQRT2));
        });
    });

    describe("#augmentState", function () {
    
        var augmentedState;
    
        beforeEach(function () {
            var qstate = jsqubits('|10>').hadamard(1);
            augmentedState = calculator.augmentState(qstate);
        });
    
        it("should add keys to each state", function () {
            expect(augmentedState.length).toBe(2);
            expect(augmentedState[0].bitString).toBe('00');
            expect(augmentedState[0].key).toBeDefined();
            expect(augmentedState[1].bitString).toBe('10');
            expect(augmentedState[1].key).toBeDefined();
            expect(augmentedState[1].key).not.toEqual(augmentedState[0].key);
        });
        
        it("should set x and y offsets", function () {
            expect(augmentedState[0].x).toBe(0);
            expect(augmentedState[1].x).toBe(0);
            expect(augmentedState[0].y).toBe(config.maxRadius);
            expect(augmentedState[1].y).toBe(config.maxRadius * (1 + 2 * Math.SQRT2));
        });
    });
    
    describe("#createPhases with no interference", function () {
        var qstate, phases;
    
        beforeEach(function () {
            // 0.7071 |10> + 0.5+0.5i |11>
            qstate = jsqubits('|10>').hadamard(0).T(0);
            var operation = function hadamard1(state) { return state.hadamard(1); };
            var stateComponents = calculator.augmentState(qstate);
            phases = calculator.createPhases(stateComponents, operation);
            // NOTE: Final result should be:
            // 0.5 |00> + 0.3536+0.3536i |01> - 0.5 |10> - 0.3536+0.3536i |11>
        });
    
        it("phase1: should replicate initial state components for each resultant component", function () {
            var phase1 = phases.phase1;
            
            expect(phase1.length).toBe(4);
            
            expect(phase1[0].bitString).toBe("10");
            expect(phase1[1].bitString).toBe("10");
            expect(phase1[2].bitString).toBe("11");
            expect(phase1[3].bitString).toBe("11");
            
            expect(phase1[0].amplitude.format({decimalPlaces: 2})).toEqual('0.71');
            expect(phase1[1].amplitude.format({decimalPlaces: 2})).toEqual('0');
            expect(phase1[2].amplitude.format({decimalPlaces: 2})).toEqual('0.5+0.5i');
            expect(phase1[3].amplitude.format({decimalPlaces: 2})).toEqual('0');
            
            expect(phase1[0].key).toBe("k1-1");
            expect(phase1[1].key).toBe("k1-2");
            expect(phase1[2].key).toBe("k2-1");
            expect(phase1[3].key).toBe("k2-2");
        });
        
        it("phase2a: should set amplitudes back to their original values", function () {
            var phase2a = phases.phase2a;
            
            expect(Object.keys(phase2a).length).toBe(4);
            
            expect(phase2a['k1-1'].bitString).toBe("10");
            expect(phase2a['k1-2'].bitString).toBe("10");
            expect(phase2a['k2-1'].bitString).toBe("11");
            expect(phase2a['k2-2'].bitString).toBe("11");
            
            expect(phase2a['k1-1'].amplitude.format({decimalPlaces: 2})).toEqual('0.71');
            expect(phase2a['k1-2'].amplitude.format({decimalPlaces: 2})).toEqual('0.71');
            expect(phase2a['k2-1'].amplitude.format({decimalPlaces: 2})).toEqual('0.5+0.5i');
            expect(phase2a['k2-2'].amplitude.format({decimalPlaces: 2})).toEqual('0.5+0.5i');
        });
        
        it("phase 2b: should map to new state values", function () {
            var phase2b = phases.phase2b;
            
            expect(Object.keys(phase2b).length).toBe(4);

            expect(phase2b['k1-1'].bitString).toBe("00");
            expect(phase2b['k1-2'].bitString).toBe("10");
            expect(phase2b['k2-1'].bitString).toBe("01");
            expect(phase2b['k2-2'].bitString).toBe("11");

            expect(phase2b['k1-1'].amplitude.format({decimalPlaces: 2})).toEqual('0.5');
            expect(phase2b['k1-2'].amplitude.format({decimalPlaces: 2})).toEqual('-0.5');
            expect(phase2b['k2-1'].amplitude.format({decimalPlaces: 2})).toEqual('0.35+0.35i');
            expect(phase2b['k2-2'].amplitude.format({decimalPlaces: 2})).toEqual('-0.35-0.35i');
            
            expect(phase2b['k1-1'].x).toBe(maxRadius);
            expect(phase2b['k1-1'].y).toBe(maxRadius);
            expect(phase2b['k1-2'].x).toBe(maxRadius);
            expect(phase2b['k1-2'].y).toBe(maxRadius * (1 + 2 * Math.SQRT2));
            expect(phase2b['k2-1'].x).toBe(maxRadius);
            expect(phase2b['k2-1'].y).toBe(maxRadius * (1 + Math.SQRT2));
            expect(phase2b['k2-2'].x).toBe(maxRadius);
            expect(phase2b['k2-2'].y).toBe(maxRadius * (1 + 3 * Math.SQRT2));
        });

        it("stateComponentIndexesGroupedBySource: should group the state indexes by their initial states", function () {
            expect(phases.stateComponentIndexesGroupedBySource).toEqual([[0,1], [2,3]]);
        });
        
        it("phase 3: should be the same as phase2b (due to no interference)", function () {
            expect(phases.phase3.length).toEqual(4);
            phases.phase3.forEach(function shouldMatchPhase2b(phase3Component) {
                var key = phase3Component.key;
                expect(stateComponentAsString(phase3Component))
                    .toEqual(stateComponentAsString(phases.phase2b[key]));
            });
        });

    });
    
    describe("#createPhases with interference", function () {
        var qstate, phases;
    
        beforeEach(function () {
            // 0.7071 |10> + 0.5+0.5i |11>
            qstate = jsqubits('|10>').hadamard(0).T(0);
            var operation = function hadamard1(state) { return state.hadamard(0); };
            var stateComponents = calculator.augmentState(qstate);
            phases = calculator.createPhases(stateComponents, operation);
            // NOTE: Final result should be:
            // 0.8536+0.3536i |10> + 0.1464-0.3536i |11>
        });
    
        it("phase 2b: should position disc arrows head-to-tail", function () {
            var phase2b = phases.phase2b;
            
            expect(Object.keys(phase2b).length).toBe(4);

            expect(phase2b['k1-1'].bitString).toBe("10");
            expect(phase2b['k1-2'].bitString).toBe("11");
            expect(phase2b['k2-1'].bitString).toBe("10");
            expect(phase2b['k2-2'].bitString).toBe("11");

            expect(phase2b['k1-1'].amplitude.format({decimalPlaces: 2})).toEqual('0.5');
            expect(phase2b['k1-2'].amplitude.format({decimalPlaces: 2})).toEqual('0.5');
            expect(phase2b['k2-1'].amplitude.format({decimalPlaces: 2})).toEqual('0.35+0.35i');
            expect(phase2b['k2-2'].amplitude.format({decimalPlaces: 2})).toEqual('-0.35-0.35i');

            expect(phase2b['k1-1'].x).toBe(maxRadius);
            expect(phase2b['k1-1'].y).toBe(maxRadius * (1 + 2 * Math.SQRT2));
            expect(phase2b['k1-2'].x).toBe(maxRadius);
            expect(phase2b['k1-2'].y).toBe(maxRadius * (1 + 3 * Math.SQRT2));
            expect(phase2b['k2-1'].x).toBe(maxRadius * 1.5);
            expect(phase2b['k2-1'].y).toBe(maxRadius * (1 + 2 * Math.SQRT2));
            expect(phase2b['k2-2'].x).toBe(maxRadius * 1.5);
            expect(phase2b['k2-2'].y).toBe(maxRadius * (1 + 3 * Math.SQRT2));
        });

        it("stateComponentIndexesGroupedBySource: should group the state indexes by their initial states", function () {
            expect(phases.stateComponentIndexesGroupedBySource).toEqual([[0,1], [2,3]]);
        });
        
        it("phase 3: the first state disk of each state should expand to final state", function () {
            var phase3 = phases.phase3,
                k1_1 = findStateComponentWithKey(phase3, 'k1-1'),
                k1_2 = findStateComponentWithKey(phase3, 'k1-2');
            
            expect(k1_1.bitString).toBe("10");
            expect(k1_2.bitString).toBe("11");

            expect(k1_1.amplitude.format({decimalPlaces: 2})).toEqual('0.85+0.35i');
            expect(k1_2.amplitude.format({decimalPlaces: 2})).toEqual('0.15-0.35i');

            expect(k1_1.x).toBe(maxRadius);
            expect(k1_1.y).toBe(maxRadius * (1 + 2 * Math.SQRT2));
            expect(k1_2.x).toBe(maxRadius);
            expect(k1_2.y).toBe(maxRadius * (1 + 3 * Math.SQRT2));

        });

        it("phase 3: remaining states should have a tiny magnitude", function () {
            var phase3 = phases.phase3,
                k2_1 = findStateComponentWithKey(phase3, 'k2-1'),
                k2_2 = findStateComponentWithKey(phase3, 'k2-2');

            expect(k2_1.bitString).toBe("10");
            expect(k2_2.bitString).toBe("11");

            expect(k2_1.amplitude.format({decimalPlaces: 2})).toEqual('0');
            expect(k2_2.amplitude.format({decimalPlaces: 2})).toEqual('0');
            
            expect(k2_1.amplitude.phase()).toBe(phases.phase2b['k2-1'].amplitude.phase());
            expect(k2_2.amplitude.phase()).toBe(phases.phase2b['k2-2'].amplitude.phase());

            expect(k2_1.x).toBeCloseTo(maxRadius * 1.8536, 2);
            expect(k2_1.y).toBeCloseTo(maxRadius * ((1 - 0.3536) + 2 * Math.SQRT2), 2);
            expect(k2_2.x).toBeCloseTo(maxRadius * 1.1464, 2);
            expect(k2_2.y).toBeCloseTo(maxRadius * ((1 + 0.3536) + 3 * Math.SQRT2), 2);
        });

        it("phase 4: major states should remain unchanged, and remainder disappear", function () {
            var phase3 = phases.phase3,
                p3_k1_1 = findStateComponentWithKey(phase3, 'k1-1'),
                p3_k1_2 = findStateComponentWithKey(phase3, 'k1-2');
                
            var phase4 = phases.phase4,
                p4_k1_1 = findStateComponentWithKey(phase4, 'k1-1'),
                p4_k1_2 = findStateComponentWithKey(phase4, 'k1-2');
                
            expect(p4_k1_1).toEqual(p3_k1_1);
            expect(p4_k1_2).toEqual(p3_k1_2);

            expect(phase4.length).toBe(2);
        });

        it("phase 5: should have zero x offset", function () {
            var phase5 = phases.phase5,
                k1_1 = findStateComponentWithKey(phase5, 'k1-1'),
                k1_2 = findStateComponentWithKey(phase5, 'k1-2');
            
            expect(k1_1.bitString).toBe("10");
            expect(k1_2.bitString).toBe("11");

            expect(k1_1.x).toBe(0);
            expect(k1_1.y).toBe(maxRadius * (1 + 2 * Math.SQRT2));
            expect(k1_2.x).toBe(0);
            expect(k1_2.y).toBe(maxRadius * (1 + 3 * Math.SQRT2));
        });

    });
});

})();