module.exports.resolvers_webservice_aminoAcid = `
/**
     * aminoAcidSequences - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Offset and limit to get the records from and to respectively
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records holding conditions specified by search, order and pagination argument
     */
    aminoAcidSequences: async function({
        search,
        order,
        pagination
    }, context) {
        if (await checkAuthorization(context, 'aminoAcidSequence', 'read') === true) {
            helper.checkCountAndReduceRecordsLimit(pagination.limit, context, "aminoAcidSequences");
            return await aminoAcidSequence.readAll(search, order, pagination, context.benignErrors, context.request.headers.authorization);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },
`;

module.exports.schema_webservice_aminoAcid = `
type Query {
    aminoAcidSequences(search: searchAminoAcidSequenceInput, order: [ orderAminoAcidSequenceInput ], pagination: paginationInput! ): [aminoAcidSequence]
    readOneAminoAcidSequence(id: ID!): aminoAcidSequence
    countAminoAcidSequences(search: searchAminoAcidSequenceInput ): Int
    csvTableTemplateAminoAcidSequence: [String]
    aminoAcidSequencesConnection(search:searchAminoAcidSequenceInput, order: [ orderAminoAcidSequenceInput ], pagination: paginationCursorInput! ): AminoAcidSequenceConnection
    validateAminoAcidSequenceForCreation( accession: String, sequence: String    , skipAssociationsExistenceChecks:Boolean = false): Boolean!
    validateAminoAcidSequenceForUpdating(id: ID!, accession: String, sequence: String    , skipAssociationsExistenceChecks:Boolean = false): Boolean!
    validateAminoAcidSequenceForDeletion(id: ID!): Boolean!
    validateAminoAcidSequenceAfterReading(id: ID!): Boolean!
    """
    aminoAcidSequencesZendroDefinition would return the static Zendro data model definition
    """
    aminoAcidSequencesZendroDefinition: GraphQLJSONObject
  }
`;

module.exports.model_webservice_aminoAcid = `
module.exports = class aminoAcidSequence
`;

module.exports.individual_resolvers_camelcase = `
/**
 * inDiVIdual.prototype.transcriptCountsFilter - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Offset and limit to get the records from and to respectively
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of associated records holding conditions specified by search, order and pagination argument
 */
inDiVIdual.prototype.transcriptCountsFilter = function({
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

      return resolvers.transcriptCounts({
          search: nsearch,
          order: order,
          pagination: pagination
      }, context);
}
`;

module.exports.individual_schema_camelcase = `
type Mutation {
  addInDiVIdual( name: String , addTranscriptCounts:[ID], skipAssociationsExistenceChecks:Boolean = false ): inDiVIdual!
  updateInDiVIdual(id: ID!, name: String , addTranscriptCounts:[ID], removeTranscriptCounts:[ID], skipAssociationsExistenceChecks:Boolean = false ): inDiVIdual!
  deleteInDiVIdual(id: ID!): String!
}
`;

module.exports.individual_model_camelcase = `
module.exports = class inDiVIdual extends Sequelize.Model
`;

module.exports.transcriptCount_schema_camelcase = `
type transcriptCount{
  """
  @original-field
  """
  id: ID

  """
  @original-field
  """
  gene: String

  """
  @original-field
  """
  variable: String

  """
  @original-field
  """
  count: Float

  """
  @original-field
  """
  tissue_or_condition: String

  """
  @original-field
  """
  individual_id: Int

  inDiVIdual(search: searchInDiVIdualInput): inDiVIdual

  """
  @record as base64 encoded cursor for paginated connections
  """
  asCursor: String!
  }
`;

module.exports.transcriptCount_resolvers_camelcase = `
/**
     * readOneTranscriptCount - Check user authorization and return one record with the specified id in the id argument.
     *
     * @param  {number} {id}    id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with id requested
     */
    readOneTranscriptCount: async function({
        id
    }, context) {
        if (await checkAuthorization(context, 'transcriptCount', 'read') === true) {
            helper.checkCountAndReduceRecordsLimit(1, context, "readOneTranscriptCount");
            return await transcriptCount.readById(id, context.benignErrors, context.request.headers.authorization);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },
`;
