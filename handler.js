'use strict';
require('dotenv').config();
var link_controller = require("./lib/controllers/link");
var test_controller = require("./lib/controllers/test");
module.exports = {

    link_connect: link_controller.connect,
    link_callback: link_controller.callback,

    test: test_controller.test

}