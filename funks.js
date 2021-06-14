let fs = require("fs");
const ejs = require("ejs");
const inflection = require("inflection");
const jsb = require("js-beautify").js_beautify;
const { join, parse } = require("path");
const { promisify } = require("util");
const ejsRenderFile = promisify(ejs.renderFile);
const stringify_obj = require("stringify-object");
const colors = require("colors/safe");
const { getModelDatabase } = require("./lib/generators-aux");

/**
 * parseFile - Parse a json file
 *
 * @param  {string} jFile path wher json file is stored
 * @return {object}       json file converted to js object
 */
parseFile = function (jFile) {
  let data = null;
  let words = null;

  //read
  try {
    data = fs.readFileSync(jFile, "utf8");
  } catch (e) {
    //msg
    console.log(
      colors.red("! Error:"),
      "Reading JSON model definition file:",
      colors.dim(jFile)
    );
    console.log(colors.red("! Error name: " + e.name + ":"), e.message);
    throw new Error(e);
  }

  //parse
  try {
    words = JSON.parse(data);
  } catch (e) {
    //msg
    console.log(
      colors.red("! Error:"),
      "Parsing JSON model definition file:",
      colors.dim(jFile)
    );
    console.log(colors.red("! Error name: " + e.name + ":"), e.message);
    throw new Error(e);
  }
  return words;
};

/**
 * isEmptyObject - Determines if an object is empty
 *
 * @param  {object} obj Object to check if is empty
 * @return {boolean}     False if 'obj' has at least one entry, true if the object is empty.
 */
isEmptyObject = function (obj) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
};

/**
 * uncapitalizeString - set initial character to lower case
 *
 * @param  {string} word String input to uncapitalize
 * @return {string}      String with lower case in the initial character
 */
uncapitalizeString = function (word) {
  let length = word.length;
  if (length == 1) {
    return word.toLowerCase();
  } else {
    return word.slice(0, 1).toLowerCase() + word.slice(1, length);
  }
};

/**
 * capitalizeString - set initial character to upper case
 *
 * @param  {type} word String input to capitalize
 * @return {type}      String with upper case in the initial character
 */
capitalizeString = function (word) {
  let length = word.length;
  if (length == 1) {
    return word.toUpperCase();
  } else {
    return word.slice(0, 1).toUpperCase() + word.slice(1, length);
  }
};

/**
 * generateJs - Generate the Javascript code (GraphQL-schema/resolvers/Sequelize-model) using EJS templates
 *
 * @param  {string} templateName Name of the template to use
 * @param  {object} options      Options that the template will use
 * @return {string}              String of created file with specified template
 */
module.exports.generateJs = async function (templateName, options) {
  let renderedStr = await ejsRenderFile(
    __dirname + "/views/" + templateName + ".ejs",
    options,
    {}
  );
  let prettyStr = jsb(renderedStr);
  return prettyStr;
};

/**
 * attributesToString - Convert object attributes to a string separating by dots the key and value and by comma each attribute.
 *
 * @param  {object} attributes Object attributes to convert
 * @return {string}            Converted object into a single string
 */
attributesToString = function (attributes) {
  let str_attributes = "";
  if (attributes === "undefined" || isEmptyObject(attributes))
    return str_attributes;

  for (key in attributes) {
    str_attributes += key + ": " + attributes[key] + ", ";
  }

  return str_attributes.slice(0, -2);
};

/**
 * attributesToJsonSchemaProperties - Convert object attributes to JSON-Schema
 * properties. See http://json-schema.org
 *
 * @param  {object} attributes Object attributes to convert
 * @return {object}            The generated JSON-Schema properties
 */
attributesToJsonSchemaProperties = function (attributes) {
  let jsonSchemaProps = Object.assign({}, attributes);
  let arrayType = [
    "[String]",
    "[Int]",
    "[Float]",
    "[Boolean]",
    "[Date]",
    "[Time]",
    "[DateTime]",
  ];

  for (key in jsonSchemaProps) {
    if (jsonSchemaProps[key] === "String") {
      jsonSchemaProps[key] = {
        type: ["string", "null"],
      };
    } else if (jsonSchemaProps[key] === "Int") {
      jsonSchemaProps[key] = {
        type: ["integer", "null"],
      };
    } else if (jsonSchemaProps[key] === "Float") {
      jsonSchemaProps[key] = {
        type: ["number", "null"],
      };
    } else if (jsonSchemaProps[key] === "Boolean") {
      jsonSchemaProps[key] = {
        type: ["boolean", "null"],
      };
    } else if (jsonSchemaProps[key] === "Date") {
      jsonSchemaProps[key] = {
        anyOf: [{ isoDate: true }, { type: "null" }],
      };
    } else if (jsonSchemaProps[key] === "Time") {
      jsonSchemaProps[key] = {
        anyOf: [{ isoTime: true }, { type: "null" }],
      };
    } else if (jsonSchemaProps[key] === "DateTime") {
      jsonSchemaProps[key] = {
        anyOf: [{ isoDateTime: true }, { type: "null" }],
      };
    } else if (jsonSchemaProps[key] === "uuid") {
      jsonSchemaProps[key] = {
        type: ["uuid", "null"],
      };
    } else if (arrayType.includes(jsonSchemaProps[key])) {
      jsonSchemaProps[key] = {
        type: ["array", "null"],
      };
    } else {
      throw new Error(`Unsupported attribute type: ${jsonSchemaProps[key]}`);
    }
  }

  return jsonSchemaProps;
};

/**
 * attributesArrayString - Get all attributes of type string
 *
 * @param  {object} attributes Object containing the attributes to parse
 * @return {array}            Array of string containing only the name of the attributes which type is "string"
 */
attributesArrayString = function (attributes) {
  let array_attributes = ["id"];

  for (key in attributes) {
    if (attributes[key] === "String") {
      array_attributes.push(key);
    }
  }

  return array_attributes;
};

