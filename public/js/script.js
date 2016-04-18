// Created by Brandon Manke

var SEARCH = (function () {
  // private
  var query = function (value) {
    query = value;
  }

  function setQuery () {
    return query;
  }

  var setQuery = function (text) {
    query(text);
  }

  // public
  return {
    get: getQuery(),
    set: setQuery()
  }
})();

var STREAM = (function () {
    var timeout;

    function getTimeout () {
      return timeout;
    }

    function setTimeout (value) {
      timeout = value;
    }

    return {
      get: getTimeout(),
      set: setTimeout()
    }
})();

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

        // update chat iframe
        $('#chat-iframe').attr('src', data.streams[0].channel.url + '/chat');

        // pulls each stream preview after first stream for recommended navbar
        for (var i = 1; i < Object.keys(data.streams).length; i++) {
          // adds background url for medium sized image 320x{something}
          $('.v').append($('#nav-objects a.v'));
          //$('.v' + i).css('background', 'url(\'' + data.streams[i].preview.medium + '\')');
          //$('.v' + i).text(data.streams[i].channel.display_name); // set hover text
        }

        $('.v').on('click', function () {
          STREAM.setQuery({}) = newPlayer($(this).text()); // gets query from this.v element text to create new iframe
          $('#chat-iframe').attr('src', 'https://www.twitch.tv/' + $(this).text() + '/chat'); // updates chat iframe
          // not sure if this will infinite loop yet try it yolo
        });
      } else {
        // no channels are live so look for vods in new ajax request
        ajaxVOD();
      }
      volume = player.getVolume();
    }
  });
}

// ajax request for searching vods
function ajaxVOD () {
  $.ajax({
    // TODO: decide how to use vod system because other channels could be live maybe first 10? idk
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
});

$('#t-chat').click(function toggleChat () {
  $('#chat-iframe').toggle();
});

console.log('\n');
