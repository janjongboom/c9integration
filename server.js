var tests = [ require("./github") ];
for (var ix = 0; ix < tests.length; ix++) {
    var name = tests[ix].name;
    
    var succeeded = false;
    try {
        tests[ix].run(errorHandler, function () {
            succeeded = true;
            updateCallback();
        });
    }
    catch (ex) {
        errorHandler(ex);
    }
    
    if (succeeded) {
        console.log("OK " + name);
    } else {
        console.log("FAILED " + name);
    }
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