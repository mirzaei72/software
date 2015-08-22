// main.js

(function() {

var TOP_NAV_HEIGHT = 26;
var LEFT_NAV_WIDTH = 100;

var WEB_BROWSER_TYPE = '';
var WEB_BROWSER_VER = '';
var TRANS_END_FUNC = '';
var TRANS_CSS_NAME = '';

var DCF_ = null;
var getDCF_ = function() {
  if (!DCF_) {
    DCF_ = new Messenger.DCF(); // messenger.js must loaded
    if (document.body)
      document.body.getDCF_ = getDCF_;
  }
  return DCF_;
};

function getCookie__(name) {
  if (document.cookie.length > 0) {
    var iEnd, iStart = document.cookie.indexOf(name + "=");
    if (iStart != -1) {
      iStart = iStart + name.length + 1;
      iEnd = document.cookie.indexOf(";",iStart);
      if (iEnd == -1) iEnd = document.cookie.length;
      return unescape(document.cookie.substring(iStart,iEnd));
    }
  }
  return "";
}

function setCookie__(name,value,expireDays,path) {
  expireDays = expireDays || 1;
  var exDate = new Date();
  exDate.setTime(exDate.getTime() + expireDays*24*60*60*1000);
  path = path || '/';
  document.cookie = name + "=" + escape(value) + ";expires=" + exDate.toGMTString() + ";path=" + path + ";";
}

function delCookie__(name,path) {
  if (document.cookie.length > 0) {
    var iStart = document.cookie.indexOf(name + "=");
    if (iStart != -1) {
      var exp = new Date();
      exp.setTime(exp.getTime() - 1);
      path = path || '/';
      document.cookie = name + "=;expires=" + exp.toGMTString() + ";path=" + path + ";";
    }
  }
}

function htmlEncode(s) {
  if (s)
    return s.replace(/</gm,'&lt;').replace(/>/gm,'&gt;');
  else return '';
}

function getAsynRequest(sUrl,succFunc,faildFunc,sData) {
  var xmlHttp = null;
  if (window.XMLHttpRequest)      // Firefox, Opera, IE7, etc
    xmlHttp = new XMLHttpRequest();
  else if (window.ActiveXObject)  // IE6, IE5
    xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
  
  if (xmlHttp != null) {
    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4) { // 4 is "loaded"
        if (xmlHttp.status == 200) {
          if (succFunc)
            succFunc(xmlHttp.responseText);
        }
        else {
          var sErr = xmlHttp.statusText || 'Connection error';
          if (faildFunc)
            faildFunc(sErr);
          else console.log(sErr);
        }
        xmlHttp = null;
      }
    };
    
    xmlHttp.requestTimer = setTimeout(30000, function(){
      try{
        if (xmlHttp) {
          xmlHttp.abort();
          xmlHttp.aborted = true;
        }
      }
      catch(err){
        log(err);
      }
    });
    
    if (typeof sData == 'string' || sData instanceof ArrayBuffer) {
      xmlHttp.open("POST",sUrl,true);
      xmlHttp.send(sData);
    }
    else {
      xmlHttp.open("GET",sUrl,true);
      xmlHttp.send(null);
    }
  }
}

function bodyOnResize(event) {
  var node = document.querySelector('div.area-dir');
  node.style.width = Math.max(100,window.innerWidth-LEFT_NAV_WIDTH) + 'px';

  var iWd=window.innerWidth-LEFT_NAV_WIDTH, iHi=window.innerHeight-TOP_NAV_HEIGHT;
  node = document.getElementById('doc-view');
  node.style.width = iWd + 'px';
  node.style.height = iHi + 'px';

  node = document.getElementById('mng-view');
  node.style.width = iWd + 'px';
  node.style.height = iHi + 'px';
  
  var slideFrm = document.getElementById('doc-frm');
  var rX=iWd/920, rY=iHi/720;
  if (rX >= rY)
    rX = Math.min(rY*1.1,rX);
  else rY = Math.min(rX*1.1,rY);
  if ((rX >= 0.95 && rY >= 0.95) || (rX >= 0.9 && rX <= 1.1 && rY >= 0.88 && rY <= 1.1) ||
      (rX >= 1.0 && rY >= 0.88) ) {
    rX = 1; rY = 1;  // try no scale as posible as can
  }
  if (rX == 1 && rY == 1) {
    slideFrm.style[TRANS_CSS_NAME] = '';
    slideFrm.style.marginLeft = '0px';
    slideFrm.style.width = iWd + 'px';
    slideFrm.style.height = iHi + 'px';
  }
  else {
    slideFrm.style.width = '920px';
    slideFrm.style.height = '720px';
    slideFrm.style[TRANS_CSS_NAME] = 'scale(' + rX + ',' + rY + ')';
    var slideWd = rX * 920;
    if (iWd > slideWd)
      slideFrm.style.marginLeft = ((iWd-slideWd)/2) + 'px';
    else slideFrm.style.marginLeft = '0px';
  }
}

