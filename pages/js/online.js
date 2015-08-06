// online.js

function EXTERN_MSG_CALL(msg) {
  if (!window.parent.window || window.parent.window === window) return;
  
  var sCmd = msg.method || '';
  if (sCmd == 'notiGetPlugLib') {
    var s = apiNode.getPluginCode();
    var s = '[PINPSLIDE_11]' + JSON.stringify({'method':'previewPlugLib','param':[s,curSlide]});
    window.parent.window.postMessage(s,'*');
  }
  else if (sCmd == 'notiGetPageHtml') {
    var sId = msg.param[0];
    if (!sId) return;
    
    var el = document.querySelector('section > article[id="' + sId + '"]');
    if (el) {
      var b = apiNode.getPageHtml(el);  // [sId,sCls,sHtml]
      if (b && b.length == 3) {
        b[2] = 'COMPONENT_OF_PINP_SLIDE,0,' + b[2];
        var s = '[PINPSLIDE_11]' + JSON.stringify({'method':'previewPageHtml','param':b});
        window.parent.window.postMessage(s,'*');
      }
    }
  }
  else if (sCmd == 'turnSlideTo') {
    var sId = msg.param[0];
    for (var i=0,item; item=slideEls[i]; i++) {
      if (item.id == sId) {
        apiNode.gotoPage(i);
        break;
      }
    }
  }
  else if (sCmd == 'delSlidePage') {
    var sId = msg.param[0];
    apiNode.removePage(sId);
  }
  else if (sCmd == 'addSlidePage') {
    var sSrc=msg.param[0], iWd=msg.param[1]||900, iHi=msg.param[2]||700;
    apiNode.insertPage(sSrc,iWd,iHi);
  }
  else if (sCmd == 'tryUnselect') {
    hideMenuAndSelector();
    cancelInlineEdit();
    apiNode.unselect();
  }
  else if (sCmd == 'startSave') {
    var sProj = msg.param[0];
    apiNode.unselect();
    var sHtml = apiNode.slideshowText();
    var s = '[PINPSLIDE_11]' + JSON.stringify({'method':'saveSlideShow','param':[sProj,sHtml]});
    window.parent.window.postMessage(s,'*');
  }
  else if (sCmd == 'savePrepost') {
    apiNode.savePrepost(msg.param[0],msg.param[1]);
  }
  else if (sCmd == 'saveSlideTxt') {
    apiNode.saveSlideTxt(msg.param[0],msg.param[1]);
  }
  else if (sCmd == 'saveTableData') {
    apiNode.saveTableData(msg.param[0],msg.param[1]);
  }
  else if (sCmd == 'saveShapeData') {
    apiNode.saveShapeData(msg.param[0],msg.param[1]);
  }
  else if (sCmd == 'savePaperData') {
    apiNode.savePaperData(msg.param[0],msg.param[1]);
  }
}

