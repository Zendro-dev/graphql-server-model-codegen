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

module.exports.book_model_storage_handler = `
get storageHandler() {
  // return sequelize as storageHandler
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