function switchToView(sView) {
  var mngView = document.getElementById('mng-view');
  var docView = document.getElementById('doc-view');
  if (sView == 'slide') {
    mngView.style.zIndex = '0';
    mngView.style.visibility = 'hidden';
    docView.style.zIndex = '2000';
    docView.style.visibility = 'visible';
  }
  else {
    mngView.style.zIndex = '2000';
    mngView.style.visibility = 'visible';
    docView.style.zIndex = '0';
    docView.style.visibility = 'hidden';
  }
}

function isDocInShow() {
  var docView = document.getElementById('doc-view');
  if (docView.style.zIndex == '2000')
    return true;
  else return false;
}

//------------------------------------------------
var lastCateHit  = {};
var lastRepoTime = {};
var docConfig    = {};
var otherConfigs = [];

var autoOpenURL = '';

var LastSlideList_ = [];
var LastSlideListId_ = '';  // current listed category

function repoCateDocList(dCfg,sCate) {
  var bList=[], bDoc=dCfg.doc_list || [];
  var repoUrl = dCfg.repoUrl || ('/' + dCfg.repos_name + '/');
  var sPrefix = '$$' + sCate + '/';
  
  for (var i=0,item; item=bDoc[i]; i++) { // bDoc already has sorted
    var iFlag = item.flag || 3;
    if (item.path.indexOf(sPrefix) == 0 && (iFlag & 0x100) == 0) {
      var sImgUrl = item.thumb || '';
      if (sImgUrl && sImgUrl[0] == '$' && sImgUrl[1] == '$')
        sImgUrl = repoUrl + sImgUrl;
      bList.push([dCfg.user_name,dCfg.repos_name,item.path,sImgUrl,item.isUnread || false,item.title || '',item.desc || '',item.modify_at || 0,iFlag]);
    }
  }
  return bList;
}

function getUserConfig(sUser,sRepo) {
  if (docConfig.user_name == sUser && docConfig.repos_name == sRepo)
    return docConfig;
  for (var i=0,item; item=otherConfigs[i]; i++) {
    if (item.user_name == sUser && item.repos_name == sRepo)
      return item;
  }
  return null;
}

function loadToShow(event) {
  if (event.target.nodeName != 'IMG') return;
  event.target.style.visibility = 'visible';
}

function addUserItem(iUnread,userName,repoName,repoDesc,sHint,isCurr,uid) {
  var node = document.createElement('div');
  node.setAttribute('uid',uid+'');
  node.setAttribute('user',userName);
  node.setAttribute('name',repoName);
  if (uid > 0 && uid != 65535) {
    node.setAttribute('loading','1');
    node.style.background = 'url(/software/blogger10/loading2.gif) no-repeat 2px 5px';
  }
  if (sHint) node.setAttribute('title',sHint);
  node.className = 'btn-user' + (isCurr?' current':'');
  
  var sUnread = '/software/blogger10/unread' + (iUnread <= 9?iUnread:10) + '.png';
  var descNode = document.createElement('span');
  descNode.innerHTML = htmlEncode(repoDesc || repoName);
  node.appendChild(descNode);
  node.appendChild(document.createElement('br'));
  var tmp = document.createElement('img');
  tmp.onload = loadToShow;
  tmp.src = sUnread;
  node.appendChild(tmp);
  
  var userNodes = document.querySelector('div.left-btns');
  userNodes.appendChild(node);
}

function setUserItem(node,iUnread,userName,repoName,repoDesc) {
  node.setAttribute('user',userName);
  node.setAttribute('name',repoName);
  if (repoDesc) {
    var descNode = node.querySelector('span');
    if (descNode) descNode.innerHTML = htmlEncode(repoDesc);
  }
  node.removeAttribute('loading');
  node.style.background = '';
  
  var tmp = node.querySelector('img');
  if (tmp) {
    tmp.onload = loadToShow;
    tmp.src = '/software/blogger10/unread' + (iUnread <= 9?iUnread:10) + '.png';
  }
}

function checkWhenCfgLoad() {
  var node = document.querySelector('div.btn-user[loading]');
  if (node) return; // still has some in loading
  
  if (otherConfigs.length > 0) {
    var sCate = getCookie__('cate_' + docConfig.user_name + '_@ALL') || '';
    if (sCate)
      lastCateHit[docConfig.user_name + '_@ALL'] = sCate;
    
    addUserItem(0,docConfig.user_name,'ALL','','Collect above all',false,65535);
  }
  
  if (autoOpenURL) {
    var bArgs = ['','',autoOpenURL];
    autoOpenURL = '';
    setTimeout( function() {
      document.body.guiIsReady_ = true;
      openOneDoc(bArgs);
    },500);
  }
  else document.body.guiIsReady_ = true;
}

