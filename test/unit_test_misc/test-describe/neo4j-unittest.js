module.exports.movie_constructor = `
constructor(input) {
  for (let key of Object.keys(input)) {
      this[key] = input[key];
  }
}
`;

module.exports.movie_readById = `
/**
 * Batch function for readById method.
 * @param  {array} keys  keys from readById method
 * @return {array}       searched results
 */
static async batchReadById(keys) {
    let queryArg = {
        operator: "in",
        field: movie.idAttribute(),
        value: keys.join(),
        valueType: "Array",
    };
    let cursorRes = await movie.readAllCursor(queryArg);
    cursorRes = cursorRes.movies.reduce(
        (map, obj) => ((map[obj[movie.idAttribute()]] = obj), map), {}
    );
    return keys.map(
        (key) =>
        cursorRes[key] || new Error(\`Record with ID = "\${key}" does not exist\`)
    );
}

static readByIdLoader = new DataLoader(movie.batchReadById, {
    cache: false,
});

/**
 * readById - The model implementation for reading a single record given by its ID
 *
 * This method is the implementation for reading a single record for the neo4j storage type, based on neo4j node driver.
 * @param {string} id - The ID of the requested record
 * @return {object} The requested record as an object with the type movie, or an error object if the validation after reading fails
 * @throws {Error} If the requested record does not exist
 */
static async readById(id) {
    return await movie.readByIdLoader.load(id);
}
`;

module.exports.movie_countRecords = `
static async countRecords(search) {
    const whereOptions = neo4jHelper.searchConditionsToNeo4j(
        search,
        definition
    );
    const driver = await this.storageHandler;
    const session = driver.session({
        database: config.database,
        defaultAccessMode: neo4j.session.READ,
    });
    try {
        const result = await session.run(
            \`MATCH (n:Movie) \${whereOptions} RETURN COUNT(n)\`
        );
        const singleRecord = result.records[0];
        const num = singleRecord.get(0);
        return num;
    } catch (error) {
        throw error;
    } finally {
        await session.close();
    }
}
`;

module.exports.movie_readAll = `
static async readAll(search, order, pagination, benignErrorReporter) {
    //use default BenignErrorReporter if no BenignErrorReporter defined
    benignErrorReporter =
        errorHelper.getDefaultBenignErrorReporterIfUndef(benignErrorReporter);
    // build the filter object for limit-offset-based pagination
    const whereOptions = neo4jHelper.searchConditionsToNeo4j(
        search,
        definition
    );
    const orderOptions = neo4jHelper.orderConditionsToNeo4j(
        order,
        this.idAttribute(),
        true
    );

    const limit = pagination.limit;
    const offset = pagination.offset ? pagination.offset : 0;

    const driver = await this.storageHandler;
    const session = driver.session({
        database: config.database,
        defaultAccessMode: neo4j.session.READ,
    });
    try {
        const result = await session.run(
            \`MATCH (n:Movie) \${whereOptions} RETURN n \${orderOptions} SKIP \${offset} LIMIT \${limit} \`
        );
        const nodes = result.records.map((res) => new movie(res.get(0).properties));
        return validatorUtil.bulkValidateData(
            "validateAfterRead",
            this,
            nodes,
            benignErrorReporter
        );
    } catch (error) {
        throw error;
    } finally {
        await session.close();
    }
}
`;

