(function() {
  var apiNode = document.getElementById("slide-api");
  var taskCfg = apiNode.taskConfig();
  
  if (taskCfg.svgTool) {
    var defId = apiNode.newMarker();
    var sHtml = "<div class='svg-shape' _defs='" + defId + "' _config='small-default-large default-looser-impacted p1-p2-p3-p0 center-right-default' _widget=\"['rgb(51,51,51)','rgb(51,51,51)',-2,3,['',0,0,2,0,0,36,0]]\" _zindex='998' _left='" + taskCfg.mouseX + "' _top='" + taskCfg.mouseY + "' _width='100' _height='70'><div class='shape-canvas'></div><div class='rotate-txt S5'></div><div class='img-resource'><link rel='bookmark' type='text/xml' href='/software/slide11/$images/shape/arrows.svg.json' /></div></div>\n";
    apiNode.innerHTML = sHtml;
    apiNode.addSvgWidget();
  }
})();
