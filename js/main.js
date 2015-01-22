$(document).ready(function() {
  webcam = document.getElementById('webcam');
  overlay = $('#detectionOverlay');
  face = document.getElementById('face');
  ctx = face.getContext('2d');
  fitSections();
  cursor();
  var fromTop = 0;
  var completeCalled = false;

  $('.scan').click(function() {
    $('main header').addClass('fixed');
    // $('#instructions').addClass('show');
    $('#circle').addClass('open');
    // $('#startTxt').remove();
    // initWebcam();
  });

  $('footer .links a').click(function() {
    openFooter($(this));
  });
});

function initWebcam() {
  if (Modernizr.getusermedia) {
    var userMedia = Modernizr.prefixed('getUserMedia', navigator);
    userMedia({video:true}, function(localMediaStream) {
      stream = localMediaStream;
      webcam.src = window.URL.createObjectURL(stream);
      $('#webcam').on('loadedmetadata', function() {
        webcam.play();
        scanProcess();
        fitCam();
        $(window).resize(function() {
          fitCam();
        });
      });
    }, function() {
      console.log('Failed');
    });
  }
}

function authorize() {
  tracker = new clm.tracker({useWebGL : true});
  tracker.init(pModel);
  tracker.start(webcam);
  // positionLoop();
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
    if (tracker.getCurrentPosition()) {
      tracker.draw(face);
    }
}

function scanProcess() {
  $('#authorize').addClass('open');
  setTimeout(function() {
    authorize();
    var textLife = 1500;
    $('#authorize').addClass('open');
    $('#authTxt span').each(function(i) {
      setTimeout(function() {
        $('#authTxt span:eq('+i+')').css({display:'table'});
        $('#authTxt span:eq('+(i-1)+')').css({display:'none'});
      },textLife*i);
    });
    setTimeout(function() {
      $('#authTxt').remove();
      // var webcamImageData = ctx.getImageData(0,0,webcam.videoWidth,webcam.videoHeight).data;
      // console.log(webcamImageData);
      // var webcamImage = new Image(webcamImageData);
      // stream.stop();
    }, textLife*$('#authTxt span').length);
  },100);
}

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

function openFooter(link) {
  var selected = link.attr('href').substring(1);
  var page = $('.footerPage#' + selected);
  console.log(selected);

  var open = $('body').hasClass('openFooter');
  if(open) {
    if(page.hasClass('open')) {

      $('.footerPage.open').scrollTop(0);


      $('#logo').attr('src','img/logo.svg');
      $('header').removeClass('fixed');
      page.removeClass('open');
      setTimeout(function() {
        $('body').removeClass('openFooter');
      }, 80);
    } else {
      $('.footerPage.open').removeClass('open');
      page.addClass('open');
    }
  } else {
    $('#logo').attr('src','img/logo-notext.svg');
    $('header').addClass('fixed');
    page.addClass('open');
    setTimeout(function() {
      $('body').addClass('openFooter');
    }, 80);

    page.children('.closeBanner').click(function(event) {
      $('#logo').attr('src','img/logo.svg');
      $('header').removeClass('fixed');
      page.removeClass('open');
      $('body').removeClass('openFooter');
    });
  }
}

function cursor() {
  $('.cursor').hover(function() {
    var cursor = $(this).data('cursor');
    console.log(cursor);
  });
}




