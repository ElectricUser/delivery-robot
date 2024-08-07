class Node {
	constructor(value, nodes = []) {
		this.value = value;
		this.nodes = nodes;
	}
}

function algorithm(startNode, endNode, visitedNodes = [], currentWay = []) {
	if (visitedNodes.length === 0) {
		visitedNodes.push(startNode);
		currentWay.push(startNode);
	}

	const neighborNodes = getNeighbors(currentWay[currentWay.length - 1]);
	const nonVisitedNeighborNodes = neighborNodes.filter(
		(node) => !visitedNodes.includes(node)
	);
	if (nonVisitedNeighborNodes.length > 0) {
		let element;
		if (nonVisitedNeighborNodes.includes("e")) {
			element = "e";
		} else {
			element = randomElem(nonVisitedNeighborNodes);
		}

		currentWay.push(element);
		visitedNodes.push(element);
		if (currentWay.includes(endNode)) {
			return console.log("solution found! ", currentWay);
		}
		console.log("current way: ", currentWay);
	} else {
		const removedElem = currentWay.pop();
		visitedNodes.splice(visitedNodes.indexOf(removedElem), 1);
		algorithm(startNode, endNode, visitedNodes, currentWay);
	}

	algorithm(startNode, endNode, visitedNodes, currentWay);
}

const graph = {
	a: ["b", "d"],
	b: ["a", "d"],
	c: ["d", "e"],
	d: ["a", "b", "c", "e"],
	e: ["c", "d"],
};

const startNode = "a";
const endNode = "e";

algorithm(startNode, endNode);

function getNeighbors(value) {
	return graph[value];
}

function randomElem(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}