/**
 * getOnlyTypeAttributes - Creates an object which keys are the attributes and the value its type and also removes all spaces from both,
 *                          the type and the attribute itself
 *
 * @param  {object} attributes Object containing the attributes to parse
 * @return {object}            Object simplified, all values are strings indicating the attribute's type.
 */
getOnlyTypeAttributes = function (attributes) {
  let only_type = {};

  for (key in attributes) {
    let key_no_spaces = key.replace(/\s+/g, "");

    if (
      attributes[key] &&
      typeof attributes[key] === "object" &&
      attributes[key].constructor === Object
    ) {
      only_type[key_no_spaces] = attributes[key].type.replace(/\s+/g, "");
    } else if (
      typeof attributes[key] === "string" ||
      attributes[key] instanceof String
    ) {
      only_type[key_no_spaces] = attributes[key].replace(/\s+/g, "");
    }
  }

  return only_type;
};

/**
 * getOnlyDescriptionAttributes - Creates an object which keys are the attributes and the value its description
 *
 * @param  {type} attributes Object containing the attributes to parse
 * @return {type}            Object simplified, all values are strings indicating the attribute's description.
 */
getOnlyDescriptionAttributes = function (attributes) {
  let only_description = {};

  for (key in attributes) {
    let key_no_spaces = key.replace(/\s+/g, "");

    if (
      attributes[key] &&
      typeof attributes[key] === "object" &&
      attributes[key].constructor === Object
    ) {
      only_description[key_no_spaces] = attributes[key].description || "";
    } else if (
      typeof attributes[key] === "string" ||
      attributes[key] instanceof String
    ) {
      only_description[key_no_spaces] = "";
    }
  }

  return only_description;
};

getCassandraType = function (type) {
  switch (type.toLowerCase()) {
    case "string":
      return "text";
    case "integer":
    case "int":
      return "int";
    case "id":
      return "uuid";
    case "datetime":
      return "timestamp";
    default:
      return type;
  }
};

getOnlyCassandraTypeAttributes = function (attributes, idAttribute) {
  let only_type = {};

  for (key in attributes) {
    if (key == idAttribute) {
      continue;
    }
    if (
      attributes[key] &&
      typeof attributes[key] === "object" &&
      attributes[key].constructor === Object
    ) {
      only_type[key] = attributes[key].type;
    } else if (
      typeof attributes[key] === "string" ||
      attributes[key] instanceof String
    ) {
      only_type[key] = getCassandraType(attributes[key]);
    }
  }

  return only_type;
};

getCassandraAttributesType = function (
  attributes,
  idAttribute,
  editableAttributes
) {
  let only_type = {};
  for (key in attributes) {
    if (key == idAttribute) {
      continue;
    }
    if (attributes[key].includes("[")) {
      let arrType = attributes[key].replace(/\[|\]/gi, "");
      if (editableAttributes[key]) {
        only_type[key] = `list <${getCassandraType(arrType)}>`;
      } else {
        only_type[key] = `set <${getCassandraType(arrType)}>`;
      }
    } else {
      only_type[key] = getCassandraType(attributes[key]);
    }
  }
  return only_type;
};

/**
 * writeSchemaCommons - Writes a 'commons.js' file into the given directory. This file contains
 * general parts of the graphql schema that are common for all models.
 *
 * @param  {string} dir_write Path of the directory where to create the commons.js file
 */
