'use strict';

var https = require('https');
var URL = require('url').URL;

module.exports.cancelByTimeOut = (event, context, callback) => {
    const seconds = Math.max(0, parseInt(event.pathParameters.seconds) || 0);
    const threshold = Math.max(0, parseInt(event.pathParameters.threshold) || 0);
    console.log(`Request cancelByTimeOut: seconds: ${seconds}, threshold: ${threshold}`)
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
        ' "from" : 0, "size" : 10000 ,'+
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

/**
 * Get vehicles that record cancel by time out on kibana.
 * @param event
 * @param context
 * @param callback
 */
module.exports.vehiclesCanceledByTimeOut = (event, context, callback) => {
    const seconds = Math.max(0, parseInt(event.pathParameters.seconds) || 0);
    // Validate the seconds and the th
    if(seconds <= 0){
        var response = {
            statusCode: 400,
            body: JSON.stringify(
                {
                    'messages': [
                        `Invalid request: seconds: ${seconds}`,
                        `Seconds must be greater than 0`,
                    ]
                })
        };
        callback(null, response);
    }
    /**
     * Build the URL based on the index template.
     */
    var today = new Date().toISOString().substring(0, 10).replace(/-/g, '.');
    var oneDayAgo = new Date(new Date().getTime() - (60 * 60 * 24 * 1000)).toISOString().substring(0, 10).replace(/-/g, '.');
    var twoDaysAgo = new Date(new Date().getTime() - (2 * 60 * 24 * 1000)).toISOString().substring(0, 10).replace(/-/g, '.');
    var threeDaysAgo = new Date(new Date().getTime() - (3 * 60 * 60 * 24 * 1000)).toISOString().substring(0, 10).replace(/-/g, '.');
    var fourDaysAgo = new Date(new Date().getTime() - (4 * 60 * 60 * 24 * 1000)).toISOString().substring(0, 10).replace(/-/g, '.');
    var fiveDaysAgo = new Date(new Date().getTime() - (5 * 60 * 60 * 24 * 1000)).toISOString().substring(0, 10).replace(/-/g, '.');
    var sixtDaysAgo = new Date(new Date().getTime() - (6 * 60 * 60 * 24 * 1000)).toISOString().substring(0, 10).replace(/-/g, '.');
    var sevenDaysAgo = new Date(new Date().getTime() - (7 * 60 * 60 * 24 * 1000)).toISOString().substring(0, 10).replace(/-/g, '.');
    var indexPrefix = process.env.KIBANA_INDEX_PREFIX;
    var path = '?path='
        + indexPrefix + oneDayAgo + ","
        + indexPrefix + twoDaysAgo + ","
        + indexPrefix + threeDaysAgo + ","
        + indexPrefix + fourDaysAgo + ","
        + indexPrefix + fiveDaysAgo + ","
        + indexPrefix + sixtDaysAgo + ","
        + indexPrefix + sevenDaysAgo + ","
        + indexPrefix + today +
        '/_search&method=POST';


    var postData = '{' +
        ' "from" : 0, "size" : 10000 ,' +
        '  "query": {' +
        '      "bool": {' +
        '          "must": [{' +
        '            "term": {' +
        '                "message":"' + process.env.KIBANA_ROUTING_KEY + '"' +
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
                    var vehicles = [];
                    var vehiclesInfo = {};
                    // Parse the hits
                    if (o.hits.hasOwnProperty('hits')) {
                        for (var key in o.hits.hits) {
                            var entry = o.hits.hits[key];
                            if (typeof entry == "object" && (entry.hasOwnProperty('_source') && entry._source.hasOwnProperty('message'))) {
                                var message = JSON.parse(entry._source.message);
                                var vin = message.payload.carId;
                                var timestamp = entry._source['@timestamp'];
                                if (typeof vehiclesInfo[vin] === 'undefined'){
                                    vehiclesInfo[vin] = {};
                                    vehiclesInfo[vin].count  = 0;
                                    vehiclesInfo[vin].dates  = [];
                                }
                                vehiclesInfo[vin].vin = vin;
                                vehiclesInfo[vin].count++;
                                vehiclesInfo[vin].dates.push(timestamp);
                                var vehicleInfo = `vin: ${vin}, UTC_timestamp: ${timestamp}`;
                                vehicles.push(vin);
                                //vehiclesInfo.push(vehicleInfo);
                            }
                        }
                    }else{
                        console.log("No hits:"+ JSON.stringify(o.hits));
                    }
                    response = {
                        statusCode: 200,
                        body: JSON.stringify(
                            {
                                //'vehicles' : Array.from(new Set(vehicles)),
                                'vehicles' : vehiclesInfo,
                                'messages': [
                                    `Total: ${parseInt(o.hits.total)}`,
                                    //`Vehicles info: ${vehiclesInfo.join(' ,')}`  ,
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