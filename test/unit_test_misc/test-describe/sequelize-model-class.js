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
  item = Book.postReadCast(item)
return validatorUtil.validateData('validateAfterRead', this, item);
}
`