function repoAllListByCate(sCurrCate) {
  var bList=[], bCate=[], dUnread={}, sPrefix='';
  if (sCurrCate) sPrefix = '$$' + sCurrCate + '/';
  
  for (var i=-1; i < otherConfigs.length; i++) {
    var dCfg = i < 0? docConfig: otherConfigs[i];
    
    var repoUrl = dCfg.repoUrl || ('/' + dCfg.repos_name + '/');
    var bDoc = dCfg.doc_list || [];
    for (var i2=0,item2; item2=bDoc[i2]; i2++) {
      // step 1: prepare sCurrCate/sPrefix/sCate
      var sPath = item2.path || '', iPos = sPath.indexOf('/'), sCate = '';
      if (iPos > 3 && sPath[0] == '$' && sPath[1] == '$') {
        sCate = sPath.slice(2,iPos);
        if (!sCurrCate) {
          sCurrCate = sCate;
          sPrefix = '$$' + sCate + '/';
        }
      }
      
      // step 2: count category and unread number
      if (!sCate) continue;
      var iFlag = item2.flag || 3;
      if ((iFlag & 0x100) != 0) continue; // the document is hidden
      
      var iNum = dUnread[sCate];
      if (typeof iNum != 'number') {
        dUnread[sCate] = (item2.isUnread?1:0);
        bCate.push(sCate);
      }
      else {
        if (item2.isUnread)
          dUnread[sCate] = iNum + 1;
      }
      
      // step 3: add item-info if cate matched
      if (sPath.indexOf(sPrefix) == 0) {
        var sImgUrl = item2.thumb || '';
        if (sImgUrl && sImgUrl[0] == '$' && sImgUrl[1] == '$')
          sImgUrl = repoUrl + sImgUrl;
        bList.push([dCfg.user_name,dCfg.repos_name,sPath,sImgUrl,item2.isUnread || false,item2.title || '',item2.desc || '',item2.modify_at || 0,iFlag]);
      }
    }
  }
  if (bCate.length == 0 || bCate.indexOf(sCurrCate) < 0) return;
  
  // step 4: sort bCate, bList
  bCate.sort();
  bList.sort(function(a,b){return b[7]-a[7];}); // newest modify is first
  
  // step 5: update cate list
  var sHtml='<p>', dirNodes=document.querySelector('#top-nav > div.area-dir');
  for (var i=0,item; item=bCate[i]; i++) {
    sHtml += '<span class="btn-dir' + (item==sCurrCate?' current':'') + '"';
    sHtml += ' title="' + (dUnread[item] || 0) + ' unread"';
    sHtml += ' name="@ALL" cate="' + item + '">' + item + '</span>';
  }
  sHtml += '&nbsp;</p>';
  dirNodes.innerHTML = sHtml;
  
  // step 6: show category list
  switchToView('list');
  var frm = document.getElementById('mng-frm');
  frm.onload = function(event) {
    frm.onload = null;
    restoreBusyState();
    
    LastSlideListId_ = sCurrCate;
    LastSlideList_ = bList;
    getDCF_().call('mng-frm','setSlides',bList);
  };
  setTimeout(function() {
    restoreBusyState();
  },10000);
  setBusyState();
  frm.src = '/software/blogger10/list_slide.html';
}

function getDocListInfo(bOut,bDoc,iLastRepoTm) {
  var fMax=0, iUnread=0;
  for (var i=0,item; item=bDoc[i]; i++) {
    var fTmp = item.modify_at || 0;
    if (fTmp > fMax) fMax = fTmp;
    if (fTmp > iLastRepoTm) {
      item.isUnread = true;
      iUnread += 1;
    }
  }
  bOut.push(fMax,iUnread);
}

