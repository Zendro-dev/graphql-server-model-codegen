const { expect } = require("chai");
const delay = require("delay");
const path = require("path");
const itHelpers = require("./integration_test_misc/integration_test_helpers");

describe("Neo4j - Basic CRUD Operations", () => {
  after(async () => {
    // Delete all movies
    let res = itHelpers.request_graph_ql_post_instance2(
      "{ movies(pagination:{limit:25}) {movie_id} }"
    );
    let movies = JSON.parse(res.body.toString("utf8")).data.movies;

    for (let i = 0; i < movies.length; i++) {
      res = itHelpers.request_graph_ql_post_instance2(
        `mutation { deleteMovie (movie_id: "${movies[i].movie_id}") }`
      );
      expect(res.statusCode).to.equal(200);
    }
    res = itHelpers.request_graph_ql_post_instance2("{ countMovies }");
    let cnt = JSON.parse(res.body.toString("utf8")).data.countMovies;
    expect(cnt).to.equal(0);
  });

  it("01. Movie: empty table", () => {
    let res = itHelpers.request_graph_ql_post_instance2("{ countMovies }");
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.countMovies).equal(0);
  });

  it("02. Movie: add", async () => {
    // movie_id,release,runtime,box_office,is_adult,genres,votes
    // m1,2008-12-03T10:15:30Z,130,17845632.32,true,action;thriller,50;200;140;1200;150
    let res = itHelpers.request_graph_ql_post_instance2(
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

    expect(res.statusCode).to.equal(200);

    res = itHelpers.request_graph_ql_post_instance2("{ countMovies }");
    let cnt = JSON.parse(res.body.toString("utf8")).data.countMovies;
    expect(cnt).to.equal(1);
  });

  it("03. Movie: update", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      '{movies(search:{field:is_adult operator:eq value:"false"}, pagination:{limit:25}){movie_id}}'
    );
    let resBody = JSON.parse(res.body.toString("utf8"));
    let movie = resBody.data.movies[0].movie_id;

    res = itHelpers.request_graph_ql_post_instance2(
      `mutation { updateMovie(movie_id: "${movie}", runtime:111) {
            movie_id
            runtime
          }
        }`
    );
    resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        updateMovie: {
          movie_id: `${movie}`,
          runtime: 111,
        },
      },
    });
  });

  it("04. Movie: read", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      '{movies(search:{field:release, operator:eq, value:"1998-12-03T10:15:30.000Z"}, pagination:{limit:25}){movie_id}}'
    );
    let resBody = JSON.parse(res.body.toString("utf8"));
    let movie = resBody.data.movies[0].movie_id;

    res = itHelpers.request_graph_ql_post_instance2(
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
    resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        readOneMovie: {
          movie_id: "m0",
          release: "1998-12-03T10:15:30.000Z",
          runtime: 111,
          box_office: 13145632.32,
          is_adult: false,
          genres: ["action", "thriller"],
          votes: [50, 200, 140, 1200, 150],
        },
      },
    });
  });

  it("05. Movie: search with regex", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      '{movies(search:{field:movie_id, value:"m.*", operator:regexp},pagination:{limit:25}) {movie_id}}'
    );
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.movies.length).equal(1);
  });

  it("06. Movie: delete", async () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      "{ movies(pagination:{limit:25}) {movie_id} }"
    );
    let movies = JSON.parse(res.body.toString("utf8")).data.movies;

    for (let i = 0; i < movies.length; i++) {
      res = itHelpers.request_graph_ql_post_instance2(
        `mutation { deleteMovie (movie_id: "${movies[i].movie_id}") }`
      );
      expect(res.statusCode).to.equal(200);
    }

    res = itHelpers.request_graph_ql_post_instance2("{ countMovies }");
    let cnt = JSON.parse(res.body.toString("utf8")).data.countMovies;
    expect(cnt).to.equal(0);
  });

  it("07. Movie: CSV bulkUpload", async () => {
    let res = itHelpers.request_graph_ql_post_instance2("{ countMovies }");
    let cnt1 = JSON.parse(res.body.toString("utf8")).data.countMovies;

    res = itHelpers.request_graph_ql_post_instance2(
      "mutation {bulkAddMovieCsv}"
    );

    expect(JSON.parse(res.body.toString("utf8")).data.bulkAddMovieCsv).equal(
      "Successfully upload file"
    );
    await delay(500);

    res = itHelpers.request_graph_ql_post_instance2("{ countMovies }");
    let cnt2 = JSON.parse(res.body.toString("utf8")).data.countMovies;
    expect(cnt2 - cnt1).to.equal(6);
  });

  it("08. Movie: paginate", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      "{movies(pagination:{limit:1}) {movie_id}}"
    );
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.movies.length).equal(1);

    res = itHelpers.request_graph_ql_post_instance2(
      `{
            moviesConnection(pagination:{first:10}) {
                edges{
                    cursor
                    node{
                        movie_id
                      }
                  }
              }
          }`
    );
    resBody = JSON.parse(res.body.toString("utf8"));
    let edges = resBody.data.moviesConnection.edges;
    let idArray = edges.map((edge) => edge.node.movie_id);
    let cursorArray = edges.map((edge) => edge.cursor);
    res = itHelpers.request_graph_ql_post_instance2(
      `{
            moviesConnection(pagination:{first: 2, after: "${cursorArray[1]}"}) {
                movies{
                  movie_id
                }
                edges{
                    cursor
                    node{
                        movie_id
                      }
                  }
                pageInfo{
                    endCursor
                    hasNextPage
                  }
              }
          }`
    );
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        moviesConnection: {
          movies: [
            {
              movie_id: "m3",
            },
            {
              movie_id: "m4",
            },
          ],
          edges: [
            {
              cursor: cursorArray[2],
              node: {
                movie_id: idArray[2],
              },
            },
            {
              cursor: cursorArray[3],
              node: {
                movie_id: idArray[3],
              },
            },
          ],
          pageInfo: {
            endCursor: cursorArray[3],
            hasNextPage: true,
          },
        },
      },
    });
  });

  it("09. Movie: sort", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      `{
            movies(pagination: {limit:2}, order: [{field: runtime, order: DESC}]) {
                movie_id
                runtime
            }
        }`
    );
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        movies: [
          { movie_id: "m1", runtime: 130 },
          { movie_id: "m3", runtime: 120 },
        ],
      },
    });
  });

  it("10. Movie: not operator", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      `{
          movies(pagination: {limit:2}, 
            search:{operator:not search:{field:movie_id value:"m2" operator:eq}}) {
              movie_id
              runtime
          }
        }`
    );
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        movies: [
          { movie_id: "m1", runtime: 130 },
          { movie_id: "m3", runtime: 120 },
        ],
      },
    });
  });

  it("11. Movie: get the table template", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      `{csvTableTemplateMovie}`
    );
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        csvTableTemplateMovie: [
          "movie_id,release,runtime,box_office,is_adult,genres,votes,director_id,actor_ids",
          "String,DateTime,Int,Float,Boolean,[String],[Int],String,[String]",
        ],
      },
    });
  });
});

