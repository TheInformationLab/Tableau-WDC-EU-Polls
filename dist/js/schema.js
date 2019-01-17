const tableau = require('./tableauwdc-2.3.latest.min.js');

const poll = [{
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
  columns: poll,
};

module.exports = {
  schema: {
    tables: [
      polls,
    ],
    joins: [
    ],
  },
};
