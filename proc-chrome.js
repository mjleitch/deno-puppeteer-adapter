export default async (url = 'chrome://newtab/', port = 9222, timeout = 200000) => {

    const process = Deno.run({
        cmd: [
            '/Applications/Chromium.app/Contents/MacOS/Chromium',
            '--remote-debugging-port=' + port,
            '--no-first-run',
            '--no-default-browser-check', 
            url
        ],
        stdout: 'piped',
        stderr: 'piped',
    });

    const buff = new Uint8Array(255);
    await process.stderr.read(buff);
    const message = new TextDecoder().decode(buff);
    const wsUrl = message.slice(23);

    // wait for chrome to open the websocket
    const wait = t => (new Promise(f => setTimeout(f, t)));
    await wait(900);

    const tabs = await fetch(`http://localhost:${port}/json`).then(r => r.json());
console.log(tabs);
    const socketUrl = tabs
        .find((tab = {
            url: null
        }) => tab.url === url)
        .webSocketDebuggerUrl;

    // connect puppeteer to it

    const browser = await puppeteer.connect({
        browserWSEndpoint: socketUrl,
        ignoreHTTPSErrors: true,
    });

    setTimeout(() => process.close(), timeout);

    browser.close = async => {
        process.close();
        Deno.exit(0);
    }

    return {
        browser
    };
};
