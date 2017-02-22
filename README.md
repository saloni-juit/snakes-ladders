----------------------------------------------------------------------------
							Snakes and Ladders
----------------------------------------------------------------------------
- Snakes and Ladders game built using AngularJs.
- The game can be played by a single player or a multiplayer ( 2 to 4 )
- To run the game, just run the game.html and you are good to go.
- To rig the game for your choice of throw/best throw, uncomment Line 211 and comment Line 213 in controller.js.
- Ladders and snakes are configurable.

Part 1 : Single Player game
 - The player1 will be playing against a computer which will also be randomizing dice roll to assume fair play.

Part 2 : Multi Player game
 - The maximum number of players is 4.
 - The pegs are ordered Purple Peg - Player 1 , Red Peg - Player 2, Green Peg - Player 3 and Blue Peg - Player 4. Also, the color on the button will indicate the color of the peg of the player. 

Part 3 :
a) Perfect Throws : 
  - Creating 2 precomputed arrays which contains the min hops from a particular square and best throws from  a square.
  - minhops are set to infinity for snakes and then it is computed if the ladder will be a better choice or a 6 dice roll.
  - Multiple 6 dice rolls are also kept into account for the best throw with the restriction of max 3 dice rolls.


b) For Cards UI : 
- All the statistics are updated dynamically for all players as game progresses.
- Drag the head of the player card which mentions the player name such as "Player 1" and place it accordingly.

If you make any changes in controller.js/game.css, make sure to update the minified version or update game.html to accept the unminified version.

The Responsive is design is extended till a tablet(around 500px) because of the nature of the board.Though, it can be extended if we use a dynamic board.

-Saloni