writeSchemaCommons = function (dir_write) {
  let commons = `module.exports = \`

  enum InputType{
    Array
    String
    Int
    Float
    Boolean
    Date
    Time
    DateTime
  }

  enum Operator{
    like
    notLike
    or
    and
    eq
    between
    notBetween
    in
    notIn
    gt
    gte
    lt
    lte
    ne
    regexp
    notRegexp
    contains
    contained
    not
    all
  }
  
  enum CassandraOperator{
    eq
    lt
    gt
    lte
    gte
    in
    contains   # CONTAINS
    ctk    # CONTAINS KEY
    tgt    # Token > Token
    tget   # Token >= Token
    and
  }

  enum Order{
    DESC
    ASC
  }

  input paginationInput{
    limit: Int!
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

  try {
    let file_name = dir_write + "/schemas/" + "commons.js";

    fs.writeFileSync(file_name, commons);
    //success
    console.log(
      "@@@ File:",
      colors.dim(file_name),
      colors.green("written successfully!")
    );
  } catch (e) {
    //error
    console.log("@@@ Error:", colors.dim(file_name), colors.red("error"));
    console.log(e);
    throw e;
  }
};

writeIndexResolvers = async function (dir_write, models) {
  //set file name
  let file_name = dir_write + "/resolvers/index.js";
  //generate
  await generateSection("resolvers-index", { models: models }, file_name)
    .then(() => {
      //success
      console.log(
        "@@@ File:",
        colors.dim(file_name),
        colors.green("written successfully!")
      );
    })
    .catch((e) => {
      //error
      console.log("@@@ Error:", colors.dim(file_name), colors.red("error"));
      console.log(e);
      throw e;
    });
};

writeAcls = async function (dir_write, models, adapters) {
  //set file name
  let file_name = dir_write + "/acl_rules.js";
  //set names
  const modelsNames = models.map((item) => item[0]);
  let adminModelsNames = ["role", "user", "role_to_user"];
  //generate
  await generateSection(
    "acl_rules",
    { models: modelsNames, adminModels: adminModelsNames, adapters },
    file_name
  )
    .then(() => {
      //success
      console.log(
        "@@@ File:",
        colors.dim(file_name),
        colors.green("written successfully!")
      );
    })
    .catch((e) => {
      //error
      console.log("@@@ Error:", colors.dim(file_name), colors.red("error"));
      console.log(e);
      throw e;
    });
};

/**
 * convertToType - Generate a string correspondant to the model type as needed for graphql schema.
 *
 * @param  {boolean} many       True if the field type in the schema corresponds to an array, false otherwise.
 * @param  {type} model_name Name of the model.
 * @return {string}            String indicating array or only the model name.
 */
convertToType = function (many, model_name) {
  if (many) {
    return "[ " + model_name + " ]";
  }

  return model_name;
};

/**
 * getIndefiniteArticle - Generate the (uncapitalized) indefinite article that belongs to a given name.
 *
 * @param {string} name - The name that this article is to be used with
 * @return {string} The indefinite article
 */
getIndefiniteArticle = function (name) {
  let vowelRegex = "^[aeiouAEIOU].*";
  if (name.match(vowelRegex)) {
    return "an";
  } else {
    return "a";
  }
};

/**
 * getStringAttributesInCassandraSchema - Get all String attributes in a model regardless of capitalization.
 * @param {object} attributes - The attributes of the schema
 * @return {Array<string>} The string attributes in an array
 */
getStringAttributesInCassandraSchema = function (attributes) {
  let res = [];
  for (key in attributes) {
    let attr = attributes[key];
    if (typeof attr != "string") {
      //assume a description object
      if (attr["type"].toUpperCase() === "STRING") {
        res.push(`'${key}'`);
      }
    } else if (attr.toUpperCase() === "STRING") {
      res.push(`'${key}'`);
    }
  }
  return res;
};

/**
 * getOptions - Creates object with all extra info and with all data model info.
 *
 * @param  {object} dataModel object created from a json file containing data model info.
 * @return {object}           Object with all extra info that will be needed to create files with templates.
 */
module.exports.getOptions = function (dataModel) {
  let opts = {
    name: dataModel.model,
    nameCp: capitalizeString(dataModel.model),
    storageType: getStorageType(dataModel),
    database: getModelDatabase(dataModel),
    table: inflection.pluralize(uncapitalizeString(dataModel.model)),
    nameLc: uncapitalizeString(dataModel.model),
    namePl: inflection.pluralize(uncapitalizeString(dataModel.model)),
    namePlCp: inflection.pluralize(capitalizeString(dataModel.model)),
    attributes: getOnlyTypeAttributes(dataModel.attributes),
    cassandraAttributes: getOnlyCassandraTypeAttributes(
      getOnlyTypeAttributes(dataModel.attributes),
      getIdAttribute(dataModel)
    ),
    jsonSchemaProperties: attributesToJsonSchemaProperties(
      getOnlyTypeAttributes(dataModel.attributes)
    ),
    associationsArguments: module.exports.parseAssociations(dataModel),
    arrayAttributeString: attributesArrayString(
      getOnlyTypeAttributes(dataModel.attributes)
    ),
    indices: dataModel.indices,
    definitionObj: dataModel,
    attributesDescription: getOnlyDescriptionAttributes(dataModel.attributes),
    url: dataModel.url || "",
    externalIds: dataModel.externalIds || [],
    regex: dataModel.regex || "",
    adapterName: uncapitalizeString(dataModel.adapterName || ""),
    registry: dataModel.registry || [],
    idAttribute: getIdAttribute(dataModel),
    indefiniteArticle: getIndefiniteArticle(dataModel.model),
    indefiniteArticleCp: capitalizeString(
      getIndefiniteArticle(dataModel.model)
    ),
    cassandraRestrictions: dataModel.cassandraRestrictions,
    cassandraStringAttributes: getStringAttributesInCassandraSchema(
      dataModel.attributes
    ),
  };
  opts["editableAttributesStr"] = attributesToString(
    getEditableAttributes(
      opts.attributes,
      getEditableAssociations(opts.associationsArguments),
      getIdAttribute(dataModel)
    )
  );
  opts["editableAttributes"] = getEditableAttributes(
    opts.attributes,
    getEditableAssociations(opts.associationsArguments),
    getIdAttribute(dataModel)
  );
  opts["editableCassandraAttributes"] = getEditableAttributes(
    opts.cassandraAttributes,
    getEditableAssociations(opts.associationsArguments),
    getIdAttribute(dataModel)
  );
  opts["cassandraAttributesWithConvertedTypes"] = getCassandraAttributesType(
    opts.attributes,
    opts["idAttribute"],
    opts["editableAttributes"]
  );
  opts["idAttributeType"] =
    dataModel.internalId === undefined
      ? "Int"
      : opts.attributes[opts.idAttribute];
  opts["cassandraIdAttributeType"] = getCassandraType(
    dataModel.internalId === undefined
      ? "Int"
      : opts.attributes[opts.idAttribute]
  );
  opts["defaultId"] = dataModel.internalId === undefined ? true : false;
  dataModel["id"] = {
    name: opts.idAttribute,
    type: opts.idAttributeType,
  };

  opts["definition"] = stringify_obj(dataModel);
  delete opts.attributes[opts.idAttribute];
  return opts;
};

/**
 * validateJsonFile - Does semantic validations on model options object 'opts' (EJS options).
 *
 * @param  {object} opts    Object with EJS options.
 * @return {object}         Object 'pass' status & existing errors array.
 */
validateJsonFile = function (opts) {
  let check = {
    pass: true,
    errors: [],
    warnings: [],
  };

  //check: validate external ids declare in attributes
  opts.externalIds.forEach((x) => {
    if (
      !opts.attributes.hasOwnProperty(x) ||
      !(
        opts.attributes[x] === "String" ||
        opts.attributes[x] === "Float" ||
        opts.attributes[x] === "Int"
      )
    ) {
      //error
      check.pass = false;
      check.errors.push(
        `ERROR: External id "${x}" has not been declared in the attributes of model ${opts.name} or is not of one of the allowed types: String, Int or Float`
      );
    }
  });

  //check: validate if to_one assoc with foreignKey in target model exists
  //       Warn user that validation e.g. unique constraint needs to be added
  opts.associationsArguments["to_one"].forEach((assoc) => {
    if (assoc.holdsForeignKey === false) {
      check.warnings.push(
        `WARNING: ${assoc.name} is a to_one associations with the foreignKey in ${assoc.target}. Be sure to validate uniqueness`
      );
    }
  });

  return check;
};

getEditableAssociations = function (associations) {
  let editableAssociations = [];
  associations["to_one"].forEach((association) => {
    if (association.keyIn !== association.target) {
      editableAssociations.push(association);
    }
  });

  //for cases many to many through foreignKey array
  associations["to_many"].forEach((association) => {
    if (association.keyIn !== association.target) {
      editableAssociations.push(association);
    }
  });

  return editableAssociations;
};

getEditableAttributes = function (
  attributes,
  parsedAssocForeignKeys,
  idAttribute
) {
  let editable_attributes = {};
  let target_keys = parsedAssocForeignKeys.map((assoc) => {
    if (assoc.reverseAssociationType) return assoc.sourceKey;
    return assoc.targetKey;
  });
  for (let attrib in attributes) {
    if (!target_keys.includes(attrib) && attrib !== idAttribute) {
      editable_attributes[attrib] = attributes[attrib];
    }
  }
  return editable_attributes;
};

/**
 * parseAssociations - Parse associations of a given data model.
 * Classification of associations will be accordingly to the type of association and storage type of target model.
 *
 * @param  {object} dataModel Data model definition
 * @return {object}           Object containing explicit information needed for generating files with templates.
 */
module.exports.parseAssociations = function (dataModel) {
  let associations = dataModel.associations;
  associations_info = {
    schema_attributes: {
      many: {},
      one: {},
      generic_one: {},
      generic_many: {},
    },
    //"mutations_attributes" : {},
    to_one: [],
    to_many: [],
    to_many_through_sql_cross_table: [],
    generic_to_one: [],
    generic_to_many: [],
    foreignKeyAssociations: {},
    associations: [],
    genericAssociations: [],
  };
  if (associations !== undefined) {
    Object.entries(associations).forEach(([name, association]) => {
      let type = association.type;
      let holdsTheForeignKey = false;
      let assocThroughArray = false;
      let isStandardAssociation =
        association.type !== "generic_to_many" &&
        association.type !== "generic_to_one";

      //push association
      if (isStandardAssociation) {
        //standard
        associations_info.associations.push(association);
        association.targetStorageType =
          association.targetStorageType.toLowerCase();
        associations_info.foreignKeyAssociations[name] = association.targetKey;
      } else {
        //generic
        associations_info.genericAssociations.push(association);
      }

      //if(associations_type["many"].includes(association.type) )
      if (association.type === "to_many") {
        //associations_info.schema_attributes["many"][name] = [ association.target, capitalizeString(association.target), capitalizeString(inflection.pluralize(association.target))];
        associations_info.schema_attributes["many"][name] = [
          association.target,
          capitalizeString(association.target),
          capitalizeString(name),
        ];
        if (association.reverseAssociationType === "to_many") {
          assocThroughArray = true;
        }
        //}else if(associations_type["one"].includes(association.type))
      } else if (association.type === "to_one") {
        associations_info.schema_attributes["one"][name] = [
          association.target,
          capitalizeString(association.target),
          capitalizeString(name),
        ];
        if (association.keyIn === dataModel.model) {
          holdsTheForeignKey = true;
        }
      } else if (association.type === "to_many_through_sql_cross_table") {
        if (
          association.sourceKey === undefined ||
          association.keysIn === undefined ||
          association.targetStorageType !== "sql"
        ) {
          console.error(
            colors.red(
              `ERROR: to_many_through_sql_cross_table only allowed for relational database types with well defined cross-table`
            )
          );
        }
        associations_info.schema_attributes["many"][name] = [
          association.target,
          capitalizeString(association.target),
          capitalizeString(name),
        ];
      } else if (association.type === "generic_to_one") {
        associations_info.schema_attributes["generic_one"][name] = [
          association.target,
          capitalizeString(association.target),
          capitalizeString(name),
        ];
      } else if (association.type === "generic_to_many") {
        associations_info.schema_attributes["generic_many"][name] = [
          association.target,
          capitalizeString(association.target),
          capitalizeString(name),
        ];
      } else {
        console.error(
          colors.red("Association type " + association.type + " not supported.")
        );
      }

      let assoc = Object.assign({}, association);
      //push association
      if (isStandardAssociation) {
        //standard
        assoc["name"] = name;
        assoc["name_lc"] = uncapitalizeString(name);
        assoc["name_cp"] = capitalizeString(name);
        assoc["target_lc"] = uncapitalizeString(association.target);
        assoc["target_lc_pl"] = inflection.pluralize(
          uncapitalizeString(association.target)
        );
        assoc["target_pl"] = inflection.pluralize(association.target);
        assoc["target_cp"] = capitalizeString(association.target); //inflection.capitalize(association.target);
        assoc["target_cp_pl"] = capitalizeString(
          inflection.pluralize(association.target)
        ); //inflection.capitalize(inflection.pluralize(association.target));
        assoc["targetKey"] = association.targetKey;
        assoc["targetKey_cp"] = capitalizeString(association.targetKey);
        if (association.keyIn) {
          assoc["keyIn_lc"] = uncapitalizeString(association.keyIn);
        }
        assoc["holdsForeignKey"] = holdsTheForeignKey;
        assoc["assocThroughArray"] = assocThroughArray;
      } else {
        //generic
        assoc["name"] = name;
        assoc["name_lc"] = uncapitalizeString(name);
        assoc["name_cp"] = capitalizeString(name);
        assoc["target_lc"] = uncapitalizeString(association.target);
        assoc["target_lc_pl"] = inflection.pluralize(
          uncapitalizeString(association.target)
        );
        assoc["target_pl"] = inflection.pluralize(association.target);
        assoc["target_cp"] = capitalizeString(association.target); //inflection.capitalize(association.target);
        assoc["target_cp_pl"] = capitalizeString(
          inflection.pluralize(association.target)
        ); //inflection.capitalize(inflection.pluralize(association.target));
      }

      associations_info[type].push(assoc);
      //associations_info[type].push(assoc);
    });
  }
  associations_info.mutations_attributes = attributesToString(
    associations_info.mutations_attributes
  );
  return associations_info;
};

/**
 * generateAssociationsMigrations - Create files for migrations of associations between models. It could be either
 * creating a new column or creating a through table.
 *
 * @param  {object} opts      Object with options required for the template that creates migrations.
 * @param  {string} dir_write Path where the the file will be written.
 */
generateAssociationsMigrations = function (opts, dir_write) {
  // opts.associations.belongsTo.forEach( async (assoc) =>{
  //     if(assoc.targetStorageType === 'sql'){
  //       assoc["source"] = opts.table;
  //       assoc["cross"] = false;
  //       let generatedMigration = await module.exports.generateJs('create-association-migration',assoc);
  //       let name_migration = createNameMigration(dir_write, '', 'z-column-'+assoc.targetKey+'-to-'+opts.table);
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

  opts.associations.belongsToMany.forEach(async (assoc) => {
    if (assoc.targetStorageType === "sql") {
      assoc["source"] = opts.table;
      let generatedMigration = await module.exports.generateJs(
        "create-through-migration",
        assoc
      );
      let name_migration = createNameMigration(
        dir_write,
        "",
        "z-through-" + assoc.keysIn
      );
      fs.writeFile(name_migration, generatedMigration, function (err) {
        if (err) {
          return console.log(err);
        } else {
          console.log(name_migration + " writen succesfully!");
        }
      });
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
createNameMigration = function (rootDir, migrationsDir, model_name) {
  let date = new Date();
  date = date
    .toISOString()
    .slice(0, 19)
    .replace(/[^0-9]/g, "");
  //return dir_write + '/migrations/' + date + '-create-'+model_name +'.js';
  return join(rootDir, migrationsDir, `${date}-${model_name}.js`);
};

/**
 * generateSection - Writes a file which contains a generated section. Each seaction has its own template.
 *
 * @param  {string} section   Name of section that will be generated (i.e. schemas, models, migrations, resolvers)
 * @param  {object} opts      Object with options needed for the template that will generate the section
 * @param  {string} dir_write Path (including name of the file) where the generated section will be written as a file.
 */
generateSection = async function (section, opts, filePath) {
  let generatedSection = await module.exports.generateJs(
    "create-" + section,
    opts
  );

  const parsedPath = parse(filePath);
  if (!fs.existsSync(parsedPath.dir)) {
    fs.mkdirSync(parsedPath.dir);
  }

  fs.writeFileSync(filePath, generatedSection);
};

/**
 * generateSections - Receives an array of sections, and for each one invokes generateSection() after handling
 * particular sections checks.
 *
 * @param  {array} sections     Array of sections that will be generated; each section is an object with 'dir' and 'template' keys.
 * @param  {object} opts        Object with options needed for the template that will generate the section.
 * @param  {string} dir_write   Path (including name of the file) where the generated section will be written as a file.
 */
generateSections = async function (sections, opts, dir_write) {
  /**
   * For each section (dir and template), set the output file name,
   * and do an additional existence check for validations and patches.
   */
  for (let i = 0; i < sections.length; i++) {
    let section = sections[i];
    let file_name = "";

    switch (section.template) {
      //schemas
      case "schemas":
      case "schemas-ddm":
      //resolvers
      case "resolvers":
      case "resolvers-ddm":
      case "resolvers-generic":
      //models
      case "models":
      case "models-zendro":
      case "distributed-model":
      case "models-generic":
      case "models-cassandra":
      case "models-mongodb":
      case "models-amazonS3":
      case "models-trino":
      case "models-neo4j":
      //adapters
      case "sql-adapter":
      case "zendro-adapters":
      case "generic-adapter":
      case "cassandra-adapter":
      case "mongodb-adapter":
      case "amazonS3-adapter":
      case "trino-adapter":
      case "neo4j-adapter":
        file_name =
          dir_write + "/" + section.dir + "/" + section.fileName + ".js";
        break;
      //migrations
      case "migrations":
      case "migrations-cassandra":
        file_name = createNameMigration(
          dir_write,
          section.dir,
          section.fileName
        );
        break;
      //validations & patches
      case "validations":
      case "patches":
        //set file name
        file_name =
          dir_write + "/" + section.dir + "/" + section.fileName + ".js";
        //check
        if (fs.existsSync(file_name)) {
          console.log(
            "@@@ File:",
            colors.dim(file_name),
            colors.yellow("not written"),
            "- already exist and shall be redacted manually"
          );
          continue;
        }
        break;

      default:
        continue;
    }

    //generate
    await generateSection(section.template, opts, file_name)
      .then(() => {
        //success
        console.log(
          "@@@ File:",
          colors.dim(file_name),
          colors.green("written successfully!")
        );
      })
      .catch((e) => {
        //error
        console.log("@@@ Error:", colors.dim(file_name), colors.red("error"));
        console.log(e);
        throw e;
      });
  }
};

/**
 * writeCommons - Write static files
 *
 * @param  {string} dir_write directory where code is being generated.
 * @param  {array}  models arrays of entries of the form [opts.name , opts.namePl].
 * @param  {array}  adapters array of adapter name strings.
 */
writeCommons = async function (dir_write, models, adapters) {
  writeSchemaCommons(dir_write);
  console.log(path.join(dir_write, "models"));
  await writeIndexResolvers(dir_write, models);
  await writeAcls(dir_write, models, adapters);
};

getIdAttribute = function (dataModel) {
  return dataModel.internalId === undefined ? "id" : dataModel.internalId;
};

getStorageType = function (dataModel) {
  let valid = true;

  /**
   * Checks for 'storageType'.
   */
  //check 'storageType' existence
  if (!dataModel.hasOwnProperty("storageType")) {
    valid = false;
    console.error(
      colors.red(
        `ERROR: 'storageType' is a mandatory field, but has not been declared in the attributes of model '${dataModel.dataModel.model}'`
      )
    );
  } else {
    //check 'storageType' type
    if (!dataModel.storageType || typeof dataModel.storageType !== "string") {
      valid = false;
      console.error(
        colors.red(`ERROR: 'storageType' field must be a non-empty string.`)
      );
    } else {
      //check for valid storageType
      switch (dataModel.storageType.toLowerCase()) {
        //models
        case "sql":
        case "distributed-data-model":
        case "zendro-server":
        case "generic":
        case "cassandra":
        case "mongodb":
        case "amazon-s3":
        case "trino":
        case "presto":
        case "neo4j":
        //adapters
        case "sql-adapter":
        case "ddm-adapter":
        case "zendro-webservice-adapter":
        case "generic-adapter":
        case "cassandra-adapter":
        case "mongodb-adapter":
        case "amazon-s3-adapter":
        case "trino-adapter":
        case "presto-adapter":
        case "neo4j-adapter":
          //ok
          break;

        default:
          //not ok
          valid = false;
          console.error(
            colors.red(
              `ERROR: The attribute 'storageType' has an invalid value. \n
              One of the following types is expected: [sql, distributed-data-model, 
                zendro-server, generic, sql-adapter, ddm-adapter, zendro-webservice-adapter, generic-adapter,
                cassandra, mongodb, amazon-s3, trino, presto, neo4j, cassandra-adapter, mongodb-adapter,
                amazon-s3-adapter, trino-adapter, presto-adapter, neo4j-adapter].
                 But '${dataModel.storageType}' was obtained on ${
                dataModel.adapterName !== undefined ? "adapter" : "model"
              } '${
                dataModel.adapterName !== undefined
                  ? dataModel.adapterName
                  : dataModel.model
              }'.`
            )
          );
          break;
      }
    }
  }

  if (valid) {
    return dataModel.storageType.toLowerCase();
  } else {
    return "";
  }
};

