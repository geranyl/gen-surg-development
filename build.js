/**concat and compress js**/
var compressor = require('node-minify');
var fse = require('fs-extra');
var cmd = require('node-cmd');

var lunr = require('lunr'),
    data = '';


 


function produce(){

	/**creates html from markdown and moves any source images to production**/
	cmd.get(
        `
            multimarkdown -t html -o gen-surg-prod/index.html gen-surg-source-markdown/index.md
            m2j -c -o gen-surg-dev/output.json gen-surg-source-markdown/content/*.md
        `,
        function(err, data, stderr){
            if (!err) {
               console.log('created the following files: ',data)
            } else {
               console.log('error', err)
            }
        }
    );

    /**compiles new search index for lunr**/
    var readStream = fse.createReadStream('gen-surg-dev/output.json', 'utf8');

	  readStream.on('data', function(chunk) {  
	    data += chunk;
	  }).on('end', function() {
	    var documents = JSON.parse(data).files;
	    
	    var idx = lunr(function () {
	      this.ref('title')
	      this.field('basename')
	      this.field('content')
	      documents.forEach(function (doc) {
	        this.add(doc)
	      }, this);
	    });
	     fse.writeFile('gen-surg-prod/index.json', JSON.stringify(idx), function(err){
	     	if(err) throw err;
	     	console.log('saved index.json for lunr');
	     });
	  });

	fse.copy('gen-surg-dev/img/', 'gen-surg-prod/img/', function(err){
		if(err) return console.error(err);
		console.log('image files moved');
	});

	fse.copy('gen-surg-dev/manifest.json', 'gen-surg-prod/manifest.json', function(err){
		if(err) return console.error(err);
		console.log('manifest.json was moved');
	});

	fse.copy('gen-surg-dev/scripts/source.js', 'gen-surg-prod/scripts/source.js', function(err){
		if(err) return console.error(err);
		console.log('source.js was moved');
	});

	


}

function minifyJS(){
	compressor.minify({
		compressor: 'gcc',
		input: ['node_modules/lunr/lunr.js', 'gen-surg-dev/scripts/stacktable.js'],
		output: 'temp-source.js',
		callback: function(err,min){
			if (err) {
        		throw err;
    		}

			compressor.minify({
				compressor: 'no-compress',
				input:['temp.js','temp-source.js'],
				output: 'gen-surg-prod/scripts/main.js',
				callback: function(err,min){
					if (err) {
		        		throw err;
		    		}
					fse.unlinkSync('temp.js');
					fse.unlinkSync('temp-source.js');
					produce();
				}
			})
		}
	})
}

compressor.minify({
  compressor: 'no-compress',
  input: ['node_modules/jquery/dist/jquery.min.js', 'node_modules/slideout/dist/slideout.min.js'],
  output: 'temp.js',
  callback: function (err, min) {
  	if (err) {
        throw err;
    }
  	minifyJS();
  }
});

/**concat and compress css**/
compressor.minify({
  compressor: 'sqwish',
  input: ['gen-surg-dev/css/hamburger.css','gen-surg-dev/css/main.css'],
  output: 'gen-surg-prod/css/main.css',
  callback: function (err, min) {
  	if (err) {
        throw err;
    }
  }
});