function queryBodyContent(dCfg) {
  var userName = dCfg.user_name;
  var repoName = dCfg.repos_name;
  var sLastCate = lastCateHit[userName + '_' + repoName] || '';
  var iLastRepoTm = lastRepoTime[userName + '_' + repoName] || 0;
  
  // step 1: scan category
  var bDoc = dCfg.doc_list || [];
  var dUnread={}, bCate=[];
  for (var i=0,item; item=bDoc[i]; i++) {
    var s = item.path || '';
    if (s.slice(0,2) == '$$') {
      var iFlag = item.flag || 3;
      if ((iFlag & 0x100) != 0) continue;
      
      var sCate, iPos=s.indexOf('/');
      if (iPos > 2)
        sCate = s.slice(2,iPos);
      else continue;
      
      var iExist = dUnread[sCate];
      if (typeof iExist != 'number') {
        bCate.push(sCate);
        dUnread[sCate] = (item.isUnread?1:0);
      }
      else {
        if (item.isUnread) dUnread[sCate] = iExist + 1;
      }
    }
  }
  var cateIndex = -1;
  if (bCate.length) {
    if (sLastCate)
      cateIndex = bCate.indexOf(sLastCate);
    if (cateIndex < 0) cateIndex = 0;
  }
  
  // step 2: add category list to div.area-dir
  bCate.sort();
  var sHtml='<p>', dirNodes=document.querySelector('#top-nav > div.area-dir');
  for (var i=0,item; item=bCate[i]; i++) {
    sHtml += '<span class="btn-dir' + (i==cateIndex?' current':'') + '"';
    sHtml += ' title="' + (dUnread[item] || 0) + ' unread"';
    sHtml += ' user="' + userName + '" name="' + repoName + '" cate="' + item + '">' + item + '</span>';
  }
  sHtml += '&nbsp;</p>';
  dirNodes.innerHTML = sHtml;
  
  // step 3: show default category
  var bList = [], sCurrCate='';
  if (bCate.length && cateIndex >= 0) {
    sCurrCate = bCate[cateIndex];
    bList = repoCateDocList(dCfg,sCurrCate);
  }
  
  switchToView('list');
  var frm = document.getElementById('mng-frm');
  frm.onload = function(event) {
    frm.onload = null;
    restoreBusyState();
    
    LastSlideListId_ = sCurrCate;
    LastSlideList_ = bList;
    getDCF_().call('mng-frm','setSlides',bList);
  };
  setTimeout(function() {
    restoreBusyState();
  },10000);
  setBusyState();
  frm.src = '/software/blogger10/list_slide.html';
}

function setRelatedRepo(userIndex,sUrl_,setRepoDesc,callback) {
  var userNodes = document.querySelector('#left-nav > div.left-btns');
  if (userIndex == 0) {
    userNodes.innerHTML = '';
  }
  
  var sBasePath = sUrl_.slice(0,sUrl_.length-11); // remove tail: config.json
  var sUrl = sUrl_ + '?time_=' + (new Date()).valueOf();  // force reload
  getAsynRequest(sUrl, function(sRet) {
    var dCfg = null;
    try {
      dCfg = JSON.parse(sRet);
    } catch(e) {alert(e); }
    
    if (dCfg instanceof Object && dCfg.repos_name) {  // it is available
      if (userIndex == 0)
        docConfig = dCfg;
      else otherConfigs.push(dCfg);
      
      var userName = dCfg.user_name;
      var repoName = dCfg.repos_name;
      var sLastCate = getCookie__('cate_' + userName + '_' + repoName) || '';
      if (sLastCate) lastCateHit[userName + '_' + repoName] = sLastCate;
      var iLastRepoTm = parseFloat(getCookie__('time_' + userName + '_' + repoName) || '0');
      lastRepoTime[userName + '_' + repoName] = iLastRepoTm;
      
      var bDoc = dCfg.doc_list || [];
      if (dCfg.sort_by == 'modify_time')
        bDoc.sort( function(a,b){return (b.modify_at||0)-(a.modify_at||0);} );
      else if (dCfg.sort_by == 'create_time')
        bDoc.sort( function(a,b){return (b.create_at||0)-(a.create_at||0);} );
      else if (dCfg.sort_by == 'name') {
        bDoc.sort( function(a,b) {
          var sA=a.path||'', sB=b.path||'';
          if (sA == sB)
            return 0;
          else if (sA > sB)
            return 1;
          else return -1;
        });
      }
      // else, dCfg.sort_by is 'none', ignore sort
      
      // added: dCfg.repoUrl .maxModiTime .unreadNum .doc_list[n].isUnread
      var bInfo = [];
      getDocListInfo(bInfo,bDoc,iLastRepoTm);
      dCfg.maxModiTime = bInfo[0];
      dCfg.unreadNum = bInfo[1];
      dCfg.repoUrl = (sBasePath? sBasePath: '/'+repoName+'/');
      
      setCookie__('time_' + userName + '_' + repoName,Math.max(iLastRepoTm,dCfg.maxModiTime)+'',100,'/'+docConfig.repos_name);
      if (userIndex == 0) { // show first DOC list
        queryBodyContent(dCfg);
        addUserItem(dCfg.unreadNum,userName,repoName,dCfg.repos_desc || '',dCfg.repoUrl,true,userIndex);
      }
      else {
        var node = document.querySelector('div.btn-user[uid="' + userIndex + '"]');
        var sNewDesc = (setRepoDesc? dCfg.repos_desc || '' : '');
        if (node) setUserItem(node,dCfg.unreadNum,userName,repoName,sNewDesc);
      }
      
      if (typeof callback == 'function') callback();
      setTimeout(checkWhenCfgLoad,0); // run after next user-repo added
    }
  }, function(sErr) {
    alert('Read config.json failed: ' + sErr);
  });
}

