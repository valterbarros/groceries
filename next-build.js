const fs = require('fs')
const path = require('path')
const folderPath = path.join(__dirname, '/dist');
console.log(folderPath);

const filesToCache = fs.readdirSync(folderPath).map(fileName => {
  return `"${fileName}"`
}).filter((fileName) => !fileName.includes('.map') && !fileName.includes('.webmanifest'))

fs.readFile('./dist/sw.js', 'utf8', function(err, data) {
  const stringToReplace = `"*.js","*.css","/images/icons-192.png","/images/icons-512.png","/"`

  const replaceString = `${filesToCache.join()}`

  const result = data.replace(stringToReplace, replaceString);

  fs.writeFile('./dist/sw.js', result, 'utf8', function(err) {
    if (err) return console.log(err);
  });
});
