(function() {
  var apiNode = document.getElementById("slide-api");
  var currId = apiNode.currSlideId();
  if (!currId) return;
  
  var sNewId = apiNode.newSlideId();
  var sHtml = "<article id='" + sNewId + "'>\n" +
              "<div _config='default-large-small default-looser-impacted' _zindex='1000' _left='-400' _top='-336' _width='780' style='text-align:center;'><h3>This slide has some code</h3></div>\n" +
              "<div class='code-block' _config='default-large-small default-looser-impacted' _zindex='1000' _left='-380' _top='-260' _width='760'><pre>&lt;script type='text/javascript'&gt;\n  // Say hello world until the user starts questioning\n  // the meaningfulness of their existence.\n  function helloWorld(world) {\n    for (var i = 42; --i &gt;= 0;) {\n      alert('Hello ' + String(world));\n    }\n  }\n&lt;/script&gt;\n&lt;style&gt;\n  p { color: pink }\n  b { color: blue }\n  u { color: 'umber' }\n&lt;/style&gt;\n</pre></div>\n" +
              "</article>\n";
  apiNode.innerHTML = sHtml;
  
  var currNode = document.getElementById(currId);
  var newNode = apiNode.childNodes[0];
  if (apiNode.isDropPrevious())
    currNode.parentNode.insertBefore(newNode,currNode);
  else {
    var nextNode = currNode.nextSibling;
    if (nextNode)
      nextNode.parentNode.insertBefore(newNode,nextNode);
    else currNode.parentNode.appendChild(newNode);
  }
  if (SLIDE_HALF_WIDTH == 550)
    newNode.classList.add('wide-screen');
  if (SLIDE_HALF_HEIGHT >= 410)
    newNode.classList.add('taller-screen3');
  else if (SLIDE_HALF_HEIGHT >= 390)
    newNode.classList.add('taller-screen2');
  else if (SLIDE_HALF_HEIGHT >= 370)
    newNode.classList.add('taller-screen');
  apiNode.innerHTML = "";
  
  apiNode.addDepends("code-block","http://www.pinp.me","/software/slide11/$script/prettify/prettify.js","text/javascript","pinpPrettyLoaded()");
  apiNode.initPagePos(sNewId);
  apiNode.saveSlideDoc();
  
  apiNode.renewSlides();
  if (!apiNode.isDropPrevious())
    apiNode.nextSlide();
  apiNode.bringWindowToTop();
    
  setTimeout( function() {
    if (apiNode.savePageImg(sNewId)) {
      var iCurr = apiNode.currSlideIndex();
      var sPreviewFile = CURR_USR_PATH + "$res/" + sNewId + ".png";
      setCookie__("nav_setimg"+SLIDE_GROUP_ID,"[" + (-1-iCurr) + ",'" + sPreviewFile + "']");
      setCookie__("nav_shift"+SLIDE_GROUP_ID,iCurr + '');
    }
  }, 2000);
})();
