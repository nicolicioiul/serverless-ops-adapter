'use strict';

var https = require('https');
var URL = require('url').URL;

module.exports.cancelByTimeOut = (event, context, callback) => {
    const seconds = Math.max(0, parseInt(event.pathParameters.seconds) || 0);
    const threshold = Math.max(0, parseInt(event.pathParameters.threshold) || 0);
    console.log(`Request: seconds: ${seconds}, threshold: ${threshold}`)
    // Validate the seconds and the th
    if(seconds <= 0 || threshold <= 0){
        var response = {
            statusCode: 400,
            body: JSON.stringify(
                {
                    'messages': [
                        `Invalid request: seconds: ${seconds}, threshold: ${threshold}`,
                        `Seconds and threshold must be greater than 0`,
                    ]
                })
        };
        callback(null, response);
    }
    /**
     * Build the URL based on the index template.
     */
    var today = new Date().toISOString().substring(0, 10).replace(/-/g, '.');
    var yesterday = new Date(new Date().getTime() - (60 * 60 * 24 * 1000)).toISOString().substring(0, 10).replace(/-/g, '.');
    var indexPrefix = process.env.KIBANA_INDEX_PREFIX;
    var path = '?path=' + indexPrefix + yesterday + ','+indexPrefix+today+'/_search&method=POST';
    var postData = '{' +
        '  "query": {' +
        '      "bool": {' +
        '          "must": [{' +
        '            "term": {' +
        '                "routingKey":"' + process.env.KIBANA_ROUTING_KEY + '"' +
        '              }' +
        '          },' +
        '      {' +
        '          "range": {' +
        '            "@timestamp": {' +
        '              "gte": "now-' + seconds + 's",' +
        '              "lte": "now"' +
        '            }' +
        '          }' +
        '      }]' +
        '      }' +
        '  }' +
        '}';
    var url = new URL(process.env.KIBANA_HTTP_URL_ENDPOINT);
    var req = https.request({
            'protocol': "https:",
            'host': url.hostname,
            'path': url.pathname + path,
            'method': 'POST',
            'headers': {
                'Authorization': 'Basic '+ (process.env.KIBANA_HTTP_BASIC_AUTH),
                'Content-type': 'application/json',
                'kbn-version': '6.5.1',
                'Referer' :process.env.KIBANA_HTTP_URL_ENDPOINT
            }
        },
        (res) => {
            var body = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                var response = {
                        statusCode: 597,
                        body: JSON.stringify(
                        {
                            'messages': [
                                `Invalid Kibana REST API response: ${body}`,
                                'https://' + url.hostname + url.pathname + path
                            ]
                        })
                    }
                var o = JSON.parse(body);
                if (o.hasOwnProperty('hits') && o.hits.hasOwnProperty('total')){
                    response = {
                        statusCode: parseInt(o.hits.total) > threshold ? 599 : 200,
                        body: JSON.stringify(
                            {
                                'messages': [
                                    `Total: ${parseInt(o.hits.total)}, threshold:${threshold}`,
                                    'URL: https://' + url.hostname + url.pathname + path,
                                    `Date interval:  ${new Date(new Date().getTime() - (seconds * 1000)).toISOString()} - ${new Date(new Date().getTime()).toISOString()}`
                                ]
                            })
                    }
                }
                callback(null, response);
            });
        }
    );
    req.on('error', (error) => {
        var response = {
                statusCode: 598,
                body: JSON.stringify(
                    {
                        'messages': [
                        `Kibana REST API error:` + error,
                        'https://' + url.hostname + url.pathname + path
                    ]
                    })
            };
        callback(null, response);
    })
    req.write(postData);
    req.end();
};