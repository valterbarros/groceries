const fs = require('fs');
const credendials = require('./env.js');

// usage: node build.js development 

fs.open('./env_master.js', 'w', function (err, file) {
  if (err) throw err;
  fs.closeSync(file);
});

fs.readFile('./env_master.js', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return
  }
  let result;

  if (process.argv.slice(2)[0] === 'production') {
    result = `export const BASE_API = '${credendials.production.api}'`;
  }

  if (process.argv.slice(2)[0] === 'development') {
    result = `export const BASE_API = '${credendials.development.api}'`;
  }

  fs.writeFile('env_master.js', result, { flag: 'w+' }, function (err) {
    if (err) return console.log(err);
    console.log(result);
  });
});
