var express = require('express');
var path = require('path');
var azure = require('azure');
var fs = require('fs');
var url = require('url');
var storage_account = 'gallerie';
var gallerieKey = 'SiQVY98VhO+NI1m6jfBMgB1M/00geM/puCgpMpRvsBSUz0H/xcgF77Wx9SiD7buJFvXZ9NTvyRNvf200CNT6Kg==';
var package_container = 'packages';
var index_container = 'descriptifs';
var images_container = 'images';
var admzip = require('adm-zip');
var blobService = azure.createBlobService(storage_account,gallerieKey);
var packages_folder = __dirname + '/databases/packages/';
var bodyParser = require('body-parser');
var jf = require('jsonfile');
var util = require('util');
var app = express();
var formidable = require('formidable');

app.use(express.static(__dirname + '/public'));
app.use("/databases", express.static(__dirname + '/databases'));
app.use("/controllers", express.static(__dirname + '/controllers'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

// app.use('/', routes);
app.get('/gallery', function (req, res){
	res.render('index.html');
});

function Init(){
	// Get index.json
	blobService.getBlobToFile(index_container, 'packages.json', __dirname + '/databases/packages.json', function(error, result, response){
	});
}

app.get('/product/download', function(req, res){
	var item = url.parse(req.url).query;
	var filePath = packages_folder + item + '.zip';
	blobService.getBlobToFile(package_container, item + '.zip', filePath, function(error, result, response){
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

app.post('/addProduct', function(req, res){
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
				obj.push(product);
				jf.writeFile(__dirname + '/databases/packages.json', obj, function(err){
					if(!err){
						blobService.createBlockBlobFromFile(index_container, "packages.json", __dirname + '/databases/packages.json', function(){});
					}
					else{
						console.log(err);
					}
				});
				blobService.createBlockBlobFromFile(package_container, name + ".zip", files.inputPackage.path, function(error, res){});
				blobService.createBlockBlobFromFile(images_container, name + ".jpg", files.inputImage.path, function(error, res){});
			});
		});
	});
});

Init();
var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
module.exports = app;
