let fs = require('fs');
const ejs = require('ejs');
const inflection = require('inflection');
const jsb = require('js-beautify').js_beautify;
const {promisify} = require('util');
const ejsRenderFile = promisify( ejs.renderFile );
const stringify_obj = require('stringify-object');
const colors = require('colors/safe');

/**
 *  Allowed type of associations classified accordingly the number of possible records involved
 *  @constant
 *  @type {object}
 */
associations_type = {
  "many" : ['hasMany', 'belongsToMany'],
  "one" : ['hasOne', 'belongsTo']
};


/**
 * parseFile - Parse a json file
 *
 * @param  {string} jFile path wher json file is stored
 * @return {object}       json file converted to js object
 */
parseFile = function(jFile){
  let data=fs.readFileSync(jFile, 'utf8');
  let words=JSON.parse(data);
  return words;
};


/**
 * isEmptyObject - Determines if an object is empty
 *
 * @param  {object} obj Object to check if is empty
 * @return {boolean}     False if 'obj' has at least one entry, true if the object is empty.
 */
isEmptyObject = function(obj){
    for(let key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
};


/**
 * uncapitalizeString - set initial character to lower case
 *
 * @param  {string} word String input to uncapitalize
 * @return {string}      String with lower case in the initial character
 */
uncapitalizeString = function(word){
  let length = word.length;
  if(length==1){
    return word.toLowerCase();
  }else{
    return word.slice(0,1).toLowerCase() + word.slice(1,length);
  }
};


/**
 * capitalizeString - set initial character to upper case
 *
 * @param  {type} word String input to capitalize
 * @return {type}      String with upper case in the initial character
 */
capitalizeString = function(word){
  let length = word.length;
  if(length==1){
    return word.toUpperCase();
  }else{
    return word.slice(0,1).toUpperCase() + word.slice(1,length);
  }
};

/**
 * generateJs - Generate the Javascript code (GraphQL-schema/resolvers/Sequelize-model) using EJS templates
 *
 * @param  {string} templateName Name of the template to use
 * @param  {object} options      Options that the template will use
 * @return {string}              String of created file with specified template
 */
module.exports.generateJs = async function(templateName, options) {
  let renderedStr = await ejsRenderFile(__dirname + '/views/' +
    templateName +
    '.ejs', options, {});
  let prettyStr = jsb(renderedStr);
  return prettyStr;
};


/**
 * attributesToString - Convert object attributes to a string separating by dots the key and value and by comma each attribute.
 *
 * @param  {object} attributes Object attributes to convert
 * @return {string}            Converted object into a single string
 */
attributesToString = function(attributes){
  let str_attributes="";
  if(attributes==='undefined' || isEmptyObject(attributes)) return str_attributes;

  for(key in attributes)
  {
    str_attributes += key + ': ' + attributes[key] + ', '
  }

  return str_attributes.slice(0,-2);
};


/**
 * attributesToJsonSchemaProperties - Convert object attributes to JSON-Schema
 * properties. See http://json-schema.org
 *
 * @param  {object} attributes Object attributes to convert
 * @return {object}            The generated JSON-Schema properties
 */
attributesToJsonSchemaProperties = function(attributes) {
  let jsonSchemaProps = Object.assign({}, attributes)

  for (key in jsonSchemaProps) {
    if (jsonSchemaProps[key] === "String") {
      jsonSchemaProps[key] = {
        "type": ["string", "null"]
      }
    } else if (jsonSchemaProps[key] === "Int") {
      jsonSchemaProps[key] = {
        "type": ["integer", "null"]
      }
    } else if (jsonSchemaProps[key] === "Float") {
      jsonSchemaProps[key] = {
        "type": ["number", "null"]
      }
    } else if (jsonSchemaProps[key] === "Boolean") {
      jsonSchemaProps[key] = {
        "type": ["boolean", "null"]
      }
    } else if (jsonSchemaProps[key] === "Date") {
      jsonSchemaProps[key] = {
	      "anyOf": [
          { "isoDate": true },
          { "type": "null" }
        ]
      }
    } else if (jsonSchemaProps[key] === "Time") {
      jsonSchemaProps[key] = {
	      "anyOf": [
          { "isoTime": true },
          { "type": "null" }
        ]
      }
    } else if (jsonSchemaProps[key] === "DateTime") {
      jsonSchemaProps[key] = {
        "anyOf": [
          { "isoDateTime": true },
          { "type": "null" }
        ]
      }
    } else {
      throw new Error(`Unsupported attribute type: ${jsonSchemaProps[key]}`);
    }
  }

  return jsonSchemaProps
};


/**
 * attributesArrayString - Get all attributes of type string
 *
 * @param  {object} attributes Object containing the attributes to parse
 * @return {array}            Array of string containing only the name of the attributes which type is "string"
 */
attributesArrayString = function(attributes){
  let array_attributes = ["id"];

  for(key in attributes){
    if(attributes[key]=== 'String')
    {
      array_attributes.push(key);
    }
  }

  return array_attributes;
};



/**
 * getOnlyTypeAttributes - Creates an object which keys are the attributes and the value its type
 *
 * @param  {object} attributes Object containing the attributes to parse
 * @return {object}            Object simplified, all values are strings indicating the attribute's type.
 */
getOnlyTypeAttributes = function(attributes){
  let only_type = {};

    for(key in attributes){

      if(attributes[key] && typeof attributes[key]==='object' && attributes[key].constructor === Object ){
        only_type[ key ] = attributes[key].type;
      }else if(typeof attributes[key] === 'string' || attributes[key] instanceof String){
        only_type[key] =  attributes[key];
      }

    }

    return only_type;
}



/**
 * getOnlyDescriptionAttributes - Creates an object which keys are the attributes and the value its description
 *
 * @param  {type} attributes Object containing the attributes to parse
 * @return {type}            Object simplified, all values are strings indicating the attribute's description.
 */
getOnlyDescriptionAttributes = function(attributes){
  let only_description = {};

    for(key in attributes){

      if(attributes[key] && typeof attributes[key]==='object' && attributes[key].constructor === Object ){
        only_description[ key ] = attributes[key].description || "";
      }else if(typeof attributes[key] === 'string' || attributes[key] instanceof String){
        only_description[key] = "";
      }

    }

    return only_description;
}



/**
 * writeSchemaCommons - Writes a 'commons.js' file into the given directory. This file contains
 * general parts of the graphql schema that are common for all models.
 *
 * @param  {string} dir_write Path of the directory where to create the commons.js file
 */
writeSchemaCommons = function(dir_write){

  let commons = `module.exports = \`

  enum Operator{
    like
    or
    and
    eq
    between
    in
    gt
    gte
    lt
    lte
    ne
  }

  enum Order{
    DESC
    ASC
  }

  input typeValue{
    type: String
    value: String!
  }

  input paginationInput{
    limit: Int
    offset: Int
  }

  input paginationCursorInput{
    first: Int
    last: Int
    after: String
    before: String
    includeCursor: Boolean
  }

  type pageInfo{
    startCursor: String
    endCursor: String
    hasPreviousPage: Boolean!
    hasNextPage: Boolean!
  }

  scalar Date
  scalar Time
  scalar DateTime
\`;`;

  fs.writeFile(dir_write + '/schemas/' +  'commons.js' , commons, function(err) {
    if (err)
      return console.log(err);
    });
};


/**
 * writeIndexModelsCommons - Writes a 'index.js' file of all models stored inside the given directory. This file
 * will allow to import all sequelize models before creating associations between models.
 *
 * @param  {string} dir_write Path of the directory where to create the index.js file
 */
writeIndexModelsCommons = function(dir_write){

  let index =  `
  const fs = require('fs');
  const path = require('path')
  sequelize = require('../connection');

  var models = {};

  //grabs all the models in your models folder, adds them to the models object
  fs.readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    var model = sequelize['import'](path.join(__dirname, file));

    let validator_patch = path.join(__dirname,'../','validations', file);
    if(fs.existsSync(validator_patch)){
        model = require(validator_patch).validator_patch(model);
    }

    let patches_patch = path.join(__dirname,'../','patches', file);
    if(fs.existsSync(patches_patch)){
        model = require(patches_patch).logic_patch(model);
    }

    models[model.name] = model;
  });
  //Important: creates associations based on associations defined in associate function in the model files
  Object.keys(models).forEach(function(modelName) {
    if (models[modelName].associate) {
      models[modelName].associate(models);
    }
  });
  //update tables with association (temporary, just for testing purposes)
  //this part is suppose to be done in the migration file
  //sequelize.sync({force: true});
  module.exports = models;
  `;

  fs.writeFile(dir_write + '/models/' +  'index.js' , index, function(err) {
    if (err)
      return console.log(err);
    });
};

writeIndexAdapters = function(dir_write){
  let index = `
  const fs = require('fs');
  const path = require('path');
  const Sequelize = require('sequelize');
  sequelize = require('../connection');

  let adapters = {};
  module.exports = adapters;

  fs.readdirSync(__dirname)
    .filter( file =>{ return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js');
  }).forEach( file =>{

    let adapter = require(path.join(__dirname, file));
    if( adapters[adapter.name] ){
      throw Error(\`Duplicated adapter name \${adapter.name}\`);
    }
    
    if(adapter.type === 'local'){
      adapters[adapter.name] = adapter.init(sequelize, Sequelize);
    }else{
      adapters[adapter.name] = adapter;
    }
  });
  `
  fs.writeFile(dir_write + '/adapters/' +  'index.js' , index, function(err) {
    if (err)
      throw Error(err);
    });

}

/**
 * convertToType - Generate a string correspondant to the model type as needed for graphql schema.
 *
 * @param  {boolean} many       True if the field type in the schema corresponds to an array, false otherwise.
 * @param  {type} model_name Name of the model.
 * @return {string}            String indicating array or only the model name.
 */
convertToType = function(many, model_name){
  if(many)
  {
    return '[ '+ model_name +' ]';
  }

  return model_name;
};



/**
 * getOptions - Creates object with all extra info and with all data model info.
 *
 * @param  {object} dataModel object created from a json file containing data model info.
 * @return {object}           Object with all extra info that will be needed to create files with templates.
 */
module.exports.getOptions = function(dataModel){
  //let dataModel = parseFile(json_file);
  //console.log(dataModel.associations);

  let opts = {
      name : dataModel.model,
      nameCp: capitalizeString(dataModel.model),
      storageType : dataModel.storageType.toLowerCase(),
      table: inflection.pluralize(uncapitalizeString(dataModel.model)),
      nameLc: uncapitalizeString(dataModel.model),
      namePl: inflection.pluralize(uncapitalizeString(dataModel.model)),
      namePlCp: inflection.pluralize(capitalizeString(dataModel.model)),
      attributes: getOnlyTypeAttributes(dataModel.attributes),
      jsonSchemaProperties: attributesToJsonSchemaProperties(getOnlyTypeAttributes(dataModel.attributes)),
      associations: parseAssociations(dataModel.associations, dataModel.storageType.toLowerCase()),
      arrayAttributeString: attributesArrayString( getOnlyTypeAttributes(dataModel.attributes) ),
      indices: dataModel.indices,
      definitionObj : dataModel,
      attributesDescription: getOnlyDescriptionAttributes(dataModel.attributes),
      url: dataModel.url || "",
      externalIds: dataModel.externalIds || [],
      regex: dataModel.regex || "",
      adapterName: dataModel.adapterName || "",
      registry: dataModel.registry || [],
      idAttribute: getIdAttribute(dataModel)
  };

  opts['editableAttributesStr'] = attributesToString(getEditableAttributes(opts.attributes, opts.associations.belongsTo, getIdAttribute(dataModel)));
  opts['idAttributeType'] = dataModel.internalId === undefined ? 'Int' :  opts.attributes[opts.idAttribute];
  opts['defaultId'] = dataModel.internalId === undefined ? true :  false;
  dataModel['id'] = {
    name: opts.idAttribute,
    type: opts.idAttributeType
  }

  opts['definition'] = stringify_obj(dataModel);
  delete opts.attributes[opts.idAttribute];
  
  return opts;
};


validateJsonFile =  function(opts){

  let valid = true;

  //validate external ids declare in attributes
  opts.externalIds.forEach( x => {
    if( !opts.attributes.hasOwnProperty(x) || !(opts.attributes[x] === 'String' || opts.attributes[x] === 'Float' || opts.attributes[x] === 'Int'  ) ){
      valid = false;
      console.error(colors.red(`ERROR: External id "${x}" has not been declared in the attributes of model ${opts.name} or is not of one of the allowed types: String, Int or Float`) );
    }
  });

  return valid;
}

  getSqlType = function(association, model_name){
    if(association.type === 'to_one' && association.keyIn !== association.target){
      return 'belongsTo';
    }else if(association.type === 'to_one' && association.keyIn === association.target){
      return 'hasOne';
    }else if(association.type === 'to_many' && association.hasOwnProperty('sourceKey')){
      return 'belongsToMany';
    }else if(association.type === 'to_many' && association.keyIn === association.target){
      return 'hasMany';
    }
  }


  getEditableAttributes = function(attributes, parsedAssocForeignKeys, idAttribute){
    let editable_attributes = {};
    let target_keys = parsedAssocForeignKeys.map( assoc => assoc.targetKey );
    for(let attrib in attributes ){
      if(!target_keys.includes(attrib) && attrib !== idAttribute){
        editable_attributes[ attrib ] = attributes[attrib];
      }
    }
    return editable_attributes;
  }


  /**
   * parseAssociations - Parse associations of a given data model.
   * Classification of associations will be accordingly to the type of association and storage type of target model.
   *
   * @param  {object} associations Description of each association
   * @param  {string} storageType  Storage type(i.e. sql, webservice) where source model is stored.
   * @return {object}              Object containing explicit information needed for generating files with templates.
   */
  parseAssociations = function(associations, storageType){


    associations_info = {
      "schema_attributes" : {
        "many" : {},
        "one" : {}
      },
      //"mutations_attributes" : {},
      "belongsTo" : [],
      "hasOne" : [],
      "hasMany" : [],
      "belongsToMany" : []
    };

    if(associations!==undefined){
      Object.entries(associations).forEach(([name, association]) => {
          association.targetStorageType = association.targetStorageType.toLowerCase();
          let type = association.type;

          //if(associations_type["many"].includes(association.type) )
          if(association.type === 'to_many')
          {
            //associations_info.schema_attributes["many"][name] = [ association.target, capitalizeString(association.target), capitalizeString(inflection.pluralize(association.target))];
            associations_info.schema_attributes["many"][name] = [ association.target, capitalizeString(association.target) ,capitalizeString(name)];
          //}else if(associations_type["one"].includes(association.type))
        }else if(association.type === 'to_one')
          {
            associations_info.schema_attributes["one"][name] = [association.target, capitalizeString(association.target), capitalizeString(name) ];
          }else{
            console.log("Association type "+ association.type + " not supported.");
            return;
          }

          let assoc = association;
          assoc["name"] = name;
          assoc["name_lc"] = uncapitalizeString(name);
          assoc["name_cp"] = capitalizeString(name);
          assoc["target_lc"] = uncapitalizeString(association.target);
          assoc["target_lc_pl"] = inflection.pluralize(uncapitalizeString(association.target));
          assoc["target_pl"] = inflection.pluralize(association.target);
          assoc["target_cp"] = capitalizeString(association.target) ;//inflection.capitalize(association.target);
          assoc["target_cp_pl"] = capitalizeString(inflection.pluralize(association.target));//inflection.capitalize(inflection.pluralize(association.target));
          if(association.keyIn){
              assoc["keyIn_lc"] = uncapitalizeString(association.keyIn);
          }


          let sql_type = getSqlType(assoc);
          associations_info[sql_type].push(assoc);
          //associations_info[type].push(assoc);
        });

      }
      associations_info.mutations_attributes = attributesToString(associations_info.mutations_attributes);
      return associations_info;
    };





/**
 * generateAssociationsMigrations - Create files for migrations of associations between models. It could be either
 * creating a new column or creating a through table.
 *
 * @param  {object} opts      Object with options required for the template that creates migrations.
 * @param  {string} dir_write Path where the the file will be written.
 */
generateAssociationsMigrations =  function( opts, dir_write){

    // opts.associations.belongsTo.forEach( async (assoc) =>{
    //     if(assoc.targetStorageType === 'sql'){
    //       assoc["source"] = opts.table;
    //       assoc["cross"] = false;
    //       let generatedMigration = await module.exports.generateJs('create-association-migration',assoc);
    //       let name_migration = createNameMigration(dir_write, 'z-column-'+assoc.targetKey+'-to-'+opts.table);
    //       fs.writeFile( name_migration, generatedMigration, function(err){
    //         if (err)
    //         {
    //           return console.log(err);
    //         }else{
    //           console.log(name_migration+" writen succesfully!");
    //         }
    //       });
    //     }
    // });

    opts.associations.belongsToMany.forEach( async (assoc) =>{
      if(assoc.targetStorageType === 'sql'){
          assoc["source"] = opts.table;
          let generatedMigration = await module.exports.generateJs('create-through-migration',assoc);
          let name_migration = createNameMigration(dir_write, 'z-through-'+assoc.keysIn);
          fs.writeFile( name_migration, generatedMigration, function(err){
            if (err)
            {
              return console.log(err);
            }else{
              console.log(name_migration+" writen succesfully!");
            }
          });
      }
    });
};


 /**
  * generateSection - Writes a file which contains a generated section. Each seaction has its own template.
  *
  * @param  {string} section   Name of section that will be generated (i.e. schemas, models, migrations, resolvers)
  * @param  {object} opts      Object with options needed for the template that will generate the section
  * @param  {string} dir_write Path (including name of the file) where the generated section will be written as a file.
  */
generateSection = async function(section, opts, dir_write ){
  let generatedSection = await module.exports.generateJs('create-'+section ,opts);
  fs.writeFile(dir_write, generatedSection, function(err) {
    if (err)
    {
      return console.log(err);
    }
  });
};


/**
 * createNameMigration - Creates the name for the migration file accordingly to the time and date
 * that the migration is created.
 *
 * @param  {string} dir_write  directory where code is being generated.
 * @param  {string} model_name Name of the model.
 * @return {string}            Path where generated file will be written.
 */
createNameMigration = function(dir_write, model_name){
  let date = new Date();
   date = date.toISOString().slice(0,19).replace(/[^0-9]/g, "");
  //return dir_write + '/migrations/' + date + '-create-'+model_name +'.js';
  return dir_write + '/migrations/' + date + '-'+model_name +'.js';
};


/**
 * writeCommons - Write static files
 *
 * @param  {string} dir_write directory where code is being generated.
 */
writeCommons = function(dir_write){
  writeSchemaCommons(dir_write);
  writeIndexAdapters(dir_write);
  //deprecated due to static global index, to be removed
  //writeIndexModelsCommons(dir_write);
};

getIdAttribute = function(dataModel){
  return dataModel.internalId === undefined ? "id" : dataModel.internalId;
}


 /**
  * generateCode - Given a set of json files, describing each of them a data model, this
  * functions generate the code for a graphql server that will handle CRUD operations.
  * The generated code consists of four sections: sequelize models, migrations, resolvers and
  * graphql schemas.
  *
  * @param  {string} json_dir  Directory where the json files are stored.
  * @param  {string} dir_write Directory where the generated code will be written.
  */
module.exports.generateCode = function(json_dir, dir_write){
  console.log("Generating files...");
  dir_write = (dir_write===undefined) ? __dirname : dir_write;
  let sections = ['schemas', 'resolvers', 'models', 'migrations', 'validations', 'patches'];
  let models = [];
  let attributes_schema = {};
  let summary_associations = {'one-many': [], 'many-many': {}};

  // creates one folder for each of schemas, resolvers, models
  sections.forEach( (section) => {
    if(!fs.existsSync(dir_write+'/'+section))
    {
      fs.mkdirSync(dir_write+'/'+section);
    }
  });

  if(!fs.existsSync(dir_write+'/models-webservice'))
  {
    fs.mkdirSync(dir_write+'/models-webservice');
  }

  if(!fs.existsSync(dir_write+'/models-cenz-server'))
  {
    fs.mkdirSync(dir_write+'/models-cenz-server');
  }

  if(!fs.existsSync(dir_write+'/adapters'))
  {
    fs.mkdirSync(dir_write+'/adapters');
  }

  if(!fs.existsSync(dir_write+'/models-distributed'))
  {
    fs.mkdirSync(dir_write+'/models-distributed');
  }

  //test
  fs.readdirSync(json_dir).forEach((json_file) => {
      console.log("Reading...", json_file);
      let file_to_object = parseFile(json_dir+'/'+json_file);
      let opts = module.exports.getOptions(file_to_object);

      if(validateJsonFile(opts) ){
        models.push([opts.name , opts.namePl]);
        console.log(opts.name);
        //console.log(opts.associations);

        if(opts.storageType === 'sql'){
          sections.forEach((section) =>{
              let file_name = "";
              if(section==='migrations')
              {
                file_name = createNameMigration(dir_write,opts.nameLc);
              }else{
                file_name = dir_write + '/'+ section +'/' + opts.nameLc + '.js';
              }

              if( (section == 'validations' || section == 'patches') && fs.existsSync(file_name)){
                  console.error(`Warning: ${file_name} already exist and shell be redacted manually`);
              }else{
                  generateSection(section, opts, file_name)
                      .then( () => {
                          console.log(file_name + ' written successfully!');
                      });
              }
        });
        //generateAssociationsMigrations(opts, dir_write);
      }else if(opts.storageType === 'webservice' || opts.storageType === 'cenz_server' || opts.storageType === 'distributed-data-model'){
          let file_name = "";
          file_name = dir_write + '/schemas/' + opts.nameLc + '.js';
          generateSection("schemas",opts,file_name).then( ()=>{
            console.log(file_name + ' written successfully!');
          });

          if(opts.storageType === 'webservice'){
            file_name = dir_write + '/models-webservice/' + opts.nameLc + '.js';
            generateSection("models-webservice",opts,file_name).then( ()=>{
              console.log(file_name + ' written successfully!(from webservice)');
            });
          }else if(opts.storageType === 'cenz_server'){
            file_name = dir_write + '/models-cenz-server/' + opts.nameLc + '.js';
            generateSection("models-cenz",opts,file_name).then( ()=>{
              console.log(file_name + ' written successfully!(from cenz server)');
            });
          }else if(opts.storageType === 'distributed-data-model'){
            file_name = dir_write + '/models-distributed/' + opts.nameLc + '.js';
            generateSection("distributed-model",opts,file_name).then( ()=>{
              console.log(file_name + ' written successfully!');
            });
          }
            if (opts.storageType === 'distributed-data-model') {
              file_name = dir_write + '/resolvers/' + opts.nameLc + '.js';
              generateSection("resolvers-ddm",opts,file_name).then( ()=>{
                console.log(file_name + ' written successfully!');
              });
            } else {
              file_name = dir_write + '/resolvers/' + opts.nameLc + '.js';
              generateSection("resolvers",opts,file_name).then( ()=>{
              console.log(file_name + ' written successfully!');
            });
            }
            

      }else if(opts.storageType === 'cenzontle-web-service-adapter'){
        let file_name = dir_write + '/adapters/' + opts.adapterName + '.js';
        generateSection("cenz-adapters",opts,file_name).then( ()=>{
          console.log(file_name + ' written successfully!');
        });
      }
    }
  });

  let index_resolvers_file = dir_write + '/resolvers/index.js';
  generateSection('resolvers-index',{models: models} ,index_resolvers_file)
  .then( () => {
    console.log('resolvers-index written successfully!');
  });

  writeCommons(dir_write);
};
