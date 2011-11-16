var tests = [ require("./github"), require("./bitbucket") ];
for (var ix = 0; ix < tests.length; ix++) {
    var testname = tests[ix].name.toString();
    
    tests[ix].run(function (ex) { 
            errorHandler(ex, testname); 
        },
        function () { 
            updateCallback(testname);
        });
}

// simple tester
var callbackCounter = 0;
function updateCallback (test) {
    console.log("OK " + test);
    
    handleFinishedTest(test, true);
}

function errorHandler(ex, test) {
    console.log("FAILED " + test, ex);
    console.trace();
    
    handleFinishedTest(test, false);
}

function handleFinishedTest (test, succeeded) {
    if(++callbackCounter === tests.length) {
        console.log('finished');
    }    
}