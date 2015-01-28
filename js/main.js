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
    $('#circle').addClass('open');
    $('#startTxt').remove();
    setTimeout(function() {
      $('#notifications').html('Allow us to access your webcam and smile!');
    },100);
    initWebcam();
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
        scanProcess();
        fitCam();
        $(window).resize(function() {
          fitCam();
        });
      });
    }, function() {
      alert('Failed');
    });
  }
}

function authorize() {
  webcam.play();
  tracker.start(webcam);
  drawLoop();
}

var ec = new emotionClassifier();
ec.init(emotionModel);
var emotionData = ec.getBlank();
var stop=false;
function drawLoop() {
  requestAnimationFrame(drawLoop);
  ctx.clearRect(0,0,face.width,face.height);

  if (tracker.getCurrentPosition()) {
    tracker.draw(face);
  }

  var cp = tracker.getCurrentParameters();      
  var emotion = ec.meanPredict(cp);
  if (emotion) {
    var smile = emotion[3].value;
    var accuracy = tracker.getScore();

    if (smile > 0.8 && accuracy > 0.8) {
      console.log('Smile: ' + smile + ' Accuracy: ' + accuracy);
    }
  }
}


var tracker = new clm.tracker();
function scanProcess() {
  
  tracker.init(pModel);
  $('#authorize').addClass('scanning');
  authorize();
  var txtLife = 1500;
  authTxt = [
    'Initializing facial detection...',
    'Analyzing data...',
    'Connecting to database...',
    'Finding possible matches...',
    'Authorizing identity...',
    'Identity found!'
  ];
  for (var i = 0; i < authTxt.length; i++) {
    var txt = authTxt[i];
    notifyAuth(txt);
  }

  function notifyAuth(txt) {
    setTimeout(function() {
      $('#notifications').html(txt);
    },txtLife*i)
  }

  setTimeout(function() {
    $('#notifications').html('');
    // var webcamImageData = ctx.getImageData(0,0,webcam.videoWidth,webcam.videoHeight).data;
    // console.log(webcamImageData);
    // var webcamImage = new Image(webcamImageData);
    // stream.stop();
    // tracker.stop();
  }, txtLife * authTxt.length);
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

