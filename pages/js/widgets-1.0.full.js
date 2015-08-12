// widgets-1.0.js
// designed by Wayne Chan

var PINP_HOST_DOMAIN = 'www.pinp.me';

require.config({
  paths: {
    "basic10": "/software/pages/js/basic10",
  }
});

define(['basic10'], function(R) {
//===================================

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

function parseParam(sArg) {
  if (sArg) sArg = sArg.slice(1); // remove '?'
  var d={}, b=sArg.split('&');
  for (var i=b.length-1; i >= 0; i--) {
    var item=b[i], b2=item.split('='), s1=(b2[0]||'').trim();
    if (s1) d[s1] = b2[1] || '';
  }
  return d;
}

function getAsynRequest(sRequest,func,bInfo) {
  var xmlHttp = null;
  if (window.XMLHttpRequest)      // Firefox, Opera, IE7, etc
    xmlHttp = new XMLHttpRequest();
  else if (window.ActiveXObject)  // IE6, IE5
    xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
    
  if (xmlHttp != null) {
    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4) {
        var s = xmlHttp.responseText;
        if (xmlHttp.status == 200) {
          xmlHttp = null;
          if (func) func(s);
        }
        else {
          xmlHttp = null;
          if (bInfo) {
            bInfo.push(s);
            if (func) func('');
          }
        }
      }
    };
    xmlHttp.open("GET",sRequest,true);
    xmlHttp.send(null);
  }
}

function htmlEncode(s) {
  return s.replace(/</gm,'&lt;').replace(/>/gm,'&gt;');
}

function location__(href) {
  var location = document.createElement('a');
  location.href = href;
  if (location.host == '')
    location.href = location.href;
  return location;
}

var Toolbar = {
  __base__: R.BaseWidget,
  __widget__: ['wdProjList','wdPopDlgForm','wdMarkdown','wdResPanel'],
  
  init: function(cfg) {
    this._super(cfg);
    var self = this;
    
    var inDesign = (self.get('__debug__') || 0) & 0x01;
    if (inDesign) return;
    
    var nodes = self.wd.querySelectorAll('.head-toolbar > img');
    for (var i=0,node; node=nodes[i]; i++) {
      if (node.name == 'refresh') {
        node.onclick = function(event) {
          if (githubSess)
            self.wdProjList.r.gotoHome();
          else self.wdProjList.r.fire('refresh');
        };
      }
      else if (node.name == 'CreatePrj') {
        node.onclick = function(event) {
          self.wdPopDlgForm.r.createPrj();
        };
      }
      else if (node.name == 'RemovePrj') {
        node.onclick = function(event) {
          self.wdPopDlgForm.r.removePrj();
        };
      }
      else if (node.name == 'CreateSubPrj') {
        node.onclick = function(event) {
          self.wdPopDlgForm.r.createSubPrj();
        };
      }
      else if (node.name == 'EditPrj') {
        node.onclick = function(event) {
          var b = self.wdProjList.r.getCurrProj();
          if (b)
            self.wdMarkdown.r.startEditDoc(b);
          else alert('Please select a project node first');
        };
      }
      else if (node.name == 'SharePrj') {
        node.onclick = function(event) {
          self.wdPopDlgForm.r.startShareDoc();
        };
      }
      else if (node.name == 'SubmitPrj') {
        node.onclick = function(event) {
          self.wdMarkdown.r.startSubmitDoc();
        };
      }
      else if (node.name == 'TransPrj') {
        node.onclick = function(event) {
          self.wdMarkdown.r.startTransDoc();
        };
      }
    }
    
    var collapseNode = self.wd.querySelector('img.head-nohover');
    collapseNode.classList.add('head-rotate');
    
    self.on('ssHeadbarClick', function(event) {
      var targ = event.original.target;
      if (targ && targ.nodeName == 'DIV' && targ.classList.contains('head-toolbar')) {
        self.wdMarkdown.r.tryUnselectSS();
      }
    });
    
    self.on('ssResToolClick', function(event) {
      var targ = event.original.target;
      if (!targ) return;
      
      var sName = targ.getAttribute('name');
      if (sName == 'collapse') {
        if (targ.classList.contains('head-rotate')) {
          targ.classList.remove('head-rotate');
          self.wdResPanel.r.switch2Narrow();
          self.wdPopDlgForm.r.setPopupRightWd(28);
        }
        else {
          targ.classList.add('head-rotate');
          self.wdResPanel.r.switch2Wide();
          self.wdPopDlgForm.r.setPopupRightWd(300);
        }
      }
      else {
        if (!collapseNode.classList.contains('head-rotate')) {
          collapseNode.classList.add('head-rotate');
          self.wdResPanel.r.switch2Wide();
        }
        
        if (sName == 'syntax')
          self.wdResPanel.r.fire('showSyntax');
        else if (sName == 'files')
          self.wdResPanel.r.fire('showFolder');
      }
    });
  },
  
  selectProj: function(sProj,sAcl) {
    var ss = sAcl + ': <a target="_blank" href="/' + sProj + '/">' + sProj + '</a>';
    if (ss == this.data.infoTitle) return;
    var infoId = this.data.infoId + 1;
    
    this.data.infoId = infoId;
    this.data.infoTitle = ss;
    this.update();
    
    var self = this;
    setTimeout(function() {
      if (infoId == self.data.infoId) { // not switch to other nodes
        self.data.infoTitle = self.data.editingTitle;
        self.update();
      }
    },8000);
  },
  
  editProj: function(sType,sProj,sAcl) {
    if (sType == 'blog') {
      this.data.submitWd = "32px";
      this.data.transWd = "32px";
    }
    else if (sType == 'sshow') {
      this.data.submitWd = "32px";
      this.data.transWd = "0px";
    }
    
    var ss = sAcl + ': ' + sProj;
    this.data.editingTitle = ss;
    this.data.infoTitle = ss;
    this.update();
  },
  
  clearInfo: function() {
    this.data.editingTitle = '';
    this.data.infoTitle = '';
    this.update();
  },
};

var orgPrjData = [];  // sorted by title
var orgPrjSub  = {};  // {alias_cate_prj:[[sSubPrj,hasThumb],...]}, reset when refresh

var githubToken = '';
var githubSess  = parseParam(location.search).info || '';
var githubUser  = {};
var githubCfgSha = {};
var githubRootCfg = {};
var githubHomeCfg = {};
var githubCfgList = [];  // hold builtin repo (from config.json)

function gh3ErrDesc(err,res) {
  if (res.readyState < 4)
    return res.statusText || 'request abort';
  else return err.message || res.statusText || 'error code:' + res.status;
}

function ajaxErrDesc(res,errMethod) {
  if (res.readyState < 4)
    return res.statusText || 'request abort';
  else {
    var s = '';
    if (errMethod && res.responseJSON) // if reply in json format, and json[errMethod] is err-desc
      s = res.responseJSON[errMethod];
    return s || res.statusText || 'error code:' + res.status;
  }
}

function githubGetCfg(sAlias) {
  if (githubHomeCfg.repos_name === sAlias)
    return githubHomeCfg;
  else return _.find(githubCfgList, function(item) {
    return item.repos_name === sAlias;
  });
}

function fileLoader() {
  this.succ = 0;
  this.bErr = [];
  this.bOut = [];
}

fileLoader.prototype = {
  checkRet: function() {
    if (this.succ + this.bErr.length >= this.bOut.length) { // all finished
      this.callback(this.bErr,this.bOut);
    }
  },
  
  start: function(bList,callback) {
    this.callback = callback;
    
    var iCount = 0;
    var self = this;
    
    var getAjaxFn = function(idx,sRepo_,sDesc_) {
      return function() {
        var aFile = new Gh3.File({path:'config.json'},githubUser,sRepo_,'gh-pages');
        aFile.fetchContent( function(err, res) {
          if (!self) return;
          if (err) {
            self.bErr.push(sRepo_);
            self.checkRet();
            return;
          }
          
          var dJson = null;
          try {
            var sRaw = aFile.getRawContent();
            if (sRaw && sRaw.charCodeAt(0) == 0xFEFF) // remove DOM head
              sRaw = sRaw.slice(1);
            dJson = JSON.parse(sRaw);
          } catch(e) {
            alert('JSON format error: ' + sRepo_ + '/config.json');
            self.bErr.push(sRepo_);
            self.checkRet();
            return;
          }
          
          githubCfgSha['/' + sRepo_ + '/config.json'] = aFile.sha;
          self.bOut[idx] = [sRepo_,sDesc_,dJson];
          self.succ += 1;
          self.checkRet();
        });
      };
    };
    
    var bFunc = [];
    _.each(bList, function(item){
      var sRepo='', sDesc='';
      if (item instanceof Array && item.length == 2) {
        sRepo = item[0];
        sDesc = item[1];
      }
      else if (typeof item == 'string')
        sRepo = item;
      
      if (sRepo) {
        self.bOut.push(sRepo);
        bFunc.push(self.getAjaxFunc(iCount,sRepo,sDesc));
        iCount += 1;
      }
    });
    
    setTimeout(function() {
      if (self.succ + self.bErr.length < self.bOut.length) // some still not ready when timeout
        callback(self.bErr,self.bOut);
      self = null;
    },60000);  // max wait 60 seconds
    
    _.each(bFunc,function(fn){fn()});  // start run ajax
  },
};