function cateBtnClick(event) {
  var targ = event.target;
  if (targ && targ.nodeName == 'SPAN' && targ.classList.contains('btn-dir')) {
    var sUser = targ.getAttribute('user');
    var sRepo = targ.getAttribute('name');
    var sCate = targ.getAttribute('cate');
    if (!sCate) return;
    
    var lastCurr = document.querySelector('span.btn-dir.current');
    if (lastCurr === targ) { // click current directory again, force switch to 'list' mode
      if (isDocInShow()) {
        switchToView('list');
        return;
      }
    }
    
    if (sRepo == '@ALL') {
      setCookie__('cate_' + docConfig.user_name + '_@ALL',sCate,100,'/'+docConfig.repos_name);
      lastCateHit[docConfig.user_name + '_@ALL'] = sCate;
      repoAllListByCate(sCate);
      return;
    }

    if (!sUser || !sRepo) return;
    setCookie__('cate_' + sUser + '_' + sRepo,sCate,100,'/'+sRepo);
    lastCateHit[sUser + '_' + sRepo] = sCate;
    
    var dCfg = getUserConfig(sUser,sRepo);
    if (!dCfg) return;
    
    var oldNode = document.querySelector('span.btn-dir.current');
    if (oldNode) oldNode.classList.remove('current');
    targ.classList.add('current');
    
    var bList = repoCateDocList(dCfg,sCate);
    
    switchToView('list');
    var frm = document.getElementById('mng-frm');
    frm.onload = function(event) {
      frm.onload = null;
      restoreBusyState();
      
      LastSlideListId_ = sCate;
      LastSlideList_ = bList;
      getDCF_().call('mng-frm','setSlides',bList);
    };
    setTimeout(function() {
      restoreBusyState();
    },10000);
    setBusyState();
    frm.src = '/software/blogger10/list_slide.html';
  }
}

function userBtnClick(event) {
  var targ = event.target;
  while (targ) {
    if (targ.nodeName == 'DIV' && targ.classList.contains('btn-user'))
      break;
    else targ = targ.parentNode;
  }
  if (!targ) return;
  if (targ.getAttribute('loading')) return; // still in loading
  
  var imgNode = targ.querySelector('div.btn-user > img');
  if (imgNode) imgNode.parentNode.removeChild(imgNode);
  
  var sUID = targ.getAttribute('uid');
  var repoName = targ.getAttribute('name');
  var node = document.querySelector('div.btn-user.current');
  if (node === targ) {
    if (isDocInShow())
      switchToView('list');
    else {
      if (sUID == '65535')
        switchToView('slide');
      else {
        var docFrm = document.getElementById('doc-frm');
        var sUser = docFrm.getAttribute('user') || '';
        var sRepo = docFrm.getAttribute('repo') || '';
        if (sUser && sRepo && sRepo == repoName && sUser == targ.getAttribute('user'))
          switchToView('slide');
      }
    }
    return;  // ignore re-click current user
  }
  
  if (sUID == '65535') {
    if (node) node.classList.remove('current');
    targ.classList.add('current');
    
    var sCate = lastCateHit[docConfig.user_name + '_@ALL'] || '';
    repoAllListByCate(sCate);
  }
  else if (repoName) {
    if (node) node.classList.remove('current');
    targ.classList.add('current');
    
    var userName = targ.getAttribute('user');
    if (repoName && userName) {
      var dCfg = getUserConfig(userName,repoName);
      if (dCfg) queryBodyContent(dCfg);
    }
  }
}

function openOneDoc(bArgs) {
  var sUser=bArgs[0], sRepo=bArgs[1], sUrl=bArgs[2];
  if (!sUrl) return;
  if (sUrl[0] == '$' && sUrl[1] == '$') {
    var dCfg = getUserConfig(sUser,sRepo);
    if (!dCfg) return;
    
    var sBase = dCfg.repoUrl || ('/' + dCfg.repos_name + '/');
    sUrl = sBase + sUrl;
  }
  
  switchToView('slide');
  var frm = document.getElementById('doc-frm');
  if (sUser)
    frm.setAttribute('user',sUser);
  else frm.removeAttribute('user');
  if (sRepo)
    frm.setAttribute('repo',sRepo);
  else frm.removeAttribute('repo');
  frm.setAttribute('path',sUrl);
  
  setTimeout( function() {
    restoreBusyState();
  },10000); // max show 10 seconds
  frm.onload = function(event) {
    frm.onload = null;
    restoreBusyState();
  }
  setBusyState();
  frm.src = sUrl;
}