describe.only("Neo4j - Operators", () => {
  before(async () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      "mutation {bulkAddMovieCsv}"
    );

    expect(JSON.parse(res.body.toString("utf8")).data.bulkAddMovieCsv).equal(
      "Successfully upload file"
    );
    await delay(500);
  }); 

  after(async () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      "{ movies(pagination:{limit:25}) {movie_id} }"
    );
    let movies = JSON.parse(res.body.toString("utf8")).data.movies;

    for (let i = 0; i < movies.length; i++) {
      res = itHelpers.request_graph_ql_post_instance2(
        `mutation { deleteMovie (movie_id: "${movies[i].movie_id}") }`
      );
      expect(res.statusCode).to.equal(200);
    } 
  });

  it("01. Movie: like , notLike", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      '{ movies(pagination:{limit:25} search:{field: movie_id operator:like value:"_2"}) {movie_id} }'
    );
    expect(res.statusCode).to.equal(200);
    let movies = JSON.parse(res.body.toString("utf8")).data.movies;
    expect(movies.length).to.equal(1); 

    res = itHelpers.request_graph_ql_post_instance2(
      '{ movies(pagination:{limit:25} search:{field: movie_id operator:notLike value:"_2"}) {movie_id} }'
    );
    expect(res.statusCode).to.equal(200);
    movies = JSON.parse(res.body.toString("utf8")).data.movies;
    expect(movies.length).to.equal(5); 
  });

  it("02. Movie: iLike , notILike", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      '{ movies(pagination:{limit:25} search:{field:movie_id operator:iLike value:"M_"}) {movie_id} }'
    );
    expect(res.statusCode).to.equal(200);
    let movies = JSON.parse(res.body.toString("utf8")).data.movies;
    expect(movies.length).to.equal(6);
    
    res = itHelpers.request_graph_ql_post_instance2(
      '{ movies(pagination:{limit:25} search:{field:movie_id operator:notILike value:"M_"}) {movie_id} }'
    );
    expect(res.statusCode).to.equal(200);
    movies = JSON.parse(res.body.toString("utf8")).data.movies;
    expect(movies.length).to.equal(0); 
  });

  it("03. Movie: in , notIn", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      '{ movies(pagination:{limit:25} search:{field:movie_id operator:in value:"m3,m4,m5,m6" valueType:Array}) {movie_id} }'
    );
    expect(res.statusCode).to.equal(200);
    let movies = JSON.parse(res.body.toString("utf8")).data.movies;
    expect(movies.length).to.equal(4);
    
    res = itHelpers.request_graph_ql_post_instance2(
      '{ movies(pagination:{limit:25} search:{field:movie_id operator:notIn value:"m3,m4,m5,m6" valueType:Array}) {movie_id} }'
    );
    expect(res.statusCode).to.equal(200);
    movies = JSON.parse(res.body.toString("utf8")).data.movies;
    expect(movies.length).to.equal(2);
  });

  it("04. Movie: contains, notContains", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      '{ movies(pagination:{limit:25} search:{field:genres operator:contains value:"horror"}) {movie_id} }'
    );
    expect(res.statusCode).to.equal(200);
    let movies = JSON.parse(res.body.toString("utf8")).data.movies;
    expect(movies.length).to.equal(2);
    
    res = itHelpers.request_graph_ql_post_instance2(
      '{ movies(pagination:{limit:25} search:{field:genres operator:notContains value:"horror"}) {movie_id} }'
    );
    expect(res.statusCode).to.equal(200);
    movies = JSON.parse(res.body.toString("utf8")).data.movies;
    expect(movies.length).to.equal(4);
  });
})

