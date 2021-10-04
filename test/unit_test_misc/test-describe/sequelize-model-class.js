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
`;

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
`;
module.exports.book_model_storage_handler = `
/**
 * Get the storage handler, which is a static property of the data model class.
 * @returns sequelize.
 */
get storageHandler() {
 return this.sequelize;
}
`;

module.exports.book_model_associations = `
static associate(models){
  book.belongsToMany(models.person, {
      as: 'Authors',
      foreignKey: 'book_Id',
      through: 'books_to_people',
      onDelete: 'CASCADE'
  });
}
`;

module.exports.book_model_read_by_id = `
/**
 * Batch function for readById method.
 * @param  {array} keys  keys from readById method
 * @return {array}       searched results
 */
static async batchReadById(keys) {
    let queryArg = {
        operator: "in",
        field: book.idAttribute(),
        value: keys.join(),
        valueType: "Array",
    };
    let cursorRes = await book.readAllCursor(queryArg);
    cursorRes = cursorRes.books.reduce(
        (map, obj) => ((map[obj[book.idAttribute()]] = obj), map), {}
    );
    return keys.map(
        (key) =>
        cursorRes[key] || new Error(\`Record with ID = "\${key}" does not exist\`)
    );
}

static readByIdLoader = new DataLoader(book.batchReadById, {
    cache: false,
});

/**
  * readById - The model implementation for reading a single record given by its ID
  *
  * Read a single record by a given ID
  * @param {string} id - The ID of the requested record
  * @return {object} The requested record as an object with the type book, or an error object if the validation after reading fails
  * @throws {Error} If the requested record does not exist
  */
static async readById(id) {
    return await book.readByIdLoader.load(id);
}
`;
