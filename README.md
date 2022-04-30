# allgameplugin
package repo for communications with allGameLobby server and stand alone

comms = require {allgameplugin} to get package

set up server in game server
var io = comms.createServer(serverConfigObject,closeFunction);
serverConfigObject is the file that includes which port to use and other settings
closeFunction is the function called when the parent wants to close the game an example is: 
(gameID)=>{return gameStatus==gameMode.LOBBY}
