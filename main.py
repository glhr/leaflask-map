from flask import Flask, request, render_template
import json
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app)

cities = dict()

@app.route("/")
def hello():
	return render_template("index.html", cities=cities)

@socketio.on('connect')
def socket_connected():
	print("Socket connected")
	socketio.send('connected-test')
	socketio.send(json.dumps(request.args.to_dict(flat=False)))
	socketio.send(json.dumps({h: request.headers[h] for h in request.headers.keys() if h not in ['Host', 'Content-Type', 'Content-Length']}))

	for k,v in cities.items():
		data = {"label": k, "coords": v}
		socketio.emit('newplace', data=data)

@socketio.on('disconnect')
def socket_connected():
	print("Socket disconnected")

@socketio.on('newplace')
def socket_connected(data):
	print('Received new place:', data)
	cities[data['label']] = data['coords']
	print('Updated cities:', cities)

if __name__ == '__main__':
	socketio.run(app, host='0.0.0.0', port=3000, use_reloader=True, debug=True)
