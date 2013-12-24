

(function (globals) {
    "use strict";

    function animatedQubitsDirective() {
    
        return {
           scope: {
                animatedQubits: '='
            },
            
            link: function postLink(scope, element) {
                scope.animatedQubits.display(element[0]);
            }
        };
        
    }
    
    globals.animatedQubitsDirective = animatedQubitsDirective;

})(this);