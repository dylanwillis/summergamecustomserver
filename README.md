So it has a whole heap of limitations, first being that I haven't put a lot of time into making it look very pretty. This should help get people started though!

I've got upgrades built-in, just the HP/DPS/Click Damage. The crit stuff isn't yet.

Also DPS doesn't work for some reason. Click damage will kill the monsters and they'll stay dead until the server resets because I didn't make a monster table in the sqlite database yet.

The player stuff is all in an sqlite database - but it's not ready for multiple clients yet because I was just testing and getting all the server responses before the steam servers close up - it shouldn't be hard to add if you just set the player_id to the token that the server sends you.

It's hard-wired to spawn 3 helldozers, one in each lane, not hard to change but instead of changing it up I need to work on the monster database stuff.

I'm about to go on-site for a couple of days so have fun and feel free to yell at me for how shitty it is coded, I'm learning node.js and couldn't really be stuffed making it all pretty for this release.
 
