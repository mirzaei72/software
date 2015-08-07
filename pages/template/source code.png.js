(function() {
  var apiNode = document.getElementById("slide-api");
  var taskCfg = apiNode.taskConfig();
  var sHtml = "<div class='code-block impacted-default-looser' _config='default-large-small default-looser-impacted' _zindex='1000' _left='" + taskCfg.mouseX + "' _top='" + taskCfg.mouseY + "' _width='630' _height='300'><pre>&lt;script type='text/javascript'&gt;\n  // Say hello world until the user starts questioning\n  // the meaningfulness of their existence.\n  function helloWorld(world) {\n    for (var i = 42; --i &gt;= 0;) {\n      alert('Hello ' + String(world));\n    }\n  }\n&lt;/script&gt;\n&lt;style&gt;\n  p { color: pink }\n  b { color: blue }\n  u { color: 'umber' }\n&lt;/style&gt;\n</pre></div>\n";
  
  var currId = apiNode.currSlideId();
  if (currId) {
    var currNode = document.getElementById(currId);
    apiNode.innerHTML = sHtml;
    
    currNode.appendChild(apiNode.childNodes[0]);
    apiNode.innerHTML = "";
    
    apiNode.addDepends("code-block","http://www.pinp.me","/software/slide11/$script/prettify/prettify.js","text/javascript","pinpPrettyLoaded()");
    apiNode.initPagePos(currId);
    apiNode.renewCurrSlide();
    apiNode.selectLastAdded();
    apiNode.setPageModified(currId);
  }
})();
