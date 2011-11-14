var request = require("request");
var jsdom = require("jsdom");

var github = module.exports = (function() {
    
    /**
     * Main entry point for the test
     */
    var run = function(err, callback) {
        login(err, function() {
            console.log("hello!");
        });
    };
    
    /**
     * Get an authentication URL from Cloud9
     */
    var login = function (err, cb) {
        // this already redirects us to GitHub. No need to do this ourselves.
        request("http://c9.io/auth/github", function (error, resp, body) {
            if (error)
                return err(error);
            
            jsdom.env(body, [
              'http://code.jquery.com/jquery-1.5.min.js'
            ],
            function(errors, window) {
                if (errors) return err(errors);
                
                var $ = window.$;
                
                var form = $("div.login_form form:first");
                form.find("[name=login]").val("c9integrationtest");
                form.find("[name=password]").val("jan1234");
                var data = form.serialize();
                
                request({ 
                    uri: "https://github.com" + form.attr("action"), 
                    method: form.attr("method").toUpperCase(),
                    body: data
                }, function (error, resp, body) {
                    if (errors) return err(error);
                    
                    //console.log(resp);
                    console.log(body);
                    cb();
                });
            });
        });  
    };
    
    return { 
        run: run 
    };
}());