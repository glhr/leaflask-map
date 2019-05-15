import 'materialize-css/dist/css/materialize.min.css'
import 'materialize-css/dist/js/materialize.min.js'

var $ = require("jquery");

import {country_icons} from './country_icons.js';
export {country_icons};

export function isCountryListed(data) {
    if  ($("#"+data.country_id).length) return true;
    else return false;
}

export function addCountryToList(data) {
    let img = '<img src="'+ country_icons[data.country_id] +'" alt="" class="circle">';
    let title = '<span class="title myplaces_country"><b>' + data.country + '</b></span>';
    $('#myplaces_ul').append('<li class="collection-item avatar" id="'+ data.country_id + '">' + img + title + '</li>');
}

export function addCityToCountry(data) {
    $("#"+data.country_id).append('<p id="'+data.city_id+'">' + data.city + '</p>');
}

export function highlightCityInList(enable,data) {
    var style = {'font-weight':'normal'};
    if (enable) style = {'font-weight':'bold'};
    $('#'+data.country_id + '> #'+data.city_id).css(style);
}
