var OAuthService = require('../services/oauthservice');
var q = require('q');

//Dynamodb client setup
var AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient();
var callback_url = "https://api.ruelette.com/dev/callback/";
callback_url = "http://localhost:3000/dev/callback/";

module.exports = {
    connect: function (event, context, cb) {
        if(event.path.serviceType != 'tripit'){
            return cb('Service not supported', null);
        }

        OAuthService.tripitConnect()
            .then(function(oauth_data){
                var table = process.env.STAGE + '-' + process.env.PROJECT + '-credentials';
                var entry = {
                    "ServiceType": event.path.serviceType,
                    "Username": oauth_data.oauth_token,
                    "AuthData": oauth_data
                };
                var params = {
                    TableName:table,
                    Item: entry
                };

                var db_deferred = q.defer();
                docClient.put(params, function(err, data) {
                    if (err)  return db_deferred.reject(err);
                    return db_deferred.resolve({
                        url: 'https://www.tripit.com/oauth/authorize?oauth_token=' +params.Item.AuthData.oauth_token + '&oauth_callback=' + callback_url + 'tripit'
                    });
                });
                return db_deferred.promise
            })
            .then(function(data){
                return cb(null, data)
            })
            .fail(function(err){
                return cb(err, null)
            })


        // tripit_client.getOAuthRequestToken({}, function(error, oauth_token, oauth_token_secret, results) {
        //     if (error) {
        //         console.log('error: ' + JSON.stringify(error));
        //     } else {
        //         console.log('oauth_token: ' + oauth_token);
        //         console.log('oauth_token_secret: ' + oauth_token_secret);
        //         console.log('requestoken results: ' + sys.inspect(results));
        //         console.log("Requesting access token");
        //         console.log('Please go to https://www.google.com/accounts/OAuthAuthorizeToken?oauth_token=' + oauth_token);
        //         ask("Please enter the verification code:\n", /[\w\d]+/, function(data) {
        //             oa.getOAuthAccessToken(oauth_token, oauth_token_secret, data, accessTokenCallback);
        //         });
        //     }
        // });

    },
    callback: function(event, context, cb){
        if(event.path.serviceType != 'tripit'){
            return cb('Service not supported', null);
        }

        var table = process.env.STAGE + '-' + process.env.PROJECT + '-credentials';
        var params = {
            TableName : table,
            KeyConditionExpression: "ServiceType = :serviceType and Username = :username",
            ExpressionAttributeValues: {
                ":serviceType":event.path.serviceType,
                ":username":event.query.oauth_token
            }
        };
        var db_deferred = q.defer();
        docClient.query(params, function(err, data) {
            if (err)  return db_deferred.reject(err);

            return db_deferred.resolve(data.Items[0]);
        });
        return db_deferred.promise
            .then(function(credential_data){
                return OAuthService.tripitCallback(event.query.oauth_token, credential_data.AuthData)
                .then(function(oauth_data){
                    var table = process.env.STAGE + '-' + process.env.PROJECT + '-credentials';
                    var entry = {
                        "ServiceType": event.path.serviceType,
                        "Username": oauth_data.oauth_token,
                        "AuthData": oauth_data
                    };
                    var params = {
                        TableName:table,
                        Item: entry
                    };

                    var db_deferred = q.defer();
                    docClient.put(params, function(err, data) {
                        if (err)  return db_deferred.reject(err);
                        return db_deferred.resolve(params);
                    });
                    return db_deferred.promise
                })
            })
            // .then(security.sign_token)
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