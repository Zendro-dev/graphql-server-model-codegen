module.exports.url_regex = `
const iriRegex = new RegExp('peopleLocal');
`

module.exports.constructor = `
static init(sequelize, DataTypes) {
    return super.init({

        internalPersonId: {
            type: Sequelize[dict['String']],
            primaryKey: true
        },
        firstName: {
            type: Sequelize[dict['String']]
        },
        lastName: {
            type: Sequelize[dict['String']]
        },
        email: {
            type: Sequelize[dict['String']]
        },
        companyId: {
            type: Sequelize[dict['Int']]
        }


    }, {
        modelName: "person",
        tableName: "people",
        sequelize
    });
}
`
module.exports.storageHandler = `
/**
 * Get the storage handler, which is a static property of the data model class.
 * @returns sequelize.
 */
get storageHandler() {
 return this.sequelize;
}
`
module.exports.recognizeId = `
static recognizeId(iri) {
    return iriRegex.test(iri);
}
`

module.exports.readById = `
static async readById(id) {
    let item = await peopleLocalSql.findByPk(id);
    if (item === null) {
        throw new Error(\`Record with ID = "\${id}" does not exist\`);
    }
    return item;
}
`


module.exports.addOne = `
static async addOne(input) {
      try {
          const result = await this.sequelize.transaction(async (t) => {
              let item = await super.create(input, {
                  transaction: t
              });
              return item;
          });
          return result;
      } catch (error) {
          throw error;
      }
    }`

module.exports.count = `
static countRecords(search) {
        let options = {};

        /*
         * Search conditions
         */
        if (search !== undefined && search !== null) {

            //check
            if (typeof search !== 'object') {
                throw new Error('Illegal "search" argument type, it must be an object.');
            }

            let arg = new searchArg(search);
            let arg_sequelize = arg.toSequelize();
            options['where'] = arg_sequelize;
        }
        return super.count(options);
    }
`
module.exports.readAllCursor = `
static async readAllCursor(search, order, pagination){
    // build the sequelize options object for cursor-based pagination
    let options = helper.buildCursorBasedSequelizeOptions(search, order, pagination, this.idAttribute());
    let records = await super.findAll(options);
    // get the first record (if exists) in the opposite direction to determine pageInfo.
    // if no cursor was given there is no need for an extra query as the results will start at the first (or last) page.
    let oppRecords = [];
    if (pagination && (pagination.after || pagination.before)) {
      let oppOptions = helper.buildOppositeSearchSequelize(search, order, {...pagination, includeCursor: false}, this.idAttribute());
      oppRecords = await super.findAll(oppOptions);
    }
    // build the graphql Connection Object
    let edges = helper.buildEdgeObject(records);
    let pageInfo = helper.buildPageInfo(edges, oppRecords, pagination);
    return {edges, pageInfo};
}
`


module.exports.deleteOne = `
    static async deleteOne(id) {
      let destroyed = await super.destroy({where:{[this.idAttribute()] : id} });
      if(destroyed !== 0){
        return 'Item successfully deleted';
      }else{
        throw new Error(\`Record with ID = \${id} does not exist or could not been deleted\`);
      }
    }`

module.exports.updateOne = `
    static async updateOne(input) {
      try {
        let result = await this.sequelize.transaction( async (t) =>{
            let to_update = await super.findByPk(input[this.idAttribute()]);
            if(to_update === null){
              throw new Error(\`Record with ID = \${input[this.idAttribute()]} does not exist\`);
            }
            let updated = await to_update.update( input, { transaction: t  } );
            return updated;
          });
          return result;
      } catch (error) {
          throw error;
      }
    }`



module.exports.removeWorks = `
  async _removeWorks(ids) {
      await helper.asyncForEach(ids, async id => {
          let record = await models.book.readById(id);
          await record.set_internalPersonId(null);
      });
  }
`

module.exports.addWorks = `
  async _addWorks(ids) {
       await  helper.asyncForEach(ids, async id => {
          let record = await models.book.readById(id);
          await record.set_internalPersonId(this.getIdValue());
      });
  }
`

module.exports.stripAssociations = `
stripAssociations() {
    let attributes = Object.keys(peopleLocalSql.definition.attributes);
    let data_values = _.pick(this, attributes);
    return data_values;
}
`

module.exports.getIdValue = `
getIdValue() {
    return this[peopleLocalSql.idAttribute()]
}
`

module.exports.idAttribute = `
static idAttribute() {
    return peopleLocalSql.definition.id.name;
}
`

module.exports.name = `
static get name() {
    return "peopleLocalSql";
}
`

module.exports.type = `
static get adapterType() {
        return 'sql-adapter';
    }
`

module.exports.targetKey_ddm =`
async set_internalPersonId(value) {
  let input = {
    [Book.idAttribute()] : this.getIdValue(),
    "addAuthor": value
  };
  return await Book.updateOne( input);
}
`
