var mode
try{
	internalPort=process.argv[2]
	console.log(process.argv)
	console.log(internalPort)
	process.send({playerID:'first communication'})
	mode="withParent"
}
catch(err){
	mode="standAlone"
}

var withParent=require('./communicationModuleWithParent').default

function getProxyPort(defaultPort){
	console.log(internalPort)
	if (internalPort==undefined){
		return defaultPort
	}else{
		return internalPort
	}
}

var uid =require( 'uid').uid;
const EventEmitter = require('events');
var IDs=[]
var removePlayers=[]
novelCount=0

var withoutParent={
	socketList:{},
	moduleColor:'#aaaaaa',
	savedCommands:[],
	runGameCommand:function(socket,data){
		try{
			let player=withoutParent.struct.sockets[socket.userData.myIDinGame]
			//console.log(player.id+'sends to server: ',data)
			player[data.command](data.data)
		}
		catch(err){
			//console.log(data)
			console.log("the command "+data.command+" did not work")
			console.log("it gave a "+err.name)
			console.log("with a message of "+err.message)
		}
	}
}
withoutParent.message=function(socket,data){
	socket.emit("message",{data:data,color:withoutParent.moduleColor})
}
withoutParent.struct={
	sockets:{
		emit:function(command,data){
			withoutParent.io.sockets.emit("gameCommands",{command:command,data:data})
		},
		on:function(command,funct){
			withoutParent.struct[command]=funct
		}
	}
}
withoutParent.defaultSocket=function(gameID){
	return{
		id:gameID,
		on: function(command,customFunction){
			let player=withoutParent.struct.sockets[gameID]
			player[command]=customFunction
			if(arguments.length!=2){
				console.log("currently you must have 2 arguments, the call and the function")
			}
		},
		emit:function(command,data){
			let socket=withoutParent.socketList[gameID]
			console.log('server sends out to player '+gameID+'at socket ',socket.id,': ',{command:command,data:data})
			socket.emit("gameCommands",{command:command,data:data})
		},
		broadcast:{
			emit:function(command,data){
				let socket=withoutParent.socketList[gameID]
				console.log('server broadcasts to player '+gameID+'at socket ',socket.id,': ',{command:command,data:data})
				socket.broadcast.emit("gameCommands",{command:command,data:data})
			}
		}
	}
}

withoutParent.createServer= function(serverConfigObject,closeCondition){
	withoutParent.express = require("express");
	withoutParent.http = require("http");
	withoutParent.io = require("socket.io")
	
	withoutParent.app = withoutParent.express();
	withoutParent.app.use(withoutParent.express.static("../template files for games/clientComms")); //working directory
	//Specifying the public folder of the server to make the html accessible using the static middleware
	
	withoutParent.port = serverConfigObject.standAlonePort;
	withoutParent.server = withoutParent.http.createServer(withoutParent.app).listen(withoutParent.port,"0.0.0.0",511,function(){console.log("Server connected to socket: "+withoutParent.port);});//Server listens on the port 8124
	withoutParent.io = withoutParent.io.listen(withoutParent.server);
	console.log('opened io server without parent')
	//withoutParent.myEmitter = new EventEmitter()
	//withoutParent.myEmitter.on('close',(gameID)=>{
	//	if(closeCondition(gameID)){console.log('would have closed')}else{'would not have closed'}
	//})
	/*initializing the webSockets communication , server instance has to be sent as the argument */
	withoutParent.io.sockets.on("connection", function(socket) {
		console.log("Connection with client " );
		let gameID=uid()+novelCount++
		IDs.push(gameID)
		
		socket.on('sendUsername', function (data, callback) {
			console.log('Socket (server-side): received message:', data);
			if(serverConfigObject.keepSockets ){
				let index=IDs.findIndex(x=>x==data.ID)
				if(data.ID!="null" && data.ID!=undefined&&index>-1){
					IDs.pop()
					gameID=data.ID
				}
			}
			var responseData = gameID
			socket.userData={myIDinGame:gameID}
			if(withoutParent.socketList[gameID]==undefined){
				console.log(socket.userData)
				withoutParent.struct.sockets[gameID]=withoutParent.defaultSocket(gameID)
				withoutParent.socketList[gameID]=socket
				withoutParent.struct.connection(withoutParent.struct.sockets[gameID])
			}else{
				let player=withoutParent.struct.sockets[gameID]
				withoutParent.socketList[gameID]=socket
				withoutParent.runGameCommand(socket,data)
			}
			
			console.log(withoutParent.struct.sockets[gameID])
			callback(responseData);
		});
		
		socket.on("disconnect",function() {
			//console.log(socket)
			//console.log('active game sockets',withoutParent.struct.sockets)
			//console.log('socketList',withoutParent.socketList)
			console.log('socketList',Object.keys(socket))
			if(socket.userData==undefined){socket.userData={}}
			let player=withoutParent.struct.sockets[socket.userData.myIDinGame]
			if(player!=undefined&&player['disconnect']!=undefined){player['disconnect']()}
			delete withoutParent.socketList[socket.id]
		});
		socket.on('message',(message)=>{
			console.log(message)
			let player=withoutParent.struct.sockets[socket.userData.myIDinGame]
			if(player!=undefined&&player.message!=undefined){player.message(message)}
		});
		withoutParent.savedCommands=[]
		socket.on("gameCommands",function(data){
			withoutParent.runGameCommand(socket,data)
		})
		
	})
	return withoutParent.struct
}
	
withoutParent.clientFiles=function(){
	let tApp={use:function(expressPath){
			if(typeof expressPath =='string'){
				withoutParent.app.use(withoutParent.express.static(expressPath))
			}else{
				console.log("can not process this type of input using this module")
			}
		}
	}
	return tApp
}
withoutParent.proxyPort=getProxyPort

if(mode=="withParent"){
	module.exports=withParent
}else{
	module.exports=withoutParent
}