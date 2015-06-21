'use strict';

// require modules
var fs = require('fs');
var GetOpt = require('node-getopt');
var http = require('http');
var https = require('https');
var qs = require('querystring');
var xmljson = require('xmljson')

// constant
var helpMessage = 
    "Usage: mstcli [OPTION] <words to be translated>\n" +
    "\n" +
    "[[OPTIONS]]\n"
var defaultConfigurationFile = process.env.HOME + "/.mstclirc"
var accessTokenURL = { host: 'datamarket.accesscontrol.windows.net', path: '/v2/OAuth2-13' };
var translateURL = { host:'api.microsofttranslator.com', path: '/V2/Http.svc/Translate' };
var scope = 'http://api.microsofttranslator.com'
var grant_type = 'client_credentials'

// configuration variables
var to = ""
var from = ""
var client_id = ""
var client_secret = ""

// parse command line options
//// make parser
var parser = new GetOpt(
    [
        ['c', 'config=FILE', 'config file to read'],
        ['f', 'from=LANG', 'input language'],
        ['t', 'to=LANG', 'output language'],
        ['h', 'help', 'display this help'],
    ]).bindHelp();

parser.setHelp(helpMessage);

var options = parser.parse(process.argv.slice(2));

// read config file
var configurationFileName = defaultConfigurationFile
if (options.options["config"] != undefined) {
    configurationFileName = options.options["config"]
}

var text = fs.readFileSync(configurationFileName, "utf8").toString()

// read config file properly
var lines = text.split("\n")
var length = lines.length;
for (var i = 0; i < length; i++) {
    // delete space character and parse
    var kv = lines[i].replace(/\s+/g, "").split(":")
    if (kv.length == 2) {
        if (kv[0] == "from") {
            from = kv[1];
        } else if (kv[0] == "to") {
            to = kv[1];
        } else if (kv[0] == "client_id") {
            client_id = kv[1];
        } else if (kv[0] == "client_secret") {
            client_secret = kv[1];
        } else {
            console.log("invalid key name: " + kv[0])
        }
    }
}

// set languages
if (options.options["to"] != undefined) {
    to = options.options["to"]
}
if (options.options["from"] != undefined) {
    from = options.options["from"]
}

// get text to be translated
var text = ""
if (options.argv.length == 0) {
    // from stdin
    text = fs.readFileSync("/dev/stdin", "utf8")
} else {
    // fron command line arguments
    text = options.argv.join(" ")
}

// translate
//// translate process
function translate(token, text) {
    var options = '&appId=' + qs.escape("Bearer " + token) + '&text=' + qs.escape(text) + '&to=' + to + '&from=' + from;
    var body = '';
    var req = http.request({
        host: translateURL.host,
        path: translateURL.path + '?' + options,
        method: 'GET'
    }, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            body += chunk;
        }).on('end', function () {
            // show result
            xmljson.to_json(body, function(err, data) {
                if (err == null) {
                    console.log(data.string["_"])
                } else {
                    console.log(err)
                }
            })

        });
    }).on('error', function (err) {
        console.log("err: " + err)
    });
    req.end();
}

//// get access token
var body = '';
var req = https.request({
    host: accessTokenURL.host,
    path: accessTokenURL.path,
    method: 'POST'
}, function (res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        body += chunk;
    }).on('end', function () {
        var resData = JSON.parse(body);
        
        //// translate
        translate(resData.access_token, text);
    });
}).on('error', function (err) {
    console.log(err);
});
var data = {
    'client_id': client_id,
    'client_secret': client_secret,
    'scope': scope,
    'grant_type': grant_type
};
req.write(qs.stringify(data));
req.end();

