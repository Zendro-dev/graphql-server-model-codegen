module.exports.person_indices_migration = `
await storageHandler.getQueryInterface().addIndex('people', ['email']);
await storageHandler.getQueryInterface().addIndex('people', ['phone']);
`;

module.exports.person_indices_model = `
{
    indexes: ['email', 'phone'],
    modelName: "person",
    tableName: "people",
    sequelize
}
`;
