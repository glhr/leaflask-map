const ENABLE_LAYERS = true;
const ENABLE_MARKERS = false;

import 'materialize-css/dist/css/materialize.min.css'
import 'materialize-css/dist/js/materialize.min.js'

var $ = require("jquery");

require("leaflet_css");
require("geosearch_css");
if (ENABLE_LAYERS) var countries_geojson = require("countries_geojson");

import L from 'leaflet';

import {
    GeoSearchControl,
} from 'leaflet-geosearch';

import {
    OpenStreetMapProvider,
} from 'leaflet-geosearch_custom';

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



if (ENABLE_LAYERS) {
    var filledStyle = {
    fillColor: "red",
    weight: 1,
    opacity: 1,
    color: 'white',
//    dashArray: '3',
    fillOpacity: 0.5
};

    var noStyle = {
    fillColor: "red",
    weight: 1,
    opacity: 0,
    color: 'white',
//    dashArray: '3',
    fillOpacity: 0
};

    var countries_layers = [];
    L.geoJSON(countries_geojson, {
        onEachFeature: myOnEachFeature,
        style: noStyle
    }).addTo(map);

    function myOnEachFeature(feature, featureLayer) {
        countries_layers[feature.properties.ADMIN] = featureLayer;
    }
}

function fillCountry(data) {
    if (ENABLE_LAYERS) {
        let country = data.country;
        if(country in countries_layers) {
            countries_layers[country].setStyle(filledStyle);
        }
    }
}

map.addControl(searchControl);

map.on('geosearch/showlocation', resultSelected);

function resultSelected(result) {
    console.log(result);
    let coords = L.point([parseFloat(result.location.raw.lat), parseFloat(result.location.raw.lon)]);

    let city_like = [   result.location.raw.address.city,
                        result.location.raw.address.town,
                        result.location.raw.address.village,
                        result.location.raw.address.city_district,
                        result.location.raw.address.hamlet,
                        result.location.raw.address.county,
                        result.location.raw.address.region,
                        ''  ];
    let city = city_like.filter(Boolean)[0];

    var data = {
            'label': result.location.label,
            'coords': coords,
            'city': city,
            'country': result.location.raw.address.country,
           }
    console.log("Result selected: ", data)
    addMarker(data);
    sendCity(data);
    addPlaceToList(data);
}
var markers = {};

function addMarker(data) {
    let latlon = L.latLng(data.coords.x,data.coords.y);
    let marker = L.marker(latlon);
    markers[data.label] = marker;
    if(ENABLE_MARKERS) marker.addTo(map);
    updateView(data);
    fillCountry(data);
}

function updateView(data) {
    if (!lat_bounds.length) {
        lat_bounds = [
                        data.coords.x - BOUNDS_OFFEST,
                        data.coords.x + BOUNDS_OFFEST
                     ];
//        console.log('Latitude bounds: ', lat_bounds);
    }
    else {
        lat_bounds = [
                        Math.min(data.coords.x,lat_bounds[0]) - BOUNDS_OFFEST,
                        Math.max(data.coords.x,lat_bounds[1]) + BOUNDS_OFFEST
                     ];
    }
    if (!long_bounds.length) {
        long_bounds = [data.coords.y - 1, data.coords.y + 1];
//        console.log('Longitude bounds: ', long_bounds);
    }
    else {
        long_bounds = [
                        Math.min(data.coords.y,long_bounds[0]) - BOUNDS_OFFEST,
                        Math.max(data.coords.y,long_bounds[1]) + BOUNDS_OFFEST
                     ];
    }

    if (Object.keys(markers).length > 1) {
        map.fitBounds([
            [lat_bounds[0], long_bounds[1]],
            [lat_bounds[1], long_bounds[0]]
        ]);
    }
}

function addPlaceToList(data) {
    let country_lowercase = data.country.replace(/\W+/g, '-').toLowerCase();
    let city_lowercase = data.city.replace(/\W+/g, '-').toLowerCase();

    // country isn't listed yet
    if(!$("#"+country_lowercase).length) {
        let img = '<img src="https://www.studyabroad.com/sites/default/files/images/england-fall-semester-abroad.jpg" alt="" class="circle">';
        let title = '<span class="title myplaces_country"><b>' + data.country + '</b></span>';
        $('#myplaces_ul').append('<li class="collection-item avatar" id="'+ country_lowercase + '">' + img + title + '</li>');
    }
    // add city
    $("#"+country_lowercase).append('<p id="'+city_lowercase+'">' + data.city + '</p>');
}

import io from 'socket.io-client';

const roomName = window.location.href.substr(window.location.href.lastIndexOf('/') + 1);
console.log('user:',username);
var socket = io({
    query: {
        roomName: username,
    },
    transports: ['websocket'],
    upgrade: false
});

function sendCity(city) {
    socket.emit('newplace',city);
}

socket.on('message', function(data) {
    console.log(data);
})

socket.on('newplace', function(data) {
    console.log('New place from backend: ', data);
    data.coords = L.point(data.coords);
    addMarker(data);

})
