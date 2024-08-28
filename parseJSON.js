const fs = require('fs');

// Read the JSON file
fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    // Parse the JSON data
    const jsonData = JSON.parse(data);

    // Function to extract x and y positions of "Icon Button" instances
    function extractIconButtonPositions(data) {
        let positions = [];
        
        function traverse(data) {
            if (Array.isArray(data)) {
                data.forEach(item => traverse(item));
            } else if (typeof data === 'object' && data !== null) {
                if (data.name === "Icon Button" && data.type === "INSTANCE") {
                    positions.push({ x: data.x, y: data.y });
                }
                // Traverse all properties of the object
                Object.values(data).forEach(value => traverse(value));
            }
        }

        traverse(data);
        return positions;
    }

    // Get the positions
    const positions = extractIconButtonPositions(jsonData);
    console.log(positions);
});
