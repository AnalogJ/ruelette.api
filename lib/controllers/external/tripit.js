var request = require('request')
var DBService = require('../../services/dbservice.js');
var SecurityService = require('../../services/securityservice');
var q = require('q')
module.exports = {



    /* AUTHENTICATED METHODS */
    findAllTrips: function (event, context, cb) {
        return SecurityService.verify_token(event.query.auth)
            .then(function(decoded){
                return DBService.findUser(decoded)
            })
            .then(function(user_data){
                console.log("OAUTH DATA FROM FIND USER:")
                console.dir(user_data)
                var tripit_oauth_data = user_data.TripitCredentials
                var url = 'https://api.tripit.com/v1/list/trip/format/json/past/true'
                var oauth = {
                    consumer_key: process.env.OAUTH_TRIPIT_CLIENT_KEY,
                    consumer_secret: process.env.OAUTH_TRIPIT_CLIENT_SECRET,
                    token: tripit_oauth_data.access_token,
                    token_secret: tripit_oauth_data.access_token_secret
                }

                var deferred = q.defer();
                request.get({url:url, oauth:oauth, json:true}, function (e, r, data) {
                    if(e){
                        console.log("TRIPIT LIST");
                        console.dir(data)
                        deferred.reject(e)
                    }
                    else{
                        deferred.resolve(data)
                    }
                })
                return deferred.promise

            })
            .then(function(data){
                return cb(null, data)
            })
            .fail(function(err){
                return cb(err, null)
            })
    },
    findOneTrip: function (event, context, cb) {
    return SecurityService.verify_token(event.query.auth)
        .then(function(decoded){
            return DBService.findUser(decoded)
        })
        .then(function(user_data){
            console.log("OAUTH DATA FROM FIND USER:")
            console.dir(user_data)
            var tripit_oauth_data = user_data.TripitCredentials
            var url = 'https://api.tripit.com/v1/get/trip/id/' + event.path.tripId + '/format/json/include_objects/true'
            var oauth = {
                consumer_key: process.env.OAUTH_TRIPIT_CLIENT_KEY,
                consumer_secret: process.env.OAUTH_TRIPIT_CLIENT_SECRET,
                token: tripit_oauth_data.access_token,
                token_secret: tripit_oauth_data.access_token_secret
            }

            var deferred = q.defer();
            request.get({url:url, oauth:oauth, json:true}, function (e, r, data) {
                if(e){
                    console.log("TRIPIT LIST");
                    console.dir(data)
                    deferred.reject(e)
                }
                else{
                    deferred.resolve(data)
                }
            })
            return deferred.promise

        })
        .then(function(data){
            return cb(null, data)
        })
        .fail(function(err){
            return cb(err, null)
        })


}
}