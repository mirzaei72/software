(function() {
  var apiNode = document.getElementById("slide-api");
  var taskCfg = apiNode.taskConfig();
  var sHtml= "<div class='frame-build' _zindex='995' _left='" + taskCfg.mouseX + "' _top='" + taskCfg.mouseY + "' _width='680' _height='340'><iframe class='echarts-linebar build' frameborder='0' border='0' _widget=\"[['title=',''],['desc=',''],['legend=','top'],['ItalicAxis=','false'],['table=',,,,'Monday','Tuesday','Wednesday','Thurday','Friday','Saturday','Sunday'],[,'bar','<left:>','Directly','320','332','301','334','390','330','320'],[,,'<Advertising>','Email','120','132','101','134','90','230','210'],[,,,'Viedo','150','232','201','154','190','330','410'],[,,'<left:>','SearchEngine','862','1018','964','1026','1679','1600','1570'],[,,'<Search>','BaiDu','620','732','701','734','1090','1130','1120'],[,,,'Google','120','132','101','134','290','230','220'],[,,,'Bing','60','72','71','74','190','130','110'],[,,,'Others','62','82','91','84','109','110','120']]\" _src='/software/slide11/$plugins/echarts_linebar.html' src='/software/slide11/$plugins/echarts_linebar.html'></iframe></div>\n";
  
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
