$(document).ready(function() {
  $(window).scroll(function(event) {
  	var headerCatch = $('header.big').height() - 50;
  	var top = $(window).scrollTop();
  	if(top >= headerCatch){
  		catchHeader();
  	} else {
  		dropHeader();
  	}
  });
});
function catchHeader() {
	$('header.fixed').addClass('caught');
}
function dropHeader() {
	$('header.fixed').removeClass('caught');
}