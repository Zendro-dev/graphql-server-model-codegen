module.exports.book_model_init = `
static init(sequelize, DataTypes){
  return super.init(
    {
      title: {
          type: Sequelize[ dict['String'] ]
      },
      genre: {
          type: Sequelize[ dict['String'] ]
      },
      publisherId: {
          type: Sequelize[dict['Int']]
      }
    },
    {
      modelName: "book",
      tableName: "books",
      sequelize
    }
  );
}
`

module.exports.array_model_init = `
static init(sequelize, DataTypes) {
  return super.init({

      arrId: {
          type: Sequelize[dict['String']],
          primaryKey: true
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


  }, {
      modelName: "arr",
      tableName: "arrs",
      sequelize
  });
}
`
module.exports.book_model_storage_handler = `
/**
 * Get the storage handler, which is a static property of the data model class.
 * @returns sequelize.
 */
get storageHandler() {
 return this.sequelize;
}
`

module.exports.book_model_associations = `
static associate(models){
  Book.belongsToMany(models.person, {
      as: 'Authors',
      foreignKey: 'book_Id',
      through: 'books_to_people',
      onDelete: 'CASCADE'
  });
}
`

module.exports.book_model_read_by_id = `
static async readById(id) {
  let item = await Book.findByPk(id);
  if (item === null) {
      throw new Error(\`Record with ID = "\${id}" does not exist\`);
  }
return validatorUtil.validateData('validateAfterRead', this, item);
}
`
