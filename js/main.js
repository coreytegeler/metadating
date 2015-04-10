$(document).ready(function() {

  $('body').addClass('init');

  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
    $('body').addClass('mobile');
  }
  else {
    webcam = document.getElementById('webcam');
    overlay = $('#detectionOverlay');
    face = document.getElementById('face');
    ctx = face.getContext('2d');
    fitSections();
    var fromTop = 0;
    var completeCalled = false;
    $('.scan').click(function() {
      $('body').removeClass('home');
      hasStarted = true;
      setTimeout(function() {
        $('main .logoWrapper').addClass('fixed');
        $('#notifications #head .text').html('Allow us to access your webcam and smile!');
        $('#notifications').addClass('show');
        setTimeout(function() {
          $('#detection').addClass('open');
          setTimeout(function() {
            $('#authorize').attr('class','instructing');
            $('#startTxt').remove();
          },200);
        },200);
      },200);
      initWebcam();
    });
  }

  hasStarted = false;
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
          window.location.reload();
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
    $('#notifications #head .text').html('Connecting to Cydonia&#8482; for identity match');
  } else if (scanning == 800) {
    $('#notifications #head .text').html('Confirming your identity');
  } else if (scanning == 1000) {
    $('#notifications #head .text').html('Identity confirmed!');
  } else if (scanning == 1100) {
    $('#notifications #head.text').html('Requesting data from sources');
  } else if (scanning == 1210) {
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
      if(i == dataSources.length - 1) {
      // if(i == 20) {
        $('#sources').fadeOut(100);
        setTimeout(function() {
          $('#authorize').addClass('completed');
        }, 300);
      }
    }, rand(80, 50) * i);
  });
}

function rand(max,min) {
  var x = Math.floor(Math.random() * (max - min) + min);
  return x;
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
  var selected = link.attr('data-link');
  var page = $('.footerPage#' + selected);
  console.log(selected);

  var open = $('body').hasClass('openFooter');
  if(open) {
    if(page.hasClass('open')) {

      $('.footerPage.open').scrollTop(0);
      
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
    $('.logoWrapper').addClass('fixed');
    page.addClass('open');
    setTimeout(function() {
      $('body').addClass('openFooter');
    }, 80);

    page.children('.closeBanner').click(function(event) {
      if($('body').hasClass('home')) {
        $('.logoWrapper').removeClass('fixed');
      }
      page.removeClass('open');
      $('body').removeClass('openFooter');
    });
  }
}
