(function() {
  var apiNode = document.getElementById("slide-api");
  var currId = apiNode.currSlideId();
  if (!currId) return;
  
  var sNewId = apiNode.newSlideId();
  var sHtml = "<article id='" + sNewId + "'>\n" +
       "<div class='normal-large-small p1-p2-p3-p0 column2-column3-default gap2-gap3-gap1 rule1-rule2-rule3-default' _zindex='994' _config='normal-large-small default-looser-impacted p1-p2-p3-p0 column2-column3-default gap2-gap3-gap1 rule1-rule2-rule3-default default-scroll-hidden' _left='-440' _top='-335' _width='876' _height='656'>\n" +
       "  <p>it is sample text. it is sample text. it is sample text. it is sample text.</p><p>it is sample text. it is sample text. it is sample text. it is sample text. it is sample text. it is sample text. it is sample text.</p>\n" +
       "  <p>it is sample text. it is sample text. it is sample text. it is sample text. it is sample text. it is sample text. it is sample text.</p><p>it is sample text. it is sample text. it is sample text. it is sample text.</p><p>&nbsp;</p>\n" +
       "  <p><img alt='' id='ch-1' src='/software/slide11/shared/template/background/empty.png' style='height:60px; width:270px' title='Chapter 1'></p><p>it is sample text. it is sample text. it is sample text. it is sample text. it is sample text. it is sample text. it is sample text.</p>\n" +
       "  <p>it is sample text. it is sample text. it is sample text. it is sample text. it is sample text. it is sample text. it is sample text.</p><p>it is sample text. it is sample text. it is sample text. it is sample text.</p>\n" +
       "  <p>it is sample text. it is sample text. it is sample text. it is sample text. it is sample text. it is sample text. it is sample text.</p><p>it is sample text. it is sample text. it is sample text. it is sample text. it is sample text. it is sample text. it is sample text.</p>\n" +
       "  <p>it is sample text. it is sample text. it is sample text. it is sample text.</p>\n" +
       "  <p><img alt='' id='se-1' src='/software/slide11/shared/template/background/empty.png' style='height:60px; width:270px' title='1.1 Section'></p><p>it is sample text. it is sample text. it is sample text. it is sample text. it is sample text. it is sample text. it is sample text.</p>\n" +
       "  <p>it is sample text. it is sample text. it is sample text. it is sample text. it is sample text. it is sample text. it is sample text.</p><p>it is sample text. it is sample text. it is sample text. it is sample text.</p>\n" +
       "  <p>it is sample text. it is sample text. it is sample text. it is sample text. it is sample text. it is sample text. it is sample text.</p><p>it is sample text. it is sample text. it is sample text. it is sample text. it is sample text. it is sample text. it is sample text.</p>\n" +
       "  <p>it is sample text. it is sample text. it is sample text. it is sample text.</p><p>&nbsp;</p></div>\n" +
       "<div class='ebook-chapter build' _zindex='1000' _config='default-hidden default-easein-spread-opacity maroon-purple-dimgray-white default-green-olive-teal' _left='-452' _top='-59' _width='180' _height='60' name='ch-1'><table class='ease-in'><tbody><tr><td><h4>Chapter 1</h4></td></tr></tbody></table></div>\n" +
       "<div class='ebook-section build' _zindex='1000' _config='default-hidden default-easein-spread-opacity maroon-purple-dimgray-white olive-teal-default-green' _left='8' _top='-207' _width='220' _height='40' name='se-1'><table class='ease-in'><tbody><tr><td><h5>1.1&nbsp;Section</h5></td></tr></tbody></table></div>\n" +
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
