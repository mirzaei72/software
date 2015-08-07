(function() {
  var apiNode = document.getElementById("slide-api");
  var taskCfg = apiNode.taskConfig();
  var sHtml= "<div class='frame-build' _zindex='995' _left='" + taskCfg.mouseX + "' _top='" + taskCfg.mouseY + "' _width='680' _height='360'><iframe class='echarts-linebar build' frameborder='0' border='0' _widget=\"[['title=','World gross population'],['desc=','Unit: ten thousand (10,000)'],['legend=','top'],['InOut=','false'],['table=',,,,'Brazil','Indonesia','America','India','Chian','World'],[,'bar','<none:>','2011','18203','23489','29034','104970','131744','630230'],[,,,'2012','19325','23438','31000','121594','134141','681807']]\" _src='/software/slide11/$plugins/echarts_linebar2.html' src='/software/slide11/$plugins/echarts_linebar2.html'></iframe></div>\n";
  
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
