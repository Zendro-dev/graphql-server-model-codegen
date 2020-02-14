module.exports.project_to_researcher_migration = `
return queryInterface.createTable('project_to_researcher', {

    createdAt: {
        type: Sequelize.DATE
    },

    updatedAt: {
        type: Sequelize.DATE
    },

    researcherId: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
            model: 'researchers',
            key: 'id'
        }
    },

    projectId: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
            model: 'projects',
            key: 'id'
        }
    }
})
`

module.exports.person_indices_migration = `
.then(()=>{
  queryInterface.addIndex('people', ['email'])
}).then(()=>{
  queryInterface.addIndex('people', ['phone'])
});
`
