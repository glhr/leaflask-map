//import 'materialize-css/dist/css/materialize.min.css'
//import 'materialize-css/dist/js/materialize.min.js'

var $ = require("jquery");

require("leaflet_css");

import L from 'leaflet';

require("geosearch_css");
import {
  GeoSearchControl,
  OpenStreetMapProvider,
} from 'leaflet-geosearch';

const provider = new OpenStreetMapProvider();

const searchControl = new GeoSearchControl({
  provider: provider,                               // required
  showMarker: false,                                   // optional: true|false  - default true
  showPopup: false,                                   // optional: true|false  - default false
  marker: {                                           // optional: L.Marker    - default L.Icon.Default
    icon: new L.Icon.Default(),
    draggable: false,
  },
  popupFormat: ({ query, result }) => result.label,   // optional: function    - default returns result label
  maxMarkers: 1,                                      // optional: number      - default 1
  retainZoomLevel: true,                             // optional: true|false  - default false
  animateZoom: true,                                  // optional: true|false  - default true
  autoClose: true,                                   // optional: true|false  - default false
  searchLabel: 'Enter place',                       // optional: string      - default 'Enter address'
  keepResult: false,                                   // optional: true|false  - default false
  autoComplete: true,             // optional: true|false  - default true
  autoCompleteDelay: 250,         // optional: number      - default 250
});

// initialize the map on the "map" div with a given center and zoom
var map = L.map('map_container').setView([50,0], 2);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiZ2xociIsImEiOiJjanY5bWJzOWcxMzJsNDNzMWppb2pjODljIn0.wSf7rLO1Fl-GNK35Nb1CbA'
}).addTo(map);

map.addControl(searchControl);

map.on('geosearch/showlocation', resultSelected);

function resultSelected(result) {
    console.log(result);
    let coords = [parseFloat(result.location.raw.lat), parseFloat(result.location.raw.lon)]
    console.log(coords)

    var data = {
            'label': result.location.label,
            'coords': coords
           }
    addMarker(data);
    sendCity(data);
}

import io from 'socket.io-client';

var socket = io();

function addMarker(data) {
    L.marker(data.coords).addTo(map);
}

function addCity(data) {
    addMarker(data);
}

function sendCity(city) {
    socket.emit('newplace',city);
}

socket.on('message', function(data) {
    console.log(data);
})

socket.on('newplace', function(data) {
    console.log('New place from backend: ', data);
    addCity(data);
})
