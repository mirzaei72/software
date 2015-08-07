(function() {
  var apiNode = document.getElementById("slide-api");
  var taskCfg = apiNode.taskConfig();
  var sHtml= "<div class='frame-build' _zindex='995' _left='" + taskCfg.mouseX + "' _top='" + taskCfg.mouseY + "' _width='680' _height='340'><iframe class='echarts-linebar build' frameborder='0' border='0' _widget=\"[['title=',''],['desc=',''],['legend=','top'],['ItalicAxis=','false'],['table=',,,,'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],[,'bar','<left:>','Evaporation','2','4.9','7','23.2','25.6','76.7','135.6','162.2','32.6','20','6.4','3.3'],[,'line','<left:>','Precipitation','2.6','5.9','9','26.4','28.7','70.7','175.6','182.2','48.7','18.8','6','2.3']]\" _src='/software/slide11/$plugins/echarts_linebar.html' src='/software/slide11/$plugins/echarts_linebar.html'></iframe></div>\n";
  
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
