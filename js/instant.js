/**
* @author Brandon Manke
* @date 5/27/16
* @file instant.js
* @license MIT License - https://opensource.org/licenses/MIT
* @version 1.0.0 ?
*
* @TODO:
* Possibly fix the recommended channel list from coming up blank
* once a recommended channel is clicked in featuredStreams()
* or if there are no other recommended channels (i.e. query is too specific)
* only thing I can think of right now is display a (no more online streams found)
*
* Also finish VOD function and logic
*
* Make popout menu prettier
*/

// global variable timeout
var timeout;

/**
* @name newPlayer
* @param {string} query - search value for channel/vod
* @description creates new iframe object for the channel query
* player created uses ID #stream-iframe
*/
function newPlayer (query) {
  // clear element
  $('#stream-iframe').html('');

  var options = {
    width: 854,
    height: 480,
    channel: query,
    video: "{VIDEO_ID}" //**Can find vods this way**
  };
  var player = new Twitch.Player("stream-iframe", options);
}

/**
* @name searchStreams (can't think of another name)
* @param {string} query - search value for channel/vod
* @description Searches the twitch api with a GET request based on the query.
* If there is at least one stream it creates a new vod and chat iframe with the
* first stream object in {object} data. Then updates the recommended-nav
* according to the new query
*/
function searchStreams (query) {
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

        // Removes old recommended elements once new query is searched
        $('.v').remove();
        recommendedUpdate(data);
        recClick();
      } else {
        // no channels are live so look for vods in new ajax request
        // STILL WORK TO BE DONE HERE
        searchVODs(vodURL);
      }
    }
  });
}

// ajax request for searching vods
// TODO: decide how to use vod system because other channels could be live maybe first 10? idk
// probably just gonna have check boxes or something for vods or stream searches
function searchVODs (id) {
  $.ajax({
    url: id,
    method: 'GET',
    data: {},
    success: function (data) {
      if (data._total > 0) {
        console.log('SUCCESS!' + vodURL);
        console.table(data);
        setVideo(v68573232);
      }
    }
  });
}

/**
* @name - featuredStreams
* @description displays random channel from featured channel list and populates
* recommended nav with other featured channels.
*/
function featuredStreams () {
  $.ajax({
    url: 'https://api.twitch.tv/kraken/streams/featured',
    method: 'GET',
    data: {},
    success: function (data) {
      var length = Object.keys(data.featured).length;
      var random = Math.floor(Math.random() * length);

      newPlayer(data.featured[random].stream.channel.name);
      $('#chat-iframe').attr('src', data.featured[random].stream.channel.url + '/chat');

      // recommended navbar shows other featured channels
      for (var i = 0; i < length; i++) {
        if (i != random) {
          $('#nav-objects').append('<a class="v v' + i + '"></a>');
          $('.v' + i).css('background', 'url(\'' + data.featured[i].stream.preview.medium + '\')');
          $('.v' + i).text(data.featured[i].stream.channel.display_name); // set hover text
        }
      }
      recClick();
    }
  });
}

/**
* @param {object} e - event parameter that is triggered after keyup() function - stores key pressed
* @description This function is triggered everytime a key is pressed in the search bar
* unless it is filtered out ( i.e. query is empty or undefined OR command keys are pressed
* like ctrl, alt, shift, etc. )
*/
$('#search').keyup(function (e) {
  e.preventDefault();
  var query = $('#search').val();

  // this might not work all the time depending on when searchStreams ends, might need to change this placement
  $('.v').remove();

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

  // This will call the api only if the user stops typing for 500ms
  // this makes the search function much prettier because it doesn't update
  // immediately after typing.
  timeout = setTimeout(function () {
    searchStreams(query);
  }, 500);
});

$('#t-rec').click(function () {
  $('#recommended-nav').toggleClass('toggle');
});

/**
* @name recommendedUpdate
* @param {object} data - data parameter that takes the data pulled from the twitch api
* @description This function updates the recommended navbar list with unique elements for each channel.
* Each element has a preview image that is tied to specified stream.
*/
function recommendedUpdate (data) {
  for (var i = 1; i < Object.keys(data.streams).length; i++) {
    // adds background url for medium sized image 320x{something}
    $('#nav-objects').append('<a class="v v' + i + '"></a>');
    $('.v' + i).css('background', 'url(\'' + data.streams[i].preview.medium + '\')');
    $('.v' + i).text(data.streams[i].channel.display_name); // set hover text
  }
}

// Recommended update @TODO: Make this comment descriptive
// On element click it will update the stream and chat with that stream
function recClick () {
  $('.v').click(function () {
    var channel = $(this).text().toLowerCase();
    newPlayer($(this).text());
    $('#chat-iframe').attr('src', 'https://www.twitch.tv/' + channel + '/chat');
    $(this).remove();
    searchStreams(channel);
  });
}

/**
* @name toggleChat
* @param {function} toggleChat() - toggles chat visibility
* @description toggle chat iframe on toggle chat 'button' click
*/
$('#t-chat').click(function toggleChat () {
  $('#chat-iframe').toggle();
});

// menu animation toggle
$('.menu').click(function () {
  $(this).toggleClass('open');
  $('.bar').toggleClass('x');
  $('body').toggleClass('push');
});

// runs featuredStreams() once DOM is completely loaded
$(document).ready(function () {
  featuredStreams();
});