/**
 * generateCode - Given a set of json files, describing each of them a data model, this
 * functions generate the code for a graphql server that will handle CRUD operations.
 * The generated code consists of four sections: sequelize models, migrations, resolvers and
 * graphql schemas.
 *
 * @param  {string} json_dir  Directory where the json files are stored.
 * @param  {string} dir_write Directory where the generated code will be written.
 * @param  {object} options   Object with additional options.
 */
module.exports.generateCode = async function (json_dir, dir_write, options) {
  let sectionsDirsA = [
    "schemas",
    "resolvers",
    "models",
    "migrations",
    "validations",
    "patches",
  ];
  let sectionsDirsB = [
    "models/sql",
    "models/zendro-server",
    "models/adapters",
    "models/distributed",
    "models/generic",
    "models/cassandra",
    "models/mongodb",
    "models/amazonS3",
    "models/trino",
    "models/presto",
    "models/neo4j",
  ];
  let models = [];
  let adapters = [];
  let attributes_schema = {};
  let summary_associations = { "one-many": [], "many-many": {} };
  //set output dir
  dir_write = dir_write === undefined ? __dirname : dir_write;
  //msg
  console.log(
    colors.white(
      "\n@ Starting code generation in: \n",
      colors.dim(path.resolve(dir_write))
    ),
    "\n"
  );
  //op: verbose, migrations
  let verbose =
    options &&
    typeof options === "object" &&
    typeof options.verbose === "boolean"
      ? options.verbose
      : false;
  let migrations = options.migrations;
  /**
   * Create sections dirs
   */
  //msg
  if (verbose)
    console.log(colors.white("\n@@ Creating required directories..."));
  sectionsDirsA.concat(sectionsDirsB).forEach((section) => {
    let dir = dir_write + "/" + section;
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir);
        //msg
        if (verbose) console.log("@@@ dir created: ", colors.dim(dir));
      } catch (e) {
        //err
        console.log(
          colors.red("! mkdir.error: "),
          "A problem occured while trying to create a required directory, please ensure you have the sufficient privileges to create directories and that you have a recent version of NodeJS"
        );
        console.log(colors.red("!@ mkdir.error: "), e);
        console.log(colors.red("done"));
        process.exit(1);
      }
    } else {
      //msg
      if (verbose) console.log("@@@ dir already exists: ", colors.dim(dir));
    }
  });
  //msg
  if (verbose) console.log("@@ ", colors.green("done"));

  let totalFiles = 0;
  let totalExcludedFiles = 0;
  let totalWrongFiles = 0; //errors on reading or parsing
  let totalWrongModels = 0; //semantic errors
  let totalGenErrors = 0; //errors in codegen process
  let totalModelsWithWarnings = 0; //warnings in codegen process

  /**
   * Processes each JSON file on input directory.
   */
  let json_files = fs.readdirSync(json_dir);
  for (let i = 0; i < json_files.length; i++) {
    let json_file = json_files[i];
    let file_to_object = null;
    totalFiles++;

    //msg
    console.log("@@ Reading file... ", colors.blue(json_file));

    //Parse JSON file
    try {
      file_to_object = parseFile(json_dir + "/" + json_file);
      //check
      if (file_to_object === null) {
        totalExcludedFiles++;
        continue;
      }
    } catch (e) {
      //msg
      console.log(e);
      console.log(
        "@@@ File:",
        colors.blue(json_file),
        colors.yellow("excluded")
      );
      totalExcludedFiles++;
      continue;
    }

    //Do semantic validations on JSON object
    //to do...

    //Get options
    let opts = {};
    try {
      opts = module.exports.getOptions(file_to_object);
    } catch (e) {
      //error msg
      console.log(e);
      console.log(
        "@@@ File:",
        colors.blue(json_file),
        colors.yellow("excluded")
      );
      totalWrongModels++;
      totalExcludedFiles++;
      continue;
    }

    //Do semantic validations on opts
    let check = validateJsonFile(opts);
    if (!check.pass) {
      totalWrongModels++;
      totalExcludedFiles++;

      //error msg
      console.log("@@@ Error on model: ", colors.blue(json_file));
      check.errors.forEach((error) => {
        //err
        console.log("@@@", colors.red(error));
      });
      console.log(
        "@@@ File:",
        colors.blue(json_file),
        colors.yellow("excluded")
      );
      continue;
    } else {
      //valid model
      //check for Warnings
      if (check.warnings.length > 0) {
        totalModelsWithWarnings++;
        check.warnings.forEach((warning) => {
          //Warnings
          console.log("@@@", colors.yellow(warning));
        });
        console.log(
          "@@@ File:",
          colors.blue(json_file),
          colors.yellow("processed with WARNINGS")
        );
      }
      //done
    }

    /**
     * Generate code
     */
    //msg
    console.log(
      "@@ Generating code for model... ",
      colors.blue(opts.name),
      "-",
      colors.dim(opts.storageType)
    );

    //set sections
    let sections = []; //schemas, resolvers, models, migrations, validations, patches
    const migrationsDir = join("migrations", opts.database);
    switch (opts.storageType) {
      case "sql":
        sections = [
          { dir: "schemas", template: "schemas", fileName: opts.nameLc },
          { dir: "resolvers", template: "resolvers", fileName: opts.nameLc },
          { dir: "models/sql", template: "models", fileName: opts.nameLc },
          {
            dir: "validations",
            template: "validations",
            fileName: opts.nameLc,
          },
          { dir: "patches", template: "patches", fileName: opts.nameLc },
        ];
        if (migrations) {
          sections.push({
            dir: migrationsDir,
            template: "migrations",
            fileName: opts.nameLc,
          });
        }
        break;

      case "zendro-server":
        sections = [
          { dir: "schemas", template: "schemas", fileName: opts.nameLc },
          { dir: "resolvers", template: "resolvers", fileName: opts.nameLc },
          {
            dir: "models/zendro-server",
            template: "models-zendro",
            fileName: opts.nameLc,
          },
          {
            dir: "validations",
            template: "validations",
            fileName: opts.nameLc,
          },
          { dir: "patches", template: "patches", fileName: opts.nameLc },
        ];
        break;

      case "distributed-data-model":
        sections = [
          { dir: "schemas", template: "schemas-ddm", fileName: opts.nameLc },
          {
            dir: "resolvers",
            template: "resolvers-ddm",
            fileName: opts.nameLc,
          },
          {
            dir: "models/distributed",
            template: "distributed-model",
            fileName: opts.nameLc,
          },
          {
            dir: "validations",
            template: "validations",
            fileName: opts.nameLc,
          },
        ];
        break;

      case "generic":
        sections = [
          { dir: "schemas", template: "schemas", fileName: opts.nameLc },
          { dir: "resolvers", template: "resolvers", fileName: opts.nameLc },
          {
            dir: "models/generic",
            template: "models-generic",
            fileName: opts.nameLc,
          },
          {
            dir: "validations",
            template: "validations",
            fileName: opts.nameLc,
          },
          { dir: "patches", template: "patches", fileName: opts.nameLc },
        ];
        break;

      case "mongodb":
        sections = [
          { dir: "schemas", template: "schemas", fileName: opts.nameLc },
          { dir: "resolvers", template: "resolvers", fileName: opts.nameLc },
          {
            dir: "models/mongodb",
            template: "models-mongodb",
            fileName: opts.nameLc,
          },
          {
            dir: "validations",
            template: "validations",
            fileName: opts.nameLc,
          },
          { dir: "patches", template: "patches", fileName: opts.nameLc },
        ];
        break;

      case "cassandra":
        sections = [
          { dir: "schemas", template: "schemas", fileName: opts.nameLc },
          { dir: "resolvers", template: "resolvers", fileName: opts.nameLc },
          {
            dir: "models/cassandra",
            template: "models-cassandra",
            fileName: opts.nameLc,
          },
          {
            dir: "validations",
            template: "validations",
            fileName: opts.nameLc,
          },
          { dir: "patches", template: "patches", fileName: opts.nameLc },
        ];
        if (migrations) {
          sections.push({
            dir: migrationsDir,
            template: "migrations-cassandra",
            fileName: opts.nameLc,
          });
        }

        break;

      case "amazon-s3":
        sections = [
          { dir: "schemas", template: "schemas", fileName: opts.nameLc },
          { dir: "resolvers", template: "resolvers", fileName: opts.nameLc },
          {
            dir: "models/amazonS3",
            template: "models-amazonS3",
            fileName: opts.nameLc,
          },
          {
            dir: "validations",
            template: "validations",
            fileName: opts.nameLc,
          },
          { dir: "patches", template: "patches", fileName: opts.nameLc },
        ];
        break;

      case "trino":
        sections = [
          { dir: "schemas", template: "schemas", fileName: opts.nameLc },
          { dir: "resolvers", template: "resolvers", fileName: opts.nameLc },
          {
            dir: "models/trino",
            template: "models-trino",
            fileName: opts.nameLc,
          },
          {
            dir: "validations",
            template: "validations",
            fileName: opts.nameLc,
          },
          { dir: "patches", template: "patches", fileName: opts.nameLc },
        ];
        break;

      case "presto":
        sections = [
          { dir: "schemas", template: "schemas", fileName: opts.nameLc },
          { dir: "resolvers", template: "resolvers", fileName: opts.nameLc },
          {
            dir: "models/presto",
            template: "models-trino",
            fileName: opts.nameLc,
          },
          {
            dir: "validations",
            template: "validations",
            fileName: opts.nameLc,
          },
          { dir: "patches", template: "patches", fileName: opts.nameLc },
        ];
        break;

      case "neo4j":
        sections = [
          { dir: "schemas", template: "schemas", fileName: opts.nameLc },
          { dir: "resolvers", template: "resolvers", fileName: opts.nameLc },
          {
            dir: "models/neo4j",
            template: "models-neo4j",
            fileName: opts.nameLc,
          },
          {
            dir: "validations",
            template: "validations",
            fileName: opts.nameLc,
          },
          { dir: "patches", template: "patches", fileName: opts.nameLc },
        ];
        break;

      case "zendro-webservice-adapter":
        sections = [
          {
            dir: "models/adapters",
            template: "zendro-adapters",
            fileName: opts.adapterName,
          },
          { dir: "patches", template: "patches", fileName: opts.adapterName },
        ];
        break;

      case "ddm-adapter":
        sections = [
          {
            dir: "models/adapters",
            template: "zendro-adapters",
            fileName: opts.adapterName,
          },
          { dir: "patches", template: "patches", fileName: opts.adapterName },
        ];
        break;

      case "sql-adapter":
        sections = [
          {
            dir: "models/adapters",
            template: "sql-adapter",
            fileName: opts.adapterName,
          },
          { dir: migrationsDir, template: "migrations", fileName: opts.nameLc },
          { dir: "patches", template: "patches", fileName: opts.adapterName },
        ];
        break;

      case "generic-adapter":
        sections = [
          {
            dir: "models/adapters",
            template: "generic-adapter",
            fileName: opts.adapterName,
          },
          { dir: "patches", template: "patches", fileName: opts.adapterName },
        ];
        break;

      case "mongodb-adapter":
        sections = [
          {
            dir: "models/adapters",
            template: "mongodb-adapter",
            fileName: opts.adapterName,
          },
          { dir: "patches", template: "patches", fileName: opts.adapterName },
        ];
        break;

      case "cassandra-adapter":
        sections = [
          {
            dir: "models/adapters",
            template: "cassandra-adapter",
            fileName: opts.adapterName,
          },
          {
            dir: migrationsDir,
            template: "migrations-cassandra",
            fileName: opts.nameLc,
          },
          { dir: "patches", template: "patches", fileName: opts.adapterName },
        ];
        break;

      case "amazon-s3-adapter":
        sections = [
          {
            dir: "models/adapters",
            template: "amazonS3-adapter",
            fileName: opts.adapterName,
          },
          { dir: "patches", template: "patches", fileName: opts.adapterName },
        ];
        break;

      case "trino-adapter":
        sections = [
          {
            dir: "models/adapters",
            template: "trino-adapter",
            fileName: opts.adapterName,
          },
          { dir: "patches", template: "patches", fileName: opts.adapterName },
        ];
        break;

      case "presto-adapter":
        sections = [
          {
            dir: "models/adapters",
            template: "trino-adapter",
            fileName: opts.adapterName,
          },
          { dir: "patches", template: "patches", fileName: opts.adapterName },
        ];
        break;

      case "neo4j-adapter":
        sections = [
          {
            dir: "models/adapters",
            template: "neo4j-adapter",
            fileName: opts.adapterName,
          },
          { dir: "patches", template: "patches", fileName: opts.adapterName },
        ];
        break;

      default:
        break;
    }

    //generate sections
    await generateSections(sections, opts, dir_write)
      .then(() => {
        //success
        //msg
        console.log("@@ ", colors.green("done"));
      })
      .catch((e) => {
        //error
        //msg
        console.log("@@ ", colors.red("done"));
        totalGenErrors++;
      });

    //save data for writeCommons
    //adapters
    if (
      [
        "zendro-webservice-adapter",
        "ddm-adapter",
        "sql-adapter",
        "generic-adapter",
        "mongodb-adapter",
        "cassandra-adapter",
        "amazon-s3-adapter",
        "trino-adapter",
        "presto-adapter",
      ].includes(opts.storageType)
    ) {
      adapters.push(opts.adapterName);
    } else {
      models.push([opts.name, opts.namePl, opts.nameLc]);
    }
  }
  //msg
  console.log("@@ Generating code for... ", colors.blue("commons & index's"));
  //generate commons & index's
  await writeCommons(dir_write, models, adapters)
    .then(() => {
      //success
      //msg
      console.log("@@ ", colors.green("done"));
    })
    .catch((e) => {
      //error
      //msg
      console.log("@@ ", colors.red("done"));
      totalGenErrors++;
    });

  //Final report
  //msg
  console.log("\n@@ Total JSON files processed: ", colors.blue(totalFiles));
  //msg
  console.log(
    "@@ Total JSON files excluded: ",
    totalExcludedFiles > 0
      ? colors.yellow(totalExcludedFiles)
      : colors.green(totalExcludedFiles)
  );
  //msg
  console.log(
    "@@ Total codegen errors: ",
    totalGenErrors > 0
      ? colors.red(totalGenErrors)
      : colors.green(totalGenErrors)
  );
  //msg
  if (verbose)
    console.log(
      "@@ Total models with Warnings: ",
      totalModelsWithWarnings > 0
        ? colors.yellow(totalModelsWithWarnings)
        : colors.green(totalModelsWithWarnings)
    );
  //msg
  if (verbose)
    console.log(
      "@@ Total JSON files with errors: ",
      totalWrongFiles > 0
        ? colors.red(totalWrongFiles)
        : colors.green(totalWrongFiles)
    );
  //msg
  if (verbose)
    console.log(
      "@@ Total models with errors: ",
      totalWrongModels > 0
        ? colors.red(totalWrongModels)
        : colors.green(totalWrongModels)
    );

  //msg
  console.log(
    colors.white("@ Code generation..."),
    totalWrongModels > 0 || totalGenErrors > 0
      ? colors.red("done")
      : colors.green("done")
  );
};
