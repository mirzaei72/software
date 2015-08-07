(function() {
  var apiNode = document.getElementById("slide-api");
  var taskCfg = apiNode.taskConfig();
  var sHtml = "<div class='slideshow-frame read-only' _zindex='996' _left='" + taskCfg.mouseX + "' _top='" + taskCfg.mouseY + "' _width='500' _height='280'><iframe frameborder='0' border='0' src='/software/slide11/$ext/3rd-slideshow/ad.sshow/?size=0x0&autoplay=3&background-color=rgb(255,255,255)&no-frame=1'></iframe><div style='display:block'></div></div>\n";
  
  var currId = apiNode.currSlideId();
  if (currId) {
    var currNode = document.getElementById(currId);
    apiNode.innerHTML = sHtml;
    
    currNode.appendChild(apiNode.childNodes[0]);
    apiNode.innerHTML = "";
    
    apiNode.initPagePos(currId);
    apiNode.renewCurrSlide();
    // apiNode.selectLastAdded();
    apiNode.setPageModified(currId);
  }
})();
