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
        type: Sequelize[dict['[String]']],
        defaultValue: '[]'
    },
    arrInt: {
        type: Sequelize[dict['[Int]']],
        defaultValue: '[]'
    },
    arrFloat: {
        type: Sequelize[dict['[Float]']],
        defaultValue: '[]'
    },
    arrBool: {
        type: Sequelize[dict['[Boolean]']],
        defaultValue: '[]'
    },
    arrDate: {
        type: Sequelize[dict['[Date]']],
        defaultValue: '[]'
    },
    arrTime: {
        type: Sequelize[dict['[Time]']],
        defaultValue: '[]'
    },
    arrDateTime: {
        type: Sequelize[dict['[DateTime]']],
        defaultValue: '[]'
    }

});
`
