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
            proxy = null;
            
        request({
            uri: "http://c9.io/auth/login",
            method: "post",
            form: { username: "jan9", password: "jan123" }
        }, function (error, res, body) {
            if (res.statusCode < 200 || res.statusCode >= 400)
                return err("statuscode" + res.statusCode);
                
            request({
                uri: "http://c9.io/probe/runvm",
                method: "get"
            }, function (error, res, body) {
                var c = res.statusCode;
                if (c < 200 || c >= 300) return err("probe runvm didnt respond in 2xx range" + c);
                
                cb(null);
            });
        });
        return;
    };
    
    return { 
        run: run,
        name: "Runvm"
    };
}());