'use strict;'

const Promise = require('bluebird')
const https = require('https')
const http = require('http')
const qs = require('querystring')
const xmljson = require('xmljson')

const accessTokenUrl = { host: 'datamarket.accesscontrol.windows.net', path: '/v2/OAuth2-13' };
const translateUrl = { host:'api.microsofttranslator.com', path: '/V2/Http.svc/Translate' };
const scope = 'http://api.microsofttranslator.com'
const grant_type = 'client_credentials'

exports.translate = function (clientId, clientSecret, text,toLanguage, fromLanguage) {
  return new Promise((resolve, reject) => {
    // Request access token
    const req = https.request({
      host: accessTokenUrl.host,
      path: accessTokenUrl.path,
      method: 'POST'
    }, (res) => resolve(res)).on('error', (err) => { reject(err) })
    const data = {
      'client_id': clientId,
      'client_secret': clientSecret,
      'scope': scope,
      'grant_type': grant_type
    };
    req.write(qs.stringify(data));
    req.end();
  }).then((res) => {
    // Parse the response
    return new Promise((resolve) => {
      var body = '';
      res.setEncoding('utf8')
      res.on('data', (chunk) => {
        body += chunk;
      })
      res.on('end', () => {
        resolve(JSON.parse(body).access_token);
      })
    })
  }).then((accessToken) => {
    // Request the translation
    const options = `&appId=${qs.escape("Bearer " + accessToken)}&text=${qs.escape(text)}&to=${toLanguage}&from=${fromLanguage}`;
    return new Promise((resolve, reject) => {
      const req = http.request({
        host: translateUrl.host,
        path: translateUrl.path + '?' + options,
        method: 'GET'
      }, function (res) {
        resolve(res)
      }).on('error', (err) => { reject(err) })
      req.end();
    })
  }).then((res) => {
    // Parse the response
    return new Promise((resolve, reject) => {
      var body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; })
      res.on('end', () => {
        xmljson.to_json(body, (err, data) => {
          if (err == null) {
            resolve(data.string["_"])
          } else {
            reject(err)
          }
        });
      })
    })
  })
};
