var jsforce = require('jsforce');
var conn = new jsforce.Connection();
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');

conn.login('imran@megaki.com.dev', 'numMeg208uUspCDudU5t5UMjNh51ar0B', function(err, res) {
    if (err) {
        return console.error(err);
    }
    conn.query('SELECT Id, Name, Website, isBoxCustomer__c FROM Account', function(err, res) {
        if (err) {
            return console.error(err);
        }
        var records = res.records;
        console.log(records.length);
        var urls = [];
        // console.dir(records);
        records.forEach(function(record) {
            var website = record.Website;
            if (website) {
                var domain = extractDomain(record.Website);
                var url = 'https://' + domain + '.app.box.com/login';
                urls.push(url);
            }
        });
        console.log('=============');
        console.log(urls);
        console.log('=============');
        async.eachLimit(urls, 10, makeRequest, function(err) {
            if (err) throw err;
        });
    });
});

function makeRequest(url, callback) {
    request(url, function(error, response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            if ($('.enterprise-logo-background').length) {
                console.log(url + ' ------ is a customer');
            } else {
                console.log(url + ' ------ not a customer');
            }
        } else {
            //console.log(error);
            console.log(url + ' ------ error making request to the url');
        }
        callback();
    });
}

function extractDomain(url) {
    var domain;
    url = url.replace('www.', '');
    url = url.replace('.com', '');
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    } else {
        domain = url.split('/')[0];
    }
    //find & remove port number
    domain = domain.split(':')[0];
    return domain;
}
