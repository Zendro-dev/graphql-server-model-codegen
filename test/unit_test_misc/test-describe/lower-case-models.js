module.exports.transcript_count_schema = `
type Query {
    transcript_counts(search: searchTranscript_countInput, order: [ orderTranscript_countInput ], pagination: paginationInput! ): [transcript_count]
    readOneTranscript_count(id: ID!): transcript_count
    countTranscript_counts(search: searchTranscript_countInput ): Int
    csvTableTemplateTranscript_count: [String]
    transcript_countsConnection(search:searchTranscript_countInput, order: [ orderTranscript_countInput ], pagination: paginationCursorInput! ): Transcript_countConnection
    validateTranscript_countForCreation( gene: String, variable: String, count: Float, tissue_or_condition: String , addIndividual:ID   , skipAssociationsExistenceChecks:Boolean = false): Boolean!
    validateTranscript_countForUpdating(id: ID!, gene: String, variable: String, count: Float, tissue_or_condition: String , addIndividual:ID, removeIndividual:ID    , skipAssociationsExistenceChecks:Boolean = false): Boolean!
    validateTranscript_countForDeletion(id: ID!): Boolean!
    validateTranscript_countAfterReading(id: ID!): Boolean!
    """
    transcript_countsZendroDefinition would return the static Zendro data model definition
    """
    transcript_countsZendroDefinition: GraphQLJSONObject
  }

  type Mutation {
    addTranscript_count( gene: String, variable: String, count: Float, tissue_or_condition: String,  addIndividual:ID, skipAssociationsExistenceChecks:Boolean = false  ): transcript_count!
    updateTranscript_count(id: ID!, gene: String, variable: String, count: Float, tissue_or_condition: String, addIndividual:ID, removeIndividual: ID, skipAssociationsExistenceChecks:Boolean = false  ): transcript_count!
`;

module.exports.individual_resolvers_association = `
/**
 * individual.prototype.transcript_countsFilter - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Offset and limit to get the records from and to respectively
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of associated records holding conditions specified by search, order and pagination argument
 */
individual.prototype.transcript_countsFilter = function({
    search,
    order,
    pagination
}, context) {
    //build new search filter
    let nsearch = helper.addSearchField({
        "search": search,
        "field": "individual_id",
        "value": this.getIdValue(),
        "operator": "eq"
    });

    return resolvers.transcript_counts({
        search: nsearch,
        order: order,
        pagination: pagination
    }, context);
}
`;

module.exports.individual_model_attributes = `
static init(sequelize, DataTypes){
  return super.init({

      name: {
          type: Sequelize[ dict['String'] ]
      }


  },{
    modelName: "individual",
    tableName: "individuals",
    sequelize
  });
}
`;

module.exports.individual_model_associations = `
static associate(models) {

    individual.hasMany(models.transcript_count, {
        as: 'transcript_counts',
        foreignKey: 'individual_id'
    });
}
`;
