var express = require('express');

app = express();

//adds public files through middle man
app.use(express.static(__dirname + '/public'));

app.set('port', process.env.PORT || 3000);

app.get('/', function (req, res) {
  //link index
  res.sendFile(__dirname + '/index.html');
});

app.use(function (req, res) {
  res.type('text/plain');
  res.status(404);
  res.send('404 - Page Not Found :(');
});

app.listen(app.get('port'), function () {
  console.log('Express started on http://localhost:'
  + app.get('port') + '; press Ctrl-C to terminate.');
});
