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
module.exports.arr_migration = `
return queryInterface.createTable('arrs', {

    arrId: {
        type: Sequelize[dict['String']],
        primaryKey: true
    },

    createdAt: {
        type: Sequelize.DATE
    },

    updatedAt: {
        type: Sequelize.DATE
    },

    country: {
        type: Sequelize[dict['String']]
    },
    arrStr: {
        type: Sequelize.ARRAY(Sequelize[dict['String']])
    },
    arrInt: {
        type: Sequelize.ARRAY(Sequelize[dict['Int']])
    },
    arrFloat: {
        type: Sequelize.ARRAY(Sequelize[dict['Float']])
    },
    arrBool: {
        type: Sequelize.ARRAY(Sequelize[dict['Boolean']])
    },
    arrDate: {
        type: Sequelize.ARRAY(Sequelize[dict['Date']])
    },
    arrTime: {
        type: Sequelize.ARRAY(Sequelize[dict['Time']])
    },
    arrDateTime: {
        type: Sequelize.ARRAY(Sequelize[dict['DateTime']])
    }

});
`