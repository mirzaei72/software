(function() {
  var apiNode = document.getElementById("slide-api");
  var taskCfg = apiNode.taskConfig();
  var sHtml= "<div class='frame-build' _zindex='995' _left='" + taskCfg.mouseX + "' _top='" + taskCfg.mouseY + "' _width='666' _height='444'><iframe class='echarts-force build every-build' frameborder='0' border='0' _widget=\"[['title=','Relationship: Steve Jobs'],['desc=','Data from Renlifang'],['legend=','bottom'],['table=','force',,,,'Lisa Jobs','Paul Jobs','Clara Jobs','Laurene Powell','Steven Wozniak','Obama','Bill Gates','Jonathan Ive','Tim Cook','Long Wayne'],[,,'Personage','Steve Jobs','10','1','2','1','2','3','6','6','1','1','1'],[,,'Family','Lisa Jobs','2'],[,,,'Paul Jobs','3',,,'1',,,'1'],[,,,'Clara Jobs','3',,,,,,'1','1'],[,,,'Laurene Powell','7',,,,,,'1'],[,,'Friend','Steven Wozniak','5',,,,,,'1'],[,,,'Obama','8',,,,,,,'6',,'1'],[,,,'Bill Gates','9'],[,,,'Jonathan Ive','4'],[,,,'Tim Cook','4'],[,,,'Long Wayne','1']]\" _src='/software/slide11/$plugins/echarts_force.html' src='/software/slide11/$plugins/echarts_force.html'></iframe></div>\n";
  
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
