(function() {
  var apiNode = document.getElementById("slide-api");
  var currId = apiNode.currSlideId();
  if (!currId) return;
  
  var sNewId = apiNode.newSlideId();
  var sHtml = "<article id='" + sNewId + "'>\n" +
              "<div _config='default-large-small default-looser-impacted' _zindex='1000' _left='-400' _top='-336' _width='780' style='text-align:center;'><h3>Slide with a table</h3></div>\n" +
              "<div class='table-set gray-border' _config='default-large-small default-looser-impacted default-center-right shadow-default default-radius' _zindex='1000' _left='-325' _top='-239' _width='600' _height='220'><table class='tbl_01'><tbody><tr><td>Title 1</td><td>Title 2</td><td>Title 3</td></tr><tr><td>Row 1</td><td>Row 1</td><td>Row 1</td></tr><tr><td>Row 2</td><td>Row 2</td><td>Row 2</td></tr><tr><td>Row 3</td><td>Row 3</td><td>Row 3</td></tr></tbody></table></div>\n" +
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
