
/**
 * Get the default database key of a given model.
 * @param {string} dataModel data model definition object
 */
exports.getModelDatabase = function (dataModel) {

  // Sanity check: storageType is a required property, but database
  // should be set only for supported storage types.
  const validStorage = {
    'sql': 'default-sql',
    'sql-adapter': 'default-sql',
  }

  const storageType = dataModel.storageType.toLowerCase();

  const defaultDb = validStorage[storageType];

  return dataModel.database || defaultDb || '';

}