(function() {
  var apiNode = document.getElementById("slide-api");
  var taskCfg = apiNode.taskConfig();
  var sHtml= "<div class='frame-build' _zindex='995' _left='" + taskCfg.mouseX + "' _top='" + taskCfg.mouseY + "' _width='680' _height='320'><iframe class='echarts-linebar build' frameborder='0' border='0' _widget=\"[['title=','Waterfall bar diagram'],['desc=','Assumed data'],['legend=','top'],['HideFirstRow=','true'],['table=',,,,'day 1','day 2','day 3','day 4','day 5','day 6','day 7','day 8','day 9','day 10','day 11'],[,'bar','<total>','assist','0','900','1245','1530','1376','1376','1511','1689','1856','1495','1292'],[,,,'Income','900','345','393','-','-','135','178','286','-','-','-'],[,,,'Outgo','-','-','-','108','154','-','-','-','119','361','203']]\" _src='/software/slide11/$plugins/echarts_linebar3.html' src='/software/slide11/$plugins/echarts_linebar3.html'></iframe></div>\n";
  
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
