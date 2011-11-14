var github = require("./github");

var tests = [ github ];
for (var ix = 0; ix < tests.length; ix++) {
    tests[ix].run(errorHandler, updateCallback);
}

// simple tester
var callbackCounter = 0;
function updateCallback () {
    if(++callbackCounter === tests.length) {
        console.log('finished');
    }
}

function errorHandler(ex) {
    console.log("errur", ex);
}