var ProjList = {
  __base__: R.BaseWidget,
  __widget__: ['wdPopDlgForm','wdSplitterA','wdMarkdown','wdResPanel','wdToolbar','wdPreviewArea'],
  
  init: function(cfg) {
    this._super(cfg);
    var self = this;
    
    var inDesign = (self.get('__debug__') || 0) & 0x01;
    if (inDesign) return;
    
    var sUA = navigator.userAgent.toLowerCase();
    if (sUA.match(/trident.*rv[ :]*([\d.]+)/) || sUA.match(/msie ([\d.]+)/))
      window.WEB_IE_BROWSER = true;
    else window.WEB_IE_BROWSER = false;
    
    var processErrName = '';
    var processErrDesc = '';
    
    var notifyGitUser = function(sSess) {
      $.ajax( { type: 'GET',
        url: '//' + PINP_HOST_DOMAIN + '/software/pages/blogger/has_login.action',
        data: { info: sSess,
          login: githubUser.login,
          uid: githubUser.id,
          type: githubUser.type == 'User'? 'user': 'orgn',
        },
        success: function(res) {
          // do nothing
        },
        error: function(res) {
          // console.log('error:',ajaxErrDesc(res));
        },
      });
    };
    
    var getGitUserInfo = function(sToken,sSess,nextStep) {
      $.ajax({ type: 'GET',
        url: 'https://api.github.com/user?access_token=' + sToken,
        
        success: function(res) {
          githubUser = new Gh3.User(res.login,res);
          
          $.ajax({ type: 'GET',
            url: '//' + githubUser.login + '.github.io/software/blogger10.json',
            
            success: function(res) { // exists 'software' repo
              githubRootCfg = res;
              notifyGitUser(sSess);
              nextStep();
            },
            
            error: function(res) {
              if (res.status == '404') {
                $.ajax({ type: 'GET',
                  url: 'https://api.github.com/user/orgs?access_token=' + sToken,
                  success: function(res) {
                    if (!(res instanceof Array) || res.length != 1) {
                      processErrName = 'REPO_NOT_READY';
                      processErrDesc = 'no proper organization found';
                      nextStep();
                    }
                    else {
                      var dOrg = res[0];
                      githubUser = new Gh3.User(dOrg.login);
                      githubUser.fetch( function(err,res) {
                        if (err) {
                          processErrName = 'REPO_NOT_READY';
                          processErrDesc = "unrecognized user: " + dOrg.login;
                          nextStep();
                        }
                        else { // success, by organization
                          $.ajax({ type: 'GET',
                            url: '//' + githubUser.login + '.github.io/software/blogger10.json',
                            success: function(res) { // exists 'software' repo
                              githubRootCfg = res;
                              notifyGitUser(sSess);
                              nextStep();
                            },
                            error: function(res) {
                              processErrName = 'GET_USER_ERR';
                              processErrDesc = 'read /software/blogger10.json failed (' + ajaxErrDesc(res) + ')';
                              nextStep();
                            },
                          });
                        }
                      });
                    }
                  },
                  error: function(res) {
                    processErrName = 'GET_USER_ERR';
                    processErrDesc = 'get organization failed (' + ajaxErrDesc(res,'message') + ')';
                    nextStep();
                  },
                });
              }
              else {
                processErrName = 'GET_USER_ERR';
                processErrDesc = 'read /software/blogger10.json failed (' + ajaxErrDesc(res) + ')';
                nextStep();
              }
            },
          });
        },
        
        error: function(res) {
          processErrName = 'GET_USER_ERR';
          processErrDesc = 'get github user failed (' + ajaxErrDesc(res,'message') + ')';
          nextStep();
        },
      });
    };
    
    if (githubSess) {
      githubToken = getCookie__('git_tok') || '';
      if (githubToken) {
        var bTmp = location.pathname.split('/');
        bTmp.pop();
        delCookie__('git_tok',bTmp.join('/'));
        
        Gh3.access_token = githubToken;
        
        getGitUserInfo(githubToken,githubSess, function() {
          if (processErrName) {
            self.data.errMsg = 'load config failed';
            self.update();
            alert(processErrName + ': ' + processErrDesc);
          }
          else self.initGitLogin();
        });
      }
      else { // maybe refresh
        $.ajax( { type: 'GET',
          url: '//' + PINP_HOST_DOMAIN + '/software/pages/blogger/get_token.action?info=' + githubSess,
          success: function(res) {
            if (res instanceof Array && res.length) {
              githubToken = res[0];
              getGitUserInfo(githubToken,githubSess, function() {
                if (processErrName) {
                  self.data.errMsg = 'load config failed';
                  self.update();
                  alert(processErrName + ': ' + processErrDesc);
                }
                else self.initGitLogin();
              });
            }
            else alert('Query authorization failed!');
          },
          error: function(res) {
            alert('Query authorization failed: ' + ajaxErrDesc(res));
          },
        });
      }
    }
    
    var rescanPrjList = function(bList,currCate) {
      var nodes = self.wd.querySelectorAll('.prj-item.prj-sub2-item');
      for (var i=0,item; item=nodes[i]; i++) {
        item.parentNode.removeChild(item); // it is added by manual
      }
      nodes = self.wd.querySelectorAll('.prj-item.prj-show');
      for (var i=0,item; item=nodes[i]; i++) {
        item.classList.remove('prj-show');
      }
      nodes = self.wd.querySelectorAll('.prj-item.prj-selected');
      for (var i=0,item; item=nodes[i]; i++) {
        item.classList.remove('prj-selected');
      }
      nodes = self.wd.querySelectorAll('.prj-item.prj-selected2');
      for (var i=0,item; item=nodes[i]; i++) {
        item.classList.remove('prj-selected2');
      }
      
      var dCates = {};
      for (var i=0,item; item=orgPrjData[i]; i++) {
        var sTitle = item.title;
        if (currCate && sTitle.indexOf(currCate) != 0) continue;
        
        var bTmp = sTitle.split('/');
        var i1 = sTitle.indexOf('$$',currCate.length); // currCate:  ''  '$$cate/'
        var i2 = sTitle.indexOf('/',currCate.length);
        if (i1 == currCate.length && i2 > i1) {
          var i3 = sTitle.indexOf('/$$',currCate.length);
          var sSubCate = currCate + sTitle.slice(i1,i2+1);
          if (!dCates[sSubCate]) {
            // forward scan sub-cate of current cate
            var sLogoUrl = 'folder.png', i4 = i, sTitle_ = sTitle;
            while (true) {
              if (sTitle_.indexOf('$$',sSubCate.length) == sSubCate.length) {
                sLogoUrl = 'folder_sub.png';
                break;
              }
              
              i4 += 1; if (i4 >= orgPrjData.length) break;
              sTitle_ = orgPrjData[i4].title;
              if (!sTitle_ || sTitle_.indexOf(sSubCate) != 0) break;
            }
            
            dCates[sSubCate] = true;
            bList.push({ isFolder: true,
              hasThumb: false,
              logoUrl: sLogoUrl,
              itemCls: 'prj-cate-folder',
              title: sTitle.slice(i1+2,i2),
              alias: item.alias,
              cateProj: item.alias + '/' + sSubCate,
            });
          }
          if (i3 != i2) { // is sub-project
            var sLogoUrl = item.hidden? 'prj_unrelease.png': (item.hasThumb? 'prj_item.png':'prj_item_web.png');
            bList.push({ isFolder: false,
              hasThumb: item.hasThumb,
              hasSub: item.hasSub,
              logoUrl: sLogoUrl,
              itemCls: 'prj-sub-item',
              title: bTmp[bTmp.length-1],
              alias: item.alias,
              cateProj: item.alias + '/' + sTitle,
              canWrite: item.canWrite,
              // prjTime: item.time,
              // prjHidden: item.hidden,
              prjType: item.type,
              prjSize: item.size,
              prjAcl: item.acl,
            });
          }
          // else, no need add
        }
        else if (i1 < 0 && i2 < 0 && sTitle.length > currCate.length) { // is curr-project
          var sLogoUrl = item.hidden? 'prj_unrelease.png': (item.hasThumb? 'prj_item.png':'prj_item_web.png');
          var sTitle_ = sTitle.slice(currCate.length);
          bList.push({ isFolder: false,
            hasThumb: item.hasThumb,
            hasSub: item.hasSub,
            logoUrl: sLogoUrl,
            itemCls: 'prj-curr-item',
            title: sTitle_,
            alias: item.alias,
            cateProj: item.alias + '/' + sTitle,
            canWrite: item.canWrite,
            // prjTime: item.time,
            // prjHidden: item.hidden,
            prjType: item.type,
            prjSize: item.size,
            prjAcl: item.acl,
          });
        }
        // else, ignore
      }
    };
    
    var clickCateNode = function(node) {
      var last = self.wd.querySelector('.prj-item.prj-selected');
      if (last) {
        if (last === node) return;
        last.classList.remove('prj-selected');
      }
      var nodes = self.wd.querySelectorAll('.prj-item.prj-show');
      for (var i=0,item; item=nodes[i]; i++) {
        item.classList.remove('prj-show');
      }
      nodes = self.wd.querySelectorAll('.prj-item.prj-selected2');
      for (var i=0,item; item=nodes[i]; i++) {
        item.classList.remove('prj-selected2');
      }
      nodes = self.wd.querySelectorAll('.prj-item.prj-sub2-item');
      for (var i=0,item; item=nodes[i]; i++) {
        item.parentNode.removeChild(item);
      }
      
      node.classList.add('prj-selected');
      var sTitle = node.getAttribute('title');
      if (!sTitle) return;
      node = node.nextElementSibling;
      while (node && node.classList.contains('prj-sub-item')) {
        if (node.getAttribute('title').indexOf(sTitle) != 0)
          break;
        node.classList.add('prj-show');
        node = node.nextElementSibling;
      }
    };
    
    var clickPrjItemNode = function(node,idx) {
      var dCfg = self.data.items[idx];
      if (!dCfg) return;
      var sPath = dCfg.cateProj;
      if (!sPath) return;
      var i = sPath.indexOf('/');
      if (i <= 0) return;
      var sAliasPath = sPath;
      var sAlias = sPath.slice(0,i);
      sPath = sPath.slice(i+1); // remove 'alias/'
      
      var nodes = self.wd.querySelectorAll('.prj-item.prj-selected2');
      for (var i=0,item; item=nodes[i]; i++) {
        item.classList.remove('prj-selected2');
      }
      if (!dCfg.hasSub) {
        node.classList.add('prj-selected2');
        return;
      }
      
      var nextProc = function(b) {
        if (!node.parentNode) return; // the node has removed
        if (dCfg !== self.data.items[idx]) return; // has changed
        if (b.length <= 0) return;
        
        var sAcl = dCfg.prjAcl || 'private';
        var tailNode = node.nextElementSibling;
        for (var i=0,item; item=b[i]; i++) {
          var sTitle_ = sAliasPath + '/$$/' + item[0];
          if (self.wd.querySelector('.prj-item[title="' + sTitle_ + '"]'))
            continue;  // maybe click twice, avoid add duplicate node
          
          var hasThumb = item[1];
          var sLogoUrl = hasThumb? 'prj_item.png': 'prj_item_web.png';
          var newNode = document.createElement('div');
          newNode.setAttribute('title',sTitle_);
          newNode.setAttribute('allow',sAcl);
          newNode.setAttribute('alias',sAlias);
          newNode.setAttribute('thumb',hasThumb?'1':'0');
          newNode.className = 'prj-item prj-sub2-item';
          newNode.innerHTML = '<img class="noselect-txt" draggable="true" src="' + sLogoUrl + '"><span draggable="true">' + htmlEncode(item[0]) + '</span>';
          if (tailNode)
            node.parentNode.insertBefore(newNode,tailNode);
          else node.parentNode.appendChild(newNode);
        }
      };
      
      node.classList.add('prj-selected2');
      var nextNode = node.nextElementSibling;
      if (nextNode && nextNode.classList.contains('prj-sub2-item'))
        return; // already inserted
      
      var bSubPrj = orgPrjSub[sAliasPath];
      if (bSubPrj instanceof Array) {
        nextProc(bSubPrj);
      }
      else {
        if (githubSess) {
          var bSubPath = [];
          var nextStep = function() {
            if (bSubPath.length == 0) {
              dCfg.hasSub = false;
              orgPrjSub[sAliasPath] = [];
            }
            else {
              var b = [];
              _.each(bSubPath,function(item){b.push([item,false])}); // as no thumbnail
              orgPrjSub[sAliasPath] = b;
              nextProc(b);
            }
          };
          
          var aDir = new Gh3.Dir({path:sPath+'/$$'},githubUser,sAlias,'gh-pages');
          aDir.fetchContents( function(err, res) { // https://api.github.com/repos/<user>/<repo>/contents/$$doc
            if (err) {
              if (res.status != 404) {
                alert('List files (' + sPath + '/$$/) failed: ' + err.message);
                return;
              }
              nextStep();
              return;
            }
            
            aDir.eachContent( function(content) {
              if (content.type == 'dir') {
                var sName = content.name;
                if (sName[0] != '.' && sName[0] != '$')
                  bSubPath.push(sName);
              }
            });
            nextStep();
          });
          return;
        }
      }
    };
    
    self.on('ssPrjClick', function(event) {
      var targ = event.original.target, node = null;
      while (targ) {
        if (targ.nodeName == 'DIV') {
          if (targ.classList.contains('web-item'))
            break;
          if (targ.classList.contains('prj-item')) {
            node = targ;
            break;
          }
        }
        targ = targ.parentNode;
      }
      
      if (node) {
        var nodes = self.wd.querySelectorAll('.prj-item.prj-selected3');
        for (var i=0,item; item=nodes[i]; i++) {
          item.classList.remove('prj-selected3');
        }
        
        if (node.classList.contains('prj-cate-folder'))
          clickCateNode(node);
        else if (node.classList.contains('prj-sub-item') || node.classList.contains('prj-curr-item')) {
          var sTitle = node.getAttribute('title');
          if (sTitle) {
            var sAllow = node.getAttribute('allow') || 'private';
            self.wdToolbar.r.selectProj(sTitle,sAllow);
          }
          
          if (node.classList.contains('prj-selected2'))
            return;
          
          var sName = node.getAttribute('name');
          if (sName && sName.indexOf('prj-') == 0) {
            var idx = parseInt(sName.slice(4));
            clickPrjItemNode(node,idx);
          }
        }
        else if (node.classList.contains('prj-sub2-item')) {
          node.classList.add('prj-selected3');
          var sTitle = node.getAttribute('title');
          if (sTitle) {
            // try adjust selected project
            var nodes = self.wd.querySelectorAll('.prj-item.prj-selected2');
            for (var i=0,item; item=nodes[i]; i++) {
              item.classList.remove('prj-selected2');
            }
            var owner = node.previousElementSibling;
            while (owner) {
              if (owner.classList.contains('prj-sub-item') || owner.classList.contains('prj-curr-item')) {
                owner.classList.add('prj-selected2');
                break;
              }
              else if (!owner.classList.contains('prj-sub2-item'))
                break;
              owner = owner.previousElementSibling;
            }
            
            // show project name in toolbar
            var sAllow = node.getAttribute('allow') || 'private';
            self.wdToolbar.r.selectProj(sTitle,sAllow);
          }
        }
        // else, ignore others
      }
    });
    
    self.on('ssPrjDblclick', function(event) {
      var lastTarg = event.original.target;
      setTimeout( function() { // let double click take affect after click
        var node=null, targ=lastTarg;
        while (targ) {
          if (targ.nodeName == 'DIV') {
            if (targ.classList.contains('web-item'))
              break;
            if (targ.classList.contains('prj-item')) {
              node = targ;
              break;
            }
          }
          targ = targ.parentNode;
        }
        if (!node) return;
        
        var bList = [], sCate = '', changed = false, oldCate = '';
        var sAlias = node.getAttribute('alias');
        if (!sAlias) return;
        if (node.classList.contains('prj-cate-folder')) {
          if (!node.classList.contains('prj-selected')) return;
          
          sCate = node.getAttribute('title');
          if (sCate.indexOf(sAlias + '/') == 0)
            sCate = sCate.slice(sAlias.length+1);
          else sCate = '';
          changed = true;
        }
        else if (node.classList.contains('prj-up-folder')) {
          oldCate = self.data.currCate;
          var b = oldCate.split('/$$');
          
          if (githubSess && b.length <= 2) // root-cate from github should be: repo/$$cate
            sCate = '';
          else if (b.length <= 1)
            sCate = '';
          else {
            b.pop();
            sCate = b.join('/$$') + '/';
          }
          changed = true;
        }
        else if (node.classList.contains('prj-sub-item') || node.classList.contains('prj-curr-item') || node.classList.contains('prj-sub2-item')) {
          var sTitle = node.getAttribute('title');
          if (sTitle) {
            var sAllow = node.getAttribute('allow') || 'private';
            self.wdResPanel.r.selectProj(sTitle,sAllow);
          }
        }
        
        if (changed) {
          self.data.items = bList;
          self.data.currCate = sCate;
          rescanPrjList(bList,sCate);
          self.update();
          
          if (sCate) {
            var upNode = self.wd.querySelector('.prj-item.prj-up-folder');
            if (upNode) {
              upNode.setAttribute('title',sAlias + '/' + sCate);
              upNode.setAttribute('alias',sAlias);
            }
          }
          if (oldCate) {
            setTimeout(function() {
              var node = self.wd.querySelector('.prj-cate-folder[title="' + sAlias + '/' + oldCate + '"]');
              if (node)
                clickCateNode(node);
            },0);
          }
        }
      },0);
    });
    
    var prjItemDragStart = function(event) {
      var targ = event.target;
      while (targ) {
        if (targ.nodeName == 'DIV') {
          if (targ.classList.contains('prj-item'))
            break;
          else if (targ.classList.contains('prj-root-node'))
            return;
        }
        targ = targ.parentNode;
      }
      
      var iFlag=0, sTitle='', hasThumb=false, iPrjType=1;
      if (targ.classList.contains('prj-sub-item')) {
        iFlag = 1;  // normal project
        sTitle = targ.getAttribute('title') || '';
        iPrjType = (sTitle.slice(sTitle.length-5)=='.blog'?3:1);
        
        var sName = targ.getAttribute('name');
        if (sName && sName.indexOf('prj-') == 0) {
          var idx = parseInt(sName.slice(4));
          var dCfg = self.data.items[idx];
          if (dCfg) {
            hasThumb = dCfg.hasThumb;
            iPrjType = dCfg.prjType;
          }
        }
      }
      else if (targ.classList.contains('prj-sub2-item')) {
        iFlag = 2;  // sub-project
        sTitle = targ.getAttribute('title') || '';
        hasThumb = parseInt(targ.getAttribute('thumb') || '0');
        iPrjType = (sTitle.slice(sTitle.length-5)=='.blog'?3:1);
      }
      var imgNode = (iFlag? targ.querySelector('img'): null);
      
      if (iFlag && sTitle && imgNode) {
        setCookie__('drag_task','put_prj');
        var sText = 'project,' + (hasThumb?'1':'0') + ',' + iPrjType;
        event.dataTransfer.effectAllowed = 'copy';
        event.dataTransfer.setData(window.WEB_IE_BROWSER?'text':'text/args',sText + ',' + sTitle);
        if (event.dataTransfer.setDragImage)   // no setDragImage in IE
          event.dataTransfer.setDragImage(imgNode,0,0);
      }
    };
    
    self.on('ssDragStart', function(event) {
      self.wdMarkdown.r.saveCaretPos();
      prjItemDragStart(event.original);
    });
    
    self.on('ssDragEnd', function(event) {
      delCookie__('drag_task');
    });
    
    self.on('refreshShow', function(event) {
      var oldCate = '';
      var node = self.wd.querySelector('.prj-cate-folder.prj-selected');
      if (node)
        oldCate = node.getAttribute('title');
      
      var bList=[], sCate=self.data.currCate;
      self.data.items = bList;  // self.data.currCate not changed
      rescanPrjList(bList,sCate);
      self.update();
      
      if (sCate && node) {
        var sAlias = node.getAttribute('alias');
        var upNode = self.wd.querySelector('.prj-item.prj-up-folder');
        if (upNode) {
          upNode.setAttribute('title',sAlias + '/' + sCate);
          upNode.setAttribute('alias',sAlias);
        }
      }
      if (oldCate) {
        setTimeout(function() {
          var node = self.wd.querySelector('.prj-cate-folder[title="' + oldCate + '"]');
          if (node)
            clickCateNode(node);
        },0);
      }
    });
    
    self.on('refresh', function(event) {
      // do nothing
    });
    
    var rightBody_ = self.wdMarkdown.parentNode.parentNode.parentNode;
    var resizeFun_ = function(leftWidth,detaX) {
      var hi = Math.max(self.wd.clientHeight,self.wdMarkdown.parentNode.clientHeight + self.wdPreviewArea.clientHeight);
      hi = Math.max(window.innerHeight - self.wdToolbar.parentNode.clientHeight,hi);
      self.wdSplitterA.style.height = hi+ 'px';
      
      var iMax = rightBody_.parentNode.clientWidth - 4 - 60 - self.wdResPanel.clientWidth;
      var iX = Math.max(1,Math.min(iMax,leftWidth + detaX));
      var rightWd = rightBody_.parentNode.clientWidth - self.wdSplitterA.clientWidth - iX;
      self.wd.parentNode.style.width = iX + 'px';
      rightBody_.style.width = rightWd + 'px';
      
      if (self.wdMarkdown.r)    // maybe r not ready yet
        self.wdMarkdown.r.fire('resized');
      if (self.wdPreviewArea.r) // maybe r not ready yet
        self.wdPreviewArea.r.fire('resized');
    };
    
    document.body.addEventListener('mousemove', function(event){
      var d = self.wdSplitterA.r.data;
      if (d.inMoving) {
        var iX = event.clientX, detaX = iX-d.moveFromX;
        if (!d.moved && Math.abs(detaX) >= 4)
          d.moved = true;
        if (d.moved)
          resizeFun_(d.leftWidth,detaX);
      }
    },false);
    
    document.body.addEventListener('mouseup', function(event){
      var d = self.wdSplitterA.r.data;
      if (d.inMoving) {
        var detaX = event.clientX-d.moveFromX;
        if (d.moved)
          resizeFun_(d.leftWidth,detaX);
        d.inMoving = false;
      }
    },false);
    
    document.getElementById('web-body')['on-resize'] = function(node,noItemResize) {
      resizeFun_(self.wd.parentNode.clientWidth,0);
    };
    
    self.on('resized',function(event) {
      resizeFun_(self.wd.parentNode.clientWidth,0);
    });
    
    self.on('resized2',function(event) {
      resizeFun_(self.wd.parentNode.clientWidth,self.data.resizeGap || 0);
    });
  },
  
  initGitLogin: function() {
    if (!githubUser.login) return;
    var self = this;
    
    self.data.errMsg = 'loading...';
    self.update();
    
    githubCfgSha = {}; githubCfgList = [];
    orgPrjData = []; orgPrjSub = {};
    
    var stepErrName = '';
    var stepErrDesc = '';
    
    // has read config.builtin_repos, next try stepup into tree format
    var setupConfig = function(bOut) {
      for (var i=-1; i < bOut.length; i++) {
        var item=githubHomeCfg, sAlias='', sDesc='';
        if (i >= 0) {
          var bTmp = bOut[i];
          sAlias = bTmp[0]; item = bTmp[2];
          if (sAlias !== item.repos_name)
            item.repos_name = sAlias;
          sDesc = bTmp[1] || sAlias;
          
          githubCfgList.push(item);
        }
        else {
          sAlias = item.repos_name;
          sDesc = item.repos_desc || '';
        }
        
        var b=item.doc_list;
        b.sort( function(a,b) {
          if (a.path > b.path) return 1;
          else if (a.path === b.path) return 0;
          else return -1;
        });
        
        _.each(b, function(item2) {
          var sTitle=item2.path, sExt=sTitle.slice(-5); // sTitle is cateProj
          var iFlag=item2.flag||3, readOnly=(iFlag&0xFF)!=3, isHidden=(iFlag&0x100)!=0;
          var aObj = { title:sTitle, alias:sAlias, time:item2.modify_at, hidden:isHidden?1:0,
                       type:sExt=='.blog'?3:1, size:0, acl:'public', canWrite:readOnly?0:1, };
          aObj.hasSub = true;  // dynamic checking
          aObj.hasThumb = !!item2.thumb;
          orgPrjData.push(aObj);
        });
      }
      
      self.data.currCate = '';
      self.data.friendGroup = []; // not use
      if (orgPrjData.length == 0) {
        self.data.errMsg = 'No project exists';
        self.update();
      }
      else {
        self.data.errMsg = '';
        self.data.currCate = '';
        self.fire('refreshShow');
      }
    };
    
    // has read home-repo/config.json, next try read config.builtin_repos
    var flowNext = function() {
      if (stepErrName) {
        self.data.errMsg = 'loading config failed';
        self.update();
        alert(stepErrName + ': ' + stepErrDesc);
      }
      else {
        var bIn=githubHomeCfg.builtin_repos || [], loader=new fileLoader();
        if (bIn.length == 0) {
          self.data.errMsg = '';
          self.update();
          setupConfig([]);
          return;
        }
        
        loader.start(bIn, function(bErr,bOut) {
          if (bErr.length) {
            var sErr = 'load failed'
            _.each(bErr,function(item) {
              sErr += ', ' + item + '/config.json';
            });
            
            self.data.errMsg = 'loading config failed';
            self.update();
            alert(sErr);
            return;
          }
          
          for (var i=0,item; item=bOut[i]; i++) { // item is [sRepo,sDesc,sJson] or sRepo
            if (typeof item == 'string') { // when item is sRepo means load failed
              self.data.errMsg = 'loading config failed';
              self.update();
              
              alert('load file failed: ' + item + '/config.json');
              return;
            }
          }
          
          self.data.errMsg = '';
          self.update();
          setupConfig(bOut);
        });
      }
    };
    
    var sRepo_ = githubRootCfg.home_repository;
    var aFile = new Gh3.File({path:'config.json'},githubUser,sRepo_,'gh-pages');
    aFile.fetchContent( function(err, res) {
      if (err) {
        stepErrName = 'LOAD_FAILED';
        stepErrDesc = 'load config.json failed';
        flowNext();
        return;
      }
      
      var dJson = null;
      try {
        var sRaw = aFile.getRawContent();
        if (sRaw && sRaw.charCodeAt(0) == 0xFEFF) // remove DOM head
          sRaw = sRaw.slice(1);
        dJson = JSON.parse(sRaw);
      } catch(e) {
        alert('JSON format error: ' + sRepo_ + '/config.json');
        stepErrName = 'LOAD_FAILED';
        stepErrDesc = 'load config.json failed';
        flowNext();
        return;
      }
      
      githubCfgSha['/' + sRepo_ + '/config.json'] = aFile.sha;
      githubHomeCfg = dJson;
      flowNext();
    });
  },
  
  addPrjNode: function(bRet) {
    if (bRet.length < 9) return;
    var sAlias=bRet[0], sPath=bRet[1];
    var obj = { title:sPath, alias:sAlias, time:bRet[2], type:bRet[3], size:bRet[4], 
        hidden:bRet[5], acl:bRet[6], canWrite:1, hasThumb:bRet[7], hasSub:bRet[8] };
    
    for (var i=0,item; item=orgPrjData[i]; i++) {
      if (sAlias == item.alias && sPath < item.title) {
        orgPrjData.splice(i,0,obj);
        obj = null;
        break;
      }
    }
    if (obj) orgPrjData.push(obj);
    
    this.data.errMsg = '';    // clear history error info
    this.fire('refreshShow');
  },
  
  afterSharePrj: function(sAlias,sPath,hasThumb) {
    for (var i=0,item; item=orgPrjData[i]; i++) {
      if (sAlias == item.alias && sPath == item.title) {
        item.hidden = 0;
        item.hasThumb = hasThumb;
        break;
      }
    }
    this.data.errMsg = '';
    this.fire('refreshShow');
  },
  
  addSubPrjNode: function(sAlias,bRet) { // bRet:[sCateProj,[sSubPrj,hasThumb],...]
    if (bRet.length < 2) return;  // at least have one sub project
    var sCatePrj = bRet.shift();
    if (!sCatePrj) return;
    
    for (var i=0,item; item=orgPrjData[i]; i++) {
      if (sAlias == item.alias && sCatePrj == item.title) {
        item.hasSub = true;
        break;
      }
    }
    
    var path_ = sAlias + '/' + sCatePrj;
    if (githubSess) {
      var bOld = orgPrjSub[path_];
      if (!bOld) {
        bOld = [];
        orgPrjSub[path_] = bOld;
      }
      for (var i=0,item; item=bRet[i]; i++) {
        bOld.push(item); // item is [sSubPrjName,hasThumb]
      }
    }
    else orgPrjSub[path_] = bRet;
    
    this.data.errMsg = '';    // clear history error info
    this.fire('refreshShow');
  },
  
  rmvPrjNode: function(sPath,bSubs,bNewSub) {
    var iPos = sPath.indexOf('/');
    if (iPos <= 0) return;
    var sAlias=sPath.slice(0,iPos), cateProj=sPath.slice(iPos+1);  // remove 'alias/'
    var resPrj = this.wdResPanel.r.data.currProj;
    
    var isWhole = !!bSubs[0];
    if (isWhole) { // remove whole
      for (var i=0,item; item=orgPrjData[i]; i++) {
        if (sAlias == item.alias && cateProj == item.title) {
          orgPrjData.splice(i,1);
          if (sPath == resPrj || (resPrj && resPrj.indexOf(sPath+'/') == 0))
            this.wdResPanel.r.resetFolder();
          break;
        }
      }
      delete orgPrjSub[sPath];
    }
    else {
      if (githubSess) {
        bNewSub = [];
        var b = orgPrjSub[sPath] || [];
        
        for (var i=0,item; item=b[i]; i++) {
          var found = false, hasThumb=false;
          for (var i2=1,item2; item2=bSubs[i2]; i2++) {
            if (item2 == item[0]) {
              found = true;
              break;
            }
          }
          if (!found)
            bNewSub.push([item[0],item[1]]);
        }
      }
      orgPrjSub[sPath] = bNewSub;
      
      if (resPrj && resPrj.indexOf(sPath+'/') == 0)
        this.wdResPanel.r.resetFolder(); // maybe sub-project not removed, also reset for safty
    }
    
    this.data.errMsg = '';    // clear history error info
    this.fire('refreshShow');
  },
  
  getCurrProj: function() {   // [[sAcl,sProj,canWrite],[sAcl,sSubProj,canWrite]]
    var bRet=[], sTitle='', dCfg = null;
    var node=this.wd.querySelector('.prj-item.prj-selected2');
    if (node) {
      sTitle = node.getAttribute('title');
      var sName = node.getAttribute('name');
      if (sName && sName.indexOf('prj-') == 0) {
        var idx = parseInt(sName.slice(4));
        dCfg = this.data.items[idx];
      }
    }
    
    if (sTitle && dCfg) {
      bRet.push([node.getAttribute('allow') || 'private',sTitle,dCfg.canWrite]);
      
      var node2 = this.wd.querySelector('.prj-item.prj-selected3');
      var sTitle2 = node2? node2.getAttribute('title'): '';
      if (sTitle2)
        bRet.push([node2.getAttribute('allow') || 'private',sTitle2,dCfg.canWrite]);
    }
    
    if (bRet.length)
      return bRet;
    else return null;
  },
  
  //--------
  resize2Width: function(iWd,onlyLess) {
    if (iWd < 8) return;
    var iCurr = this.wd.parentNode.clientWidth;
    if (onlyLess && iCurr < iWd) return;
    
    this.data.resizeGap = iWd - iCurr;
    this.fire('resized2');
  },
  
  gotoHome: function() {
    location.replace('//www.pinp.me/software/pages/blogger/editor.action');
  },
};

var SplitterA = {
  __base__: R.BaseWidget,
  __widget__: ['wdProjList'],
  
  init: function(cfg) {
    this._super(cfg);
    var self = this;
    
    var inDesign = (self.get('__debug__') || 0) & 0x01;
    if (inDesign) return;
    
    self.wd.addEventListener('mousedown',function(event){
      self.data.inMoving = true;
      self.data.moved = false;
      self.data.moveFromX = event.clientX;
      self.data.leftWidth = self.wdProjList.parentNode.clientWidth;
    },false);
  },
};

