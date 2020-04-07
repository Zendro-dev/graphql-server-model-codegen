module.exports.person_indices_migration = `
.then(()=>{
  queryInterface.addIndex('people', ['email'])
}).then(()=>{
  queryInterface.addIndex('people', ['phone'])
}).then(()=>{
  queryInterface.addIndex('people', ['id'])
});
`

module.exports.person_indices_model = `
{
    indexes: ['email', 'phone','id'],
    modelName: "person",
    tableName: "people",
    sequelize
}
`
