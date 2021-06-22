const expect = require("chai").expect;
const assert = require("chai").assert;
//const test = require('./unit_test_misc/data_test');
const models = require("./unit_test_misc/data_models");
const funks = require("../funks");
const models_generic_webservice = require("./unit_test_misc/data_models_generic_webservice");
const models_zendro = require("./unit_test_misc/data_models_zendro");
const models_distributed = require("./unit_test_misc/data_models_distributed");
const models_refactoring = require("./unit_test_misc/data_models_refactoring");
const models_generic = require("./unit_test_misc/data_models_generic");
const models_cassandra = require("./unit_test_misc/data_models_cassandra");
const models_mongodb = require("./unit_test_misc/data_models_mongodb");
const models_amazonS3 = require("./unit_test_misc/data_models_amazonS3");
const models_trino = require("./unit_test_misc/data_models_trino");
const models_neo4j = require("./unit_test_misc/data_models_neo4j");
const requireFromString = require("require-from-string");
const helpers = require("./unit_test_misc/helpers/reporting_helpers");
const { test } = require("mocha");
//const components_code = require('./unit_test_misc/components_code');
var colors = require("colors");

const testCompare = function (
  actual,
  expected,
  errorMessage = "Generated output differs from expected"
) {
  let act = actual.replace(/\s/g, "");
  let exp = expected.replace(/\s/g, "");
  try {
    expect(act, errorMessage).to.have.string(exp);
  } catch (e) {
    report = helpers.diffByLine(actual, expected);
    assert.fail(errorMessage + ":\n" + report);
  }
};

describe("Lower-case models", function () {
  let data_test = require("./unit_test_misc/test-describe/lower-case-models");

  it("Check correct queries and mutations in GraphQL Schema - transcript_count", async function () {
    let opts = funks.getOptions(models.transcript_count);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    let test_schema = data_test.transcript_count_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema").to.have.string(test_schema);
  });

  it("Check correct association name in resolver - individual", async function () {
    let opts = funks.getOptions(models.individual);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, "");
    let test_resolvers = data_test.individual_resolvers_association.replace(
      /\s/g,
      ""
    );
    expect(g_resolvers, "Incorrect resolver").to.have.string(test_resolvers);
  });

  it("Check correct attributes and associations in model - individual", async function () {
    let opts = funks.getOptions(models.individual);
    let generated_model = await funks.generateJs("create-models", opts);
    let g_model = generated_model.replace(/\s/g, "");

    let test_model_attributes = data_test.individual_model_attributes.replace(
      /\s/g,
      ""
    );
    expect(g_model, "Incorrect model").to.have.string(test_model_attributes);

    let test_model_associations =
      data_test.individual_model_associations.replace(/\s/g, "");
    expect(g_model, "Incorrect model").to.have.string(test_model_associations);
  });
});

describe("Empty associations", function () {
  let data_test = require("./unit_test_misc/test-describe/empty-association");

  it("Check correct queries and mutations in GraphQL Schema - transcript_count (no assoc)", async function () {
    let opts = funks.getOptions(models.transcript_count_no_assoc);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    let test_schema = data_test.transcript_count_no_assoc_schema.replace(
      /\s/g,
      ""
    );
    expect(g_schema, "Incorrect schema").to.have.string(test_schema);
  });

  it("Check no association in resolvers - individual (no assoc)", async function () {
    let opts = funks.getOptions(models.individual_no_assoc);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, "");
    let test_resolvers = data_test.individual_no_assoc_resolvers.replace(
      /\s/g,
      ""
    );
    expect(g_resolvers, "Incorrect resolvers").to.have.string(test_resolvers);
  });

  it("Check no associations in model - transcript_count (no assoc)", async function () {
    let opts = funks.getOptions(models.transcript_count_no_assoc);
    let generated_model = await funks.generateJs("create-models", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.transcript_count_no_assoc_model.replace(
      /\s/g,
      ""
    );
    expect(g_model, "Incorrect model").to.have.string(test_model);
  });
});

describe("Better name for search argument", function () {
  let data_test = require("./unit_test_misc/test-describe/better-name-search-arg");

  it("Check search argument in GraphQL Schema - researcher", async function () {
    let opts = funks.getOptions(models.researcher);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    let test_schema = data_test.researcher_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema").to.have.string(test_schema);
  });

  it("Check search argument in resolvers - researcher", async function () {
    let opts = funks.getOptions(models.researcher);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, "");
    let test_resolvers = data_test.researcher_resolver.replace(/\s/g, "");
    expect(g_resolvers, "Incorrect resolvers").to.have.string(test_resolvers);
  });
});

describe("Count functionality", function () {
  let data_test = require("./unit_test_misc/test-describe/count-functionality");
  it("GraphQL Schema - individual", async function () {
    let opts = funks.getOptions(models.individual);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    let test_schema = data_test.individual_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema").to.have.string(test_schema);
  });

  it("Resolvers - individual", async function () {
    let opts = funks.getOptions(models.individual);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, "");
    let test_resolvers = data_test.individual_resolvers.replace(/\s/g, "");
    expect(g_resolvers, "Incorrect resolvers").to.have.string(test_resolvers);
  });

  it("Resolvers - specie", async function () {
    let opts = funks.getOptions(models.specie);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, "");
    let test_resolvers = data_test.specie_resolvers.replace(/\s/g, "");
    expect(g_resolvers, "Incorrect resolvers").to.have.string(test_resolvers);
  });
});

describe("VueTable - tableTemplate", function () {
  let data_test = require("./unit_test_misc/test-describe/vuetable-template");
  it("GraphQL Schema - book", async function () {
    let opts = funks.getOptions(models.book);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    let test_schema = data_test.book_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema").to.have.string(test_schema);
  });

  it("Resolvers - book", async function () {
    let opts = funks.getOptions(models.book);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, "");
    let test_resolvers = data_test.book_resolvers.replace(/\s/g, "");
    expect(g_resolvers, "Incorrect resolvers").to.have.string(test_resolvers);
  });
});

describe("Associations in query and resolvers", function () {
  let data_test = require("./unit_test_misc/test-describe/associations-in-query-and-resolver");
  it("GraphQL Schema - person", async function () {
    let opts = funks.getOptions(models.person);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    let test_schema = data_test.person_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema").to.have.string(test_schema);
  });

  it("Models - person", async function () {
    let opts = funks.getOptions(models.person);
    let generated_model = await funks.generateJs("create-models", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.person_model.replace(/\s/g, "");
    expect(g_model, "Incorrect model").to.have.string(test_model);
  });
});

describe("Stream upload file", function () {
  let data_test = require("./unit_test_misc/test-describe/stream-upload-file");
  it("Resolver - dog", async function () {
    let opts = funks.getOptions(models.dog);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, "");
    let test_resolvers = data_test.dog_resolvers.replace(/\s/g, "");
    expect(g_resolvers).to.have.string(test_resolvers);
  });
});

describe("Migrations", function () {
  let data_test = require("./unit_test_misc/test-describe/migrations");

  it("Migration - Person", async function () {
    let opts = funks.getOptions(models.person_indices);
    let generated_resolvers = await funks.generateJs("create-migrations", opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, "");
    let test_resolvers = data_test.person_indices_migration.replace(/\s/g, "");
    expect(g_resolvers).to.have.string(test_resolvers);
  });

  it("Migration - Array", async () => {
    let opts = funks.getOptions(models.arr);
    let generated_model = await funks.generateJs("create-migrations", opts);
    testCompare(generated_model, data_test.arr_migration);
  });
});

