$(document).ready(function() {
  webcam = document.getElementById('webcam');
  overlay = $('#detectionOverlay');
  face = document.getElementById('face');
  ctx = face.getContext('2d');
  fitSections();
  var fromTop = 0;
  var completeCalled = false;

  $('.scan').click(function() {
    initWebcam();
  });

  $('.help').click(function() {
    instruct();
  });

  $('footer .toggle').click(function() {
    $('footer').toggleClass('show');
  });
});



$(window).resize(function() {
  fitSections();
});

function fitSections() {
  $('section').each(function() {
    $(this).height(window.innerHeight);
  });
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
function instruct() {
  var instruct = $('body').hasClass('instructions');

  if(instruct) {
    setTimeout( "$('body').removeClass('instructions');", 80);
    $('#logo').attr('src','img/logo.svg');
    setTimeout( "$('header').removeClass('fixed');", 00);
  } else {
    setTimeout( "$('body').addClass('instructions');", 80);
    $('#logo').attr('src','img/logo-notext.svg');
    setTimeout( "$('header').addClass('fixed');", 00);
  }

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

        setTimeout( "$('header').addClass('fixed');", 800);
        setTimeout( "authorize()", 1500);
        fitCam();
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
  ctx.clearRect(0,0,face.width,face.height);
  tracker.draw(face);
}


