'use strict';

var dns = require('dns');

module.exports.AResolver = (event, context, callback) => {
    const server = event.pathParameters.server;
    dns.lookup(server, function onLookup(err, addresses, family) {
        const response = {
            statusCode: err ? 599: 200,
            body: JSON.stringify({
                messages: [`"data": "${addresses}", "type":"A"`]
            }),
        };
        callback(null, response);
    });
};