//------------------------------------------------
function prevNextSlideUrl(bOut,isLeft) {
  var node = document.querySelector('span.btn-dir.current');
  if (!node) return '';
  var sCate = node.getAttribute('cate') || '';
  if (!sCate || sCate != LastSlideListId_) return '';
  
  var sRepo = node.getAttribute('name') || '';
  var sUser = node.getAttribute('user') || '';
  var isRepoAll = (sRepo == '@ALL');
  if (!isRepoAll) {
    if (!sUser || !sRepo) return '';
  }
  
  var docFrm = document.getElementById('doc-frm');
  if (docFrm.parentNode.style.zIndex != '2000') return '';
  var sProj = docFrm.getAttribute('path');
  if (!sProj) return '';
  
  var sLastUser='', sLastRepo='', sLastOrg='', sLastProj='', bDoc=LastSlideList_;
  for (var i=0,item; item=bDoc[i]; i++) {
    var ss = item[2] || '', ss_ = ss;
    if (ss && ss[ss.length-1] != '/') ss += '/';
    if (ss[0] == '$' && ss[1] == '$') {
      var dCfg = getUserConfig(item[0],item[1]);
      if (dCfg)
        ss = (dCfg.repoUrl || ('/' + dCfg.repos_name + '/')) + ss;
    }
    
    if (ss == sProj) {
      if (isLeft) {
        bOut.push(sLastUser,sLastRepo,sLastOrg);
        return sLastProj;
      }
      else {
        item = bDoc[i+1];
        if (item) {
          ss = item[2] || '';
          bOut.push(item[0],item[1],ss);
          if (ss && ss[ss.length-1] != '/') ss += '/';
          if (ss[0] == '$' && ss[1] == '$') {
            var dCfg = getUserConfig(item[0],item[1]);
            if (dCfg)
              ss = (dCfg.repoUrl || ('/' + dCfg.repos_name + '/')) + ss;
          }
          return ss;
        }
        else return '';
      }
    }
    sLastUser = item[0];
    sLastRepo = item[1];
    sLastOrg  = ss_;
    sLastProj = ss;
  }
  
  return '';
}

function prevNextBtnMouseIn(event) {
  var targ = event.target;
  if (targ.nodeName == 'DIV' && targ.classList.contains('prev-next-btn')) {
    var bInfo = [], sUrl = prevNextSlideUrl(bInfo,targ.classList.contains('left'));
    if (sUrl)
      targ.style.backgroundColor = 'rgba(220,220,220,0.8)';
  }
}

function prevNextBtnMouseOut(event) {
  var targ = event.target;
  if ( targ.nodeName == 'DIV' && targ.classList.contains('prev-next-btn')) {
    targ.style.backgroundColor = '';
  }
}

function prevNextBtnClick(event) {
  var targ = event.target;
  if (targ.nodeName == 'DIV' && targ.classList.contains('prev-next-btn')) {
    var bInfo = [], sUrl = prevNextSlideUrl(bInfo,targ.classList.contains('left'));
    if (sUrl) {
      setTimeout( function() {
        switchToView('slide');
        var frm = document.getElementById('doc-frm');
        frm.setAttribute('user',bInfo[0]);
        frm.setAttribute('repo',bInfo[1]);
        frm.setAttribute('path',sUrl);
        frm.onload = function(event) {
          frm.onload = null;
          restoreBusyState();
        }
        setTimeout( function() {
          restoreBusyState();
        },10000);
        
        setBusyState();
        frm.src = sUrl;
        
        getDCF_().call('mng-frm','setOpened',bInfo);
      },0);
    }
  }
}

function handleDocKeyDown(event) {
  switch (event.keyCode) {
    case 39: // right arrow
    case 40: // down arrow
    case 13: // Enter
    case 32: // space
    case 34: // PgDn
    case 37: // left arrow
    case 38: // up arrow
    case 33: // PgUp
    case 36: // home
    case 35: // end
    case 27: // esc
    case 113: // F2
    {
      var docView = document.getElementById('doc-view');
      if (docView.style.zIndex == '2000') {
        try {
          var frm = document.getElementById('doc-frm');
          if (frm.contentWindow && frm.contentWindow.window) {
            var fn = frm.contentWindow.window.handleDocKeyDown;
            if (fn) fn(event);
          }
        }
        catch(e) { console.log(e); } // maybe raise across domain error
      }
      break;
    }
  }
}

