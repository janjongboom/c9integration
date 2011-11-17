var request = require("request");

module.exports = (function() {
    var run = function (err, callback, finished) {
        request("http://localhost:3333/status", function (errors, resp, body) {
            if (errors) return err(errors);
            
            var applications = JSON.parse(body);
            
            for (var ix = 0; ix < applications.length; ix++) {
                var app = applications[ix];
                
                if (app.online) {
                    callback(app.name);
                }
                else {
                    err("Not online", app.name);
                }
            }
            
            finished();
        });
    };
    
    return {
        name: "Forever",
        run: run
    };
}());