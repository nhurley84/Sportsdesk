const channels = ['@NBA', '@HouseofHighlights', '@NBAonTNT', '@NFL', '@NFLUK', '@F1', '@SkySportsF1', '@supercars', '@wtf1official', '@AFL', '@7AFL', '@NRL', '@FoxLeague', '@icc', '@cricketcomau', '@SkySportsCricket', '@IPL'];
(async () => {
  for (const c of channels) {
    try {
      const res = await fetch('https://www.youtube.com/' + c);
      const text = await res.text();
      const match = text.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/([^"']+)/);
      console.log(c + ':', match ? match[1] : 'NOT FOUND');
    } catch (e) {
      console.log(c + ':', 'ERROR');
    }
  }
})();
