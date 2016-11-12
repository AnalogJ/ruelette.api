var AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient();
var q = require('q');

module.exports = {

    PREAUTH_TABLE: process.env.STAGE + '-' + process.env.PROJECT + '-preauth',
    USERS_TABLE: process.env.STAGE + '-' + process.env.PROJECT + '-users',

    create: function(tableName, item){
        var params = {
            TableName: tableName,
            Item: item
        };

        var db_deferred = q.defer();
        docClient.put(params, function(err, data) {
            if (err)  return db_deferred.reject(err);
            return db_deferred.resolve(data);
        });
        return db_deferred.promise
    },

    upsert: function(tableName, key_condition, attributes){
        var params = {
            TableName: tableName,
            Key: key_condition,
            // UpdateExpression: 'set #a = :x + :y',
            // ConditionExpression: '#a < :MAX',
            // ExpressionAttributeNames: {'#a' : 'Sum'},
            // ExpressionAttributeValues: {
            //     ':x' : 20,
            //     ':y' : 45,
            //     ':MAX' : 100,
            // }
            ReturnValues: 'ALL_NEW'
        };

        //write update expression and expression attribute values object

        var updateExpression = [];
        var expressionAttributeValues = {};
        for(var attr in attributes) {
            var attr_symbol = ':' + attr.toLowerCase()
            updateExpression.push(attr + '=' + attr_symbol)
            expressionAttributeValues[attr_symbol] = attributes[attr]
        }

        params['UpdateExpression'] = 'SET ' + updateExpression.join(', ');
        params['ExpressionAttributeValues'] = expressionAttributeValues;

        var db_deferred = q.defer();
        docClient.update(params, function(err, data) {
            console.log("UPSERT COMPLETED")
            console.dir(arguments);
            if (err)  return db_deferred.reject(err);
            return db_deferred.resolve(data);
        });
        return db_deferred.promise
    },
    query: function(tableName, condition){
        condition['TableName'] = tableName;

        var db_deferred = q.defer();
        docClient.query(condition, function(err, data) {
            if (err)  return db_deferred.reject(err);
            return db_deferred.resolve(data);
        });
        return db_deferred.promise

    },
    findUser: function(auth){
    var params = {
        TableName : this.USERS_TABLE,
        KeyConditionExpression: "ServiceType = :serviceType and Username = :username",
        ExpressionAttributeValues: {
            ":serviceType":auth.ServiceType,
            ":username": auth.Username
        }
    };
    var db_deferred = q.defer();
    docClient.query(params, function(err, data) {
        if (err)  return db_deferred.reject(err);

        return db_deferred.resolve(data.Items[0]);
    });
    return db_deferred.promise
}

};