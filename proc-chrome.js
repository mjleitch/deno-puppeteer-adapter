export default (async (url='http://example.com/', port=9222, timeout=200000)=>{
  
  const process = Deno.run({
    cmd: [
      //'google-chrome',
      //'chrome-browser',
      '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome',
      '--headless',
      '--remote-debugging-port='+port,
      url,
    ],
    stdout: 'piped',
    stderr: 'piped',
  });

  const buff = new Uint8Array(255);
  await process.stderr.read(buff);
  const message = new TextDecoder().decode(buff);
  const wsUrl = message.slice(23);

  setTimeout(()=> process.close(), timeout);
  
  return [process, wsUrl];
});