(function() {
  window.addEventListener('load', function(event) {
    var hasParent = window.parent.window && window.parent.window !== window;
    
    // step 1: setup taskConfig API
    var taskConfig_ = {};
    apiNode.taskConfig = function() {
      return taskConfig_;
    };
    apiNode.isDropPrevious = function() {
      return !!taskConfig_.dropBeforeCurr;
    };
    apiNode.newTaskConfig = function(isSvgTool) {
      taskConfig_ = {'svgTool': !!isSvgTool};
    };
    apiNode.setDropMouseXY = function(iX,iY) {
      taskConfig_.mouseX = iX;
      taskConfig_.mouseY = iY;
    };
    apiNode.runJsFile = function(sSrc) {
      var srcNode = document.createElement('script');
      srcNode.async = 1;
      srcNode.onload = function(event) {
        srcNode.parentNode.removeChild(srcNode);
      };
      srcNode.onerror = function(event) {
        srcNode.parentNode.removeChild(srcNode);
      };
      document.body.appendChild(srcNode);
      srcNode.src = sSrc;
    };
    
    // step 2: hook sidebar drop event
    var PrevNextDragOver = function(event) {
      if (apiNode.beenReadonly()) return;
      var sTask = getCookie__('drag_task');
      if (sTask == 'run_js' || sTask == 'exchange_page')
        event.preventDefault();
    };
    var PrevNextDragDrop = function(event) {
      if (apiNode.beenReadonly()) return;
      var sArg, sTask = getCookie__('drag_task');
      if (window.WEB_BROWSER_TYPE == 'ie')
        sArg = event.dataTransfer.getData('text');
      else sArg = event.dataTransfer.getData('text/args');
      if (typeof sArg != 'string') return;
      
      if (sTask == 'exchange_page' && sArg.indexOf("pageindex,") == 0) {
        event.stopPropagation();
        event.preventDefault();
        
        sArg = sArg.slice(10);
        var iFrom=-1, iNum=apiNode.totalSlides();
        for (var i=0,item; item=slideEls[i]; i++) {
          if (sArg == item.id) {
            iFrom = i;
            break;
          }
        }
        
        if (iFrom >= 0 && iFrom < iNum) {
          var iTo = apiNode.currSlideIndex();
          if (event.target.id != 'prev-slide-area')
            iTo += 1;
          if (iFrom != iTo && iFrom+1 != iTo)
            apiNode.moveSlideTo(iFrom,iTo);
        }
      }
      // else, sTask == 'run_js' not support yet
    };
    var prevArea = document.getElementById('prev-slide-area');
    prevArea.ondragover = PrevNextDragOver;
    prevArea.ondrop = PrevNextDragDrop;
    var nextArea = document.getElementById('next-slide-area');
    nextArea.ondragover = PrevNextDragOver;
    nextArea.ondrop = PrevNextDragDrop;
    
    // step 3: extend apiNode.xxx (removePage,insertPage)
    apiNode.removePage = function(sId) {
      if (!sId) return;
      if (apiNode.totalSlides() == 1) {
        alert("can not delete last page!");
        return;
      }
      if (!confirm("do you want delete this page?"))
        return;
      
      var node = document.querySelector('section.slides > article[id="' + sId + '"]');
      if (node) {
        var owner = node.parentNode;
        var currIndex = apiNode.currSlideIndex();
        apiNode.unselect();
        owner.removeChild(node);
        apiNode.renewSlides();
        
        var goNewPg=false, iNum=apiNode.totalSlides();
        if (currIndex >= iNum) {
          currIndex = iNum - 1;
          goNewPg = true;
        }
        if (hasParent) {
          var b = [currIndex];
          for (var i=0,item; item=slideEls[i]; i++) {
            b.push(item.id || '');
          }
          var s = '[PINPSLIDE_11]' + JSON.stringify({'method':'slideDelPage','param':b});
          window.parent.window.postMessage(s,'*');
        }
        
        if (goNewPg) {
          setTimeout( function() {
            apiNode.gotoPage(currIndex);
          },0);
        }
      }
    };
    
    apiNode.insertPage = function(sSrc,iWd,iHi) {
      var rootNode = document.querySelector('section.slides');
      var iCurr = apiNode.currSlideIndex();
      var currNode = slideEls[iCurr];
      if (!rootNode || !currNode) return;
      
      var sHtml, sPage='', sNewId=apiNode.newSlideId();
      if (!sSrc)
        sHtml = '<article id="' + sNewId + '">\n</article>\n'; // iWd,iHi no use
      else {
        var wdFull=SLIDE_HALF_WIDTH+SLIDE_HALF_WIDTH, hiFull=SLIDE_HALF_HEIGHT+SLIDE_HALF_HEIGHT;
        var f=iWd/iHi, f0=SLIDE_HALF_WIDTH/SLIDE_HALF_HEIGHT;
        if (f >= f0) {
          iHi = Math.floor(wdFull / f + 0.5);
          iWd = wdFull;
        }
        else {
          iWd = Math.floor(hiFull * f + 0.5);
          iHi = hiFull;
        }
        var iX = 0 - Math.floor(iWd * 0.5 + 0.5);
        var iY = 0 - Math.floor(iHi * 0.5 + 0.5);
        
        sPage = '<div class="pinp-image slideshow-img" _zindex="996" _config="fullsize-fixed contain-fit default-round2-round3-round0 default-looser-impacted p1-p2-p3-p0" _left="' + iX + '" _top="' + iY + '" _width="' + iWd + '" _height="' + iHi + '">';
        sPage += '<img draggable="false" src="' + sSrc + '" _jump=""><div class="rotate-txt"></div></div>\n';
        sHtml = '<article id="' + sNewId + '">\n' + sPage + '</article>\n';
      }
      apiNode.innerHTML = sHtml;
      
      var newNode = apiNode.children[0];
      var nextNode = currNode.nextElementSibling;
      if (nextNode && nextNode.parentNode === rootNode)
        rootNode.insertBefore(newNode,nextNode);
      else rootNode.appendChild(newNode);
      apiNode.innerHTML = '';
      
      apiNode.initPagePos(sNewId);
      apiNode.saveSlideDoc();
      apiNode.renewSlides();
      apiNode.nextSlide();
      
      if (hasParent) {
        var b = [iCurr+1];
        for (var i=0,item; item=slideEls[i]; i++) {
          b.push(item.id || '');
        }
        var s = '[PINPSLIDE_11]' + JSON.stringify({'method':'slideAddPage','param':b});
        window.parent.window.postMessage(s,'*');
        
        if (sPage) {
          setTimeout( function() {
            var s = '[PINPSLIDE_11]' + JSON.stringify({'method':'previewPageHtml','param':[sNewId,'','COMPONENT_OF_PINP_SLIDE,0,'+sPage]});
            window.parent.window.postMessage(s,'*');
          },500);
        }
      }
    };
    
    apiNode.setPopContent = function(iID,sHtml,sClass,sFont) {
      if (hasParent && window.parent.window.setPopContent)
        window.parent.window.setPopContent(iID,sHtml,sClass,sFont,PINP_EXTEND_STYLE);
    };
    apiNode.getPopContent = function(iID) {
      if (hasParent && window.parent.window.getPopContent)
        return window.parent.window.getPopContent(iID);
    };
    apiNode.hidePopContent = function() {
      try {
        if (hasParent && window.parent.window.hidePopContent)
          return window.parent.window.hidePopContent();
      } catch(e) {}
    };
    
    // step 4: popup editing support
    var currPopEditId_  = 0;
    var currPopEditNode = null;
    
    var checkCellRowSpan = function(bPseudo,bRow) {
      if (bPseudo.length) {
        var bLast = bPseudo[bPseudo.length-1];
        var iLastSize = bRow.length;
        while (bLast.length > iLastSize) {
          var vCell = bLast[iLastSize];
          if (vCell.rowspan > 1) {
            bRow.push({'colspan':vCell.colspan,'rowspan':vCell.rowspan-1,'style':'','text':'<+>'});
            for (var ii=1; ii < vCell.colspan; ii++) {
              bRow.push({'colspan':0,'rowspan':0,'style':'','text':'<->'});
            }
            iLastSize = bRow.length;
          }
          else break;
        }
      }
    };
    
    apiNode.dbclickEdit = function(node) {
      var cfgMenu = document.getElementById('slide-menu');
      cfgMenu.style.display = 'none';
      if (!hasParent) return;
      
      if (!node) node = getCurrSelected();
      if (!node) return;
      
      apiNode.hidePopContent();
      
      if (node.classList.contains('code-block')) {
        var preNode = node.querySelector('.code-block > pre');
        if (preNode) {
          currPopEditId_ += 1;
          currPopEditNode = node;
          var s = '[PINPSLIDE_11]' + JSON.stringify({'method':'editSlideTxt','param':[currPopEditId_,preNode.textContent]});
          window.parent.window.postMessage(s,'*');
        }
      }
      else if (node.classList.contains('table-set')) {
        var tabNode = node.querySelector('.table-set > table');
        if (tabNode) {
          var iMaxCol=0, bStyle=[], bData=[];
          var sTabStyle = tabNode.getAttribute('style');
          if (sTabStyle)
            bData.push(['style=',sTabStyle]);
          var sTableCls = tabNode.className;
          if (sTableCls)
            bData.push(["class=",sTableCls]);
          
          // scan 1: setup pseuod-cell-object
          var bPseudo=[], trNodes=tabNode.querySelectorAll('tr');
          for (var i=0,item; item=trNodes[i]; i++) {
            var vFirstCell = {'colspan':0,'rowspan':0,'style':'','text':'td'};
            var bRow=[vFirstCell], hasTh=false;
            var tdNodes = item.querySelectorAll('td,th');
            
            for (var i2=0,item2; item2=tdNodes[i2]; i2++) {
              if (item2.nodeName == 'TH')
                hasTh = true;
              
              // check rowspan, colspan has added when first colspan=xx process
              checkCellRowSpan(bPseudo,bRow);
              
              var vCell = {'colspan':1,'rowspan':1,'style':'','text':''};
              bRow.push(vCell);
              var s1 = item2.getAttribute('colspan');
              var s2 = item2.getAttribute('rowspan');
              var s3 = item2.style.cssText;
              if (s1) vCell.colspan = parseInt(s1);
              if (s2) vCell.rowspan = parseInt(s2);
              if (s3) {
                var ii = bStyle.indexOf(s3);
                if (ii < 0)
                  ii = bStyle.push(s3) - 1;
                vCell.style = ii + '';
              }
              vCell.text = item2.innerHTML;
              
              if (vCell.colspan >= 2) {
                for (var i3=1; i3 < vCell.colspan; i3++) {
                  bRow.push({'colspan':0,'rowspan':0,'style':'','text':'<->'});
                }
              }
            }
            
            checkCellRowSpan(bPseudo,bRow); // check tail rowspan
            if (hasTh) vFirstCell.text = 'th';
            if (iMaxCol < bRow.length) iMaxCol = bRow.length;
            bPseudo.push(bRow);
          }
          
          for (var i=0; i < bStyle.length; i++) { // add style list
            bData.push([i+'=',bStyle[i]]);
          }
          
          // scan 2: generate table cell from pseuod-cell-object
          for (var i=0,item; item=bPseudo[i]; i++) {
            var bRow=[], isFirstCell=true;
            for (var i2=0,item2; item2=item[i2]; i2++) {
              if (isFirstCell) {
                isFirstCell = false;
                if (item2.text == 'th')
                  bRow.push('header=');
                else bRow.push('');
              }
              else {
                if (item2.style)
                  bRow.push('<' + item2.style + ':' + item2.text + '>');
                else bRow.push(item2.text);
              }
            }
            bData.push(bRow);
          }
          
          currPopEditId_ += 1;
          currPopEditNode = node;
          var sHint = '<p>Join to left cell: &lt;-&gt;<br>Join to above cell: &lt;+&gt;';
          var s = '[PINPSLIDE_11]' + JSON.stringify({'method':'editTableData','param':[currPopEditId_,bData,bData.length,iMaxCol,PINP_SLIDE_FONT,sHint]});
          window.parent.window.postMessage(s,'*');
        }
      }
      else if (node.classList.contains('frame-build')) {
        var frmNode = node.querySelector('.frame-build > iframe');
        if (frmNode) {
          var sHint = frmNode.contentWindow.window.getHintText() || '';
          var bData = frmNode.contentWindow.window.getContent();
          var iRow=bData.length, iMaxCol=0;
          for (var i=0; i < iRow; i++) {
            var item = bData[i];
            if (item.length > iMaxCol)
              iMaxCol = item.length;
          }
          
          currPopEditId_ += 1;
          currPopEditNode = node;
          var s = '[PINPSLIDE_11]' + JSON.stringify({'method':'editTableData','param':[currPopEditId_,bData,iRow,iMaxCol,PINP_SLIDE_FONT,sHint]});
          window.parent.window.postMessage(s,'*');
        }
      }
      else if (node.classList.contains('svg-shape')) {
        var sStype='', sStyle2='', sImgList='', sWidget=node.getAttribute('_widget') || '';
        var cavNode = node.querySelector('.svg-shape > div.shape-canvas');
        if (cavNode) {
          sStyle = cavNode.getAttribute('style') || '';
          sImgList = cavNode.innerHTML;
        }
        var txtNode = node.querySelector('.svg-shape > div.shape-canvas');
        if (txtNode)
          sStyle2 = txtNode.getAttribute("style") || '';
        
        currPopEditId_ += 1;
        currPopEditNode = node;
        var s = '[PINPSLIDE_11]' + JSON.stringify({'method':'editShapeData','param':[currPopEditId_,node.className,sImgList,sWidget,sStyle,sStyle2]});
        window.parent.window.postMessage(s,'*');
      }
      else if (node.classList.contains('svg-paper')) {
        currPopEditId_ += 1;
        currPopEditNode = node;
        var sName = node.getAttribute('name') || '';
        var s = '[PINPSLIDE_11]' + JSON.stringify({'method':'editPaperData','param':[currPopEditId_,node.innerHTML,node.className,sName,PINP_SLIDE_FONT,PINP_SOURCECODE_FONT,PINP_CONTENT_FONT,PINP_EXTEND_STYLE,CURR_USR_PATH]});
        window.parent.window.postMessage(s,'*');
      }
    };
    apiNode.setPrePost = function(node) {
      var cfgMenu = document.getElementById('slide-menu');
      cfgMenu.style.display = 'none';
      if (!hasParent) return;
      
      if (!node) node = getCurrSelected();
      if (!node) return;
      
      apiNode.hidePopContent();
      var sFlag = node.getAttribute('_prepost') || '';
      var isPlay = apiNode.canPlay(node);
      
      currPopEditId_ += 1;
      currPopEditNode = node;
      var s = '[PINPSLIDE_11]' + JSON.stringify({'method':'editPrepost','param':[currPopEditId_,sFlag,isPlay]});
      window.parent.window.postMessage(s,'*');
    };
    apiNode.savePrepost = function(iId,sFlag) {
      if (currPopEditId_ == iId && currPopEditNode && currPopEditNode.parentNode) {
        if (sFlag)
          currPopEditNode.setAttribute('_prepost',sFlag);
        else currPopEditNode.removeAttribute('_prepost');
        apiNode.setPageModified();
      }
    };
    apiNode.saveSlideTxt = function(iId,sTxt) {
      if (currPopEditId_ == iId && currPopEditNode && currPopEditNode.parentNode) {
        var preNode = currPopEditNode.querySelector('.code-block > pre');
        if (preNode && currPopEditNode.classList.contains('code-block')) {
          currPopEditNode = null;
          preNode.textContent = sTxt || '';
          apiNode.setPageModified();
        }
      }
    };
    apiNode.saveTableData = function(iId,bData) {
      if (currPopEditId_ == iId && currPopEditNode && currPopEditNode.parentNode) {
        if (currPopEditNode.classList.contains('svg-shape')) {
          var frmNode = currPopEditNode.querySelector('iframe');
          if (frmNode) {
            frmNode.contentWindow.window.setContent(bData);
            
            var sWidget = '[';
            for (var i=0; i < bData.length; i++) {
              var item = bData[i];
              var sRow = '[';
              for (var i2=0; i2 < item.length; i2++) {
                var item2 = item[i2];
                if (typeof item2 == 'string') {
                  if (item2)
                    sRow += JSON.stringify(item2) + ',';
                  else sRow += ',';
                }
                else sRow += ',';
              }
              while (sRow && sRow[sRow.length-1] == ',') {
                sRow = sRow.slice(0,sRow.length-1);
              }
              sWidget += sRow + '],';
            }
            var iSize = sWidget.length;
            if (iSize > 1) sWidget = sWidget.slice(0,iSize-1);
            sWidget += ']';
            frmNode.setAttribute("_widget",sWidget.replace(/"/gm,"'"));
            
            currPopEditNode = null;
            apiNode.setPageModified();
          }
          return;
        }
        else if (!currPopEditNode.classList.contains('table-set'))
          return;
        
        // scan 1: get style-dict/iTabFrom
        var sTableCls='', dStyle={}, iTabFrom=0;
        for (var i=0; i < bData.length; i++) {
          var b=bData[i], s1=b[0];
          if (b.length >= 2 && typeof s1 == 'string') {
            if (s1 == 'class=')
              sTableCls = b[1];
            else if (s1 == 'header=' || !s1) // empty cell means start table body
              break;
            else if (s1[s1.length-1] == '=')
              dStyle[s1] = b[1] || '';
          }
          iTabFrom += 1;
        }
        
        // scan 2: get iMaxColNum
        var iMaxColNum = 0;
        for (var i=iTabFrom; i < bData.length; i++) {
          var item = bData[i];
          for (var i2=1; i2 < item.length; i2++) {
            var sTmp = item[i2];
            if (sTmp && typeof sTmp == 'string') {
              if (iMaxColNum < i2) iMaxColNum = i2;
            }
          }
        }
        
        // scan 3: get pseudo-cell-object
        var bPseudo = [];
        for (var i=iTabFrom; i < bData.length; i++) {
          var item = bData[i];
          var iColNum = item.length;
          if (iColNum == 0) continue;
          
          var sRow='', sTag='td';
          if (iColNum > 0 && item[0] == 'header=')
            sTag = 'th';
          var bCurrRow = [{'colspan':0,'rowspan':0,'style':'','text':sTag}];
          
          var isEmptyRow = true;
          var i2 = 1;
          while (i2 < iColNum) {
            var vOne=item[i2], ss='';
            if (typeof vOne == 'string')
              ss = vOne;
            var iStrSize = ss.length;
            if (iStrSize)
              isEmptyRow = false;
            else {
              if (i2 > iMaxColNum) break;
            }
            i2 += 1;
            
            var vCell = {'colspan':1,'rowspan':1,'style':'','text':ss};
            bCurrRow.push(vCell);
            
            if (iStrSize == 3 && ss == '<->') {
              vCell.colspan = 0;
              
              var iCol = bCurrRow.length - 2;
              while (iCol >= 0) {
                var vCell2 = bCurrRow[iCol];
                iCol -= 1;
                if (vCell2.colspan > 0) {
                  vCell2.colspan += 1;
                  break;
                }
              }
            }
            else if (iStrSize == 3 && ss == '<+>') {
              vCell.rowspan = 0;
              
              var iCol = bCurrRow.length - 1;
              var iRow = bPseudo.length - 1;
              while (iRow >= 0) {
                var b = bPseudo[iRow];
                iRow -= 1;
                if (b.length > iCol) {
                  var vCell2 = b[iCol];
                  if (vCell2.rowspan > 0) {
                    vCell2.rowspan += 1;
                    break;
                  }
                }
              }
            } else if (iStrSize >= 2 && ss[0] == '<' && ss[ss.length-1] == '>') {
              var ch = ss.charCodeAt(1);
              if (ch >= 48 && ch <= 57) {  // 48~57 is 0~9, <1:text>
                var ii = ss.indexOf(':');
                if (ii > 0) {
                  var sStyle = ss.sliceOf(1,ii-1);
                  if (sStyle.length) {
                    sStyle = dStyle[sStyle+'='] || '';
                    vCell.style = sStyle;
                  }
                  vCell.text = ss.slice(ii+1,ss.length-1);
                }
              }
            } // else, vCell.text = ss;
          }   // end of while
          
          if (!isEmptyRow)
            bPseudo.push(bCurrRow);
        } // end of for
        
        // scan 4: fill both-row-col-span cell
        for (var i=0; i < bPseudo.length; i++) {
          var bRow = bPseudo[i];
          for (var i2=1; i2 < bRow.length; i2++) {
            var vCell = bRow[i2];
            if (vCell.colspan > 1 && vCell.rowspan > 1) {
              for (var i3=1; i3 < vCell.rowspan; i3++) {
                if (i + i3 < bPseudo.length) {
                  var bRow2 = bPseudo[i + i3];
                  var iRowSize = bRow2.length;
                  for (var i4=1; i4 < vCell.colspan; i4++) {
                    if (i2 + i4 < iRowSize) {
                      var vCell2 = bRow2[i2+i4];
                      vCell2.colspan = 0; // this cell ignored
                    } else break;
                  }
                } else break;
              }
            }
          }
        }
        
        // scan 5: generlate table html
        var sHtml = '<table';
        if (sTableCls.length)
          sHtml += ' class="' + sTableCls + '"';
        var sTabStyle = dStyle['style='] || '';
        if (sTabStyle)
          sHtml += ' style=' + JSON.stringify(sTabStyle);
        sHtml += '>';
        
        for (var i=0; i < bPseudo.length; i++) {
          var b2=bPseudo[i], sRow='', sTag='', isFirstCell=true;
          for (var i2=0; i2 < b2.length; i2++) {
            var vCell3 = b2[i2];
            if (isFirstCell) {
              isFirstCell = false;
              sTag = vCell3.text;
            }
            else {
              if (vCell3.colspan <= 0 || vCell3.rowspan <= 0) continue;
              var sStyle = '';
              if (vCell3.style) sStyle = ' style=' + JSON.stringify(vCell3.style);
              
              if (vCell3.colspan == 1) {
                if (vCell3.rowspan == 1)
                  sRow += '<' + sTag + sStyle + '>' + vCell3.text + '</' + sTag + '>';
                else sRow += '<' + sTag + ' rowspan="' + vCell3.rowspan + '"' + sStyle + '>' + vCell3.text + '</' + sTag + '>';
              }
              else {
                sRow += '<' + sTag + ' colspan="' + vCell3.colspan + '"';
                if (vCell3.rowspan > 1)
                  sRow += ' rowspan="' + vCell3.rowspan + '"';
                sRow += sStyle + '>' + vCell3.text + '</' + sTag + '>';
              }
            }
          }
          sHtml += '<tr>' + sRow + '</tr>';
        }
        sHtml += '</table>';
        
        currPopEditNode.innerHTML = sHtml;
        currPopEditNode = null;
        apiNode.setPageModified();
      }
    };
    apiNode.saveShapeData = function(iId,bData) {
      if (currPopEditId_ == iId && currPopEditNode && currPopEditNode.parentNode) {
        if (currPopEditNode.classList.contains('svg-shape')) {
          var sWidget = bData[0];
          if (sWidget)
            currPopEditNode.setAttribute("_widget",sWidget);
          var sStyle1 = bData[1] || '';
          var sStyle2 = bData[2] || '';
          // var sReplaceImg = bData[3] || ''; // not used
          
          var cavNode = currPopEditNode.querySelector('div.shape-canvas');
          if (cavNode) {
            if (sStyle1) {
              var sTmp = '-webkit-transform:' + sStyle1 + ';-moz-transform:' + sStyle1 +
                  ';-ms-transform:' + sStyle1 + ';-o-transform:' + sStyle1 + ';transform:' + sStyle1 + ';';
              cavNode.setAttribute('style',sTmp);
            }
            else cavNode.removeAttribute('style');
          }
          var txtNode = currPopEditNode.querySelector('div.rotate-txt');
          if (txtNode) {
            if (sStyle2) {
              var sTmp = '-webkit-transform:' + sStyle2 + ';-moz-transform:' + sStyle2 +
                  ';-ms-transform:' + sStyle2 + ';-o-transform:' + sStyle2 + ';transform:' + sStyle2 + ';';
              txtNode.setAttribute('style',sTmp);
            }
            else txtNode.removeAttribute('style');
          }
          resetSvgColor(currPopEditNode);
          
          currPopEditNode = null;
          apiNode.setPageModified();
        }
      }
    };
    apiNode.savePaperData = function(iId,sHtml) {
      if (currPopEditId_ == iId && currPopEditNode && currPopEditNode.parentNode) {
        if (currPopEditNode.classList.contains('svg-paper')) {
          currPopEditNode.innerHTML = sHtml;
          currPopEditNode = null;
          apiNode.setPageModified();
        }
      }
    };
    
    // step 5: try notify 'onSlideLoad' event
    if (hasParent) {
      var b = [];
      for (var i=0,item; item=slideEls[i]; i++) {
        b.push(item.id || '');
      }
      var s = '[PINPSLIDE_11]' + JSON.stringify({'method':'onSlideLoad','param':b});
      window.parent.window.postMessage(s,'*');
    }
  },false);
})();
