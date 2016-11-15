var request = require('request')
var DBService = require('../../services/dbservice.js');
var SecurityService = require('../../services/securityservice');
var q = require('q')
var airbnb = require('airapi')
module.exports = {

    /* AUTHENTICATED METHODS */
    search: function (event, context, cb) {
        return airbnb.search(event.query)
            .then(function(data){
                return cb(null, data)
            })
            .fail(function(err){
                return cb(err, null)
            })


    }
}