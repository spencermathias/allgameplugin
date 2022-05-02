
import EventEmitter from 'events';

var withParent={
	socketList:{},
	moduleColor:'#aaaaaa',
	savedCommands:[],
	runGameCommand:function(gameID,data){
		try{
			let player=withParent.struct.sockets[gameID]
			//console.log('player',player)
			console.log('sockets',withParent.struct)
			player[data.command](data.data)
		}
		catch(err){
			//console.log(data)
			console.log("the command "+data.command+" did not work")
			console.log("it gave a "+err.name)
			console.log("with a message of "+err.message)
		}
	},
	message:function(socket,data){
		process.send({playerID:socket.id,command:'message',data:data})
	},
	struct:{
		sockets:{
			id:"all",
			emit:function(command,data){
				process.send({playerID:"all",command:command,data:data})
			},
			on:function(command,funct){
				withParent.struct.sockets[command]=funct
			}
		}
	}
}

withParent.defaultSocket=function(gameID){
	return{
		id:gameID,
		userName:gameID,
		on: function(command,customFunction){
			let player=withParent.struct.sockets[gameID]
			player[command]=customFunction
			console.log('loaded '+command)
			if(arguments.length!=2){
				console.log("currently you must have 2 arguments, the call and the function")
			}
		},
		emit:function(command,data){
			console.log('server sends out to player '+gameID+': ',{command:command,data:data})
			process.send({playerID:gameID,command:command,data:data})
		},
		message:function(data){
			withParent.message( gameID, "You: " + data, withParent.moduleColor);
			withParent.message( {from:gameID}, "" + withParent.struct.sockets[gameID].userName + ": " + data.message, chatColor);
		},
		broadcast:{
			id:{from:gameID},
			emit:function(command,data){
				console.log('server broadcasts to player '+gameID+': ',{command:command,data:data})
				process.send({playerID:{from:gameID},command:command,data:data})
			}
		}
	}
}

withParent.createServer= function(serverConfigObject,closeCondition){
	process.send({playerID:'use',path:"../template files for games/clientComms"})
	withParent.myEmitter = new EventEmitter()
	withParent.myEmitter.on('close',(gameID)=>{
		if(closeCondition(gameID)){return process.exit(0)}else{'did not close'}
	})
	process.on('message', function(dataIn){
		if(dataIn.debug==undefined){
			if(dataIn.gameID!=undefined){
				console.log('current struct',withParent.struct.sockets)
				if(withParent.struct.sockets[dataIn.gameID]==undefined){
					let temp=withParent.defaultSocket(dataIn.gameID)
					//console.log('default Socket',temp)
					withParent.struct.sockets[dataIn.gameID]=temp
					withParent.struct.sockets.connection(withParent.struct.sockets[dataIn.gameID])
					if(dataIn.data!=undefined && typeof withParent.struct.sockets[dataIn.gameID].userName=="string"){
						withParent.struct.sockets[dataIn.gameID].userName=dataIn.data.name
					}
					//console.log('after connection',withParent.struct.sockets[dataIn.gameID])
				}
			}
			if(dataIn.closeout){
				if(closeCondition(dataIn.gameID)){return process.exit(0)}
			}
			console.log(dataIn)
			withParent.runGameCommand(dataIn.gameID,dataIn.data)
		}else{
			try{
				std1.emit('data',dataIn.input)
			}catch(err){
				"invalid command in sub process"
			}
		}
	});
	return withParent.struct
}

withParent.clientFiles=function(){
	let tApp={use:function(expressPath){
			if(typeof expressPath =='string'){
				process.send({playerID:'use',path:expressPath})
			}else{
				console.log("can not process this type of input using this module")
			}
		}
	}
	return tApp
}
let std1=process.openStdin()


export defaultwithParent