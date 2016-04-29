/**
* @author Brandon Manke'
* @license MIT License - https://opensource.org/licenses/MIT
*/
var timeout;
var query;

/**
*  @param {string} query - search value for channel/vod
*/
function newPlayer (query) {
  // clear element
  $('#stream-iframe').html('');

  var options = {
    width: 854,
    height: 480,
    channel: query,
    //video: "{VIDEO_ID}" **Can find vods this way**
  }
  var player = new Twitch.Player("stream-iframe", options);
}

function clearRecommended () {
  // Removes old recommended elements once new query is searched
  for (var i = 1; i < $('#nav-objects').children().size(); i++) {
    $('.v' + i).remove();
  }
}

// ajax request function for searching streams
function ajaxStream () {
  $.ajax({
    url: 'https://api.twitch.tv/kraken/search/streams?q=' + query,
    method: 'GET',
    data: {},
    success: function (data) {
      // checking if stream exists
      if (data._total > 0) {
        var vodURL = data.streams[0]._links.videos; // pulls first channels video url

        // update video iframe with first channel in search
        newPlayer(data.streams[0].channel.display_name);

        // update chat iframe with first channel
        $('#chat-iframe').attr('src', data.streams[0].channel.url + '/chat');

        // pulls each stream preview after first stream
        // and creates a unique element for each stream for recommended navbar
        for (var i = 1; i < Object.keys(data.streams).length; i++) {
          // adds background url for medium sized image 320x{something}
          $('#nav-objects').append('<a class="v v' + i + '"></a>');
          $('.v' + i).css('background', 'url(\'' + data.streams[i].preview.medium + '\')');
          $('.v' + i).text(data.streams[i].channel.display_name); // set hover text
        }

        // Recommended update
        // On element click it will update the stream and chat with that stream
        $('.v').on('click', function () {
          // gets text from this.v element text to create new iframe
          query = $(this).text();
          newPlayer(query);
          $('#chat-iframe').attr('src', 'https://www.twitch.tv/' + $(this).text() + '/chat'); // updates chat iframe
        });
      } else {
        // no channels are live so look for vods in new ajax request STILL WORK TO BE DONE
        ajaxVOD();
      }
    }
  });
}

// ajax request for searching vods
function ajaxVOD () {
  $.ajax({
    // TODO: decide how to use vod system because other channels could be live maybe first 10? idk
    // probably just gonna have check boxes or something for vods or stream searches
    url: vodURL,
    method: 'GET',
    data: {},
    success: function (data) {
      if (data._total > 0) {
        console.log('SUCCESS!' + vodURL);
        console.table(data);
      }
    }
  });
}

/**
* @param {object} e - event parameter that is triggered after keyup() function - stores key pressed
*/
$('#search').keyup(function (e) {
  e.preventDefault();
  query = $('#search').val();

  // replace with query if it does not work
  if (query === '' || query == undefined) {
    return;
  }

  // filter out command keys like ctrl, shift, alt, etc.
  if (e.keyCode === 17 ||
      e.keyCode === 18 ||
      e.keyCode === 91 ||
      e.keyCode === 9 ||
      e.keyCode === 16 ||
      e.keyCode === 37 ||
      e.keyCode === 38 ||
      e.keyCode === 39 ||
      e.keyCode === 40) {
    return;
  }

  query.toLowerCase();
  clearTimeout(timeout);

  // calls twitch api
  timeout = setTimeout(function () {
    ajaxStream();
  }, 500);
  clearRecommended(); // this might not work all the time depending on when ajaxStream ends, might need to change this
});

$('#t-chat').click(function toggleChat () {
  $('#chat-iframe').toggle();
});

$(document).ready(function() {
		$menuLeft = $('.pushmenu-left');
		$menu = $('.menu');

		$menu.click(function() {
			$(this).toggleClass('active');
			$('.push-nav-push').toggleClass('push-nav-push-to-right');
			$menuLeft.toggleClass('push-open');
		});
	});
