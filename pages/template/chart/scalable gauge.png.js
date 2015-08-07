(function() {
  var apiNode = document.getElementById("slide-api");
  var taskCfg = apiNode.taskConfig();
  var sHtml= "<div class='frame-build' _zindex='995' _left='" + taskCfg.mouseX + "' _top='" + taskCfg.mouseY + "' _width='400' _height='400'><iframe class='echarts-gauge build' frameborder='0' border='0' _widget=\"[['FloatRange=','10'],['min=','0'],['max=','100'],['StartAngle=','225'],['EndAngle=','-45'],['SplitNumber','10'],['table=','gauge',,,'value'],[,,'Business indicator','completion','50']]\" _src='/software/slide11/$plugins/echarts_gauge.html' src='/software/slide11/$plugins/echarts_gauge.html'></iframe></div>\n";
  
  var currId = apiNode.currSlideId();
  if (currId) {
    var currNode = document.getElementById(currId);
    apiNode.innerHTML = sHtml;
    
    currNode.appendChild(apiNode.childNodes[0]);
    apiNode.innerHTML = "";
    
    apiNode.addDepends("frame-build","","/software/slide11/$plugins/echarts.js","text/javascript","");
    apiNode.initPagePos(currId);
    apiNode.renewCurrSlide();
    apiNode.selectLastAdded();
    apiNode.setPageModified(currId);
  }
})();
