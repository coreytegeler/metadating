$(document).ready(function() {
  webcam = document.getElementById('webcam');
  overlay = $('#detectionOverlay');
  canvas = document.getElementById('face');
  ctx = canvas.getContext('2d');
  initWebcam();
  fitSections();
  var fromTop = 0;
  var completeCalled = false;
  $(window).on('mousewheel', function() {
    var scrollY = event.deltaY;
    fromTop = fromTop+scrollY;
    if(fromTop >= 20) {
      $("html, body").animate({scrollTop: h()}, 400, function(){
        if(!completeCalled){
          completeCalled = true;
          alert('this alert will popup once');
        }
      });
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
  fitSections();
});

$(window).on('beforeunload', function(){
  $(document).scrollTop(0);
});

function fitSections() {
  $('section').each(function() {
    $(this).height(window.innerHeight);
  });
}

function buildCircleMask() {
  var circle;
}

function fitCam() {
  webcamHeight = webcam.videoHeight;
  webcamWidth = webcam.videoWidth;
  var centerShift = -webcamWidth/2 + 250;
  $('#webcam').css({x: centerShift});
  $('#detectionOverlay').css({x: centerShift});
  // webcamRatio = webcamWidth/webcamHeight;
  // console.log(webcamWidth, webcamHeight, webcamRatio);
  // overlay.width(window.innerWidth);
  // overlay.height(Math.round(window.innerWidth / webcamRatio));
  // var top = winW()/2 - overlay.height()/2;
  // overlay.css({'top': top});
}

function catchHeader() {
  $('header.fixed').addClass('caught');
}

function dropHeader() {
  $('header.fixed').removeClass('caught');
}

function winH() {
  return window.innerHeight;
}

function winW() {
  return window.innerWidth;
}

function initWebcam() {
    if (Modernizr.getusermedia) {
      var userMedia = Modernizr.prefixed('getUserMedia', navigator);
      userMedia({video:true}, function(localMediaStream) {
        webcam.src = window.URL.createObjectURL(localMediaStream);
        webcam.onloadedmetadata = function(e) {

        setTimeout(function() {
          $('#authorize').addClass('open');
            $('#authTxt span').each(function(i) {
              setTimeout(function() {
                $('#authTxt span:eq('+i+')').css({display:'table'});
                $('#authTxt span:eq('+(i-1)+')').css({display:'none'});
              },2000*i);
            });
            setTimeout(function() {
              $('#authorize').addClass('close').delay(600).remove('open');
            }, 2000*$('#authTxt span').length);
            
        },1000);

        setTimeout( "$('header#logo').addClass('fixed');", 800);
        setTimeout( "authorize()", 1500);
        fitCam()
          $(window).resize(function() {
            fitCam();
          });
        };
      }, function() {
        console.log('Failed');
      });
    }
  }

function authorize() {
  tracker = new clm.tracker();
  tracker.init(pModel);
  tracker.start(webcam);
  positionLoop();
  drawLoop();
}

function positionLoop() {
  requestAnimationFrame(positionLoop);
  var positions = tracker.getCurrentPosition();
  positionString = "";
  if(positions) {
    for (var p=0;p<10;p++) {
      positionString += positions[p][0].toFixed(2)+","+positions[p][1].toFixed(2);
    }
  }
}

function drawLoop() {
  requestAnimationFrame(drawLoop);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  tracker.draw(canvas);
}


