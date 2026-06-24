async function testInstance(url) {
  console.log('Testing url:', url);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    console.log('  Response OK:', res.ok, 'Status:', res.status);
    const text = await res.text();
    console.log('  Response body preview:\n', text.slice(0, 400));
  } catch (err) {
    console.log('  Error:', err.message || err);
  }
}

async function run() {
  await testInstance('https://nitter.net/AFL/rss');
  await testInstance('https://nitter.cz/AFL/rss');
}

run();