var Markdown = {
  __base__: R.BaseWidget,
  __widget__: ['wdToolbar','wdProjList','wdResPanel','wdPopDlgForm','wdPreviewArea'],
  
  init: function(cfg) {
    this._super(cfg);
    var self = this;
    
    var inDesign = (self.get('__debug__') || 0) & 0x01;
    if (inDesign) return;
    
    self.on('resized', function(event) {
      var wd = self.wd.parentNode.parentNode.clientWidth - self.wdResPanel.clientWidth - 1;
      self.wd.parentNode.style.width = wd + 'px';
    });
    
    self.on('ssChanged', function(event) {
      self.data.changed = true;
    });
    
    var insertText_ = function(sOut) {
      var txtNode = self.wd.querySelector('textarea.markdown-editor');
      if (!txtNode) return;
      txtNode.focus();
      
      setTimeout( function() {
        var iPos = self.data.caretPos;
        if (iPos >= 0) {
          var ss = txtNode.value;
          if (iPos > ss.length) iPos = ss.length;
          txtNode.value = ss.substring(0,iPos) + sOut + ss.substring(iPos);
        }
        else if (document.selection) {  // IE
          var sel = document.selection.createRange();
          if (sel) sel.text = sOut;
        }
        else if ('selectionStart' in txtNode) { // mozilla and others
          iPos = txtNode.selectionStart;
          var ss = txtNode.value;
          if (iPos > ss.length) iPos = ss.length;
          txtNode.value = ss.substring(0,iPos) + sOut + ss.substring(iPos);
        }
        else txtNode.value = sOut + '\n' + txtNode.value;
      },0);
    };
    
    var DCF = R.getDCF();
    DCF.regist('dropTextInfo', function(bArgs) {
      self.wdPopDlgForm.r.hideDlg();
      var sOut = bArgs[0];
      if (sOut) insertText_(sOut);
    });
    
    DCF.regist('saveSlideShow', function(bArgs) {
      var sProj=bArgs[0], sHtml=bArgs[1];
      if (!sProj || !sHtml) return;
      var iPos = sProj.indexOf('/');
      if (iPos <= 0) return;
      var sAlias=sProj.slice(0,iPos), sPath_=sProj.slice(iPos+1);
      
      var restored = false;
      var toolBtn = self.wdToolbar.querySelector('img[name="SubmitPrj"]');
      toolBtn.src = 'loading.gif';
      setTimeout(function(){
        if (!restored) {
          restored = true;
          toolBtn.src = 'prj_submit.png';
        }
      },20000);
      
      var whenDone = function(sInfo) {
        if (!restored) {
          restored = true;
          toolBtn.src = 'prj_submit.png';
        }
        if (sInfo) alert(sInfo);
      };
      
      if (githubSess) {
        var sTxtFile = sPath_ + '/$index.txt';
        var sNowDate = (new Date()).toLocaleDateString();
        var sSha = githubCfgSha['/' + sAlias + '/' + sTxtFile];
        
        // step 2: upload txt file
        var saveIndexTxt = function() {
          $.ajax( { type:'PUT',
            url: 'https://api.github.com/repos/' + githubUser.login + '/' + sAlias + '/contents/' + sTxtFile + '?access_token=' + githubToken,
            data: JSON.stringify({ path: sTxtFile,
              message: sNowDate,
              content: Gh3.Base64.encode(sHtml),
              sha: sSha,
              branch: 'gh-pages',
            }),
            
            success: function(res) {
              githubCfgSha['/' + sAlias + '/' + sTxtFile] = res.content.sha;
              self.data.changed = false;
              whenDone('Submit project successful');
            },
            error: function(res) {
              githubCfgSha['/' + sAlias + '/' + sTxtFile] = '';
              whenDone('Upload failed: ' + ajaxErrDesc(res,'message'));
            },
          });
        };
        
        // step 1: try get sha of $index.txt
        if (!sSha) {
          var aDir = new Gh3.Dir({path:sPath_},githubUser,sAlias,'gh-pages');
          aDir.fetchContents( function(err, res) { 
            if (err) {
              whenDone('List files (' + sPath_ + ') failed: ' + err.message);
              return;
            }
            var aFile = aDir.getFileByName('$index.txt');
            if (!aFile) {
              whenDone('Read file failed: ' + sTxtFile);
              return;
            }
            sSha = aFile.sha;
            githubCfgSha['/' + sAlias + '/' + sTxtFile] = sSha;
            saveIndexTxt();
          });
        }
        else saveIndexTxt();
        
        return;
      }
    });
    
    self.on('ssDragOver', function(event) {
      var sTask = getCookie__('drag_task');
      if (sTask == 'put_prj' || sTask == 'put_img') {
        event.original.preventDefault();
        event.original.dataTransfer.dropEffect = 'copy';
      }
    });
    
    self.on('ssDragDrop', function(event) {
      var sArg;
      if (window.WEB_IE_BROWSER)
        sArg = event.original.dataTransfer.getData('text') || '';
      else sArg = event.original.dataTransfer.getData('text/args') || '';
      var b = sArg.split(',');
      if (b.length <= 3) return;
      var sTxt = b.slice(3).join(',');
      if (!sTxt) return;
      
      if (b[0] == 'project') {    // drag from wdProjList: project,hasThumb,iFlag
        event.original.preventDefault();
        var thumbUrl='', hasThumb=parseInt(b[1] || '0'), sFlag=b[2] || '3';
        if (hasThumb) {
          if (githubSess) {
            var iPos = sTxt.indexOf('/');
            if (iPos > 0) {
              var sAlias = sTxt.slice(0,iPos), sPath_ = sTxt.slice(iPos+1);
              var d = githubGetCfg(sAlias);
              if (d) {
                var oneDoc = _.find(d.doc_list,function(item) {
                  return item.path == sPath_;
                });
                if (oneDoc) {
                  thumbUrl = oneDoc.thumb || '';
                  if (thumbUrl[0] == '$' && thumbUrl[1] == '$')
                    thumbUrl = '/' + sAlias + '/' + d.repos_name + '/' + thumbUrl;
                }
              }
            }
          }
          else thumbUrl = '/' + sTxt + '/$thumbnail.png';
        }
        self.wdPopDlgForm.r.addDropPrjFrame(thumbUrl,sFlag,sTxt);
      }
      else if (b[0] == 'image') { // drag from resPanel: image,wd,hi
        var wd=parseInt(b[1] || '0'), hi=parseInt(b[2] || '0');
        if (wd && hi) {
          event.original.preventDefault();
          self.wdPopDlgForm.r.addDropImgFrame(wd,hi,sTxt);
        }
      }
    });
  },
  
  saveCaretPos: function() {
    this.data.caretPos = -1;
    if (this.data.isMarkdown) {
      var txtNode = this.wd.querySelector('textarea.markdown-editor');
      if (txtNode && ('selectionStart' in txtNode))
        this.data.caretPos = txtNode.selectionStart;
    }
  },
  
  tryResetAcl: function(sPath,sAcl) {
    if (this.data.currProj == sPath) {
      this.data.currAcl = sAcl;
      if (this.data.editingCss == 'block')
        this.update();
    }
  },
  
  startEditDoc: function(bInfo) {
    if (!bInfo || bInfo.length <= 0) return;
    var b=bInfo[bInfo.length-1], sAcl=b[0], sProj=b[1], canWrite=b[2];
    
    if (!canWrite) {
      alert('Project is not blog or slideshow, online editing is not supported!');
      return;
    }
    if (this.data.editingCss != 'none' && this.data.currProj) {
      if (sProj && this.data.currProj == sProj) {
        if (!confirm('The project already in editing, do you want reload it?'))
          return;  // ignore re-editing same project
      }
      if (this.data.changed && !confirm('A project already in editing, do you want to contine (without submit previous one)?'))
        return;
    }
    if (typeof sProj != 'string') return;
    
    var iPos = sProj.indexOf('/');
    if (iPos <= 0) return;
    var sAlias=sProj.slice(0,iPos), sPath_=sProj.slice(iPos+1);
    
    if (sProj.slice(sProj.length-5) == '.blog') {
      this.el.style.background = 'url(loading2.gif) no-repeat center';
      this.data.isMarkdown = true;
      this.data.editingCss = 'none';  // hide markdown editor
      this.update();
      
      var self = this;
      var whenDone = function(sInfo) {
        self.el.style.background = '';
        if (sInfo) alert(sInfo);
      };
      
      var nextStep = function(sRet) {
        self.wdToolbar.r.editProj('blog',sProj,sAcl);
        self.wdResPanel.r.editProj('blog');
        self.wdPreviewArea.r.editProj('blog',sProj);
        
        var beResize = self.data.hasPreview;
        var node = self.wdPreviewArea.querySelector('.preview-md');
        if (node) node.innerHTML = '';
        self.data.hasPreview = false;
        
        var txtNode = self.wd.querySelector('textarea.markdown-editor');
        txtNode.onkeydown = function(event) {
          if (event.ctrlKey && !event.shiftKey && !event.altKey && event.keyCode == 77) { // ctrl+M
            var sProj = self.data.currProj;
            if (self.data.editingCss == 'none' || !sProj) return;
            if (sProj.slice(sProj.length-5) != '.blog') return;
            
            event.stopPropagation();
            event.preventDefault();
            self.startTransDoc();
          }
        };
        txtNode.value = sRet;
        
        self.data.changed = false;
        self.data.currAcl = sAcl;
        self.data.currProj = sProj;
        self.data.editingCss = 'block';  // show markdown editor
        self.update();
        
        if (beResize) self.wdProjList.r.fire('resized');
      }
      
      if (githubSess) {
        var aFile = new Gh3.File({path:sPath_+'/$index.md'},githubUser,sAlias,'gh-pages');
        aFile.fetchContent( function(err, res) {
          if (err) {
            whenDone('Load file failed: $index.md');
            return;
          }
          githubCfgSha['/' + sAlias + '/' + sPath_ + '/$index.md'] = aFile.sha;
          nextStep(aFile.getRawContent());
        });
        return;
      }
    }
    else if (sProj.slice(sProj.length-6) == '.sshow') {
      this.el.style.background = 'url(loading2.gif) no-repeat center';
      this.data.isMarkdown = false;
      this.data.editingCss = 'none';
      this.update();
      
      var frmNode = this.wd.querySelector('iframe.markdown-frame');
      if (!frmNode) return;
      
      var self = this;
      var whenDone = function(sInfo) {
        self.el.style.background = '';
        if (sInfo) alert(sInfo);
      };
      
      var sUrl = '/' + sProj + '/?editing=1';
      var nextStep = function() {
        frmNode.onerror = function(errMsg) {
          whenDone(errMsg+'');
        };
        frmNode.onload = function(event) {
          whenDone('');
          self.wdToolbar.r.editProj('sshow',sProj,sAcl);
          self.wdResPanel.r.editProj('sshow');
          self.wdPreviewArea.r.editProj('sshow',sProj);
          
          self.data.hasPreview = false;
          self.data.changed = false;
          self.data.currAcl = sAcl;
          self.data.currProj = sProj;
          self.data.editingCss = 'block';
          self.update();
          
          var iWd = window.innerWidth - 300 - 616 - 4;
          self.wdProjList.r.resize2Width(iWd,true);
        };
        frmNode.src = sUrl;
      };
      
      if (githubSess) {
        var aDir = new Gh3.Dir({path:sPath_},githubUser,sAlias,'gh-pages');
        aDir.fetchContents( function(err, res) { 
          if (err) {
            whenDone('List files (' + sPath_ + ') failed: ' + err.message);
            return;
          }
          var aFile = aDir.getFileByName('$index.txt');
          if (!aFile) {
            whenDone('Read file failed: ' + sPath_ + '/$index.txt');
            return;
          }
          
          githubCfgSha['/' + sAlias + '/' + sPath_ + '/$index.txt'] = aFile.sha;
          nextStep();
        });
        
        return;
      }
    }
  },
  
  startSubmitDoc: function() {
    var sProj = this.data.currProj;
    if (this.data.editingCss == 'none' || !sProj) {
      alert('No project in editing');
      return;
    }
    if (!this.data.changed) {
      alert('no changes, submition canceled');
      return;
    }
    
    if (sProj.slice(-5) == '.blog') {
      var iPos = sProj.indexOf('/');
      if (iPos <= 0) return;
      var sAlias=sProj.slice(0,iPos), sPath_=sProj.slice(iPos+1);
      
      var txtNode = this.wd.querySelector('textarea.markdown-editor');
      var sInput = txtNode.value;
      
      var restored = false;
      var toolBtn = this.wdToolbar.querySelector('img[name="SubmitPrj"]');
      toolBtn.src = 'loading.gif';
      setTimeout(function(){
        if (!restored) {
          restored = true;
          toolBtn.src = 'prj_submit.png';
        }
      },20000);
      
      var self = this;
      var whenDone = function(sInfo) {
        if (!restored) {
          restored = true;
          toolBtn.src = 'prj_submit.png';
        }
        if (sInfo) alert(sInfo);
      };
      var nextStep = function(s) {
        whenDone();
        if (typeof s == 'string' && s) {
          s = JSON.parse(s);
          if (typeof s == 'string') {
            if (s == 'OK') {
              self.data.changed = false;
              if (self.data.hasPreview)
                self.startTransDoc();
              alert('Submit project successful');
            }
            else if (s == 'NOT_LOGIN')
              self.wdPopDlgForm.r.checkLogin(true,'submit');
            else alert(s);
          }
        }
      };
      
      if (githubSess) {
        var sMdFile = sPath_ + '/$index.md';
        var sNowDate = (new Date()).toLocaleDateString();
        var sSha = githubCfgSha['/' + sAlias + '/' + sMdFile];
        
        // step 2: upload md file
        var saveIndexMd = function() {
          $.ajax( { type:'PUT',
            url: 'https://api.github.com/repos/' + githubUser.login + '/' + sAlias + '/contents/' + sMdFile + '?access_token=' + githubToken,
            data: JSON.stringify({ path: sMdFile,
              message: sNowDate,
              content: Gh3.Base64.encode(sInput),
              sha: sSha,
              branch: 'gh-pages',
            }),
            
            success: function(res) {
              githubCfgSha['/' + sAlias + '/' + sMdFile] = res.content.sha;
              nextStep('"OK"');
            },
            error: function(res) {
              githubCfgSha['/' + sAlias + '/' + sMdFile] = '';
              whenDone('Upload failed: ' + ajaxErrDesc(res,'message'));
            },
          });
        };
        
        // step 1: try get sha of md file
        if (!sSha) {
          var aDir = new Gh3.Dir({path:sPath_},githubUser,sAlias,'gh-pages');
          aDir.fetchContents( function(err, res) { 
            if (err) {
              whenDone('List files (' + sPath_ + ') failed: ' + err.message);
              return;
            }
            var aFile = aDir.getFileByName('$index.md');
            if (!aFile) {
              whenDone('Read file failed: ' + sMdFile);
              return;
            }
            sSha = aFile.sha;
            githubCfgSha['/' + sAlias + '/' + sMdFile] = sSha;
            saveIndexMd();
          });
        }
        else saveIndexMd();
        
        return;
      }
    }
    else if (sProj.slice(sProj.length-6) == '.sshow') {
      this.postSlideMsg('startSave',[sProj]);
    }
  },
  
  startTransDoc: function() {
    var sProj = this.data.currProj;
    if (this.data.editingCss == 'none' || !sProj) {
      alert('No project in editing');
      return;
    }
    
    if (sProj.slice(sProj.length-5) == '.blog') {
      var self = this;
      var txtNode = self.wd.querySelector('textarea.markdown-editor');
      var preNode = self.wdPreviewArea.querySelector('.preview-md');
      if (preNode) {
        require(['js/marked.min'], function(marked) {
          var adjust = false, scrollY = 0, isBtm = false;
          var sHtml = marked(txtNode.value);
          
          preNode.style.height = '580px';
          var frmNode = preNode.querySelector('iframe');
          if (frmNode) {
            if (self.data.hasPreview) {
              adjust = true;
              scrollY = frmNode.contentWindow.document.body.scrollTop;
              isBtm = scrollY > 0 && (scrollY + preNode.clientHeight > frmNode.contentWindow.document.body.scrollHeight - 30);
            }
            frmNode.parentNode.removeChild(frmNode);
          }
          
          console.log('here',adjust,scrollY,isBtm);
          frmNode = document.createElement('iframe');
          frmNode.setAttribute('frameborder','0');
          frmNode.setAttribute('border','0');
          frmNode.onload = function(event) {
            frmNode.contentWindow.document.body.style.overflowX = 'hidden'; // default is auto
            frmNode.contentWindow.document.body.innerHTML = sHtml;
            self.data.hasPreview = true;
            self.wdProjList.r.fire('resized');
            
            if (adjust) {
              setTimeout( function() {
                if (isBtm)
                  frmNode.contentWindow.document.body.scrollTop = frmNode.contentWindow.document.body.scrollHeight;
                else frmNode.contentWindow.document.body.scrollTop = scrollY;
              },500);
            }
          };
          preNode.appendChild(frmNode);
          frmNode.src = '/' + sProj + '/?__EMPTY__';
        });
      }
    }
  },
  
  prjInEditing: function(sPath) {
    var sProj = this.data.currProj;
    if (this.data.editingCss == 'none' || !sProj)
      return '';
    if (!this.data.changed)
      return '';
    
    if (sProj == sPath)
      return '*';    // full match
    else if (sProj.indexOf(sPath + '/$$/') == 0)
      return sProj.slice(sPath.length+4);
    else return '';
  },
  
  cancelEditing: function() {
    var sProj = this.data.currProj;
    if (this.data.editingCss == 'none' || !sProj)
      return;
    
    var beResize = this.data.hasPreview;
    var node = this.wdPreviewArea.querySelector('.preview-md');
    if (node) node.innerHTML = '';
    this.data.hasPreview = false;
    
    var txtNode = this.wd.querySelector('textarea.markdown-editor');
    if (txtNode) txtNode.value = '';
    this.data.changed = false;
    this.data.currProj = '';
    this.data.editingCss = 'none';
    this.update();
    
    this.wdToolbar.r.clearInfo();
    if (beResize) this.wdProjList.r.fire('resized');
  },
  
  //-----------------
  projState: function() {
    var sProj = this.data.currProj;
    if (this.data.editingCss == 'none' || !sProj)
      return '';
    
    var iLen = sProj.length;
    if (iLen > 5 && sProj.slice(iLen-5) == '.blog')
      return 'blog';
    else if (iLen > 6 && sProj.slice(iLen-6) == '.sshow')
      return 'sshow';
    else return '';
  },
  
  postSlideMsg: function(sFunc,bArgs) {
    var frmNode = this.wd.querySelector('iframe.markdown-frame');
    if (frmNode) {
      var s = '[PINPSLIDE_11]' + JSON.stringify({'method':sFunc,'param':bArgs});
      frmNode.contentWindow.postMessage(s,'*');
    }
  },
  
  tryUnselectSS: function() {
    var frmNode = this.wd.querySelector('iframe.markdown-frame');
    if (frmNode) {
      var s = '[PINPSLIDE_11]' + JSON.stringify({'method':'tryUnselect','param':[]});
      frmNode.contentWindow.postMessage(s,'*');
    }
  },
};

var ResImageList_ = [];

