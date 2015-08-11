// update_doc_list.js
// ------------------

var fs = require("fs"),
    path = require("path");

global.CONFIG_FILE  = path.resolve('./config.json');
global.NODEAPP_FILE = path.join(process.env['NODEJS_PATH'] || '','node.exe');

function deepScanDoc(bCate,sDir) {
  var b = fs.readdirSync(sDir);
  for (var i=0,item; item=b[i]; i++) {
    if (item == '.' || item == '..') continue;
    var sPath = path.join(sDir,item);
    var stat = fs.lstatSync(sPath);
    if (!stat.isDirectory()) continue;
    
    if (item.slice(0,2) == '$$')
      deepScanDoc(bCate,sPath);
    else bCate.push(sPath);
  }
}

function getProjectInfo(bCate) {
  for (var i=0,item; item=bCate[i]; i++) {
    var hasIndex = fs.existsSync(path.join(item,'index.html'));
    if (!hasIndex) continue;
    
    var iFlag=3, isShow=false, isBlog=item.slice(-5) == '.blog';
    if (!isBlog) isShow = item.slice(-6) == '.sshow';
    var hasTmpl = fs.existsSync(path.join(item,'$index.tmpl'));
    if (!isShow && !isBlog && !hasTmpl) continue;
    if (!isBlog && hasTmpl)
      iFlag = 1;
    else iFlag = 3;
    
    var absFile = path.join(item,'$abstract.txt');
    var sTitle='', sDesc='', sKey='', fTime=0, fTime2=0;
    if (fs.existsSync(absFile)) {
      var stat = fs.lstatSync(absFile);
      fTime  = stat.mtime.valueOf(); // modified time
      fTime2 = stat.ctime.valueOf(); // create time
      var s = fs.readFileSync(absFile,'utf-8') || '';
      if (s.charCodeAt(0) == 65279) s = s.slice(1);
      
      var b = s.split('\n');
      sTitle = (b[0] || '').trim();
      sDesc = (b[1] || '').trim();
      sKey = (b[2] || '').trim();
      if (sKey && sKey[0] == '<' && sKey[sKey.length-1] == '>')
        sKey = sKey.slice(1,sKey.length-1);
    }
    
    var thumFile = path.join(item,'$thumbnail.png');
    if (!fs.existsSync(thumFile)) thumFile = '';
    
    var bb = [path.join(item,'index.html'),path.join(item,'$index.md'),path.join(item,'$index.txt')];
    for (var i2=0,item2; item2=bb[i2]; i2++) {
      if (fs.existsSync(item2)) {
        var stat = fs.lstatSync(item2);
        var f = stat.mtime.valueOf();
        if (f > fTime)
          fTime = f;
        f = stat.ctime.valueOf();
        if (fTime2 == 0 || f < fTime2)
          fTime2 = f;
      }
    }
    
    if (fTime && fTime2) { // at least exist one of: $abstract.txt, index.html, $index.md, $index.txt
      bCate[i] = [fTime,fTime2,item,sTitle,sDesc,sKey,thumFile,iFlag];
    }
  }
}

function main() {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.log('File not found: ./config.json');
    return;
  }
  
  // step 1: read config.json
  var dConfig = null, sJson = fs.readFileSync(CONFIG_FILE,'utf-8'), sFirstTxtChr = '';
  try {
    if (sJson.charCodeAt(0) == 65279) { // utf-8 BOM flag
      sFirstTxtChr = sJson[0];
      sJson = sJson.slice(1);
    }
    dConfig = JSON.parse(sJson);
  }
  catch(e) {
    console.log('Load config.json failed: ' + e.message);
    return;
  }
  
  // step 2: scan category doc list
  var bDocList = [], sRootDir = path.dirname(CONFIG_FILE);
  var b = fs.readdirSync(sRootDir);
  for (var i=0,item; item=b[i]; i++) {
    if (item == '.' || item == '..') continue;
    if (item.slice(0,2) != '$$') continue;
    
    var sPath = path.join(sRootDir,item);
    var stat = fs.lstatSync(sPath);
    if (!stat.isDirectory()) continue;
    
    var bItem = [];
    bDocList.push([item.slice(2),bItem]);
    deepScanDoc(bItem,sPath);
  }
  
  // step 3: fetch every project info
  for (var i=0,item; item=bDocList[i]; i++) {
    getProjectInfo(item[1]);
  }
  
  // step 4: remove failed project and sort it
  for (var i=0,item; item=bDocList[i]; i++) {
    item = item[1];
    for (var i2=item.length-1; i2 >= 0; i2--) {
      if (typeof(item[i2]) == 'string')
        item.splice(i2,1);
    }
    item.sort(function(a,b){return b[0]-a[0];});
  }
  
  // step 5: update dConfig.doc_list and save file
  var bNew = [];
  for (var i=0,item; item=bDocList[i]; i++) {
    var bOne = item[1];
    for (var i2=0,item2; item2=bOne[i2]; i2++) {
      var sThumb = item2[6];
      if (sThumb) sThumb = path.relative(sRootDir,sThumb).replace(/\\/g,'/');
      var iFlag = item2[7] || 3;
      
      bNew.push( {path: path.relative(sRootDir,item2[2]).replace(/\\/g,'/'),
        title: item2[3],
        desc: item2[4],
        keyword: item2[5],
        thumb: sThumb,
        flag: iFlag,
        modify_at: Math.floor(item2[0]/1000),
        create_at: Math.floor(item2[1]/1000),
      });
    }
  }
  dConfig['doc_list'] = bNew;
  
  // step 6: save config.json
  sJson = sFirstTxtChr + JSON.stringify(dConfig);
  fs.writeFileSync(CONFIG_FILE,sJson,'utf-8');
  console.log('Update config.json successful!');
}

main();
