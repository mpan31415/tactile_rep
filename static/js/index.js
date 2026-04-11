window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 100;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}

function setCalibrationFocus(focus) {
  var row = document.getElementById('calibration-media-row');
  var leftButton = document.getElementById('focus-data-collection');
  var rightButton = document.getElementById('focus-taxel-rotation');
  if (!row || !leftButton || !rightButton) {
    return;
  }

  var isLeftFocused = focus === 'left';
  row.setAttribute('data-focus', isLeftFocused ? 'left' : 'right');
  row.style.setProperty('--left-col-width', isLeftFocused ? '80%' : '20%');
  row.style.setProperty('--right-col-width', isLeftFocused ? '20%' : '80%');

  leftButton.classList.toggle('is-primary', isLeftFocused);
  leftButton.classList.toggle('is-light', !isLeftFocused);
  leftButton.setAttribute('aria-pressed', isLeftFocused ? 'true' : 'false');

  rightButton.classList.toggle('is-primary', !isLeftFocused);
  rightButton.classList.toggle('is-light', isLeftFocused);
  rightButton.setAttribute('aria-pressed', isLeftFocused ? 'false' : 'true');

  var leftCheck = leftButton.querySelector('.calibration-check');
  var rightCheck = rightButton.querySelector('.calibration-check');
  if (leftCheck) {
    leftCheck.classList.toggle('is-invisible', !isLeftFocused);
  }
  if (rightCheck) {
    rightCheck.classList.toggle('is-invisible', isLeftFocused);
  }
}

function buildVideoCard(src) {
  return [
    '<div class="sim-video-card">',
    '  <video autoplay muted loop playsinline preload="metadata">',
    '    <source src="' + src + '" type="video/mp4">',
    '  </video>',
    '</div>'
  ].join('');
}

function renderVideoGrid(gridId, sourceList) {
  var grid = document.getElementById(gridId);
  if (!grid) {
    return;
  }

  var html = '';
  for (var i = 0; i < sourceList.length; i++) {
    html += buildVideoCard(sourceList[i]);
  }
  grid.innerHTML = html;
}

function getPegRolloutSources(shape) {
  var sources = [];
  for (var i = 1; i <= 3; i++) {
    sources.push('./static/videos/gallery/peg/rollouts/' + shape + '_' + i + '.mp4');
  }
  return sources;
}

function getPegStaticSources(groupName) {
  var sources = [];
  for (var i = 1; i <= 3; i++) {
    sources.push('./static/videos/gallery/peg/' + groupName + '/' + groupName + '_' + i + '.mp4');
  }
  return sources;
}

function getBallRolloutSources(ballType) {
  var sources = [];
  for (var i = 1; i <= 2; i++) {
    sources.push('./static/videos/gallery/ball/cop_rollouts/' + ballType + '_' + i + '.mp4');
  }
  return sources;
}

function getBallBaselineSources(ballType) {
  return [
    './static/videos/gallery/ball/binary_rollouts/' + ballType + '.mp4',
    './static/videos/gallery/ball/cop_rollouts/' + ballType + '_1.mp4',
    './static/videos/gallery/ball/taxel_rollouts/' + ballType + '.mp4'
  ];
}

function setSimGalleryTask(task) {
  var pegSection = document.getElementById('sim-gallery-peg');
  var ballSection = document.getElementById('sim-gallery-ball');
  var pegButton = document.getElementById('sim-task-peg');
  var ballButton = document.getElementById('sim-task-ball');
  if (!pegSection || !ballSection || !pegButton || !ballButton) {
    return;
  }

  var showPeg = task === 'peg';
  pegSection.classList.toggle('is-hidden', !showPeg);
  ballSection.classList.toggle('is-hidden', showPeg);

  pegButton.classList.toggle('is-primary', showPeg);
  pegButton.classList.toggle('is-light', !showPeg);
  pegButton.setAttribute('aria-pressed', showPeg ? 'true' : 'false');

  ballButton.classList.toggle('is-primary', !showPeg);
  ballButton.classList.toggle('is-light', showPeg);
  ballButton.setAttribute('aria-pressed', showPeg ? 'false' : 'true');

  var pegCheck = pegButton.querySelector('.sim-task-check');
  var ballCheck = ballButton.querySelector('.sim-task-check');
  if (pegCheck) {
    pegCheck.classList.toggle('is-invisible', !showPeg);
  }
  if (ballCheck) {
    ballCheck.classList.toggle('is-invisible', showPeg);
  }
}

function initSimToRealGallery() {
  if (!document.getElementById('sim-to-real-gallery')) {
    return;
  }

  var pegShapeSelect = document.getElementById('peg-shape-select');
  var ballTypeSelect = document.getElementById('ball-type-select');
  var ballBaselineTypeSelect = document.getElementById('ball-baseline-type-select');

  function renderPegRollouts() {
    var shape = pegShapeSelect ? pegShapeSelect.value : 'circle';
    renderVideoGrid('peg-rollouts-grid', getPegRolloutSources(shape));
  }

  function renderBallRollouts() {
    var ballType = ballTypeSelect ? ballTypeSelect.value : 'baseball';
    renderVideoGrid('ball-rollouts-grid', getBallRolloutSources(ballType));
  }

  function renderBallBaseline() {
    var ballType = ballBaselineTypeSelect ? ballBaselineTypeSelect.value : 'baseball';
    renderVideoGrid('ball-baseline-grid', getBallBaselineSources(ballType));
  }

  renderPegRollouts();
  renderVideoGrid('peg-normal', getPegStaticSources('normal'));
  renderVideoGrid('peg-ood-grid', getPegStaticSources('ood_init'));
  renderVideoGrid('peg-masked-grid', getPegStaticSources('masked_taxels'));

  renderBallRollouts();
  renderBallBaseline();
  renderVideoGrid('ball-state-grid', ['./static/videos/gallery/ball/ball_state_prediction.mp4']);
  renderVideoGrid('ball-mass-grid', ['./static/videos/gallery/ball/implicit_mass_identification.mp4']);

  if (pegShapeSelect) {
    pegShapeSelect.addEventListener('change', renderPegRollouts);
  }
  if (ballTypeSelect) {
    ballTypeSelect.addEventListener('change', renderBallRollouts);
  }
  if (ballBaselineTypeSelect) {
    ballBaselineTypeSelect.addEventListener('change', renderBallBaseline);
  }

  $('#sim-task-peg').on('click', function() {
    setSimGalleryTask('peg');
  });
  $('#sim-task-ball').on('click', function() {
    setSimGalleryTask('ball');
  });
  setSimGalleryTask('peg');
}


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    $('#focus-data-collection').on('click', function() {
      setCalibrationFocus('left');
    });
    $('#focus-taxel-rotation').on('click', function() {
      setCalibrationFocus('right');
    });
    setCalibrationFocus('right');

    initSimToRealGallery();

    bulmaSlider.attach();

})