var ResPanel = {
  __base__: R.BaseWidget,
  __widget__: ['wdProjList','wdMarkdown','wdPopDlgForm'],
  
  init: function(cfg) {
    this._super(cfg);
    var self = this;
    
    var inDesign = (self.get('__debug__') || 0) & 0x01;
    if (inDesign) return;
    
    self.on('rewidth', function(event) {
      var iWd = self.data.sWidth == '100%'? 300: 1;
      var targNode = self.wdMarkdown.parentNode;
      targNode.style.width = (targNode.parentNode.clientWidth - iWd - 1) + 'px';
      self.wd.parentNode.style.width = iWd + 'px';
    });
    
    self.on('showSyntax', function(event) {
      if (self.data.pages[0].show != 'block') {
        self.data.pages[0].show = 'block';
        self.data.pages[1].show = 'none';
        self.update();
      }
    });
    
    self.on('showFolder', function(event) {
      if (self.data.pages[1].show != 'block') {
        self.data.pages[1].show = 'block';
        self.data.pages[0].show = 'none';
        self.update();
      }
    });
    
    self.on('ssDropClick', function(event) {
      var node = self.wd.querySelector('div.res-dropholder > input');
      node.click();
    });
    
    self.on('ssFileChange', function(event) {
      var node = event.original.target;
      if (node && node.files && node.files.length)
        dropUploadFiles(node.files);
    });
    
    self.on('ssDragStart', function(event) {
      self.wdMarkdown.r.saveCaretPos();
      
      var targ = event.original.target, node = null;
      while (targ) {
        if (targ.nodeName == 'DIV') {
          if (targ.classList.contains('res-imgitem')) {
            node = targ;
            break;
          }
          else if (targ.classList.contains('res-files'))
            return;
        }
        targ = targ.parentNode;
      }
      if (!node) return;
      
      var imgNode = node.querySelector('img');
      if (imgNode && imgNode.complete) {
        var dCfg = null;
        var idx = parseInt(node.getAttribute('idx') || '0');
        for (var i=0,item; item=ResImageList_[i]; i++) {
          if (item.id === idx) {
            dCfg = item;
            break;
          }
        }
        if (!dCfg || !dCfg.realUrl) return;
        
        var sWd,sHi, sSize = imgNode.getAttribute('_size');
        if (sSize) {
          var bTmp = sSize.split('x');
          if (bTmp.length != 2) return;
          sWd = bTmp[0]; sHi = bTmp[1];
        }
        else {
          sWd = imgNode.naturalWidth + '';
          sHi = imgNode.naturalHeight + '';
        }
        
        setCookie__('drag_task','put_img');
        var transfer = event.original.dataTransfer;
        transfer.effectAllowed = 'copy';
        transfer.setData(window.WEB_IE_BROWSER?'text':'text/args','image,' + sWd + ',' + sHi + ',' + dCfg.realUrl);
        if (transfer.setDragImage)
          transfer.setDragImage(imgNode,0,0);
      }
    });
    
    self.on('ssDragEnd',function(event) {
      delCookie__('drag_task');
    });
    
    self.on('ssTempDragStart',function(event) {
      var targ = event.original.target;
      if (targ && targ.nodeName == 'IMG') {
        var sPath = targ.getAttribute('src');
        
        setCookie__('drag_task','run_js');
        var transfer = event.original.dataTransfer;
        transfer.effectAllowed = 'copy';
        transfer.setData(window.WEB_IE_BROWSER?'text':'text/args','image,0,0,' + sPath);
        if (transfer.setDragImage)
          transfer.setDragImage(targ,0,0);
      }
    });
    
    self.on('ssTempDragEnd',function(event) {
      delCookie__('drag_task');
    });
    
    var totalAdded_ = 0;
    var supportedImg_ = '.jpg.jpeg.png.gif.ico.tiff.bmp.svg.svgz.';
    var quickDownImg_ = '.jpg.jpeg.png.gif.ico.tiff.bmp.';
    
    var getQuickDownFunc = function(sPath,sFile,obj) {
      // do nothing
    };
    
    var newResImgNode = function(obj) {
      var sCls = 'res-imgitem';
      if (obj.cls) sCls += ' ' + obj.cls;
      
      var node = document.createElement('div');
      node.className = sCls;
      node.setAttribute('idx',obj.id + '');
      
      var imgNd = document.createElement('img');
      imgNd.setAttribute('draggable','true');
      imgNd.setAttribute('title',obj.title);
      imgNd.onload = function(event) {
        var imgNode = event.target;
        if (imgNode.nodeName != 'IMG' || !imgNode.naturalHeight) return;
        
        var isUpload = imgNode.parentNode.classList.contains('res-uploading');
        if (isUpload) return;
        var sSrc = imgNode.getAttribute('src');
        if (sSrc == 'warning.jpg' || sSrc == 'uploading.gif') return;
        
        var sQuickSize = imgNode.getAttribute('_size');
        if (sQuickSize) { // from quick down, 'title' already set
          var iWd = imgNode.naturalWidth, iHi = imgNode.naturalHeight;
          imgNode.style.marginLeft = Math.floor((90-iWd)/2+0.5) + 'px';
          imgNode.style.marginTop = Math.floor((80-iHi)/2+0.5) + 'px';
          imgNode.style.width = iWd + 'px';
          imgNode.style.height = iHi + 'px';
          return;
        }
        
        var f = imgNode.naturalWidth / imgNode.naturalHeight;
        if (f < 1.125) { // too narrow
          var iWd = Math.floor(80 * f + 0.5);
          imgNode.style.width = iWd + 'px';
          imgNode.style.marginLeft = Math.floor((90-iWd)/2+0.5) + 'px';
        }
        else {
          var iHi = Math.floor(90 / f + 0.5);
          imgNode.style.height =  iHi + 'px';
          imgNode.style.marginTop = Math.floor((80-iHi)/2+0.5) + 'px';
        }
        
        var sErr = imgNode.getAttribute('_error');
        if (sErr)
          imgNode.title = sErr;
        else imgNode.title = imgNode.naturalWidth + 'x' + imgNode.naturalHeight;
      };
      imgNd.src = obj.url;
      node.appendChild(imgNd);
      
      var rmvNd = document.createElement('div');
      rmvNd.className = 'res-rmvimg';
      rmvNd.onclick = function(event) {
        var targ=event.target, node=null;
        while (targ) {
          if (targ.nodeName == 'DIV') {
            if (targ.classList.contains('res-imgitem')) {
              node = targ;
              break;
            }
            else if (targ.classList.contains('res-files'))
              break;
          }
          targ = targ.parentNode;
        }
        if (!node) return;
        
        var dCfg=null, idx=parseInt(node.getAttribute('idx') || '0');
        if (idx > 0) {
          for (var i=0,item; item=ResImageList_[i]; i++) {
            if (item.id == idx) {
              dCfg = item;
              break;
            }
          }
        }
        if (!dCfg || !dCfg.realUrl) return;
        
        var loc = location__(dCfg.realUrl);
        var sPath=loc.pathname, sAlias=dCfg.alias;
        if (sPath[0] != '/') sPath = '/' + sPath;  // avoid bug of IE11
        if (sPath.indexOf('/' + sAlias + '/') == 0) {
          sPath = sPath.slice(1);
          var bareName = sPath.split('/').pop();
          if (!confirm('Do you want remove file (' + bareName + ')?'))
            return;
          
          var rmvCurrNode = function() {
            if (!node.parentNode) return; // is invalid
            
            node.parentNode.removeChild(node);  // remove image node
            for (var i=0,item; item=ResImageList_[i]; i++) {
              if (item.id == idx) {
                ResImageList_.splice(i,1);
                break;
              }
            }
          };
          
          if (githubSess) {
            var sPath_ = sPath.slice(sAlias.length+1);
            var sDir_ = sPath_.slice(0,sPath_.length - bareName.length - 1);
            var sha = dCfg.sha || '';
            
            var nextStep = function() {
              $.ajax( { type: 'DELETE',
                url: 'https://api.github.com/repos/' + githubUser.login + '/' + dCfg.alias + '/contents/' + sPath_ + '?access_token=' + githubToken,
                data: JSON.stringify({ 'path': sPath_,
                  'message': (new Date()).toLocaleDateString(),
                  'sha': sha,
                  'branch': 'gh-pages',
                }),
                success: function(res) {
                  rmvCurrNode();
                },
                error: function(res) {
                  alert('Remove file failed: ' + bareName);
                },
              });
            };
            
            if (!sha) {
              var aDir = new Gh3.Dir({path:sDir_},githubUser,sAlias,'gh-pages');
              aDir.fetchContent( function(err, res) {
                var aFile = null;
                if (!err) aFile = aDir.getFileByName(bareName);
                if (!aFile) {
                  alert('Remove file failed: ' + bareName);
                  return;
                }
                sha = aFile.sha;
                nextStep();
              });
            }
            else nextStep();
            
            return;
          }
        }
      };
      node.appendChild(rmvNd);
      
      return node;
    };
    
    var initResImgList = function() {
      var btmLine = self.wd.querySelector('div.res-btm-line');
      if (!btmLine) return;
      
      var nodes = self.wd.querySelectorAll('div.res-imgitem');
      for (var i=0,item; item=nodes[i]; i++) {
        item.parentNode.removeChild(item);
      }
      if (!ResImageList_.length) return;
      
      var owner = btmLine.parentNode;
      for (var i=0,obj; obj=ResImageList_[i]; i++) {
        var node = newResImgNode(obj);
        owner.insertBefore(node,btmLine);
      }
    };
    
    var insertOneResImg = function(obj) {
      var btmLine = self.wd.querySelector('div.res-btm-line');
      if (!btmLine) return;
      
      var node = newResImgNode(obj);
      btmLine.parentNode.insertBefore(node,btmLine);
    };
    
    self.on('loadRes', function(event) {
      var sProj = self.data.currProj;
      if (!sProj) return;
      var iPos = sProj.indexOf('/');
      if (iPos <= 0) return;
      var sAlias=sProj.slice(0,iPos), sPath=sProj.slice(iPos+1);
      
      if (githubSess) {
        var bFound = [];
        var nextStep = function() {
          ResImageList_ = [];
          var sCls = self.data.pages[1].canModifyCss == 'block'? 'res-canrmv': '';
          _.each(bFound, function(item) {
            var sName = item[0];
            totalAdded_ += 1;
            var oneObj = {realUrl: '//' + githubUser.login + '.github.io/' + sProj + '/' + sName,
                          cls:sCls, alias:sAlias, title:sName, id:totalAdded_, sha:item[1] };
            oneObj.url = oneObj.realUrl;  // direct download
            ResImageList_.push(oneObj);
          });
          initResImgList();
        };
        
        var aDir = new Gh3.Dir({path:sPath},githubUser,sAlias,'gh-pages');
        aDir.fetchContents( function(err, res) {
          if (err) {
            self.showMsg('load image resource failed');
            return;
          }
          
          aDir.eachContent( function(content) {
            if (content.type == 'file') {
              var sName=content.name, sExt=sName.split('.').pop();
              if (supportedImg_.indexOf('.'+sExt+'.') >= 0) {
                bFound.push([sName,content.sha]);
              }
            }
          });
          nextStep();
        });
        
        return;
      }
    });
    
    var newUploadTask = function(f,fType,fBaseName,fExtName,urlData) {
      // step 1: prepare sAlias, sPath
      var sFile=self.data.currProj, sAcl=self.data.currAllow;
      if (!sFile) return false;
      var iPos = sFile.indexOf('/');
      if (iPos <= 0) return false;
      var sAlias=sFile.slice(0,iPos), sPath=sFile.slice(iPos+1);
      
      // step 2: prepare sBase, sExt, sFileName
      var sBase='', sExt='', sEncode='bin', file2Base=false;
      if (f) {  // f: { name: "somefile.png", lastModified: 1418299398000, lastModifiedDate: Date 2014-12-11T12:03:18.000Z, size: 6605, type: "image/png" }
   	    var bTmp = f.name.split('.');
   	    fType = f.type;
   	    sExt = bTmp.pop();
   	    sBase = bTmp.join('.');
   	    if (githubSess) file2Base = true;
   	  }
   	  else {
   	    if (!urlData) return false;
   	    sBase = fBaseName;
   	    sExt  = fExtName;
   	    sEncode = 'base64';
   	  }
 	    if (!fType || !sBase || !sExt) return false;  // sBase must not ''
   	  
   	  var sFileName = sBase + '.' + sExt;
      var iTmp=1, oldOne=_.find(ResImageList_, function(item) {
        return sFileName == (item.realUrl || '').split('/').pop();
      });
      while (oldOne) {
        iTmp += 1;
        sFileName = sBase + iTmp + '.' + sExt;
        oldOne = _.find(ResImageList_, function(item) {
          return sFileName == (item.realUrl || '').split('/').pop();
        });
      }
   	  
   	  // step 3: create upload task
      totalAdded_ += 1;
      var idx = totalAdded_;
      var newOne = { id:idx, url:'uploading.gif', cls:'res-uploading', 
                     title:sFileName, alias:sAlias };
      ResImageList_.push(newOne);
      insertOneResImg(newOne);
      
      var setResult = function(node,sUrl_,sErr) {
        if (sUrl_ != 'warning.jpg')
          newOne.realUrl = sUrl_;
        newOne.url = sUrl_;
        newOne.cls = '';
        
        node.classList.remove('res-uploading');
        var imgNode = node.querySelector('img');
        if (imgNode) {
          if (sErr)
            imgNode.setAttribute('_error',sErr);
          else {
            if (self.data.pages[1].canModifyCss == 'block')
              node.classList.add('res-canrmv');
          }
          imgNode.setAttribute('src',sUrl_);
        }
      };
   	  
   	  // step 4: prepare github base64 upload
      if (githubSess) {
        var setResult2 = function(node,sUrl_,sBaseHead,sInput) {
          newOne.realUrl = sUrl_;
          newOne.url = sUrl_;
          newOne.cls = '';
          
          node.classList.remove('res-uploading');
          var imgNode = node.querySelector('img');
          if (imgNode) {
            if (self.data.pages[1].canModifyCss == 'block')
              node.classList.add('res-canrmv');
            imgNode.src = sBaseHead + sInput;
          }
        };
        
        var uploadBase64 = function(sInput) {
      	  var ii = sInput.indexOf(';base64,'), sBaseHead='';
      	  if (ii > 0 && ii < 64) {
      	    sBaseHead = sInput.slice(0,ii+8);
      	    sInput = sInput.slice(ii+8);
      	  }
      	  
      	  var sPath_ = sPath + '/' + sFileName;
          $.ajax( { type: 'PUT',
            url: 'https://api.github.com/repos/' + githubUser.login + '/' + sAlias + '/contents/' + sPath_ + '?access_token=' + githubToken,
            data: JSON.stringify({ 'path': sPath_,
              'message': (new Date()).toLocaleDateString(),
              'content': sInput,
              'branch': 'gh-pages',
            }),
            success: function(res) {
              var node = self.wd.querySelector('div.res-uploading[idx="' + idx + '"]');
              if (!node) return;
              newOne['sha'] = res.content.sha;
              
              node.style.backgroundSize = '40px 2px';   // upload 60%
              setTimeout( function() {
                node.style.backgroundSize = '70px 2px'; // upload 100%
                setTimeout( function() {
                  var sUrl_ = '//' + githubUser.login + '.github.io/' + sAlias + '/' + sPath_;
                  setResult2(node,sUrl_,sBaseHead,sInput);
                },500);
              },500);
            },
            error: function(res) {
              var node = self.wd.querySelector('div.res-uploading[idx="' + idx + '"]');
              if (!node) return;
              node.style.backgroundSize = '70px 2px'; // upload 100%
              setResult(node,'warning.jpg','upload failed: ' + sFileName);
            },
          });
        };
        
        if (file2Base) {
        	var reader = new FileReader();
        	reader.onload = function(event) {
        	  uploadBase64(reader.result); // data:image/jpeg;base64,...
        	};
        	reader.readAsDataURL(f);
        }
        else {
          if (!urlData || sEncode != 'base64')
            return false;
          uploadBase64(urlData);
        }
        return true;
      }
    };
    
    var FileDragHover = function(event) {
      var sArg;
      if (window.WEB_IE_BROWSER)
        sArg = event.dataTransfer.getData('text') || '';
      else sArg = event.dataTransfer.getData('text/args') || '';
      if (sArg.indexOf('project,') == 0 || sArg.indexOf('image,') == 0)
        return;
      
      event.stopPropagation();
      event.preventDefault();
      var targ = event.target;
      if (targ && targ.classList.contains('res-dropholder')) {
        if (event.type == 'dragover')
          targ.classList.add('res-draghover');
        else targ.classList.remove('res-draghover');
      }
    };
    
    var dropUploadFiles = function(files) {
      var bIgnore=[], iCount=0;
      for (var i = 0, f; f = files[i]; i++) {
        var b=f.name.split('.'), ext=b[b.length-1];
        if (b.length > 1 && ext && supportedImg_.indexOf('.'+ext+'.') >= 0) {
          if (newUploadTask(f)) {
            iCount += 1;
            if (iCount >= 64) break;
          }
        }
        else bIgnore.push(f.name);
      }
      if (bIgnore.length)
        alert('Only image file can upload, following ignored: ' + bIgnore.join(','));
      if (iCount) self.update();
    };

    var convertImg2Url = function(url,callback,outFormat) {
      var img = new Image();
      img.onload = function() { // CROS, sometimes can work, most not work, why?
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = this.width;
        canvas.height = this.height;
        ctx.drawImage(this,0,0);
        
        var dataURL = canvas.toDataURL(outFormat); // can work in same domain
        callback(dataURL);
        canvas = null;
      };
      img.crossOrigin = 'Anonymous';
      img.src = url;
    };
    
    var FileSelectHandler = function(event) { // on drop
      FileDragHover(event);  // cancel event and hover styling
      var files = event.target.files || event.dataTransfer.files; // get FileList object
      if (files.length)
        dropUploadFiles(files);
      else { // drag an image and drop, we try convert it to base64 then upload it
        var sFile='', sBase='', sExt='', imgUrl=event.dataTransfer.getData('url') || '';
        if (imgUrl) sFile = imgUrl.split('?')[0].split('/').pop();
        if (sFile) {
          var b = sFile.split('.');
          if (b.length >= 2) {
            sExt = b.pop();
            sBase = b.join('.');
          }
        }
        
        if (sBase && sExt && supportedImg_.indexOf('.'+sExt+'.') >= 0) {
          var fType = 'image/' + sExt;
          convertImg2Url(imgUrl, function(sData) {
            newUploadTask(null,fType,sBase,sExt,sData);
          },fType);
        }
      }
    };
    
    if (window.File && window.FileList && window.FileReader && window.XMLHttpRequest && (new XMLHttpRequest()).upload) {
      self.set('pages[1].canUpload',true);
      setTimeout(function() {
        var fileDrag = document.getElementById('dragndropimage');
        if (fileDrag) {
    		  fileDrag.addEventListener("dragover",FileDragHover,false);
  		    fileDrag.addEventListener("dragleave",FileDragHover,false);
  		    fileDrag.addEventListener("drop",FileSelectHandler,false);
        }
      },0);
    }
    
    self.on('ssTempDbclick',function(event) {
      var targ = event.original.target, node = null;
      while (targ) {
        if (targ.nodeName == 'DIV') {
          if (targ.classList.contains('res-temp-folder')) {
            node = targ;
            break;
          }
          else if (targ.classList.contains('res-template'))
            break;
        }
        targ = targ.parentNode;
      }
      if (!node) return;
      
      var sPath = node.getAttribute('_url');
      if (sPath)
        self.loadTemplate(sPath,node.querySelector('img.res-temp-loading'));
    });
    
    self.on('ssTempRefresh', function(event) {
      var targ = event.original.target, loadingNd = null;
      if (targ.nodeName == 'IMG') targ = targ.parentNode;
      if (targ.nodeName == 'DIV' && targ.classList.contains('res-temp-refresh'))
        loadingNd = targ.querySelector('img.res-temp-loading');
      self.loadTemplate('software/pages/template',loadingNd);
    });
  },
  
  switch2Wide: function() {
    if (this.data.sWidth == '100%') return;
    
    this.data.showPage = 'block';
    this.data.sWidth = '100%';
    this.update();
    this.fire('rewidth');
  },
  
  switch2Narrow: function() {
    if (this.data.sWidth != '100%') return;
    
    this.data.showPage = 'none';
    this.data.sWidth = '1px';
    this.update();
    this.fire('rewidth');
  },
  
  pageState: function() {
    if (this.data.sWidth == '100%') {
      if (this.data.pages[0].show == 'block')
        return 'syntax';
      else return 'files';
    }
    else return '';
  },
  
  showMsg: function(sMsg) {
    var node = this.wd.querySelector('.res-show-info');
    if (node) {
      node.innerHTML = htmlEncode(sMsg);
      node.style.display = 'block';
      setTimeout( function() {
        node.style.display = 'none';
      },5000);
    }
  },
  
  tryResetAcl: function(sPath,sAcl) {
    if (this.data.currProj != sPath) return;
    
    this.data.currAllow = sAcl;
    var node = this.wd.querySelector('.res-proj-info');
    if (node) {
      var sTitle = node.getAttribute('title') || '';
      var iPos = sTitle.indexOf(':');
      if (iPos > 0) {
        var sId = sTitle.slice(0,iPos).trim()
        if (sId == 'public' || sId == 'protected' || sId == 'private')
          node.setAttribute(sAcl + sTitle.slice(iPos));
      }
    }
  },
  
  selectProj: function(sProj,sAcl) {
    if (this.pageState() != 'files') return;
    var sModiCss = 'none', editingPrj = this.wdMarkdown.r.data.currProj;
    if (editingPrj == sProj || (editingPrj && sProj.indexOf(editingPrj+'/') == 0))
      sModiCss = 'block';
    
    if (this.data.currProj == sProj && this.data.pages[1].canModifyCss == sModiCss) {
      if (!confirm('Do you want reload image resource?'))
        return;
    }
    
    var node = this.wd.querySelector('.res-proj-info');
    if (node) {
      var ss, ii = sProj.indexOf('/');
      if (ii > 0)
        ss = sProj.slice(ii+1);
      else ss = sProj;
      var b = ss.split('/');
      node.innerHTML = '<p> ' + htmlEncode(ss) + '</p>';
      node.setAttribute('title',sAcl + ': ' + b[b.length-1]);
    }
    
    ResImageList_ = [];
    this.data.pages[1].canModifyCss = sModiCss;
    this.data.currProj = sProj;
    this.data.currAllow = sAcl;
    this.update();
    this.fire('loadRes');
  },
  
  resetFolder: function() {
    var node = this.wd.querySelector('.res-proj-info');
    if (node) {
      node.innerHTML = '';
      node.removeAttribute('title');
    }
    
    ResImageList_ = [];
    this.data.pages[1].canModifyCss = 'none';
    this.data.currProj = '';
    this.update();
  },
  
  editProj: function(sType) {
    if (sType == 'blog') {
      this.data.pages[0].isTemplate = false;
      this.update();
    }
    else if (sType == 'sshow') {
      this.data.pages[0].isTemplate = true;
      this.update();
      
      var refreshNd = this.wd.querySelector('div.res-temp-refresh');
      if (refreshNd) { // still in initial state (has refresh button), auto refresh it
        this.loadTemplate('software/pages/template');
      }
    }
  },
  
  loadTemplate: function(sPath,loadingNd) { // sPath: software/pages/template
    if (!this.data.pages[0].isTemplate) return;
    if (!sPath) return;
    if (sPath[sPath.length-1] == '/') sPath = sPath.slice(0,-1);
    var iPos = sPath.indexOf('/');
    if (iPos <= 0) return;
    
    if (loadingNd)
      loadingNd.style.visibility = 'visible';
    
    var whenDone = function(sErr) {
      if (sErr) alert(sErr);
      if (loadingNd) loadingNd.style.visibility = 'hidden';
    };
    
    var self=this, sAlias=sPath.slice(0,iPos), sPath_=sPath.slice(iPos+1);
    if (githubSess) {
      var aDir = new Gh3.Dir({path:sPath_},githubUser,sAlias,'gh-pages');
      aDir.fetchContents( function(err,res) { 
        if (err) {
          whenDone('load template (' + sPath_ + ') failed: ' + err.message);
          return;
        }
        
        var bDir=[], dFile={};
        aDir.eachContent(function(item) {
          if (item.type == 'dir')
            bDir.push([item.name,item.path]);
          else if (item.type == 'file') {
            var sName=item.path, sExt=sName.slice(-7);
            if (sExt == '.png.js' || sExt == '.gif.js') {
              var sName_ = sName.slice(0,-3);
              var iFlag = dFile[sName_] || 0;
              if (iFlag)
                dFile[sName_] = iFlag + 2;
              else dFile[sName_] = 2;
            }
            else {
              sExt = sName.slice(-4);
              if (sExt == '.png' || sExt == '.gif') {
                var iFlag = dFile[sName] || 0;
                if (iFlag)
                  dFile[sName] = iFlag + 1;
                else dFile[sName] = 1;
              }
            }
          }
        });
        
        var bFile = [];
        _.each(dFile,function(v,k) {
          if (v == 3) bFile.push(k);
        });
        bFile.sort();
        bDir.sort( function(a,b) {
          a=a[0]; b=b[0];
          if (a>b) return 1;
          else if (a===b) return 0;
          else return -1;
        });
        
        var bList = [];
        var sRoot = 'pages/template';
        if (sPath_.length > sRoot.length) {  // has up folder
          var bTmp = sPath_.split('/');
          bTmp.pop();
          bList.push({isDir:true, name:'..', img:'file_up.png', url:sAlias+'/'+bTmp.join('/')});
        }
        _.each(bDir,function(item) {
          bList.push({isDir:true, name:item[0], img:'file_folder.png', url:sAlias+'/'+item[1]});
        });
        _.each(bFile,function(item) {
          var sBase = item.split('/').pop();
          bList.push({isDir:false, name:sBase, img:'/'+sAlias+'/'+item});
        });
        
        whenDone();
        if (bList.length == 0)
          self.data.pages[0].res = [{isDir:true, name:'', img:'file_refresh.png', url:'software/pages/template'}];
        else self.data.pages[0].res = bList;
        self.update();
      });
      
      return;
    }
  },
};

