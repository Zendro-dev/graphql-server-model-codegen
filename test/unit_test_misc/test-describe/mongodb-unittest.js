module.exports.animal_constructor = `
constructor(input) {
  for (let key of Object.keys(input)) {
      this[key] = input[key];
  }
}
`;

module.exports.animal_readById = `
/**
 * Batch function for readById method.
 * @param  {array} keys  keys from readById method
 * @return {array}       searched results
 */
static async batchReadById(keys) {
    let queryArg = {
        operator: "in",
        field: animal.idAttribute(),
        value: keys.join(),
        valueType: "Array",
    };
    let cursorRes = await animal.readAllCursor(queryArg);
    cursorRes = cursorRes.animals.reduce(
        (map, obj) => ((map[obj[animal.idAttribute()]] = obj), map), {}
    );
    return keys.map(
        (key) =>
        cursorRes[key] || new Error(\`Record with ID = "\${key}" does not exist\`)
    );
}

static readByIdLoader = new DataLoader(animal.batchReadById, {
    cache: false,
});

/**
 * readById - The model implementation for reading a single record given by its ID
 *
 * This method is the implementation for reading a single record for the MongoDb storage type, based on MongoDb node driver.
 * @param {string} id - The ID of the requested record
 * @return {object} The requested record as an object with the type animal, or an error object if the validation after reading fails
 * @throws {Error} If the requested record does not exist
 */
static async readById(id) {
    return await animal.readByIdLoader.load(id);
}
`;

module.exports.animal_countRecords = `
static async countRecords(search) {
    const filter = mongoDbHelper.searchConditionsToMongoDb(search);
    const db = await this.storageHandler;
    const collection = await db.collection("animal");
    const number = await collection.countDocuments(filter);
    return number;
}
`;

module.exports.animal_readAll = `
static async readAll(search, order, pagination, benignErrorReporter) {
    // build the filter object for limit-offset-based pagination
    const filter = mongoDbHelper.searchConditionsToMongoDb(search);
    const sort = mongoDbHelper.orderConditionsToMongoDb(order, this.idAttribute(), true);

    const limit = pagination.limit ? pagination.limit : undefined;
    const offset = pagination.offset ? pagination.offset : 0;

    const db = await this.storageHandler;
    const collection = await db.collection("animal");
    let documents = await collection.find(filter).skip(offset).limit(limit).sort(sort).toArray();
    documents = documents.map(doc => new animal(doc));
    // validationCheck after read
    return validatorUtil.bulkValidateData('validateAfterRead', this, documents, benignErrorReporter);

}
`;

module.exports.animal_readAllCursor = `
static async readAllCursor(search, order, pagination, benignErrorReporter) {
    let isForwardPagination = helper.isForwardPagination(pagination);
    // build the filter object.
    let filter = mongoDbHelper.searchConditionsToMongoDb(search);
    let newOrder = isForwardPagination ? order : helper.reverseOrderConditions(order);
    // depending on the direction build the order object
    let sort = mongoDbHelper.orderConditionsToMongoDb(newOrder, this.idAttribute(), isForwardPagination);
    let orderFields = newOrder ? newOrder.map(x => x.field) : [];
    // extend the filter for the given order and cursor
    filter = mongoDbHelper.cursorPaginationArgumentsToMongoDb(pagination, sort, filter, orderFields, this.idAttribute());

    // add +1 to the LIMIT to get information about following pages.
    let limit;
    if (pagination) {
        limit = helper.isNotUndefinedAndNotNull(pagination.first) ?
            pagination.first + 1 :
            helper.isNotUndefinedAndNotNull(pagination.last) ?
            pagination.last + 1 :
            undefined;
    }

    const db = await this.storageHandler;
    const collection = await db.collection("animal");
    let documents = limit ?
        await collection.find(filter).limit(limit).sort(sort).toArray() :
        await collection.find(filter).sort(sort).toArray();

    // validationCheck after read
    documents = await validatorUtil.bulkValidateData('validateAfterRead', this, documents, benignErrorReporter);
    // get the first record (if exists) in the opposite direction to determine pageInfo.
    // if no cursor was given there is no need for an extra query as the results will start at the first (or last) page.
    let oppDocuments = [];
    if (pagination && (pagination.after || pagination.before)) {
        // reverse the pagination Arguement. after -> before; set first/last to 0, so LIMIT 1 is executed in the reverse Search
        let oppPagination = helper.reversePaginationArgument({
            ...pagination,
            includeCursor: false
        });
        let oppForwardPagination = helper.isForwardPagination(oppPagination);
        // build the filter object.
        let oppFilter = mongoDbHelper.searchConditionsToMongoDb(search);

        let oppOrder = oppForwardPagination ? order : helper.reverseOrderConditions(order);
        // depending on the direction build the order object
        let oppSort = mongoDbHelper.orderConditionsToMongoDb(oppOrder, this.idAttribute(), oppForwardPagination);
        let oppOrderFields = oppOrder ? oppOrder.map(x => x.field) : [];
        // extend the filter for the given order and cursor
        oppFilter = mongoDbHelper.cursorPaginationArgumentsToMongoDb(oppPagination, oppSort, oppFilter, oppOrderFields, this.idAttribute());
        // add +1 to the LIMIT to get information about following pages.
        let oppLimit;
        if (pagination) {
            oppLimit = helper.isNotUndefinedAndNotNull(oppPagination.first) ?
                oppPagination.first + 1 :
                helper.isNotUndefinedAndNotNull(oppPagination.last) ?
                oppPagination.last + 1 :
                undefined;
        }
        oppDocuments = oppLimit ?
            await collection.find(oppFilter).limit(oppLimit).toArray() :
            await collection.find(oppFilter).toArray();
    }

    // build the graphql Connection Object
    let docs = documents.map(doc => {
        return new animal(doc)
    });
    let edges = docs.map(doc => {
        return {
            node: doc,
            cursor: doc.base64Encode(),
        }
    });
    const pageInfo = helper.buildPageInfo(edges, oppDocuments, pagination);
    return {
        edges,
        pageInfo,
        animals: edges.map((edge) => edge.node)
    };
}
`;

