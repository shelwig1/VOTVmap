// Dynamically create button elements pulling from the JSON data
const coordinates = [
    { x: 87, y: 401 },  { x: 90, y: 509 },
    { x: 171, y: 428 }, { x: 298, y: 509 },
    { x: 425, y: 428 }, { x: 506, y: 509 },
    { x: 493, y: 381 }, { x: 506, y: 301 },
    { x: 381, y: 301 }, { x: 381, y: 346 },
    { x: 381, y: 253 }, { x: 340, y: 218 },
    { x: 425, y: 168 }, { x: 509, y: 84 },
    { x: 298, y: 84 },  { x: 168, y: 174 },
    { x: 181, y: 46 },  { x: 84, y: 87 },
    { x: 298, y: 218 }, { x: 250, y: 218 },
    { x: 213, y: 256 }, { x: 213, y: 301 },
    { x: 213, y: 346 }, { x: 250, y: 384 },
    { x: 298, y: 384 }, { x: 298, y: 301 },
    { x: 340, y: 384 }, { x: 84, y: 301 }
]

const text = [
    "TR_1",'X','Q','W','P','V','TR_3','U',"F",'G','E','D','O','T','S','N','TR_2','R','C','B','M','L','K','J','I','A','H','Y'
]


window.onload = function() {
    // get the coords here
    const mapHolder = document.getElementById('map-holder')

    coordinates.forEach((coord, index) => {
        const button = document.createElement('button')
        button.className = 'location-button'
        button.style.left = `${coord.x}px`
        button.style.top = `${coord.y}px`

        //button.textContent = index + 1
        button.textContent = text[index]

        button.addEventListener('click', () => {
            console.log("Clicked ", button.textContent)

            button.classList.remove('start-point')
            const activeLocations = document.getElementsByClassName('active')
            if (activeLocations.length === 0) {
                button.classList.toggle('start-point')
            }

            button.classList.toggle('active')
        })
        mapHolder.appendChild(button)
    })

    const calculateButton = document.getElementById('calculate-route')
    calculateButton.addEventListener('click', () => {
        //take all the buttons we have selected
        const selectedLocations = document.getElementsByClassName('active')
        const startPoint = document.getElementsByClassName('start-point')

        const {nodes, edges} = buildGraph(startPoint, selectedLocations)
        const {distances, locNames} = processDistances(edges)
        // Push these fellas into the algorithm at the end
        console.log("Names: ", locNames)
        //console.log(tspDynamicProgramming(distances))
        const path = tspDynamicProgramming(distances)
        // Convert the indexes back into human readable goodies here
        const newPath = path.map(index => locNames[index])
        console.log(newPath)
        drawLines(newPath)
        // Need to create a bunch of lines for this connecting the nodes in the path
    // add start point doodad
    // start point class
    // special outline

    })

    const clearButton = document.getElementById('clear-route') 
    clearButton.addEventListener('click', () => {
        const buttons = document.getElementsByClassName('location-button')

        for (const button of buttons) {
            button.classList.remove('active')
            button.classList.remove('start-point')
        }
    })
}

// Picture is 631x637

function coordFromStyle(element) {
    const coords = {
        x: parseInt(element.style.left, 10),
        y: parseInt(element.style.top, 10)
    }
    return coords
}

function calculateDistance(x1, y1, x2, y2) {
    const dx = x2 - x1; // Difference in x coordinates
    const dy = y2 - y1; // Difference in y coordinates
    return Math.sqrt(dx * dx + dy * dy); // Euclidean distance formula
}

function buildGraph(startPoint, selectedLocations) {
    const nodes = []
    const edges = []
    const distances = []

    for (const loc of selectedLocations) {
        const locCoord = {
            x: parseInt(loc.style.left, 10),
            y: parseInt(loc.style.top, 10)
        }

        const nodeData = {
            name: loc.textContent,
            x: locCoord.x,
            y: locCoord.y
        }
        nodes.push(nodeData)

        for (const loc2 of selectedLocations) {
            //if (loc != loc2) {
                const loc2Coord = {
                    x: parseInt(loc2.style.left, 10),
                    y: parseInt(loc2.style.top, 10)
                }

                const edgeData = {
                    from: loc.textContent,
                    to: loc2.textContent,
                    distance: calculateDistance(locCoord.x, locCoord.y, loc2Coord.x, loc2Coord.y)
                }

                edges.push(edgeData)
           // }
        }

    }

    nodes.reverse()
    edges.reverse()

    console.log(nodes)
    console.log(edges)

    return {nodes, edges}
}

function processDistances(edges) {
    const distances = []
    const locNames = []
    let currFrom
    let dist = []

    for (const edge of edges) {
        if (!currFrom) {
            locNames.push(edge.from)
        }
        if (currFrom && currFrom != edge.from) {
            distances.push(dist)
            dist = []
            currFrom = edge.from
            locNames.push(edge.from)
        } else {
            currFrom = edge.from
            
        }
        dist.push(edge.distance)
    }
    distances.push(dist)

    return {distances, locNames}
}


function tspDynamicProgramming(dist) {
    const n = dist.length;
    const VISITED_ALL = (1 << n) - 1; // All cities visited bitmask (e.g., 1111 for 4 cities)
    
    // Create a memoization table to store the minimum distances
    const dp = Array.from({ length: n }, () => Array(1 << n).fill(Infinity));
    const parent = Array.from({ length: n }, () => Array(1 << n).fill(-1));

    // Base case: Starting from any city, the distance to visit only that city is 0
    for (let i = 0; i < n; i++) {
        dp[i][1 << i] = 0;
    }

    // Iterate over all subsets of cities
    for (let mask = 1; mask <= VISITED_ALL; mask++) {
        for (let u = 0; u < n; u++) {
            if (mask & (1 << u)) { // If u is in the set represented by mask
                for (let v = 0; v < n; v++) {
                    if (!(mask & (1 << v))) { // If v is not in the set
                        let newMask = mask | (1 << v);
                        let newDistance = dp[u][mask] + dist[u][v];
                        if (newDistance < dp[v][newMask]) {
                            dp[v][newMask] = newDistance;
                            parent[v][newMask] = u;
                        }
                    }
                }
            }
        }
    }

    // Find the minimum cost to return to the starting city
    let minTourCost = Infinity;
    let lastCity = -1;

    for (let i = 0; i < n; i++) {
        let tourCost = dp[i][VISITED_ALL] + dist[i][0];
        if (tourCost < minTourCost) {
            minTourCost = tourCost;
            lastCity = i;
        }
    }

    // Reconstruct the path
    let path = [];
    let mask = VISITED_ALL;

    while (lastCity != -1) {
        path.push(lastCity);
        let temp = parent[lastCity][mask];
        mask = mask ^ (1 << lastCity); // Remove the lastCity from the mask
        lastCity = temp;
    }

    path.push(0); // Add the starting city at the end to complete the tour
    path.reverse(); // Reverse the path to get the correct order

/*     return {
        minTourCost,
        path
    }; */
    return path
}