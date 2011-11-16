var tests = [ require("./github") ];
for (var ix = 0; ix < tests.length; ix++) {
    var name = tests[ix].name;
    
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
    console.log("error", ex);
    console.trace();
}