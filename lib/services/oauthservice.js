'use strict';
var OAuth = require('oauth').OAuth;
var q = require('q');


function tripitClient(){
    return q((new OAuth("https://api.tripit.com/oauth/request_token",
        "https://api.tripit.com/oauth/access_token",
        process.env.OAUTH_TRIPIT_CLIENT_KEY,
        process.env.OAUTH_TRIPIT_CLIENT_SECRET,
        "1.0", null, "HMAC-SHA1")));
}

module.exports = {
    tripitConnect: function(){
        return tripitClient()
            .then(function(tripit_client) {
                var deferred = q.defer();
                tripit_client.getOAuthRequestToken({}, function (error, oauth_token, oauth_token_secret, results) {
                    if(error){
                        deferred.reject(error)
                    }
                    else{
                        deferred.resolve({
                            oauth_token: oauth_token,
                            oauth_token_secret: oauth_token_secret,
                            results: results
                        })
                    }
                })
                return deferred.promise
            })
    },
    tripitCallback: function(validator, oauth_data){
        return tripitClient()
            .then(function(tripit_client){
                var deferred = q.defer();
                tripit_client.getOAuthAccessToken(oauth_data.oauth_token, oauth_data.oauth_token_secret, validator,
                function(error, access_token, access_token_secret, results){
                    if(error){
                        deferred.reject(error)
                    }
                    else{

                        oauth_data.access_token = access_token;
                        oauth_data.access_token_secret = access_token_secret;
                        oauth_data.access_results = results;
                        deferred.resolve(oauth_data)
                    }
                });
                return deferred.promise
            })
    }
};