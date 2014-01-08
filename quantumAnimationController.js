(function (globals) {
    "use strict";
    
    var jsqubits = globals.jsqubits,
        animatedQubits = globals.animatedQubits,
        alert = globals.alert;

    function QuantumAnimationController($scope) {
    
        function updateState() {
            $scope.controlBitsDisabled = $scope.numBits === 1 ||
                !$scope.operations[$scope.operationIndex].takesControlBits;
            if ($scope.controlBitsDisabled) $scope.controlBits.length = 0;
            $scope.targetBitsDisabled = $scope.numBits === 1;
            if ($scope.numBits === 1) $scope.targetBits = [true];
        }
        
        function resetOverlappingBits(bits1, bits2) {
            bits2.forEach(function resetBit2IfBit1IsTrue(bit2Value, index) {
                if (bit2Value && bits1[index]) bits2[index] = false;
            });
        }
    
        function initializeState() {
            $scope.numBits = parseInt($scope.numBitsSelected, 10);
            $scope.bitLabels.length = 0;
            $scope.controlBits.length = 0;
            $scope.targetBits.length = 0;
            // Appending the labels in reverse makes it easier to render them that way
            for(var i = $scope.numBits - 1; i >= 0; i--) {
                $scope.bitLabels.push(i);
            }

            $scope.animatedQubitsContainer.qstate =
                new jsqubits.QState($scope.numBits).hadamard(jsqubits.ALL);
            $scope.animatedQubitsContainer.animatedQubits =
                animatedQubits($scope.animatedQubitsContainer.qstate, {maxRadius: 50});
            updateState();
        }
        
        function extractBitIndexes(booleanArray) {
            return booleanArray.reduce(function includeIndexIfTrue(acc, value, index) {
                if (value) acc.push(index);
                return acc;
            }, []);
        }
        
        function measure(targetBits) {
            return $scope.animatedQubitsContainer.animatedQubits.measure(targetBits);
        }
        
        function applyOperation(operation, controlBits, targetBits) {
            function op(qstate) {
                return operation.takesControlBits ?
                    qstate[operation.op](controlBits, targetBits) :
                    qstate[operation.op](targetBits);
            }
            return $scope.animatedQubitsContainer.animatedQubits.applyOperation(op, operation.options);
        }
    
        $scope.numBitsSelected = '2';
        $scope.operationIndex = 0;
        $scope.bitLabels = [];
        $scope.controlBits = [];
        $scope.targetBits = [];
        $scope.animatedQubitsContainer = {};
        
        $scope.operations = [
            {name: 'Measure', op: 'measure', options: {},
                takesControlBits: false},
            {name: 'Hadamard', op: 'controlledHadamard', options: {skipInterferenceSteps: false},
                takesControlBits: true},
            {name: 'X', op: 'controlledX', options: {skipInterferenceSteps: false},
                takesControlBits: true},
            {name: 'Y', op: 'controlledY', options: {skipInterferenceSteps: false},
                takesControlBits: true},
            {name: 'Z', op: 'controlledZ', options: {skipInterferenceSteps: true},
                takesControlBits: true},
            {name: 'T', op: 'controlledT', options: {skipInterferenceSteps: true},
                takesControlBits: true},
            {name: 'S', op: 'controlledS', options: {skipInterferenceSteps: true},
                takesControlBits: true},
            {name: 'QFT', op: 'qft', options: {skipInterferenceSteps: false},
                takesControlBits: false}
        ];
        
        $scope.onChangeOperation = function name() {
            updateState();
        };
        
        $scope.onChangeNumBits = function() {
            initializeState();
            $scope.animatedQubitsContainer.reset();
        };
        
        $scope.onChangeControlBits = function () {
            resetOverlappingBits($scope.controlBits, $scope.targetBits);
        };
        
        $scope.onChangeTargetBits = function () {
            resetOverlappingBits($scope.targetBits, $scope.controlBits);
        };

        $scope.selectAllAsTargetBits = function () {
            for(var i = 0; i < $scope.numBits; i++) {
                $scope.targetBits[i] = ! $scope.controlBits[i];
            }
        };
        
        $scope.validInputs = function () {
            return $scope.targetBits.indexOf(true) >= 0;
        };

        $scope.performOperation = function () {
            var operationResultPromise,
                controlBits = extractBitIndexes($scope.controlBits),
                targetBits = extractBitIndexes($scope.targetBits),
                operation = $scope.operations[$scope.operationIndex];
                
            operationResultPromise = (operation.op === "measure") ?
                measure(targetBits) :
                applyOperation(operation, controlBits, targetBits);

            operationResultPromise.then(function succeeded(newQState) {
                    $scope.$apply(function updateQState() {
                        $scope.animatedQubitsContainer.qstate = newQState;
                    });
                })
                .fail(function failed(msg) {
                    alert(msg);
                });
        };

        initializeState();
    }
    

    globals.QuantumAnimationController = QuantumAnimationController;

})(this);