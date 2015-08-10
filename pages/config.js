(function() {
  var language_ = (navigator.browserLanguage || navigator.language).toLowerCase();

  window.WEBMAKER_MASK = 0; // bit0:release/inDesign, bit1:testing ...
  window.WEBMAKER_MAIN = {'config': {
    'jsonBaseUrl': 'http://localhost:8072',
    'baseUrl': '',  // base URL for extended widget modules
  }};
  window.SLIDE_VERSION = [1,0,0];  // ver 1.0.0
  
  if (language_ == 'zh-cn') {
    window.PINP_SLIDE_FONT = "'Microsoft YaHei','微软雅黑','SimHei','黑体','SimSun','宋体','Arial','Helvetica','sans-serif'";
    window.PINP_SOURCECODE_FONT = "'Courier New','Verdana','monospace'";
    window.PINP_CONTENT_FONT = "微软雅黑;黑体;宋体;新宋体;幼圆;隶书;楷体_GB2312;方正姚体;方正舒体;Arial;Helvetica;sans-serif;Arial Narrow;Comic Sans MS;STHeiti;Courier New;monospace;Verdana;Georgia;Lucida Sans Unicode;Lucida Grande;Tahoma;Geneva;Times New Roman;Trebuchet MS";
  }
  else {
    window.PINP_SLIDE_FONT = "'Arial','Helvetica','sans-serif','Microsoft YaHei','SimHei','SimSun'";
    window.PINP_SOURCECODE_FONT = "'Courier New','Verdana','monospace'";
    window.PINP_CONTENT_FONT = "Arial;Helvetica;sans-serif;Arial Narrow;Comic Sans MS;STHeiti;Courier New;monospace;Verdana;Georgia;serif;Lucida Sans Unicode;Lucida Grande;Tahoma;Geneva;Times New Roman;Trebuchet MS;Microsoft YaHei;SimHei;SimSun";
  }
})();
