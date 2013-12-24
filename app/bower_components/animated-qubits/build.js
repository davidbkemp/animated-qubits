({
    paths: {
      "animatedQubitsRenderer": "lib/animatedQubitsRenderer",
      "qubitsGraphics": "lib/qubitsGraphics",
      "qubitAnimationCalculator": "lib/qubitAnimationCalculator",
      "d3": "empty:",
      "d3MeasureText": "empty:",
       "q": "empty:",
       "lodash": "empty:",
       "jsqubits": "empty:"
    },
    exclude: ['d3', 'd3MeasureText', 'q', "lodash", "jsqubits"],
    name: "animatedQubits",
    out: "animatedQubits.min.js",
    removeCombined: true
})
