// svg_paper_editor.js

var currEditingId_ = -1;

function setEditingNode(iID,sPath) {
  currEditingId_ = iID;
  
  var frm = document.querySelector('iframe.popline-frame');
  frm.src = sPath + '?editing=1&inline=2';
}

(function() { // be called in DOMContentLoaded
  var taskConfig_={}, apiNode=document.getElementById('slide-api');
  apiNode.taskConfig = function() {
    return taskConfig_;
  };
  apiNode.isDropPrevious = function() {
    return !!taskConfig_.dropBeforeCurr;
  };
  apiNode.newTaskConfig = function(isSvgTool) {
    taskConfig_ = {'svgTool': !!isSvgTool};
  }
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
  
  apiNode.copyToClipboard = function(sClip,x,y) {
    if (window.parent.window && window.parent.window.copyToClipboard_)
      window.parent.window.copyToClipboard_(sClip,x,y);
  };
  apiNode.textOfClipboard = function() {
    if (window.parent.window && window.parent.window.textOfClipboard_)
      return window.parent.window.textOfClipboard_();
    else return '';
  };
  
  apiNode.editContent = function(txtNode,maskNode,sSourFont,sFamiFont,sContFont,sExtend,sFontSize,sPrjRoot) {
    // not support text editor
  };
  
  var iCount_ = 0;
  var registCallback = function() {
    if (window.finishEditing) {
      window.finishEditing = function(isOk) { // replace same func in svg_paper.js
        unselectCurr();
        setTimeout( function() {
          if (window.parent.window && window.parent.window.updatePaperContent)
            window.parent.window.updatePaperContent(isOk,currEditingId_,getOutputHtml());
        },0);
      };
    }
    else {
      iCount_ += 1;
      if (iCount_ < 120)  // retry within 2 minutes
        setTimeout(registCallback,1000);
    }
  };
  registCallback();
})();
