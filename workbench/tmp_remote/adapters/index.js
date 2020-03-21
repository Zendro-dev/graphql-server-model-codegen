
  const fs = require('fs');
  const path = require('path');

  let adapters = {};
  module.exports = adapters;

  fs.readdirSync(__dirname)
    .filter( file =>{ return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js');
  }).forEach( file =>{

    let adapter = require(path.join(__dirname, file));
    if( adapters[adapter.name] ){
      throw Error(`Duplicated adapter name ${adapter.name}`);
    }
    adapters[adapter.name] = adapter;
  });
  