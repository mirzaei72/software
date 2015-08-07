(function() {
  var apiNode = document.getElementById("slide-api");
  var taskCfg = apiNode.taskConfig();
  var sHtml= "<div class='frame-build' _zindex='995' _left='" + taskCfg.mouseX + "' _top='" + taskCfg.mouseY + "' _width='660' _height='320'><iframe class='echarts-linebar build' frameborder='0' border='0' _widget=\"[['title=','Thermometer style diagram'],['desc=','From ExcelHome'],['legend=','top'],['HideFirstRow=','false'],['table=',,,,'Cosco','CMA','APL','OOCL','Wanhai','Zim'],[,'bar','<total>','Acutal','260','200','220','120','100','80'],[,,,'Forecast','40','80','50','80','80','70']]\" _src='/software/slide11/$plugins/echarts_linebar3.html' src='/software/slide11/$plugins/echarts_linebar3.html'></iframe></div>\n";
  
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
