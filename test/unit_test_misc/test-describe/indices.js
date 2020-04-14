module.exports.person_indices_migration = `
.then(()=>{
  queryInterface.addIndex('people', ['email'])
}).then(()=>{
  queryInterface.addIndex('people', ['phone'])
});
`

module.exports.person_indices_model = `
{
    indexes: ['email', 'phone'],
    modelName: "person",
    tableName: "people",
    sequelize
}
`