function launchFullscreen(el) {
  if (el.requestFullscreen)
    el.requestFullscreen();
  else if (el.mozRequestFullScreen)
    el.mozRequestFullScreen();
  else if (el.webkitRequestFullscreen)
    el.webkitRequestFullscreen();
  else if (el.msRequestFullscreen)
    el.msRequestFullscreen(); 
}

function exitFullscreen() {
  if(document.exitFullscreen)
    document.exitFullscreen();
  else if(document.mozCancelFullScreen)
    document.mozCancelFullScreen();
  else if(document.webkitExitFullscreen)
    document.webkitExitFullscreen();
}

var isEnterFS_ = false;

function setBusyState() {
  var stateNode = document.querySelector('div.to-fullscreen');
  stateNode.style.backgroundImage = 'url(/software/blogger10/loading2.gif)';
}

function restoreBusyState() {
  var stateNode = document.querySelector('div.to-fullscreen');
  if (isEnterFS_)
    stateNode.style.backgroundImage = 'url(/software/blogger10/exit_fs.png)';
  else stateNode.style.backgroundImage = 'url(/software/blogger10/enter_fs.png)';
}

function switchFullScreen(event) {
  var targ = event.target;
  if (!targ || !targ.classList.contains('to-fullscreen')) return;
  
  if (Math.abs(screen.availHeight-window.innerHeight) <= 1) {
    exitFullscreen();
    targ.style.backgroundImage = 'url(/software/blogger10/enter_fs.png)';
    isEnterFS_ = false;
  }
  else {
    launchFullscreen(document.documentElement);
    targ.style.backgroundImage = 'url(/software/blogger10/exit_fs.png)';
    isEnterFS_ = true;
  }
}

document.addEventListener('DOMContentLoaded', function(event) {
  if (!window.HTMLCanvasElement || !document.addEventListener) {
    alert('The version of your web browser is too low for PINP Slide');
    return;
  }
  
  var sUA = navigator.userAgent;
  sUA = sUA.toLowerCase();
  var m = sUA.match(/trident.*rv[ :]*([\d.]+)/); // >= IE11, can not use sUA.match(/msie ([\d.]+)/)
  if (m) {
    if (parseFloat(m[1]) >= 11.0) {
      WEB_BROWSER_TYPE = 'ie'; WEB_BROWSER_VER = m[1];
      TRANS_END_FUNC = 'MSTransitionEnd';
      TRANS_CSS_NAME = '-ms-transform';  // 'transform' or 'msTransform' can work also
    }
  } else {
    m = sUA.match(/firefox\/([\d.]+)/);
    if (m) {
      WEB_BROWSER_TYPE = 'firefox'; WEB_BROWSER_VER = m[1];
      TRANS_END_FUNC = 'transitionend';
      TRANS_CSS_NAME = 'transform';
    } else {
      m = sUA.match(/chrome\/([\d.]+)/);
      if (m) {
        WEB_BROWSER_TYPE = 'chrome'; WEB_BROWSER_VER = m[1];
        TRANS_END_FUNC = 'webkitTransitionEnd';
        TRANS_CSS_NAME = '-webkit-transform';
      }
      else {
        m = sUA.match(/opera.([\d.]+)/);
        if (m) {
          WEB_BROWSER_TYPE = 'opera'; WEB_BROWSER_VER = m[1];
          TRANS_END_FUNC = 'oTransitionEnd';
          TRANS_CSS_NAME = 'transform';
        }
        else {
          m = sUA.match(/safari\/([\d.]+)/);
          if (m) {
            WEB_BROWSER_TYPE = 'safari'; WEB_BROWSER_VER = m[1];
            TRANS_END_FUNC = 'webkitTransitionEnd';
            TRANS_CSS_NAME = '-webkit-transform';
          }
          else {
            m = sUA.match(/webkit\/([\d.]+)/);
            if (m) {  // webkit kernel, iPad ...
              WEB_BROWSER_TYPE = 'webkit'; WEB_BROWSER_VER = m[1];
              TRANS_END_FUNC = 'webkitTransitionEnd';
              TRANS_CSS_NAME = '-webkit-transform';
            }
          }
        }
      }
    }
  }
  if (WEB_BROWSER_TYPE == '' || WEB_BROWSER_VER == '') {
    if (sUA.match(/msie ([\d.]+)/))
      alert('IE version too low for PINP Slide, please use IE11 or higher');
    else alert('PINP Slide only support: firefox/chrome/safari/opera/IE');
    document.body.innerHTML = '<h2>Unknown browser type</h2>';
    return;
  }
},false);

