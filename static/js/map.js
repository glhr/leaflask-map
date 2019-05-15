import L from 'leaflet';
import searchControl from './geosearch.js';
import 'leaflet_css';
const countries_geojson = require("countries_geojson");

import * as handler from './index.js';

var markerLayer = new L.featureGroup();

const DEFAULT_CENTER = [30,0];
const DEFAULT_ZOOM = 2;
var map = L.map('map', {
    layers: [markerLayer]
}).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiZ2xociIsImEiOiJjanY5bWJzOWcxMzJsNDNzMWppb2pjODljIn0.wSf7rLO1Fl-GNK35Nb1CbA'
}).addTo(map);

var layerControl = L.control.layers();
layerControl.addOverlay(markerLayer,"markers");
layerControl.addTo(map);

map.addControl(searchControl);
map.on('geosearch/showlocation', handler.resultSelected);

var filledStyle = {
    fillColor: "red",
    weight: 1,
    opacity: 1,
    color: 'white',
//    dashArray: '3',
    fillOpacity: 0.5
};
var noStyle = {
    opacity: 0,
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

export function fillCountry(data) {
    let country = data.country;
    if(country in countries_layers) {
        countries_layers[country].setStyle(filledStyle);
    }
}


var markers = {};

export function addMarker(data) {
    let latlon = L.latLng(data.coords.x,data.coords.y);
    let marker = L.marker(latlon);
    markers[data.label] = marker;
    marker.on('mouseover',function(ev) {
      handler.markerHover(true,data);
    });
    marker.on('mouseout',function(ev) {
      handler.markerHover(false,data);
    });
    markerLayer.addLayer(marker);
    updateView(data);
    fillCountry(data);
}

var lat_bounds = [];
var long_bounds = [];

const BOUNDS_OFFEST = 1;

export function updateView(data) {
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

