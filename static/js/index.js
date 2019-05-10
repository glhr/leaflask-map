import 'materialize-css/dist/css/materialize.min.css'
import 'materialize-css/dist/js/materialize.min.js'

var $ = require("jquery");

require("leaflet_css");
require("geosearch_css");

import L from 'leaflet';

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

const DEFAULT_CENTER = [30,0];
const DEFAULT_ZOOM = 2;
const BOUNDS_OFFEST = 1;
var lat_bounds = [];
var long_bounds = [];

// initialize the map on the "map" div with a given center and zoom
var map = L.map('map').setView(DEFAULT_CENTER, DEFAULT_ZOOM);

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
    updateView(data);
    sendCity(data);
    addPlaceToList(data);
}

import io from 'socket.io-client';

var socket = io();

function addMarker(data) {
    L.marker(data.coords).addTo(map);
}

function updateView(data) {
    if (!lat_bounds.length) {
        lat_bounds = [
                        data.coords[0] - BOUNDS_OFFEST,
                        data.coords[0] + BOUNDS_OFFEST
                     ];
        console.log('Latitude bounds: ', lat_bounds);
    }
    else {
        lat_bounds = [
                        Math.min(data.coords[0],lat_bounds[0]) - BOUNDS_OFFEST,
                        Math.max(data.coords[0],lat_bounds[1]) + BOUNDS_OFFEST
                     ];
    }
    if (!long_bounds.length) {
        long_bounds = [data.coords[1] - 1, data.coords[1] + 1];
        console.log('Longitude bounds: ', long_bounds);
    }
    else {
        long_bounds = [
                        Math.min(data.coords[1],long_bounds[0]) - BOUNDS_OFFEST,
                        Math.max(data.coords[1],long_bounds[1]) + BOUNDS_OFFEST
                     ];
    }


    map.fitBounds([
        [lat_bounds[0], long_bounds[1]],
        [lat_bounds[1], long_bounds[0]]
    ]);
}

function addPlaceToList(data) {
    $('#myplaces_ul').append('<li class="collection-item">' + data.label + '</li>');
}

function sendCity(city) {
    socket.emit('newplace',city);
}

socket.on('message', function(data) {
    console.log(data);
})

socket.on('newplace', function(data) {
    console.log('New place from backend: ', data);
    addMarker(data);
    updateView(data);
})
