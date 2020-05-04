const expect = require('chai').expect;
//const test = require('./unit_test_misc/data_test');
const models = require('./unit_test_misc/data_models');
const funks = require('../funks');
const models_webservice = require('./unit_test_misc/data_models_webservice');
const models_cenz = require('./unit_test_misc/data_models_cenz');
const models_distributed = require('./unit_test_misc/data_models_distributed');
const models_refactoring = require('./unit_test_misc/data_models_refactoring');
const requireFromString = require('require-from-string');

//const components_code = require('./unit_test_misc/components_code');

describe('Lower-case models', function(){

  let data_test = require('./unit_test_misc/test-describe/lower-case-models');

  it('Check correct queries and mutations in GraphQL Schema - transcript_count', async function(){
    let opts = funks.getOptions(models.transcript_count);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.transcript_count_schema.replace(/\s/g, '');
    expect(g_schema, 'Incorrect schema').to.have.string(test_schema);
  });

  it('Check correct association name in resolver - individual', async function(){
    let opts = funks.getOptions(models.individual);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.individual_resolvers_association.replace(/\s/g, '');
    expect(g_resolvers, 'Incorrect resolver').to.have.string(test_resolvers);
  });

  it('Check correct attributes and associations in model - individual', async function(){
    let opts = funks.getOptions(models.individual);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');

    let test_model_attributes = data_test.individual_model_attributes.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model_attributes);

    let test_model_associations = data_test.individual_model_associations.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model_associations);
  });

});

describe('Empty associations', function(){

  let data_test = require('./unit_test_misc/test-describe/empty-association');

  it('Check correct queries and mutations in GraphQL Schema - transcript_count (no assoc)', async function(){
    let opts = funks.getOptions(models.transcript_count_no_assoc);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.transcript_count_no_assoc_schema.replace(/\s/g, '');
    expect(g_schema, 'Incorrect schema').to.have.string(test_schema);
  });

  it('Check no association in resolvers - individual (no assoc)', async function(){
    let opts = funks.getOptions(models.individual_no_assoc);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.individual_no_assoc_resolvers.replace(/\s/g, '');
    expect(g_resolvers, 'Incorrect resolvers').to.have.string(test_resolvers);
  });

  it('Check no associations in model - transcript_count (no assoc)', async function(){
    let opts = funks.getOptions(models.transcript_count_no_assoc);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.transcript_count_no_assoc_model.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });


});

describe('Limit for records', function(){
  let data_test = require('./unit_test_misc/test-describe/limit-for-records');
  it('Model - book', async function(){
    let opts = funks.getOptions(models.book);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.limit_records_model.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });
});