module.exports.movie_readAllCursor = `
static async readAllCursor(search, order, pagination, benignErrorReporter) {
    //use default BenignErrorReporter if no BenignErrorReporter defined
    benignErrorReporter =
        errorHelper.getDefaultBenignErrorReporterIfUndef(benignErrorReporter);
    let isForwardPagination = helper.isForwardPagination(pagination);
    // build the whereOptions.
    let filter = neo4jHelper.searchConditionsToNeo4j(search, definition);
    let newOrder = isForwardPagination ?
        order :
        helper.reverseOrderConditions(order);
    // depending on the direction build the order object
    let sort = neo4jHelper.orderConditionsToNeo4j(
        newOrder,
        this.idAttribute(),
        isForwardPagination
    );
    let orderFields = newOrder ? newOrder.map((x) => x.field) : [];
    // extend the filter for the given order and cursor
    filter = neo4jHelper.cursorPaginationArgumentsToNeo4j(
        pagination,
        sort,
        filter,
        orderFields,
        this.idAttribute(),
        definition.attributes
    );

    // add +1 to the LIMIT to get information about following pages.
    let limit;
    if (pagination) {
        limit = helper.isNotUndefinedAndNotNull(pagination.first) ?
            pagination.first + 1 :
            helper.isNotUndefinedAndNotNull(pagination.last) ?
            pagination.last + 1 :
            undefined;
    }

    const driver = await this.storageHandler;
    const session = driver.session({
        database: config.database,
        defaultAccessMode: neo4j.session.READ,
    });
    let nodes = [];
    try {
        let query = \`MATCH (n:Movie) \${filter} RETURN n \${sort}\`
        query += limit ? \` LIMIT \${limit}\` : "";
        const result = await session.run(query);
        nodes = result.records.map((res) => new movie(res.get(0).properties));
        nodes = await validatorUtil.bulkValidateData(
            "validateAfterRead",
            this,
            nodes,
            benignErrorReporter
        );
    } catch (error) {
        throw error;
    }

    // get the first record (if exists) in the opposite direction to determine pageInfo.
    // if no cursor was given there is no need for an extra query as the results will start at the first (or last) page.
    let oppNodes = [];
    if (pagination && (pagination.after || pagination.before)) {
        // reverse the pagination Arguement. after -> before; set first/last to 0, so LIMIT 1 is executed in the reverse Search
        let oppPagination = helper.reversePaginationArgument({
            ...pagination,
            includeCursor: false,
        });
        let oppForwardPagination = helper.isForwardPagination(oppPagination);
        // build the filter object.
        let oppFilter = neo4jHelper.searchConditionsToNeo4j(search, definition);

        let oppOrder = oppForwardPagination ?
            order :
            helper.reverseOrderConditions(order);
        // depending on the direction build the order object
        let oppSort = neo4jHelper.orderConditionsToNeo4j(
            oppOrder,
            this.idAttribute(),
            oppForwardPagination
        );
        let oppOrderFields = oppOrder ? oppOrder.map((x) => x.field) : [];
        // extend the filter for the given order and cursor
        oppFilter = neo4jHelper.cursorPaginationArgumentsToNeo4j(
            oppPagination,
            oppSort,
            oppFilter,
            oppOrderFields,
            this.idAttribute(),
            definition.attributes
        );
        // add +1 to the LIMIT to get information about following pages.
        let oppLimit;
        if (pagination) {
            oppLimit = helper.isNotUndefinedAndNotNull(oppPagination.first) ?
                oppPagination.first + 1 :
                helper.isNotUndefinedAndNotNull(oppPagination.last) ?
                oppPagination.last + 1 :
                undefined;
        }
        try {
            let query = \`MATCH (n:Movie) \${oppFilter} RETURN n \${oppSort}\`;
            query += limit ? \` LIMIT \${oppLimit}\` : "";
            const oppResult = await session.run(query);
            oppNodes = oppResult.records.map(
                (res) => new movie(res.get(0).properties)
            );
        } catch (error) {
            throw error;
        } finally {
            await session.close();
        }
    }

    // build the graphql Connection Object
    let edges = nodes.map((res) => {
        return {
            node: res,
            cursor: res.base64Encode(),
        };
    });
    const pageInfo = helper.buildPageInfo(edges, oppNodes, pagination);
    return {
        edges,
        pageInfo,
        movies: edges.map((edge) => edge.node)
    };
}
`;

module.exports.movie_addOne = `
static async addOne(input) {
    // validate input
    await validatorUtil.validateData("validateForCreate", this, input);
    const driver = await this.storageHandler;
    const session = driver.session({
        database: config.database,
        defaultAccessMode: neo4j.session.WRITE,
    });
    try {
        const attributes = Object.keys(definition.attributes);
        let parsed_input = {};
        for (let key of Object.keys(input)) {
            if (attributes.includes(key)) {
                parsed_input[key] = input[key];
            }
        }
        parsed_input = neo4jHelper.processDateTime(parsed_input, definition.attributes);

        const result = await session.run(\`CREATE (a:Movie \$props) RETURN a\`, {
            props: parsed_input,
        });
        const singleRecord = result.records[0];
        const node = singleRecord.get(0);
        return new movie(node.properties);
    } catch (error) {
        throw error;
    } finally {
        await session.close();
    }
}

`;

