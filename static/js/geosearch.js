require("geosearch_css");

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

export default searchControl;
