$('#tocButton').click(function(){
  $('#toc').toggle();
});

var last_update_sp=null;
var last_update_toc=null;
var tableOfContents = {

  enable: function(){
    $('#toc').show();
    this.update()
  },

  disable: function(){
    $('#toc').hide();
  },

  // Find Tags
  findTags: function(){
    var toc = {}; // The main object we will use
    var tocL = {}; // A per line record of each TOC item
    var count = 0;
    var delims = ["h1","h2","h3","h4","h5","h6",".h1",".h2",".h3",".h4",".h5",".h6"];
    if(clientVars.plugins.plugins.ep_context){
      if(clientVars.plugins.plugins.ep_context.styles){
        var styles = clientVars.plugins.plugins.ep_context.styles;
        $.each(styles, function(k, style){
          var contextStyle = "context"+style.toLowerCase();
          delims.push(contextStyle);
        });
      }
    }
    delims = delims.join(",");
    var hs = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").children("div").children(delims);
    $(hs).each(function(){
      // Remember lineNumber is -1 what a user sees
      var lineNumber = $(this).parent().prevAll().length;
      var tag = this.nodeName.toLowerCase();
      var newY = this.offsetTop + "px";
      var linkText = $(this).text(); // get the text for the link
      var focusId = $(this).parent()[0].id; // get the id of the link

      if(tag == "span"){
        tag = $(this).attr("class").replace(/.*(h[1-6]).*/, "$1");
        linkText = linkText.replace(/\s*#*/, '');
      }

      // Create an object of lineNumbers that include the tag
      tocL[lineNumber] = tag;

      // Does the previous line already have this delim?
      // If so do nothing..
      if(tocL[lineNumber-1]){
        if(tocL[lineNumber-1] === tag) return;
      }

      toc[count] = {
        tag : tag,
        y : newY,
        text : linkText,
        focusId : focusId,
        lineNumber : lineNumber
      }
      count++;
    });

    clientVars.plugins.plugins.ep_table_of_context = toc;
    var tocContent = "";
    $.each(toc, function(h, v){ // for each item we should display
      var TOCString = "<a title='"+v.text+"' class='tocItem toc"+v.tag+"' data-class='toc"+v.tag+"' onClick=\"tableOfContents.scroll('"+v.y+"');\" data-offset='"+v.y+"'>"+v.text+"</a>";
      tocContent += TOCString;
    });
    $('#tocItems').html(tocContent);
  },

  // get HTML
  getPadHTML: function(rep){
    if($('#options-toc').is(':checked')) {
      tableOfContents.findTags();
    }
  },

  // show the current position
  showPosition: function(rep){
	if(last_update_sp===null || (new Date()).getTime()-last_update_sp.getTime()>3000){
		last_update_sp=new Date();
    	// We need to know current line # -- see rep
    	// And we need to know what section is before this line number
    	var toc = clientVars.plugins.plugins.ep_table_of_context;
    	if(!toc) return false;
    	var repLineNumber = rep.selEnd[0]; // line Number

    	// So given a line number of 10 and a toc of [4,8,12] we want to find 8..
    	$.each(toc, function(k, line){
    	  if(repLineNumber >= line.lineNumber){
    	    // we might be showing this..
    	    var nextLine = toc[k];
    	    if(nextLine.lineNumber <= repLineNumber){
    	      var activeToc = parseInt(k)+1;

    	      // Seems expensive, we go through each item and remove class
    	      $('.tocItem').each(function(){
    	        $(this).removeClass("activeTOC");
    	      });

    	      $('.toch'+activeToc).addClass("activeTOC");
    	    }
    	  }
    	});
	}
  },

  update: function(rep){
	if(last_update_toc===null || (new Date()).getTime()-last_update_toc.getTime()>3000){
		last_update_toc=new Date();
    	if(rep){
    	  tableOfContents.showPosition(rep);
    	}
    	tableOfContents.getPadHTML(rep);
	}
  },

  scroll: function(newY){
    var $outerdoc = $('iframe[name="ace_outer"]').contents().find("#outerdocbody");
    var $outerdocHTML = $outerdoc.parent();
    $outerdoc.animate({scrollTop: newY});
    $outerdocHTML.animate({scrollTop: newY}); // needed for FF
 },

  getParam: function(sname)
  {
    var params = location.search.substr(location.search.indexOf("?")+1);
    var sval = "";
    params = params.split("&");
    // split param and value into individual pieces
    for (var i=0; i<params.length; i++)
    {
      temp = params[i].split("=");
      if ( [temp[0]] == sname ) { sval = temp[1]; }
    }
    return sval;
  }

};