var PreviewArea = {
  __base__: R.IFrame,
  __widget__: ['wdMarkdown'],
  
  init: function(cfg) {
    this._super(cfg);
    var self = this;
    
    var inDesign = (self.get('__debug__') || 0) & 0x01;
    if (inDesign) return;
    
    window.setPopContent = function(iID,sHtml,sClass,sFont,sExtern) {
      var holder = self.wd.querySelector('div.preview-ss');
      var frm = self.wd.querySelector('div.preview-inst > iframe');
      if (holder && frm && frm.contentWindow.setContent) {
        holder.style.display = 'none';
        frm.parentNode.style.display = 'block';
        frm.contentWindow.setContent(iID,sHtml,sClass,sFont,sExtern);
      }
    };
    window.getPopContent = function(iID) {
      var frm = self.wd.querySelector('div.preview-inst > iframe');
      if (frm && frm.contentWindow.getContent)
        return frm.contentWindow.getContent(iID);
    };
    window.hidePopContent = function() {
      var holder = self.wd.querySelector('div.preview-ss');
      var frm = self.wd.querySelector('div.preview-inst > iframe');
      if (holder && frm && frm.contentWindow.hideContent) {
        frm.contentWindow.hideContent();
        holder.style.display = 'block';
        frm.parentNode.style.display = 'none';
      }
    };
    
    // APIs from slide
    var DCF = R.getDCF();
    DCF.regist('previewPlugLib', function(bArgs) {
      if (self.data.frameReady) {
        bArgs.unshift(self.data.pages);
        bArgs.push(self.wd.clientWidth);
        DCF.call('frm-preview','setPlugLib',bArgs);
      }
    });
    
    DCF.regist('previewPageHtml', function(bArgs) {
      if (self.data.frameReady) {
        bArgs.unshift(self.data.pages);
        DCF.call('frm-preview','setPageHtml',bArgs);
      }
    });
    
    DCF.regist('previewPageModi', function(bArgs) {
      self.wdMarkdown.r.data.changed = true;
      if (self.data.frameReady) {
        bArgs.unshift(null);
        DCF.call('frm-preview','setPageHtml',bArgs);
      }
    });
    
    DCF.regist('onSlideLoad', function(bArgs) { // reported from online.js
      self.data.pages = bArgs;
      if (bArgs.length && self.data.frameReady)
        self.initPreviewPg();
    });
    
    DCF.regist('slideDelPage', function(bArgs) { // reported from online.js
      var iNewSelect = bArgs.shift();
      self.data.pages = bArgs;
      self.wdMarkdown.r.data.changed = true;
      if (self.data.frameReady)
        DCF.call('frm-preview','setPageHtml',[bArgs,iNewSelect]);
    });
    
    DCF.regist('slideAddPage', function(bArgs) { // reported from online.js
      var iNewSelect = bArgs.shift();
      self.data.pages = bArgs;
      self.wdMarkdown.r.data.changed = true;
      if (self.data.frameReady)
        DCF.call('frm-preview','setPageHtml',[bArgs,iNewSelect]);
    });
    
    DCF.regist('slideChangeOrder', function(bArgs) { // reported from online.js
      var iNewSelect = bArgs.shift();
      self.data.pages = bArgs;
      self.wdMarkdown.r.data.changed = true;
      if (self.data.frameReady)
        DCF.call('frm-preview','setPageHtml',[bArgs,iNewSelect]);
    });
    
    DCF.regist('nav_shift', function(bArgs) {
      if (self.data.frameReady)
        DCF.call('frm-preview','nav_shift',bArgs);
    });
    
    // APIs from preview
    DCF.regist('turnSlideTo', function(bArgs) {
      self.wdMarkdown.r.postSlideMsg('turnSlideTo',bArgs);
    });
    
    DCF.regist('delSlidePage', function(bArgs) {
      self.wdMarkdown.r.postSlideMsg('delSlidePage',bArgs);
    });
    
    DCF.regist('addSlidePage', function(bArgs) {
      self.wdMarkdown.r.postSlideMsg('addSlidePage',bArgs);
    });
    
    self.on('resized', function(event) {
      var frmNode = self.wd.querySelector('div.preview-ss > iframe');
      if (frmNode)
        DCF.call('frm-preview','setVisibleWidth',[self.wd.clientWidth]);
      
      var frmNode2 = self.wd.querySelector('div.preview-inst > iframe');
      if (frmNode2 && frmNode2.contentWindow.setVisibleWidth)
        frmNode2.contentWindow.setVisibleWidth(self.wd.clientWidth);
    });
  },
  
  editProj: function(sType,sProj) {
    if (sType == 'blog') {
      this.data.frameReady = false;
      this.data.isTemplate = false;
      this.update();
    }
    else if (sType == 'sshow') {
      this.data.isTemplate = true;
      this.update();
      
      var holder = this.wd.querySelector('div.preview-ss');
      var holder2 = this.wd.querySelector('div.preview-inst');
      if (holder && holder2) {
        this.data.frameReady = false;
        this.data.pages = [];
        
        var iHi = Math.max(window.innerHeight - 38 - 480 - 10,100);
        var iHi2 = Math.max(window.innerHeight - 38 - 480 - 8,100);
        holder.style.height = iHi + 'px';
        holder2.style.height = iHi2 + 'px';
        
        var frmNode2 = holder2.querySelector('iframe');
        if (!frmNode2) {
          frmNode2 = document.createElement('iframe');
          frmNode2.setAttribute('frameborder','0');
          frmNode2.setAttribute('width',window.innerWidth+'');
          frmNode2.setAttribute('height',iHi2+'');
          holder2.appendChild(frmNode2);
          
          var self = this;
          frmNode2.onload = function(event) {
            if (frmNode2.contentWindow.setVisibleWidth)
              frmNode2.contentWindow.setVisibleWidth(self.wd.clientWidth);
          };
        }
        
        var frmNode = holder.querySelector('iframe');
        if (!frmNode) {
          R.getDCF().removeTarget('frm-preview');
          frmNode = document.createElement('iframe');
          frmNode.setAttribute('id','frm-preview');
          frmNode.setAttribute('frameborder','0');
          frmNode.setAttribute('width',window.innerWidth+'');
          frmNode.setAttribute('height',iHi+'');
          holder.appendChild(frmNode);
          
          var self = this;
          frmNode.onload = function(event) {
            self.data.frameReady = true;
            if (self.data.pages.length)
              self.initPreviewPg();
          };
        }
        
        var sUrl = '/' + sProj + '/?editing=1&preview=1';
        frmNode.setAttribute('src',sUrl);
        
        var sUrl2 = '/' + sProj + '/?editing=1&inline=1';
        frmNode2.setAttribute('src',sUrl2);
      }
    }
  },
  
  initPreviewPg: function() {
    this.wdMarkdown.r.postSlideMsg('notiGetPlugLib',[]); // prepare plugin lib first
    
    var self = this;
    setTimeout(function() {
      for (var i=0,item; item=self.data.pages[i]; i++) {
        self.wdMarkdown.r.postSlideMsg('notiGetPageHtml',[item]);
      }
    },1000);
  },
};

