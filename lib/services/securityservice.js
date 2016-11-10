// Part of https://github.com/chris-rock/node-crypto-examples
// From http://lollyrock.com/articles/nodejs-encryption/

// Nodejs encryption with CTR
var q = require('q'),
    jwt = require('jsonwebtoken'),
    jwt_passphrase = process.env.ENCRYPTION_JWT_PASSPHRASE;

module.exports = {

    //JWT methods

    sign_token: function(payload){
        //TODO: put a reasonable expiry date here, 24h? 48?
        var deferred = q.defer();
        jwt.sign(payload, jwt_passphrase,{}, function(token) {
            return deferred.resolve(token);
        });
        return deferred.promise
    },
    verify_token: function(token){
        var deferred = q.defer();
        jwt.verify(token, jwt_passphrase, function(err, decoded) {
            if (err) {
                err.code = 401
                return deferred.reject(err);
            }
            return deferred.resolve(decoded);
        });
        return deferred.promise
    }
};



