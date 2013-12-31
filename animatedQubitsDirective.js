

(function (globals) {
    "use strict";

    function animatedQubitsDirective() {
    
        return {
           scope: {
                animatedQubitsContainer: '=animatedQubits'
            },
            
            link: function postLink(scope, element) {
                scope.animatedQubitsContainer.animatedQubits.display(element[0]);
                scope.animatedQubitsContainer.reset = function reset() {
                    element.empty();
                    scope.animatedQubitsContainer.animatedQubits.display(element[0]);
                };
            }
        };
        
    }
    
    globals.animatedQubitsDirective = animatedQubitsDirective;

})(this);