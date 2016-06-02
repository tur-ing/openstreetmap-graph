var fs = require("fs");
var cytoscape = require('cytoscape');
var express = require('express');
var app = express();
var map = fs.readFileSync("./map.geojson");
var jsonMap = JSON.parse(map);
var nodeArray = [];
var numberOfNodes;
var wayArray = [];
var edgeArray = [];
var objectNodeArray = [];
var numberOfWays;
var port = 3000;

app.set('view engine', 'ejs');
app.set('json spaces', 2);
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

function Node(nodeId, long, lat) {
    this.nodeId = nodeId;
    this.long = long;
    this.lat = lat;
}

function Edge(edgeId, source, target, weight) {
    this.edgeId = edgeId;
    this.source = source;
    this.target = target;
    this.weight = weight;
}

function Way(wayId, edges) {
    this.wayId = wayId;
    this.edges = edges;
}

function getDistance(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1);
    var a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}

function isOdd(num) {
    return num % 2;
}

for (var key in wayArray) {
    //unique way id
    console.log("id: " + wayArray[key].id);
    //number of nodes
    console.log("nodes: " + wayArray[key].geometry.coordinates.length);
    //iterate over coordinates for each node
    var h = 1;
    var i = 0;
    var j = 0;
    var currentLat = null;
    var currentLong = null;

    for (var key2 in wayArray[key].geometry.coordinates) {

        var oldLat = currentLat;
        var oldLong = currentLong;

        console.log("no. " + h);
        for (var key3 in wayArray[key].geometry.coordinates[key2]) {

            if(isOdd(i) == true) {
                var currentLat = wayArray[key].geometry.coordinates[key2][key3];
                i++;
            } else {
                var currentLong = wayArray[key].geometry.coordinates[key2][key3];
                i++;
            }
            j++;
        };

        if(isOdd(j) == false) {
            var nodeId = wayArray[key].id + "/node/" + h;
            var nodeSource = new Node(nodeId, oldLat, oldLong);
            console.log("sourceLong: " + nodeSource.long + ", sourceLat: " + nodeSource.lat);
            var nodeTarget = new Node(nodeId, currentLat, currentLong);
            console.log("targetLong: " + nodeTarget.long + ", targetLat: " + nodeTarget.lat);

            var edgeId = (wayArray[key].id + "/edge/" + h);
            var edge = new Edge(edgeId, nodeSource, nodeTarget)
            h++;
        };
    };
};

console.log("number of nodes: " + nodeArray.length);
numberOfNodes = nodeArray.length;
console.log("Number of ways: " + wayArray.length);
numberOfWays = wayArray.length;

app.get('/', function (req, res) {
    res.render('index.ejs', {
        nodeArray: nodeArray,
        wayArray: wayArray,
        numberOfNodes: numberOfNodes,
        numberOfWays: numberOfWays
    });
});

app.get('/nodes', function (req, res) {
   res.json(nodeArray);
});

app.get('/ways', function (req, res) {
    res.json(wayArray);
});

app.get('/edges', function (req, res) {
    res.json(edgeArray);
});

app.listen(port, function () {
    console.log('map server on port ' + port);
});



