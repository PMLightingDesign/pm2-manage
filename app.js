const pm2 = require('pm2');
const http = require('http');

let pm2connected = false;

let port = 3000;

process.argv.forEach((val, index) => {
    if(val == '--port' || val == '-p') {
        port = process.argv[index + 1];
    }
});

function handle(req, res) {
    // If the request is to the /restart route, then restart all pm2 processes
    if(req.url == '/restart') {
        restart(res);
    
    // If the request is to the /status route, then return the status of all pm2 processes
    } else if(req.url == '/status') {
        status(res);

    // If the request is to any other route, then return a 404
    } else {
        res.writeHead(404);
        res.end();
    }
}

// Create an http server and listen on the specified port
let server = http.createServer((req, res) => {
    handle(req, res);
});

// Start the server
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// Connect to the pm2 daemon
pm2.connect((err) => {
    if(err) {
        console.error(err);
        process.exit(2);
    }

    pm2connected = true;
});

function restart(res){
    if(pm2connected) {
        pm2.restart('all', (err, proc) => {
            if(err) {
                console.error(err);
                res.writeHead(500);
                res.end();
            } else {
                res.writeHead(200);
                res.end();
            }
        });
    } else {
        res.writeHead(500);
        res.end();
    }

    return;
}

function status(res) {
    if(pm2connected) {
        pm2.list((err, list) => {
            if(err) {
                console.error(err);
                res.writeHead(500);
                res.end();
            } else {
                res.writeHead(200);
                res.end(JSON.stringify(list, null, 2));
            }
        });
    } else {
        res.writeHead(500);
        res.end();
    }

    return;
}