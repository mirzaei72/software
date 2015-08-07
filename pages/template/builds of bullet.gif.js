(function() {
  var apiNode = document.getElementById("slide-api");
  var taskCfg = apiNode.taskConfig();
  var sHtml = "<div _config='default-large-small default-looser-impacted p1-p2-p3-p0 decimal-alpha-roman default-translucent' _zindex='1000' _left='" + taskCfg.mouseX + "' _top='" + taskCfg.mouseY + "' _width='600'><ul class='build'><li>This is an example of a list</li><li>The list items fade in</li><li>Last one</li></ul></div>\n";
  
  var currId = apiNode.currSlideId();
  if (currId) {
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