describe("Neo4j - Association", () => {
  // set up the environment
  before(async () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      "mutation {bulkAddMovieCsv}"
    );

    expect(JSON.parse(res.body.toString("utf8")).data.bulkAddMovieCsv).equal(
      "Successfully upload file"
    );
    await delay(500);
  });

  // clean up records
  after(async () => {
    // Delete all movies
    let res = itHelpers.request_graph_ql_post_instance2(
      "{ movies(pagination:{limit:25}) {movie_id} }"
    );
    let movies = JSON.parse(res.body.toString("utf8")).data.movies;

    for (let i = 0; i < movies.length; i++) {
      res = itHelpers.request_graph_ql_post_instance2(
        `mutation { deleteMovie (movie_id: "${movies[i].movie_id}") }`
      );
      expect(res.statusCode).to.equal(200);
    }

    res = itHelpers.request_graph_ql_post_instance2("{ countMovies }");
    let cnt = JSON.parse(res.body.toString("utf8")).data.countMovies;
    expect(cnt).to.equal(0);

    // Delete all directors
    res = itHelpers.request_graph_ql_post_instance2(
      "{ directors(pagination:{limit:25}) {director_id} }"
    );
    let directors = JSON.parse(res.body.toString("utf8")).data.directors;

    for (let i = 0; i < directors.length; i++) {
      res = itHelpers.request_graph_ql_post_instance2(
        `mutation { deleteDirector (director_id: "${directors[i].director_id}") }`
      );
      expect(res.statusCode).to.equal(200);
    }

    res = itHelpers.request_graph_ql_post_instance2("{ countDirectors }");
    cnt = JSON.parse(res.body.toString("utf8")).data.countDirectors;
    expect(cnt).to.equal(0);

    // Delete all kinds of actor
    res = itHelpers.request_graph_ql_post_instance2(
      "{ actors(pagination:{limit:25}) {actor_id} }"
    );
    let actor = JSON.parse(res.body.toString("utf8")).data.actors;

    for (let i = 0; i < actor.length; i++) {
      res = itHelpers.request_graph_ql_post_instance2(
        `mutation { deleteActor (actor_id: "${actor[i].actor_id}") }`
      );
      expect(res.statusCode).to.equal(200);
    }

    res = itHelpers.request_graph_ql_post_instance2("{ countActors }");
    cnt = JSON.parse(res.body.toString("utf8")).data.countActors;
    expect(cnt).to.equal(0);

    // Delete all reviews
    res = itHelpers.request_graph_ql_post_instance2(
      "{ reviews(pagination:{limit:25}) {review_id} }"
    );
    let review = JSON.parse(res.body.toString("utf8")).data.reviews;

    for (let i = 0; i < review.length; i++) {
      res = itHelpers.request_graph_ql_post_instance2(
        `mutation { deleteReview (review_id: "${review[i].review_id}") }`
      );
      expect(res.statusCode).to.equal(200);
    }

    res = itHelpers.request_graph_ql_post_instance2("{ countReviews }");
    cnt = JSON.parse(res.body.toString("utf8")).data.countReviews;
    expect(cnt).to.equal(0);
  });

  it("01. Movie : Director (n:1) - add movies to director", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      `mutation{
          addDirector( director_id: "d1", director_name: "Chloé Zhao", addMovies: ["m1", "m2"] ){
            director_name
            moviesFilter(pagination:{limit:10}){
              movie_id
              genres
            }
          }
        }`
    );
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        addDirector: {
          moviesFilter: [
            {
              movie_id: "m1",
              genres: ["action", "thriller"],
            },
            {
              movie_id: "m2",
              genres: ["comedy"],
            },
          ],
          director_name: "Chloé Zhao",
        },
      },
    });
  });
  it("02. Movie : Director (n:1) - read one movie / read one director", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      `{
        readOneMovie(movie_id: "m1"){
            movie_id
            director{
                director_name
            }
        }
    }`
    );
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        readOneMovie: {
          director: {
            director_name: "Chloé Zhao",
          },
          movie_id: "m1",
        },
      },
    });

    res = itHelpers.request_graph_ql_post_instance2(
      `{
        readOneDirector(director_id: "d1"){
            director_id
            director_name
        }
    }`
    );
    resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        readOneDirector: {
          director_id: "d1",
          director_name: "Chloé Zhao",
        },
      },
    });
  });

  it("03. Movie : Director (n:1) - deleting the director record with associations fails", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      `mutation { deleteDirector (director_id: "d1") }`
    );
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(500);
    expect(resBody).to.deep.equal({
      errors: [
        {
          message: `director with director_id d1 has associated records and is NOT valid for deletion. Please clean up before you delete.`,
          locations: [
            {
              column: 12,
              line: 1,
            },
          ],
          path: ["deleteDirector"],
        },
      ],
      data: null,
    });
  });

  it("04. Movie : Director (n:1) - delete the associations in the director record", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      `mutation{updateDirector(director_id: "d1", removeMovies: ["m1", "m2"]) {
            director_name
            moviesFilter(pagination:{limit:10}){
              movie_id
            }
            moviesConnection(pagination:{first:5}){
              movies{
                movie_id
              }
            }
          }
        }`
    );

    resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        updateDirector: {
          moviesFilter: [],
          director_name: "Chloé Zhao",
          moviesConnection: {
            movies: [],
          },
        },
      },
    });
  });

  it("05. Movie : Actor (n:n) - add movies to actor", () => {
    const actors = ["Yokohama Ryusei", "Minami Hamabe"];
    for (let i = 1; i < 3; i++) {
      let res = itHelpers.request_graph_ql_post_instance2(
        `mutation{
              addActor(actor_id:"a${i}", actor_name:"${actors[i - 1]}", 
                addMovies:["m3","m4"]){
                  actor_id
                  movie_ids
              }
          }`
      );
      let resBody = JSON.parse(res.body.toString("utf8"));

      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
          addActor: {
            actor_id: `a${i}`,
            movie_ids: ["m3", "m4"],
          },
        },
      });
    }
  });

  it("06. Movie : Actor (n:n) - read one associated movie", () => {
    let res = itHelpers.request_graph_ql_post_instance2(`
        {
          readOneMovie(movie_id: "m3"){
            movie_id
            actor_ids
          }
        }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        readOneMovie: {
          movie_id: "m3",
          actor_ids: ["a1", "a2"],
        },
      },
    });
  });

  it("07. Movie : Actor (n:n) - delete the associations in the actor records", () => {
    for (let i = 1; i < 3; i++) {
      let res = itHelpers.request_graph_ql_post_instance2(
        `mutation{
              updateActor(actor_id:"a${i}", removeMovies:["m3","m4"]){
                  actor_id
                  movie_ids
              }
        }`
      );
      resBody = JSON.parse(res.body.toString("utf8"));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
          updateActor: {
            actor_id: `a${i}`,
            movie_ids: [],
          },
        },
      });
    }
  });

  it("08. Movie : Review (1:1) - add movie to review", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      `mutation{
            addReview(review_id:"r1", rating:4.9, addUnique_movie:"m5"){
                review_id
                movie_id
            }
          }`
    );
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        addReview: {
          review_id: "r1",
          movie_id: "m5",
        },
      },
    });
  });

  it("09. Movie : Review (1:1) - read one associated movie", () => {
    let res = itHelpers.request_graph_ql_post_instance2(`
        {
          readOneMovie(movie_id: "m5"){
            movie_id
            unique_review {
              review_id
              rating
            }
          }
        }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        readOneMovie: {
          movie_id: "m5",
          unique_review: {
            review_id: "r1",
            rating: 4.9,
          },
        },
      },
    });
  });

  it("10. Movie : Review (1:1) - violate the unique rule", () => {
    itHelpers.request_graph_ql_post_instance2(
      `mutation{
            addReview(review_id:"r2", rating:3.5, addUnique_movie:"m5"){
                review_id
                movie_id
            }
        }`
    );
    res = itHelpers.request_graph_ql_post_instance2(
      `{
            readOneMovie(movie_id: "m5"){
                movie_id
                unique_review {
                    review_id
                }
            }
        }`
    );
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      errors: [
        {
          message:
            'Not unique "to_one" association Error: Found > 1 reviews matching movie with movie_id m5. Consider making this a "to_many" association, or using unique constraints, or moving the foreign key into the movie model. Returning first review.',
          locations: "",
        },
      ],
      data: {
        readOneMovie: {
          movie_id: "m5",
          unique_review: {
            review_id: "r1",
          },
        },
      },
    });
  });

  it("11. Movie : Review (1:1) - delete the associations in the review record", () => {
    for (let i = 1; i < 3; i++) {
      let res = itHelpers.request_graph_ql_post_instance2(
        `mutation{
              updateReview(review_id:"r${i}", removeUnique_movie:"m5"){
                  review_id
                  movie_id
              }
        }`
      );
      resBody = JSON.parse(res.body.toString("utf8"));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
          updateReview: {
            review_id: `r${i}`,
            movie_id: null,
          },
        },
      });
    }
  });
});

