var express=require('express');
var mysql=require('mysql');
var socket=require('socket.io');
var bodyParser = require('body-parser'); 

var google = require('google')
google.resultsPerPage = 25


//App setup
var app=express();

//look for ui files in views
app.set('views',__dirname + '/views');
app.use(express.static(__dirname + '/js'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


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

//get item data
app.post('/description',function(req,res){
	conn.query("SELECT * FROM metadata WHERE Title='"+req.body.item+"'",
	function(err, rows, fields) {
		if (err) throw err;
		res.send(rows[0]);
	});
});

//get keyword searches
app.post('/explore',function(req,res){
	conn.query("SELECT Keywords FROM metadata WHERE Title='"+req.body.item+"'",
	function(err, rows, fields) {
		if (err) throw err;
		var allWords = rows[0].Keywords;
		var arr = allWords.split(',');	//array
		console.log(arr.length);
		//var nextCounter = 0
		for(i=0;i<arr.length;i++)
		{
			console.log(arr[i]);
			google(arr[i], function (err, res){
				if (err) console.error(err)
				console.log(res.links.length);
				for (var i = 0; i < 10; ++i) {
					var link = res.links[i];
					console.log(link.title + ' - ' + link.href)
					console.log(link.description + "\n")
				}
				/*if (nextCounter < 4) {
					nextCounter += 1
					if (res.next) res.next()
				}*/
			});
			//data.push(rows[i].Title);
		}

		//res.send()
		
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
