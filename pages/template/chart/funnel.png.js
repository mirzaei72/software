(function() {
  var apiNode = document.getElementById("slide-api");
  var taskCfg = apiNode.taskConfig();
  var sHtml= "<div class='frame-build' _zindex='995' _left='" + taskCfg.mouseX + "' _top='" + taskCfg.mouseY + "' _width='500' _height='400'><iframe class='echarts-funnel build' frameborder='0' border='0' _widget=\"[['title=','Funnel diagram'],['desc=','Assumed data'],['legend=','bottom'],['gap=','0'],['LabelPosition=','inside'],['SortType=','descending'],['table=','funnel',,,'value'],[,,'Funnel diagram','visited','60'],[,,,'consulted','40'],[,,,'order','20'],[,,,'clicked','80'],[,,,'exhibits','100']]\" _src='/software/slide11/$plugins/echarts_funnel.html' src='/software/slide11/$plugins/echarts_funnel.html'></iframe></div>\n";
  
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
