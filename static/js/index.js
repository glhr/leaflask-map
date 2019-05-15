import * as view from './view.js';
import * as socket from './socketio_client.js';
import * as map from './map.js';

export function placeReceived(data) {
    map.addMarker(data);
}

function addPlaceToList(data) {
    if(!view.isCountryListed(data)) {
        view.addCountryToList(data);
        socket.sendCountryImg(data, view.country_icons[data.country_id]);
    }
    view.addCityToCountry(data);
}

export function resultSelected(result) {
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
            'country_id': normalizePlaceName(result.location.raw.address.country),
            'city_id': normalizePlaceName(result.location.raw.address.city)
           }
    console.log("Result selected: ", data);
    addPlaceToList(data);
    map.addMarker(data);
    socket.sendCity(data);
}

function normalizePlaceName(name) {
    return name.replace(/\W+/g, '-').toLowerCase();
}

export function markerHover(hover, data) {
    view.highlightCityInList(hover, data);
}