describe("Neo4j - Distributed Data Models", () => {
  after(async () => {
    // Delete all movies
    let res = itHelpers.request_graph_ql_post_instance2(
      "{ dist_moviesConnection(pagination:{first:10}) {edges {node {movie_id}}}}"
    );
    let edges = JSON.parse(res.body.toString("utf8")).data.dist_moviesConnection
      .edges;
    for (let edge of edges) {
      res = itHelpers.request_graph_ql_post_instance2(
        `mutation { deleteDist_movie (movie_id: "${edge.node.movie_id}") }`
      );
      expect(res.statusCode).to.equal(200);
    }
    res = itHelpers.request_graph_ql_post_instance2("{ countDist_movies }");
    let cnt = JSON.parse(res.body.toString("utf8")).data.countDist_movies;
    expect(cnt).to.equal(0);
    // Delete all directors
    res = itHelpers.request_graph_ql_post_instance2(
      "{ dist_directorsConnection(pagination:{first:10}) {edges {node {director_id}}}}"
    );
    edges = JSON.parse(res.body.toString("utf8")).data.dist_directorsConnection
      .edges;
    for (let edge of edges) {
      res = itHelpers.request_graph_ql_post_instance2(
        `mutation { deleteDist_director (director_id: "${edge.node.director_id}") }`
      );
      expect(res.statusCode).to.equal(200);
    }
    res = itHelpers.request_graph_ql_post_instance2("{ countDist_directors }");
    cnt = JSON.parse(res.body.toString("utf8")).data.countDist_directors;
    expect(cnt).to.equal(0);
  });

  it("01. Movie DDM: create a director and 3 movies", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      `mutation {
          addDist_director(director_id: "instance1-01", director_name: "Chloé Zhao") {
            director_id
            director_name
          }
        }`
    );
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        addDist_director: {
          director_id: "instance1-01",
          director_name: "Chloé Zhao",
        },
      },
    });
    const runtime = [110, 145, 120];
    for (let i = 0; i < runtime.length; i++) {
      res = itHelpers.request_graph_ql_post_instance2(
        `mutation {
            addDist_movie(movie_id: "instance1-0${i + 2}",
            runtime: ${runtime[i]})
            {
              movie_id
              runtime
            }
          }
          `
      );
      resBody = JSON.parse(res.body.toString("utf8"));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
          addDist_movie: {
            movie_id: `instance1-0${i + 2}`,
            runtime: runtime[i],
          },
        },
      });
    }
  });

  it("02. Movie DDM: read one movie / read one director", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      `{
        readOneDist_movie(movie_id: "instance1-02"){
            movie_id
            runtime
        }
    }`
    );
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        readOneDist_movie: {
          movie_id: "instance1-02",
          runtime: 110,
        },
      },
    });

    res = itHelpers.request_graph_ql_post_instance2(
      `{
        readOneDist_director(director_id: "instance1-01"){
            director_id
            director_name
        }
    }`
    );
    resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        readOneDist_director: {
          director_id: "instance1-01",
          director_name: "Chloé Zhao",
        },
      },
    });
  });

  it("03. Movie DDM: update the director to associate with movies", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      `mutation {
          updateDist_director(director_id: "instance1-01", addDist_movies: ["instance1-02", "instance1-03"]) {
            director_name
            countFilteredDist_movies
            dist_moviesConnection(pagination: {first: 5}) {
              edges {
                node {
                  runtime
                }
              }
              dist_movies{
                movie_id
              }
            }
          }
        }
        `
    );
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        updateDist_director: {
          director_name: "Chloé Zhao",
          countFilteredDist_movies: 2,
          dist_moviesConnection: {
            edges: [
              {
                node: {
                  runtime: 110,
                },
              },
              {
                node: {
                  runtime: 145,
                },
              },
            ],
            dist_movies: [
              { movie_id: "instance1-02" },
              { movie_id: "instance1-03" },
            ],
          },
        },
      },
    });
  });
  it("04. Movie DDM: read all", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      `{
          dist_directorsConnection(pagination: {first: 25}) {
            edges {
              node {
                director_id
                countFilteredDist_movies
              }
            }
          }
        }
        `
    );
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        dist_directorsConnection: {
          edges: [
            {
              node: {
                director_id: "instance1-01",
                countFilteredDist_movies: 2,
              },
            },
          ],
        },
      },
    });
  });
  it("05. Movie DDM: search, sort and pagination", () => {
    res = itHelpers.request_graph_ql_post_instance2(
      `{
          dist_moviesConnection(search: {field: movie_id, value: "instance.*", operator: regexp}, pagination: {first: 5}) {
            edges {
              node {
                movie_id
                runtime
              }
            }
          }
        }
        `
    );
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        dist_moviesConnection: {
          edges: [
            {
              node: {
                movie_id: "instance1-02",
                runtime: 110,
              },
            },
            {
              node: {
                movie_id: "instance1-03",
                runtime: 145,
              },
            },
            {
              node: {
                movie_id: "instance1-04",
                runtime: 120,
              },
            },
          ],
        },
      },
    });
    // The same search, but order by name descending
    res = itHelpers.request_graph_ql_post_instance2(
      `{
          dist_moviesConnection(search: {field: movie_id, value: "instance.*", operator: regexp},
          order:{field:runtime order:DESC}, pagination: {first: 5}) {
            edges {
              node {
                movie_id
                runtime
              }
            }
          }
        }`
    );
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        dist_moviesConnection: {
          edges: [
            {
              node: {
                movie_id: "instance1-03",
                runtime: 145,
              },
            },
            {
              node: {
                movie_id: "instance1-04",
                runtime: 120,
              },
            },
            {
              node: {
                movie_id: "instance1-02",
                runtime: 110,
              },
            },
          ],
        },
      },
    });
    res = itHelpers.request_graph_ql_post_instance2(
      `{
          dist_moviesConnection(pagination: {first: 5,
            after:"eyJtb3ZpZV9pZCI6Imluc3RhbmNlMS0wMiIsInJ1bnRpbWUiOjExMCwiZGlyZWN0b3JfaWQiOiJpbnN0YW5jZTEtMDEifQ=="
            }){
            edges {
              node {
                movie_id
                runtime
              }
              cursor
            }
            pageInfo {
              startCursor
              endCursor
              hasNextPage
              hasPreviousPage
            }
          }
        }
        `
    );
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        dist_moviesConnection: {
          edges: [
            {
              cursor:
                "eyJtb3ZpZV9pZCI6Imluc3RhbmNlMS0wMyIsInJ1bnRpbWUiOjE0NSwiZGlyZWN0b3JfaWQiOiJpbnN0YW5jZTEtMDEifQ==",
              node: {
                movie_id: "instance1-03",
                runtime: 145,
              },
            },
            {
              cursor:
                "eyJtb3ZpZV9pZCI6Imluc3RhbmNlMS0wNCIsInJ1bnRpbWUiOjEyMH0=",
              node: {
                movie_id: "instance1-04",
                runtime: 120,
              },
            },
          ],
          pageInfo: {
            startCursor:
              "eyJtb3ZpZV9pZCI6Imluc3RhbmNlMS0wMyIsInJ1bnRpbWUiOjE0NSwiZGlyZWN0b3JfaWQiOiJpbnN0YW5jZTEtMDEifQ==",
            endCursor:
              "eyJtb3ZpZV9pZCI6Imluc3RhbmNlMS0wNCIsInJ1bnRpbWUiOjEyMH0=",
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
      },
    });
  });
  it("06. Movie DDM: update the director to remove associations", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      `mutation {
          updateDist_director(director_id:"instance1-01" removeDist_movies:["instance1-02", "instance1-03"]) {
            director_name
            countFilteredDist_movies
            dist_moviesConnection(pagination:{first:5}){
              edges {
                node {
                  runtime
                }
              }
              dist_movies{
                movie_id
              }
            }
          }
        }`
    );
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        updateDist_director: {
          director_name: "Chloé Zhao",
          countFilteredDist_movies: 0,
          dist_moviesConnection: {
            edges: [],
            dist_movies: [],
          },
        },
      },
    });
  });
});

