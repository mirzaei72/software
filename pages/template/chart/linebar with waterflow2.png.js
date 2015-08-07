(function() {
  var apiNode = document.getElementById("slide-api");
  var taskCfg = apiNode.taskConfig();
  var sHtml= "<div class='frame-build' _zindex='995' _left='" + taskCfg.mouseX + "' _top='" + taskCfg.mouseY + "' _width='680' _height='320'><iframe class='echarts-linebar build' frameborder='0' border='0' _widget=\"[['title=','Lowest cost of living at ShenZhen (RMB/Month)'],['desc=','From ExcelHome'],['legend=','top'],['HideFirstRow=','true'],['table=',,,,'Total','HouseRent','WaterElectri','TrafficFee','BoardExpenses','Others'],[,'bar','<total>','assist','0','1700','1400','1200','300','0'],[,,,'CostOfLiving','2900','1200','300','200','900','300']]\" _src='/software/slide11/$plugins/echarts_linebar3.html' src='/software/slide11/$plugins/echarts_linebar3.html'></iframe></div>\n";
  
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
