//modules
var admzip = require('adm-zip');
var express = require('express');
var app = express();
var azure = require('azure');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var fs = require('fs');
var jf = require('jsonfile');
var path = require('path');
var url = require('url');
var util = require('util');

var storage_account = 'gallerie';
var gallerieKey = 'SiQVY98VhO+NI1m6jfBMgB1M/00geM/puCgpMpRvsBSUz0H/xcgF77Wx9SiD7buJFvXZ9NTvyRNvf200CNT6Kg==';
var package_container = 'packages';
var index_container = 'descriptifs';
var images_container = 'images';

var blobService = azure.createBlobService(storage_account,gallerieKey);
var packages_folder = __dirname + '/databases/packages/';

app.all('*', function(req, res, next){
	res.set("Connection", "close");
	next();
});

app.use(express.static(__dirname + '/public'));
app.use("/databases", express.static(__dirname + '/databases'));
app.use("/controllers", express.static(__dirname + '/controllers'));

// app.use(function(req, res, next){
// 	console.log("catch2!");
// 	res.set("Connection", "close");
// 	next();
// });

// app.use("/gallery", function(req, res, next){
// 	res.set("Connection", "close");
// 	next();
// });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.get('/gallery', function (req, res){
	res.set("Connection", "close");	
	res.render('index.html');
});

function Init(){
	// Get index.json
	blobService.getBlobToFile(index_container, 'packages.json', __dirname + '/databases/packages.json', function(error, result, response){
	});
}

app.get('/gallery/product/download', function(req, res){
	var item = url.parse(req.url).query;
	var filePath = packages_folder + item + '.zip';
	blobService.getBlobToFile(package_container, item + '.zip', filePath, function(error, result, response){
		if(!error){
		    var returnHeaders = {};
			returnHeaders['Content-Disposition'] = 'attachment; filename="'+ item +'.zip"';
			returnHeaders['Content-Type'] = 'application/zip';
			returnHeaders['Connection'] = "close";
			res.writeHead(200, returnHeaders); 
			var stream = fs.createReadStream(filePath);
			stream.on('open', function () {		
				stream.pipe(res);
			});
			stream.on('end', function () {
				res.end();
			});			
		}
		else{
			res.render("unfind.html");
			console.log(error);
		}
	});			
});

app.get('/gallery/product/install', function(req, res){
    var item = url.parse(req.url).query;
    res.set("Connection", "close");
    res.contentType('application/json');
	var adresse = { 
		"name" : item,
		"blobUrl" : '/gallery/product/download?' + item
	};
	res.end(JSON.stringify(adresse));
});

app.get('/', function(req, res){
	res.set("Connection", "close");	
	res.end();
});	


app.get('/gallery/getPackageJSON', function(req, res){
	res.set("Connection", "close");

	jf.readFile(__dirname + '/databases/packages.json', function (err, obj){
		res.send(obj);	
	});
});

app.post('/gallery/addProduct', function(req, res){
	//1 - Lease the blob
	//2 - Get the blob & read
	//3 - Write the product
	//4 - Upload the JSON
	//5 - Upload the package
	//6 - Release the blob
	blobService.getBlobToFile(index_container, 'packages.json', __dirname + '/databases/packages.json', function(error, result, response){
		var form = new formidable.IncomingForm();
		form.parse(req, function(err, fields, files){
			var name = fields.inputName.replace(' ', '');
			var product = {"type" : "product", "name" : fields.inputName, "link" : name, "description" : fields.inputDescription, "price" : 0, "file" : name, "package" : name, "category" : fields.inputCategory, "countView" : 0, "countOrder" : 0};
			jf.readFile(__dirname + '/databases/packages.json', function (err, obj){
				for(var i = 0; i < obj.length; i++){
					if(obj[i]['link'] === name){
						res.redirect(res.render('failure.html'));
					}
				}
					
				obj.push(product);
				jf.writeFile(__dirname + '/databases/packages.json', obj, function(err){
					if(!err){
						blobService.createBlockBlobFromFile(index_container, "packages.json", __dirname + '/databases/packages.json', function(){});
					}
					else{
						console.log(err);
					}
				});

				// fs.writeFile("name" + ".zip")
				var readStream = fs.createReadStream(files.inputImage.path);
				var writeStream = fs.createWriteStream(__dirname + '/public/gallery/img/' + name + ".jpg");
				readStream.pipe(writeStream);
				// fs.writeFile(__dirname + '/public/gallery/img/' + name + ".jpg", stream, function(err){
				// 	console.log("img ok!");
				// });

				readStream = fs.createReadStream(files.inputPackage.path);
				writeStream = fs.createWriteStream(__dirname + '/databases/packages/' + name + ".zip");
				readStream.pipe(writeStream);
				// fs.writeFile(__dirname + '/databases/packages/' + name + ".zip", stream, function(err){
				// 	console.log("package ok!");
				// });

				blobService.createBlockBlobFromFile(package_container, name + ".zip", files.inputPackage.path, function(){
					blobService.createBlockBlobFromFile(images_container, name + ".jpg", files.inputImage.path, function(){
						// res.set("Connection", "close");	
						res.render('success.html');
					});
				});						
			});
		});
	});
});


// app.get('/product/delete', function(req, res){
// 	//delete package, image & json
// 	var item = url.parse(req.url).query;
// 	var filePath = packages_folder + item + '.zip';
	
// 	//package
// 	blobService.deleteBlob(package_container, item + '.zip', function(error, response){
// 		if(!error){
// 			console.log("package de " + item + " supprimé");
// 		}
// 	});

// 	//image
// 	blobService.deleteBlob(images_container, item + '.jpg', function(error, response){
// 		if(!error){
// 			console.log("image de " + item + " supprimé");
// 		}
// 	});

// 	//json
// 	blobService.getBlobToFile(index_container, 'packages.json', __dirname + '/databases/packages.json', function(error, result, response){
// 		jf.readFile(__dirname + '/databases/packages.json', function (err, obj){
// 			for (var object in obj){
// 				console.log(object['link']);
// 				if(object['link'] === item){
// 					console.log('delete ' + obj[object]);
// 					delete obj[object];	
// 				}
// 			}

// 			jf.writeFile(__dirname + '/databases/packages.json', obj, function(err){
// 				if(!err){
// 					console.log("nouvelle liste : " + obj);
// 					res.render('success.html');
// 					blobService.createBlockBlobFromFile(index_container, "packages.json", __dirname + '/databases/packages.json', function(){});
// 				}
// 				else{
// 					console.log(err);
// 				}
// 			});	
// 		});	
// 	});	
// });


Init();
var server = app.listen(81, function() {
    console.log('Listening on port %d', server.address().port);
});

// server.on('connection', function(socket){
// 	console.log("connect");
// 	socket.on('close', function(){
// 		console.log("connection closed");
// 	});
// 	socket.setKeepAlive(false,[0]);
// 	socket.setTimeout(1500, function(){
// 		socket.destroy();
// 	});
// });
module.exports = app;