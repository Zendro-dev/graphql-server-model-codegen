
/**
 * Get the default database key of a given model.
 * @param {string} dataModel data model definition object
 */
exports.getDefaultDatabase = function (dataModel) {

  const dbIndex = {
    'sql': 'sql',
    'sql-adapter': 'sql',
  }

  const defaultDb = dbIndex[dataModel.storageType];

  return dataModel.database || defaultDb || '';

}