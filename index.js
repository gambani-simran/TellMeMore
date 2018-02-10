var express=require('express');
var mysql=require('mysql');
var socket=require('socket.io');

//App setup
var app=express();

//look for ui files in views
app.set('views',__dirname + '/views');
app.use(express.static(__dirname + '/js'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

//Static files
app.use(express.static('public'));

//connect to db
var conn = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : '',
	database : 'clubmate'
});
conn.connect();

app.get('/',function(req,res){
res.render('search.html');
});

app.get('/search',function(req,res){
	conn.query('SELECT Title from metadata where Title like "%'+req.query.key+'%"',
	function(err, rows, fields) {
		if (err) throw err;
		var data=[];
		//prepare data according to query
		for(i=0;i<rows.length;i++)
		{
			data.push(rows[i].Title);
		}
		res.send(JSON.stringify(data));
	});
});

var server=app.listen(4000,function(){
  console.log('Listening to  request on port 4000');
});

//Socket setup
var io=socket(server);

io.on('connection',function(socket){
  console.log('Made socket connection',socket.id);

  socket.on('chat',function(data){
    io.sockets.emit('chat',data);
  });

});
