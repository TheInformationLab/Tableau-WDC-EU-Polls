// jQuery
import 'jquery';
// PopperJS
import 'popper.js';
// Bootstrap 4
import 'bootstrap';
// Material Design Bootstrap
import '../vendors/mdb/js/mdb';

const { recordStat, getCountries, getPoll } = require('../assets/mongo/browser');

const tableauwdc = require('./tableauwdc/tableauwdc.js');

tableauwdc.init();

const { tableau } = window;

const { async } = window;

const pollCol = [{
  id: 'country_code',
  alias: 'Country Code',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'country_name',
  alias: 'Country Name',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'poll',
  alias: 'Poll Name',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'date',
  alias: 'Poll Date',
  dataType: tableau.dataTypeEnum.date,
}, {
  id: 'firm',
  alias: 'Polling Firm',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'source',
  alias: 'Source URL',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'party',
  alias: 'Party',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'result',
  alias: 'Result',
  dataType: tableau.dataTypeEnum.float,
}];

const polls = {
  id: 'polls',
  alias: 'Polls',
  columns: pollCol,
};

const schema = {
  tables: [
    polls,
  ],
};

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
// END Utility functionsk
// **

// **
// START Tableau WDC Code
// **

const pollConnector = tableau.makeConnector();

pollConnector.init = (initCallback) => {
  tableau.connectionName = 'pollof­polls.eu';

  recordStat('eupollofpolls', 'view')
    .then(() => {
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
  recordStat('eupollofpolls', 'download')
    .then(() => {
      if (table.tableInfo.id === 'polls') {
        tableau.reportProgress('Getting list of available polls');
        getCountries()
          .then((countries) => {
            console.log(countries);
            async.each(countries, (country, doneCountry) => {
              tableau.reportProgress(`Getting ${country.country_name} ${country.poll}`);
              console.log(country.url);
              getPoll(country.url)
                .then((poll) => {
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
