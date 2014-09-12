var express = require('express');
var path = require('path');
var azure = require('azure');
var fs = require('fs');
var url = require('url');
var storage_account = 'gallerie';
var gallerieKey = 'SiQVY98VhO+NI1m6jfBMgB1M/00geM/puCgpMpRvsBSUz0H/xcgF77Wx9SiD7buJFvXZ9NTvyRNvf200CNT6Kg==';
var package_container = 'packages';
var index_container = 'descriptifs';
var admzip = require('adm-zip');
var blobService = azure.createBlobService(storage_account,gallerieKey);
var packages_folder = __dirname + '/databases/packages/';
var request = require('request');

var app = express();
app.use(express.static(__dirname + '/public'));
app.use("/databases", express.static(__dirname + '/databases'));
app.use("/controllers", express.static(__dirname + '/controllers'));

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

// app.use('/', routes);
app.get('/gallery', function (req, res){
	res.render('index.html');
});

function Init(){
	// Get index.json
	blobService.getBlobToFile(index_container, 'index.json', __dirname + '/databases/index.json', function(error, result, response){
	});
}

app.get('/product/download', function(req, res){
	var item = url.parse(req.url).query;
	var filePath = packages_folder + item + '.zip';
	blobService.getBlobToFile(package_container, item + '.mob', filePath, function(error, result, response){
		if(!error){
		    var returnHeaders = {};
			returnHeaders['Content-Disposition'] = 'attachment; filename="'+ item +'.zip"';
			returnHeaders['Content-Type'] = 'application/zip';
			res.writeHead(200, returnHeaders); 
			var stream = fs.createReadStream(filePath);
			stream.on('open', function () {				
				stream.pipe(res);
			});
			stream.on('end', function () {
				res.end();
			});			
		}	
	});			
});

app.get('/product/install', function(req, res){
    var item = url.parse(req.url).query;
	res.json({ 
		blobUrl : '/product/download?' + item
	});
});

app.get('/addProduct', function(req, res){
	blobService.getBlobToFile(index_container, 'index.json', __dirname + '/databases/index.json', function(error, result, response){
		blobService.acquireLease(index_container, 'index.json', function(error, result, response){
			if(error){
				console.log('blob lease failed');
			}
			else{
				var product = {type : 'product', name : req.data.name, link : req.data.link};
				fs.readFile('/databases/index.json', "utf8", function (err, data){
					data.push(product);
				}
				console.log('blob lease achieved');
			};
		});
	});
});

Init();
var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
module.exports = app;
