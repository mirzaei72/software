(function() {
  var apiNode = document.getElementById("slide-api");
  var taskCfg = apiNode.taskConfig();
  var sHtml= "<div class='table-set white-border' _config='default-large-small default-looser-impacted default-center-right default-shadow default-radius' _zindex='1000' _left='" + taskCfg.mouseX + "' _top='" + taskCfg.mouseY + "' _width='600' _height='220'><table class='tbl_24'><tr><td>Title 1</td><td>Title 2</td><td>Title 3</td></tr><tr><td>Row 1</td><td>Row 1</td><td>Row 1</td></tr><tr><td>Row 2</td><td>Row 2</td><td>Row 2</td></tr><tr><td>Row 3</td><td>Row 3</td><td>Row 3</td></tr></table></div>\n";
  
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
