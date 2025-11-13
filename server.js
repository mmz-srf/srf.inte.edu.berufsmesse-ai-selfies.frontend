import { createServer } from "https";
import { parse } from "url";
import next from "next";
import fs from "fs";

const dev = process.env.NODE_ENV !== "production";
const hostname = "192.168.2.1";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync("./192.168.2.1-key.pem"),
  cert: fs.readFileSync("./192.168.2.1.pem"),
}; 

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url || "/", true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`HTTPS-Server started on https://${hostname}:${port}`);
  });
});
