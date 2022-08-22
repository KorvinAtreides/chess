# chess

### _Pet project dedicated to the chess game_
In this app, players can play chess with each other on one computer or vs bot.

Chess AI uses alpha-beta algorithm to calculate its best moves according chess figures values.
##### Important: on normal mod bot calculates to 2 steps forward. The web worker takes about 30 seconds to calculate next move without the application freezing.

Players and replays data is stored in _indexedDB_. 

The app is acceptable on https://korvinatreides.github.io/chess/.

Road-Map:
- ~~add web worker to calculating bot best moves~~ (done)
- improve alpha-beta algorithm of bot
- add websocket to online play
- change replay record to common style