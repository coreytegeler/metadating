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
    $('#authorize').attr('class','instructing');
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

var tracker = new clm.tracker();
function scanProcess() {
  tracker.init(pModel);
  $('#authorize').attr('class','scanning');
  authorize();
}

function authorize() {
  webcam.play();
  tracker.start(webcam);
  drawLoop();
}

var tracking = 0;
var stop = false;
function drawLoop() {
  if(!stop) {
    requestAnimationFrame(drawLoop);
    ctx.clearRect(0,0,face.width,face.height);
    if (tracker.getCurrentPosition()) {
      tracker.draw(face);
    }
    var accuracy = tracker.getScore();
    if (accuracy < 0.6) {
      $('#notifications').html('Please sit still with your face visible within the circle.');
      $('#face').addClass('hide');
      tracking = 0;
    } else {
      $('#face').removeClass('hide');
      tracking=tracking+1;
      if(tracking < 10) {
        $('#notifications').html('Tracking your face...');
      } else if (tracking < 50) {
        $('#notifications').html('Analyzing facial features...');
      } else if (tracking < 100) {
        $('#notifications').html('Scanning through database...');
      } else if (tracking < 400) {
        $('#notifications').html('Locating possible matches...');
      } else if (tracking < 450) {
        confirmed();
      }
    }
  }
}

function confirmed() {
  // tracker.stop();
  // ctx.clearRect(0,0,face.width,face.height);
  // webcam.pause();
  // stream.stop();
  $('#notifications').html('Identity confirmed!');
  setTimeout(function() {
    findMatch();
  },800);
}

function findMatch() {
  $('#notifications').html('Finding potential matches...');
  setTimeout(function() {
    $('#face').addClass('hide');
    stop = true;

    $('#notifications').html('Found a match!');
    $('#authorize').attr('class','match');
    howDoYouFeel();
  }, 1000);
}

var ec = new emotionClassifier();
ec.init(emotionModel);
var emotionData = ec.getBlank();

function howDoYouFeel() {
  checkEmotion();
}

good = 0;
bad = 0;
var matchConfirmed = false;
function checkEmotion() {
  if(!matchConfirmed) {
    requestAnimationFrame(checkEmotion);
    ctx.clearRect(0,0,face.width,face.height);
    var cp = tracker.getCurrentParameters();      
    var emotion = ec.meanPredict(cp);
    if (tracker.getCurrentPosition()) {
      tracker.draw(face);
      if (emotion) {
        var angry = emotion[0].value;
        var sad = emotion[1].value;
        var surprised = emotion[2].value;
        var happy = emotion[3].value;
        if (happy > 0.6) {
          good = good+1;
          $('#matchCircle').css({backgroundColor : '#73EA83'});
          if(good > 600) {
            yes();
          }
        } else if (angry > 0.5 || sad > 0.8) {
          bad = bad+1;
          $('#matchCircle').css({backgroundColor : '#ccc'});
          if(bad > 600) {
            no();
          }
        } else {
          good = 0;
          bad = 0;
          $('#matchCircle').css({backgroundColor : '#fff'});
        }
      }
    }
  } 
}

function yes() {
  $('#matchCircle').css({backgroundColor : '#28EA44'});
  matchConfirmed = true;
}

function no() {
  $('#matchCircle').css({backgroundColor : '#000'});
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

