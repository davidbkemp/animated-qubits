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
    
        function initializeState() {
            $scope.numBits = parseInt($scope.numBitsSelected, 10);
            $scope.bitLabels.length = 0;
            $scope.controlBits.length = 0;
            $scope.targetBits.length = 0;
            // Appending the labels in reverse makes it easier to render them that way
            for(var i = $scope.numBits - 1; i >= 0; i--) {
                $scope.bitLabels.push(i);
            }

            $scope.animatedQubitsContainer.qstate = new jsqubits.QState($scope.numBits);
            $scope.animatedQubitsContainer.animatedQubits =
                animatedQubits($scope.animatedQubitsContainer.qstate, {maxRadius: 50});
            updateState();
        }
    
        $scope.numBitsSelected = '2';
        $scope.operationIndex = 0;
        $scope.bitLabels = [];
        $scope.controlBits = [];
        $scope.targetBits = [];
        $scope.animatedQubitsContainer = {};
        
        $scope.operations = [
            {name: 'Hadamard', op: 'controlledHadamard', options: {skipInterferenceSteps: false},
                takesControlBits: true},
            {name: 'X', op: 'controlledX', options: {skipInterferenceSteps: true},
                takesControlBits: true},
            {name: 'Y', op: 'controlledY', options: {skipInterferenceSteps: true},
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

        $scope.selectAllAsTargetBits = function () {
            for(var i = 0; i < $scope.numBits; i++) {
                $scope.targetBits[i] = ! $scope.controlBits[i];
            }
        };
        
        $scope.validInputs = function () {
            return $scope.targetBits.indexOf(true) >= 0;
        };

        $scope.performOperation = function () {
            var controlBits = [];
            var targetBits = [];
            var operation = $scope.operations[$scope.operationIndex];
            
            for (var targetBitsIndex = 0; targetBitsIndex < $scope.targetBits.length; targetBitsIndex++) {
                if ($scope.targetBits[targetBitsIndex]) {
                    targetBits.push(targetBitsIndex);
                }
            }
            for (var controlBitsIndex = 0; controlBitsIndex < $scope.controlBits.length; controlBitsIndex++) {
                if ($scope.controlBits[controlBitsIndex]) {
                    controlBits.push(controlBitsIndex);
                }
            }
            if (controlBits.length === 0) controlBits = null;
            var op = function op(qstate) {
                return operation.takesControlBits ?
                    qstate[operation.op](controlBits, targetBits) :
                    qstate[operation.op](targetBits);
            };

            $scope.animatedQubitsContainer.animatedQubits.applyOperation(op, operation.options)
                .then(function succeeded() {
                    $scope.$apply(function () {
                        $scope.animatedQubitsContainer.qstate = op($scope.animatedQubitsContainer.qstate);
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