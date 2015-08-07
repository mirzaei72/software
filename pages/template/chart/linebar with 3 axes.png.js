(function() {
  var apiNode = document.getElementById("slide-api");
  var taskCfg = apiNode.taskConfig();
  var sHtml= "<div class='frame-build' _zindex='995' _left='" + taskCfg.mouseX + "' _top='" + taskCfg.mouseY + "' _width='680' _height='380'><iframe class='echarts-linebar build' frameborder='0' border='0' _widget=\"[['title=',''],['desc=',''],['legend=','top'],['ItalicAxis=','false'],['table=',,,,'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],[,'bar','<left:ml>','Evaporation','2','4.9','7','23.2','25.6','76.7','135.6','162.2','32.6','20','6.4','3.3'],[,,,'Precipitation','2.6','5.9','9','26.4','28.7','70.7','175.6','182.2','48.7','18.8','6','2.3'],[,'line','<right:¡ãC>','min-temperature','2','2.2','3.3','4.5','6.3','10.2','20.3','23.4','23','16.5','12','6.2'],[,,,'max-temperature','12','12.2','13.3','14.5','16.3','18.2','28.3','33.4','31','24.5','18','16.2']]\" _src='/software/slide11/$plugins/echarts_linebar.html' src='/software/slide11/$plugins/echarts_linebar.html'></iframe></div>\n";
  
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
