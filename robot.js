const roads = [
	"Alice's House-Bob's House",
	"Alice's House-Cabin",
	"Alice's House-Post Office",
	"Bob's House-Town Hall",
	"Daria's House-Ernie's House",
	"Daria's House-Town Hall",
	"Ernie's House-Grete's House",
	"Grete's House-Farm",
	"Grete's House-Shop",
	"Marketplace-Farm",
	"Marketplace-Post Office",
	"Marketplace-Shop",
	"Marketplace-Town Hall",
	"Shop-Town Hall",
];

function buildGraph(edges) {
	const graph = Object.create(null);
	function addEdge(from, to) {
		if (from in graph) {
			graph[from].push(to);
		} else {
			graph[from] = [to];
		}
	}
	for (let [from, to] of edges.map((r) => r.split("-"))) {
		addEdge(from, to);
		addEdge(to, from);
	}

	return graph;
}

const roadGraph = buildGraph(roads);

class VillageState {
	constructor(place, parcels) {
		this.place = place;
		this.parcels = parcels;
	}

	move(destination) {
		if (!roadGraph[this.place].includes(destination)) {
			//check whether there is a possible road from the current location to the destination
			return this;
		} else {
			// if there is, the parcel is moved to the new location
			let parcels = this.parcels
				.map((p) => {
					if (p.place != this.place) return p; // Parcel is not at the same location as robot
					return { place: destination, address: p.address }; // Move the parcel to the destination
				})
				.filter((p) => p.place != p.address); // Check if it arrived at it's delivery destination
			return new VillageState(destination, parcels);
		}
	}
}

function runRobot(state, robot, memory) {
	for (let turn = 0; ; turn++) {
		if (state.parcels.length == 0) {
			console.log(`Done in ${turn} turns`);
			break;
		}
		let action = robot(state, memory); //Initializes the robot with the state and memory
		state = state.move(action.direction);
		memory = action.memory; //Adds memory to the robot object {direction: 'x', memory: 'y'}
		console.log(`Moved to ${action.direction}`);
	}
}

function randomPick(array) {
	let choice = Math.floor(Math.random() * array.length);
	return array[choice];
}

// Picks a random location from the graph
function randomRobot(state) {
	return { direction: randomPick(roadGraph[state.place]) };
}

VillageState.random = function (parcelCount = 5) {
	let parcels = [];
	for (let i = 0; i < parcelCount; i++) {
		let address = randomPick(Object.keys(roadGraph));
		let place;
		do {
			place = randomPick(Object.keys(roadGraph));
		} while (place == address);
		parcels.push({ place, address });
	}
	return new VillageState("Post Office", parcels);
};

//Initializes a random VillageState with the starting location of 'Post Office' and a list of 5 parcels at random locations
//runRobot(VillageState.random(), randomRobot);

// This is a route where you pass by all places
// By running through it the first time you guarantee you pick up all the packages
// By running it a second time you guarantee you deliver all of the packages
const mailRoute = [
	"Alice's House",
	"Cabin",
	"Alice's House",
	"Bob's House",
	"Town Hall",
	"Daria's House",
	"Ernie's House",
	"Grete's House",
	"Shop",
	"Grete's House",
	"Farm",
	"Marketplace",
	"Post Office",
];

function routeRobot(state, memory) {
	if (memory.length == 0) {
		memory = mailRoute;
	}

	return { direction: memory[0], memory: memory.slice(1) };
}

//runRobot(VillageState.random(), routeRobot, []);

function findRoute(graph, from, to) {
	let work = [{ at: from, route: [] }];
	for (let i = 0; i < work.length; i++) {
		let { at, route } = work[i];
		for (let place of graph[at]) {
			if (place == to) return route.concat(place);
			if (!work.some((w) => w.at == place)) {
				work.push({ at: place, route: route.concat(place) });
			}
		}
	}
}

function goalOrientedRobot({ place, parcels }, route) {
	if (route.length == 0) {
		let parcel = parcels[0];
		if (parcel.place != place) {
			// verify if parcel is at the same place where the robot's at
			route = findRoute(roadGraph, place, parcel.place); //if parcel is not picked then find a route to it
		} else {
			route = findRoute(roadGraph, place, parcel.address); //if the parcel is picked then find a route to it's address
		}
	}
	return { direction: route[0], memory: route.slice(1) };
}

runRobot(VillageState.random(), goalOrientedRobot, []);

function compareRobots(robot1, memory1, robot2, memory2) {
	function runRobot(state, robot, memory) {
		for (let turn = 0; ; turn++) {
			if (state.parcels.length == 0) {
				return turn; //returns number of turns it took to finish the task of delivering all packages
			}
			let action = robot(state, memory); //Initializes the robot with the state and memory
			state = state.move(action.direction);
			memory = action.memory; //Adds memory to the robot object {direction: 'x', memory: 'y'}
		}
	}

	let sumSteps1 = 0;
	let sumSteps2 = 0;

	for (let i = 0; i < 100; i++) {
		let state = VillageState.random();
		sumSteps1 += runRobot(state, robot1, memory1);
		sumSteps2 += runRobot(state, robot2, memory2);
	}

	console.log(
		`robot1 avg steps: ${sumSteps1 / 100}\nrobot2 avg steps: ${
			sumSteps2 / 100
		}`
	);
}

compareRobots(routeRobot, [], goalOrientedRobot, []);

function myRobot({ place, parcels }, route) {
	if (route.length == 0) {
		const calcParcels = [];
		const listParcels = [];
		let i = 0;
		for (p of parcels) {
			let r = findRoute(roadGraph, place, p.place);
			calcParcels.push(r);
			listParcels.push(p);
		}

		calcParcels.sort((a, b) => {
			if (a.length > b.length) {
				return 1;
			} else if (a.length < b.length) {
				return -1;
			} else {
				return 0;
			}
		});

		let parcel = calcParcels[0];
		if (parcel.place != place) {
			// verify if parcel is at the same place where the robot's at
			route = findRoute(roadGraph, place, parcel.place); //if parcel is not picked then find a route to it
		} else {
			route = findRoute(roadGraph, place, parcel.address); //if the parcel is picked then find a route to it's address
		}
	}
	return { direction: route[0], memory: route.slice(1) };
}

//runRobot(VillageState.random(), myRobot, []);

// .sort((a, b) => {
// 	if (a.length > b.length) {
// 		return 1;
// 	} else if (a.length < b.length) {
// 		return -1;
// 	} else {
// 		return 0;
// 	}
// });
