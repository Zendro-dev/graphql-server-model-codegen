module.exports.transcript_count_schema = `
type Query {
  transcript_counts(search: searchTranscript_countInput, order: [ orderTranscript_countInput ], pagination: paginationInput ): [transcript_count]
  readOneTranscript_count(id: ID!): transcript_count
  countTranscript_counts(search: searchTranscript_countInput ): Int
  vueTableTranscript_count : VueTableTranscript_count    csvTableTemplateTranscript_count: [String]

  transcript_countsConnection(search: searchTranscript_countInput, order: [ orderTranscript_countInput ], pagination: paginationCursorInput ): Transcript_countConnection
}

  type Mutation {
    addTranscript_count( gene: String, variable: String, count: Float, tissue_or_condition: String, individual_id: Int, addIndividual:ID   ): transcript_count!
  updateTranscript_count(id: ID!, gene: String, variable: String, count: Float, tissue_or_condition: String, individual_id: Int, addIndividual:ID, removeIndividual: ID  ): transcript_count!

`

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
  return this.transcript_countsFilterImpl({search, order, pagination});
}
`

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
`

module.exports.individual_model_associations = `
static associate(models) {

    individual.hasMany(models.transcript_count, {
        as: 'transcript_counts',
        foreignKey: 'individual_id'
    });
}
`
