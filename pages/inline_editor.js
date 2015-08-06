// inline_editor.js

; (function($) {

var currEditingId_ = -1;
var currUseEditing_ = false;

var currEditingHtml_ = '';
var currFontFamily_ = '';

var poplineFontClass_ = ['large-small-default','small-default-large','center-right-default','right-default-center'];

function setVisibleWidth(iWd) {
  var node = document.querySelector('body > section.container');
  if (node) node.style.width = iWd + 'px';
}

function unselectText() {
  if (window.getSelection) {
    var sel = window.getSelection();
    if (sel) sel.removeAllRanges();
  }
  else if (document.selection)
    document.selection.empty();
  
  var popBtn = document.querySelector('ul.popline');
  if (popBtn) popBtn.style.display = 'none';
}

function setContent(id,sHtml,sClass,sFont,sExtern) {
  unselectText();
  
  var txtNode = document.getElementById('txt-widget');
  var editNode = document.querySelector('div.editor');
  if (sFont) {
    txtNode.style.fontFamily = sFont;
    currFontFamily_ = txtNode.style.fontFamily;
  }
  else currFontFamily_ = '';
  
  if (sExtern) {
    var styleNode = document.getElementById('extern-style');
    if (styleNode) styleNode.parentNode.removeChild(styleNode);
    
    styleNode = document.createElement('style');
    styleNode.id = 'extern-style';
    styleNode.innerHTML = sExtern;
    document.body.appendChild(styleNode);
  }
  
  for (var i=0,item; item=poplineFontClass_[i]; i++) {
    if (sClass.indexOf(item) >= 0)
      txtNode.classList.add(item);
    else txtNode.classList.remove(item);
  }
  editNode.innerHTML = sHtml;
  
  currUseEditing_ = true;
  currEditingId_ = id;
  currEditingHtml_ = sHtml;
}

function cleanDefaultFont(editor,sFontFam) {
  var nodes = editor.querySelectorAll('*[style*="font-family:"]');
  for (var i=0,item; item=nodes[i]; i++) {
    if (item.style.fontFamily == sFontFam) {
      if (window.getComputedStyle(item.parentNode).fontFamily == sFontFam)
        item.style.fontFamily = '';
    }
  }
}

function getContent(id) {
  if (currUseEditing_) {
    if (id === currEditingId_) {
      unselectText();
      var editor = document.querySelector('.editor');
      if (currFontFamily_)
        cleanDefaultFont(editor,currFontFamily_); // clear duplicated font-family
      
      var sRet = editor.innerHTML;
      if (sRet === currEditingHtml_)
        return '<nochange/>';
      else return sRet;
    }
    else return '<error/>';
  }
  else return '<nochange/>';
}

function hideContent() {
  unselectText();
  currUseEditing_ = false;
  currEditingId_ = -1;
}

window.setVisibleWidth = setVisibleWidth;
window.setContent = setContent;
window.getContent = getContent;
window.hideContent = hideContent;

setTimeout( function() {
  document.execCommand('defaultParagraphSeparator',false,'p');
  $(".editor").popline({position: "fixed"}); // 'fixed' or 'relative'
},0);

})(jQuery);
