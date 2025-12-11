const { spawn } = require('child_process');
const path = require('path');

const serverPath = path.join(__dirname, '../dist/index.js');
const child = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'inherit'] // pipe stdin/stdout, inherit stderr
});

child.stdout.on('data', (data) => {
    console.log(`[Server Output]: ${data.toString()}`);
    // Parse for result to confirm success
    try {
        const json = JSON.parse(data.toString());
        if (json.result) {
            console.log("SUCCESS: Received result from server.");
            process.exit(0);
        }
    } catch (e) {
        // ignore partial chunks
    }
});

const listToolsMsg = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list"
};

const callGitToolMsg = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
        name: "consult_git_manager",
        arguments: { query: "What changed?" }
    }
};

// Send List Tools
console.log("Sending: tools/list");
child.stdin.write(JSON.stringify(listToolsMsg) + '\n');

// Wait a bit then send Call Tool
setTimeout(() => {
    console.log("Sending: tools/call consult_git_manager");
    child.stdin.write(JSON.stringify(callGitToolMsg) + '\n');
}, 1000);
