const { parse } = require('url');
const app = require('express')();
const cors = require('cors');
const request = require('request');

app.use(cors());

app.get('/api/countries', (req, res) => {
  const options = {
    method: 'GET',
    url: 'https://pollofpolls.eu/get/info',
  };
  request(options, (error, response, body) => {
    if (error) console.log(error);
    const polls = JSON.parse(body);
    const ret = [];
    for (const poll in polls) {
      if (polls[poll]) {
        ret.push({
          country_code: polls[poll].iso2,
          country_name: polls[poll].country,
          poll: polls[poll].name,
          url: poll,
        });
      }
    }
    res.end(JSON.stringify(ret));
  });
});

app.get('/api/poll', (req, res) => {
  const { query } = parse(req.url, true);
  const options = {
    method: 'GET',
    url: `https://pollofpolls.eu/get/polls/${query.url}/format/json`,
  };
  request(options, (error, response, body) => {
    if (error) console.log(error);
    res.end(body);
  });
});

app.listen(3001, () => {
  console.log('CORS-enabled web server listening on port 3001');
});
