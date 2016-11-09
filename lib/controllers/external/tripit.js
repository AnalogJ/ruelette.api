module.exports = {
    trips: function (event, context, cb) {
        if (event.path.serviceType != 'tripit') {
            return cb('Service not supported', null);
        }
    }
}