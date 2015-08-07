(function() {
  var apiNode = document.getElementById("slide-api");
  var taskCfg = apiNode.taskConfig();
  var sHtml= "<div class='frame-build' _zindex='995' _left='" + taskCfg.mouseX + "' _top='" + taskCfg.mouseY + "' _width='680' _height='380'><iframe class='echarts-linebar build' frameborder='0' border='0' _widget=\"[['title=',''],['desc=',''],['legend=','top'],['ItalicAxis=','false'],['table=',,,,'Monday','Tuesday','Wednesday','Thurday','Friday','Saturday','Sunday'],[,'line','<area:>','Saled','10','12','21','54','260','830','710'],[,,,'Pre-order','30','182','434','791','390','30','10'],[,,,'Intented','1320','1132','601','234','120','90','20']]\" _src='/software/slide11/$plugins/echarts_linebar.html' src='/software/slide11/$plugins/echarts_linebar.html'></iframe></div>\n";
  
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
