var request = require("request");
var jsdom = require("jsdom");

module.exports = (function() {
    var run = function (err, callback) {
        login(err, callback);
    };
    
    /**
     * Get an authentication URL from Cloud9
     */
    var login = function (err, cb) {
        var jar = request.jar(),
            proxy = "http://127.0.0.1:8888";

        // this already redirects us to GitHub. No need to do this ourselves.
        request({ uri: "http://c9.io/auth/bitbucket", proxy: proxy }, function (error, resp, body) {
            if (error)
                return err(error);
                
            fillInUsernamePassword(err, proxy, resp.request.path, body, cb);
        });  
    };
    
    /**
     * Fill in the username & password on BitBucket
     */
    var fillInUsernamePassword = function(err, proxy, referer, body, cb) {
        // load the page in JsDom so we can use jQuery
        jsdom.env(body, ['http://code.jquery.com/jquery-1.5.min.js'], function(errors, window) {
            if (errors) return err(errors);

            var $ = window.$;

            // fill out the form and serialize
            var form = $("div.newform form:first");
            if (!form || !form.length) return err("No form detected");
            
            form.find("[name=username]").val("c9integrationtest");
            form.find("[name=password]").val("jan1234");
            
            var data = makeMeNiceFormatted(form.serializeArray());
            
            // post the data
            request({
                uri: "https://bitbucket.org" + form.attr("action"), 
                method: form.attr("method").toUpperCase(),
                body: data,
                proxy: proxy,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Referer": referer
                }
            }, function(error, resp, body) {
                if (error) return err(error);

                if (resp.headers.location) {
                    handleAuthResponse(err, proxy, resp.headers.location, cb);
                }
                else {
                    err("POST yielded no redirect");
                }
            });
        });
    };
    
    /**
     * Handle the response after logging in
     */
    var handleAuthResponse = function(err, proxy, location, cb) {
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
                var form = $("form.newform");
                
                if (!form || !form.length) return err("No form detected");
                
                var data = makeMeNiceFormatted(form.serializeArray()) + "&authorize_access=on";

                // post it
                request({
                    uri: resp.request.path.replace(/\?(.*)$/, ""),
                    method: form.attr("method").toUpperCase(),
                    body: data,
                    proxy: proxy,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Referer": resp.request.path
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
            
            if (resp.request.path === "http://c9.io/c9integrationtest") {
                cb();
            } else {
                err("Expected c9.io/c9integrationtest, but got " + resp.request.url);
            }
        });
    };
    
    var makeMeNiceFormatted = function (arr) {
        var trah = arr.map(function (a) { 
            return a.name + "=" + encodeURIComponent(a.value);
        }).join("&") + "&submit=Log+in";
        
        return trah;
    };    
    
    return {
        name: "Bitbucket",
        run: run
    };
}());