// Lightweight connection tracker
(function() {
    const originalConnect = AudioNode.prototype.connect;

    AudioNode.prototype.connect = function(dest, ...rest) {
        // Record the connection
        if (!this._connections) {
            this._connections = [];
        }
        this._connections.push(dest);
        console.log("CONNECT PATCH ACTIVE");
        // Call the original connect
        return originalConnect.call(this, dest, ...rest);
    };
})();


// Crawl the audio graph and return a formatted string
function crawlAudioGraph(node, indent = 0, visited = new Set()) {
    const pad = " ".repeat(indent);
    const name = node.constructor.name;

    let output = pad + name + "\n";

    // Prevent infinite loops
    if (visited.has(node)) {
        return output + pad + "  [cycle]\n";
    }
    visited.add(node);

    // Get recorded connections
    const outputs = node._connections || [];

    for (const next of outputs) {
        output += crawlAudioGraph(next, indent + 2, visited);
    }

    return output;
}

window.updateAudioGraphPanel = function(masterNode) {
    const panel = document.getElementById("audioGraphPanel");
    console.log("updateAudioGraphPanel (new version) CALLED");

    if (!panel) return;

    const graphText = crawlAudioGraph(masterNode);
    panel.innerText = graphText;
};


// function updateAudioGraphPanel(masterNode) {
//     console.log("updateAudioGraphPanel CALLED");
//     const panel = document.getElementById("audioGraphPanel");
//     if (!panel) return;

//     const graphText = crawlAudioGraph(masterNode);
//     panel.innerText = graphText;
// }
