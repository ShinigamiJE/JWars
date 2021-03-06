var express = require('express');
var app = express();
var server = require('http').Server(app);//usamos http para que funcione bien con socket.io(Pero le pasamos express)
var io = require('socket.io')(server);
var userid = 0;

  var players = [{
    id : userid,
    name : "admin",
    color : "#000000",
    x : 30,
    y : 30
  }];

 var mensajes = [{
   id : 1,
   texto: "Bienvenido",
   autor : "Admin"
 }];

app.use(express.static("public"));


app.get('/',function(request, response){
  response.status(200);
  response.send("Hola mundo!");
});

io.on('connection',function(socket){
  socket.emit('msg',mensajes);

  socket.on('newMsg',function(data){
    mensajes.push(data);
    io.sockets.emit('msg',mensajes);
  });
  socket.on('join',function(user){
    players.push({
      id : ++userid,
      name : user,
      color : "#"+((1<<24)*Math.random()|0).toString(16),
      x : 20,
      y : 20
    });
    socket.emit('accept',userid);
    console.log("Nuevo Usuario ->" + userid);
    console.log("Total usuario -> " + players.length);
    io.sockets.emit('newPlayer',valSend(players));
    listaDeJugdores();
  });

  socket.on('move',function(data){
    console.log("Usuario " + data.id + " se mueve a " + data.dir);
    index = indexId(data.id);
    if(data.dir=="u"){
      if(players[index].y > 5){
        players[index].y-=5;
      }else{
        players[index].y = 5;
      }
    }else if(data.dir=="d"){
      if(players[index].y < 260){
        players[index].y+=5;
      }else{
        players[index].y = 260;
      }
    }else if(data.dir=="l"){
      if(players[index].x > 6){
        players[index].x-=5;
      }else{
        players[index].x = 6;
      }
    }else if(data.dir=="r"){
      console.log(players[index].x);
      if(players[index].x < 260){
        players[index].x+=5;
      }else{
        players[index].x = 260
      }
    }else{
      console.log("error de movimiento " + data.dir + " usuario " + data.id);
    }

    io.sockets.emit('update',valSend(players));
  });
});

function valSend(listPlayers){
  var poscol=[{}];
  players.forEach(function(data,i){
    poscol.push({
      id : data.id,
      x : data.x,
      y : data.y,
      color : data.color
    });
  });
  return poscol;
}

function listaDeJugdores(){
  console.log("------------------------------------------------");
  players.forEach(function(data, i){
    console.log("Usuario " + data.id);
  });
  console.log("------------------------------------------------");
}

function indexId(id){
  index = 0;
  players.forEach(function(data, i){
    if(id == data.id){
      index = i;
    }
  });
  return index;
}

server.listen(8080,function(){
  console.log("Server...[OK]");
});
