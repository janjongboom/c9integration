var request = require("request");
var jsdom = require("jsdom");

var github = module.exports = (function() {
    
    /**
     * Main entry point for the test
     */
    var run = function(err, callback, finished) {
        var _err = err, _callback = callback;
        err = function () {
            _err.apply(null, arguments);
            finished();
        };
        callback = function () {
            _callback.apply(null, arguments);
            finished();
        };        
        
        login(err, callback);
    };
    
    /**
     * Get an authentication URL from Cloud9
     */
    var login = function (err, cb) {
        var jar = request.jar(),
            proxy = "http://127.0.0.1:8888";

        // this already redirects us to GitHub. No need to do this ourselves.
        request({ uri: "http://c9.io/auth/github", proxy: proxy }, function (error, resp, body) {
            if (error)
                return err(error);
                
            fillInUsernamePassword(err, proxy, body, cb);
        });  
    };
    
    /**
     * Fill in the username & password on Github
     */
    var fillInUsernamePassword = function(err, proxy, body, cb) {
        // load the page in JsDom so we can use jQuery
        jsdom.env(body, ['http://code.jquery.com/jquery-1.5.min.js'], function(errors, window) {
            if (errors) return err(errors);

            var $ = window.$;

            // fill out the form and serialize
            var form = $("div.login_form form:first");
            if (!form || !form.length) return err("No form detected");
            
            form.find("[name=login]").val("c9integrationtest");
            form.find("[name=password]").val("jan1234");
            
            var data = makeMeNiceFormatted(form.serializeArray());
            
            // post the data
            request({
                uri: "https://github.com" + form.attr("action"), 
                method: form.attr("method").toUpperCase(),
                body: data,
                proxy: proxy,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }, function(error, resp, body) {
                if (error) return err(error);

                if (resp.headers.location) {
                    handleGithubAuthResponse(err, proxy, resp.headers.location, cb);
                }
                else {
                    err("POST yielded no redirect");
                }
            });
        });
    };
    
    /**
     * Handle the response from Github
     */
    var handleGithubAuthResponse = function(err, proxy, location, cb) {
        // the github auth response has a location
        request({
            uri: location,
            proxy: proxy
        }, function(error, resp, body) {
            if (error) return err(error);

            // if we are on a c9.io domain name then we are finished
            if (resp.request.path.match(/^http:\/\/c9\.io/)) {
                // check whether we can reach the dashboard
                doDashboardRequest(err, proxy, cb);
                return;
            }

            // otherwise we are at the 'Authenticate' page
            jsdom.env(body, ['http://code.jquery.com/jquery-1.5.min.js'], function(errors, window) {
                if (errors) return err(errors);

                var $ = window.$;

                // check the form and create an urlencoded request
                var form = $("div.oauth_form form:first");
                if (!form || !form.length) return err("No form detected");
                
                var data = makeMeNiceFormatted(form.serializeArray()) + "&authorize=1";

                // post it
                request({
                    uri: "https://github.com" + form.attr("action"),
                    method: form.attr("method").toUpperCase(),
                    body: data,
                    proxy: proxy,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }, function(error, resp, body) {
                    if (error) return err(error);

                    // now we get another set of redirects which will lead us to c9
                    if (resp.headers.location) {
                        request({
                            uri: resp.headers.location,
                            proxy: proxy
                        }, function(error, resp, body) {
                            if (error) return err(error);

                            doDashboardRequest(err, proxy, cb);
                        });
                    }
                });
            });
        });
    };
    
    /**
     * Final step: Makes a request to the cloud9 dashboard
     */
    var doDashboardRequest = function(err, proxy, cb) {
        request({
            uri: "http://c9.io/dashboard.html",
            proxy: proxy
        }, function(error, resp, body) {
            if (error) return err(error);
            
            if (resp.request.url === "http://c9.io/c9integrationtest") {
                cb();
            } else {
                err("Expected c9.io/c9integrationtest, but got " + resp.request.url);
            }
        });
    };
        
    var makeMeNiceFormatted = function (arr) {
        var trah = arr.map(function (a) { 
            return a.name + "=" + a.value;//encodeURIComponent(a.value);
        }).join("&") + "&commit=Log+in";
        
        return trah;
    };
    
    return { 
        run: run,
        name: "Github"
    };
}());