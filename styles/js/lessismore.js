/*!
 * Adapted from Bootstrap docs JavaScript
 */


!function ($) {

  $(function () {
      
		orderTheLeftNavigations();

      	function orderTheLeftNavigations(){
		    $('#navigation .sidenav').html($("#markdown-toc").html());
		    $('#navigation .sidenav ul').addClass("nav");
		    $("#markdown-toc").remove();
      	}

      	$(window).load(repairTheImagesWhichCrossTheMaxWidth);

      	function repairTheImagesWhichCrossTheMaxWidth(){
      		var images = $(".docs-content img");
      		if(images != undefined && images.length > 0){
      			for(var i=0; i< images.length;i++){
      				var imgWidth = images[i].width;
      				if( imgWidth >= 757 ){
      					 images[i].width = 757;
      				}
      			}
      		}
      	}
  })

}(jQuery)