function parseParam(sArg) {
  if (sArg) sArg = sArg.slice(1); // remove '?'
  var d={}, b=sArg.split('&');
  for (var i=b.length-1; i >= 0; i--) {
    var item=b[i], b2=item.split('='), s1=(b2[0]||'').trim();
    if (s1) d[s1] = b2[1] || '';
  }
  return d;
}

window.addEventListener('load', function(event) {
  var addScriptToHead_ = function(sSrc,fn) {
    var node = document.createElement('script');
    if (typeof fn == 'function') node.onload = fn;
    node.async = 1;
    node.src = sSrc;
    document.querySelector('head').appendChild(node);
  };
  addScriptToHead_('//www.pinp.me/software/pages/blogger/js/menu.js');
  
  bodyOnResize();
  window.addEventListener('resize',bodyOnResize,false);
  document.addEventListener('keydown',handleDocKeyDown,false);
  
  var nodes = document.querySelectorAll('div.prev-next-btn');
  for (var i=0,item; item=nodes[i]; i++) {
    item.onmouseover = prevNextBtnMouseIn;
    item.onmouseout = prevNextBtnMouseOut;
    item.onclick = prevNextBtnClick;
  }
  var node = document.querySelector('div.to-fullscreen');
  node.onclick = switchFullScreen;
  node = document.querySelector('div.area-dir');
  node.onclick = cateBtnClick;
  node = document.querySelector('div.left-btns');
  node.onclick = userBtnClick;
  
  var mngView = document.getElementById('mng-view');
  var docView = document.getElementById('doc-view');
  var slideFrm = document.getElementById('doc-frm');
  getDCF_().regist('loaded', function(bArgs) {
    if (!slideFrm.style[TRANS_CSS_NAME]) { // not scaled
      var sVer = bArgs[0];
      var isIPAD=false, sUA=window.navigator.userAgent;
      if (sUA.indexOf('Safari/') > 0 && sUA.indexOf('iPad;') > 0)
        isIPAD = true;
      
      if (isIPAD && sVer.slice(0,5) == 'slide') {
        var iLeft=bArgs[1], iTop=bArgs[2], iWd=bArgs[3], iHi=bArgs[4];
        var iGapX = Math.floor((docView.clientWidth - iWd)/2 - iLeft + 0.5);
        var iGapY = Math.floor((docView.clientHeight - iHi)/2 - iTop + 0.5);
        slideFrm.style.left = iGapX + 'px';
        slideFrm.style.top = iGapY + 'px';
      }
    }
  });
  
  getDCF_().regist('showSlideDoc',openOneDoc);
  
  getDCF_().regist('switchFullScreen', function(bArgs) {
    var oldState = isEnterFS_;
    var sFlag = bArgs[0] || 'none';
    if (sFlag == 'none')
      return oldState;
    
    var node = document.querySelector('div.to-fullscreen');
    if (node) {
      if (sFlag == 'enter') {
        if (!isEnterFS_)
          switchFullScreen({'target':node});
      }
      else if (sFlag == 'exist') {
        if (isEnterFS_)
          switchFullScreen({'target':node});
      }
      else switchFullScreen({'target':node}); // 'switch'
    }
    return oldState;
  });

  var iUsrIndex = 0;
  setRelatedRepo(iUsrIndex,'config.json',false, function() {
    var param = parseParam(location.search);
    autoOpenURL = decodeURIComponent(param.opendoc || '');
    
    var rootRepo_ = '//' + docConfig.user_name + '.github.io/' + docConfig.repos_name;
    for (var i=0; i < 2; i++) {
      var b = (i==0?docConfig.builtin_repos:docConfig.imported_repos) || [];
      var sUser = docConfig.user_name;
      for (var i2=0,item2; item2=b[i2]; i2++) { // item2 is: "repoName" or ["repoName","repoDesc"]
        var sUrl, repoDesc='';
        if ((item2 instanceof Array) && item2.length == 2) {
          sUrl = item2[0];
          repoDesc = item2[1];
        }
        else if (typeof item2 == 'string')
          sUrl = item2;
        else continue;
        
        var repoName = sUrl.split('/').pop();
        if (i == 0) {
          if (repoName == docConfig.repos_name)
            continue;
          sUrl = '/' + repoName; // if builtin repo force use '/repoName'
        }
        else {
          if (sUrl[sUrl.length-1] == '/')
            sUrl = sUrl.slice(0,sUrl.length-1);
          if (rootRepo_ == sUrl) continue;
        }
        var sPath = sUrl + '/';
        sUrl += '/config.json';
        
        iUsrIndex += 1;
        addUserItem(0,'',repoName,repoDesc,sPath,false,iUsrIndex);
        setRelatedRepo(iUsrIndex,sUrl,!repoDesc);
        
        if (iUsrIndex >= 64) break; // can not add too many user-repo
      }
    }
  });
},false);

})();
