const path = require('path');

module.exports = {
	  entry: './public/js/test.js',
	  output: {
		      filename: 'main.js',
		      path: path.resolve(__dirname, 'dist'),
		    },
};
