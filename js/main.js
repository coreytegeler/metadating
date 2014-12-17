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
      $('.scan').off();
  });

  $('.slideLink').click(function() {
    var section = $('.slideLink').data('section');
    openSlide(section);
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
function openSlide(section) {
  $slide = $('.slide#'+section);
  
  var open = $slide.hasClass('open');

  if(open) {
    $slide.removeClass('open');
    setTimeout( "$('body').removeClass('openSlide');", 80);
    if(!$('body').hasClass('authorize')) {
      $('#logo').attr('src','img/logo.svg');
      $('header').removeClass('fixed');
    }
  } else {
    $slide.addClass('open');
    setTimeout( "$('body').addClass('openSlide');", 80);
    $('#logo').attr('src','img/logo-notext.svg');
    $('header').addClass('fixed');
  }
}
function initWebcam() {
    if (Modernizr.getusermedia) {
      var userMedia = Modernizr.prefixed('getUserMedia', navigator);
      userMedia({video:true}, function(localMediaStream) {
        webcam.src = window.URL.createObjectURL(localMediaStream);
        webcam.onloadedmetadata = function(e) {

        setTimeout(function() {
          $('body').addClass('authorize');
          $('#authorize').addClass('open');
            $('#authTxt span').each(function(i) {
              setTimeout(function() {
                $('#authTxt span:eq('+i+')').css({display:'table'});
                $('#authTxt span:eq('+(i-1)+')').css({display:'none'});
              },2000*i);
            });
            setTimeout(function() {
              $('#authorize').addClass('close').delay(600).removeClass('open');
              setTimeout(function() {
                $('#authorize').remove();
                $('body').removeClass('authorize');
              },600);
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


