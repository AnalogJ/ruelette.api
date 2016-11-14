'use strict';
require('dotenv').config();
var link_controller = require("./lib/controllers/link");
var test_controller = require("./lib/controllers/test");

var external_tripit_controller = require('./lib/controllers/external/tripit')

module.exports = {

    link_connect: link_controller.connect,
    link_callback: link_controller.callback,

    test: test_controller.test,

    externalTripit: external_tripit_controller,
}