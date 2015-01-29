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
      $('#notifications #head').html('Allow us to access your webcam and smile!');
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
var pause = false;
function drawLoop() {
  if(!stop) {
    requestAnimationFrame(drawLoop);
    ctx.clearRect(0,0,face.width,face.height);
    if (tracker.getCurrentPosition()) {
      tracker.draw(face);
    }
    var accuracy = tracker.getScore();
    if (accuracy < 0.6 && pause == false) {
      $('#notifications #head').html('Please sit still with your face visible within the circle.');
      $('#notifications #sub').html('Having issues? <span class="click restart">Restart</span>');
      $('.click.restart').click(function() {
        // tracker.reset(webcam);
        $('#notifications #sub').html('');
      });
      $('#face').addClass('hide');
      tracking = 0;
    } else {
      $('#face').removeClass('hide');
      tracking=tracking+1;
      if(tracking < 10) {
        $('#notifications #sub').html('');
        $('#notifications #head').html('Tracking your face...');
      } else if (tracking < 50) {
        $('#notifications #head').html('Analyzing facial features...');
      } else if (tracking < 100) {
        $('#notifications #head').html('Scanning through database...');
      } else if (tracking < 400) {
        $('#notifications #head').html('Confirming your identity...');
      } else if (tracking < 500) {
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
  $('#notifications #head').html('Identity confirmed!');
  $('#notifications #sub').html('');
  pause = true;
  setTimeout(function() {
    findMatch();
  },800);
}

function findMatch() {
  $('#notifications #head').html('Analyzing your data profile...');
  setTimeout(function() {
    $('#notifications #head').html('Finding a match...');
    setTimeout(function() {
      $('#face').addClass('hide');
      stop = true;
      // $('#notifications #head').html('Found a match!');
      $('#authorize').attr('class','match');
      howDoYouFeel();
    }, 600);
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
          if(good > 1000) {
            yes();
          }
        } else if (angry > 0.5 || sad > 0.8) {
          bad = bad+1;
          $('#matchCircle').css({backgroundColor : '#ededed'});
          if(bad > 1000) {
            no();
          }
        } else {
          good = 0;
          bad = 0;
          $('#matchCircle').css({backgroundColor : '#ed1c24'});
        }
      }
    }
  } 
}

function yes() {
  $('#matchCircle').css({backgroundColor : '#28EA44'});
  // matchConfirmed = true;
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