describe('Better name for search argument', function(){

  let data_test = require('./unit_test_misc/test-describe/better-name-search-arg');

  it('Check search argument in GraphQL Schema - researcher', async function(){
    let opts = funks.getOptions(models.researcher);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.researcher_schema.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('Check search argument in resolvers - researcher', async function(){
    let opts = funks.getOptions(models.researcher);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.researcher_resolver.replace(/\s/g, '');
    expect(g_resolvers,'Incorrect resolvers').to.have.string(test_resolvers);
  });
});

describe('Count functionality', function(){
  let data_test = require('./unit_test_misc/test-describe/count-functionality');
  it('GraphQL Schema - individual', async function(){
    let opts = funks.getOptions(models.individual);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.individual_schema.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('Resolvers - individual', async function(){
    let opts = funks.getOptions(models.individual);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.individual_resolvers.replace(/\s/g, '');
    expect(g_resolvers,'Incorrect resolvers').to.have.string(test_resolvers);
  });

  it('Resolvers - specie', async function(){
    let opts = funks.getOptions(models.specie);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.specie_resolvers.replace(/\s/g, '');
    expect(g_resolvers,'Incorrect resolvers').to.have.string(test_resolvers);
  });
});


describe('VueTable - tableTemplate', function(){

  let data_test = require('./unit_test_misc/test-describe/vuetable-template');
  it('GraphQL Schema - book', async function(){
    let opts = funks.getOptions(models.book);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.book_schema.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('Resolvers - book', async function(){
    let opts = funks.getOptions(models.book);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.book_resolvers.replace(/\s/g, '');
    expect(g_resolvers,'Incorrect resolvers').to.have.string(test_resolvers);
  });
});

describe('Associations in query and resolvers', function(){
  let data_test = require('./unit_test_misc/test-describe/associations-in-query-and-resolver');
  it('GraphQL Schema - person', async function(){
    let opts = funks.getOptions(models.person);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.person_schema.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('Models - person', async function(){
    let opts = funks.getOptions(models.person);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.person_model.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });
});

describe('Stream upload file', function(){
  let data_test = require('./unit_test_misc/test-describe/stream-upload-file');
  it('Resolver - dog', async function(){
    let opts = funks.getOptions(models.dog);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.dog_resolvers.replace(/\s/g, '');
    expect(g_resolvers).to.have.string(test_resolvers);
  });

});

describe('Migrations', function(){
  let data_test = require('./unit_test_misc/test-describe/migrations');

  it('Migration - Person', async function(){
    let opts = funks.getOptions(models.person_indices);
    let generated_resolvers =await funks.generateJs('create-migrations', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.person_indices_migration.replace(/\s/g, '');
    expect(g_resolvers).to.have.string(test_resolvers);
  });


});

describe('Model naming cases ', function(){
  let data_test = require('./unit_test_misc/test-describe/model-naming-cases');
  it('Resolvers - aminoAcidSequence', async function(){
    let opts = funks.getOptions(models.aminoAcidSequence);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.resolvers_webservice_aminoAcid.replace(/\s/g, '');
    expect(g_resolvers).to.have.string(test_resolvers);
  });

  it('GraphQL Schema - aminoAcidSequence', async function(){
    let opts = funks.getOptions(models.aminoAcidSequence);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.schema_webservice_aminoAcid.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('Model - aminoAcidSequence', async function(){
    let opts = funks.getOptions(models.aminoAcidSequence);
    let generated_model =await funks.generateJs('create-models-webservice', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.model_webservice_aminoAcid.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });

  it('Resolvers - inDiVIdual', async function(){
    let opts = funks.getOptions(models.inDiVIdual_camelcase);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.individual_resolvers_camelcase.replace(/\s/g, '');
    expect(g_resolvers).to.have.string(test_resolvers);
  });

  it('GraphQL Schema - inDiVIdual', async function(){
    let opts = funks.getOptions(models.inDiVIdual_camelcase);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.individual_schema_camelcase.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('Model - inDiVIdual', async function(){
    let opts = funks.getOptions(models.inDiVIdual_camelcase);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.individual_model_camelcase.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });

  it('GraphQL Schema - transcriptCount', async function(){
    let opts = funks.getOptions(models.transcriptCount_camelcase);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.transcriptCount_schema_camelcase.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('Resolvers - transcriptCount', async function(){
    let opts = funks.getOptions(models.transcriptCount_indiv);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.transcriptCount_resolvers_camelcase.replace(/\s/g, '');
    expect(g_resolvers).to.have.string(test_resolvers);
  });

});

describe('Association naming', function(){

  let data_test = require('./unit_test_misc/test-describe/association-naming');

  it('Resolvers - Dog', async function(){
    let opts = funks.getOptions(models.dog_owner);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.dog_owner_resolvers.replace(/\s/g, '');
    expect(g_resolvers).to.have.string(test_resolvers);
  });

  it('GraphQL Schema - Dog', async function(){
    let opts = funks.getOptions(models.dog_owner);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.dog_owner_schema.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('Model - Dog', async function(){
    let opts = funks.getOptions(models.dog_owner);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.dog_owner_model.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });

  it('Resolvers - academicTeam', async function(){
    let opts = funks.getOptions(models.academicTeam);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.academicTeam_resolvers.replace(/\s/g, '');
    expect(g_resolvers).to.have.string(test_resolvers);
  });

  it('GraphQL Schema - academicTeam', async function(){
    let opts = funks.getOptions(models.academicTeam);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.academicTeam_schema.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('Model - academicTeam', async function(){
    let opts = funks.getOptions(models.academicTeam);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.academicTeam_model.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });


});

describe('Indices', function(){

  let data_test = require('./unit_test_misc/test-describe/indices');

  it('Migration - Person', async function(){
    let opts = funks.getOptions(models.person_indices);
    let generated_migration =await funks.generateJs('create-migrations', opts);
    let g_migration = generated_migration.replace(/\s/g, '');
    let test_migration = data_test.person_indices_migration.replace(/\s/g, '');
    expect(g_migration).to.have.string(test_migration);
  });

  it('Model - Person', async function(){
    let opts = funks.getOptions(models.person_indices);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.person_indices_model.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });
});

describe('Monkey patching templates', function(){

  let data_test = require('./unit_test_misc/test-describe/monkey-patching');

    it('Validation - transcriptCount_indiv', async function(){
        let opts = funks.getOptions(models.transcriptCount_indiv);
        let generated_validation =await funks.generateJs('create-validations', opts);
        let g_validation = generated_validation.replace(/\s/g, '');
        let test_validation = data_test.transcriptCount_indiv_validation.replace(/\s/g, '');
        expect(g_validation).to.have.string(test_validation);
    });

    it('Patch - dog_owner', async function(){
        let opts = funks.getOptions(models.dog_owner);
        let generated_patch =await funks.generateJs('create-patches', opts);
        let g_patch = generated_patch.replace(/\s/g, '');
        let test_patch = data_test.dog_owner_patch.replace(/\s/g, '');
        expect(g_patch).to.have.string(test_patch);
    });
});

describe('All webservice models', function(){

  let data_test = require('./unit_test_misc/test-describe/all-webservice');

  it('GraphQL Schema - book', async function(){
    let opts = funks.getOptions(models_webservice.book);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.schema_book.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('Resolvers - book', async function(){
    let opts = funks.getOptions(models_webservice.book);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.resolvers_book.replace(/\s/g, '');
    expect(g_resolvers).to.have.string(test_resolvers);
  });

  it('Model - book', async function(){
    let opts = funks.getOptions(models_webservice.book);
    let generated_model =await funks.generateJs('create-models-webservice', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.model_book.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });

  it('GraphQL Schema - person', async function(){
    let opts = funks.getOptions(models_webservice.person);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.schema_person.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('Resolvers - person', async function(){
    let opts = funks.getOptions(models_webservice.person);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.resolvers_person.replace(/\s/g, '');
    expect(g_resolvers).to.have.string(test_resolvers);
  });

  it('Model - person', async function(){
    let opts = funks.getOptions(models_webservice.person);
    let generated_model =await funks.generateJs('create-models-webservice', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.model_person.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });

  it('Model name class - person', async function(){
    let opts = funks.getOptions(models_webservice.person);
    let generated_model =await funks.generateJs('create-models-webservice', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.class_name_model_person.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
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
//     let opts = funks.getOptions(models_webservice.publisher);
//     let generated_model =await funks.generateJs('create-models-webservice', opts);
//     let model = requireFromString(generated_model);
//
//     // check any existing property of the 'publisher' definition
//     expect(model.definition.associations.publications.target === 'book');
//   });
//
// });

describe('Implement date/time types', function(){

  let data_test = require('./unit_test_misc/test-describe/date-time');

  it('Model - Person', async function(){
    let opts = funks.getOptions(models.person_date);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.person_date_model.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });

  it('Schema - Person', async function(){
    let opts = funks.getOptions(models.person_date);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.person_date_schema.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('Migration - Person', async function(){
    let opts = funks.getOptions(models.person_date);
    let generated_migration =await funks.generateJs('create-migrations', opts);
    let g_migration = generated_migration.replace(/\s/g, '');
    let test_migration = data_test.person_date_migration.replace(/\s/g, '');
    expect(g_migration).to.have.string(test_migration);
  });

  it('Model - Academic Team', async function(){
    let opts = funks.getOptions(models.academic_Team);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.academic_Team_model_time.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });

});

describe('Update sequelize model to class', function(){

  let data_test = require('./unit_test_misc/test-describe/sequelize-model-class');
  it('Model init - Book', async function(){
    let opts = funks.getOptions(models.book_authors);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.book_model_init.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });

  it('Model associations - Book', async function(){
    let opts = funks.getOptions(models.book_authors);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.book_model_associations.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });

  it('Model read by id - Book', async function(){
    let opts = funks.getOptions(models.book_authors);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.book_model_read_by_id.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });



});

describe('Model Layer', function(){

  let data_test = require('./unit_test_misc/test-describe/model-layer');
  it('Count method in sequelize model - individual', async function(){
    let opts = funks.getOptions(models.individual);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.count_in_sequelize_model.replace(/\s/g, '');
    expect(g_model, 'No count method found').to.have.string(test_model);
  });

  it('Model - publisher', async function(){
    let opts = funks.getOptions(models_webservice.publisher);
    let generated_model =await funks.generateJs('create-models-webservice', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.count_in_webservice_model.replace(/\s/g, '');
    expect(g_model, 'No count method found').to.have.string(test_model);
  })

  it('Count resolver - dog', async function(){
    let opts = funks.getOptions(models.dog);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolver = data_test.count_in_resolvers.replace(/\s/g, '');
    expect(g_resolvers, 'No count method found').to.have.string(test_resolver);
  });

  it('Read all model - dog', async function(){
    let opts = funks.getOptions(models.dog);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.read_all.replace(/\s/g, '');
    expect(g_model, 'No read all method found').to.have.string(test_model);
  })

  it('Read all resolver - dog', async function(){
    let opts = funks.getOptions(models.dog);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolver = data_test.read_all_resolver.replace(/\s/g, '');
    expect(g_resolvers, 'No read all method found').to.have.string(test_resolver);
  });

  it('Add one model - book', async function(){
    let opts = funks.getOptions(models.book_authors);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.add_one_model.replace(/\s/g, '');
    expect(g_model, 'No add one method found').to.have.string(test_model);
  })

  it('Add one resolver - book', async function(){
    let opts = funks.getOptions(models.book_authors);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolver = data_test.add_one_resolver.replace(/\s/g, '');
    expect(g_resolvers, 'No add one method found').to.have.string(test_resolver);
  });

  it('Delete one model - book', async function(){
    let opts = funks.getOptions(models.book_authors);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.delete_one_model.replace(/\s/g, '');
    expect(g_model, 'No add one method found').to.have.string(test_model);
  })

  it('Add one resolver - book', async function(){
    let opts = funks.getOptions(models.book_authors);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolver = data_test.delete_one_resolver.replace(/\s/g, '');
    expect(g_resolvers, 'No add one method found').to.have.string(test_resolver);
  });

  it('Update one model - book', async function(){
    let opts = funks.getOptions(models.book_authors);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.update_one_model.replace(/\s/g, '');
    expect(g_model, 'No add one method found').to.have.string(test_model);
  })

  it('Update one resolver - book', async function(){
    let opts = funks.getOptions(models.book_authors);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolver = data_test.update_one_resolver.replace(/\s/g, '');
    expect(g_resolvers, 'No add one method found').to.have.string(test_resolver);
  });


  it('Bulk Add model - book', async function(){
    let opts = funks.getOptions(models.book_authors);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.bulk_add_model.replace(/\s/g, '');
    expect(g_model, 'No add one method found').to.have.string(test_model);
  })

  it('Bulk Add resolver - book', async function(){
    let opts = funks.getOptions(models.book_authors);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolver = data_test.bulk_add_resolver.replace(/\s/g, '');
    expect(g_resolvers, 'No add one method found').to.have.string(test_resolver);
  });


  it('Table template model - individual', async function(){
    let opts = funks.getOptions(models.individual);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.table_template_model.replace(/\s/g, '');
    expect(g_model, 'No add one method found').to.have.string(test_model);
  })

  it('Table template resolver - individual', async function(){
    let opts = funks.getOptions(models.individual);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolver = data_test.table_template_resolver.replace(/\s/g, '');
    expect(g_resolvers, 'No add one method found').to.have.string(test_resolver);
  });


});

describe('Decouple association from resolvers', function(){

  let data_test = require('./unit_test_misc/test-describe/decouple-associations');

  // Check for changes!
  it('BelongsTo implementation in model - dog', async function(){
    let opts = funks.getOptions(models.dog);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.belongsTo_model.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

  it('BelongsTo implementation in resolver - dog', async function(){
    let opts = funks.getOptions(models.dog);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolver = data_test.belongsTo_resolver.replace(/\s/g, '');
    expect(g_resolvers, 'No method found').to.have.string(test_resolver);
  });

  // Check for changes!
  it('HasOne implementation in model - researcher', async function(){
    let opts = funks.getOptions(models.researcher);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.hasOne_model.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

  it('HasOne implementation in resolver - researcher', async function(){
    let opts = funks.getOptions(models.researcher);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolver = data_test.hasOne_resolver.replace(/\s/g, '');
    expect(g_resolvers, 'No method found').to.have.string(test_resolver);
  });

  it('BelongsTo implementation in schema - dog', async function(){
    let opts = funks.getOptions(models.dog);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.belongsTo_schema.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('HasOne implementation in schema - researcher', async function(){
    let opts = funks.getOptions(models.researcher);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.hasOne_schema.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('HasMany implementation in model - individual', async function(){
    let opts = funks.getOptions(models.individual);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.hasMany_model.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

  it('HasMany implementation in resolver - individual', async function(){
    let opts = funks.getOptions(models.individual);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolver = data_test.hasMany_resolver.replace(/\s/g, '');
    expect(g_resolvers, 'No method found').to.have.string(test_resolver);
  });

  it('Count (association) implementation in model - individual', async function(){
    let opts = funks.getOptions(models.individual);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.countAssociated_model.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

  it('HasMany (association) implementation in resolver - individual', async function(){
    let opts = funks.getOptions(models.individual);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolver = data_test.countAssociated_resolver.replace(/\s/g, '');
    expect(g_resolvers, 'No method found').to.have.string(test_resolver);
  });


  it('BelongsToMany implementation in model - book', async function(){
    let opts = funks.getOptions(models.book_authors);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.belongsToMany_model.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

  it('BelongsToMany implementation in model count - book', async function(){
    let opts = funks.getOptions(models.book_authors);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.belongsToMany_model_count.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

  it('BelongsToMany implementation in resolver - book', async function(){
    let opts = funks.getOptions(models.book_authors);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolver = data_test.belongsToMany_resolver.replace(/\s/g, '');
    expect(g_resolvers, 'No method found').to.have.string(test_resolver);
  });

  it('BelongsToMany count implementation in resolver - book', async function(){
    let opts = funks.getOptions(models.book_authors);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolver = data_test.belongsToMany_resolver_count.replace(/\s/g, '');
    expect(g_resolvers, 'No method found').to.have.string(test_resolver);
  });

});


describe('Description for attributes', function(){

  let data_test = require('./unit_test_misc/test-describe/description-attributes');
  it('Description in schema - person', async function(){
    let opts = funks.getOptions(models.person_description);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.person_schema.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('Optional description in object type - person', async function(){
    let opts = funks.getOptions(models.person_description_optional);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.person_schema_description_optional.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

});


describe('Cenz servers', function(){

  let data_test = require('./unit_test_misc/test-describe/cenz-servers');

  it('Set url  - book', async function(){
    let opts = funks.getOptions(models_cenz.book);
    let generated_model =await funks.generateJs('create-models-cenz', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.server_url.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

  it('Read by id  - book', async function(){
    let opts = funks.getOptions(models_cenz.book);
    let generated_model =await funks.generateJs('create-models-cenz', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.read_by_id.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

  it('Read all  - book', async function(){
    let opts = funks.getOptions(models_cenz.book);
    let generated_model =await funks.generateJs('create-models-cenz', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.read_all.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

  it('Count Records  - book', async function(){
    let opts = funks.getOptions(models_cenz.book);
    let generated_model =await funks.generateJs('create-models-cenz', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.count_records.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

  it('AddOne  - book', async function(){
    let opts = funks.getOptions(models_cenz.book);
    let generated_model =await funks.generateJs('create-models-cenz', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.add_one.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

  it('Delete by id  - book', async function(){
    let opts = funks.getOptions(models_cenz.book);
    let generated_model =await funks.generateJs('create-models-cenz', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.delete_by_id.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

  it('UpdateOne  - book', async function(){
    let opts = funks.getOptions(models_cenz.book);
    let generated_model =await funks.generateJs('create-models-cenz', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.update_one.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

  it('csvTemplate  - book', async function(){
    let opts = funks.getOptions(models_cenz.book);
    let generated_model =await funks.generateJs('create-models-cenz', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.csv_template.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

  it('bulkAddCsv  - book', async function(){
    let opts = funks.getOptions(models_cenz.book);
    let generated_model =await funks.generateJs('create-models-cenz', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.bulk_add_csv.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

  // Check for changes!
  it('Many to many association  - person', async function(){
    let opts = funks.getOptions(models_cenz.person);
    let generated_model =await funks.generateJs('create-models-cenz', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.many_to_many_association.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

  // Check for changes!
  it('Many to many count association  - person', async function(){
    let opts = funks.getOptions(models_cenz.person);
    let generated_model =await funks.generateJs('create-models-cenz', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.many_to_many_association_count.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })
});

describe('Cursor based pagination', function(){

  let data_test = require('./unit_test_misc/test-describe/cursor-based-pagination');
  it('Type connection - book', async function(){
    let opts = funks.getOptions(models.book);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.connection_book_schema.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('Connection query - book', async function(){
    let opts = funks.getOptions(models.book);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.connection_book_query.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('Connection read all resolver - book', async function(){
    let opts = funks.getOptions(models.book);
    let generated_resolver =await funks.generateJs('create-resolvers', opts);
    let g_resolver = generated_resolver.replace(/\s/g, '');
    let test_resolver = data_test.resolver_read_all_connection.replace(/\s/g, '');
    expect(g_resolver, 'No method found').to.have.string(test_resolver);
  });

  it('Connection read all model - book', async function(){
    let opts = funks.getOptions(models.book);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.model_read_all_connection.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

  it('Association connection query - person', async function(){
    let opts = funks.getOptions(models.person);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.schema_to_many_association.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('Association connection resolver - person', async function(){
    let opts = funks.getOptions(models.person);
    let generated_resolver =await funks.generateJs('create-resolvers', opts);
    let g_resolver = generated_resolver.replace(/\s/g, '');
    let test_resolver = data_test.resolver_to_many_association.replace(/\s/g, '');
    expect(g_resolver, 'No method found').to.have.string(test_resolver);
  });

  it('Many-to-many connection model - person', async function(){
    let opts = funks.getOptions(models.person);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.model_many_to_many_association.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

  it('Read all connection in cenz server  - book', async function(){
    let opts = funks.getOptions(models_cenz.book);
    let generated_model =await funks.generateJs('create-models-cenz', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.read_all_cenz_server.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

  // Check for changes!
  it('Many to many association connection in cenz server  - person-book', async function(){
    let opts = funks.getOptions(models_cenz.person);
    let generated_model =await funks.generateJs('create-models-cenz', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.many_to_many_association_connection_cenz_server.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

});

describe('Distributed data models', function(){

  let data_test = require('./unit_test_misc/test-describe/distributed-models');
  it('ReadById adapter- book', async function(){
    let opts = funks.getOptions(models_distributed.book);
    let generated_adapter =await funks.generateJs('create-cenz-adapters', opts);
    let g_adapter = generated_adapter.replace(/\s/g, '');
    let test_adapter = data_test.book_adapter_readById.replace(/\s/g, '');
    expect(g_adapter,'Incorrect adapter').to.have.string(test_adapter);
  });

  it('Count Records adapter- book', async function(){
    let opts = funks.getOptions(models_distributed.book);
    let generated_adapter =await funks.generateJs('create-cenz-adapters', opts);
    let g_adapter = generated_adapter.replace(/\s/g, '');
    let test_adapter = data_test.book_adapter_count.replace(/\s/g, '');
    expect(g_adapter,'Incorrect adapter').to.have.string(test_adapter);
  });

  it('Read All Records adapter- book', async function(){
    let opts = funks.getOptions(models_distributed.book);
    let generated_adapter =await funks.generateJs('create-cenz-adapters', opts);
    let g_adapter = generated_adapter.replace(/\s/g, '');
    let test_adapter = data_test.book_adapter_read_all.replace(/\s/g, '');
    expect(g_adapter,'Incorrect adapter').to.have.string(test_adapter);
  });

  it('Registry distributed data model- book', async function(){
    let opts = funks.getOptions(models_distributed.book_ddm);
    let generated_adapter =await funks.generateJs('create-distributed-model', opts);
    let g_adapter = generated_adapter.replace(/\s/g, '');
    let test_adapter = data_test.book_ddm_registry.replace(/\s/g, '');
    expect(g_adapter,'Incorrect distributed data model').to.have.string(test_adapter);
  });

  it('ReadById distributed data model- book', async function(){
    let opts = funks.getOptions(models_distributed.book_ddm);
    let generated_adapter =await funks.generateJs('create-distributed-model', opts);
    let g_adapter = generated_adapter.replace(/\s/g, '');
    let test_adapter = data_test.book_ddm_readById.replace(/\s/g, '');
    expect(g_adapter,'Incorrect distributed data model').to.have.string(test_adapter);
  });

  it('Count distributed data model- book', async function(){
    let opts = funks.getOptions(models_distributed.book_ddm);
    let generated_adapter =await funks.generateJs('create-distributed-model', opts);
    let g_adapter = generated_adapter.replace(/\s/g, '');
    let test_adapter = data_test.book_ddm_count.replace(/\s/g, '');
    expect(g_adapter,'Incorrect distributed data model').to.have.string(test_adapter);
  });

  it('Read all distributed data model- book', async function(){
    let opts = funks.getOptions(models_distributed.book_ddm);
    let generated_adapter =await funks.generateJs('create-distributed-model', opts);
    let g_adapter = generated_adapter.replace(/\s/g, '');
    let test_adapter = data_test.book_ddm_read_all.replace(/\s/g, '');
    expect(g_adapter,'Incorrect distributed data model').to.have.string(test_adapter);
  });

  // Check for changes!
  it('To-many association distributed data model- person', async function(){
    let opts = funks.getOptions(models_distributed.person_ddm);
    let generated_adapter =await funks.generateJs('create-distributed-model', opts);
    let g_adapter = generated_adapter.replace(/\s/g, '');
    let test_adapter = data_test.person_ddm_many_association.replace(/\s/g, '');
    expect(g_adapter,'Incorrect distributed data model').to.have.string(test_adapter);
  });

  // Check for changes!
  it('To-one association distributed data model- dog', async function(){
    let opts = funks.getOptions(models_distributed.dog_ddm);
    let generated_adapter =await funks.generateJs('create-distributed-model', opts);
    let g_adapter = generated_adapter.replace(/\s/g, '');
    let test_adapter = data_test.dog_ddm_one_association.replace(/\s/g, '');
    expect(g_adapter,'Incorrect distributed data model').to.have.string(test_adapter);
  });

});

describe('To-one associations editing', function(){

  let data_test = require('./unit_test_misc/test-describe/to-one-assoc-edit');
  it('Associations in schema - dog', async function(){
    let opts = funks.getOptions(models.dog_one_assoc);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.dog_schema.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('AddOne with to-one association - person', async function(){
    let opts = funks.getOptions(models.person_one_assoc);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.person_addOne_model.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

  it('Update with to-one association - person', async function(){
    let opts = funks.getOptions(models.person_one_assoc);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.person_update_model.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

});

describe('External ids', function(){
  let data_test = require('./unit_test_misc/test-describe/external-ids');
  it('Migration externalIds - Person', async function(){
    let opts = funks.getOptions(models.person_externalIds);
    let generated_resolvers =await funks.generateJs('create-migrations', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.person_externalIds_migration.replace(/\s/g, '');
    expect(g_resolvers).to.have.string(test_resolvers);
  });

  it('Get array external ids - person', async function(){
    let opts = funks.getOptions(models.person_externalIds);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.externalIdsArray.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

  it('Get object external ids - person', async function(){
    let opts = funks.getOptions(models.person_externalIds);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.externalIdsObject.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })
});

describe('Extend api model layer associations', function(){
  let data_test = require('./unit_test_misc/test-describe/extended-api-model-layer');

  it('Add to-one association foreign key in source', async function(){
    let opts = funks.getOptions(models.transcript_count);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.to_add_individual.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

  it('Add to-one association foreign key in target', async function(){
    let opts = funks.getOptions(models.person_one_assoc);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.to_add_unique_pet.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

  it('Remove to-one association foreign key in source', async function(){
    let opts = funks.getOptions(models.transcript_count);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.remove_individual.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

  it('Remove to-one association foreign key in target', async function(){
    let opts = funks.getOptions(models.person_one_assoc);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.remove_unique_pet.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

});

describe('Create and update transaction', function(){
  let data_test = require('./unit_test_misc/test-describe/transaction-create-update');
  it('Update - transcript_count', async function(){
    let opts = funks.getOptions(models.transcript_count);
    let generated_resolvers =await funks.generateJs('create-models', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.update_transcript_count.replace(/\s/g, '');
    expect(g_resolvers).to.have.string(test_resolvers);
  });
});

describe('extended ids', function(){
  let data_test = require('./unit_test_misc/test-describe/extended-internal-ids');

  it('idAttribute - book', async function(){
    let opts = funks.getOptions(models.book_extendedIds);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.book_idAttribute.replace(/\s/g, '');
    expect(g_model).to.have.string(test_model);
  });

  it('idAttributeType - book', async function(){
    let opts = funks.getOptions(models.book_extendedIds);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.book_idAttributeType.replace(/\s/g, '');
    expect(g_model).to.have.string(test_model);
  });

  it('getIdValue - book', async function(){
    let opts = funks.getOptions(models.book_extendedIds);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.book_getIdValue.replace(/\s/g, '');
    expect(g_model).to.have.string(test_model);
  });

  it('internalId as sequelize primaryKey - book', async function(){
    let opts = funks.getOptions(models.book_extendedIds);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.book_sequelize_primaryKey.replace(/\s/g, '');
    expect(g_model).to.have.string(test_model);
  });

});


describe('SQL-adapter', function(){
  let data_test = require('./unit_test_misc/test-describe/sql-adapter');

  it('regex - peopleLocal', async function(){
    let opts = funks.getOptions(models_distributed.person_adapter_sql);
    let generated_adapter =await funks.generateJs('create-sql-adapter', opts);
    let g_adapter = generated_adapter.replace(/\s/g, '');
    let test_adapter = data_test.url_regex.replace(/\s/g, '');
    expect(g_adapter).to.have.string(test_adapter);
  });

  it('constructor - peopleLocal', async function(){
    let opts = funks.getOptions(models_distributed.person_adapter_sql);
    let generated_adapter =await funks.generateJs('create-sql-adapter', opts);
    let g_adapter = generated_adapter.replace(/\s/g, '');
    let test_adapter = data_test.constructor.replace(/\s/g, '');
    expect(g_adapter).to.have.string(test_adapter);
  });

  it('recognizeId - peopleLocal', async function(){
    let opts = funks.getOptions(models_distributed.person_adapter_sql);
    let generated_adapter =await funks.generateJs('create-sql-adapter', opts);
    let g_adapter = generated_adapter.replace(/\s/g, '');
    let test_adapter = data_test.recognizeId.replace(/\s/g, '');
    expect(g_adapter).to.have.string(test_adapter);
  });

  it('readById - peopleLocal', async function(){
    let opts = funks.getOptions(models_distributed.person_adapter_sql);
    let generated_adapter =await funks.generateJs('create-sql-adapter', opts);
    let g_adapter = generated_adapter.replace(/\s/g, '');
    let test_adapter = data_test.readById.replace(/\s/g, '');
    expect(g_adapter).to.have.string(test_adapter);
  });

  it('addOne - peopleLocal', async function(){
    let opts = funks.getOptions(models_distributed.person_adapter_sql);
    let generated_adapter =await funks.generateJs('create-sql-adapter', opts);
    let g_adapter = generated_adapter.replace(/\s/g, '');
    let test_adapter = data_test.addOne.replace(/\s/g, '');
    expect(g_adapter).to.have.string(test_adapter);
  });

  it('count - peopleLocal', async function(){
    let opts = funks.getOptions(models_distributed.person_adapter_sql);
    let generated_adapter =await funks.generateJs('create-sql-adapter', opts);
    let g_adapter = generated_adapter.replace(/\s/g, '');
    let test_adapter = data_test.count.replace(/\s/g, '');
    expect(g_adapter).to.have.string(test_adapter);
  });

  it('readAllCursor - peopleLocal', async function(){
    let opts = funks.getOptions(models_distributed.person_adapter_sql);
    let generated_adapter =await funks.generateJs('create-sql-adapter', opts);
    let g_adapter = generated_adapter.replace(/\s/g, '');
    let test_adapter = data_test.readAllCursor.replace(/\s/g, '');
    expect(g_adapter).to.have.string(test_adapter);
  });

  it('deleteOne - peopleLocal', async function(){
    let opts = funks.getOptions(models_distributed.person_adapter_sql);
    let generated_adapter =await funks.generateJs('create-sql-adapter', opts);
    let g_adapter = generated_adapter.replace(/\s/g, '');
    let test_adapter = data_test.deleteOne.replace(/\s/g, '');
    expect(g_adapter).to.have.string(test_adapter);
  });

  it('updateOne - peopleLocal', async function(){
    let opts = funks.getOptions(models_distributed.person_adapter_sql);
    let generated_adapter =await funks.generateJs('create-sql-adapter', opts);
    let g_adapter = generated_adapter.replace(/\s/g, '');
    let test_adapter = data_test.updateOne.replace(/\s/g, '');
    expect(g_adapter).to.have.string(test_adapter);
  });

  it('stripAssociations - peopleLocal', async function(){
    let opts = funks.getOptions(models_distributed.person_adapter_sql);
    let generated_adapter =await funks.generateJs('create-sql-adapter', opts);
    let g_adapter = generated_adapter.replace(/\s/g, '');
    let test_adapter = data_test.stripAssociations.replace(/\s/g, '');
    expect(g_adapter).to.have.string(test_adapter);
  });

  it('getIdValue - peopleLocal', async function(){
    let opts = funks.getOptions(models_distributed.person_adapter_sql);
    let generated_adapter =await funks.generateJs('create-sql-adapter', opts);
    let g_adapter = generated_adapter.replace(/\s/g, '');
    let test_adapter = data_test.getIdValue.replace(/\s/g, '');
    expect(g_adapter).to.have.string(test_adapter);
  });

  it('idAttribute - peopleLocal', async function(){
    let opts = funks.getOptions(models_distributed.person_adapter_sql);
    let generated_adapter =await funks.generateJs('create-sql-adapter', opts);
    let g_adapter = generated_adapter.replace(/\s/g, '');
    let test_adapter = data_test.idAttribute.replace(/\s/g, '');
    expect(g_adapter).to.have.string(test_adapter);
  });

  it('type - peopleLocal', async function(){
    let opts = funks.getOptions(models_distributed.person_adapter_sql);
    let generated_adapter =await funks.generateJs('create-sql-adapter', opts);
    let g_adapter = generated_adapter.replace(/\s/g, '');
    let test_adapter = data_test.type.replace(/\s/g, '');
    expect(g_adapter).to.have.string(test_adapter);
  });

});

describe('Parse associations', function() {
  it('01. Single to_one association', function() {
      let associations = models.transcript_count.associations;
      let res = funks.parseAssociations(associations, 'sql');
      expect(res).to.deep.equal({
        schema_attributes: {
          many:{},
          one:{
            individual:["individual", "Individual", "Individual"]
          }
        },
        to_one:[
          {
            type:"to_one",
            target:"individual",
            targetKey:"individual_id",
            keyIn:"transcript_count",
            targetStorageType:"sql",
            name:"individual",
            name_lc:"individual",
            name_cp:"Individual",
            target_lc:"individual",
            target_lc_pl:"individuals",
            target_pl:"individuals",
            target_cp:"Individual",
            target_cp_pl:"Individuals",
            keyIn_lc:"transcript_count",
            holdsForeignKey:true
          }
        ],
        to_many:[],
        to_many_through_sql_cross_table:[],
        foreignKeyAssociations:{
          individual:"individual_id"
        },
        associations:[
          {
            type:"to_one",
            target:"individual",
            targetKey:"individual_id",
            keyIn:"transcript_count",
            targetStorageType:"sql",
            name:"individual",
            name_lc:"individual",
            name_cp:"Individual",
            target_lc:"individual",
            target_lc_pl:"individuals",
            target_pl:"individuals",
            target_cp:"Individual",
            target_cp_pl:"Individuals",
            keyIn_lc:"transcript_count",
            holdsForeignKey:true
          }
        ],
        mutations_attributes:""
      });
  });

  it('02. Single to_many association', function() {
    let associations = models.individual.associations;
    let res = funks.parseAssociations(associations, 'sql');
    expect(res).to.deep.equal({
      schema_attributes:{
        many:{
          transcript_counts:["transcript_count","Transcript_count","Transcript_counts"]
        },
        one:{}
      },
      to_one:[],
      to_many:[
        {
          type:"to_many",
          target:"transcript_count",
          keyIn:"transcript_count",
          targetKey:"individual_id",
          targetStorageType:"sql",
          name:"transcript_counts",
          name_lc:"transcript_counts",
          name_cp:"Transcript_counts",
          target_lc:"transcript_count",
          target_lc_pl:"transcript_counts",
          target_pl:"transcript_counts",
          target_cp:"Transcript_count",
          target_cp_pl:"Transcript_counts",
          keyIn_lc:"transcript_count",
          holdsForeignKey:false
        }
      ],
      to_many_through_sql_cross_table:[],
      foreignKeyAssociations:{
        transcript_counts:"individual_id"
      },
      associations:[
        {
          type:"to_many",
          target:"transcript_count",
          keyIn:"transcript_count",
          targetKey:"individual_id",
          targetStorageType:"sql",
          name:"transcript_counts",
          name_lc:"transcript_counts",
          name_cp:"Transcript_counts",
          target_lc:"transcript_count",
          target_lc_pl:"transcript_counts",
          target_pl:"transcript_counts",
          target_cp:"Transcript_count",
          target_cp_pl:"Transcript_counts",
          keyIn_lc:"transcript_count",
          holdsForeignKey:false
        }
      ],
      mutations_attributes:""
    });
  });

  it('03. Single to_many_through_sql_cross_table', function() {
    let association = models.assoc_through_project_researcher;
    association.type = 'to_many_through_sql_cross_table';
    let associations = {assoc: association};
    let res = funks.parseAssociations(associations, 'sql');
    expect(res).to.deep.equal({
      schema_attributes:{
        many:{
          assoc:["Project","Project","Assoc"]
        },
        one:{}
      },
      to_one:[],
      to_many:[],
      to_many_through_sql_cross_table:[
        {
          type:"to_many_through_sql_cross_table",
          target:"Project",
          targetKey:"projectId",
          sourceKey:"researcherId",
          keysIn:"project_to_researcher",
          targetStorageType:"sql",
          source:"researchers",
          target_lc:"project",
          target_lc_pl:"projects",
          target_pl:"Projects",
          target_cp:"Project",
          target_cp_pl:"Projects",
          name:"assoc",
          name_lc:"assoc",
          name_cp:"Assoc",
          holdsForeignKey:false
        }
      ],
      foreignKeyAssociations:{
        assoc:"projectId"
      },
      associations:[
        {
          type:"to_many_through_sql_cross_table",
          target:"Project",
          targetKey:"projectId",
          sourceKey:"researcherId",
          keysIn:"project_to_researcher",
          targetStorageType:"sql",
          source:"researchers",
          target_lc:"project",
          target_lc_pl:"projects",
          target_pl:"Projects",
          target_cp:"Project",
          target_cp_pl:"Projects",
          name:"assoc",
          name_lc:"assoc",
          name_cp:"Assoc",
          holdsForeignKey:false
        }
      ],
      mutations_attributes:""
    });
  });

  it('04. Two associations: to_many and to_many_through_sql_cross_table', function() {
    let associations = models.person.associations;
    associations.books.type = "to_many_through_sql_cross_table"
    let res = funks.parseAssociations(associations, 'sql');
    expect(res).to.deep.equal({
      schema_attributes:{
        many:{
          dogs:["Dog","Dog","Dogs"],
          books:["Book","Book","Books"]
        },
        one:{}
      },
      to_one:[],
      to_many:[
        {
          type:"to_many",
          target:"Dog",
          targetKey:"personId",
          keyIn:"Dog",
          targetStorageType:"sql",
          name:"dogs",
          name_lc:"dogs",
          name_cp:"Dogs",
          target_lc:"dog",
          target_lc_pl:"dogs",
          target_pl:"Dogs",
          target_cp:"Dog",
          target_cp_pl:"Dogs",
          keyIn_lc:"dog",
          holdsForeignKey:false
        }
      ],
      to_many_through_sql_cross_table:[
        {
          type:"to_many_through_sql_cross_table",
          target:"Book",
          targetKey:"bookId",
          sourceKey:"personId",
          keysIn:"books_to_people",
          targetStorageType:"sql",
          name:"books",
          name_lc:"books",
          name_cp:"Books",
          target_lc:"book",
          target_lc_pl:"books",
          target_pl:"Books",
          target_cp:"Book",
          target_cp_pl:"Books",
          holdsForeignKey:false
        }
      ],
      foreignKeyAssociations:{
        dogs:"personId",
        books:"bookId"
      },
      associations:[
        {
          type:"to_many",
          target:"Dog",
          targetKey:"personId",
          keyIn:"Dog",
          targetStorageType:"sql",
          name:"dogs",
          name_lc:"dogs",
          name_cp:"Dogs",
          target_lc:"dog",
          target_lc_pl:"dogs",
          target_pl:"Dogs",
          target_cp:"Dog",
          target_cp_pl:"Dogs",
          keyIn_lc:"dog",
          holdsForeignKey:false
        },
        {
          type:"to_many_through_sql_cross_table",
          target:"Book",
          targetKey:"bookId",
          sourceKey:"personId",
          keysIn:"books_to_people",
          targetStorageType:"sql",
          name:"books",
          name_lc:"books",
          name_cp:"Books",
          target_lc:"book",
          target_lc_pl:"books",
          target_pl:"Books",
          target_cp:"Book",
          target_cp_pl:"Books",
          holdsForeignKey:false
        }
      ],
      mutations_attributes:""
    });
  });

  it('05. Two associations: Twice to_one', function() {
    let associations = models.dog.associations;
    let res = funks.parseAssociations(associations, 'sql');
    expect(res).to.deep.equal({
      schema_attributes:{
        many:{},
        one:{
          person:["Person","Person","Person"],
          researcher:["Researcher","Researcher","Researcher"]
        }
      },
      to_one:[
        {
          type:"to_one",
          target:"Person",
          targetKey:"personId",
          keyIn:"Dog",
          targetStorageType:"sql",
          label:"firstName",
          sublabel:"lastName",
          name:"person",
          name_lc:"person",
          name_cp:"Person",
          target_lc:"person",
          target_lc_pl:"people",
          target_pl:"People",
          target_cp:"Person",
          target_cp_pl:"People",
          keyIn_lc:"dog",
          holdsForeignKey:true
        },
        {
          type:"to_one",
          target:"Researcher",
          targetKey:"researcherId",
          keyIn:"Dog",
          targetStorageType:"sql",
          label:"firstName",
          name:"researcher",
          name_lc:"researcher",
          name_cp:"Researcher",
          target_lc:"researcher",
          target_lc_pl:"researchers",
          target_pl:"Researchers",
          target_cp:"Researcher",
          target_cp_pl:"Researchers",
          keyIn_lc:"dog",
          holdsForeignKey:true
        }
      ],
      to_many:[],
      to_many_through_sql_cross_table:[],
      foreignKeyAssociations:{
        person:"personId",
        researcher:"researcherId"
      },
      associations:[
        {
          type:"to_one",
          target:"Person",
          targetKey:"personId",
          keyIn:"Dog",
          targetStorageType:"sql",
          label:"firstName",
          sublabel:"lastName",
          name:"person",
          name_lc:"person",
          name_cp:"Person",
          target_lc:"person",
          target_lc_pl:"people",
          target_pl:"People",
          target_cp:"Person",
          target_cp_pl:"People",
          keyIn_lc:"dog",
          holdsForeignKey:true
        },
        {
          type:"to_one",
          target:"Researcher",
          targetKey:"researcherId",
          keyIn:"Dog",
          targetStorageType:"sql",
          label:"firstName",
          name:"researcher",
          name_lc:"researcher",
          name_cp:"Researcher",
          target_lc:"researcher",
          target_lc_pl:"researchers",
          target_pl:"Researchers",
          target_cp:"Researcher",
          target_cp_pl:"Researchers",
          keyIn_lc:"dog",
          holdsForeignKey:true
        }
      ],
      mutations_attributes:""
    });
  })

});

describe('Refactor associations - delete', function(){
  let data_test = require('./unit_test_misc/test-describe/refactoring-associations');

  it('count associations - accession', async function(){
    let opts = funks.getOptions(models_refactoring.accession);
    let generated_resolver =await funks.generateJs('create-resolvers', opts);
    let g_resolver = generated_resolver.replace(/\s/g, '');
    let test_resolver = data_test.count_associations.replace(/\s/g, '');
    expect(g_resolver).to.have.string(test_resolver);
  });

  it('validate for deletion  - accession', async function(){
    let opts = funks.getOptions(models_refactoring.accession);
    let generated_resolver =await funks.generateJs('create-resolvers', opts);
    let g_resolver = generated_resolver.replace(/\s/g, '');
    let test_resolver = data_test.validate_for_deletion.replace(/\s/g, '');
    expect(g_resolver).to.have.string(test_resolver);
  });

  it('delete resolver - accession', async function(){
    let opts = funks.getOptions(models_refactoring.accession);
    let generated_resolver =await funks.generateJs('create-resolvers', opts);
    let g_resolver = generated_resolver.replace(/\s/g, '');
    let test_resolver = data_test.delete_resolver.replace(/\s/g, '');
    expect(g_resolver).to.have.string(test_resolver);
  });

  it('validate for deletion ddm - accession', async function(){
    let opts = funks.getOptions(models_refactoring.accession_ddm);
    let generated_resolver =await funks.generateJs('create-resolvers-ddm', opts);
    let g_resolver = generated_resolver.replace(/\s/g, '');
    let test_resolver = data_test.valid_for_deletion_ddm.replace(/\s/g, '');
    expect(g_resolver).to.have.string(test_resolver);
  });

});


describe('Refactor associations - add - remove', function(){
  let data_test = require('./unit_test_misc/test-describe/refactoring-associations');

  it('handle associations - accession', async function(){
    let opts = funks.getOptions(models_refactoring.accession_ddm);
    let generated_resolver =await funks.generateJs('create-resolvers-ddm', opts);
    let g_resolver = generated_resolver.replace(/\s/g, '');
    let test_resolver = data_test.handle_associations.replace(/\s/g, '');
    expect(g_resolver).to.have.string(test_resolver);
  });

  it('add to-one association - accession', async function(){
    let opts = funks.getOptions(models_refactoring.accession_ddm);
    let generated_resolver =await funks.generateJs('create-resolvers-ddm', opts);
    let g_resolver = generated_resolver.replace(/\s/g, '');
    let test_resolver = data_test.to_one_add.replace(/\s/g, '');
    expect(g_resolver).to.have.string(test_resolver);
  });

  it('remove to-one association - accession', async function(){
    let opts = funks.getOptions(models_refactoring.accession_ddm);
    let generated_resolver =await funks.generateJs('create-resolvers-ddm', opts);
    let g_resolver = generated_resolver.replace(/\s/g, '');
    let test_resolver = data_test.to_one_remove.replace(/\s/g, '');
    expect(g_resolver).to.have.string(test_resolver);
  });

  it('add to-many association - accession', async function(){
    let opts = funks.getOptions(models_refactoring.accession_ddm);
    let generated_resolver =await funks.generateJs('create-resolvers-ddm', opts);
    let g_resolver = generated_resolver.replace(/\s/g, '');
    let test_resolver = data_test.to_many_add.replace(/\s/g, '');
    expect(g_resolver).to.have.string(test_resolver);
  });

  it('remove to-many association - accession', async function(){
    let opts = funks.getOptions(models_refactoring.accession_ddm);
    let generated_resolver =await funks.generateJs('create-resolvers-ddm', opts);
    let g_resolver = generated_resolver.replace(/\s/g, '');
    let test_resolver = data_test.to_many_remove.replace(/\s/g, '');
    expect(g_resolver).to.have.string(test_resolver);
  });

  it('add association model layer - accession', async function(){
    let opts = funks.getOptions(models_refactoring.accession_ddm);
    let generated_resolver =await funks.generateJs('create-distributed-model', opts);
    let g_resolver = generated_resolver.replace(/\s/g, '');
    let test_resolver = data_test.add_assoc_ddm_model.replace(/\s/g, '');
    expect(g_resolver).to.have.string(test_resolver);
  });

  it('remove association model layer - accession', async function(){
    let opts = funks.getOptions(models_refactoring.accession_ddm);
    let generated_resolver =await funks.generateJs('create-distributed-model', opts);
    let g_resolver = generated_resolver.replace(/\s/g, '');
    let test_resolver = data_test.remove_assoc_ddm_model.replace(/\s/g, '');
    expect(g_resolver).to.have.string(test_resolver);
  });

  it('add association in cenzontle-webservice-adapter  - accession', async function(){
    let opts = funks.getOptions(models_refactoring.accession_sql_adapter);
    let generated_adapter =await funks.generateJs('create-cenz-adapters', opts);
    let g_adapter = generated_adapter.replace(/\s/g, '');
    let test_adapter = data_test.to_one_add_cenz_adapter.replace(/\s/g, '');
    expect(g_adapter).to.have.string(test_adapter);
  });

  it('remove association in cenzontle-webservice-adapter - accession', async function(){
    let opts = funks.getOptions(models_refactoring.accession_sql_adapter);
    let generated_adapter =await funks.generateJs('create-cenz-adapters', opts);
    let g_adapter = generated_adapter.replace(/\s/g, '');
    let test_adapter = data_test.to_one_remove_cenz_adapter.replace(/\s/g, '');
    expect(g_adapter).to.have.string(test_adapter);
  });
});
