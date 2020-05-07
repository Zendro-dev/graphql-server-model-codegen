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
    aminoAcidSequences: function({
        search,
        order,
        pagination
    }, context) {
        return checkAuthorization(context, 'aminoAcidSequence', 'read').then(async authorization => {
            if (authorization === true) {
                await checkCount(search, context, "aminoAcidSequences");
                let resultRecords = await aminoAcidSequence.readAll(search, order, pagination);
                checkCountAgainAndAdaptLimit(context, resultRecords.length, "aminoAcidSequences");
                return resultRecords;
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },
`

module.exports.schema_webservice_aminoAcid = `
type Query {
  aminoAcidSequences(search: searchAminoAcidSequenceInput, order: [ orderAminoAcidSequenceInput ], pagination: paginationInput ): [aminoAcidSequence]
  readOneAminoAcidSequence(id: ID!): aminoAcidSequence
  countAminoAcidSequences(search: searchAminoAcidSequenceInput ): Int
  vueTableAminoAcidSequence : VueTableAminoAcidSequence    csvTableTemplateAminoAcidSequence: [String]
  aminoAcidSequencesConnection(search: searchAminoAcidSequenceInput, order: [ orderAminoAcidSequenceInput ], pagination: paginationCursorInput ): AminoAcidSequenceConnection
}
`

module.exports.model_webservice_aminoAcid = `
module.exports = class aminoAcidSequence
`

module.exports.individual_resolvers_camelcase =`
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
    try {
        //build new search filter
        let nsearch = helper.addSearchField({
            "search": search,
            "field": "individual_id",
            "value": {
                "value": this.getIdValue()
            },
            "operator": "eq"
        });

        return resolvers.transcriptCounts({
            search: nsearch,
            order: order,
            pagination: pagination
        }, context);
    } catch (error) {
        console.error(error);
        handleError(error);
    };
}
`

module.exports.individual_schema_camelcase = `
type Mutation {
  addInDiVIdual( name: String , addTranscriptCounts:[ID], skipAssociationsExistenceChecks:Boolean = false ): inDiVIdual!
updateInDiVIdual(id: ID!, name: String , addTranscriptCounts:[ID], removeTranscriptCounts:[ID], skipAssociationsExistenceChecks:Boolean = false ): inDiVIdual!


deleteInDiVIdual(id: ID!): String!
bulkAddInDiVIdualCsv: [inDiVIdual] }
`

module.exports.individual_model_camelcase = `
module.exports = class inDiVIdual extends Sequelize.Model
`

module.exports.transcriptCount_schema_camelcase=`
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
  }
`

module.exports.transcriptCount_resolvers_camelcase=`
/**
     * readOneTranscriptCount - Check user authorization and return one record with the specified id in the id argument.
     *
     * @param  {number} {id}    id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with id requested
     */
    readOneTranscriptCount: function({
        id
    }, context) {
        return checkAuthorization(context, 'transcriptCount', 'read').then(authorization => {
            if (authorization === true) {
                checkCountForOne(context);
                let resultRecords = transcriptCount.readById(id);
                checkCountForOne(context);
                context.recordsLimit = context.recordsLimit - 1;
                return resultRecords;
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },
`
