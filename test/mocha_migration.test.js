const { expect } = require("chai");
const fs = require("fs");
let execute_graphql;
// Note: current tests are based on integration env with the ACL setup.

describe("Neo4j - Basic CRUD Operations | SQL - Distributed Setup", () => {
  before(async () => {
    try {
      require("dotenv").config({
        path: "./test/integration_test_misc/.env.acl",
      });

      fs.copyFileSync(
        "./test/integration_test_misc/data_models_config_migration.json",
        "./test/integration_test_env/gql_science_db_graphql_server2/config/data_models_storage_config.json"
      );
      const {
        initializeZendro,
      } = require("./integration_test_env/gql_science_db_graphql_server2/utils/zendro.js");
      const zendro = await initializeZendro();
      execute_graphql = zendro.execute_graphql;
    } catch (err) {
      console.log(err);
    }
  });
  after(async () => {
    // Delete all movies
    let res = await execute_graphql(
      "{ movies(pagination:{limit:25}) {movie_id} }"
    );
    let movies = res.data.movies;

    for (let i = 0; i < movies.length; i++) {
      res = await execute_graphql(
        `mutation { deleteMovie (movie_id: "${movies[i].movie_id}") }`
      );
      expect(res.data).to.deep.equal({
        deleteMovie: "Item successfully deleted",
      });
    }
    res = await execute_graphql("{ countMovies }");
    let cnt = res.data.countMovies;
    expect(cnt).to.equal(0);
    process.exit(0);
  });

  it("01. Movie: empty table", async () => {
    let res = await execute_graphql("{ countMovies }");
    expect(res.data.countMovies).equal(0);
  });

  it("02. Movie: add", async () => {
    let res = await execute_graphql(
      `mutation{
            addMovie(movie_id:"m0", release:"1998-12-03T10:15:30Z", runtime:110, box_office:13145632.32,
            is_adult:false, genres:["action","thriller"], votes: [50,200,140,1200,150])
            {
                movie_id
                genres
                votes
            }
        }`
    );
    expect(res.data.addMovie).to.deep.equal({
      movie_id: "m0",
      genres: ["action", "thriller"],
      votes: [50, 200, 140, 1200, 150],
    });

    res = await execute_graphql("{ countMovies }");
    let cnt = res.data.countMovies;
    expect(cnt).to.equal(1);
  });

  it("03. Movie: update", async () => {
    let res = await execute_graphql(
      '{movies(search:{field:is_adult operator:eq value:"false"}, pagination:{limit:25}){movie_id}}'
    );
    let movie = res.data.movies[0].movie_id;

    res = await execute_graphql(
      `mutation { updateMovie(movie_id: "${movie}", runtime:111) {
            movie_id
            runtime
          }
        }`
    );
    expect(res.data).to.deep.equal({
      updateMovie: {
        movie_id: `${movie}`,
        runtime: 111,
      },
    });
  });

  it("04. Movie: read", async () => {
    let res = await execute_graphql(
      '{movies(search:{field:release, operator:eq, value:"1998-12-03T10:15:30.000Z"}, pagination:{limit:25}){movie_id}}'
    );

    let movie = res.data.movies[0].movie_id;

    res = await execute_graphql(
      `{
        readOneMovie(movie_id : "${movie}") {
          movie_id
          release
          runtime
          box_office
          is_adult
          genres
          votes
        }
    }`
    );

    expect(res.data).to.deep.equal({
      readOneMovie: {
        movie_id: "m0",
        release: "1998-12-03T10:15:30.000Z",
        runtime: 111,
        box_office: 13145632.32,
        is_adult: false,
        genres: ["action", "thriller"],
        votes: [50, 200, 140, 1200, 150],
      },
    });
  });

  it("05. Movie: delete", async () => {
    let res = await execute_graphql(
      "{ movies(pagination:{limit:25}) {movie_id} }"
    );
    let movies = res.data.movies;

    for (let i = 0; i < movies.length; i++) {
      res = await execute_graphql(
        `mutation { deleteMovie (movie_id: "${movies[i].movie_id}") }`
      );
      expect(res.data).to.deep.equal({
        deleteMovie: "Item successfully deleted",
      });
    }

    res = await execute_graphql("{ countMovies }");
    let cnt = res.data.countMovies;
    expect(cnt).to.equal(0);
  });

  it("06. Movie: get the table template", async () => {
    let res = await execute_graphql(`{csvTableTemplateMovie}`);
    expect(res.data).to.deep.equal({
      csvTableTemplateMovie: [
        "movie_id,release,runtime,box_office,is_adult,genres,votes,director_id,actor_ids",
        "String,DateTime,Int,Float,Boolean,[String],[Int],String,[String]",
      ],
    });
  });

  it("07. Parrot: count records in a distributed setup", async () => {
    let res = await execute_graphql("{ countParrots }");
    expect(res.errors[0].toString()).to.contain(
      `You are using Docker and a distributed setup. Did you run this migration from the host?`
    );
  });
});
