'use strict';
var Nightmare = require('nightmare');
var Promise = require('bluebird');

function getImageInfo(url) {
    // @TODO: make this scale :)
    url  = 'https://www.google.com/searchbyimage?image_url=' + url;
    var ResultCount = 0, UrlsInfo = [];
    return new Promise(function(resolve) {
        new Nightmare()
        .useragent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36')
        .goto(url)
        .wait()
        .evaluate(function () {
            return (document.querySelector('#resultStats')||{}).innerText;
        }, function (countStr) {
            if(!countStr) {
                return false;
            }
            var matched = countStr.match(/\b\s[0-9]+/g);
            if(matched) {
                ResultCount = parseInt(matched[0].trim(), 10);
            } else {
                ResultCount = 0;
            }
        }).evaluate(function () {
            return Array.prototype.slice.call(document.querySelectorAll('.srg h3 a[href]')).map(function(el) {
                return el.href;
            });
        }, function (links) {
            UrlsInfo = links;
        }).run(function(){
            resolve({count: ResultCount, urls: UrlsInfo});
        });
    });
}

function getImmoNetInfo(id) {
    // @TODO: crawling is not nice, use the API
    var url  = 'http://www.immonet.de/angebot/' + id;
    var headline = '', imageUrls = [], text = {};
    return new Promise(function(resolve) {
        new Nightmare()
        .useragent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36')
        .goto(url)
        .wait()
        .evaluate(function () {
            return document.querySelector('#exposeHeadline').innerText;
        }, function (_headline_) {
            headline = _headline_;
        })
        .evaluate(function () {
            return Array.prototype.slice.call(document.querySelectorAll('#mediaSlider input.image[value]')).map(function(el) {
                return JSON.parse(el.value).unscaledUrl;
            });
        }, function (links) {
            imageUrls = links;
        }).evaluate(
            function () { return document.querySelector('#objektbeschreibung'); },
            function (txt) { text.objektbeschreibung = (txt||{}).innerText;}
        ).evaluate(
            function () { return document.querySelector('#lagebeschreibung'); },
            function (txt) { text.lagebeschreibung = (txt||{}).innerText;}
        ).evaluate(
            function () { return document.querySelector('#sonstiges'); },
            function (txt) { text.sonstiges = (txt||{}).innerText;}
        ).run(function(){
            resolve({headline: headline, url: url, imageUrls: imageUrls, text: text});
        });
    });
}


function getImmobilienscoutInfo(id) {
    // @TODO: Immobilienscout doesn't like crawling, use the API
    var url  = 'http://www.immobilienscout24.de/expose/angebot/' + id;
    var headline = '', imageUrls = [], text = {};
    return new Promise(function(resolve) {
        new Nightmare()
        .useragent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36')
        .goto(url)
        .wait()
        .evaluate(function () {
            return document.querySelector('.criteriagroup h1').innerText;
        }, function (content) {
            headline = content;
        })
        .evaluate(function () {
            return Array.prototype.slice.call(document.querySelectorAll('#slideImageContainer img[data-src]')).map(function(el) {
                return el.getAttribute('data-src');
            });
        }, function (links) {
            imageUrls = links;
        }).evaluate(
            function () { return document.querySelector('.is24qa-objektbeschreibung'); },
            function (txt) { text.objektbeschreibung = (txt||{}).innerText;}
        ).evaluate(
            function () { return document.querySelector('.is24qa-lage'); },
            function (txt) { text.lagebeschreibung = (txt||{}).innerText;}
        ).evaluate(
            function () { return document.querySelector('.is24qa-sonstiges'); },
            function (txt) { text.sonstiges = (txt||{}).innerText;}
        ).run(function(){
            resolve({headline: headline, url: url, imageUrls: imageUrls, text: text});
        });
    });
}

module.exports = {
    getImageInfo: getImageInfo,
    getImmoNetInfo: getImmoNetInfo,
    getImmobilienscoutInfo: getImmobilienscoutInfo
};
