'use strict';
require('dotenv').config();
var link_controller = require("./lib/controllers/link");
var test_controller = require("./lib/controllers/test");

var external_tripit_controller = require('./lib/controllers/external/tripit')
var external_airbnb_controller = require('./lib/controllers/external/airbnb')

module.exports = {

    link_connect: link_controller.connect,
    link_callback: link_controller.callback,

    test: test_controller.test,

    externalTripitFindOneTrip: external_tripit_controller.findOneTrip,
    externalTripitFindAllTrips: external_tripit_controller.findAllTrips,

    externalAirbnbSearch: external_airbnb_controller.search,
}