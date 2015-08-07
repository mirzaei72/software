(function() {
  var apiNode = document.getElementById("slide-api");
  var taskCfg = apiNode.taskConfig();
  
  if (taskCfg.svgTool) {
    var defId = apiNode.newMarker();
    var sHtml = "<div class='svg-shape' _defs='" + defId + "' _config='small-default-large default-looser-impacted p1-p2-p3-p0 center-right-default' _widget=\"['rgb(51,51,51)','rgb(51,51,51)',0,3]\" _zindex='998' _left='" + taskCfg.mouseX + "' _top='" + taskCfg.mouseY + "' _width='60' _height='60'><div class='shape-canvas'></div><div class='rotate-txt S5'></div><div class='img-resource zero-area'><link rel='bookmark' type='text/xml' href='/software/slide11/$images/shape/point_node.svg.json' /></div></div>\n";
    apiNode.innerHTML = sHtml;
    apiNode.addSvgWidget();
  }
})();