module.exports.movie_deleteOne = `
static async deleteOne(id) {
    //validate id
    await validatorUtil.validateData("validateForDelete", this, id);
    const driver = await this.storageHandler;
    const session = driver.session({
        database: config.database,
        defaultAccessMode: neo4j.session.WRITE,
    });
    try {
        const result = await session.run(
            \`MATCH (n:Movie {\${this.idAttribute()}:$id}) DELETE n\`, {
                id: id
            }
        );
        if (result.records.length !== 0) {
            throw new Error(\`Record with ID = \${id} has not been deleted!\`);
        }
        return "Item successfully deleted";
    } catch (error) {
        console.log(\`Record with ID = \${id} could not be deleted\`);
        throw error;
    } finally {
        await session.close();
    }
}
`;

module.exports.movie_updateOne = `
static async updateOne(input) {
    //validate input
    await validatorUtil.validateData("validateForUpdate", this, input);
    const driver = await this.storageHandler;
    const session = driver.session({
        database: config.database,
        defaultAccessMode: neo4j.session.WRITE,
    });
    const id = input[this.idAttribute()];
    try {
        delete input[this.idAttribute()];
        const attributes = Object.keys(definition.attributes);
        let parsed_input = {};
        for (let key of Object.keys(input)) {
            if (attributes.includes(key)) {
                parsed_input[key] = input[key];
            }
        }
        parsed_input = neo4jHelper.processDateTime(parsed_input, definition.attributes);

        const result = await session.run(
            \`MATCH (n:Movie {\${this.idAttribute()}:$id}) SET n+=$props RETURN n\`, {
                id: id,
                props: parsed_input
            }
        );
        if (result.records.length !== 1) {
            throw new Error(\`Record with ID = \${id} has not been updated!\`);
        }
        const singleRecord = result.records[0];
        const node = singleRecord.get(0);
        return new movie(node.properties);
    } catch (error) {
        console.log(\`Record with ID = \${id} could not be updated\`);
        throw error;
    } finally {
        await session.close();
    }
}

`;

module.exports.movie_bulkAddCsv = `
static async bulkAddCsv(context) {
    let field_delim = config.fieldDelimiter ?? ",";
    let array_delim = config.arrayDelimiter ?? ";";

    const driver = await this.storageHandler;
    const session = driver.session({
        database: config.database,
        defaultAccessMode: neo4j.session.WRITE,
    });
    try {
        let query = \`LOAD CSV WITH HEADERS FROM 'file:///movie.csv' AS line FIELDTERMINATOR '\${field_delim}' CREATE (:Movie {\`;
        for (let attr of Object.keys(definition.attributes)) {
            let type = definition.attributes[attr].replace(/\\s+/g, "");
            if (type[0] === "[") {
                type = type.slice(1, type.length - 1);
                if (type === "Int") {
                    query += \`\${attr}: [i in split(line.\${attr}, "\${array_delim}") | toInteger(i)], \`;
                } else if (type === "Boolean") {
                    query += \`\${attr}: [i in split(line.\${attr}, "\${array_delim}") | toBoolean(i)], \`;
                } else if (type === "Float") {
                    query += \`\${attr}: [i in split(line.\${attr}, "\${array_delim}") | toFloat(i)], \`;
                } else {
                    query += \`\${attr}: split(line.\${attr}, "\${array_delim}"), \`;
                }
            } else {
                if (type === "Int") {
                    query += \`\${attr}: toInteger(line.\${attr}), \`;
                } else if (type === "Boolean") {
                    query += \`\${attr}: toBoolean(line.\${attr}), \`;
                } else if (type === "Float") {
                    query += \`\${attr}: toFloat(line.\${attr}), \`;
                } else {
                    query += \`\${attr}: line.\${attr}, \`;
                }
            }
        }
        query = query.slice(0, query.length - 2) + "})";
        const result = await session.run(query);
        return \`Successfully upload file\`;
    } catch (e) {
        throw new Error(e);
    } finally {
        await session.close();
    }
`;

