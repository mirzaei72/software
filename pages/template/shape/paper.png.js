(function() {
  var apiNode = document.getElementById("slide-api");
  var taskCfg = apiNode.taskConfig();
  
  var currId = apiNode.currSlideId();
  if (currId) {
    var sName = apiNode.newSvgPaper();
    var sHtml = "<div class='svg-paper' _config='small-default-large default-looser-impacted p1-p2-p3-p0 center-right-default fixed-fullsize' name='" + sName + "' _zindex='998' _left='" + taskCfg.mouseX + "' _top='" + taskCfg.mouseY + "' _width='500' _height='400'></div>\n";
    var currNode = document.getElementById(currId);
    apiNode.innerHTML = sHtml;
    
    currNode.appendChild(apiNode.childNodes[0]);
    apiNode.innerHTML = "";
    
    apiNode.initPagePos(currId);
    apiNode.renewCurrSlide();
    apiNode.selectLastAdded();
    apiNode.setPageModified(currId);
  }
})();
