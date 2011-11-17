var fs = require("fs");

var tests = [ require("./forever"), require("./github"), require("./bitbucket") ];

for (var ix = 0; ix < tests.length; ix++) {
    (function () {
        var testname = tests[ix].name.toString();
        
        tests[ix].run(function (ex, name) { 
                errorHandler(ex, name || testname); 
            },
            function (name) { 
                updateCallback(name || testname);
            }, function () {
                onFinished(testname);
            });
    } ());
}

// simple tester
var results = {};
function updateCallback (test) {
    results[test] = true;
    console.log("OK " + test);
}

function errorHandler(ex, test) {
    results[test] = false;
    console.log("FAILED " + test, ex);
    console.trace();
}

var itemsFinished = 0;
function onFinished(testname) {
    if (++itemsFinished === tests.length) {
        console.log("all finished. Number of results:", Object.keys(results).length);
        
        fs.writeFile("./public/datasource.json", JSON.stringify(Object.keys(results).map(function (r) {
            return { name: r, success: results[r] };
        })), function (err) {
            console.log("file has been written");
        });
    }
}