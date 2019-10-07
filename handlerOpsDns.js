'use strict';

var dns = require('dns');

module.exports.AResolver = (event, context, callback) => {
    const server = event.pathParameters.server;
    var response = {
        statusCode: 400,
        body: JSON.stringify({
            messages: [
                `data: '-'`,
                `type: A`,
                `error: Invalid request data`
            ]
        }),
    };
    if(server === undefined || server.length === 0){
        callback(null, response);
    }
    dns.lookup(server, function onLookup(err, addresses, family) {
        var response = {
            statusCode: err ? 599: 200,
            body:  JSON.stringify(err ? {
                messages: [
                    `data: -`,
                     `type: A`,
                     `error: ${err}`
                ]
            }:  {
                    messages: [
                        `data: ${addresses}`,
                        `type: A`,
                    ]
                }
            )
        };
        callback(null, response);
    });
};