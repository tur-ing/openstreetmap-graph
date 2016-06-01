var fs = require("fs");
var cytoscape = require('cytoscape');
var express = require('express');
var app = express();
var map = fs.readFileSync("./map.geojson");
var jsonMap = JSON.parse(map);
var nodeArray = [];
var wayArray = [];
var port = 3000;

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/views'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

for (var key in jsonMap.features) {
    if (jsonMap.features.hasOwnProperty(key)) {
        if(jsonMap.features[key].id.substring(0, 3) == "nod") {
            nodeArray.push(jsonMap.features[key]);
        }

        if(jsonMap.features[key].id.substring(0, 3) == "way") {
            wayArray.push(jsonMap.features[key]);
        }
    }
}

console.log("Number of nodes: " + nodeArray.length);
console.log("Number of ways: " + wayArray.length);

app.get('/', function (req, res) {
    res.render('index.ejs', {
        nodeArray: nodeArray,
        wayArray: wayArray
    });
});

app.get('/nodes', function (req, res) {
   res.json(nodeArray);
});

app.get('/ways', function (req, res) {
    res.json(wayArray);
});

app.listen(port, function () {
    console.log('map server on port ' + port);
});



