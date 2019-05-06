from flask import Flask, request, render_template
import json
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app)

cities = set()

@app.route("/")
def hello():
    return render_template("index.html")

@socketio.on('connect')
def socket_connected():
	socketio.send('connected-test')
	socketio.send(json.dumps(request.args.to_dict(flat=False)))
	socketio.send(json.dumps({h: request.headers[h] for h in request.headers.keys() if h not in ['Host', 'Content-Type', 'Content-Length']}))

	for city in cities:
		socketio.emit('newplace', data=city)

@socketio.on('newplace')
def socket_connected(data):
	print('Received new place:', data)
	cities.add(data)
	print('Updated cities set:', cities)

if __name__ == '__main__':
	socketio.run(app, host='0.0.0.0', port=3000, use_reloader=True, debug=True)
