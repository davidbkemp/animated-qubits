(function (globals) {
    "use strict";
    
    var jsqubits = globals.jsqubits,
        animatedQubits = globals.animatedQubits,
        alert = globals.alert;

    function QuantumAnimationController($scope) {
    
        function initializeState() {
            $scope.numBits = parseInt($scope.numBitsSelected, 10);
            $scope.bitLabels.length = 0;
            $scope.targetBits.length = 0;
            for(var i = 0; i < $scope.numBits; i++) {
                $scope.bitLabels.push(i);
            }

            $scope.animatedQubitsModel.qstate = new jsqubits.QState($scope.numBits);
        }
    
        $scope.numBitsSelected = '2';
        $scope.operationIndex = 0;
        $scope.bitLabels = [];
        $scope.targetBits = [];
        $scope.animatedQubitsModel = {};
        
        $scope.operations = [
            {name: 'Hadamard', op: 'hadamard', options: {skipInterferenceSteps: false}},
            {name: 'X', op: 'x', options: {skipInterferenceSteps: true}}
        ];
        
        $scope.onChangeNumBits = function() {
            initializeState();
            $scope.animatedQubitsModel.animatedQubits.resetQState($scope.animatedQubitsModel.qstate);
        };

        $scope.selectAllAsTargetBits = function () {
            for(var i = 0; i < $scope.numBits; i++) {
                $scope.targetBits[i] = true;
            }
        };

        $scope.performOperation = function () {
            var targetBits = [];
            var operation = $scope.operations[$scope.operationIndex];
            
            for (var i = 0; i < $scope.targetBits.length; i++) {
                if ($scope.targetBits[i]) {
                    targetBits.push(i);
                }
            }
            var op = function op(qstate) {
                return qstate[operation.op](targetBits);
            };

            $scope.animatedQubitsModel.animatedQubits.applyOperation(op, operation.options)
                .then(function succeeded() {
                    $scope.$apply(function () {
                        $scope.animatedQubitsModel.qstate = op($scope.animatedQubitsModel.qstate);
                    });
                })
                .fail(function failed(msg) {
                    alert(msg);
                });
        };

        initializeState();

        $scope.animatedQubitsModel.animatedQubits =
            animatedQubits($scope.animatedQubitsModel.qstate, {maxRadius: 50});
    }
    

    globals.QuantumAnimationController = QuantumAnimationController;

})(this);