module.exports.movie_fieldMutation_add_director = `
static async add_director_id(movie_id, director_id) {
    const driver = await this.storageHandler;
    const session = driver.session({
        database: config.database,
        defaultAccessMode: neo4j.session.WRITE,
    });
    let foreignKey = \`MATCH (n:Movie ) WHERE n.movie_id = $id 
      SET n.director_id = $target RETURN head(collect(n))\`

    let create_relationships = \`MATCH (a:Movie), (b:Director) 
      WHERE a.movie_id = $id AND b.\${models.director.idAttribute()} = $target
      CREATE (a)-[r:\${"director".toUpperCase() + "_EDGE"}]->(b)\`
    try {
        const result = await session.run(foreignKey, {
            id: movie_id,
            target: director_id
        });
        await session.run(create_relationships, {
            id: movie_id,
            target: director_id,
        })
        const singleRecord = result.records[0];
        const node = singleRecord.get(0);
        return new movie(node)
    } catch (error) {
        throw error;
    } finally {
        await session.close();
    }
}
`;

module.exports.movie_fieldMutation_remove_director = `
static async remove_director_id(movie_id, director_id) {
    const driver = await this.storageHandler;
    const session = driver.session({
        database: config.database,
        defaultAccessMode: neo4j.session.WRITE,
    });
    let foreignKey = \`MATCH (n:Movie ) WHERE n.movie_id = $id 
      SET n.director_id = $target RETURN head(collect(n))\`

    let delete_relationships = \`MATCH (a:Movie)-[r:\${"director".toUpperCase() + "_EDGE"}]-> (b:Director) 
      WHERE a.movie_id = $id AND b.\${models.director.idAttribute()} = $target
      DELETE r\`
    try {
        const result = await session.run(foreignKey, {
            id: movie_id,
            target: null
        });
        await session.run(delete_relationships, {
            id: movie_id,
            target: director_id,
        })
        const singleRecord = result.records[0];
        const node = singleRecord.get(0);
        return new movie(node)
    } catch (error) {
        throw error;
    } finally {
        await session.close();
    }
}
`;

module.exports.movie_fieldMutation_add_actor = `
static async add_actor_ids(movie_id, actor_ids, benignErrorReporter, handle_inverse = true) {
    //handle inverse association
    if (handle_inverse) {
        let promises = [];
        actor_ids.forEach(idx => {
            promises.push(models.actor.add_movie_ids(idx, [\`\${movie_id}\`], benignErrorReporter, false));
        });
        await Promise.all(promises);
    }

    const driver = await this.storageHandler;
    const session = driver.session({
        database: config.database,
        defaultAccessMode: neo4j.session.WRITE,
    });
    let foreignKey = \`MATCH (n:Movie ) WHERE n.movie_id = $id 
      SET n.actor_ids = $updated_ids\`

    let create_relationships = \`MATCH (a:Movie), (b:Actor) 
      WHERE a.movie_id = $id AND b.\${models.actor.idAttribute()} IN $source
      CREATE (a)-[r:\${"actor".toUpperCase() + "_EDGE"}]->(b)\`
    try {
        let record = await this.readById(movie_id);

        if (record !== null) {
            let updated_ids = helper.unionIds(record.actor_ids, actor_ids);
            await session.run(foreignKey, {
                id: movie_id,
                updated_ids: updated_ids
            });

            await session.run(create_relationships, {
                id: movie_id,
                source: actor_ids,
            })
        }
    } catch (error) {
        throw error;
    } finally {
        await session.close();
    }
}
`;

module.exports.movie_fieldMutation_remove_actor = `
static async remove_actor_ids(movie_id, actor_ids, benignErrorReporter, handle_inverse = true) {
    //handle inverse association
    if (handle_inverse) {
        let promises = [];
        actor_ids.forEach(idx => {
            promises.push(models.actor.remove_movie_ids(idx, [\`\${movie_id}\`], benignErrorReporter, false));
        });
        await Promise.all(promises);
    }

    const driver = await this.storageHandler;
    const session = driver.session({
        database: config.database,
        defaultAccessMode: neo4j.session.WRITE,
    });
    let foreignKey = \`MATCH (n:Movie ) WHERE n.movie_id = $id 
      SET n.actor_ids = $updated_ids\`

    let delete_relationships = \`MATCH (a:Movie)-[r:\${"actor".toUpperCase() + "_EDGE"}]-> (b:Actor) 
      WHERE a.movie_id = $id AND b.\${models.actor.idAttribute()} IN $source
      DELETE r\`
    try {
        let record = await this.readById(movie_id);

        if (record !== null) {
            let updated_ids = helper.differenceIds(record.actor_ids, actor_ids);
            await session.run(foreignKey, {
                id: movie_id,
                updated_ids: updated_ids
            });

            await session.run(delete_relationships, {
                id: movie_id,
                source: actor_ids,
            })
        }
    } catch (error) {
        throw error;
    } finally {
        await session.close();
    }
}
`;