describe("Model naming cases ", function () {
  let data_test = require("./unit_test_misc/test-describe/model-naming-cases");
  it("Resolvers - aminoAcidSequence", async function () {
    let opts = funks.getOptions(models.aminoAcidSequence);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    testCompare(generated_resolvers, data_test.resolvers_webservice_aminoAcid);
  });

  it("GraphQL Schema - aminoAcidSequence", async function () {
    let opts = funks.getOptions(models.aminoAcidSequence);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    let test_schema = data_test.schema_webservice_aminoAcid.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema").to.have.string(test_schema);
  });

  it("Model - aminoAcidSequence", async function () {
    let opts = funks.getOptions(models.aminoAcidSequence);
    let generated_model = await funks.generateJs("create-models-generic", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.model_webservice_aminoAcid.replace(/\s/g, "");
    expect(g_model, "Incorrect model").to.have.string(test_model);
  });

  it("Resolvers - inDiVIdual", async function () {
    let opts = funks.getOptions(models.inDiVIdual_camelcase);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, "");
    let test_resolvers = data_test.individual_resolvers_camelcase.replace(
      /\s/g,
      ""
    );
    expect(g_resolvers).to.have.string(test_resolvers);
  });

  it("GraphQL Schema - inDiVIdual", async function () {
    let opts = funks.getOptions(models.inDiVIdual_camelcase);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    let test_schema = data_test.individual_schema_camelcase.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema").to.have.string(test_schema);
  });

  it("Model - inDiVIdual", async function () {
    let opts = funks.getOptions(models.inDiVIdual_camelcase);
    let generated_model = await funks.generateJs("create-models", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.individual_model_camelcase.replace(/\s/g, "");
    expect(g_model, "Incorrect model").to.have.string(test_model);
  });

  it("GraphQL Schema - transcriptCount", async function () {
    let opts = funks.getOptions(models.transcriptCount_camelcase);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    let test_schema = data_test.transcriptCount_schema_camelcase.replace(
      /\s/g,
      ""
    );
    expect(g_schema, "Incorrect schema").to.have.string(test_schema);
  });

  it("Resolvers - transcriptCount", async function () {
    let opts = funks.getOptions(models.transcriptCount_indiv);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    testCompare(
      generated_resolvers,
      data_test.transcriptCount_resolvers_camelcase
    );
  });
});

describe("Association naming", function () {
  let data_test = require("./unit_test_misc/test-describe/association-naming");

  it("Resolvers - Dog", async function () {
    let opts = funks.getOptions(models.dog_owner);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    testCompare(generated_resolvers, data_test.dog_owner_resolvers);
  });

  it("GraphQL Schema - Dog", async function () {
    let opts = funks.getOptions(models.dog_owner);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    let test_schema = data_test.dog_owner_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema").to.have.string(test_schema);
  });

  it("Model - Dog", async function () {
    let opts = funks.getOptions(models.dog_owner);
    let generated_model = await funks.generateJs("create-models", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.dog_owner_model.replace(/\s/g, "");
    expect(g_model, "Incorrect model").to.have.string(test_model);
  });

  it("Resolvers - academicTeam", async function () {
    let opts = funks.getOptions(models.academicTeam);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, "");
    let test_resolvers = data_test.academicTeam_resolvers.replace(/\s/g, "");
    expect(g_resolvers).to.have.string(test_resolvers);
  });

  it("GraphQL Schema - academicTeam", async function () {
    let opts = funks.getOptions(models.academicTeam);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    let test_schema = data_test.academicTeam_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema").to.have.string(test_schema);
  });

  it("Model - academicTeam", async function () {
    let opts = funks.getOptions(models.academicTeam);
    let generated_model = await funks.generateJs("create-models", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.academicTeam_model.replace(/\s/g, "");
    expect(g_model, "Incorrect model").to.have.string(test_model);
  });
});

describe("Indices", function () {
  let data_test = require("./unit_test_misc/test-describe/indices");

  it("Migration - Person", async function () {
    let opts = funks.getOptions(models.person_indices);
    let generated_migration = await funks.generateJs("create-migrations", opts);
    let g_migration = generated_migration.replace(/\s/g, "");
    let test_migration = data_test.person_indices_migration.replace(/\s/g, "");
    expect(g_migration).to.have.string(test_migration);
  });

  it("Model - Person", async function () {
    let opts = funks.getOptions(models.person_indices);
    let generated_model = await funks.generateJs("create-models", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.person_indices_model.replace(/\s/g, "");
    expect(g_model, "Incorrect model").to.have.string(test_model);
  });
});

describe("Monkey patching templates", function () {
  let data_test = require("./unit_test_misc/test-describe/monkey-patching");

  it("Validation - transcriptCount_indiv", async function () {
    let opts = funks.getOptions(models.transcriptCount_indiv);
    let generated_validation = await funks.generateJs(
      "create-validations",
      opts
    );
    let g_validation = generated_validation.replace(/\s/g, "");
    let test_validation = data_test.transcriptCount_indiv_validation.replace(
      /\s/g,
      ""
    );
    expect(g_validation).to.have.string(test_validation);
  });

  it("Patch - dog_owner", async function () {
    let opts = funks.getOptions(models.dog_owner);
    let generated_patch = await funks.generateJs("create-patches", opts);
    let g_patch = generated_patch.replace(/\s/g, "");
    let test_patch = data_test.dog_owner_patch.replace(/\s/g, "");
    expect(g_patch).to.have.string(test_patch);
  });
});

describe("All webservice (generic) models", function () {
  let data_test = require("./unit_test_misc/test-describe/all-generic-webservice");

  it("GraphQL Schema - book", async function () {
    let opts = funks.getOptions(models_generic_webservice.book);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    let test_schema = data_test.schema_book.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema").to.have.string(test_schema);
  });

  it("Resolvers - book", async function () {
    let opts = funks.getOptions(models_generic_webservice.book);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    testCompare(generated_resolvers, data_test.resolvers_book);
  });

  it("Model - book", async function () {
    let opts = funks.getOptions(models_generic_webservice.book);
    let generated_model = await funks.generateJs("create-models-generic", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.model_book.replace(/\s/g, "");
    expect(g_model, "Incorrect model").to.have.string(test_model);
  });

  it("GraphQL Schema - person", async function () {
    let opts = funks.getOptions(models_generic_webservice.person);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    let test_schema = data_test.schema_person.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema").to.have.string(test_schema);
  });

  it("Resolvers - person", async function () {
    let opts = funks.getOptions(models_generic_webservice.person);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, "");
    let test_resolvers = data_test.resolvers_person.replace(/\s/g, "");
    expect(g_resolvers).to.have.string(test_resolvers);
  });

  it("Model - person", async function () {
    let opts = funks.getOptions(models_generic_webservice.person);
    let generated_model = await funks.generateJs("create-models-generic", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.model_person.replace(/\s/g, "");
    expect(g_model, "Incorrect model").to.have.string(test_model);
  });

  it("Model name class - person", async function () {
    let opts = funks.getOptions(models_generic_webservice.person);
    let generated_model = await funks.generateJs("create-models-generic", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.class_name_model_person.replace(/\s/g, "");
    expect(g_model, "Incorrect model").to.have.string(test_model);
  });
});

// describe('Model definition', function(){
//
//   it('Access local model definition property', async function(){
//     let opts = funks.getOptions(models.individual);
//     let generated_model =await funks.generateJs('create-models', opts);
//
//     // replace real Sequelize import with a plain object
//     let str = "const Sequelize = require('sequelize');";
//     generated_model = generated_model.replace(str, 'let Sequelize = {}; Sequelize.STRING = "";');
//
//     // pass fake connection into the module and get the model defined
//     let fake_sequelize = {};
//     fake_sequelize.define = function(a, b){ return b; };
//     let model = requireFromString(generated_model)(fake_sequelize);
//
//     // check any existing property of the 'individual' definition
//     expect(model.definition.associations.transcript_counts.type === "hasMany");
//   });
//
//   it('Access web-service model definition property', async function(){
//     let opts = funks.getOptions(models_generic_webservice.publisher);
//     let generated_model =await funks.generateJs('create-models-generic', opts);
//     let model = requireFromString(generated_model);
//
//     // check any existing property of the 'publisher' definition
//     expect(model.definition.associations.publications.target === 'book');
//   });
//
// });

describe("Implement date/time types", function () {
  let data_test = require("./unit_test_misc/test-describe/date-time");

  it("Model - Person", async function () {
    let opts = funks.getOptions(models.person_date);
    let generated_model = await funks.generateJs("create-models", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.person_date_model.replace(/\s/g, "");
    expect(g_model, "Incorrect model").to.have.string(test_model);
  });

  it("Schema - Person", async function () {
    let opts = funks.getOptions(models.person_date);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    let test_schema = data_test.person_date_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema").to.have.string(test_schema);
  });

  it("Migration - Person", async function () {
    let opts = funks.getOptions(models.person_date);
    let generated_migration = await funks.generateJs("create-migrations", opts);
    let g_migration = generated_migration.replace(/\s/g, "");
    let test_migration = data_test.person_date_migration.replace(/\s/g, "");
    expect(g_migration).to.have.string(test_migration);
  });

  it("Model - Academic Team", async function () {
    let opts = funks.getOptions(models.academic_Team);
    let generated_model = await funks.generateJs("create-models", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.academic_Team_model_time.replace(/\s/g, "");
    expect(g_model, "Incorrect model").to.have.string(test_model);
  });
});

describe("Update sequelize model to class", function () {
  let data_test = require("./unit_test_misc/test-describe/sequelize-model-class");
  it("Model init - Book", async function () {
    let opts = funks.getOptions(models.book_authors);
    let generated_model = await funks.generateJs("create-models", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.book_model_init.replace(/\s/g, "");
    expect(g_model, "Incorrect model").to.have.string(test_model);
  });

  it("Model init - Array", async () => {
    let opts = funks.getOptions(models.arr);
    let generated_model = await funks.generateJs("create-models", opts);
    testCompare(generated_model, data_test.array_model_init);
  });

  it("Model storage handler - Book", async function () {
    let opts = funks.getOptions(models.book_authors);
    let generated_model = await funks.generateJs("create-models", opts);
    testCompare(generated_model, data_test.book_model_storage_handler);
  });

  it("Model associations - Book", async function () {
    let opts = funks.getOptions(models.book_authors);
    let generated_model = await funks.generateJs("create-models", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.book_model_associations.replace(/\s/g, "");
    expect(g_model, "Incorrect model").to.have.string(test_model);
  });

  it("Model read by id - Book", async function () {
    let opts = funks.getOptions(models.book_authors);
    let generated_model = await funks.generateJs("create-models", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.book_model_read_by_id.replace(/\s/g, "");
    expect(g_model, "Incorrect model").to.have.string(test_model);
  });
});

describe("Model Layer", function () {
  let data_test = require("./unit_test_misc/test-describe/model-layer");
  it("Count method in sequelize model - individual", async function () {
    let opts = funks.getOptions(models.individual);
    let generated_model = await funks.generateJs("create-models", opts);
    testCompare(generated_model, data_test.count_in_sequelize_model);
  });

  it("Model - publisher", async function () {
    let opts = funks.getOptions(models_generic_webservice.publisher);
    let generated_model = await funks.generateJs("create-models-generic", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.count_in_webservice_model.replace(/\s/g, "");
    expect(g_model, "No count method found").to.have.string(test_model);
  });

  it("Count resolver - dog", async function () {
    let opts = funks.getOptions(models.dog);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, "");
    let test_resolver = data_test.count_in_resolvers.replace(/\s/g, "");
    expect(g_resolvers, "No count method found").to.have.string(test_resolver);
  });

  it("Read all model - dog", async function () {
    let opts = funks.getOptions(models.dog);
    let generated_model = await funks.generateJs("create-models", opts);
    testCompare(generated_model, data_test.read_all);
  });

  it("Read all resolver - dog", async function () {
    let opts = funks.getOptions(models.dog);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, "");
    let test_resolver = data_test.read_all_resolver.replace(/\s/g, "");
    expect(g_resolvers, "No read all method found").to.have.string(
      test_resolver
    );
  });

  it("Add one model - book", async function () {
    let opts = funks.getOptions(models.book_authors);
    let generated_model = await funks.generateJs("create-models", opts);
    testCompare(generated_model, data_test.add_one_model);
  });

  it("Add one resolver - book", async function () {
    let opts = funks.getOptions(models.book_authors);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, "");
    let test_resolver = data_test.add_one_resolver.replace(/\s/g, "");
    expect(g_resolvers, "No add one method found").to.have.string(
      test_resolver
    );
  });

  it("Delete one model - book", async function () {
    let opts = funks.getOptions(models.book_authors);
    let generated_model = await funks.generateJs("create-models", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.delete_one_model.replace(/\s/g, "");
    expect(g_model, "No add one method found").to.have.string(test_model);
  });

  it("Delete one resolver - book", async function () {
    let opts = funks.getOptions(models.book_authors);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, "");
    let test_resolver = data_test.delete_one_resolver.replace(/\s/g, "");
    expect(g_resolvers, "No add one method found").to.have.string(
      test_resolver
    );
  });

  it("Update one model - book", async function () {
    let opts = funks.getOptions(models.book_authors);
    let generated_model = await funks.generateJs("create-models", opts);
    testCompare(generated_model, data_test.update_one_model);
    // let g_model = generated_model.replace(/\s/g, '');
    // let test_model = data_test.update_one_model.replace(/\s/g, '');
    // expect(g_model, 'No add one method found').to.have.string(test_model);
  });

  it("Update one resolver - book", async function () {
    let opts = funks.getOptions(models.book_authors);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, "");
    let test_resolver = data_test.update_one_resolver.replace(/\s/g, "");
    expect(g_resolvers, "No add one method found").to.have.string(
      test_resolver
    );
  });

  it("Bulk Add model - book", async function () {
    let opts = funks.getOptions(models.book_authors);
    let generated_model = await funks.generateJs("create-models", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.bulk_add_model.replace(/\s/g, "");
    expect(g_model, "No add one method found").to.have.string(test_model);
  });

  it("Bulk Add resolver - book", async function () {
    let opts = funks.getOptions(models.book_authors);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, "");
    let test_resolver = data_test.bulk_add_resolver.replace(/\s/g, "");
    expect(g_resolvers, "No add one method found").to.have.string(
      test_resolver
    );
  });

  it("Table template model - individual", async function () {
    let opts = funks.getOptions(models.individual);
    let generated_model = await funks.generateJs("create-models", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.table_template_model.replace(/\s/g, "");
    expect(g_model, "No add one method found").to.have.string(test_model);
  });

  it("Table template resolver - individual", async function () {
    let opts = funks.getOptions(models.individual);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, "");
    let test_resolver = data_test.table_template_resolver.replace(/\s/g, "");
    expect(g_resolvers, "No add one method found").to.have.string(
      test_resolver
    );
  });
});

describe("Decouple association from resolvers", function () {
  let data_test = require("./unit_test_misc/test-describe/decouple-associations");

  // Check for changes!
  it("BelongsTo implementation in model - dog", async function () {
    let opts = funks.getOptions(models.dog);
    let generated_model = await funks.generateJs("create-models", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.belongsTo_model.replace(/\s/g, "");
    expect(g_model, "No method found").to.have.string(test_model);
  });

  it("BelongsTo implementation in resolver - dog", async function () {
    let opts = funks.getOptions(models.dog);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    testCompare(generated_resolvers, data_test.belongsTo_resolver);
  });

  it("HasOne implementation in resolver - researcher", async function () {
    let opts = funks.getOptions(models.researcher);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    testCompare(generated_resolvers, data_test.hasOne_resolver);
  });

  it("BelongsTo implementation in schema - dog", async function () {
    let opts = funks.getOptions(models.dog);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    let test_schema = data_test.belongsTo_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema").to.have.string(test_schema);
  });

  it("HasOne implementation in schema - researcher", async function () {
    let opts = funks.getOptions(models.researcher);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    let test_schema = data_test.hasOne_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema").to.have.string(test_schema);
  });

  it("HasMany implementation in model - individual", async function () {
    let opts = funks.getOptions(models.individual);
    let generated_model = await funks.generateJs("create-models", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.hasMany_model.replace(/\s/g, "");
    expect(g_model, "No method found").to.have.string(test_model);
  });

  it("HasMany implementation in resolver - individual", async function () {
    let opts = funks.getOptions(models.individual);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, "");
    let test_resolver = data_test.hasMany_resolver.replace(/\s/g, "");
    expect(g_resolvers, "No method found").to.have.string(test_resolver);
  });

  it("Count (association) implementation in model - individual", async function () {
    let opts = funks.getOptions(models.individual);
    let generated_model = await funks.generateJs("create-models", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.countAssociated_model.replace(/\s/g, "");
    expect(g_model, "No method found").to.have.string(test_model);
  });

  it("HasMany (association) implementation in resolver - individual", async function () {
    let opts = funks.getOptions(models.individual);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, "");
    let test_resolver = data_test.countAssociated_resolver.replace(/\s/g, "");
    expect(g_resolvers, "No method found").to.have.string(test_resolver);
  });

  it("BelongsToMany implementation in model - book", async function () {
    let opts = funks.getOptions(models.book_authors);
    let generated_model = await funks.generateJs("create-models", opts);
    testCompare(generated_model, data_test.belongsToMany_model);
  });

  it("BelongsToMany implementation in model count - book", async function () {
    let opts = funks.getOptions(models.book_authors);
    let generated_model = await funks.generateJs("create-models", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.belongsToMany_model_count.replace(/\s/g, "");
    expect(g_model, "No method found").to.have.string(test_model);
  });

  it("BelongsToMany implementation in resolver - book", async function () {
    let opts = funks.getOptions(models.book_authors);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    testCompare(generated_resolvers, data_test.belongsToMany_resolver);
  });

  it("BelongsToMany count implementation in resolver - book", async function () {
    let opts = funks.getOptions(models.book_authors);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, "");
    let test_resolver = data_test.belongsToMany_resolver_count.replace(
      /\s/g,
      ""
    );
    expect(g_resolvers, "No method found").to.have.string(test_resolver);
  });
});

describe("Description for attributes", function () {
  let data_test = require("./unit_test_misc/test-describe/description-attributes");
  it("Description in schema - person", async function () {
    let opts = funks.getOptions(models.person_description);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    let test_schema = data_test.person_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema").to.have.string(test_schema);
  });

  it("Optional description in object type - person", async function () {
    let opts = funks.getOptions(models.person_description_optional);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    let test_schema = data_test.person_schema_description_optional.replace(
      /\s/g,
      ""
    );
    expect(g_schema, "Incorrect schema").to.have.string(test_schema);
  });
});

describe("Zendro servers", function () {
  let data_test = require("./unit_test_misc/test-describe/zendro-servers");

  it("Set url  - book", async function () {
    let opts = funks.getOptions(models_zendro.book);
    let generated_model = await funks.generateJs("create-models-zendro", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.server_url.replace(/\s/g, "");
    expect(g_model, "No method found").to.have.string(test_model);
  });

  it("Read by id  - book", async function () {
    let opts = funks.getOptions(models_zendro.book);
    let generated_model = await funks.generateJs("create-models-zendro", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.read_by_id.replace(/\s/g, "");
    expect(g_model, "No method found").to.have.string(test_model);
  });

  it("Read all  - book", async function () {
    let opts = funks.getOptions(models_zendro.book);
    let generated_model = await funks.generateJs("create-models-zendro", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.read_all.replace(/\s/g, "");
    expect(g_model, "No method found").to.have.string(test_model);
  });

  it("Count Records  - book", async function () {
    let opts = funks.getOptions(models_zendro.book);
    let generated_model = await funks.generateJs("create-models-zendro", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.count_records.replace(/\s/g, "");
    expect(g_model, "No method found").to.have.string(test_model);
  });

  it("AddOne  - book", async function () {
    let opts = funks.getOptions(models_zendro.book);
    let generated_model = await funks.generateJs("create-models-zendro", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.add_one.replace(/\s/g, "");
    expect(g_model, "No method found").to.have.string(test_model);
  });

  it("Delete by id  - book", async function () {
    let opts = funks.getOptions(models_zendro.book);
    let generated_model = await funks.generateJs("create-models-zendro", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.delete_by_id.replace(/\s/g, "");
    expect(g_model, "No method found").to.have.string(test_model);
  });

  it("UpdateOne  - book", async function () {
    let opts = funks.getOptions(models_zendro.book);
    let generated_model = await funks.generateJs("create-models-zendro", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.update_one.replace(/\s/g, "");
    expect(g_model, "No method found").to.have.string(test_model);
  });

  it("csvTemplate  - book", async function () {
    let opts = funks.getOptions(models_zendro.book);
    let generated_model = await funks.generateJs("create-models-zendro", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.csv_template.replace(/\s/g, "");
    expect(g_model, "No method found").to.have.string(test_model);
  });

  it("bulkAddCsv  - book", async function () {
    let opts = funks.getOptions(models_zendro.book);
    let generated_model = await funks.generateJs("create-models-zendro", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.bulk_add_csv.replace(/\s/g, "");
    expect(g_model, "No method found").to.have.string(test_model);
  });

  // Check for changes!
  it("Many to many association  - person", async function () {
    let opts = funks.getOptions(models_zendro.person);
    let generated_model = await funks.generateJs("create-models-zendro", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.many_to_many_association.replace(/\s/g, "");
    expect(g_model, "No method found").to.have.string(test_model);
  });

  // Check for changes!
  it("Many to many count association  - person", async function () {
    let opts = funks.getOptions(models_zendro.person);
    let generated_model = await funks.generateJs("create-models-zendro", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.many_to_many_association_count.replace(
      /\s/g,
      ""
    );
    expect(g_model, "No method found").to.have.string(test_model);
  });

  it("add_personId - Dog", async function () {
    let opts = funks.getOptions(models_zendro.dog_one_assoc);
    let generated_model = await funks.generateJs("create-models-zendro", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.add_personId.replace(/\s/g, "");
    expect(g_model, "No method found").to.have.string(test_model);
  });

  it("remove_personId - Dog", async function () {
    let opts = funks.getOptions(models_zendro.dog_one_assoc);
    let generated_model = await funks.generateJs("create-models-zendro", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.remove_personId.replace(/\s/g, "");
    expect(g_model, "No method found").to.have.string(test_model);
  });
});

describe("Cursor based pagination", function () {
  let data_test = require("./unit_test_misc/test-describe/cursor-based-pagination");
  it("Type connection - book", async function () {
    let opts = funks.getOptions(models.book);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    let test_schema = data_test.connection_book_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema").to.have.string(test_schema);
  });

  it("Connection query - book", async function () {
    let opts = funks.getOptions(models.book);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    let test_schema = data_test.connection_book_query.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema").to.have.string(test_schema);
  });

  it("Connection read all resolver - book", async function () {
    let opts = funks.getOptions(models.book);
    let generated_resolver = await funks.generateJs("create-resolvers", opts);
    testCompare(generated_resolver, data_test.resolver_read_all_connection);
  });

  it("Connection read all model - book", async function () {
    let opts = funks.getOptions(models.book);
    let generated_model = await funks.generateJs("create-models", opts);
    testCompare(generated_model, data_test.model_read_all_connection);
  });

  it("Association connection query - person", async function () {
    let opts = funks.getOptions(models.person);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    let test_schema = data_test.schema_to_many_association.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema").to.have.string(test_schema);
  });

  it("Association connection resolver - person", async function () {
    let opts = funks.getOptions(models.person);
    let generated_resolver = await funks.generateJs("create-resolvers", opts);
    testCompare(generated_resolver, data_test.resolver_to_many_association);
  });

  it("Many-to-many connection model - person", async function () {
    let opts = funks.getOptions(models.person);
    let generated_model = await funks.generateJs("create-models", opts);
    testCompare(generated_model, data_test.model_many_to_many_association);
  });

  it("Read all connection in zendro server  - book", async function () {
    let opts = funks.getOptions(models_zendro.book);
    let generated_model = await funks.generateJs("create-models-zendro", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.read_all_zendro_server.replace(/\s/g, "");
    expect(g_model, "No method found").to.have.string(test_model);
  });

  // Check for changes!
  it("Many to many association connection in zendro server  - person-book", async function () {
    let opts = funks.getOptions(models_zendro.person);
    let generated_model = await funks.generateJs("create-models-zendro", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model =
      data_test.many_to_many_association_connection_zendro_server.replace(
        /\s/g,
        ""
      );
    expect(g_model, "No method found").to.have.string(test_model);
  });
});

describe("Distributed data models", function () {
  let data_test = require("./unit_test_misc/test-describe/distributed-models");
  it("ReadById adapter- book", async function () {
    let opts = funks.getOptions(models_distributed.book);
    let generated_adapter = await funks.generateJs(
      "create-zendro-adapters",
      opts
    );
    let g_adapter = generated_adapter.replace(/\s/g, "");
    let test_adapter = data_test.book_adapter_readById.replace(/\s/g, "");
    expect(g_adapter, "Incorrect adapter").to.have.string(test_adapter);
  });

  it("Count Records adapter- book", async function () {
    let opts = funks.getOptions(models_distributed.book);
    let generated_adapter = await funks.generateJs(
      "create-zendro-adapters",
      opts
    );
    let g_adapter = generated_adapter.replace(/\s/g, "");
    let test_adapter = data_test.book_adapter_count.replace(/\s/g, "");
    expect(g_adapter, "Incorrect adapter").to.have.string(test_adapter);
  });

  it("Read All Records adapter- book", async function () {
    let opts = funks.getOptions(models_distributed.book);
    let generated_adapter = await funks.generateJs(
      "create-zendro-adapters",
      opts
    );
    testCompare(generated_adapter, data_test.book_adapter_read_all);
  });

  it("Registry distributed data model- book", async function () {
    let opts = funks.getOptions(models_distributed.book_ddm);
    let generated_adapter = await funks.generateJs(
      "create-distributed-model",
      opts
    );
    let g_adapter = generated_adapter.replace(/\s/g, "");
    let test_adapter = data_test.book_ddm_registry.replace(/\s/g, "");
    expect(g_adapter, "Incorrect distributed data model").to.have.string(
      test_adapter
    );
  });

  it("ReadById distributed data model- book", async function () {
    let opts = funks.getOptions(models_distributed.book_ddm);
    let generated_adapter = await funks.generateJs(
      "create-distributed-model",
      opts
    );
    let g_adapter = generated_adapter.replace(/\s/g, "");
    let test_adapter = data_test.book_ddm_readById.replace(/\s/g, "");
    expect(g_adapter, "Incorrect distributed data model").to.have.string(
      test_adapter
    );
  });

  it("Count distributed data model- book", async function () {
    let opts = funks.getOptions(models_distributed.book_ddm);
    let generated_adapter = await funks.generateJs(
      "create-distributed-model",
      opts
    );
    testCompare(generated_adapter, data_test.book_ddm_count);
  });

  it("Read all distributed data model- book", async function () {
    let opts = funks.getOptions(models_distributed.book_ddm);
    let generated_adapter = await funks.generateJs(
      "create-distributed-model",
      opts
    );
    testCompare(generated_adapter, data_test.book_ddm_read_all);
  });

  // Check for changes!
  it("To-many association distributed data model- person", async function () {
    let opts = funks.getOptions(models_distributed.person_ddm);
    let generated_adapter = await funks.generateJs(
      "create-distributed-model",
      opts
    );
    let g_adapter = generated_adapter.replace(/\s/g, "");
    let test_adapter = data_test.person_ddm_many_association.replace(/\s/g, "");
    expect(g_adapter, "Incorrect distributed data model").to.have.string(
      test_adapter
    );
  });

  // Check for changes!
  it("To-one association distributed data model- dog", async function () {
    let opts = funks.getOptions(models_distributed.dog_ddm);
    let generated_adapter = await funks.generateJs(
      "create-distributed-model",
      opts
    );
    let g_adapter = generated_adapter.replace(/\s/g, "");
    let test_adapter = data_test.dog_ddm_one_association.replace(/\s/g, "");
    expect(g_adapter, "Incorrect distributed data model").to.have.string(
      test_adapter
    );
  });

  it("one-To-one association distributed resolver - Person", async function () {
    let opts = funks.getOptions(models_distributed.person_ddm);
    let generated_resolver = await funks.generateJs(
      "create-resolvers-ddm",
      opts
    );
    testCompare(generated_resolver, data_test.person_ddm_resolver_one_to_one);
  });
});

describe("To-one associations editing", function () {
  let data_test = require("./unit_test_misc/test-describe/to-one-assoc-edit");
  it("Associations in schema - dog", async function () {
    let opts = funks.getOptions(models.dog_one_assoc);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    let test_schema = data_test.dog_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema").to.have.string(test_schema);
  });

  it("AddOne with to-one association - person", async function () {
    let opts = funks.getOptions(models.person_one_assoc);
    let generated_model = await funks.generateJs("create-models", opts);
    testCompare(generated_model, data_test.person_addOne_model);
  });

  it("Update with to-one association - person", async function () {
    let opts = funks.getOptions(models.person_one_assoc);
    let generated_model = await funks.generateJs("create-models", opts);
    testCompare(generated_model, data_test.person_update_model);
  });
});

describe("External ids", function () {
  let data_test = require("./unit_test_misc/test-describe/external-ids");
  it("Migration externalIds - Person", async function () {
    let opts = funks.getOptions(models.person_externalIds);
    let generated_resolvers = await funks.generateJs("create-migrations", opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, "");
    let test_resolvers = data_test.person_externalIds_migration.replace(
      /\s/g,
      ""
    );
    expect(g_resolvers).to.have.string(test_resolvers);
  });

  it("Get array external ids - person", async function () {
    let opts = funks.getOptions(models.person_externalIds);
    let generated_model = await funks.generateJs("create-models", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.externalIdsArray.replace(/\s/g, "");
    expect(g_model, "No method found").to.have.string(test_model);
  });

  it("Get object external ids - person", async function () {
    let opts = funks.getOptions(models.person_externalIds);
    let generated_model = await funks.generateJs("create-models", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.externalIdsObject.replace(/\s/g, "");
    expect(g_model, "No method found").to.have.string(test_model);
  });
});

describe("Extend api model layer associations", function () {
  let data_test = require("./unit_test_misc/test-describe/extended-api-model-layer");

  it("Add to-one association foreign key in source", async function () {
    let opts = funks.getOptions(models.transcript_count);
    let generated_model = await funks.generateJs("create-models", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.to_add_individual.replace(/\s/g, "");
    expect(g_model, "No method found").to.have.string(test_model);
  });

  it("Remove to-one association foreign key in source", async function () {
    let opts = funks.getOptions(models.transcript_count);
    let generated_model = await funks.generateJs("create-models", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.remove_individual.replace(/\s/g, "");
    expect(g_model, "No method found").to.have.string(test_model);
  });
});

describe("Create and update transaction", function () {
  let data_test = require("./unit_test_misc/test-describe/transaction-create-update");
  it("Update - transcript_count", async function () {
    let opts = funks.getOptions(models.transcript_count);
    let generated_resolvers = await funks.generateJs("create-models", opts);
    testCompare(generated_resolvers, data_test.update_transcript_count);
  });
});

describe("extended ids", function () {
  let data_test = require("./unit_test_misc/test-describe/extended-internal-ids");

  it("idAttribute - book", async function () {
    let opts = funks.getOptions(models.book_extendedIds);
    let generated_model = await funks.generateJs("create-models", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.book_idAttribute.replace(/\s/g, "");
    expect(g_model).to.have.string(test_model);
  });

  it("idAttributeType - book", async function () {
    let opts = funks.getOptions(models.book_extendedIds);
    let generated_model = await funks.generateJs("create-models", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.book_idAttributeType.replace(/\s/g, "");
    expect(g_model).to.have.string(test_model);
  });

  it("getIdValue - book", async function () {
    let opts = funks.getOptions(models.book_extendedIds);
    let generated_model = await funks.generateJs("create-models", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.book_getIdValue.replace(/\s/g, "");
    expect(g_model).to.have.string(test_model);
  });

  it("internalId as sequelize primaryKey - book", async function () {
    let opts = funks.getOptions(models.book_extendedIds);
    let generated_model = await funks.generateJs("create-models", opts);
    let g_model = generated_model.replace(/\s/g, "");
    let test_model = data_test.book_sequelize_primaryKey.replace(/\s/g, "");
    expect(g_model).to.have.string(test_model);
  });
});

describe("SQL-adapter", function () {
  let data_test = require("./unit_test_misc/test-describe/sql-adapter");

  it("regex - peopleLocal", async function () {
    let opts = funks.getOptions(models_distributed.person_adapter_sql);
    let generated_adapter = await funks.generateJs("create-sql-adapter", opts);
    let g_adapter = generated_adapter.replace(/\s/g, "");
    let test_adapter = data_test.url_regex.replace(/\s/g, "");
    expect(g_adapter).to.have.string(test_adapter);
  });

  it("constructor - peopleLocal", async function () {
    let opts = funks.getOptions(models_distributed.person_adapter_sql);
    let generated_adapter = await funks.generateJs("create-sql-adapter", opts);
    let g_adapter = generated_adapter.replace(/\s/g, "");
    let test_adapter = data_test.constructor.replace(/\s/g, "");
    expect(g_adapter).to.have.string(test_adapter);
  });

  it("constructor - arrayLocal", async () => {
    let opts = funks.getOptions(models_distributed.array_adapter_sql);
    let generated_adapter = await funks.generateJs("create-sql-adapter", opts);
    testCompare(generated_adapter, data_test.array_constructor);
  });

  it("storageHandler - peopleLocal", async function () {
    let opts = funks.getOptions(models_distributed.person_adapter_sql);
    let generated_adapter = await funks.generateJs("create-sql-adapter", opts);
    testCompare(generated_adapter, data_test.constructor);
  });

  it("recognizeId - peopleLocal", async function () {
    let opts = funks.getOptions(models_distributed.person_adapter_sql);
    let generated_adapter = await funks.generateJs("create-sql-adapter", opts);
    testCompare(generated_adapter, data_test.storageHandler);
  });

  it("readById - peopleLocal", async function () {
    let opts = funks.getOptions(models_distributed.person_adapter_sql);
    let generated_adapter = await funks.generateJs("create-sql-adapter", opts);
    let g_adapter = generated_adapter.replace(/\s/g, "");
    let test_adapter = data_test.readById.replace(/\s/g, "");
    expect(g_adapter).to.have.string(test_adapter);
  });

  it("addOne - peopleLocal", async function () {
    let opts = funks.getOptions(models_distributed.person_adapter_sql);
    let generated_adapter = await funks.generateJs("create-sql-adapter", opts);
    testCompare(generated_adapter, data_test.addOne);
  });

  it("count - peopleLocal", async function () {
    let opts = funks.getOptions(models_distributed.person_adapter_sql);
    let generated_adapter = await funks.generateJs("create-sql-adapter", opts);
    let g_adapter = generated_adapter.replace(/\s/g, "");
    let test_adapter = data_test.count.replace(/\s/g, "");
    expect(g_adapter).to.have.string(test_adapter);
  });

  it("readAllCursor - peopleLocal", async function () {
    let opts = funks.getOptions(models_distributed.person_adapter_sql);
    let generated_adapter = await funks.generateJs("create-sql-adapter", opts);
    testCompare(generated_adapter, data_test.readAllCursor);
  });

  it("deleteOne - peopleLocal", async function () {
    let opts = funks.getOptions(models_distributed.person_adapter_sql);
    let generated_adapter = await funks.generateJs("create-sql-adapter", opts);
    let g_adapter = generated_adapter.replace(/\s/g, "");
    let test_adapter = data_test.deleteOne.replace(/\s/g, "");
    expect(g_adapter).to.have.string(test_adapter);
  });

  it("updateOne - peopleLocal", async function () {
    let opts = funks.getOptions(models_distributed.person_adapter_sql);
    let generated_adapter = await funks.generateJs("create-sql-adapter", opts);
    testCompare(generated_adapter, data_test.updateOne);
  });

  it("stripAssociations - peopleLocal", async function () {
    let opts = funks.getOptions(models_distributed.person_adapter_sql);
    let generated_adapter = await funks.generateJs("create-sql-adapter", opts);
    let g_adapter = generated_adapter.replace(/\s/g, "");
    let test_adapter = data_test.stripAssociations.replace(/\s/g, "");
    expect(g_adapter).to.have.string(test_adapter);
  });

  it("getIdValue - peopleLocal", async function () {
    let opts = funks.getOptions(models_distributed.person_adapter_sql);
    let generated_adapter = await funks.generateJs("create-sql-adapter", opts);
    let g_adapter = generated_adapter.replace(/\s/g, "");
    let test_adapter = data_test.getIdValue.replace(/\s/g, "");
    expect(g_adapter).to.have.string(test_adapter);
  });

  it("idAttribute - peopleLocal", async function () {
    let opts = funks.getOptions(models_distributed.person_adapter_sql);
    let generated_adapter = await funks.generateJs("create-sql-adapter", opts);
    let g_adapter = generated_adapter.replace(/\s/g, "");
    let test_adapter = data_test.idAttribute.replace(/\s/g, "");
    expect(g_adapter).to.have.string(test_adapter);
  });

  it("type - peopleLocal", async function () {
    let opts = funks.getOptions(models_distributed.person_adapter_sql);
    let generated_adapter = await funks.generateJs("create-sql-adapter", opts);
    let g_adapter = generated_adapter.replace(/\s/g, "");
    let test_adapter = data_test.type.replace(/\s/g, "");
    expect(g_adapter).to.have.string(test_adapter);
  });
});

describe("Parse associations", function () {
  it("01. Single to_one association", function () {
    let res = funks.parseAssociations(models.transcript_count, "sql");
    expect(res).to.deep.equal({
      schema_attributes: {
        many: {},
        one: {
          individual: ["individual", "Individual", "Individual"],
        },
        generic_one: {},
        generic_many: {},
      },
      to_one: [
        {
          type: "many_to_one",
          implementation: "foreignkeys",
          target: "individual",
          targetKey: "individual_id",
          targetKey_cp: "Individual_id",
          keysIn: "transcript_count",
          targetStorageType: "sql",
          name: "individual",
          name_lc: "individual",
          name_cp: "Individual",
          target_lc: "individual",
          target_lc_pl: "individuals",
          target_pl: "individuals",
          target_cp: "Individual",
          target_cp_pl: "Individuals",
          keysIn_lc: "transcript_count",
          holdsForeignKey: true,
          assocThroughArray: false,
          reverseAssociation: undefined,
        },
      ],
      to_many: [],
      to_many_through_sql_cross_table: [],
      generic_to_one: [],
      generic_to_many: [],
      foreignKeyAssociations: {
        individual: "individual_id",
      },
      associations: [
        {
          type: "many_to_one",
          implementation: "foreignkeys",
          target: "individual",
          targetKey: "individual_id",
          keysIn: "transcript_count",
          targetStorageType: "sql",
        },
      ],
      genericAssociations: [],
      mutations_attributes: "",
    });
  });

  it("02. Single to_many association", function () {
    let res = funks.parseAssociations(models.individual, "sql");
    expect(res).to.deep.equal({
      schema_attributes: {
        many: {
          transcript_counts: [
            "transcript_count",
            "Transcript_count",
            "Transcript_counts",
          ],
        },
        one: {},
        generic_one: {},
        generic_many: {},
      },
      to_one: [],
      to_many: [
        {
          type: "one_to_many",
          implementation: "foreignkeys",
          target: "transcript_count",
          keysIn: "transcript_count",
          targetKey: "individual_id",
          targetKey_cp: "Individual_id",
          targetStorageType: "sql",
          name: "transcript_counts",
          name_lc: "transcript_counts",
          name_cp: "Transcript_counts",
          target_lc: "transcript_count",
          target_lc_pl: "transcript_counts",
          target_pl: "transcript_counts",
          target_cp: "Transcript_count",
          target_cp_pl: "Transcript_counts",
          keysIn_lc: "transcript_count",
          holdsForeignKey: false,
          assocThroughArray: false,
          reverseAssociation: undefined,
        },
      ],
      to_many_through_sql_cross_table: [],
      generic_to_one: [],
      generic_to_many: [],
      foreignKeyAssociations: {
        transcript_counts: "individual_id",
      },
      associations: [
        {
          type: "one_to_many",
          implementation: "foreignkeys",
          target: "transcript_count",
          keysIn: "transcript_count",
          targetKey: "individual_id",
          targetStorageType: "sql",
        },
      ],
      genericAssociations: [],
      mutations_attributes: "",
    });
  });

  it("03. Single to_many_through_sql_cross_table", function () {
    let association = models.assoc_through_project_researcher;
    // association.type = "many_to_many";
    let model = { model: "Person", associations: { assoc: association } };
    let res = funks.parseAssociations(model, "sql");
    expect(res).to.deep.equal({
      schema_attributes: {
        many: {
          assoc: ["Project", "Project", "Assoc"],
        },
        one: {},
        generic_one: {},
        generic_many: {},
      },
      to_one: [],
      to_many: [],
      to_many_through_sql_cross_table: [
        {
          type: "many_to_many",
          implementation: "sql_cross_table",
          target: "Project",
          targetKey: "projectId",
          targetKey_cp: "ProjectId",
          sourceKey: "researcherId",
          keysIn: "project_to_researcher",
          keysIn_lc: "project_to_researcher",
          targetStorageType: "sql",
          source: "researchers",
          target_lc: "project",
          target_lc_pl: "projects",
          target_pl: "Projects",
          target_cp: "Project",
          target_cp_pl: "Projects",
          name: "assoc",
          name_lc: "assoc",
          name_cp: "Assoc",
          holdsForeignKey: false,
          assocThroughArray: false,
          reverseAssociation: undefined,
        },
      ],
      generic_to_one: [],
      generic_to_many: [],
      foreignKeyAssociations: {
        assoc: "projectId",
      },
      associations: [
        {
          type: "many_to_many",
          implementation: "sql_cross_table",
          target: "Project",
          targetKey: "projectId",
          sourceKey: "researcherId",
          keysIn: "project_to_researcher",
          targetStorageType: "sql",
          source: "researchers",
          target_lc: "project",
          target_lc_pl: "projects",
          target_pl: "Projects",
          target_cp: "Project",
          target_cp_pl: "Projects",
        },
      ],
      genericAssociations: [],
      mutations_attributes: "",
    });
  });

  it("04. Two associations: to_many and to_many_through_sql_cross_table", function () {
    let person = models.person;
    // person.associations.books.type = "to_many_through_sql_cross_table";
    let res = funks.parseAssociations(person, "sql");
    expect(res).to.deep.equal({
      schema_attributes: {
        many: {
          dogs: ["Dog", "Dog", "Dogs"],
          books: ["Book", "Book", "Books"],
        },
        one: {},
        generic_one: {},
        generic_many: {},
      },
      to_one: [],
      to_many: [
        {
          type: "one_to_many",
          implementation: "foreignkeys",
          target: "Dog",
          targetKey: "personId",
          targetKey_cp: "PersonId",
          keysIn: "Dog",
          targetStorageType: "sql",
          name: "dogs",
          name_lc: "dogs",
          name_cp: "Dogs",
          target_lc: "dog",
          target_lc_pl: "dogs",
          target_pl: "Dogs",
          target_cp: "Dog",
          target_cp_pl: "Dogs",
          keysIn_lc: "dog",
          holdsForeignKey: false,
          assocThroughArray: false,
          reverseAssociation: undefined,
        },
      ],
      to_many_through_sql_cross_table: [
        {
          type: "many_to_many",
          implementation: "sql_cross_table",
          target: "Book",
          targetKey: "bookId",
          targetKey_cp: "BookId",
          sourceKey: "personId",
          keysIn: "books_to_people",
          keysIn_lc: "books_to_people",
          targetStorageType: "sql",
          name: "books",
          name_lc: "books",
          name_cp: "Books",
          target_lc: "book",
          target_lc_pl: "books",
          target_pl: "Books",
          target_cp: "Book",
          target_cp_pl: "Books",
          holdsForeignKey: false,
          assocThroughArray: false,
          reverseAssociation: undefined,
        },
      ],
      generic_to_one: [],
      generic_to_many: [],
      foreignKeyAssociations: {
        dogs: "personId",
        books: "bookId",
      },
      associations: [
        {
          type: "one_to_many",
          implementation: "foreignkeys",
          target: "Dog",
          targetKey: "personId",
          keysIn: "Dog",
          targetStorageType: "sql",
        },
        {
          type: "many_to_many",
          implementation: "sql_cross_table",
          target: "Book",
          targetKey: "bookId",
          sourceKey: "personId",
          keysIn: "books_to_people",
          targetStorageType: "sql",
        },
      ],
      genericAssociations: [],
      mutations_attributes: "",
    });
  });

  it("05. Two associations: Twice to_one", function () {
    let res = funks.parseAssociations(models.dog, "sql");
    expect(res).to.deep.equal({
      schema_attributes: {
        many: {},
        one: {
          person: ["Person", "Person", "Person"],
          researcher: ["Researcher", "Researcher", "Researcher"],
        },
        generic_one: {},
        generic_many: {},
      },
      to_one: [
        {
          type: "many_to_one",
          implementation: "foreignkeys",
          target: "Person",
          targetKey: "personId",
          targetKey_cp: "PersonId",
          keysIn: "Dog",
          targetStorageType: "sql",
          label: "firstName",
          sublabel: "lastName",
          name: "person",
          name_lc: "person",
          name_cp: "Person",
          target_lc: "person",
          target_lc_pl: "people",
          target_pl: "People",
          target_cp: "Person",
          target_cp_pl: "People",
          keysIn_lc: "dog",
          holdsForeignKey: true,
          assocThroughArray: false,
          reverseAssociation: undefined,
        },
        {
          type: "many_to_one",
          implementation: "foreignkeys",
          target: "Researcher",
          targetKey: "researcherId",
          targetKey_cp: "ResearcherId",
          keysIn: "Dog",
          targetStorageType: "sql",
          label: "firstName",
          name: "researcher",
          name_lc: "researcher",
          name_cp: "Researcher",
          target_lc: "researcher",
          target_lc_pl: "researchers",
          target_pl: "Researchers",
          target_cp: "Researcher",
          target_cp_pl: "Researchers",
          keysIn_lc: "dog",
          holdsForeignKey: true,
          assocThroughArray: false,
          reverseAssociation: undefined,
        },
      ],
      to_many: [],
      to_many_through_sql_cross_table: [],
      generic_to_one: [],
      generic_to_many: [],
      foreignKeyAssociations: {
        person: "personId",
        researcher: "researcherId",
      },
      associations: [
        {
          type: "many_to_one",
          implementation: "foreignkeys",
          target: "Person",
          targetKey: "personId",
          keysIn: "Dog",
          targetStorageType: "sql",
          label: "firstName",
          sublabel: "lastName",
        },
        {
          type: "many_to_one",
          implementation: "foreignkeys",
          target: "Researcher",
          targetKey: "researcherId",
          keysIn: "Dog",
          targetStorageType: "sql",
          label: "firstName",
        },
      ],
      genericAssociations: [],
      mutations_attributes: "",
    });
  });
});

describe("Refactor associations - delete", function () {
  let data_test = require("./unit_test_misc/test-describe/refactoring-associations");

  it("count associations - accession", async function () {
    let opts = funks.getOptions(models_refactoring.accession);
    let generated_resolver = await funks.generateJs("create-resolvers", opts);
    let g_resolver = generated_resolver.replace(/\s/g, "");
    let test_resolver = data_test.count_associations.replace(/\s/g, "");
    expect(g_resolver).to.have.string(test_resolver);
  });

  it("validate for deletion  - accession", async function () {
    let opts = funks.getOptions(models_refactoring.accession);
    let generated_resolver = await funks.generateJs("create-resolvers", opts);
    let g_resolver = generated_resolver.replace(/\s/g, "");
    let test_resolver = data_test.validate_for_deletion.replace(/\s/g, "");
    expect(g_resolver).to.have.string(test_resolver);
  });

  it("delete resolver - accession", async function () {
    let opts = funks.getOptions(models_refactoring.accession);
    let generated_resolver = await funks.generateJs("create-resolvers", opts);
    let g_resolver = generated_resolver.replace(/\s/g, "");
    let test_resolver = data_test.delete_resolver.replace(/\s/g, "");
    expect(g_resolver).to.have.string(test_resolver);
  });

  it("validate for deletion ddm - accession", async function () {
    let opts = funks.getOptions(models_refactoring.accession_ddm);
    let generated_resolver = await funks.generateJs(
      "create-resolvers-ddm",
      opts
    );
    let g_resolver = generated_resolver.replace(/\s/g, "");
    let test_resolver = data_test.valid_for_deletion_ddm.replace(/\s/g, "");
    expect(g_resolver).to.have.string(test_resolver);
  });
});

describe("Refactor associations - add / update SQL models", function () {
  let data_test = require("./unit_test_misc/test-describe/refactoring-associations");

  it("handleAssociations - accession", async function () {
    let opts = funks.getOptions(models_refactoring.accession);
    let generated_resolver = await funks.generateJs("create-resolvers", opts);
    let g_resolver = generated_resolver.replace(/\s/g, "");
    let test_resolver = data_test.handleAssociations.replace(/\s/g, "");
    expect(g_resolver).to.have.string(test_resolver);
  });

  it("add_location to_one - accession", async function () {
    let opts = funks.getOptions(models_refactoring.accession);
    let generated_resolver = await funks.generateJs("create-resolvers", opts);
    let g_resolver = generated_resolver.replace(/\s/g, "");
    let test_resolver =
      data_test.add_assoc_to_one_fieldMutation_resolver.replace(/\s/g, "");
    expect(g_resolver).to.have.string(test_resolver);
  });

  it("remove_location to_one - accession", async function () {
    let opts = funks.getOptions(models_refactoring.accession);
    let generated_resolver = await funks.generateJs("create-resolvers", opts);
    let g_resolver = generated_resolver.replace(/\s/g, "");
    let test_resolver =
      data_test.remove_assoc_to_one_fieldMutation_resolver.replace(/\s/g, "");
    expect(g_resolver).to.have.string(test_resolver);
  });

  it("add_dog to_one fK in target - accession", async function () {
    let opts = funks.getOptions(models.researcher);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, "");
    let test_resolver =
      data_test.add_assoc_to_one_fieldMutation_resolver_fK_in_target.replace(
        /\s/g,
        ""
      );
    expect(g_resolvers).to.have.string(test_resolver);
  });

  it("remove_dog to_one fK in target - accession", async function () {
    let opts = funks.getOptions(models.researcher);
    let generated_resolvers = await funks.generateJs("create-resolvers", opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, "");
    let test_resolver =
      data_test.remove_assoc_to_one_fieldMutation_resolver_fK_in_target.replace(
        /\s/g,
        ""
      );
    expect(g_resolvers).to.have.string(test_resolver);
  });

  it("add_individuals to_many - accession", async function () {
    let opts = funks.getOptions(models_refactoring.accession);
    let generated_resolver = await funks.generateJs("create-resolvers", opts);
    let g_resolver = generated_resolver.replace(/\s/g, "");
    let test_resolver =
      data_test.add_assoc_to_many_fieldMutation_resolver.replace(/\s/g, "");
    expect(g_resolver).to.have.string(test_resolver);
  });

  it("remove_individuals to_many - accession", async function () {
    let opts = funks.getOptions(models_refactoring.accession);
    let generated_resolver = await funks.generateJs("create-resolvers", opts);
    let g_resolver = generated_resolver.replace(/\s/g, "");
    let test_resolver =
      data_test.remove_assoc_to_many_fieldMutation_resolver.replace(/\s/g, "");
    expect(g_resolver).to.have.string(test_resolver);
  });

  it("add_locationId- accession", async function () {
    let opts = funks.getOptions(models_refactoring.accession);
    let generated_resolver = await funks.generateJs("create-models", opts);
    let g_resolver = generated_resolver.replace(/\s/g, "");
    let test_resolver =
      data_test._addAssoc_to_one_fieldMutation_sql_model.replace(/\s/g, "");
    expect(g_resolver).to.have.string(test_resolver);
  });

  it("remove_locationId - accession", async function () {
    let opts = funks.getOptions(models_refactoring.accession);
    let generated_resolver = await funks.generateJs("create-models", opts);
    let g_resolver = generated_resolver.replace(/\s/g, "");
    let test_resolver =
      data_test._removeAssoc_to_one_fieldMutation_sql_model.replace(/\s/g, "");
    expect(g_resolver).to.have.string(test_resolver);
  });
});

describe("Refactor associations in distributed data case - add - remove", function () {
  let data_test = require("./unit_test_misc/test-describe/refactoring-associations");

  it("handle associations - accession", async function () {
    let opts = funks.getOptions(models_refactoring.accession_ddm);
    let generated_resolver = await funks.generateJs(
      "create-resolvers-ddm",
      opts
    );
    let g_resolver = generated_resolver.replace(/\s/g, "");
    let test_resolver = data_test.handleAssociations.replace(/\s/g, "");
    expect(g_resolver).to.have.string(test_resolver);
  });

  it("add to-one association - accession", async function () {
    let opts = funks.getOptions(models_refactoring.accession_ddm);
    let generated_resolver = await funks.generateJs(
      "create-resolvers-ddm",
      opts
    );
    let g_resolver = generated_resolver.replace(/\s/g, "");
    let test_resolver = data_test.to_one_add.replace(/\s/g, "");
    expect(g_resolver).to.have.string(test_resolver);
  });

  it("remove to-one association - accession", async function () {
    let opts = funks.getOptions(models_refactoring.accession_ddm);
    let generated_resolver = await funks.generateJs(
      "create-resolvers-ddm",
      opts
    );
    let g_resolver = generated_resolver.replace(/\s/g, "");
    let test_resolver = data_test.to_one_remove.replace(/\s/g, "");
    expect(g_resolver).to.have.string(test_resolver);
  });

  it("add to-many association - accession", async function () {
    let opts = funks.getOptions(models_refactoring.accession_ddm);
    let generated_resolver = await funks.generateJs(
      "create-resolvers-ddm",
      opts
    );
    let g_resolver = generated_resolver.replace(/\s/g, "");
    let test_resolver = data_test.to_many_add.replace(/\s/g, "");
    expect(g_resolver).to.have.string(test_resolver);
  });

  it("remove to-many association - accession", async function () {
    let opts = funks.getOptions(models_refactoring.accession_ddm);
    let generated_resolver = await funks.generateJs(
      "create-resolvers-ddm",
      opts
    );
    let g_resolver = generated_resolver.replace(/\s/g, "");
    let test_resolver = data_test.to_many_remove.replace(/\s/g, "");
    expect(g_resolver).to.have.string(test_resolver);
  });

  it("add association model layer - accession", async function () {
    let opts = funks.getOptions(models_refactoring.accession_ddm);
    let generated_resolver = await funks.generateJs(
      "create-distributed-model",
      opts
    );
    let g_resolver = generated_resolver.replace(/\s/g, "");
    let test_resolver = data_test.add_assoc_ddm_model.replace(/\s/g, "");
    expect(g_resolver).to.have.string(test_resolver);
  });

  it("remove association model layer - accession", async function () {
    let opts = funks.getOptions(models_refactoring.accession_ddm);
    let generated_resolver = await funks.generateJs(
      "create-distributed-model",
      opts
    );
    let g_resolver = generated_resolver.replace(/\s/g, "");
    let test_resolver = data_test.remove_assoc_ddm_model.replace(/\s/g, "");
    expect(g_resolver).to.have.string(test_resolver);
  });

  it("add association in zendro-webservice-adapter  - accession", async function () {
    let opts = funks.getOptions(models_refactoring.accession_zendro_adapter);
    let generated_adapter = await funks.generateJs(
      "create-zendro-adapters",
      opts
    );
    let g_adapter = generated_adapter.replace(/\s/g, "");
    let test_adapter = data_test.to_one_add_zendro_adapter.replace(/\s/g, "");
    expect(g_adapter).to.have.string(test_adapter);
  });

  it("remove association in zendro-webservice-adapter - accession", async function () {
    let opts = funks.getOptions(models_refactoring.accession_zendro_adapter);
    let generated_adapter = await funks.generateJs(
      "create-zendro-adapters",
      opts
    );
    let g_adapter = generated_adapter.replace(/\s/g, "");
    let test_adapter = data_test.to_one_remove_zendro_adapter.replace(
      /\s/g,
      ""
    );
    expect(g_adapter).to.have.string(test_adapter);
  });

  it("add association in sql-adapter  - accession", async function () {
    let opts = funks.getOptions(models_refactoring.accession_sql_adapter);
    let generated_adapter = await funks.generateJs("create-sql-adapter", opts);
    let g_adapter = generated_adapter.replace(/\s/g, "");
    let test_adapter = data_test.to_one_add_sql_adapter.replace(/\s/g, "");
    expect(g_adapter).to.have.string(test_adapter);
  });

  it("remove association in sql-adapter - accession", async function () {
    let opts = funks.getOptions(models_refactoring.accession_sql_adapter);
    let generated_adapter = await funks.generateJs("create-sql-adapter", opts);
    let g_adapter = generated_adapter.replace(/\s/g, "");
    let test_adapter = data_test.to_one_remove_sql_adapter.replace(/\s/g, "");
    expect(g_adapter).to.have.string(test_adapter);
  });

  it("add one resolver - accession", async function () {
    let opts = funks.getOptions(models_refactoring.accession_ddm);
    let generated_resolver = await funks.generateJs(
      "create-resolvers-ddm",
      opts
    );
    let g_resolver = generated_resolver.replace(/\s/g, "");
    let test_resolver = data_test.add_one_resolver.replace(/\s/g, "");
    expect(g_resolver).to.have.string(test_resolver);
  });

  it("update one resolver - accession", async function () {
    let opts = funks.getOptions(models_refactoring.accession_ddm);
    let generated_resolver = await funks.generateJs(
      "create-resolvers-ddm",
      opts
    );
    let g_resolver = generated_resolver.replace(/\s/g, "");
    let test_resolver = data_test.update_one_resolver.replace(/\s/g, "");
    expect(g_resolver).to.have.string(test_resolver);
  });

  it("add one in zendro-webservice-adapter - accession", async function () {
    let opts = funks.getOptions(models_refactoring.accession_zendro_adapter);
    let generated_adapter = await funks.generateJs(
      "create-zendro-adapters",
      opts
    );
    let g_adapter = generated_adapter.replace(/\s/g, "");
    let test_adapter = data_test.add_one_zendro_adapter.replace(/\s/g, "");
    expect(g_adapter).to.have.string(test_adapter);
  });

  it("update one in zendro-webservice-adapter - accession", async function () {
    let opts = funks.getOptions(models_refactoring.accession_zendro_adapter);
    let generated_adapter = await funks.generateJs(
      "create-zendro-adapters",
      opts
    );
    let g_adapter = generated_adapter.replace(/\s/g, "");
    let test_adapter = data_test.update_one_zendro_adapter.replace(/\s/g, "");
    expect(g_adapter).to.have.string(test_adapter);
  });
});

/**
 * Generic Models - GraphQL Schema Layer
 */
describe("Generic Models - GraphQL Schema Layer", function () {
  let data_test = require("./unit_test_misc/test-describe/all-generic");

  it("1. generic with no associations - person", async function () {
    let opts = funks.getOptions(models_generic.personGeneric_noAssociations);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema")
      .to.not.match(data_test.test1_1)
      .and.to.not.match(data_test.test1_2)
      .and.to.not.match(data_test.test1_3)
      .and.to.not.match(data_test.test1_4)
      .and.to.not.match(data_test.test1_5)
      .and.to.not.match(data_test.test1_6)
      .and.to.not.match(data_test.test1_7)
      .and.to.not.match(data_test.test1_8)
      .and.to.not.match(data_test.test1_9)
      .and.to.not.match(data_test.test1_10);
  });

  it("2. sql <to_many> generic - person", async function () {
    let opts = funks.getOptions(models_generic.personSql_toMany_dogGeneric);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema")
      .to.match(data_test.test2_1)
      .and.to.match(data_test.test2_2)
      .and.to.match(data_test.test2_3)
      .and.to.match(data_test.test2_4)
      .and.to.match(data_test.test2_5)
      .and.to.match(data_test.test2_6);
  });

  it("3. generic <to_one> sql - dog", async function () {
    let opts = funks.getOptions(models_generic.dogGeneric_toOne_personSql);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema")
      .to.match(data_test.test3_1)
      .and.to.match(data_test.test3_2)
      .and.to.match(data_test.test3_3)
      .and.to.match(data_test.test3_4);
  });

  it("4. sql <to_one> generic - person", async function () {
    let opts = funks.getOptions(models_generic.personSql_toOne_hometownGeneric);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema")
      .to.match(data_test.test4_1)
      .and.to.match(data_test.test4_2)
      .and.to.match(data_test.test4_3)
      .and.to.match(data_test.test4_4);
  });

  it("5. generic <to_many> sql - hometown", async function () {
    let opts = funks.getOptions(
      models_generic.hometownGeneric_toMany_personSql
    );
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema")
      .to.match(data_test.test5_1)
      .and.to.match(data_test.test5_2)
      .and.to.match(data_test.test5_3)
      .and.to.match(data_test.test5_4)
      .and.to.match(data_test.test5_5)
      .and.to.match(data_test.test5_6);
  });
});

/**
 * Generic Models - Resolvers Layer
 */
describe("Generic Models - Resolvers Layer", function () {
  let data_test = require("./unit_test_misc/test-describe/all-generic");

  it("6.1. generic with no associations - person", async function () {
    let opts = funks.getOptions(models_generic.personGeneric_noAssociations);
    let generated_schema = await funks.generateJs("create-resolvers", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema").to.match(data_test.test6_1);
  });

  it("6.2. generic with no associations - person", async function () {
    let opts = funks.getOptions(models_generic.personGeneric_noAssociations);
    let generated_schema = await funks.generateJs("create-resolvers", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema").to.not.match(data_test.test6_2);
  });

  it("6.3. generic with no associations - person", async function () {
    let opts = funks.getOptions(models_generic.personGeneric_noAssociations);
    let generated_schema = await funks.generateJs("create-resolvers", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema").to.not.match(data_test.test6_3);
  });

  it("6.4. generic with no associations - person", async function () {
    let opts = funks.getOptions(models_generic.personGeneric_noAssociations);
    let generated_schema = await funks.generateJs("create-resolvers", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema").to.not.match(data_test.test6_4);
  });

  it("6.5. generic with no associations - person", async function () {
    let opts = funks.getOptions(models_generic.personGeneric_noAssociations);
    let generated_schema = await funks.generateJs("create-resolvers", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema").to.not.match(data_test.test6_5);
  });

  it("7. sql <to_many> generic - person", async function () {
    let opts = funks.getOptions(models_generic.personSql_toMany_dogGeneric);
    let generated_schema = await funks.generateJs("create-resolvers", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema")
      .to.match(data_test.test7_1)
      .and.to.match(data_test.test7_2)
      .and.to.match(data_test.test7_3)
      .and.to.match(data_test.test7_4)
      .and.to.match(data_test.test7_5)
      .and.to.match(data_test.test7_6)
      .and.to.match(data_test.test7_7)
      .and.to.match(data_test.test7_8);
  });

  it("8. generic <to_one> sql - dog", async function () {
    let opts = funks.getOptions(models_generic.dogGeneric_toOne_personSql);
    let generated_schema = await funks.generateJs("create-resolvers", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema")
      .to.match(data_test.test8_1)
      .and.to.match(data_test.test8_2)
      .and.to.match(data_test.test8_3)
      .and.to.match(data_test.test8_4);
  });
});

/**
 * Generic Models - Model Layer
 */
describe("Generic Models - Model Layer", function () {
  let data_test = require("./unit_test_misc/test-describe/all-generic");

  it("9. generic with no associations - person", async function () {
    let opts = funks.getOptions(models_generic.personGeneric_noAssociations);
    let generated_schema = await funks.generateJs(
      "create-models-generic",
      opts
    );
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema")
      .to.match(data_test.test9_1)
      .and.to.match(data_test.test9_2)
      .and.to.match(data_test.test9_3)
      .and.to.match(data_test.test9_4)
      .and.to.match(data_test.test9_5)
      .and.to.match(data_test.test9_6)
      .and.to.match(data_test.test9_7)
      .and.to.match(data_test.test9_8)
      .and.to.not.match(data_test.test9_9)
      .and.to.not.match(data_test.test9_10);
  });

  it("10.1 sql <to_many> generic - person", async function () {
    let opts = funks.getOptions(models_generic.personSql_toMany_dogGeneric);
    let generated_schema = await funks.generateJs("create-models", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema").to.not.match(data_test.test10_1);
  });

  it("10.2 sql <to_many> generic - person", async function () {
    let opts = funks.getOptions(models_generic.personSql_toMany_dogGeneric);
    let generated_schema = await funks.generateJs("create-models", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema").to.not.match(data_test.test10_2);
  });

  it("11. generic <to_one> sql - dog", async function () {
    let opts = funks.getOptions(models_generic.dogGeneric_toOne_personSql);
    let generated_schema = await funks.generateJs(
      "create-models-generic",
      opts
    );
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema")
      .to.match(data_test.test11_1)
      .and.to.match(data_test.test11_2)
      .and.to.match(data_test.test11_3)
      .and.to.match(data_test.test11_4)
      .and.to.match(data_test.test11_5)
      .and.to.match(data_test.test11_6)
      .and.to.match(data_test.test11_7)
      .and.to.match(data_test.test11_8)
      .and.to.match(data_test.test11_9)
      .and.to.match(data_test.test11_10);
  });

  it("12. sql <to_one> generic - person", async function () {
    let opts = funks.getOptions(models_generic.personSql_toOne_hometownGeneric);
    let generated_schema = await funks.generateJs("create-models", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema")
      .to.match(data_test.test12_1)
      .and.to.match(data_test.test12_2);
  });

  it("13. generic <to_many> sql - hometown", async function () {
    let opts = funks.getOptions(
      models_generic.hometownGeneric_toMany_personSql
    );
    let generated_schema = await funks.generateJs(
      "create-models-generic",
      opts
    );
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema")
      .to.match(data_test.test13_1)
      .and.to.match(data_test.test13_2)
      .and.to.match(data_test.test13_3)
      .and.to.match(data_test.test13_4)
      .and.to.match(data_test.test13_5)
      .and.to.match(data_test.test13_6)
      .and.to.match(data_test.test13_7)
      .and.to.match(data_test.test13_8)
      .and.to.not.match(data_test.test13_9)
      .and.to.not.match(data_test.test13_10);
  });
});

/**
 * Generic Associations - GraphQL Schema Layer
 */
describe("Generic Associations - GraphQL Schema Layer", function () {
  let data_test = require("./unit_test_misc/test-describe/all-generic");

  it("14. generic <generic_to_one> - dog", async function () {
    let opts = funks.getOptions(models_generic.dogGeneric_genericToOne_person);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema")
      .to.match(data_test.test14_1)
      .and.to.match(data_test.test14_2)
      .and.to.match(data_test.test14_3)
      .and.to.match(data_test.test14_4);
  });

  it("15. sql <generic_to_many> - person", async function () {
    let opts = funks.getOptions(models_generic.personSql_genericToMany_dog);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema")
      .to.match(data_test.test15_1)
      .and.to.match(data_test.test15_2)
      .and.to.match(data_test.test15_3)
      .and.to.match(data_test.test15_4)
      .and.to.match(data_test.test15_5)
      .and.to.match(data_test.test15_6);
  });

  it("14_b. ddm <generic_to_one> - dog", async function () {
    let opts = funks.getOptions(models_generic.dogDdm_genericToOne_person);
    let generated_schema = await funks.generateJs("create-schemas-ddm", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema")
      .to.match(data_test.test14_1)
      .and.to.match(data_test.test14_2)
      .and.to.match(data_test.test14_3)
      .and.to.match(data_test.test14_4);
  });

  it("15_b. ddm <generic_to_many> - person", async function () {
    let opts = funks.getOptions(models_generic.personDdm_genericToMany_dog);
    let generated_schema = await funks.generateJs("create-schemas-ddm", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema")
      .to.match(data_test.test15_1)
      .and.to.match(data_test.test15_2)
      .and.to.match(data_test.test15_3)
      .and.to.match(data_test.test15_4)
      .and.to.match(data_test.test15_5)
      .and.to.match(data_test.test15_6);
  });
});

/**
 * Generic Associations - Resolvers Layer
 */
describe("Generic Associations - Resolvers Layer", function () {
  let data_test = require("./unit_test_misc/test-describe/all-generic");

  it("16. sql <generic_to_many> - person", async function () {
    let opts = funks.getOptions(models_generic.personSql_genericToMany_dog);
    let generated_schema = await funks.generateJs("create-resolvers", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema")
      .to.match(data_test.test16_1)
      .and.to.match(data_test.test16_2)
      .and.to.match(data_test.test16_3)
      .and.to.match(data_test.test16_4)
      .and.to.match(data_test.test16_5)
      .and.to.match(data_test.test16_6)
      .and.to.match(data_test.test16_7)
      .and.to.match(data_test.test16_8)
      .and.to.match(data_test.test16_9)
      .and.to.match(data_test.test16_10)
      .and.to.match(data_test.test16_11)
      .and.to.match(data_test.test16_12)
      .and.to.match(data_test.test16_13);
  });

  it("17. generic <generic_to_one> - dog", async function () {
    let opts = funks.getOptions(models_generic.dogGeneric_genericToOne_person);
    let generated_schema = await funks.generateJs("create-resolvers", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema")
      .to.match(data_test.test17_1)
      .and.to.match(data_test.test17_2)
      .and.to.match(data_test.test17_3)
      .and.to.match(data_test.test17_4)
      .and.to.match(data_test.test17_5)
      .and.to.match(data_test.test17_6)
      .and.to.match(data_test.test17_7)
      .and.to.match(data_test.test17_8)
      .and.to.match(data_test.test17_9)
      .and.to.match(data_test.test17_10)
      .and.to.match(data_test.test17_11);
  });

  it("16_b. ddm <generic_to_many> - person", async function () {
    let opts = funks.getOptions(models_generic.personDdm_genericToMany_dog);
    let generated_schema = await funks.generateJs("create-resolvers-ddm", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema")
      .to.match(data_test.test16_1)
      .and.to.match(data_test.test16_2)
      .and.to.match(data_test.test16_3)
      .and.to.match(data_test.test16_4)
      .and.to.match(data_test.test16_5)
      .and.to.match(data_test.test16_6)
      .and.to.match(data_test.test16_7)
      .and.to.match(data_test.test16_8)
      .and.to.match(data_test.test16_9)
      .and.to.match(data_test.test16_10)
      .and.to.match(data_test.test16_11)
      .and.to.match(data_test.test16_12)
      .and.to.match(data_test.test16_13);
  });

  it("17_b. ddm <generic_to_one> - dog", async function () {
    let opts = funks.getOptions(models_generic.dogDdm_genericToOne_person);
    let generated_schema = await funks.generateJs("create-resolvers-ddm", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema")
      .to.match(data_test.test17_1)
      .and.to.match(data_test.test17_2)
      .and.to.match(data_test.test17_3)
      .and.to.match(data_test.test17_4)
      .and.to.match(data_test.test17_5)
      .and.to.match(data_test.test17_6)
      .and.to.match(data_test.test17_7)
      .and.to.match(data_test.test17_8)
      .and.to.match(data_test.test17_9)
      .and.to.match(data_test.test17_10)
      .and.to.match(data_test.test17_11);
  });
});

/**
 * Generic Associations - Model Layer
 */
describe("Generic Associations - Model Layer", function () {
  let data_test = require("./unit_test_misc/test-describe/all-generic");

  it("18. sql <generic_to_many> - person", async function () {
    let opts = funks.getOptions(models_generic.personSql_genericToMany_dog);
    let generated_schema = await funks.generateJs("create-models", opts);
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema")
      .to.match(data_test.test18_1)
      .and.to.match(data_test.test18_2)
      .and.to.match(data_test.test18_3)
      .and.to.match(data_test.test18_4)
      .and.to.match(data_test.test18_5);
  });

  it("19. generic <generic_to_one> - dog", async function () {
    let opts = funks.getOptions(models_generic.dogGeneric_genericToOne_person);
    let generated_schema = await funks.generateJs(
      "create-models-generic",
      opts
    );
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema")
      .to.match(data_test.test19_1)
      .and.to.match(data_test.test19_2)
      .and.to.match(data_test.test19_3);
  });

  it("18_b. ddm <generic_to_many> - person", async function () {
    let opts = funks.getOptions(models_generic.personDdm_genericToMany_dog);
    let generated_schema = await funks.generateJs(
      "create-distributed-model",
      opts
    );
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema")
      .to.match(data_test.test18_1)
      .and.to.match(data_test.test18_2)
      .and.to.match(data_test.test18_3)
      .and.to.match(data_test.test18_4)
      .and.to.match(data_test.test18_5);
  });

  it("19_b. generic <generic_to_one> - dog", async function () {
    let opts = funks.getOptions(models_generic.dogDdm_genericToOne_person);
    let generated_schema = await funks.generateJs(
      "create-distributed-model",
      opts
    );
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema")
      .to.match(data_test.test19_1)
      .and.to.match(data_test.test19_2)
      .and.to.match(data_test.test19_3);
  });
});

/**
 * Generic Adapter
 */
describe("Generic Adapter", function () {
  let data_test = require("./unit_test_misc/test-describe/all-generic");

  it("20. generic-adapter - person_a", async function () {
    let opts = funks.getOptions(models_generic.personGenericAdapter);
    let generated_schema = await funks.generateJs(
      "create-generic-adapter",
      opts
    );
    let g_schema = generated_schema.replace(/\s/g, "");
    expect(g_schema, "Incorrect schema")
      .to.match(data_test.test20_1)
      .and.to.match(data_test.test20_2)
      .and.to.match(data_test.test20_3)
      .and.to.match(data_test.test20_4)
      .and.to.match(data_test.test20_5)
      .and.to.match(data_test.test20_6)
      .and.to.match(data_test.test20_7)
      .and.to.match(data_test.test20_8)
      .and.to.match(data_test.test20_9)
      .and.to.match(data_test.test20_10)
      .and.to.match(data_test.test20_11)
      .and.to.match(data_test.test20_12)
      .and.to.match(data_test.test20_13)
      .and.to.match(data_test.test20_14);
  });
});

describe("Handle Errors in DDM", function () {
  let data_test = require("./unit_test_misc/test-describe/handle-error-ddm");

  it("Count in model- dog", async function () {
    let opts = funks.getOptions(models_distributed.dog_ddm_integration_test);
    let generated_model = await funks.generateJs(
      "create-distributed-model",
      opts
    );
    testCompare(generated_model, data_test.count_dogs_model_ddm);
  });

  it("readAllCursor in model- dog", async function () {
    let opts = funks.getOptions(models_distributed.dog_ddm_integration_test);
    let generated_model = await funks.generateJs(
      "create-distributed-model",
      opts
    );
    testCompare(generated_model, data_test.readAllCursor_dogs_model_ddm);
  });

  it("count in resolver - dog", async function () {
    let opts = funks.getOptions(models_distributed.dog_ddm_integration_test);
    let generated_resolver = await funks.generateJs(
      "create-resolvers-ddm",
      opts
    );
    testCompare(generated_resolver, data_test.count_dogs_resolver_ddm);
  });

  it("connection in resolver - dog", async function () {
    let opts = funks.getOptions(models_distributed.dog_ddm_integration_test);
    let generated_resolver = await funks.generateJs(
      "create-resolvers-ddm",
      opts
    );
    testCompare(generated_resolver, data_test.connections_dogs_resolver_ddm);
  });

  it("readAllCursor in zendro-webservice-adapter - dog", async function () {
    let opts = funks.getOptions(
      models_distributed.dog_zendro_adapter_integration_test
    );
    let generated_adapter = await funks.generateJs(
      "create-zendro-adapters",
      opts
    );
    let g_adapter = generated_adapter.replace(/\s/g, "");
    let test_adapter = data_test.readAllCursor_dogs_adapter_ddm.replace(
      /\s/g,
      ""
    );
    expect(g_adapter).to.have.string(test_adapter);
  });
});

describe("bulkAssociation", function () {
  let data_test = require("./unit_test_misc/test-describe/bulkAssociation");
  it("schema mutations - book", async function () {
    let opts = funks.getOptions(models.book_extendedIds);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    testCompare(generated_schema, data_test.bulkAssociation_schema_mutation);
  });

  it("schema inputType - book", async function () {
    let opts = funks.getOptions(models.book_extendedIds);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    testCompare(generated_schema, data_test.bulkAssociation_schema_inputType);
  });

  it("bulkAssociate resolver - book", async function () {
    let opts = funks.getOptions(models.book_extendedIds);
    let generated_resolver = await funks.generateJs("create-resolvers", opts);
    testCompare(generated_resolver, data_test.bulkAssociation_resolver_add);
  });

  it("bulkDisAssociate resolver - book", async function () {
    let opts = funks.getOptions(models.book_extendedIds);
    let generated_resolver = await funks.generateJs("create-resolvers", opts);
    testCompare(generated_resolver, data_test.bulkAssociation_resolver_remove);
  });

  it("bulkAssociate model sql - book", async function () {
    let opts = funks.getOptions(models.book_extendedIds);
    let generated_model = await funks.generateJs("create-models", opts);
    testCompare(generated_model, data_test.bulkAssociation_model_sql_add);
  });

  it("bulkDisAssociate model sql - book", async function () {
    let opts = funks.getOptions(models.book_extendedIds);
    let generated_model = await funks.generateJs("create-models", opts);
    testCompare(generated_model, data_test.bulkAssociation_model_sql_remove);
  });

  it("bulkAssociate model zendro/ddm-adapter - dog", async function () {
    let opts = funks.getOptions(models_zendro.dog_one_assoc);
    let generated_model = await funks.generateJs("create-models-zendro", opts);
    testCompare(
      generated_model,
      data_test.bulkAssociation_model_zendro_ddm_adapter_add
    );
  });

  it("bulkDisAssociate model zendro/ddm-adapter - dog", async function () {
    let opts = funks.getOptions(models_zendro.dog_one_assoc);
    let generated_model = await funks.generateJs("create-models-zendro", opts);
    testCompare(
      generated_model,
      data_test.bulkAssociation_model_zendro_ddm_adapter_remove
    );
  });

  it("bulkAssociate model ddm - dog", async function () {
    let opts = funks.getOptions(models_distributed.dog_ddm);
    let generated_model = await funks.generateJs(
      "create-distributed-model",
      opts
    );
    testCompare(generated_model, data_test.bulkAssociation_model_ddm_add);
  });

  it("bulkDisAssociate model ddm - dog", async function () {
    let opts = funks.getOptions(models_distributed.dog_ddm);
    let generated_model = await funks.generateJs(
      "create-distributed-model",
      opts
    );
    testCompare(generated_model, data_test.bulkAssociation_model_ddm_remove);
  });

  it("mapBulkAssociationInputToAdapters model ddm - dog", async function () {
    let opts = funks.getOptions(models_distributed.dog_ddm_integration_test);
    let generated_model = await funks.generateJs(
      "create-distributed-model",
      opts
    );
    testCompare(
      generated_model,
      data_test.bulkAssociation_mapBulkAssociationInputToAdapters
    );
  });
});

describe("Foreign-key array", function () {
  let data_test = require("./unit_test_misc/test-describe/foreign-key-array");

  it("schema - author", async function () {
    let opts = funks.getOptions(models.author_foreignKeyArray);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    testCompare(generated_schema, data_test.add_and_update);
  });

  it("resolver filter association - author", async function () {
    let opts = funks.getOptions(models.author_foreignKeyArray);
    let generated_resolver = await funks.generateJs("create-resolvers", opts);
    testCompare(generated_resolver, data_test.resolver_filter_association);
  });

  it("resolver connection association - author", async function () {
    let opts = funks.getOptions(models.author_foreignKeyArray);
    let generated_resolver = await funks.generateJs("create-resolvers", opts);
    testCompare(generated_resolver, data_test.resolver_connection_association);
  });

  it("resolver count association - author", async function () {
    let opts = funks.getOptions(models.author_foreignKeyArray);
    let generated_resolver = await funks.generateJs("create-resolvers", opts);
    testCompare(generated_resolver, data_test.resolver_count_association);
  });

  it("resolver add association - author", async function () {
    let opts = funks.getOptions(models.author_foreignKeyArray);
    let generated_resolver = await funks.generateJs("create-resolvers", opts);
    testCompare(generated_resolver, data_test.resolver_add_association);
  });

  it("resolver remove association - author", async function () {
    let opts = funks.getOptions(models.author_foreignKeyArray);
    let generated_resolver = await funks.generateJs("create-resolvers", opts);
    testCompare(generated_resolver, data_test.resolver_remove_association);
  });

  it("model add association - author", async function () {
    let opts = funks.getOptions(models.author_foreignKeyArray);
    let generated_model = await funks.generateJs("create-models", opts);
    testCompare(generated_model, data_test.model_add_association);
  });

  it("model remove association - author", async function () {
    let opts = funks.getOptions(models.author_foreignKeyArray);
    let generated_model = await funks.generateJs("create-models", opts);
    testCompare(generated_model, data_test.model_remove_association);
  });

  it("model remote server, add association - author", async function () {
    let opts = funks.getOptions(models.author_zendro_remote);
    let generated_model = await funks.generateJs("create-models-zendro", opts);
    testCompare(generated_model, data_test.remote_model_add_association);
  });

  it("model remote server, remove association - author", async function () {
    let opts = funks.getOptions(models.author_zendro_remote);
    let generated_model = await funks.generateJs("create-models-zendro", opts);
    testCompare(generated_model, data_test.remote_model_remove_association);
  });

  it("ddm model add association - author", async function () {
    let opts = funks.getOptions(models.author_ddm_array_fk);
    let generated_model = await funks.generateJs(
      "create-distributed-model",
      opts
    );
    testCompare(generated_model, data_test.ddm_model_add);
  });

  it("model remote server, add association - author", async function () {
    let opts = funks.getOptions(models.author_sql_adapter_array_fk);
    let generated_model = await funks.generateJs("create-sql-adapter", opts);
    testCompare(generated_model, data_test.sql_adapter_add);
  });

  it("model remote server, remove association - author", async function () {
    let opts = funks.getOptions(models.author_zendro_adapter_array_fk);
    let generated_model = await funks.generateJs(
      "create-zendro-adapters",
      opts
    );
    testCompare(generated_model, data_test.zendro_adapter_remove);
  });
});

describe("Cassandra storagetype", function () {
  let data_test = require("./unit_test_misc/test-describe/cassandra-storagetype");

  it("cassandra schema - city", async function () {
    let opts = funks.getOptions(models_cassandra.city);
    let generated_schema = await funks.generateJs("create-schemas", opts);
    testCompare(generated_schema, data_test.cassandra_schema);
  });

  it("cassandra resolver - cityConnection", async function () {
    let opts = funks.getOptions(models_cassandra.city);
    let generated_resolver = await funks.generateJs("create-resolvers", opts);
    testCompare(generated_resolver, data_test.cassandra_resolver_Connection);
  });

  it("cassandra resolver - countCities", async function () {
    let opts = funks.getOptions(models_cassandra.city);
    let generated_resolver = await funks.generateJs("create-resolvers", opts);
    testCompare(generated_resolver, data_test.cassandra_resolver_Count);
  });

  it("targetStorageType cassandra fieldResolver Workaround - citiesConnection", async function () {
    let opts = funks.getOptions(models_cassandra.river);
    let generated_resolver = await funks.generateJs("create-resolvers", opts);
    testCompare(generated_resolver, data_test.river_many_to_many_cassandra_fieldResolver_Connection);
  });

  it("cassandra models - constructor", async function () {
    let opts = funks.getOptions(models_cassandra.city);
    let generated_model = await funks.generateJs(
      "create-models-cassandra",
      opts
    );
    testCompare(generated_model, data_test.cassandra_model_constructor);
  });

  it("cassandra models - readById city", async function () {
    let opts = funks.getOptions(models_cassandra.city);
    let generated_model = await funks.generateJs(
      "create-models-cassandra",
      opts
    );
    testCompare(generated_model, data_test.cassandra_model_readById);
  });

  it("cassandra models - countRecords city", async function () {
    let opts = funks.getOptions(models_cassandra.city);
    let generated_model = await funks.generateJs(
      "create-models-cassandra",
      opts
    );
    testCompare(generated_model, data_test.cassandra_model_countRecords);
  });

  it("cassandra models - readAllCursor city", async function () {
    let opts = funks.getOptions(models_cassandra.city);
    let generated_model = await funks.generateJs(
      "create-models-cassandra",
      opts
    );
    testCompare(generated_model, data_test.cassandra_model_readAllCursor);
  });

  it("cassandra models - addOne city", async function () {
    let opts = funks.getOptions(models_cassandra.city);
    let generated_model = await funks.generateJs(
      "create-models-cassandra",
      opts
    );
    testCompare(generated_model, data_test.cassandra_model_addOne);
  });

  it("cassandra models - deleteOne city", async function () {
    let opts = funks.getOptions(models_cassandra.city);
    let generated_model = await funks.generateJs(
      "create-models-cassandra",
      opts
    );
    testCompare(generated_model, data_test.cassandra_model_deleteOne);
  });

  it("cassandra models - updateOne city", async function () {
    let opts = funks.getOptions(models_cassandra.city);
    let generated_model = await funks.generateJs(
      "create-models-cassandra",
      opts
    );
    testCompare(generated_model, data_test.cassandra_model_updateOne);
  });

  it("cassandra models - fieldMutations add city", async function () {
    let opts = funks.getOptions(models_cassandra.incident);
    let generated_model = await funks.generateJs(
      "create-models-cassandra",
      opts
    );
    testCompare(generated_model, data_test.cassandra_model_fieldMutation_add);
  });

  it("cassandra models - fieldMutations remove city", async function () {
    let opts = funks.getOptions(models_cassandra.incident);
    let generated_model = await funks.generateJs(
      "create-models-cassandra",
      opts
    );
    testCompare(
      generated_model,
      data_test.cassandra_model_fieldMutation_remove
    );
  });

  it("cassandra models - fieldMutations bulkAssociation add city", async function () {
    let opts = funks.getOptions(models_cassandra.incident);
    let generated_model = await funks.generateJs(
      "create-models-cassandra",
      opts
    );
    testCompare(
      generated_model,
      data_test.cassandra_model_fieldMutation_bulkAssociate_add
    );
  });

  it("cassandra models - fieldMutations bulkAssociation remove city", async function () {
    let opts = funks.getOptions(models_cassandra.incident);
    let generated_model = await funks.generateJs(
      "create-models-cassandra",
      opts
    );
    testCompare(
      generated_model,
      data_test.cassandra_model_fieldMutation_bulkAssociate_remove
    );
  });

  it("cassandra ddm model - readAllCursor dist_incident", async function () {
    let opts = funks.getOptions(models_cassandra.dist_incident);
    let generated_model = await funks.generateJs(
      "create-distributed-model",
      opts
    );
    testCompare(generated_model, data_test.cassandra_ddm_model_readAllCursor);
  });

  it("cassandra ddm cassandra-adapter - readById dist_incident", async function () {
    let opts = funks.getOptions(models_cassandra.dist_instant_instance1);
    let generated_model = await funks.generateJs(
      "create-cassandra-adapter",
      opts
    );
    testCompare(
      generated_model,
      data_test.cassandra_ddm_cassandra_adapter_readById
    );
  });

  it("cassandra ddm cassandra-adapter - readAllCursor dist_incident", async function () {
    let opts = funks.getOptions(models_cassandra.dist_instant_instance1);
    let generated_model = await funks.generateJs(
      "create-cassandra-adapter",
      opts
    );
    testCompare(
      generated_model,
      data_test.cassandra_ddm_cassandra_adapter_readAllCursor
    );
  });
});

describe("MongoDb Unit Test", function () {
  let data_test = require("./unit_test_misc/test-describe/mongodb-unittest");

  it("mongodb model - animal constructor", async function () {
    let opts = funks.getOptions(models_mongodb.animal);
    let generated_model = await funks.generateJs("create-models-mongodb", opts);
    testCompare(generated_model, data_test.animal_constructor);
  });

  it("mongodb model - animal readById", async function () {
    let opts = funks.getOptions(models_mongodb.animal);
    let generated_model = await funks.generateJs("create-models-mongodb", opts);
    testCompare(generated_model, data_test.animal_readById);
  });

  it("mongodb model - animal countRecords", async function () {
    let opts = funks.getOptions(models_mongodb.animal);
    let generated_model = await funks.generateJs("create-models-mongodb", opts);
    testCompare(generated_model, data_test.animal_countRecords);
  });

  it("mongodb model - animal readAll", async function () {
    let opts = funks.getOptions(models_mongodb.animal);
    let generated_model = await funks.generateJs("create-models-mongodb", opts);
    testCompare(generated_model, data_test.animal_readAll);
  });

  it("mongodb model - animal readAllCursor", async function () {
    let opts = funks.getOptions(models_mongodb.animal);
    let generated_model = await funks.generateJs("create-models-mongodb", opts);
    testCompare(generated_model, data_test.animal_readAllCursor);
  });

  it("mongodb model - animal addOne", async function () {
    let opts = funks.getOptions(models_mongodb.animal);
    let generated_model = await funks.generateJs("create-models-mongodb", opts);
    testCompare(generated_model, data_test.animal_addOne);
  });

  it("mongodb model - animal deleteOne", async function () {
    let opts = funks.getOptions(models_mongodb.animal);
    let generated_model = await funks.generateJs("create-models-mongodb", opts);
    testCompare(generated_model, data_test.animal_deleteOne);
  });

  it("mongodb model - animal updateOne", async function () {
    let opts = funks.getOptions(models_mongodb.animal);
    let generated_model = await funks.generateJs("create-models-mongodb", opts);
    testCompare(generated_model, data_test.animal_updateOne);
  });

  it("mongodb model - animal bulkAddCsv", async function () {
    let opts = funks.getOptions(models_mongodb.animal);
    let generated_model = await funks.generateJs("create-models-mongodb", opts);
    testCompare(generated_model, data_test.animal_bulkAddCsv);
  });

  it("mongodb model - fieldMutations toOne - add farm to animal", async function () {
    let opts = funks.getOptions(models_mongodb.animal);
    let generated_model = await funks.generateJs("create-models-mongodb", opts);
    testCompare(generated_model, data_test.animal_fieldMutation_add_farm);
  });

  it("mongodb model - fieldMutations toOne - remove farm from animal", async function () {
    let opts = funks.getOptions(models_mongodb.animal);
    let generated_model = await funks.generateJs("create-models-mongodb", opts);
    testCompare(generated_model, data_test.animal_fieldMutation_remove_farm);
  });

  it("mongodb model - fieldMutations toMany - add food to animal", async function () {
    let opts = funks.getOptions(models_mongodb.animal);
    let generated_model = await funks.generateJs("create-models-mongodb", opts);
    testCompare(generated_model, data_test.animal_fieldMutation_add_food);
  });

  it("mongodb model - fieldMutations toMany - remove food from animal", async function () {
    let opts = funks.getOptions(models_mongodb.animal);
    let generated_model = await funks.generateJs("create-models-mongodb", opts);
    testCompare(generated_model, data_test.animal_fieldMutation_remove_food);
  });

  it("mongodb model - fieldMutations bulkAssociation - add farm to animal", async function () {
    let opts = funks.getOptions(models_mongodb.animal);
    let generated_model = await funks.generateJs("create-models-mongodb", opts);
    testCompare(
      generated_model,
      data_test.animal_fieldMutation_bulkAssociate_add
    );
  });

  it("mongodb model - fieldMutations bulkAssociation - remove farm from animal", async function () {
    let opts = funks.getOptions(models_mongodb.animal);
    let generated_model = await funks.generateJs("create-models-mongodb", opts);
    testCompare(
      generated_model,
      data_test.animal_fieldMutation_bulkAssociate_remove
    );
  });

  it("mongodb adapter - dist_animal_instance1 readById ", async function () {
    let opts = funks.getOptions(models_mongodb.dist_animal_instance1);
    let generated_model = await funks.generateJs(
      "create-mongodb-adapter",
      opts
    );
    testCompare(generated_model, data_test.mongodb_adapter_readById);
  });
});

describe("Amazon S3/ Minio Unit Test", function () {
  let data_test = require("./unit_test_misc/test-describe/amazonS3-unittest");

  it("Amazon S3 model - reader constructor", async function () {
    let opts = funks.getOptions(models_amazonS3.reader);
    let generated_model = await funks.generateJs(
      "create-models-amazonS3",
      opts
    );
    testCompare(generated_model, data_test.reader_constructor);
  });

  it("Amazon S3 model - reader readById", async function () {
    let opts = funks.getOptions(models_amazonS3.reader);
    let generated_model = await funks.generateJs(
      "create-models-amazonS3",
      opts
    );
    testCompare(generated_model, data_test.reader_readById);
  });

  it("Amazon S3 model - reader countRecords", async function () {
    let opts = funks.getOptions(models_amazonS3.reader);
    let generated_model = await funks.generateJs(
      "create-models-amazonS3",
      opts
    );
    testCompare(generated_model, data_test.reader_countRecords);
  });

  it("Amazon S3 model - reader readAllCursor", async function () {
    let opts = funks.getOptions(models_amazonS3.reader);
    let generated_model = await funks.generateJs(
      "create-models-amazonS3",
      opts
    );
    testCompare(generated_model, data_test.reader_readAllCursor);
  });

  it("Amazon S3 model - reader bulkAddCsv", async function () {
    let opts = funks.getOptions(models_amazonS3.reader);
    let generated_model = await funks.generateJs(
      "create-models-amazonS3",
      opts
    );
    testCompare(generated_model, data_test.reader_bulkAddCsv);
  });

  it("Amazon S3 adapter - dist_reader_instance1 readById ", async function () {
    let opts = funks.getOptions(models_amazonS3.dist_reader_instance1);
    let generated_model = await funks.generateJs(
      "create-amazonS3-adapter",
      opts
    );
    testCompare(generated_model, data_test.amazonS3_adapter_readById);
  });
});

describe("Trino/Presto Unit Test", () => {
  let data_test = require("./unit_test_misc/test-describe/trino-unittest.js");

  it("Trino model - doctor constructor", async () => {
    let opts = funks.getOptions(models_trino.doctor);
    let generated_model = await funks.generateJs("create-models-trino", opts);
    testCompare(generated_model, data_test.doctor_constructor);
  });

  it("Trino model - doctor readById", async () => {
    let opts = funks.getOptions(models_trino.doctor);
    let generated_model = await funks.generateJs("create-models-trino", opts);
    testCompare(generated_model, data_test.doctor_readById);
  });

  it("Trino model - doctor countRecords", async () => {
    let opts = funks.getOptions(models_trino.doctor);
    let generated_model = await funks.generateJs("create-models-trino", opts);
    testCompare(generated_model, data_test.doctor_countRecords);
  });

  it("Trino model - doctor readAll", async () => {
    let opts = funks.getOptions(models_trino.doctor);
    let generated_model = await funks.generateJs("create-models-trino", opts);
    testCompare(generated_model, data_test.doctor_readAll);
  });

  it("Trino model - doctor readAllCursor", async () => {
    let opts = funks.getOptions(models_trino.doctor);
    let generated_model = await funks.generateJs("create-models-trino", opts);
    testCompare(generated_model, data_test.doctor_readAllCursor);
  });

  it("Trino adapter - dist_doctor_instance1 readById ", async () => {
    let opts = funks.getOptions(models_trino.dist_doctor_instance1);
    let generated_model = await funks.generateJs("create-trino-adapter", opts);
    testCompare(generated_model, data_test.trino_adapter_readById);
  });
});

describe("Neo4j Unit Test", function () {
  let data_test = require("./unit_test_misc/test-describe/neo4j-unittest");

  it("neo4j model - movie constructor", async function () {
    let opts = funks.getOptions(models_neo4j.movie);
    let generated_model = await funks.generateJs("create-models-neo4j", opts);
    testCompare(generated_model, data_test.movie_constructor);
  });

  it("neo4j model - movie readById", async function () {
    let opts = funks.getOptions(models_neo4j.movie);
    let generated_model = await funks.generateJs("create-models-neo4j", opts);
    testCompare(generated_model, data_test.movie_readById);
  });

  it("neo4j model - movie countRecords", async function () {
    let opts = funks.getOptions(models_neo4j.movie);
    let generated_model = await funks.generateJs("create-models-neo4j", opts);
    testCompare(generated_model, data_test.movie_countRecords);
  });

  it("neo4j model - movie readAll", async function () {
    let opts = funks.getOptions(models_neo4j.movie);
    let generated_model = await funks.generateJs("create-models-neo4j", opts);
    testCompare(generated_model, data_test.movie_readAll);
  });

  it("neo4j model - movie readAllCursor", async function () {
    let opts = funks.getOptions(models_neo4j.movie);
    let generated_model = await funks.generateJs("create-models-neo4j", opts);
    testCompare(generated_model, data_test.movie_readAllCursor);
  });

  it("neo4j model - movie addOne", async function () {
    let opts = funks.getOptions(models_neo4j.movie);
    let generated_model = await funks.generateJs("create-models-neo4j", opts);
    testCompare(generated_model, data_test.movie_addOne);
  });

  it("neo4j model - movie deleteOne", async function () {
    let opts = funks.getOptions(models_neo4j.movie);
    let generated_model = await funks.generateJs("create-models-neo4j", opts);
    testCompare(generated_model, data_test.movie_deleteOne);
  });

  it("neo4j model - movie updateOne", async function () {
    let opts = funks.getOptions(models_neo4j.movie);
    let generated_model = await funks.generateJs("create-models-neo4j", opts);
    testCompare(generated_model, data_test.movie_updateOne);
  });

  it("neo4j model - movie bulkAddCsv", async function () {
    let opts = funks.getOptions(models_neo4j.movie);
    let generated_model = await funks.generateJs("create-models-neo4j", opts);
    testCompare(generated_model, data_test.movie_bulkAddCsv);
  });

  it("neo4j model - fieldMutations toOne - add director to movie", async function () {
    let opts = funks.getOptions(models_neo4j.movie);
    let generated_model = await funks.generateJs("create-models-neo4j", opts);
    testCompare(generated_model, data_test.movie_fieldMutation_add_director);
  });

  it("neo4j model - fieldMutations toOne - remove director from movie", async function () {
    let opts = funks.getOptions(models_neo4j.movie);
    let generated_model = await funks.generateJs("create-models-neo4j", opts);
    testCompare(generated_model, data_test.movie_fieldMutation_remove_director);
  });

  it("neo4j model - fieldMutations toMany - add actor to movie", async function () {
    let opts = funks.getOptions(models_neo4j.movie);
    let generated_model = await funks.generateJs("create-models-neo4j", opts);
    testCompare(generated_model, data_test.movie_fieldMutation_add_actor);
  });

  it("neo4j model - fieldMutations toMany - remove actor from movie", async function () {
    let opts = funks.getOptions(models_neo4j.movie);
    let generated_model = await funks.generateJs("create-models-neo4j", opts);
    testCompare(generated_model, data_test.movie_fieldMutation_remove_actor);
  });

  it("neo4j model - fieldMutations bulkAssociation - add director to movie", async function () {
    let opts = funks.getOptions(models_neo4j.movie);
    let generated_model = await funks.generateJs("create-models-neo4j", opts);
    testCompare(
      generated_model,
      data_test.movie_fieldMutation_bulkAssociate_add
    );
  });

  it("neo4j model - fieldMutations bulkAssociation - remove director from movie", async function () {
    let opts = funks.getOptions(models_neo4j.movie);
    let generated_model = await funks.generateJs("create-models-neo4j", opts);
    testCompare(
      generated_model,
      data_test.movie_fieldMutation_bulkAssociate_remove
    );
  });

  it("neo4j adapter - dist_movie_instance1 readById ", async function () {
    let opts = funks.getOptions(models_neo4j.dist_movie_instance1);
    let generated_model = await funks.generateJs("create-neo4j-adapter", opts);
    testCompare(generated_model, data_test.neo4j_adapter_readById);
  });
});
