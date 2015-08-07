(function() {
  var apiNode = document.getElementById("slide-api");
  var taskCfg = apiNode.taskConfig();
  var sHtml= "<div class='table-set' _config='default-large-small default-looser-impacted default-center-right default-shadow' _zindex='1000' _left='" + taskCfg.mouseX + "' _top='" + taskCfg.mouseY + "' _width='600' _height='220'><table class='tbl_55'><tr><td></td><td>Head A</td><td>Head B</td></tr><tr><td>Type 1</td><td>data</td><td>data</td></tr><tr><td>Type 2</td><td>data</td><td>data</td></tr><tr><td>Type 3</td><td>data</td><td>data</td></tr></table></div>\n";
  
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
