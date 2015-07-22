(function() {
  var apiNode = document.getElementById("slide-api");
  var currId = apiNode.currSlideId();
  if (!currId) return;
  
  var sNewId = apiNode.newSlideId();
  var sHtml = "<article id='" + sNewId + "'>\n" +
        "<div class='S6 img-resource' _zindex='0'><a href='http://www.pinp.me/'>Html5 slide PPT powered by PINP</a></div>\n" +
        "<div class='ebook-title impacted-default-looser' _zindex='1000' _config='default-large-small impacted-default-looser default-hidden' _left='-326' _top='-331' _width='592' _height='44'><h3 style='text-align:center'>Put Book's Title Here</h3></div>\n" +
        "<div class='ebook-contents normal-large-small gap2-gap3-gap1 rule1-rule2-rule3-default column2-column3-default' _zindex='994' _config='normal-large-small default-looser-impacted column2-column3-default gap2-gap3-gap1 rule1-rule2-rule3-default' _left='-342' _top='5' _width='666' _height='76'><ul><li class='echapter'>Chapter 1</li><li><a href='#'>2</a></li></ul><ul><li class='esection'>&nbsp;&nbsp;1.1 Section A</li><li><a href='#'>3</a></li></ul><ul><li class='echapter'>Chapter 2</li><li><a href='#'>5</a></li></ul><ul><li class='esection'>&nbsp;&nbsp;2.1 Section B</li><li><a href='#'>8</a></li></ul><ul><li class='esection'>&nbsp;&nbsp;2.2 Section C</li><li><a href='#'>9</a></li></ul></div>\n" +
        "<div class='ebook-abstract normal-large-small' _zindex='1000' _config='normal-large-small default-looser-impacted default-hidden' _left='-277' _top='-184' _width='544' _height='167'><p>Abstract of the article ...</p></div>\n" +
        "<div class='gap2-gap3-gap1 rule1-rule2-rule3-default p1-p2-p3-p0 small-normal-large' _zindex='994' _config='small-normal-large default-looser-impacted p1-p2-p3-p0 default-column2-column3 gap2-gap3-gap1 rule1-rule2-rule3-default' _left='-228' _top='-300' _width='397' _height='41'><p style='text-align:center'>writed&nbsp;by XXX, &nbsp;created at &nbsp;2013-01-01</p></div>\n" +
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