var PopDlgForm = {
  __base__: R.IFrame,
  __widget__: ['wdInfoMask','wdToolbar','wdProjList','wdMarkdown','wdResPanel','wdPreviewArea'],
  
  init: function(cfg) {
    this._super(cfg);
    var self = this;
    
    var inDesign = (self.get('__debug__') || 0) & 0x01;
    if (inDesign) return;
    
    self.wd.style.display = 'none';
    self.wdInfoMask.style.display = 'none';
    self.wdInfoMask.onclick = function(event) {
      if (event.target === self.wdInfoMask && self.wd.style.display == 'block') {
        if (self.data.finished && self.tryHideDlg())
          event.stopPropagation();
      }
    };
    
    var checkLoginId = null, tryEvery30 = 0;
    var DCF = R.getDCF();
    DCF.regist('onResetLogin', function(bArgs) {
      self.data.login.hasLogin = false;
    });
    
    var anyCharIn = function(sInvalid,s) {
      for (var i=0,ch; ch=sInvalid[i]; i++) {
        if (s.indexOf(ch) >= 0)
          return true;
      }
      return false;
    };
    
    DCF.regist('closeForm', function(bArgs) {
      self.data.retData = bArgs;
      self.data.finished = true;
      self.wdInfoMask.style.display = 'none';
      self.wd.style.display = 'none';
    });
    
    // come from toolbar
    //------------------
    DCF.regist('shareProject', function(bArgs) {
      var iAcl=bArgs[0], iGroup=bArgs[1], sPath=bArgs[2];
      var sTitle=bArgs[3], sDesc=bArgs[4], sKeyword=bArgs[5], sThumb=bArgs[6];
      var sSha=bArgs[7]||'', sCfgLine=bArgs[8]||'';
      var bFriend = (githubSess? []: self.wdProjList.r.data.friendGroup);
      var sAcl = (iAcl==0? 'public': (iAcl==1? 'protected': 'private'));
      var sGroup = '';  // for author self
      if (sAcl == 'private') {
        if (iGroup > 0 && iGroup <= bFriend.length)
          sGroup = bFriend[iGroup-1] || '';
      }
      
      var iPos = sPath.indexOf('/');
      if (iPos <= 0) return;
      var sAlias = sPath.slice(0,iPos), sPath_ = sPath.slice(iPos+1);
      
      var restored = false;
      var toolBtn = self.wdToolbar.querySelector('img[name="SharePrj"]');
      toolBtn.src = 'loading.gif';
      setTimeout( function() {
        if (!restored) {
          restored = true;
          toolBtn.src = 'prj_share.png';
        }
      },20000);
      
      var whenSuccess = function() {
        if (!restored) {
          restored = true;
          toolBtn.src = 'prj_share.png';
        }
        
        alert('Share project successful!');
        self.hideDlg();
        if (!githubSess) {
          self.wdMarkdown.r.tryResetAcl(sPath,sAcl);
          self.wdResPanel.r.tryResetAcl(sPath,sAcl);
        }
        self.wdProjList.r.afterSharePrj(sAlias,sPath_,!!sThumb);
      };
      var whenError = function(sErr) {
        if (!restored) {
          restored = true;
          toolBtn.src = 'prj_share.png';
        }
        alert(sErr);
        if (githubSess) self.hideDlg();
      };
      
      if (githubSess) {
        var sAbsFile = sPath_ + '/$abstract.txt';
        if (sThumb.slice(0,2) == '$$')
          sThumb = '/' + sAlias + '/' + sThumb;
        
        var dOneDoc=null, dRepoJson=githubGetCfg(sAlias);
        if (!dRepoJson) {
          whenError('System error: can not find repository');
          return;
        }
        dOneDoc = _.find(dRepoJson.doc_list,function(item) {
          return item.path == sPath_;
        });
        if (!dOneDoc) {
          whenError('System error: can not find document: ' + sPath_);
          return;
        }
        
        var sNowDate = (new Date()).toLocaleDateString();
        var oldCfgSha = githubCfgSha['/'+sAlias+'/config.json'];
        
        // step 3: upload config.json
        var writeCfgFile = function() {
          $.ajax( { type: 'PUT',
            url: 'https://api.github.com/repos/' + githubUser.login + '/' + sAlias + '/contents/config.json?access_token=' + githubToken,
            data: JSON.stringify( {
              path: 'config.json',
              message: sNowDate,
              content: Gh3.Base64.encode(JSON.stringify(dRepoJson)),
              sha: oldCfgSha,
              branch: 'gh-pages',
            }),
            success: function(res) {
              githubCfgSha['/' + sAlias + '/config.json'] = res.content.sha;
              whenSuccess();
            },
            error: function(res) { // always error if config.json modified at other place
              githubCfgSha['/' + sAlias + '/config.json'] = '';
              whenError('Save config.json failed: ' + ajaxErrDesc(res,'message'));
            },
          });
        };
        
        // step 2: upload $abstract.txt
        var writeAbsFile = function() {
          var sInput = sTitle + '\r\n' + sDesc + '\r\n' + (sKeyword?'<'+sKeyword+'>':'') + '\r\n';
          if (sCfgLine) sInput += sCfgLine;  // keep dConfig in $abstract.txt
          var dData = { path:sAbsFile, message:sNowDate,
                        content:Gh3.Base64.encode(sInput), branch:'gh-pages'};
          if (sSha) dData.sha = sSha;
          
          $.ajax( { type: 'PUT',
            url: 'https://api.github.com/repos/' + githubUser.login + '/' + sAlias + '/contents/' + sAbsFile + '?access_token=' + githubToken,
            data: JSON.stringify(dData),
            
            success: function(res) { // no need record sha of $abstract.txt
              // save $abstract.txt OK, next save config.json
              dOneDoc.title = sTitle;
              dOneDoc.desc = sDesc;
              dOneDoc.keyword = sKeyword;
              dOneDoc.thumb = sThumb;
              dOneDoc.modify_at = parseInt((new Date()).valueOf() / 1000);
              dOneDoc.flag = (dOneDoc.flag & 0xFF);
              
              writeCfgFile();
            },
            
            error: function(res) {
              whenError('Save $abstract.txt failed: ' + ajaxErrDesc(res,'message'));
            },
          });
        };
        
        // step 1: try get sha of config.json
        if (!oldCfgSha) {
          var aFile = new Gh3.File({path:'config.json'},githubUser,sAlias,'gh-pages');
          aFile.fetchContent( function(err, res) {
            if (err) {
              whenError('Read config.json failed: ' + ajaxErrDesc(res,'message'));
              return;
            }
            oldCfgSha = aFile.sha;
            githubCfgSha['/' + sAlias + '/config.json'] = oldCfgSha;
            writeAbsFile();
          });
        }
        else writeAbsFile();
        
        return;
      }
    });
    
    var newBlogFunc = function(currRepo,sAlias,sPath_,isSubPrj,callback) {
      var fDate = new Date();
      var sNowDate = fDate.toLocaleDateString();
      fDate = Math.floor(fDate.valueOf()/1000);
      
      var sCateProj='', bTmp=sPath_.split('/');
      var sPrjName = bTmp.pop();
      if (isSubPrj) {
        bTmp.pop(); // pop '$$'
        sCateProj = bTmp.join('/');
      }
      
      var oldCfgSha = githubCfgSha['/'+sAlias+'/config.json'];
      var mdPath  = sPath_ + '/$index.md';
      var idxPath = sPath_ + '/index.html';
      
      var whenDone = function(sErr) {
        if (typeof callback == 'function')
          callback(sErr);
      };
      
      // step 7: regist config.json
      var registNewDoc = function() {
        if (isSubPrj) {
          self.wdProjList.r.addSubPrjNode(sAlias,[sCateProj,[sPrjName,false]]);
          self.hideDlg();
          whenDone();
        }
        else {
          // insert DOC into repo.doc_list
          var bTmp=currRepo.doc_list;  // already sorted by name
          var fileObj = {path:sPath_, title:sPrjName, keyword:'',
                         desc:'', thumb:'', flag:256+3, create_at:fDate, modify_at:fDate};
          for (var i2=0,item2; item2=bTmp[i2]; i2++) {
            if (sPath_ < item2.path) {
              bTmp.splice(i2,0,fileObj);
              fileObj = null;
              break;
            }
          }
          if (fileObj) bTmp.push(fileObj);
          
          // insert DOC into project tree
          var iRetType = 3, isHidden = 1;
          self.wdProjList.r.addPrjNode([sAlias,sPath_,fDate,iRetType,0,isHidden,'public',0,0]);
          self.hideDlg();
          
          // try upload config.json
          $.ajax( { type:'PUT',
            url: 'https://api.github.com/repos/' + githubUser.login + '/' + sAlias + '/contents/config.json?access_token=' + githubToken,
            data: JSON.stringify({ path: 'config.json',
              message: sNowDate,
              sha: oldCfgSha,
              content: Gh3.Base64.encode(JSON.stringify(currRepo)),
              branch: 'gh-pages',
            }),
            success: function(res) {
              githubCfgSha['/' + sAlias + '/config.json'] = res.content.sha;
              whenDone();
            },
            error: function(res) {
              githubCfgSha['/' + sAlias + '/config.json'] = '';
              whenDone('Create project successful, but regist it failed, you can publish it later');
            },
          });
        }
      };
      
      // step 6: write index.html
      var writeIdxFile = function(sHtml,dirObj) {
        var sSha = '';
        if (dirObj) {
          var oldFile = dirObj.getFileByName('index.html');
          if (oldFile) {
            if (!confirm(idxPath + ' already exists, do you want overwrite it?')) {
              registNewDoc();
              return;
            }
            sSha = oldFile.sha;
          }
        }
        var dOp = { path:idxPath, message:sNowDate,
                    content:Gh3.Base64.encode(sHtml), branch: 'gh-pages' };
        if (sSha) dOp.sha = sSha;
        
        $.ajax( { type:'PUT',
          url: 'https://api.github.com/repos/' + githubUser.login + '/' + sAlias + '/contents/' + idxPath + '?access_token=' + githubToken,
          data: JSON.stringify(dOp),
          success: function(res) {
            registNewDoc();
          },
          error: function(res) {
            whenDone('Write (' + idxPath + ') failed: ' + ajaxErrDesc(res,'message'));
          },
        });
      };
      
      // step 5: write md file
      var writeMdFile = function(sMdInput,sHtml,dirObj) {
        var sSha = '';
        if (dirObj) {
          var oldFile = dirObj.getFileByName('$index.md');
          if (oldFile) {
            if (!confirm(mdPath + ' already exists, do you want overwrite it?')) {
              writeIdxFile(sHtml,dirObj);
              return;
            }
            sSha = oldFile.sha;
          }
        }
        var dOp = { path:mdPath, message:sNowDate,
                    content:Gh3.Base64.encode(sMdInput), branch: 'gh-pages' };
        if (sSha) dOp.sha = sSha;
        
        $.ajax( { type:'PUT',
          url: 'https://api.github.com/repos/' + githubUser.login + '/' + sAlias + '/contents/' + mdPath + '?access_token=' + githubToken,
          data: JSON.stringify(dOp),
          success: function(res) {
            writeIdxFile(sHtml,dirObj);
          },
          error: function(res) {
            whenDone('Write (' + mdPath + ') failed: ' + ajaxErrDesc(res,'message'));
          },
        });
      };
      
      // step 4: read project file tree
      var readProjTree = function(sMdInput,sHtml) {
        var aDir = new Gh3.Dir({path:sPath_},githubUser,sAlias,'gh-pages');
        aDir.fetchContents(function(err,res) {
          if (err) {
            if (res.status == 404) {
              writeMdFile(sMdInput,sHtml,null);
              return;
            }
            whenDone('List directory (' + sPath_ + ') failed: ' + ajaxErrDesc(res,'message'));
            return;
          }
          writeMdFile(sMdInput,sHtml,aDir);
        });
      };
      
      // step 3: read blog.tmpl
      var readIdxHtml = function(sMdInput) {
        $.ajax( { type:'GET',
          url: '//' + githubUser.login + '.github.io/software/blogger10/blog.tmpl',
          dataType: 'html',
          success: function(res) {
            readProjTree(sMdInput,res);
          },
          error: function(res) {
            whenDone('Read file failed: /software/blogger10/blog.tmpl');
          },
        });
      };
      
      // step 2: read markdown.md
      var readDefaultMk = function() {
        $.ajax( { type:'GET',
          url: '//' + githubUser.login + '.github.io/software/blogger10/markdown.md',
          dataType: 'text',
          success: function(res) {
            readIdxHtml(res);
          },
          error: function(res) {
            whenDone('Read file failed: /software/blogger10/markdown.md');
          },
        });
      };
      
      // step 1: check sha of config.json
      if (!oldCfgSha) {
        // try update sha of config.json, maybe config.json be renewed
        var aFile = new Gh3.File({path:'config.json'},githubUser,sAlias,'gh-pages');
        aFile.fetchContent( function(err, res) {
          if (err) {
            whenDone('Read config.json failed: ' + ajaxErrDesc(res,'message'));
            return;
          }
          oldCfgSha = aFile.sha;
          githubCfgSha['/' + sAlias + '/config.json'] = oldCfgSha;
          readDefaultMk();
        });
      }
      else readDefaultMk();
    };
    
    var newSShowFunc = function(currRepo,sAlias,sPath_,isSubPrj,callback) {
      var fDate = new Date();
      var sNowDate = fDate.toLocaleDateString();
      fDate = Math.floor(fDate.valueOf()/1000);
      
      var sCateProj='', bTmp=sPath_.split('/');
      var sPrjName = bTmp.pop();
      if (isSubPrj) {
        bTmp.pop(); // pop '$$'
        sCateProj = bTmp.join('/');
      }
      
      var oldCfgSha = githubCfgSha['/'+sAlias+'/config.json'];
      var txtPath = sPath_ + '/$index.txt';
      var idxPath = sPath_ + '/index.html';
      
      var whenDone = function(sErr) {
        if (typeof callback == 'function')
          callback(sErr);
      };
      
      // step 6: regist config.json
      var registNewDoc = function() {
        if (isSubPrj) {
          self.wdProjList.r.addSubPrjNode(sAlias,[sCateProj,[sPrjName,false]]);
          self.hideDlg();
          whenDone();
        }
        else {
          // insert DOC into repo.doc_list
          var bTmp=currRepo.doc_list;  // already sorted by name
          var fileObj = {path:sPath_, title:sPrjName, keyword:'',
                         desc:'', thumb:'', flag:256+3, create_at:fDate, modify_at:fDate};
          for (var i2=0,item2; item2=bTmp[i2]; i2++) {
            if (sPath_ < item2.path) {
              bTmp.splice(i2,0,fileObj);
              fileObj = null;
              break;
            }
          }
          if (fileObj) bTmp.push(fileObj);
          
          // insert DOC into project tree
          var iRetType = 3, isHidden = 1;
          self.wdProjList.r.addPrjNode([sAlias,sPath_,fDate,iRetType,0,isHidden,'public',0,0]);
          self.hideDlg();
          
          // try upload config.json
          $.ajax( { type:'PUT',
            url: 'https://api.github.com/repos/' + githubUser.login + '/' + sAlias + '/contents/config.json?access_token=' + githubToken,
            data: JSON.stringify({ path: 'config.json',
              message: sNowDate,
              sha: oldCfgSha,
              content: Gh3.Base64.encode(JSON.stringify(currRepo)),
              branch: 'gh-pages',
            }),
            success: function(res) {
              githubCfgSha['/' + sAlias + '/config.json'] = res.content.sha;
              whenDone();
            },
            error: function(res) {
              githubCfgSha['/' + sAlias + '/config.json'] = '';
              whenDone('Create project successful, but regist it failed, you can publish it later');
            },
          });
        }
      };
      
      // step 5: write index.html
      var writeIdxFile = function(sHtml,dirObj) {
        var sSha = '';
        if (dirObj) {
          var oldFile = dirObj.getFileByName('index.html');
          if (oldFile) {
            if (!confirm(idxPath + ' already exists, do you want overwrite it?')) {
              registNewDoc();
              return;
            }
            sSha = oldFile.sha;
          }
        }
        var dOp = { path:idxPath, message:sNowDate,
                    content:Gh3.Base64.encode(sHtml), branch: 'gh-pages' };
        if (sSha) dOp.sha = sSha;
        
        $.ajax( { type:'PUT',
          url: 'https://api.github.com/repos/' + githubUser.login + '/' + sAlias + '/contents/' + idxPath + '?access_token=' + githubToken,
          data: JSON.stringify(dOp),
          success: function(res) {
            registNewDoc();
          },
          error: function(res) {
            whenDone('Write (' + idxPath + ') failed: ' + ajaxErrDesc(res,'message'));
          },
        });
      };
      
      // step 4: write $index.txt
      var writeTxtFile = function(sHtml,dirObj) {
        var sSha = '';
        if (dirObj) {
          var oldFile = dirObj.getFileByName('$index.txt');
          if (oldFile) {
            if (!confirm(txtPath + ' already exists, do you want overwrite it?')) {
              writeIdxFile(sHtml,dirObj);
              return;
            }
            sSha = oldFile.sha;
          }
        }
        var sInput = 'COMPONENT_OF_PINP_SLIDE,2,<page/>\nCOMPONENT_OF_PINP_SLIDE,1,<div class="ebook-title" _zindex="1000" _config="default-large-small default-looser-impacted default-hidden" _left="-348" _top="-144" _width="680"><h1>Title Goes Here Up<br>To Two Lines</h1></div>\n<div class="p1-p2-p3-p0" _zindex="1000" _config="default-large-small default-looser-impacted p1-p2-p3-p0" _left="-344" _top="2" _width="500"><p>Your name<br>May 1, 2015</p></div>';
        var dOp = { path:txtPath, message:sNowDate,
                    content:Gh3.Base64.encode(sInput), branch: 'gh-pages' };
        if (sSha) dOp.sha = sSha;
        
        $.ajax( { type:'PUT',
          url: 'https://api.github.com/repos/' + githubUser.login + '/' + sAlias + '/contents/' + txtPath + '?access_token=' + githubToken,
          data: JSON.stringify(dOp),
          success: function(res) {
            writeIdxFile(sHtml,dirObj);
          },
          error: function(res) {
            whenDone('Write (' + txtPath + ') failed: ' + ajaxErrDesc(res,'message'));
          },
        });
      };
      
      // step 3: read project file tree
      var readProjTree = function(sHtml) {
        var aDir = new Gh3.Dir({path:sPath_},githubUser,sAlias,'gh-pages');
        aDir.fetchContents(function(err,res) {
          if (err) {
            if (res.status == 404) {
              writeTxtFile(sHtml,null);
              return;
            }
            whenDone('List directory (' + sPath_ + ') failed: ' + ajaxErrDesc(res,'message'));
            return;
          }
          writeTxtFile(sHtml,aDir);
        });
      };
      
      // step 2: read index.html
      var readIdxHtml = function() {
        $.ajax( { type:'GET',
          url: '//' + githubUser.login + '.github.io/software/blogger10/slideshow.tmpl',
          dataType: 'html',
          success: function(res) {
            readProjTree(res);
          },
          error: function(res) {
            whenDone('Read file failed: /software/blogger10/slideshow.tmpl');
          },
        });
      };
      
      // step 1: check sha of config.json
      if (!oldCfgSha) {
        // try update sha of config.json, maybe config.json be renewed
        var aFile = new Gh3.File({path:'config.json'},githubUser,sAlias,'gh-pages');
        aFile.fetchContent( function(err, res) {
          if (err) {
            whenDone('Read config.json failed: ' + ajaxErrDesc(res,'message'));
            return;
          }
          oldCfgSha = aFile.sha;
          githubCfgSha['/' + sAlias + '/config.json'] = oldCfgSha;
          readIdxHtml();
        });
      }
      else readIdxHtml();
    };
    
    DCF.regist('createProject', function(bArgs) {
      var sOwner = (bArgs[0] || '').trim();
      var sCate = (bArgs[1] || '').trim();
      var iPrjType = (bArgs[2]? 1: 2); // 1:blog, 2:slideshow
      var iFlag = bArgs[4] || 0;       // 0:public 1:protected 2:private
      
      var sPrjName = (bArgs[3] || '').trim();
      if (!sPrjName) {
        alert('Project name can not empty!');
        return;
      }
      else {
        if (anyCharIn('?*|:"<>\\/',sPrjName)) {
          alert('Project name can not contains: ? * | : " < > \\ /');
          return;
        }
      }
      if (iPrjType == 1 && sPrjName.slice(-5) != '.blog')
        sPrjName += '.blog';
      else if (iPrjType == 2 && sPrjName.slice(-6) != '.sshow')
        sPrjName += '.sshow';
      
      if (sCate && sCate[sCate.length-1] == '/')
        sCate = sCate.slice(0,-1);
      if (sOwner && sOwner[sOwner.length-1] == '/')
        sOwner = sOwner.slice(0,-1);
      var sTmp = sOwner;
      if (sCate) {
        if (sTmp)
          sTmp += '/' + sCate;
        else sTmp = sCate;
      }
      var bCate = sTmp.split('/');
      if (bCate.length < 2) {
        if (githubSess)
          alert("Invalid 'repository/category' name");
        else alert('Category name lost');
        return;
      }
      
      var currRepo=null, sAlias=bCate.shift();
      if (githubSess) {
        currRepo = githubGetCfg(sAlias);
        if (!currRepo) {
          alert('Invalid repository name: ' + sAlias);
          return;
        }
      }
      else {
        if (sAlias != self.data.login.alias) {
          alert('Invalid alias name');
          return;
        }
      }
      
      for (var i=bCate.length-1; i >= 0; i--) {
        var item = bCate[i];
        if (!item) {
          alert('Invalid category name');
          return;
        }
        if (anyCharIn('?*|:"<>\\',item)) {
          alert('Category name can not contains: ? * | : " < > \\');
          return;
        }
        
        var sTmp = item.slice(0,2);
        if (sTmp != '$$') {
          if (sTmp[0] == '$')
            bCate[i] = '$' + item;
          else bCate[i] = '$$' + item;
        }
      }
      sCate = bCate.join('/');
      var sPath_ = sCate + '/' + sPrjName;
      
      if (githubSess) {
        var dExist = _.find(currRepo.doc_list,function(item) {
          return item.path == sPath_;
        });
        if (dExist) {
          alert('Error: project (' + sPath_ + ') already exists');
          return;
        }
      }
      
      var restored = false;
      var toolBtn = self.wdToolbar.querySelector('img[name="CreatePrj"]');
      toolBtn.src = 'loading.gif';
      setTimeout(function(){
        if (!restored) {
          restored = true;
          toolBtn.src = 'prj_add.png';
        }
      },20000);
      
      var whenSuccess = function() {
        if (!restored) {
          restored = true;
          toolBtn.src = 'prj_add.png';
        }
        alert('Add project successful');
      };
      var whenError = function(sErr) {
        if (!restored) {
          restored = true;
          toolBtn.src = 'prj_add.png';
        }
        alert(sErr);
      };
      
      if (githubSess) {
        if (iPrjType == 1) {  // blog
          newBlogFunc(currRepo,sAlias,sPath_,false, function(sErr) {
            if (sErr)
              whenError(sErr);
            else whenSuccess();
          });
        }
        else { // sshow project
          newSShowFunc(currRepo,sAlias,sPath_,false, function(sErr) {
            if (sErr)
              whenError(sErr);
            else whenSuccess();
          });
        }
        
        return;
      }
    });
    
    DCF.regist('createSubProject', function(bArgs) {
      var sPath = (bArgs[0] || '').trim();
      var iPrjType = (bArgs[1]? 1: 2);  // 1:blog, 2:slideshow
      var sPrjName = (bArgs[2] || '').trim();
      if (!sPrjName) {
        alert('Project name can not empty!');
        return;
      }
      else {
        if (anyCharIn('?*|:"<>\\/',sPrjName)) {
          alert('Project name can not contains: ? * | : " < > \\ /');
          return;
        }
      }
      if (iPrjType == 1 && sPrjName.slice(-5) != '.blog')
        sPrjName += '.blog';
      else if (iPrjType == 2 && sPrjName.slice(-6) != '.sshow')
        sPrjName += '.sshow';
      
      var iPos = sPath.indexOf('/');
      if (iPos <= 0) {
        alert('Invalid project owner name');
        return;
      }
      var sAlias=sPath.slice(0,iPos), sPath_=sPath.slice(iPos+1);
      
      var currRepo = null;
      if (githubSess) {
        currRepo = githubGetCfg(sAlias);
        if (!currRepo) {
          alert('Invalid repository name: ' + sAlias);
          return;
        }
        var existDoc = _.find(currRepo.doc_list,function(item) {
          return item.path == sPath_;
        });
        if (!existDoc) {
          alert('Error: project (' + sPath_ + ') inexistent');
          return;
        }
      }
      
      var restored = false;
      var toolBtn = self.wdToolbar.querySelector('img[name="CreateSubPrj"]');
      toolBtn.src = 'loading.gif';
      setTimeout(function(){
        if (!restored) {
          restored = true;
          toolBtn.src = 'prj_addsub.png';
        }
      },20000);
      
      var whenSuccess = function() {
        if (!restored) {
          restored = true;
          toolBtn.src = 'prj_addsub.png';
        }
        alert('Add sub-project successful');
      };
      var whenError = function(sErr) {
        if (!restored) {
          restored = true;
          toolBtn.src = 'prj_addsub.png';
        }
        alert(sErr);
      };
      
      if (githubSess) {
        if (iPrjType == 1) {  // blog
          var prjBaseDir = sPath_ + '/$$/' + sPrjName;
          newBlogFunc(currRepo,sAlias,prjBaseDir,true, function(sErr) {
            if (sErr)
              whenError(sErr);
            else whenSuccess();
          });
        }
        else { // sshow
          var prjBaseDir = sPath_ + '/$$/' + sPrjName;
          newSShowFunc(currRepo,sAlias,prjBaseDir,true, function(sErr) {
            if (sErr)
              whenError(sErr);
            else whenSuccess();
          });
        }
        
        return;
      }
    });
    
    DCF.regist('removeProject', function(bArgs) {
      var sEditFlag = bArgs.shift(), editingRmv = false;
      var sPath=(bArgs[0] || '').trim(), bSubs=[], iLen=bArgs.length;
      if (!sPath) return;
      for (var i=1; i < iLen; i++) {
        var item = bArgs[i];
        bSubs.push(item);
        if (i == 1 && item) { // item = '*' means include root project
          if (sEditFlag) editingRmv = true;
          break; // means remove this and all-sub
        }
        if (i > 1 && item == sEditFlag)
          editingRmv = true;
      }
      if (bSubs.length == 1 && !bSubs[0]) {
        alert('No project selected, nothing removed!');
        self.hideDlg();
        return;
      }
      else if (!confirm('Do you want remove selected project?'))
        return;
      
      var iPos=sPath.indexOf('/');
      if (iPos <= 0) return;
      var sAlias=sPath.slice(0,iPos), sPath_=sPath.slice(iPos+1);
      
      var restored = false;
      var toolBtn = self.wdToolbar.querySelector('img[name="RemovePrj"]');
      toolBtn.src = 'loading.gif';
      setTimeout(function(){
        if (!restored) {
          restored = true;
          toolBtn.src = 'prj_rmv.png';
        }
      },20000);
      
      var whenSuccess = function() {
        if (!restored) {
          restored = true;
          toolBtn.src = 'prj_rmv.png';
        }
        alert('Remove project successful');
        if (editingRmv)
          self.wdMarkdown.r.cancelEditing();
      };
      var whenError = function(sErr) {
        if (!restored) {
          restored = true;
          toolBtn.src = 'prj_rmv.png';
        }
        alert(sErr);
      };
      
      if (githubSess) {
        var dOneDoc=null, dRepoJson=githubGetCfg(sAlias);
        if (!dRepoJson) {
          alert('System error: can not find repository');
          return;
        }
        dOneDoc = _.find(dRepoJson.doc_list,function(item) {
          return item.path == sPath_;
        });
        if (!dOneDoc) {
          alert('System error: can not find document: ' + sPath_);
          return;
        }
        
        var fDate = new Date();
        var sNowDate = fDate.toLocaleDateString();
        fDate = Math.floor(fDate.valueOf()/1000);
        
        var oldCfgSha = githubCfgSha['/' + sAlias + '/config.json'];
        var isRmvAll = !!bSubs[0], bRmvDir = [];
        if (isRmvAll)
          bRmvDir.push(sPath_);
        else {
          for (var i=1,item; item=bSubs[i]; i++) {
            bRmvDir.push(sPath_ + '/$$/' + item);
          }
        }
        
        // step 3: upload config.json
        var removeProjFile = null;
        var writeCfgJson = function(sErr) {
          removeProjFile = null; // avoid recursive hold
          
          if (sErr) {
            whenError(sErr);
            return;
          }
          
          self.wdProjList.r.rmvPrjNode(sPath,bSubs,[]);
          self.hideDlg();
          
          if (!isRmvAll)
            whenSuccess();
          else {
            var iPos = dRepoJson.doc_list.indexOf(dOneDoc);
            if (iPos < 0) {
              whenSuccess();
              return;
            }
            
            dRepoJson.doc_list.splice(iPos,1);
            $.ajax( { type: 'PUT',
              url: 'https://api.github.com/repos/' + githubUser.login + '/' + sAlias + '/contents/config.json?access_token=' + githubToken,
              data: JSON.stringify( {
                path: 'config.json',
                message: sNowDate,
                content: Gh3.Base64.encode(JSON.stringify(dRepoJson)),
                sha: oldCfgSha,
                branch: 'gh-pages',
              }),
              success: function(res) {
                githubCfgSha['/' + sAlias + '/config.json'] = res.content.sha;
                whenSuccess();
              },
              error: function(res) { // always error if config.json modified at other place
                githubCfgSha['/' + sAlias + '/config.json'] = '';
                whenError('Save config.json failed: ' + ajaxErrDesc(res,'message'));
              },
            });
          }
        };
        
        // step 2: remove project files
        removeProjFile = function() {
          var listErr=false, iNum=0, iDirNum=0, iRmv=0, iErr=0;
          
          var hasDone_ = false;
          var allFileDone = function() {
            if (hasDone_) return;
            hasDone_ = true;
            
            if (listErr || iErr)
              writeCfgJson('Delete project failed (some files not removed), please try again!');
            else writeCfgJson('');
          };
          
          var removeOne = function(sPath,sSha) {
            $.ajax( { type:'DELETE',
              url: 'https://api.github.com/repos/' + githubUser.login + '/' + sAlias + '/contents/' + sPath + '?access_token=' + githubToken,
              data: JSON.stringify( {path: sPath,
                message: sNowDate,
                sha: sSha,
                branch: 'gh-pages',
              }),
              success: function(res) {
                iRmv += 1;
                if (iRmv + iErr >= iNum)
                  allFileDone();
              },
              error: function(res) {
                iErr += 1;
                if (iRmv + iErr >= iNum)
                  allFileDone();
              },
            });
          };
          
          var recursiveRmv = function(aDir,callback) {
            iDirNum += 1;
            aDir.fetchContents( function(err,res) {
              if (err) {
                if (res.status != 404)
                  listErr = true;
                callback();
                return;
              }
              
              var bTmp=[], bTmp2=[], iCount=0;
              
              aDir.eachContent( function(item) {
              if (item.type == 'file') {
                  iCount += 1;
                  bTmp.push([item.path,item.sha]);
                }
                else if (item.type == 'dir') {
                  iCount += 1;
                  bTmp2.push(item);
                }
              });
              
              if (iCount) {
                iNum += bTmp.length;
                
                var gotoNext = function() {
                  var item = bTmp2.pop();
                  if (item)
                    recursiveRmv(item,gotoNext);
                  else {
                    item = bTmp.pop();
                    if (item) {
                      setTimeout( function() {
                        removeOne(item[0],item[1]);
                        gotoNext();
                      }, 500); // not run too fast to avoid '409 conflict' error
                    }
                    else callback(); // finished
                  }
                };
                gotoNext();
              }
              else callback(); // finished
            });
          };
          
          var runNextDir = function() {
            var item = bRmvDir.shift();
            if (item) // run one by one, avoid too fast
              recursiveRmv(new Gh3.Dir({path:item},githubUser,sAlias,'gh-pages'),runNextDir);
            else { // all dir scan task started
              if (iNum == 0) // nothing to remove, should manual fire allFileDone
                allFileDone();
            }
          };
          runNextDir();
        };
        
        // step 1: check sha of config.json
        if (!oldCfgSha) {
          // try update sha of config.json, maybe config.json be renewed
          var aFile = new Gh3.File({path:'config.json'},githubUser,sAlias,'gh-pages');
          aFile.fetchContent( function(err, res) {
            if (err) {
              whenError('Read config.json failed: ' + ajaxErrDesc(res,'message'));
              return;
            }
            oldCfgSha = aFile.sha;
            githubCfgSha['/' + sAlias + '/config.json'] = oldCfgSha;
            removeProjFile();
          });
        }
        else removeProjFile();
        
        return;
      }
    });
    
    // from slide ifram
    //-----------------
    DCF.regist('editPrepost', function(bArgs) {
      self.editPrepost(bArgs[0],bArgs[1],bArgs[2]);
    });
    DCF.regist('savePrepost', function(bArgs) {
      self.wdMarkdown.r.postSlideMsg('savePrepost',bArgs);
      self.hideDlg();
    });
    
    DCF.regist('editSlideTxt', function(bArgs) {
      if (!self.data.finished) {
        alert('System error: previous task not finished yet!');
        self.hideDlg();
        return;
      }
      self.editSlideTxt(bArgs[0],bArgs[1]);
    });
    DCF.regist('saveSlideTxt', function(bArgs) {
      self.wdMarkdown.r.postSlideMsg('saveSlideTxt',bArgs);
      self.hideDlg();
    });
    
    DCF.regist('editTableData', function(bArgs) {
      self.editTableData(bArgs[0],bArgs[1],bArgs[2],bArgs[3],bArgs[4],bArgs[5]);
    });
    DCF.regist('saveTableData', function(bArgs) {
      self.wdMarkdown.r.postSlideMsg('saveTableData',bArgs);
      self.hideDlg();
    });
    
    DCF.regist('editShapeData', function(bArgs) {
      self.editShapeData(bArgs[0],bArgs[1],bArgs[2],bArgs[3],bArgs[4],bArgs[5]);
    });
    DCF.regist('saveShapeData', function(bArgs) {
      self.wdMarkdown.r.postSlideMsg('saveShapeData',bArgs);
      self.hideDlg();
    });
    
    DCF.regist('editPaperData', function(bArgs) {
      self.editPaperData(bArgs[0],[bArgs[1],bArgs[2],bArgs[3],bArgs[4],bArgs[5],bArgs[6],bArgs[7],bArgs[8]]);
    });
    window.updatePaperContent = function(isOk,nodeId,sHtml) {
      self.wdResPanel.style.height = '100%';
      self.wdPreviewArea.style.display = 'block';
      self.hideDlg();
      if (isOk) self.wdMarkdown.r.postSlideMsg('savePaperData',[nodeId,sHtml]);
    };
    window.copyToClipboard_ = function(sClip,x,y) {
      var frm = self.wdMarkdown.querySelector('iframe');
      if (frm && frm.contentWindow.apiNode)
        frm.contentWindow.apiNode.copyToClipboard(sClip,x,y);
    };
    window.textOfClipboard_ = function() {
      var frm = self.wdMarkdown.querySelector('iframe');
      if (frm && frm.contentWindow.apiNode)
        return frm.contentWindow.apiNode.textOfClipboard();
      else return '';
    };
    
    self.on('afterLogin', function(event) {
      self.wdProjList.r.fire('refresh');
      setTimeout( function() {
        self.hideDlg();
        if (self.data.taskAtLogin) {
          if (self.data.taskAtLogin == 'submit' && self.wdMarkdown.r.data.currProj)
            self.wdMarkdown.r.startSubmitDoc();
          self.data.taskAtLogin = '';
        }
      },1500);
    });
  },
  
  showDlg: function(param) {
    var percentOf = function(f,v) {
      if (f < 1) {
        if (f < 0)
          return 0;
        else if (f < 0.9999)
          return Math.floor(f * v + 0.5);
        else return v;
      }
      else return Math.floor(f + 0.5);
    };
    
    var sUrl = param.url;
    if (!sUrl && (param.bodyHtml || param.jsScript))
      sUrl = '/software/pages/simple_dialog.html';
    if (!sUrl) return;
    
    var fX = percentOf(param.left || 0,window.innerWidth);
    var fY = percentOf(param.top || 0,window.innerHeight);
    var fW = percentOf(param.width || 0.9999,window.innerWidth);
    var fH = percentOf(param.height || 0.9999,window.innerHeight);
    
    var hi = this.wdToolbar.parentNode.clientHeight + Math.max(this.wdProjList.clientHeight,this.wdMarkdown.parentNode.clientHeight + this.wdPreviewArea.clientHeight);
    this.wdInfoMask.style.width = window.innerWidth + 'px';
    this.wdInfoMask.style.height = Math.max(window.innerHeight,hi) + 'px';
    this.wdInfoMask.style.display = 'block';
    
    this.wd.style.left = fX + 'px';
    this.wd.style.top = fY + 'px';
    this.wd.style.width = fW + 'px';
    this.wd.style.height = fH + 'px';
    this.wd.style.display = 'block';
    
    var busyImg = this.wd.querySelector('div.dlg-loading');
    busyImg.style.display = 'block';
    
    var wdgt=this, frm=this.wd.querySelector('iframe');
    frm.onload = function(event) {
      busyImg.style.display = 'none';
      if (param.closable)
        wdgt.data.finished = true;
      
      var nextFn = function() {
        R.getDCF().call('wdPopDlgForm','initGui',[param.bodyHtml || '',param.jsScript || ''],3000,function(ret) {
          if (param.onReady)
            param.onReady();
        },function(dArg) { // check: dArg.isReady, dArg.isTimeout
          alert('System error');
        })
      };
      
      if (param.peerName || param.bodyHtml || param.jsScript) {
        if (param.peerName) {
          R.getDCF().setPeerName('wdPopDlgForm',param.peerName,3000,function(dRet) {
            if (dRet.state == 'OK') {
              if (param.bodyHtml || param.jsScript)
                nextFn();
              else {
                if (param.onReady)
                  param.onReady();
              }
            }
            else alert('System error');
          })
        }
        else {
          if (param.bodyHtml || param.jsScript)
            nextFn();
          else {
            if (param.onReady)
              param.onReady();
          }
        }
      }
      else {
        if (param.onReady)
          param.onReady();
      }
    };
    
    this.data.finished = false;
    this.refreshUrl(sUrl);
  },
  
  hideDlg: function() {
    this.wdInfoMask.style.display = 'none';
    this.wd.style.display = 'none';
  },
  
  tryHideDlg: function() {
    if (this.data.finished) {
      this.wdInfoMask.style.display = 'none';
      this.wd.style.display = 'none';
      return true;
    }
    return false;
  },
  
  checkLogin: function(isForce,sTask) {
    if (!isForce && this.data.login.hasLogin && this.data.login.failCount == 0) return;
    
    if (sTask) this.data.taskAtLogin = sTask;
    this.showDlg({
      left: Math.floor(window.innerWidth/2 - 310),
      top: Math.floor(window.innerHeight/2 - 180),
      width: 620,
      height: 360,
      url: '//' + PINP_HOST_DOMAIN + '/admin/writer/relay?check=1',
      closable: false,
      // peerName:'', bodyHtml:'', jsScript:'', onReady:null,
    });
  },
  
  startShareDoc: function() {
    var sPath='', canWrite=true, node=this.wdProjList.querySelector('.prj-item.prj-selected2');
    if (node && (node.classList.contains('prj-sub-item') || node.classList.contains('prj-curr-item'))) {
      sPath = node.getAttribute('title');
      
      var sName = node.getAttribute('name');
      if (sName && sName.indexOf('prj-') == 0) {
        var dCfg = this.wdProjList.r.data.items[parseInt(sName.slice(4))];
        if (dCfg) canWrite = dCfg.canWrite;
      }
    }
    if (!sPath) {
      alert('Please select a project first!');
      return false;
    }
    if (!canWrite) {
      alert('Can not share this project: not online document');
      return false;
    }
    
    if (sPath == this.wdMarkdown.r.data.currProj && this.wdMarkdown.r.data.changed) {
      if (!confirm('The project still in editing, do you want continue?'))
        return false;
    }
    var iPos = sPath.indexOf('/');
    if (iPos <= 0) return;
    var sAlias=sPath.slice(0,iPos), sPath_=sPath.slice(iPos+1);
    var sAllow = node.getAttribute('allow') || 'private';
    var bFriend = githubSess? []: this.wdProjList.r.data.friendGroup;
    
    var self = this;
    var nextStep = function(sTitle,sDesc,sKeyword,sThumb,sha,sCfgLine) {
      var sJsCode = 'var gitSha = "' + (sha || '') + '";\n' +
"var gitCfgLine = '" + sCfgLine.replace(/'/gm,"\\'") + "';\n" +
'var initAclIndex = ' + (sAllow=='public'?'0':(sAllow=='protected'?'1':'2')) + ';\n' +
'var inputTitle = "' + sTitle + '";\n' +
'var inputDesc = "' + sDesc + '";\n' +
'var inputKeyword = "' + sKeyword + '";\n' +

'function location__(href) {\n' +
'  var location = document.createElement("a");\n' +
'  location.href = href;\n' +
'  if (location.host == "")\n' +
'    location.href = location.href;\n' +
'  return location;\n' +
'}\n' +

'function applySharePrj() {\n' +
'  var sPath = "' + sPath + '";\n' +
'  var frm = document.querySelector("form");\n' +
'  var iAcl=0, iGroup=0;\n' +
'  if (frm.prjAcl) {\n' +
'    iAcl = frm.prjAcl[0].checked?0:(frm.prjAcl[1].checked?1:2);\n' +
'    var iGroup = 0; for (var i=0,item; item=frm.aclGroup[i]; i++) {\n' +
'      if (item.checked) {iGroup = i; break;}\n' +
'    }\n' +
'  }\n' +

'  var sTitle = frm.prjTitle.value.trim().slice(0,160);\n' +
'  var sDesc = frm.prjDesc.value.trim().slice(0,256);\n' +
'  var sKeyword = frm.prjKeyword.value.trim().slice(0,160);\n' +
'  sTitle = sTitle.replace(/"/gm,""); sDesc = sDesc.replace(/"/gm,""); sKeyword = sKeyword.replace(/"/gm,"");\n' +
'  var sThumb = frm.prjThumb.value.trim();\n' +
'  if (sThumb && frm.prjAcl) sThumb = location__(sThumb).href;\n' +
'  document.getElementById("btn-apy").disabled = true;\n' +
'  DCF.call("parent","shareProject",[iAcl,iGroup,sPath,sTitle,sDesc,sKeyword,sThumb,gitSha,gitCfgLine]);\n' +
'}\n' +

'function cfgModified(event) {\n' +
'  document.getElementById("btn-apy").disabled = false;\n' +
'}\n' +

'function checkAcl() {\n' +
'  document.getElementById("btn-apy").disabled = false;\n' +
'  var frm = document.querySelector("form");\n' +
'  var isReadonly = !frm.prjAcl[2].checked;\n' +
'  document.getElementById("acl-group").style.color = isReadonly?"#ccc":"black";\n' +
'  for (var i=0,item; item=frm.aclGroup[i]; i++) {\n' +
'    item.disabled = isReadonly;\n' +
'  }\n' +
'}\n' +

'function initInputData(i) {\n' +
'  var frm = document.querySelector("form");\n' +
'  frm.prjTitle.value = inputTitle;\n' +
'  frm.prjDesc.value = inputDesc;\n' +
'  frm.prjKeyword.value = inputKeyword;\n' +
'  if (frm.prjAcl) {\n' +
'    frm.prjAcl[i].setAttribute("checked","checked");\n' +
'    checkAcl();\n' +
'  }\n' +
'}\n' +
'initInputData(initAclIndex);';

      var sHtml = '<div style="position:absolute; left:0px; top:0px; width:100%; height:28px; font-size:16px; background-color:#408080; color:white; text-align:center; line-height:28px; font-weight:600; cursor:default">Share project</div><div style="width:100; height:28px"></div>\n';
      sHtml += '<p style="font-size:14px; word-break:break-all; color:gray">Owner: ' + htmlEncode(sPath) + '</p>\n<form>\n';
      if (!githubSess) {
        sHtml += '<p>Project type<br><input type="radio" name="prjAcl" onclick="checkAcl()" checked>public&nbsp;&nbsp;&nbsp;<input type="radio" name="prjAcl" onclick="checkAcl()">protected&nbsp;&nbsp;&nbsp;<input type="radio" name="prjAcl" onclick="checkAcl()">private</p>\n';
        sHtml += '<div id="acl-group">&nbsp;&nbsp;&nbsp;<input type="radio" name="aclGroup" onclick="cfgModified(event)" checked>Only for myself\n';
        for (var i=0,item; item=bFriend[i]; i++) {
          sHtml += '<br>&nbsp;&nbsp;&nbsp;<input type="radio" name="aclGroup" onclick="cfgModified(event)">' + htmlEncode(item) + '\n';
        }
        sHtml += '</div>\n';
      }
      sHtml += '<p>Document title<br><input name="prjTitle" type="text" style="width:340px" onchange="cfgModified(event)"><br>\n';
      sHtml += 'Description <span style="font-size:14px; color:gray">(within 140 characters)</span><br><textarea name="prjDesc" style="width:340px; height:70px" onchange="cfgModified(event)"></textarea><br>\n';
      sHtml += 'Document Keyword<br><input name="prjKeyword" type="text" placeholder="keyword1,keyword2,..." style="width:340px" onchange="cfgModified(event)"><br>';
      sHtml += 'Thumbnail picture <span style="font-size:14px; color:gray">(input image URL)</span><br><input name="prjThumb" type="text" style="width:340px" value="' + sThumb + '" onchange="cfgModified(event)"></p>\n';
      sHtml += '</form>\n<p><button id="btn-apy" onclick="applySharePrj()">Apply</button></p>';
      
      var iHi = bFriend.length <= 4? 540: (bFriend.length <= 8? 580: 620);
      if (githubSess) iHi -= 80;
      self.showDlg({
        left: Math.floor((window.innerWidth-400)/2),
        top: Math.floor((window.innerHeight-iHi)/2),
        width: 400, height: iHi,
        url: '/software/pages/simple_dialog.html',
        closable: true,
        peerName: 'wdPopDlgForm',
        bodyHtml: sHtml,
        jsScript: sJsCode,
      });
    };
    
    if (githubSess) {
      var aFile = new Gh3.File({path:sPath_+'/$abstract.txt'},githubUser,sAlias,'gh-pages');
      aFile.fetchContent( function(err, res) {
        var sTitle='', sDesc='', sKeyword='', sSha='', sThumb='', sCfgLine='';
        var dCfg = githubGetCfg(sAlias);
        var oneDoc = _.find(dCfg.doc_list, function(item) {
          return item.path == sPath_;
        });
        if (oneDoc) sThumb = oneDoc.thumb || '';
        if (sThumb.slice(0,2) == '$$')
          sThumb = '/' + sAlias + '/' + sThumb;
        
        if (!err) {
          sSha = aFile.sha;
          
          var sTxt=aFile.getRawContent(), b=sTxt.split('\n');
          sTitle = (b[0] || '').trim().replace(/"/gm,'');
          sDesc = (b[1] || '').trim().replace(/"/gm,'');
          sKeyword = (b[2] || '').trim().replace(/"/gm,'');
          sCfgLine = (b[3] || '').trim();
          if (sKeyword && sKeyword[0] == '<' && sKeyword[sKeyword.length-1] == '>')
            sKeyword = sKeyword.slice(1,-1);
        } // else, maybe no $abstract.txt exists yet
        nextStep(sTitle,sDesc,sKeyword,sThumb,sSha,sCfgLine);
      });
      
      return;
    }
  },
  
  createPrj: function() {
    var sPath='', node=this.wdProjList.querySelector('.prj-item.prj-selected2');
    if (node && (node.classList.contains('prj-sub-item') || node.classList.contains('prj-curr-item')))
      sPath = node.getAttribute('title') || '';
    else {
      node = this.wdProjList.querySelector('.prj-item.prj-selected');
      if (node && node.classList.contains('prj-cate-folder'))
        sPath = node.getAttribute('title') || '';
      else {
        if (githubSess)
          sPath = '';
        else sPath = this.data.login.alias + '/' + this.wdProjList.r.data.currCate;
      }
    }
    if (!githubSess && !sPath) return false;
    
    var b = sPath.split('/');
    if (b.length > 1) b.pop();
    var lostAlias=false, isRootPrj=true;
    if (githubSess) {
      if (!sPath)
        lostAlias = true;
      else {
        if (b.length >= 2)
          isRootPrj = false;
      }
    }
    else {
      if (b.length >= 2)
        isRootPrj = false;
    }
    var sFolder = b.join('/');  // sFolder maybe ''
    
    var sJsCode = 'function applyCreatePrj() {\n' +
'  var sOwner = "' + sFolder + '";\n' +
'  var frm = document.querySelector("form");\n' +
'  var sCate = frm.prjPath.value.trim();\n' +
'  var iFlag = 0; if (frm.prjShare) iFlag = frm.prjShare[0].checked?0:(frm.prjShare[1].checked?1:2);\n' +
'  var bArgs = [sOwner,sCate,frm.prjType[0].checked,frm.prjName.value,iFlag];\n' +
'  document.getElementById("btn-apy").disabled = true;\n' +
'  DCF.call("parent","createProject",bArgs);\n' +
'}\n' +

'function cfgModified(event) {\n' + 
'  document.getElementById("btn-apy").disabled = false;\n' +
'}';
    
    var sHtml = '<div style="position:absolute; left:0px; top:0px; width:100%; height:28px; font-size:16px; background-color:#408080; color:white; text-align:center; line-height:28px; font-weight:600; cursor:default">Create project</div><div style="width:100; height:28px"></div>\n';
    if (sFolder)
      sHtml += '<p style="font-size:14px; word-break:break-all; color:gray">Owner: ' + htmlEncode(sFolder+'/') + '</p>\n';
    sHtml += '<form><p>Project type<br><input type="radio" name="prjType" onclick="cfgModified(event)" checked>blog&nbsp;&nbsp;&nbsp;&nbsp;<input type="radio" name="prjType" onclick="cfgModified(event)">slideshow</p>\n';
    if (!githubSess)
      sHtml += '<p>Sharing<br><input type="radio" name="prjShare" onclick="cfgModified(event)"><span title="for all visitor">public</span>&nbsp;&nbsp;<input type="radio" name="prjShare" onclick="cfgModified(event)"><span title="for all logined visitor">protected</span>&nbsp;&nbsp;<input type="radio" name="prjShare" onclick="cfgModified(event)" checked><span title="only for yourself">private</span></p>\n';
    sHtml += '<p>Category <span style="font-size:14px; color:gray">(';
    if (lostAlias)
      sHtml += 'repository/category';
    else if (isRootPrj)
      sHtml += 'category';
    else sHtml += 'category or leave it empty';
    sHtml += ')</span><br><input name="prjPath" type="text" style="width:340px" value="" onchange="cfgModified(event)"></p>\n';
    sHtml += '<p>Project name<br><input type="text" name="prjName" style="width:340px" value="" onchanged="cfgModified(event)"></p></form>\n';
    sHtml += '<p><button id="btn-apy" onclick="applyCreatePrj()">Apply</button></p>';
    
    var hi = 380;
    if (githubSess) hi -= 36;
    this.showDlg({
      left: Math.floor((window.innerWidth-420)/2),
      top: Math.floor((window.innerHeight-hi)/2),
      width: 420, height: hi,
      url: '/software/pages/simple_dialog.html',
      closable: true,
      peerName: 'wdPopDlgForm',
      bodyHtml: sHtml,
      jsScript: sJsCode,
    });
    return true;
  },
  
  createSubPrj: function() {
    var sPath='', node=this.wdProjList.querySelector('.prj-item.prj-selected2');
    if (node && (node.classList.contains('prj-sub-item') || node.classList.contains('prj-curr-item')))
      sPath = node.getAttribute('title');
    if (!sPath) {
      alert('Please select a project first!');
      return false;
    }
    
    var sJsCode = 'function applyCreatePrj() {\n' +
'  var frm = document.querySelector("form");\n' +
'  var bArgs = ["' + sPath + '",frm.prjType[0].checked,frm.prjName.value];\n' +
'  document.getElementById("btn-apy").disabled = true;\n' +
'  DCF.call("parent","createSubProject",bArgs);\n' +
'}\n' +

'function cfgModified(event) {\n' +
'  document.getElementById("btn-apy").disabled = false;\n' +
'}';
    
    var sHtml = '<div style="position:absolute; left:0px; top:0px; width:100%; height:28px; font-size:16px; background-color:#408080; color:white; text-align:center; line-height:28px; font-weight:600; cursor:default">Create sub-project</div><div style="width:100; height:28px"></div>\n';
    sHtml += '<p style="font-size:14px; word-break:break-all; color:gray">Owner: ' + htmlEncode(sPath) + '</p>\n';
    sHtml += '<form><p>Project type<br><input type="radio" name="prjType" onclick="cfgModified(event)" checked>blog&nbsp;&nbsp;&nbsp;&nbsp;<input type="radio" name="prjType" onclick="cfgModified(event)">slideshow</p>\n';
    sHtml += '<p>Project name<br><input type="text" name="prjName" style="width:340px" value="" onchange="cfgModified(event)"></p></form>\n';
    sHtml += '<p><button id="btn-apy" onclick="applyCreatePrj()">Apply</button></p>';
    
    this.showDlg({
      left: Math.floor((window.innerWidth-420)/2),
      top: Math.floor((window.innerHeight-290)/2),
      width: 420, height: 290,
      url: '/software/pages/simple_dialog.html',
      closable: true,
      peerName: 'wdPopDlgForm',
      bodyHtml: sHtml,
      jsScript: sJsCode,
    });
    return true;
  },
  
  removePrj: function() {
    var sPath='', bSub=[], node=this.wdProjList.querySelector('.prj-item.prj-selected2');
    if (node && (node.classList.contains('prj-sub-item') || node.classList.contains('prj-curr-item'))) {
      sPath = node.getAttribute('title');
      if (sPath) {
        var nextNode = node.nextElementSibling;
        while (nextNode && nextNode.classList.contains('prj-sub2-item')) {
          var s = nextNode.getAttribute('title');
          if (s && s.indexOf(sPath) == 0) {
            var b = s.split('/');
            bSub.push(b[b.length-1]);
          }
          nextNode = nextNode.nextElementSibling;
        }
      }
    }
    if (!sPath) return false;
    
    var editingFlag = this.wdMarkdown.r.prjInEditing(sPath); // '' '*' 'subProjName'
    if (editingFlag) {
      var ss = editingFlag == '*'? 'Selected project current in editing,': 'One of sub-project in editing,';
      if (!confirm(ss + ' continue to remove?'))
        return false;
    }
    
    var sJsCode = 'var editingFlag = "' + editingFlag + '";\n' +
'function applyRemovePrj() {\n' +
'  var bArgs=[editingFlag], nodes=document.querySelectorAll("input[_name]");\n' +
'  for (var i=0,node; node=nodes[i]; i++) {\n' +
'    var sName = node.getAttribute("_name");\n' +
'    if (i == 0) {\n' +
'      bArgs.push(sName);\n' +
'      if (node.checked) { bArgs.push("*"); break; }\n' +
'      else bArgs.push("");\n' +
'    } else {\n' +
'      if (node.checked) bArgs.push(sName);\n' +
'    }\n' +
'  }\n' +
'  document.getElementById("btn-apy").disabled = true;\n' +
'  DCF.call("parent","removeProject",bArgs);\n' +
'}\n' +

'function rootChanged(event,rootNode) {\n' +
'  var bRet=[], nodes = document.querySelectorAll("input[_sub]");\n' +
'  for (var i=0,item; item=nodes[i]; i++) {\n' +
'    if (rootNode.checked && !item.checked) item.checked = true;\n' +
'    item.disabled = rootNode.checked? true: false;\n' +
'  }\n' +
'  document.getElementById("btn-apy").disabled = false;\n' +
'}\n' +

'function subChanged(event) {\n' +
'  document.getElementById("btn-apy").disabled = false;\n' +
'}';

    var sHtml = '<div style="position:absolute; left:0px; top:0px; width:100%; height:28px; font-size:16px; background-color:#408080; color:white; text-align:center; line-height:28px; font-weight:600; cursor:default">Remove project</div><div style="width:100; height:28px"></div>\n';
    sHtml += '<p style="font-size:14px; word-break:break-all; color:gray">Project: ' + htmlEncode(sPath) + '</p>\n';
    sHtml += '<p><input _name="' + sPath + '" type="checkbox" onclick="rootChanged(event,this)">Whole project<br>\n';
    for (var i=0,item; item=bSub[i]; i++) {
      sHtml += '&nbsp;&nbsp;<input _sub="true" _name="' + item + '" type="checkbox" onclick="subChanged(event)">' + htmlEncode(item) + '<br>\n';
    }
    sHtml += '</p>';
    sHtml += '<p><button id="btn-apy" onclick="applyRemovePrj()">Apply</button></p>';
    
    var iHi = (bSub.length >= 10?400:(bSub.length >= 2?320:250));
    this.showDlg({
      left: Math.floor((window.innerWidth-400)/2),
      top: Math.floor((window.innerHeight-iHi)/2),
      width: 400, height: iHi,
      url: '/software/pages/simple_dialog.html',
      closable: true,
      peerName: 'wdPopDlgForm',
      bodyHtml: sHtml,
      jsScript: sJsCode,
    });
    return true;
  },
  
  addDropPrjFrame: function(sThumb,sFlag,sPath) {
    var b=sPath.split("/"), sBare=b[b.length-1];
    var sUrl, sEdProj = this.wdMarkdown.r.data.currProj;
    if (sEdProj && sPath.indexOf(sEdProj+'/') == 0)
      sUrl = sPath.slice(sEdProj.length+1) + '/';
    else {
      if (githubSess)
        sUrl = githubUser.login + '.github.io';
      else sUrl = PINP_HOST_DOMAIN;
      sUrl = location.protocol + '//' + sUrl + '/' + sPath + '/';
    }
    
    var sJsCode = 'var sPrjUrl = "' + sUrl + '";\n' +
'var sBareName = "' + sBare + '";\n' +
'var sThumb = "' + sThumb + '";\n' +
'var sPrjFlag = "' + sFlag + '";\n' +

'function lnkTypeChanged() {\n' +
'  var frm = document.querySelector("form");\n' +
'  var nd = document.getElementById("prj-wdhi");\n' +
'  var nodes = nd.querySelectorAll("input");\n' +
'  if (!frm.lnkType[0].checked) {\n' +
'    nd.style.color = "#222";\n' +
'    for (var i=0,item; item=nodes[i]; i++) {\n' +
'      item.removeAttribute("readonly");\n' +
'      item.style.backgroundColor = "#fff";\n' +
'    }\n' +
'  } else {\n' +
'    nd.style.color = "#ccc";\n' +
'    for (var i=0,item; item=nodes[i]; i++) {\n' +
'      item.setAttribute("readonly","readonly");\n' +
'      item.style.backgroundColor = "#ccc";\n' +
'    }\n' +
'  }\n' +
'}\n' +

'function applyInsertLnk(event) {\n' +
'  event.preventDefault(); event.stopPropagation();\n' +
'  var sOut="", frm=document.querySelector("form");\n' +
'  if (frm.lnkType[0].checked) {\n' +
'    if (sThumb)\n' +
'      sOut = \'<a target="_blank" href="\' + sPrjUrl + \'">\' + \'<img alt="\' + sBareName + \'" src="\' + sThumb + \'"></a>\';\n' +
'    else sOut = "[" + sBareName + "](" + sPrjUrl + ")";\n' +
'  } else {\n' +
'    var sWd = document.getElementById("input-wd").value.trim().replace(/px/gi,"") || "100%";\n' +
'    var sHi = document.getElementById("input-hi").value.trim().replace(/px/gi,"") || "300";\n' +
'    var pgNode = document.getElementById("input-pg");\n' +
'    var sPage = (pgNode? pgNode.value.trim(): "");\n' +
'    if (pgNode) sPrjUrl += "?size=0x0";\n' +
'    if (sPage) sPrjUrl += "#" + sPage;\n' +
'    sOut = \'<iframe frameborder="0" width="\' + sWd + \'" height="\' + sHi + \'" src="\' + sPrjUrl + \'"></iframe>\';\n' +
'  }\n' +
'  DCF.call("parent","dropTextInfo",[sOut]);\n' +
'}\n';
    
    var hasPgNum = false;
    var sHtml = '<div style="position:absolute; left:0px; top:0px; width:100%; height:28px; font-size:16px; background-color:#408080; color:white; text-align:center; line-height:28px; font-weight:600; cursor:default">Insert project linker</div><div style="width:100; height:28px"></div>\n';
    sHtml += '<p style="font-size:14px; word-break:break-all; color:gray">Project: ' + htmlEncode(sPath) + '</p>\n';
    sHtml += '<form><p><input type="radio" name="lnkType" onclick="lnkTypeChanged()" checked>insert a linker</p><p><input type="radio" name="lnkType" onclick="lnkTypeChanged()">embed a frame</p>\n';
    sHtml += '<div id="prj-wdhi" style="color:#ccc; margin-left:20px; margin-top:-8px">Width <span style="font-size:14px; color:gray">(percent or pixes)</span><br><input id="input-wd" type="text" style="background-color:#ccc; width:220px" value="100%" readonly>\n';
    sHtml += '<br>Height <span style="font-size:14px; color:gray">(percent or pixes)</span><br><input id="input-hi" type="text" style="background-color:#ccc; width:220px" value="300" readonly>\n';
    if (sFlag == '1' || sFlag == '2' || sPath.slice(sPath.length-6) == '.sshow') {
      hasPgNum = true;
      sHtml += '<br>Show page <span style="font-size:14px; color:gray">(page number)</span><br><input id="input-pg" type="text" style="background-color:#ccc; width:220px" value="1" readonly>\n';
    }
    sHtml += '</div></form><p>&nbsp;<button onclick="applyInsertLnk(event)">Apply</button></p>\n';
    
    var dlgHi = (hasPgNum? 356: 310);
    this.showDlg({
      left: Math.floor((window.innerWidth-340)/2),
      top: Math.floor((window.innerHeight-dlgHi)/2),
      width: 340, height: dlgHi,
      url: '/software/pages/simple_dialog.html',
      closable: true,
      peerName: 'wdPopDlgForm',
      bodyHtml: sHtml,
      jsScript: sJsCode,
    });
  },
  
  addDropImgFrame: function(wd,hi,sUrl) {
    var b=sUrl.split('/'), sBare=b[b.length-1];
    var sJsCode = 'var sImgUrl = "' + sUrl + '";\n' +
'var sImgBare = "' + sBare + '";\n' +
'var sNatureWd = "' + wd + '";\n' +
'var sNatureHi = "' + hi + '";\n' +

'function lnkTypeChanged() {\n' +
'  var frm = document.querySelector("form");\n' +
'  var nd = document.getElementById("img-wdhi");\n' +
'  var nodes = nd.querySelectorAll("input");\n' +
'  if (!frm.lnkType[0].checked) {\n' +
'    nd.style.color = "#222";\n' +
'    for (var i=0,item; item=nodes[i]; i++) {\n' +
'      item.removeAttribute("readonly");\n' +
'      item.style.backgroundColor = "#fff";\n' +
'    }\n' +
'  } else {\n' +
'    nd.style.color = "#ccc";\n' +
'    for (var i=0,item; item=nodes[i]; i++) {\n' +
'      item.setAttribute("readonly","readonly");\n' +
'      item.style.backgroundColor = "#ccc";\n' +
'    }\n' +
'  }\n' +
'}\n' +

'function applyInsertLnk(event) {\n' +
'  event.preventDefault(); event.stopPropagation();\n' +
'  var sOut="", frm=document.querySelector("form");\n' +
'  if (frm.lnkType[0].checked) {\n' +
'    sOut = \'<a target="_blank" href="\' + sImgUrl + \'">\' + sImgBare + \'</a>\';\n' +
'  } else {\n' +
'    var sWd = document.getElementById("input-wd").value.trim().replace(/px/gi,"");\n' +
'    var sHi = document.getElementById("input-hi").value.trim().replace(/px/gi,"");\n' +
'    if (!sWd || sWd == sNatureWd) {\n' +
'      if (!sHi || sHi == sNatureHi)\n' +
'        sOut = "![" + sImgBare + "](" + sImgUrl + ")";\n' +
'      else {\n' +
'        sHi += (sHi.indexOf("%") > 0? "": "px");\n' +
'        sOut = \'<img style="width:\' + sNatureWd + \'px; height:\' + sHi + \'" src="\' + sImgUrl + \'">\';\n' +
'      }\n' +
'    } else {\n' +
'      sWd += (sWd.indexOf("%") > 0? "": "px");\n' +
'      if (!sHi)\n' +
'        sOut = \'<img style="width:\' + sWd + \'" src="\' + sImgUrl + \'">\';\n' +
'      else {\n' +
'        sHi += (sHi.indexOf("%") > 0? "": "px");\n' +
'        sOut = \'<img style="width:\' + sWd + \'; height:\' + sHi + \'" src="\' + sImgUrl + \'">\';\n' +
'      }\n' +
'    }\n' +
'  }\n' +
'  DCF.call("parent","dropTextInfo",[sOut]);\n' +
'}\n';
    
    var sHtml = '<div style="position:absolute; left:0px; top:0px; width:100%; height:28px; font-size:16px; background-color:#408080; color:white; text-align:center; line-height:28px; font-weight:600; cursor:default">Insert image</div><div style="width:100; height:28px"></div>\n';
    sHtml += '<p style="font-size:14px; word-break:break-all; color:gray">File: ' + htmlEncode(sBare) + '</p>\n';
    sHtml += '<form><p><input type="radio" name="lnkType" onclick="lnkTypeChanged()">insert a linker</p><p><input type="radio" name="lnkType" onclick="lnkTypeChanged()" checked>embed an image</p>\n';
    sHtml += '<div id="img-wdhi" style="color:#222; margin-left:20px; margin-top:-8px">Width <span style="font-size:14px; color:gray">(percent, pixes or leave it blank)</span><br><input id="input-wd" type="text" style="background-color:#fff; width:270px" value="' + wd + '"><br>\n';
    sHtml += 'Height <span style="font-size:14px; color:gray">(percent, pixes or leave it blank)</span><br><input id="input-hi" type="text" style="background-color:#fff; width:270px" value="' + hi + '"></div>\n';
    sHtml += '</form><p>&nbsp;<button onclick="applyInsertLnk(event)">Apply</button></p>\n';
    
    this.showDlg({
      left: Math.floor((window.innerWidth-360)/2),
      top: Math.floor((window.innerHeight-320)/2),
      width: 360, height: 320,
      url: '/software/pages/simple_dialog.html',
      closable: true,
      peerName: 'wdPopDlgForm',
      bodyHtml: sHtml,
      jsScript: sJsCode,
    });
  },
  
  // pop-editing slide widget
  //-------------------------
  editPrepost: function(nodeId,sFlag,canPlay) {
    var hi = Math.floor(window.innerHeight * 0.99);
    this.showDlg({
      left: Math.floor((window.innerWidth-700)/2),
      top: Math.floor((window.innerHeight-hi)/2),
      width: 700, height: hi,
      url: 'prepost_editor.html',
      closable: true,
      peerName: 'wdPopDlgForm',
      bodyHtml: '',
      jsScript: '',
      
      onReady: function() {
        R.getDCF().call('wdPopDlgForm','initPrePost',[nodeId,sFlag,canPlay]);
      },
    });
  },
  
  editSlideTxt: function(nodeId,sTxt) {
    var wd = Math.floor(window.innerWidth * 0.8);
    var hi = Math.floor(window.innerHeight * 0.8);
    var sJsCode = 'var iEditNodeId = ' + nodeId + ';\n' +
'function finishEditing() {\n' +
'  var txtNode = document.querySelector("textarea");\n' +
'  var bArgs = [iEditNodeId,txtNode.value];\n' +
'  DCF.call("parent","saveSlideTxt",bArgs);\n' +
'}\n' +
'document.querySelector("textarea").value = ' + JSON.stringify(sTxt) + ';';
    
    var sHtml = '<div style="position:absolute; left:0px; top:0px; width:100%; height:28px; font-size:16px; background-color:#408080; color:white; text-align:center; line-height:28px; font-weight:600; cursor:default">Plain text editor</div><div style="width:100; height:28px"></div>\n';
    sHtml += '<textarea style="width:' + (wd-24) + 'px; height:' + (hi-110) + 'px; resize:none"></textarea>\n';
    sHtml += '<p><button onclick="finishEditing()">Apply</button></p>';
    
    this.showDlg({
      left: Math.floor((window.innerWidth-wd)/2),
      top: Math.floor((window.innerHeight-hi)/2),
      width: wd, height: hi,
      url: '/software/pages/simple_dialog.html',
      closable: true,
      peerName: 'wdPopDlgForm',
      bodyHtml: sHtml,
      jsScript: sJsCode,
    });
  },
  
  editTableData: function(nodeId,b,iRow,iCol,sFont,sHint) {
    var wd = Math.floor(window.innerWidth * 0.9);
    var hi = Math.floor(window.innerHeight * 0.9);
    
    this.showDlg({
      left: Math.floor((window.innerWidth-wd)/2),
      top: Math.floor((window.innerHeight-hi)/2),
      width: wd, height: hi,
      url: 'table_editor.html',
      closable: true,
      peerName: 'wdPopDlgForm',
      bodyHtml: '',
      jsScript: '',
      
      onReady: function() {
        R.getDCF().call('wdPopDlgForm','initTableData',[nodeId,b,iRow,iCol,sFont,sHint]);
      },
    });
  },
  
  editShapeData: function(nodeId,sCls,sImgList,sWidget,sStyle,sStyle2) {
    var wd = Math.floor(window.innerWidth * 0.8);
    var hi = Math.floor(window.innerHeight * 0.9);
    
    this.showDlg({
      left: Math.floor((window.innerWidth-wd)/2),
      top: Math.floor((window.innerHeight-hi)/2),
      width: wd, height: hi,
      url: 'pinp_shape_editor.html',
      closable: true,
      peerName: 'wdPopDlgForm',
      bodyHtml: '',
      jsScript: '',
      
      onReady: function() {
        R.getDCF().call('wdPopDlgForm','initMask',[nodeId,sCls,sImgList,sWidget,sStyle,sStyle2]);
      },
    });
  },
  
  setPopupRightWd: function(iRight) {
    if (this.wdInfoMask.style.display != 'none') {
      var sWd = (window.innerWidth - iRight) + 'px';
      this.wdInfoMask.style.width = sWd
      this.wd.style.width = sWd;
    }
  },
  
  editPaperData: function(nodeId,bArgs) {
    var sProj = this.wdMarkdown.r.data.currProj;
    if (!sProj) return;
    var sPath = '/' + sProj + '/';
    
    var wd = window.innerWidth - 300;
    var hi = window.innerHeight;
    
    var self = this;
    this.showDlg({
      left: 0,
      top: 0,
      width: wd, height: hi,
      url: sPath + '?editing=1&paper=1',
      closable: false,
      peerName: '',
      bodyHtml: '',
      jsScript: '',
      
      onReady: function() {
        var frm = self.wd.querySelector('iframe');
        if (frm) {
          frm.contentWindow.setEditingNode(nodeId,sPath);
          frm.contentWindow.initPaper(bArgs); // bArgs:[sHtml,sCls,sName,sFont,sFont2,sFont3,sStyle,sPath]
          
          self.wdPreviewArea.style.display = 'none';
          self.wdResPanel.style.height = (window.innerHeight - self.wdToolbar.clientHeight - 8) + 'px';
          self.setPopupRightWd(300);
        }
      },
    });
  },
};

return {
  Toolbar: Toolbar,
  ProjList: ProjList,
  SplitterA: SplitterA,
  Markdown: Markdown,
  ResPanel: ResPanel,
  PreviewArea: PreviewArea,
  PopDlgForm: PopDlgForm,
};

//=====================
});  // end of define()
