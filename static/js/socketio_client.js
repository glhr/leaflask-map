import io from 'socket.io-client';
import * as handler from './index.js';

const roomName = window.location.href.substr(window.location.href.lastIndexOf('/') + 1);
console.log('user:',username);
var socket = io({
    query: {
        roomName: username,
    },
    transports: ['websocket'],
    upgrade: false
});

socket.on('message', function(data) {
    console.log(data);
})

socket.on('newplace', function(data) {
    console.log('New place from backend: ', data);
    data.coords = L.point(data.coords);
    handler.placeReceived(data);
})

export function sendCity(city) {
    socket.emit('newplace',city);
}

export function sendCountryImg(data, url) {
    socket.emit('newcountryimg',{'country':data.country,'img':url});
}