describe("data loader for readById method", () => {
  //set up the environment
  before(async () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      `mutation {
        n1: addMovie(movie_id:"m1", genres:["action","thriller"]){ genres }
        n2: addMovie(movie_id:"m2", genres:["wuxia","mystery"]){ genres }
        n3: addMovie(movie_id:"m3", genres:["crime","horror"]){ genres }
      }`
    );
    expect(res.statusCode).to.equal(200);
    res = itHelpers.request_graph_ql_post_instance2(`
      mutation {
        n1: addDirector( director_id: "d1", director_name: "Chloé Zhao", addMovies: ["m1", "m2"] ){ director_name }
        n2: addDirector( director_id: "d2", director_name: "Sakamoto Yuuji", addMovies: ["m3"] ){ director_name }
      }`);
    expect(res.statusCode).to.equal(200);

    res = itHelpers.request_graph_ql_post_instance2(
      `mutation{
        n1: addActor(actor_id:"a1", actor_name:"Yokohama Ryusei", addMovies:["m1", "m3"]){ actor_id }
        n2: addActor(actor_id:"a2", actor_name:"Minami Hamabe", addMovies:["m1", "m2"]){ actor_id }
      }`
    );
    expect(res.statusCode).to.equal(200);

    res = itHelpers.request_graph_ql_post_instance2(
      `mutation{
        addReview(review_id:"r1", rating:4.9, addUnique_movie:"m2"){
          review_id
        }
      }`
    );
    expect(res.statusCode).to.equal(200);
  });
  //clean up records
  after(async () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      `mutation {
        n0: updateDirector(director_id: "d1", removeMovies: ["m1", "m2"]) { director_name }
        n1: updateDirector(director_id: "d2", removeMovies: ["m3"]) { director_name }
        n2: updateActor(actor_id: "a1", removeMovies:["m1", "m3"]){ actor_id }
        n3: updateActor(actor_id: "a2", removeMovies:["m1", "m2"]){ actor_id }
        n4: updateReview(review_id: "r1", removeUnique_movie: "m2"){ review_id }
      }`
    );
    expect(res.statusCode).to.equal(200);

    res = itHelpers.request_graph_ql_post_instance2(
      `mutation{
        n1: deleteMovie (movie_id: "m1")
        n2: deleteMovie (movie_id: "m2")
        n3: deleteMovie (movie_id: "m3")
        n4: deleteDirector (director_id: "d1")
        n5: deleteDirector (director_id: "d2")
        n6: deleteActor (actor_id: "a1")
        n7: deleteActor (actor_id: "a2")
        n8: deleteReview (review_id: "r1")
      }`
    );
    expect(res.statusCode).to.equal(200);
  });
  it("01. director -> movie: one to many", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      `{
        n0: readOneDirector(director_id: "d1") {
          countFilteredMovies(search: null)
          moviesFilter(pagination:{offset: 0, limit: 2}){
            genres
          }
          moviesConnection(pagination:{first:2}){
            movies{
              movie_id
            }
          }
        }
        n1: readOneDirector(director_id: "d2") {
          countFilteredMovies(search: null)
          moviesFilter(pagination:{offset: 0, limit: 2}){
            genres
          }
          moviesConnection(pagination:{first:2}){
            movies{
              movie_id
            }
          }
        }
      }`
    );
    expect(res.statusCode).to.equal(200);
    let resBody = JSON.parse(res.body.toString("utf8"));
    //check associated records
    expect(resBody.data).to.deep.equal({
      n0: {
        moviesConnection: {
          movies: [
            {
              movie_id: "m1",
            },
            {
              movie_id: "m2",
            },
          ],
        },
        moviesFilter: [
          {
            genres: ["action", "thriller"],
          },
          {
            genres: ["wuxia", "mystery"],
          },
        ],
        countFilteredMovies: 2,
      },
      n1: {
        moviesConnection: {
          movies: [
            {
              movie_id: "m3",
            },
          ],
        },
        moviesFilter: [
          {
            genres: ["crime", "horror"],
          },
        ],
        countFilteredMovies: 1,
      },
    });
  });
  it("02. movie -> director: many to one", () => {
    let res = itHelpers.request_graph_ql_post_instance2(`{
      n0: readOneMovie(movie_id: "m1"){
        genres
        director{
          director_name
        }
      }
      n1: readOneMovie(movie_id: "m2"){
        genres
        director{
          director_name
        }
      }
      n2: readOneMovie(movie_id: "m3"){
        genres
        director{
          director_name
        }
      }
      n4: readOneMovie(movie_id: "m4"){
        genres
        director{
          director_name
        }
      }
    }`);
    expect(res.statusCode).to.equal(200);
    let resBody = JSON.parse(res.body.toString("utf8"));
    //check associated records
    expect(resBody.errors).to.deep.equal([
      {
        message: 'Record with ID = "m4" does not exist',
        locations: [
          {
            column: 7,
            line: 20,
          },
        ],
        path: ["n4"],
      },
    ]);
    expect(resBody.data).to.deep.equal({
      n0: {
        genres: ["action", "thriller"],
        director: {
          director_name: "Chloé Zhao",
        },
      },
      n1: {
        genres: ["wuxia", "mystery"],
        director: {
          director_name: "Chloé Zhao",
        },
      },
      n2: {
        genres: ["crime", "horror"],
        director: {
          director_name: "Sakamoto Yuuji",
        },
      },
      n4: null,
    });
  });
  it("03. movie <-> actor: many to many", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      `{
        n0: readOneMovie(movie_id: "m1") {
          countFilteredActor(search: null)
          actorFilter(pagination:{offset: 0, limit: 2}){
            actor_id
          }
          actorConnection(search: null, pagination: {first:2})
          {
            edges{
              node{
                actor_id
              }
            }
          }
        }
        n1: readOneMovie(movie_id: "m2") {
          countFilteredActor(search: null)
          actorFilter(pagination:{offset: 0, limit: 2}){
            actor_id
          }
          actorConnection(search: null, pagination: {first:2})
          {
            edges{
              node{
                actor_id
              }
            }
          }
        }
        n2: readOneMovie(movie_id: "m3") {
          countFilteredActor(search: null)
          actorFilter(pagination:{offset: 0, limit: 2}){
            actor_id
          }
          actorConnection(search: null, pagination: {first:2})
          {
            edges{
              node{
                actor_id
              }
            }
          }
        }
      }`
    );
    expect(res.statusCode).to.equal(200);
    let resBody = JSON.parse(res.body.toString("utf8"));
    //check associated records
    expect(resBody.data).to.deep.equal({
      n0: {
        countFilteredActor: 2,
        actorConnection: {
          edges: [
            {
              node: {
                actor_id: "a1",
              },
            },
            {
              node: {
                actor_id: "a2",
              },
            },
          ],
        },
        actorFilter: [
          {
            actor_id: "a1",
          },
          {
            actor_id: "a2",
          },
        ],
      },
      n1: {
        countFilteredActor: 1,
        actorConnection: {
          edges: [
            {
              node: {
                actor_id: "a2",
              },
            },
          ],
        },
        actorFilter: [
          {
            actor_id: "a2",
          },
        ],
      },
      n2: {
        countFilteredActor: 1,
        actorConnection: {
          edges: [
            {
              node: {
                actor_id: "a1",
              },
            },
          ],
        },
        actorFilter: [
          {
            actor_id: "a1",
          },
        ],
      },
    });
  });
  it("04. movie <-> review: one to one", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      `{
        readOneMovie(movie_id: "m2") {
          genres
          unique_review(search: null){
            review_id
          }
        }
      }`
    );
    expect(res.statusCode).to.equal(200);
    let resBody = JSON.parse(res.body.toString("utf8"));
    //check associated records
    expect(resBody.data).to.deep.equal({
      readOneMovie: {
        genres: ["wuxia", "mystery"],
        unique_review: {
          review_id: "r1",
        },
      },
    });
  });
});
