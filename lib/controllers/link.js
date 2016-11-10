var OAuthService = require('../services/oauthservice');
var DBService = require('../services/dbservice');
var SecurityService = require('../services/securityservice');
var q = require('q');


var callback_url = "https://www.ruelette.com/auth/callback/";



module.exports = {
    connect: function (event, context, cb) {
        if(event.path.serviceType != 'tripit'){
            return cb('Service not supported', null);
        }

        return OAuthService.tripitConnect()
            .then(function(oauth_data){
                var entry = {
                    "ServiceType": event.path.serviceType,
                    "RequestId": oauth_data.oauth_token,
                    "AuthData": oauth_data
                };

                return DBService.create(DBService.PREAUTH_TABLE, entry)
                    .then(function(){
                        return {
                            url: 'https://www.tripit.com/oauth/authorize?oauth_token=' + entry.AuthData.oauth_token + '&oauth_callback=' + callback_url + 'tripit'
                        }
                    })
            })
            .then(function(data){
                return cb(null, data)
            })
            .fail(function(err){
                return cb(err, null)
            })

    },
    callback: function(event, context, cb){

        if(event.path.serviceType != 'tripit'){
            return cb('Service not supported', null);
        }

        //OAuth 1 flow:
        //get the request oauth_token and secret from the preauth table.
        //validate/authenticate this token and get an access token & access token secret
        //use the access token and access token secret to retrive the user's profile identifier
        //lookup the user by their profile identifier.
        //if the user already exists, then retrieve all the credentials for that user and encode & send back via json web token for storage in cookie
        //if the user doesnt exist, then create a new user for them, and a new credential too.

        var condition = {
            KeyConditionExpression: "ServiceType = :serviceType and RequestId = :requestid",
            ExpressionAttributeValues: {
                ":serviceType":event.path.serviceType,
                ":requestid":event.query.oauth_token || event.body.oauth_token
            }
        };

        return DBService.query(DBService.PREAUTH_TABLE, condition)
            .then(function(data){
                return data.Items[0]
            })
            .then(function(credential_data){
                return OAuthService.tripitCallback(event.query.oauth_token, credential_data.AuthData)
                .then(function(oauth_data){
                    // now we have the user's Access Token.
                    // lets get some basic profile info with it (so we can determine if they are a new user or not)

                    return OAuthService.tripitProfile(oauth_data)
                        .then(function(profile){

                            var key_condition = {
                                ServiceType: 'tripit',
                                Username: profile['@attributes'].ref
                            }

                            //the following data is stored in the User table:
                            //ServiceType (only TripIt currently, may eventually also be Ruelette or some other travel management service with OAuth)
                            //Username (when created by third party eg TripIt, this is the same as ServiceId)
                            //ServiceId
                            //Name
                            //Email
                            //Company
                            //Blog
                            //Location
                            //AccessToken

                            var attributes = {
                                ServiceId: profile['@attributes'].ref,
                                Name: profile.public_display_name,
                                Email: (profile.ProfileEmailAddresses[0] || profile.ProfileEmailAddresses).ProfileEmailAddress.address,  // I think this can be an array occassionally
                                Company: profile.company,
                                Location: profile.home_city,
                                PhotoUrl: profile.photo_url,

                                TripitCredentials: oauth_data
                            }




                            return DBService.upsert(DBService.USERS_TABLE, key_condition, attributes)
                                // .then(function(){
                                //     //TODO: now that we've successfully stored the OAuth creds, we should clean up the preauth request table.
                                // })
                                .then(function(){
                                    //we're going to encode the ServiceType & Username into a JWT token so we can quickly look this data up in the future.
                                    return key_condition
                                })
                        })
                })
            })
            .then(SecurityService.sign_token)
            // .then(function(jwt){
            //     return cb(null, {
            //         token: jwt,
            //         service_type: event.serviceType
            //     })
            // })
            .then(function(data){
                return cb(null, data)
            })
            .fail(function(err){
                return cb(err, null)
            })
    }
}