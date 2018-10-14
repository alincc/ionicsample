#!/usr/bin/env node

// Save hook under `project-root/hooks/before_prepare/`
//
// Don't forget to install xml2js using npm
// `$ npm install xml2js`

var increaseMajor = false, increaseMinor = false, isBeta = false, isAlpha = false, isRc = false, isStable = false;
process.argv.forEach(function (argument) {
  'use strict';
  switch (argument.toLowerCase()) {
    case '--major':
      increaseMajor = true;
      break;
    case '--minor':
      increaseMinor = true;
      break;
    case '--alpha':
      isAlpha = true;
      break;
    case '--beta':
      isBeta = true;
      break;
    case '--rc':
      isRc = true;
      break;
    case '--stable':
      isStable = true;
      break;
  }
});

var fs = require('fs');
var xml2js = require('xml2js');

// Read config.xml
fs.readFile('config.xml', 'utf8', function (err, data) {
  'use strict';
  if (err) {
    return console.log(err);
  }

  // Get XML
  var xml = data;

  // Parse XML to JS Obj
  xml2js.parseString(xml, function (err, result) {
    if (err) {
      return console.log(err);
    }

    // Get JS Obj
    var obj = result;

    // version doen't exist in config.xml
    if (typeof obj.widget.$.version === 'undefined') {
      obj.widget.$.version = '0.0.0';
    }

    console.log(obj.widget.$.version);

  });
});
