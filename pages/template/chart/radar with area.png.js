(function() {
  var apiNode = document.getElementById("slide-api");
  var taskCfg = apiNode.taskConfig();
  var sHtml= "<div class='frame-build' _config='default-large-small' _zindex='995' _left='" + taskCfg.mouseX + "' _top='" + taskCfg.mouseY + "' _width='640' _height='550'><iframe class='echarts-radar build' frameborder='0' border='0' _widget=\"[['title=','Budget vs spending'],['desc=','Assumed data'],['legend=','right'],['area=','true'],['table=','radar',,'&lt;Sales:0:6000&gt;','&lt;Administration:0:16000&gt;','&lt;Techology:0:30000&gt;','&lt;Support:0:38000&gt;','&lt;Development:0:52000&gt;','&lt;Marketing:0:25000&gt;'],[,,'Allocated Budget','4300','10000','28000','35000','50000','19000'],[,,'Actual Spending','5000','14000','28000','31000','42000','21000']]\" _src='/software/slide11/$plugins/echarts_radar.html' src='/software/slide11/$plugins/echarts_radar.html'></iframe></div>\n";
  
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
