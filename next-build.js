const fs = require('fs')
const path = require('path')
const folderPath = path.join(__dirname, '/dist');
const pjson = require('./package.json');

const filesToCache = fs.readdirSync(folderPath).map(fileName => {
  return `"${fileName}"`
}).filter((fileName) => !fileName.includes('.map') && !fileName.includes('.webmanifest') && !fileName.includes('sw'));

fs.readFile('./dist/sw.js', 'utf8', async function(err, data) {
  const regexToReplace = new RegExp(/(?!['"][\w\s]*(@parcel|PARCEL|parcel|HMRServer|hmrserver))['"][^'"\]]+(\.css|\.js|\.png|\.html|\.svg)['"]{1}/, 'g');
  const matchCount = [...data.matchAll(regexToReplace)].length
  const filesCount = filesToCache.length;
  const extraFiles = filesToCache.slice(0, filesCount - matchCount).join(', ');
  let needExtraFiles = !!extraFiles.length;

  let count = matchCount - filesCount >= 0 ? -1 : filesCount - matchCount - 1;

  result = data.replace(regexToReplace, function replacer(match, p1, p2, p3) {
    if (extraFiles.length && needExtraFiles) {
      needExtraFiles = false;
      return `${extraFiles}, ${filesToCache[count += 1]}`;
    }

    return filesToCache[count += 1];
  }).replace(/%{version}/g, pjson.version);

  fs.writeFile('./dist/sw.js', result, 'utf8', function(err) {
    if (err) return console.log(err);
  });
});
