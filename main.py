from flask import Flask, request, render_template
import json
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app)

cities = dict()

class Point():
	def __init__(self,coords):
		self.x = coords[0]
		self.y = coords[1]

class Place():
	def __init__(self,data):
		self.label = data.get('label')
		self.coords = data.get('coords')
		self.country = data.get('country')
		self.city = data.get('city')
		self.shortname = f"{self.city}, {self.country}"
	def __str__(self):
		return str(self.__class__) + ": " + str(self.__dict__)
	def asdict(self):
		return self.__dict__

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
		# data = {"label": k, "coords": v}
		socketio.emit('newplace', data=v.asdict())

@socketio.on('disconnect')
def socket_connected():
	print("Socket disconnected")

@socketio.on('newplace')
def socket_connected(data):
	print('Received new place:', data)
	city = Place(data)
	print('Creating new Place object:', city)
	cities[data['label']] = city
	print('Updated cities:', cities.keys())

if __name__ == '__main__':
	socketio.run(app, host='0.0.0.0', port=3000, use_reloader=True, debug=True)
