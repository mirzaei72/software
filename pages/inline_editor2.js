// inline_editor2.js

; (function($) {

var currFontFamily_ = '';

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

function cleanDefaultFont(editor,sFontFam) {
  var nodes = editor.querySelectorAll('*[style*="font-family:"]');
  for (var i=0,item; item=nodes[i]; i++) {
    if (item.style.fontFamily == sFontFam) {
      if (window.getComputedStyle(item.parentNode).fontFamily == sFontFam)
        item.style.fontFamily = '';
    }
  }
}

function getContent() {
  unselectText();
  var editor = document.querySelector('.editor');
  if (currFontFamily_)
    cleanDefaultFont(editor,currFontFamily_); // clear duplicated font-family
  
  return editor.innerHTML;
}

function setContent(sHtml,sizeCls,sizeCls2,sFont,sExtern) {
  unselectText();
  
  var owner = document.getElementById('txt-widget');
  var editor = document.querySelector('div.editor');
  if (sFont) {
    editor.style.fontFamily = sFont;
    currFontFamily_ = editor.style.fontFamily;
  }
  else currFontFamily_ = '';
  
  if (sExtern) {
    var styleNode = document.getElementById('extern-style');
    if (!styleNode) {
      styleNode = document.createElement('style');
      styleNode.id = 'extern-style';
      styleNode.innerHTML = sExtern;
      document.body.appendChild(styleNode);
    }
  }
  
  if (sizeCls) owner.className = sizeCls;
  if (sizeCls2)
    editor.className = 'editor ' + sizeCls2;
  else editor.className = 'editor';
  editor.innerHTML = sHtml;
}

function poplineClicked(event) {
  if (window.parent) {
    var ownerWin = window.parent.window;
    if (ownerWin.onPoplineClicked)
      ownerWin.onPoplineClicked();
  }
}

window.unselectText = unselectText;
window.getContent = getContent;
window.setContent = setContent;
window.poplineClicked = poplineClicked;

setTimeout( function() {
  document.execCommand('defaultParagraphSeparator',false,'p');
  $(".editor").popline({position: "fixed"}); // 'fixed' or 'relative'
},0);

})(jQuery);
