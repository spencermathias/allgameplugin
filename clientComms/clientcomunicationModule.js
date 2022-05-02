function comms(address){
	let thisSocket=io(window.location.href)
	let tComms={
		inputAddress:address,
		io:thisSocket,
		on:function(command,funct){
			tComms.functList[command]=funct
		},
		emit:function(command,data){
			tComms.io.emit('gameCommands',{command:command,data:data})
			if(arguments.length>2){
				console.log("currently you may only have up to 2 arguments, the call and the data")
			}
		},
		send:function(data){tComms.io.emit('gameCommands',{command:'message',data:data})},
		functList:{}//,
		
	};
	tComms.io.on('connect', () => {
		console.log("Connection successful!")
		tComms.savedCommands=[]
		tComms.io.emit('sendUsername', {
				ID:localStorage.commsID,
				name:localStorage.userName,
				command:'onReConnect',
				data:localStorage.userName
			}, function (responseData) {
			console.log('Callback called with data:', responseData);
			if(responseData=='return'){
				window.location.href='/'
			}else{
				localStorage.commsID=responseData
				tComms.id=responseData
				tComms.functList.connect()
			}
		});
	});
	
	tComms.io.on('forward to room',(path)=>{
		console.log('move to path:',path)
		window.location.href=path
	});
	tComms.io.on('gameCommands',function(input){
		console.log('game command',input)
		tComms.functList[input.command](input.data)
	});
	tComms.io.on('message',(message)=>{
		console.log(message)
		try{
			tComms.functList.message(message)
		}catch(err){
			console.log(err)
		}
	});
	console.log('comms started')
	return tComms
}

