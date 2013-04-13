$(function () {

  // Elements
  var $start = $('#start'),
    $input = $('#input'),
    $results = $('#results'),
    $stats = $('#stats'),
    $circle = $('#circle');

  // Async results collecting stuff
  var results = {},
    done = null;

  // Settings
  var timeToRotate = 700;

  /*
   * Get all pages of paginated content from the Github API
   */
  function getAll(url, callback, output, page, pageSize) {
    if (typeof output === 'undefined') { output = []; }
    if (typeof page === 'undefined') { page = 1; }
    if (typeof pageSize === 'undefined') { pageSize = 500; }
    $.getJSON(url + '?' + $.param({page: page, per_page: pageSize}), function (data) {
      if (data.length === pageSize) {
        getAll(url, callback, output.concat(data), page + 1, pageSize);
      } else {
        callback(output.concat(data));
      }
    });
  }

  /*
   * Records a result returned from GitHub's API
   */
  function record(key, value, callback) {
    results[key] = value;
    if (results.hasOwnProperty('user') && results.hasOwnProperty('repos')) {
      var totalStars = 0,
        totalForks = 0;

      $.each(results.repos, function (i, repo) {
        totalStars += repo.watchers;
        totalForks += repo.forks;
      });

      $('#starred .target').html(totalStars);
      $('#forked .target').html(totalForks);

      $('#avatar').bind('load', function () {
        callback();
      }).attr('src', results.user.avatar_url + '&s=420');
    }
  }

  /*
   * Query the GitHub API and record the results
   */
  function populateResults(username, callback) {
    $.getJSON('https://api.github.com/users/' + username, function (user) {
      record('user', user, callback);
    });

    getAll('https://api.github.com/users/' + username + '/repos', function (repos) {
      record('repos', repos, callback);
    });
  }

  /*
   * Dump in my data for testing
   */
  function populateDemoResults(callback) {
    setTimeout(function () {
      $('#starred .target').html('300');
      $('#forked .target').html('50');

      $('#avatar').bind('load', function () {
        callback();
      }).attr('src', 'https://secure.gravatar.com/avatar/ddaff8541994f2a18a27cc2f01cb16a6?s=420&amp;d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-user-420.png');
    }, 1000);
  }

  /*
   * Show the collected reulst
   */
  function showResults() {
    $circle.transition({scale: 1, padding: '5px', rotate: '+=720deg'}, 1000);
    $('#avatar').transition({left: '5px', top: '5px'}, 500);
    $stats
      .css({transformOrigin: '0 0'})
      .delay(800)
      .transition({rotate: '410deg', opacity: 1, duration: 800});
  }

  /*
   * A little helper to check when to stop spinning (or to carry on)
   */
  function spin() {
    if (done) {
      return showResults();
    } else {
      $circle.transition({rotate: '+=360deg'}, timeToRotate, 'linear', spin);
    }
  }

  /*
   * Start spinning indefinatley
   */
  function startSpinning() {
    $circle
      .transition(
        {
          rotate: '360deg',
          scale: 0.5,
          padding: '10px'
        },
        timeToRotate,
        'cubic-bezier(.53,.25,.48,.47)'
      );
    spin();
  }

  /*
   * Capture the username and start everything off
   */
  $('#form').submit(function () {
    $('#input').attr('disabled', 'disabled');
    startSpinning();
    populateResults($('#input').val(), function () {
      $('#avatar')
        .css({display: 'block'})
        .transition({opacity: 1}, 1000, function () {
          done = true;
        });
    });

    return false;
  });

  /*
   * Center stuff
   */
  $(window).resize(function () {
    $circle.css('top', $(this).height() / 2 - $circle.outerHeight() / 2);
    $circle.css('left', $(this).width() / 2 - $circle.outerWidth() / 2);

    $input.css('top', $(this).height() / 2 - $input.outerHeight() / 2);
  }).resize();
});
