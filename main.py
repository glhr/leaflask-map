import eventlet
eventlet.monkey_patch()

from flask import Flask, request, render_template
import json
from flask_socketio import SocketIO, emit, send, join_room
import re

app = Flask(__name__)
socketio = SocketIO(app)

cities = dict()

# user_data = {'glhr': {'London, Greater London, England, SW1A 2DX, United Kingdom',
# 				   'Paris, Ile-de-France, Metropolitan France, France'
# 					  }
# 			 }

user_data = dict()

rooms = set()

clients = dict()

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

def normalize(place):
	return re.sub(r"\W+",'-',place.lower())

@app.route("/")
def mainview():
	return render_template("index.html", username='', cities=cities)

@app.route("/debug")
def show_debug_info():
	return f"clients: {str(clients)}<br/><br/>cities: {str(cities)}<br/><br/>cities: {str(cities.values())}<br/><br/>user_data: {str(user_data)}"

@app.route("/user/<username>")
def userview(username):
	if not user_data.get(username):
		user_data[username] = {}
	print(user_data[username])

	return render_template("index.html", normalize=normalize, username=username, cities={k:v for k,v in cities.items() if k in user_data[username]})

@socketio.on('connect')
def socket_connected():

	request_args = request.args.to_dict(flat=False)
	emit('message',json.dumps(request_args))
	user = request_args.get('roomName')[0]

	clients[request.sid] = user
	print(clients)
	print(f"{request.sid} ({clients[request.sid]}) connected")

	send(json.dumps({h: request.headers[h] for h in request.headers.keys() if h not in ['Host', 'Content-Type', 'Content-Length']}))
	if user:
		if user_data.get(user): data = [v.asdict() for k,d in cities.items() for v in d.values() if k in user_data[user]]
		else: data = []
		print("User",user,"specified. Data:", data)
	else:
		data = [v.asdict() for d in cities.values() for v in d.values()]
		print("No user specified. Data:", data)

	for entry in data:
		print("Sending", entry)
		emit('newplace', entry, room=request.sid)

@socketio.on('disconnect')
def socket_connected():
	print(f"{request.sid} ({clients[request.sid]}) disconnected")
	clients.pop(request.sid, None)


@socketio.on('newplace')
def new_place(data):
	city_object = Place(data)
	# print('Creating new Place object:', city)
	if data['country'] not in cities:
		cities[data['country']] = dict()
	cities[data['country']].update({data['label']:city_object})
	print('Updated cities:', cities.keys())
	# try:
	username = clients[request.sid]
	print('Received new place from', username, data)
	if username not in user_data:
		user_data[username] = dict()
	user_data[username].setdefault(data['country'],set()).add(data['label'])
	print(username,'data:', user_data[username])
	# except KeyError:
	# 	pass



if __name__ == '__main__':
	socketio.run(app, host='0.0.0.0', port=3000, use_reloader=True, debug=True)