module.exports.animal_addOne = `
static async addOne(input) {
    // validate input
    await validatorUtil.validateData('validateForCreate', this, input);
    try {
        const db = await this.storageHandler;
        const collection = await db.collection("animal");
        const attributes = Object.keys(definition.attributes);
        let parsed_input = {};
        for (let key of Object.keys(input)) {
            if (attributes.includes(key)) {
                parsed_input[key] = input[key];
            }
        }
        const result = await collection.insertOne(parsed_input);
        const id_name = this.idAttribute();
        const document = await this.readById(input[id_name]);
        return document;
    } catch (error) {
        throw error;
    }
}
`;

module.exports.animal_deleteOne = `
static async deleteOne(id) {
    //validate id
    await validatorUtil.validateData('validateForDelete', this, id);
    try {
        const db = await this.storageHandler;
        const collection = await db.collection("animal");
        const id_name = this.idAttribute();
        const response = await collection.deleteOne({
            [id_name]: id
        });
        if (response.result.ok !== 1) {
            throw new Error(\`Record with ID = \${id} has not been deleted!\`);
        }
        return 'Item successfully deleted';
    } catch (error) {
        console.log(\`Record with ID = \${id} does not exist or could not been deleted\`);
        throw error;
    }
}
`;

module.exports.animal_updateOne = `
static async updateOne(input) {
    //validate input
    await validatorUtil.validateData('validateForUpdate', this, input);
    try {
        const db = await this.storageHandler;
        const collection = await db.collection("animal");
        const attributes = Object.keys(definition.attributes);
        const updatedContent = {};
        for (let key of Object.keys(input)) {
            if (key !== "id" && attributes.includes(key)) {
                updatedContent[key] = input[key];
            }
        }
        const id_name = this.idAttribute();
        const response = await collection.updateOne({
            [id_name]: input[id_name]
        }, {
            $set: updatedContent
        });

        if (response.result.ok !== 1) {
            throw new Error(\`Record with ID = \${input[id_name]} has not been updated\`);
        }
        const document = await this.readById(input[id_name]);
        return document;
    } catch (error) {
        throw error;
    }
}
`;

module.exports.animal_fieldMutation_add_farm = `
static async add_farm_id(animal_id, farm_id, benignErrorReporter) {
    try {
        const db = await this.storageHandler;
        const collection = await db.collection("animal");
        const updatedContent = {
            farm_id: farm_id
        }
        const response = await collection.updateOne({
            animal_id: animal_id
        }, {
            $set: updatedContent
        });
        if (response.result.ok !== 1) {
            benignErrorReporter.push({
                message: \`Record with ID = \${animal_id} has not been updated\`
            });
        }
        return response.modifiedCount;
    } catch (error) {
        benignErrorReporter.push({
            message: error
        });
    }
}
`;

module.exports.animal_fieldMutation_remove_farm = `
static async remove_farm_id(animal_id, farm_id, benignErrorReporter) {
    try {
        const db = await this.storageHandler;
        const collection = await db.collection("animal");
        const updatedContent = {
            farm_id: null
        }
        const response = await collection.updateOne({
            animal_id: animal_id,
            farm_id: farm_id
        }, {
            $set: updatedContent
        });
        if (response.result.ok !== 1) {
            benignErrorReporter.push({
                message: \`Record with ID = \${animal_id} has not been updated\`
            });
        }
        return response.modifiedCount;
    } catch (error) {
        benignErrorReporter.push({
            message: error
        });
    }
}
`;

