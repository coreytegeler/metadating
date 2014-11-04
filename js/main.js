$(document).ready(function() {
  
  fit();
  var fromTop = 0;
  $(window).on('mousewheel', function() {
    var scrollY = event.deltaY;
    fromTop = fromTop+scrollY;
    if(fromTop >= 20) {
      $(window).scrollTop(window.innerHeight);
    }
  });


  $(window).scroll(function(event) {
    console.log(event);
  	var headerCatch = $('header.big').height() - 50;
  	var top = $(window).scrollTop();
  	if(top >= headerCatch){
  		catchHeader();
  	} else {
  		dropHeader();
  	}
  });
});

$(window).resize(function() {
  fit();
});

$(window).on('beforeunload', function(){
  $(document).scrollTop(0);
});

function fit() {
  $('section').each(function() {
    $(this).height(window.innerHeight);
  });
}

function catchHeader() {
  $('header.fixed').addClass('caught');
}

function dropHeader() {
  $('header.fixed').removeClass('caught');
}


