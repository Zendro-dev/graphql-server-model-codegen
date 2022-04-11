module.exports.transcript_count_no_assoc_schema = `
type Query {
    transcript_counts(search: searchTranscript_countInput, order: [ orderTranscript_countInput ], pagination: paginationInput! ): [transcript_count]
    readOneTranscript_count(id: ID!): transcript_count
    countTranscript_counts(search: searchTranscript_countInput ): Int
    csvTableTemplateTranscript_count: [String]
    transcript_countsConnection(search:searchTranscript_countInput, order: [ orderTranscript_countInput ], pagination: paginationCursorInput! ): Transcript_countConnection
    validateTranscript_countForCreation( gene: String, variable: String, count: Float, tissue_or_condition: String    , skipAssociationsExistenceChecks:Boolean = false): Boolean!
    validateTranscript_countForUpdating(id: ID!, gene: String, variable: String, count: Float, tissue_or_condition: String    , skipAssociationsExistenceChecks:Boolean = false): Boolean!
    validateTranscript_countForDeletion(id: ID!): Boolean!
    validateTranscript_countAfterReading(id: ID!): Boolean!
    """
    transcript_countsZendroDefinition would return the static Zendro data model definition
    """
    transcript_countsZendroDefinition: GraphQLJSONObject
  }

  type Mutation {
    addTranscript_count( gene: String, variable: String, count: Float, tissue_or_condition: String, skipAssociationsExistenceChecks:Boolean = false  ): transcript_count!
    updateTranscript_count(id: ID!, gene: String, variable: String, count: Float, tissue_or_condition: String, skipAssociationsExistenceChecks:Boolean = false ): transcript_count!
    deleteTranscript_count(id: ID!): String!
}
`;

module.exports.individual_no_assoc_resolvers = `
/**
     * individuals - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Offset and limit to get the records from and to respectively
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records holding conditions specified by search, order and pagination argument
     */
    individuals: async function({
      search,
      order,
      pagination
  }, context) {
      if (await checkAuthorization(context, 'individual', 'read') === true) {
          helper.checkCountAndReduceRecordsLimit(pagination.limit, context, "individuals");
          return await individual.readAll(search, order, pagination, context.benignErrors);
      } else {
          throw new Error("You don't have authorization to perform this action");
      }
  }
  ,`;

module.exports.transcript_count_no_assoc_model = `
static associate(models) {

}
`;
