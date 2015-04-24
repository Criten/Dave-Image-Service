var cv = require('opencv');
var http = require('http');
var fs = require('fs');
var express = require('express');
var path = require('path');
var Canvas = require('canvas')
  , Image = Canvas.Image

var app = express();

var daves = [];

load_daves();

function load_daves() {
  var file = fs.createWriteStream("dave.jpg");

  var request = http.get("http://assets.facesofdave.org.s3.amazonaws.com/uploads/face/image/5/thumb_Homo4.png", function(response) {
    response.pipe(file);

    file.on('finish', function() {
      fs.readFile('dave.jpg', function(err, squid){
        if (err) throw err;
        var img = new Image();

        img = new Image;
        img.src = squid;

        daves.push(img);
      });
    });
  });
}

function dave(url, res) {
  var file = fs.createWriteStream("file.jpg");
  var request = http.get(url, function(response) {
    response.pipe(file);

    file.on('finish', function() {
      cv.readImage("file.jpg", function(err, im){
        im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){

          for (var i=0;i<faces.length; i++){
            var x = faces[i]
            im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
          }

          im.save('./public/out.jpg');

          fs.readFile('public/out.jpg', function(err, squid){
            if (err) throw err;

            var img = new Image();

            img = new Image;
            img.src = squid;

            var canvas = new Canvas(img.width, img.height)
                , ctx = canvas.getContext('2d');

            ctx.drawImage(img, 0, 0, img.width, img.height);
            ctx.drawImage(daves[0], 0, 0, daves[0].width, daves[0].height);

            res.send('<img src="' + canvas.toDataURL() + '" />');
          });


        });
      });
    });
  });
}

//app.use(express.static(__dirname)); // Current directory is root
app.use(express.static(path.join(__dirname, 'public'))); //  "public" off of current is root

app.get('/', function(req, res) {
  dave(req.param('url'), res);
});

app.listen(80);
console.log('Listening on port 80');