module.exports.movie_fieldMutation_bulkAssociate_add = `
static async bulkAssociateMovieWithDirector_id(bulkAssociationInput, benignErrorReporter) {
    let mappedForeignKeys = helper.mapForeignKeysToPrimaryKeyArray(bulkAssociationInput, "movie_id", "director_id");

    const driver = await this.storageHandler;
    const session = driver.session({
        database: config.database,
        defaultAccessMode: neo4j.session.WRITE,
    });
    let foreignKey = \`MATCH (n:Movie) WHERE n.movie_id IN $id 
      SET n.director_id = $target\`

    let create_relationships = \`MATCH (a:Movie), (b:Director) 
      WHERE a.movie_id IN $id AND b.director_id = $target
      CREATE (a)-[r:\${"director".toUpperCase() + "_EDGE"}]->(b)\`
    try {
        for (let {
                director_id,
                movie_id
            } of mappedForeignKeys) {
            await session.run(foreignKey, {
                id: movie_id,
                target: director_id
            })
            await session.run(create_relationships, {
                id: movie_id,
                target: director_id,
            })
        }
    } catch (error) {
        throw error;
    } finally {
        await session.close();
    }

    return "Records successfully updated!"
}
`;
module.exports.movie_fieldMutation_bulkAssociate_remove = `
static async bulkDisAssociateMovieWithDirector_id(bulkAssociationInput, benignErrorReporter) {
    let mappedForeignKeys = helper.mapForeignKeysToPrimaryKeyArray(bulkAssociationInput, "movie_id", "director_id");

    const driver = await this.storageHandler;
    const session = driver.session({
        database: config.database,
        defaultAccessMode: neo4j.session.WRITE,
    });
    let foreignKey = \`MATCH (n:Movie) WHERE n.movie_id IN $id 
      SET n.director_id = $target\`

    let delete_relationships = \`MATCH (a:Movie)-[r:\${"director".toUpperCase() + "_EDGE"}]-> (b:Director) 
      WHERE a.movie_id IN $id AND b.director_id = $target
      DELETE r\`
    try {
        for (let {
                director_id,
                movie_id
            } of mappedForeignKeys) {
            await session.run(foreignKey, {
                id: movie_id,
                target: null
            })
            await session.run(delete_relationships, {
                id: movie_id,
                target: director_id,
            })
        }
    } catch (error) {
        throw error;
    } finally {
        await session.close();
    }

    return "Records successfully updated!"
}
`;

module.exports.neo4j_adapter_readById = `
/**
 * Batch function for readById method.
 * @param  {array} keys  keys from readById method
 * @return {array}       searched results
 */
static async batchReadById(keys) {
    let queryArg = {
        operator: "in",
        field: dist_movie_instance1.idAttribute(),
        value: keys.join(),
        valueType: "Array",
    };
    let cursorRes = await dist_movie_instance1.readAllCursor(queryArg);
    cursorRes = cursorRes.dist_movies.reduce(
        (map, obj) => ((map[obj[dist_movie_instance1.idAttribute()]] = obj), map), {}
    );
    return keys.map(
        (key) =>
        cursorRes[key] || new Error(\`Record with ID = "\${key}" does not exist\`)
    );
}

static readByIdLoader = new DataLoader(dist_movie_instance1.batchReadById, {
    cache: false,
});

/**
 * readById - The model implementation for reading a single record given by its ID
 *
 * This method is the implementation for reading a single record for the neo4j storage type, based on neo4j node driver.
 * @param {string} id - The ID of the requested record
 * @return {object} The requested record as an object with the type dist_movie_instance1, or an error object if the validation after reading fails
 * @throws {Error} If the requested record does not exist
 */
static async readById(id) {
    return await dist_movie_instance1.readByIdLoader.load(id);
}
`;
