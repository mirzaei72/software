(function() {
  var apiNode = document.getElementById("slide-api");
  var taskCfg = apiNode.taskConfig();
  var sHtml = "<div class='svg-shape' _config='small-default-large default-looser-impacted p1-p2-p3-p0 center-right-default' _widget=\"['rgba(0,0,0,0)','rgba(0,0,0,0)',0,3,['']]\" _zindex='998' _left='" + taskCfg.mouseX + "' _top='" + taskCfg.mouseY + "' _width='60' _height='60'><div class='shape-canvas' style='background-image:url(/software/slide11/$images/addPicture.jpg); background-repeat:no-repeat; background-position:0px 0px; background-size:100% 100%;'></div><div class='rotate-txt S5 txt-right'></div><div class='img-resource'><link rel='bookmark' type='text/xml' href='/software/slide11/$images/shape/rect.svg.json' /></div></div>\n";
  
  if (taskCfg.svgTool) {
    apiNode.innerHTML = sHtml;
    apiNode.addSvgWidget();
  }
  else {
    var currId = apiNode.currSlideId();
    if (currId) {
      var currNode = document.getElementById(currId);
      apiNode.innerHTML = sHtml;
      
      currNode.appendChild(apiNode.childNodes[0]);
      apiNode.innerHTML = "";
      
      apiNode.initPagePos(currId);
      apiNode.renewCurrSlide();
      apiNode.selectLastAdded();
      apiNode.loadSvgRes();
      apiNode.setPageModified(currId);
    }
  }
})();
