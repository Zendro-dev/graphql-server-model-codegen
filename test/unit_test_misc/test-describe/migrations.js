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
        type: Sequelize.STRING,
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
        type: Sequelize[dict['[String]']]
    },
    arrInt: {
        type: Sequelize[dict['[Int]']]
    },
    arrFloat: {
        type: Sequelize[dict['[Float]']]
    },
    arrBool: {
        type: Sequelize[dict['[Boolean]']]
    },
    arrDate: {
        type: Sequelize[dict['[Date]']]
    },
    arrTime: {
        type: Sequelize[dict['[Time]']]
    },
    arrDateTime: {
        type: Sequelize[dict['[DateTime]']]
    }

});
`
