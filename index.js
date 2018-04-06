const program = require('commander');
var fs = require('fs');
const funks = require('./funks');

program
  .version('0.0.1')
  .description('Code generator for GraphQL server');

program
  .command('--generate <json-files-folder> [dir_to_write]')
  .alias('g')
  .description('Generate code for all models described in the input json file (json-file)')
  .action((json_dir, dir_write) => {

      dir_write = (dir_write===undefined) ? __dirname : dir_write;
      let sections = ['schemas', 'resolvers', 'models'];
      let models = [];
      // creates one folder for each of schemas, resolvers, models
      sections.forEach( (section) => {
          fs.mkdirSync(dir_write+'/'+section);
      });

      // creates schema, resolvers and model for each json file provided
      fs.readdirSync(json_dir).forEach( async (json_file) => {

          let opts = funks.getOpts(json_dir+'/'+json_file);
          models.push([opts.name , opts.namePl]);

          sections.forEach((section) =>{
              let file_name = dir_write + '/'+ section +'/' + opts.nameLc + '.js';
              funks.generateSection(section, opts, file_name)
              .then( () => {
                  console.log(file_name + ' written succesfully!');
              });
          });
      });

      funks.writeSchemaCommons();

      //write resolvers index for all models
      let index_resolvers_file = dir_write + '/resolvers/index.js';
      funks.generateSection('resolvers-index',{models: models} ,index_resolvers_file)
      .then( () => {
        console.log('resolvers-index written succesfully!');
      });
  });

program.parse(process.argv);