module.exports.animal_fieldMutation_add_food = `
static async add_food_ids(animal_id, food_ids, benignErrorReporter, handle_inverse = true) {
    //handle inverse association
    if (handle_inverse) {
        let promises = [];
        food_ids.forEach(idx => {
            promises.push(models.food.add_animal_ids(idx, [\`\${animal_id}\`], benignErrorReporter, false));
        });
        await Promise.all(promises);
    }

    try {
        const db = await this.storageHandler
        const collection = await db.collection("animal")
        let record = await this.readById(animal_id);
        if (record !== null) {
            let updated_ids = helper.unionIds(record.food_ids, food_ids);
            await collection.updateOne({
                animal_id: animal_id
            }, {
                $set: {
                    food_ids: updated_ids
                }
            })
        }
    } catch (error) {
        throw error;
    }
}
`;

module.exports.animal_fieldMutation_remove_food = `
static async remove_food_ids(animal_id, food_ids, benignErrorReporter, handle_inverse = true) {
    //handle inverse association
    if (handle_inverse) {
        let promises = [];
        food_ids.forEach(idx => {
            promises.push(models.food.remove_animal_ids(idx, [\`\${animal_id}\`], benignErrorReporter, false));
        });
        await Promise.all(promises);
    }

    try {
        const db = await this.storageHandler
        const collection = await db.collection("animal")
        let record = await this.readById(animal_id);
        if (record !== null) {
            let updated_ids = helper.differenceIds(record.food_ids, food_ids);
            await collection.updateOne({
                animal_id: animal_id
            }, {
                $set: {
                    food_ids: updated_ids
                }
            })
        }
    } catch (error) {
        throw error;
    }
}
`;

module.exports.animal_fieldMutation_bulkAssociate_add = `
static async bulkAssociateAnimalWithFarm_id(bulkAssociationInput, benignErrorReporter) {
    let mappedForeignKeys = helper.mapForeignKeysToPrimaryKeyArray(bulkAssociationInput, "animal_id", "farm_id");
    let collection;
    try {
        const db = await this.storageHandler
        collection = await db.collection("animal")
    } catch (error) {
        throw error;
    }
    let promises = [];
    mappedForeignKeys.forEach(({
        farm_id,
        animal_id
    }) => {
        promises.push(collection.updateMany({
            animal_id: {
                $in: animal_id
            }
        }, {
            $set: {
                farm_id: farm_id
            }
        }))
    });
    await Promise.all(promises);
    return "Records successfully updated!"
}
`;
module.exports.animal_fieldMutation_bulkAssociate_remove = `
static async bulkDisAssociateAnimalWithFarm_id(bulkAssociationInput, benignErrorReporter) {
    let mappedForeignKeys = helper.mapForeignKeysToPrimaryKeyArray(bulkAssociationInput, "animal_id", "farm_id");
    let collection;
    try {
        const db = await this.storageHandler
        collection = await db.collection("animal")
    } catch (error) {
        throw error;
    }
    let promises = [];
    mappedForeignKeys.forEach(({
        farm_id,
        animal_id
    }) => {
        promises.push(collection.updateMany({
            animal_id: {
                $in: animal_id
            },
            farm_id: farm_id
        }, {
            $set: {
                farm_id: null
            }
        }))
    });
    await Promise.all(promises);
    return "Records successfully updated!"
}
`;

module.exports.mongodb_adapter_readById = `
/**
 * Batch function for readById method.
 * @param  {array} keys  keys from readById method
 * @return {array}       searched results
 */
static async batchReadById(keys) {
    let queryArg = {
        operator: "in",
        field: dist_animal_instance1.idAttribute(),
        value: keys.join(),
        valueType: "Array",
    };
    let cursorRes = await dist_animal_instance1.readAllCursor(queryArg);
    cursorRes = cursorRes.dist_animals.reduce(
        (map, obj) => ((map[obj[dist_animal_instance1.idAttribute()]] = obj), map), {}
    );
    return keys.map(
        (key) =>
        cursorRes[key] || new Error(\`Record with ID = "\${key}" does not exist\`)
    );
}

static readByIdLoader = new DataLoader(dist_animal_instance1.batchReadById, {
    cache: false,
});

/**
 * readById - The model implementation for reading a single record given by its ID
 *
 * This method is the implementation for reading a single record for the MongoDb storage type, based on MongoDb node driver.
 * @param {string} id - The ID of the requested record
 * @return {object} The requested record as an object with the type dist_animal_instance1, or an error object if the validation after reading fails
 * @throws {Error} If the requested record does not exist
 */
static async readById(id) {
    return await dist_animal_instance1.readByIdLoader.load(id);
}
`;
