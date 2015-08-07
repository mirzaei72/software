(function() {
  var apiNode = document.getElementById("slide-api");
  var taskCfg = apiNode.taskConfig();
  var sHtml= "<div class='frame-build' _zindex='995' _left='" + taskCfg.mouseX + "' _top='" + taskCfg.mouseY + "' _width='660' _height='440'><iframe class='echarts-scatter build' frameborder='0' border='0' _widget=\"[['title=','Height/Weight of Male/Female'],['desc=','Data from Heinz 2003'],['legend=','top'],['table=','scatter',,'&lt;Height:cm&gt;','&lt;Weight:kg&gt;'],[,,'Female','161.2','51.6'],[,,,'167.5','59'],[,,,'159.5','49.2'],[,,,'157.0','63.0'],[,,,'155.8','53.6'],[,,,'170.0','59.0'],[,,,'159.1','47.6'],[,,,'166.0','69.8'],[,,,'176.2','66.8'],[,,,'160.2','75.2'],[,,,'172.5','55.2'],[,,,'170.9','54.2'],[,,,'172.9','62.5'],[,,,'153.4','42.0'],[,,,'160.0','50.0'],[,,,'147.2','49.8'],[,,,'168.2','49.2'],[,,,'175.0','73.2'],[,,'Male','174','65.5'],[,,,'175.3','71.8'],[,,,'193.5','80.7'],[,,,'186.5','72.6'],[,,,'187.2','78.8'],[,,,'181.5','74.8'],[,,,'184.0','86.4'],[,,,'184.5','78.4'],[,,,'175.0','62.0'],[,,,'184.0','81.6'],[,,,'180.0','76.6'],[,,,'177.8','83.6'],[,,,'192.0','90.0'],[,,,'176.0','74.6'],[,,,'174.0','71.0'],[,,,'184.0','79.6'],[,,,'192.7','93.8'],[,,,'171.5','70.0']]\" _src='/software/slide11/$plugins/echarts_scatter.html' src='/software/slide11/$plugins/echarts_scatter.html'></iframe></div>\n";
  
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
