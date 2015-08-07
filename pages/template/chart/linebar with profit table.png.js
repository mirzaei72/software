(function() {
  var apiNode = document.getElementById("slide-api");
  var taskCfg = apiNode.taskConfig();
  var sHtml= "<div class='frame-build' _zindex='995' _left='" + taskCfg.mouseX + "' _top='" + taskCfg.mouseY + "' _width='680' _height='380'><iframe class='echarts-linebar build' frameborder='0' border='0' _widget=\"[['title=',''],['desc=',''],['legend=','top'],['InOut=','true'],['table=',,,,'Monday','Tuesday','Wednesday','Thurday','Friday','Saturday','Sunday'],[,'bar','<none:>','Profit','200','170','240','244','200','220','210'],[,,'<Amount>','Income','320','302','341','374','390','450','420'],[,,,'Outgo','-120','-132','-101','-134','-190','-230','-210']]\" _src='/software/slide11/$plugins/echarts_linebar2.html' src='/software/slide11/$plugins/echarts_linebar2.html'></iframe></div>\n";
  
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
