// jQuery
import 'jquery';
// PopperJS
import 'popper.js';
// Bootstrap 4
import 'bootstrap';
// Material Design Bootstrap
import '../vendors/mdb/js/mdb';

const { schema } = require('./schema');

const { async } = window;

let serverBase = '';

if (window.location.host !== 'eu-pollofpolls-wdc.theinformationlab.io') {
  serverBase = 'http://localhost:3001';
}

// **
// START Utility functions
// **

// Function getCountries
//  - Gets available polls for each country
// @callback      {array}   List of countries
function getCountries(callback) {
  const settings = {
    url: `${serverBase}/api/countries`,
    method: 'GET',
  };
  $.ajax(settings).done((response) => {
    callback(JSON.parse(response));
  });
}

// Function getPoll
//  - Gets poll belonging to a country
// @url   {string}  ID for playlist
// @callback      {array}   List of polls
function getPoll(url, callback) {
  const settings = {
    url: `${serverBase}/api/poll?url=${url}`,
    method: 'GET',
  };
  $.ajax(settings).done((response) => {
    callback(JSON.parse(response));
  });
}

// Function decodePoll
//  - Gets poll belonging to a country
// @url   {string}  ID for playlist
// @callback      {array}   List of polls
function decodePoll(countryCode, countryName, poll, date, firm, source, parties, callback) {
  const ret = [];
  for (const party in parties) {
    if (parties[party]) {
      const res = {};
      res.country_code = countryCode;
      res.country_name = countryName;
      res.poll = poll;
      res.date = date;
      res.firm = firm;
      res.source = source;
      res.party = party;
      res.result = parties[party];
      ret.push(res);
    }
  }
  callback(ret);
}

// **
// END Utility functions
// **

// **
// START Tableau WDC Code
// **
const tableau = require('./tableauwdc-2.3.latest.min.js');

const pollConnector = tableau.makeConnector();

pollConnector.init = (initCallback) => {
  tableau.connectionName = 'pollof­polls.eu';

  const settings = {
    url: '/api/stats',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    processData: false,
    data: '{\n\t"wdc": "eupollofpolls",\n\t"action": "view"\n}',
  };
  $.ajax(settings)
    .done((response) => {
      console.log(response);
    })
    .always(() => {
      tableau.submit();
    });

  initCallback();
};

// Define the schema
pollConnector.getSchema = (schemaCallback) => {
  schemaCallback(schema.tables, schema.joins);
};

// Download the data
pollConnector.getData = (table, doneCallback) => {
  const settings = {
    url: '/api/stats',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    processData: false,
    data: '{\n\t"wdc": "eupollofpolls",\n\t"action": "download"\n}',
  };
  $.ajax(settings)
    .done((response) => {
      console.log(response);
    })
    .always(() => {
      if (table.tableInfo.id === 'polls') {
        tableau.reportProgress('Getting list of available polls');
        getCountries((countries) => {
          console.log(countries);
          async.each(countries, (country, doneCountry) => {
            tableau.reportProgress(`Getting ${country.country_name} ${country.poll}`);
            getPoll(country.url, (poll) => {
              console.log(poll);
              for (let i = 0; i < poll.length; i += 1) {
                decodePoll(
                  country.country_code,
                  country.country_name,
                  country.poll,
                  poll[i].date,
                  poll[i].firm,
                  poll[i].source,
                  poll[i].parties,
                  (results) => {
                    table.appendRows(results);
                  },
                );
              }
              doneCountry();
            });
          }, (err) => {
            if (err) {
              console.log('There was an error with Country Polls', err);
            } else {
              console.log('All done!');
              doneCallback();
            }
          });
        });
      }
    });
};

tableau.registerConnector(pollConnector);


// **
// END Tableau WDC Code
// **
