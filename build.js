const fs = require('fs');
const credendials = require('./env.js');

fs.readFile('./env_master.js', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return
  }
  let result;

  if (process.argv.slice(2)[0] === 'production') {
    result = data.replace('link_to_api', credendials.production.api);
  }

  if (process.argv.slice(2)[0] === 'development') {
    result = data.replace('link_to_api', credendials.development.api);
  }

  fs.writeFile('./env_master.js', result, 'utf8', function (err) {
    if (err) return console.log(err);
  });
});
