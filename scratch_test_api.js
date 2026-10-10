async function test() {
  const url = 'http://localhost:3000/api/tiles/bloks/15/26421/17066?desa=3514080004';
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Content-Length:", res.headers.get('content-length'));
    console.log("Buffer size:", text.length);
  } catch (e) {
    console.error(e);
  }
}
test();
