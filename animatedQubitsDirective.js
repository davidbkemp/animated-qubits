

(function (globals) {
    "use strict";

    function animatedQubitsDirective() {
    
        return {
           scope: {
                animatedQubitsContainer: '=animatedQubits'
            },
            
            link: function postLink(scope, element) {
                function updateDisplay() {
                    scope.animatedQubitsContainer.animatedQubits.display(element[0]);
                    var naturalDimensions = scope.animatedQubitsContainer.animatedQubits.getNaturalDimensions();
                    element.attr("height", naturalDimensions.height);
                    //element.attr("width", naturalDimensions.width);
                }
                
                updateDisplay();

                scope.animatedQubitsContainer.reset = function reset() {
                    element.empty();
                    updateDisplay();
                };
            }
        };
        
    }
    
    globals.animatedQubitsDirective = animatedQubitsDirective;

})(this);