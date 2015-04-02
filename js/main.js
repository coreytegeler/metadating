$(document).ready(function() {
  webcam = document.getElementById('webcam');
  overlay = $('#detectionOverlay');
  face = document.getElementById('face');
  ctx = face.getContext('2d');
  fitSections();
  cursor();
  var fromTop = 0;
  var completeCalled = false;
  hasStarted = false;
  $('.scan').click(function() {
    hasStarted = true;
    $('main .logoWrapper').addClass('fixed');
    $('#detection').addClass('open');
    $('#authorize').attr('class','instructing');
    $('#startTxt').remove();
    setTimeout(function() {
      $('#notifications #head .text').html('Allow us to access your webcam and smile!');
    },100);
    initWebcam();
  });

  $('footer .links a').click(function() {
    openFooter($(this));
  });
});

var tracker = new clm.tracker();
function initWebcam() {
  if (Modernizr.getusermedia) {
    var userMedia = Modernizr.prefixed('getUserMedia', navigator);
    userMedia({video:true}, function(localMediaStream) {
      stream = localMediaStream;
      webcam.src = window.URL.createObjectURL(stream);
      $('#webcam').on('loadedmetadata', function() {
        tracker.init(pModel);
        $('#authorize').attr('class','scanning');
        webcam.play();
        tracker.start(webcam);
        drawLoop();
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

var scanning = 0;
var stopScanning = false;
var pauseScanning = false;
function drawLoop() {
  if(!stopScanning) {
    requestAnimationFrame(drawLoop);
    ctx.clearRect(0,0,face.width,face.height);
    if (tracker.getCurrentPosition()) {
      tracker.draw(face);
    }
    var accuracy = tracker.getScore();
    if (accuracy < 0.6 && pauseScanning == false) {
      if($('#notifications #sub').html() == '') {
        $('#notifications #head .text').html('Please sit still with your face visible within the circle.');
        $('#notifications #sub').html('Having issues? <span class="click restart">Restart</span>');
        
        $('.click.restart').click(function() {
          // tracker.reset(webcam);
          $('#notifications #sub').html('');
        });

        $('#circleBorder').attr('class','pauseExpanding');

      } 
      $('#face').addClass('hide');
      scanning = 0;
    } else {
      $('#face').removeClass('hide');
      scanning=scanning+1;
      authorizing();
    }
  }
}

dataSources = dataSources.sort(function() { return 0.5 - Math.random() });
function authorizing() {
  if(scanning == 80) {
    $('#circleBorder').attr('class','expanding');
    $('#notifications #head .text').html('Stabalizing webcam image');
    $('#notifications #sub').html('');
  } else if (scanning == 100) {
    $('#notifications #head .text').html('Analyzing facial features');
  } else if (scanning == 500) {
  //   $('#notifications #head .text').html('Connecting to Cydonia&#8482; for identity match');
  // } else if (scanning == 800) {
  //   $('#notifications #head .text').html('Confirming your identity');
  // } else if (scanning == 1000) {
  //   $('#notifications #head .text').html('Identity confirmed!');
  // } else if (scanning == 1100) {
  //   $('#notifications #head.text').html('Requesting data from sources');
  // } else if (scanning == 1210) {
      $('#circleBorder').attr('class','pauseExpanding');
      scanSources();
  }
}

function scanSources() {
  pauseScanning = true;
  $('#notifications #head .text').html('');
  $('#rightPanel .title').html('Connecting to data sources');
  $('#authorize').attr('class','checkingSources');
  $.each(dataSources, function(i, dataSource) {
    setTimeout(function() {
      $('#module #sources ul').append('<li>' + dataSource + '</li>');
      if(i > 15) {
        $('#module #sources ul li:first-child').remove();
      }
      // if(i == dataSources.length - 1) {
      if(i == 20) {
        $('#sources').fadeOut(100);
        $('#authorize').addClass('showingMatch');
      }
    }, rand(80, 50) * i);
  });
}

function rand(max,min) {
  var x = Math.floor(Math.random() * (max - min) + min);
  return x;
}

function confirmed() {
  
  if (scanning == 1200) {
    findMatch();
  }
}

function findMatch() {
    $('#notifications #head').html('Finding a match');
    setTimeout(function() {
      $('#face').addClass('hide');
      stopScanning = true;
      $('#notifications #head').html('Found a match!');
      $('#authorize').attr('class','match');
      howDoYouFeel();
    }, 600);
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
      if(hasStarted != true) {
        $('.logoWrapper').removeClass('fixed');
      }

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
    $('.logoWrapper').addClass('fixed');
    page.addClass('open');
    setTimeout(function() {
      $('body').addClass('openFooter');
    }, 80);

    page.children('.closeBanner').click(function(event) {
      $('#logo').attr('src','img/logo.svg');
      $('.logoWrapper').removeClass('fixed');
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

