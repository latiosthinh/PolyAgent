import { spawn } from 'child_process';
import path from 'path';

const serverPath = path.join(__dirname, '../dist/index.js');
const child = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'inherit'] // pipe stdin/stdout, inherit stderr
});

child.stdout.on('data', (data) => {
    console.log(`[Server Output]: ${data.toString()}`);

    // If we got a result, kill
    if (data.toString().includes('"result"')) {
        process.exit(0);
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
