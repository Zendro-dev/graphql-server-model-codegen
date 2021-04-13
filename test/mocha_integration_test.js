const { expect } = require('chai');
const should = require('chai').should();
const path = require('path');
const delay = require('delay');
const itHelpers = require('./integration_test_misc/integration_test_helpers');

//HINT:
//DELETE FROM transcript_counts;
//DELETE FROM individuals;
//DELETE FROM cats;
//ALTER SEQUENCE individuals_id_seq RESTART WITH 1;
//ALTER SEQUENCE transcript_counts_id_seq RESTART WITH 1;
//ALTER SEQUENCE cats_id_seq RESTART WITH 1;

describe(
  'Clean GraphQL Server: one new basic function per test ("Individual" model)',
  function() {

    after(async function() {
        // Delete associations between individuals and transcript_counts
        // The only ones to exist at this point are from Test 19
        let res = itHelpers.request_graph_ql_post('{transcript_counts(search:{field:individual_id operator:ne value:"0"},pagination:{limit:25}) {id individual_id}}');
        let tcResBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        let idValues = tcResBody.data.transcript_counts;
        for (let i = 0; i < idValues.length; i++){
            res = itHelpers.request_graph_ql_post(`mutation{updateTranscript_count(id:"${idValues[i].id}" removeIndividual:"${idValues[i].individual_id}") {id gene individual{id name}}}`);
            tcResBody = JSON.parse(res.body.toString('utf8'));
            expect(res.statusCode).to.equal(200);
            expect(tcResBody).to.deep.equal({
                data: {
                  updateTranscript_count: {
                    id: `${idValues[i].id}`,
                    gene: "Gene D",
                    individual: null
                  }
                }
              });
        }

        // Delete all individuals
        res = itHelpers.request_graph_ql_post('{ individuals(pagination:{limit:25}) {id} }');
        let individuals = JSON.parse(res.body.toString('utf8')).data.individuals;

        for(let i = 0; i < individuals.length; i++){
            res = itHelpers.request_graph_ql_post(`mutation { deleteIndividual (id: ${individuals[i].id}) }`);
            expect(res.statusCode).to.equal(200);
        }

        let cnt = await itHelpers.count_all_records('countIndividuals');
        expect(cnt).to.equal(0)

        // Delete all transcript_counts
        res = itHelpers.request_graph_ql_post('{ transcript_counts(pagination:{limit:25}) {id} }');
        let transcript_counts = JSON.parse(res.body.toString('utf8')).data.transcript_counts;

        for(let i = 0; i < transcript_counts.length; i++){
            res = itHelpers.request_graph_ql_post(`mutation { deleteTranscript_count (id: ${transcript_counts[i].id}) }`);
            expect(res.statusCode).to.equal(200);
        }

        cnt = await itHelpers.count_all_records('countTranscript_counts');
        expect(cnt).to.equal(0);
    })

    it('01. Individual table is empty', function() {
        let res = itHelpers.request_graph_ql_post('{ countIndividuals }');
        let resBody = JSON.parse(res.body.toString('utf8'));

        expect(res.statusCode).to.equal(200);
        expect(resBody.data.countIndividuals).equal(0);
    });


    it('02. Individual add', async function() {
        let res = itHelpers.request_graph_ql_post('mutation { addIndividual(name: "First") { id } }');

        expect(res.statusCode).to.equal(200);

        let cnt = await itHelpers.count_all_records('countIndividuals');
        expect(cnt).to.equal(1);
    });


    // This test uses the entry created in the last test
    it('03. Individual update', function() {
        let res = itHelpers.request_graph_ql_post('{individuals(search:{field:name operator:eq value:"First"}, pagination:{limit:25}){id}}');
        let resBody = JSON.parse(res.body.toString('utf8'));
        let individual = resBody.data.individuals[0].id;

        res = itHelpers.request_graph_ql_post(`mutation { updateIndividual(id: ${individual}, name: "FirstToSecondUpdated") {id name} }`);
        resBody = JSON.parse(res.body.toString('utf8'));

        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
                updateIndividual: {
                    id: `${individual}`,
                    name: "FirstToSecondUpdated"
                }
            }
        })
    });

    // This test relies on the two tests before where the first entry was created and modified (so the number of entries will be 2)
    it('04. Individual add one more and find both', function() {

        itHelpers.request_graph_ql_post('mutation { addIndividual(name: "Second") {id} }');
        let res = itHelpers.request_graph_ql_post('{ individuals(pagination:{limit:25}) {id} }');
        let resBody = JSON.parse(res.body.toString('utf8'));

        expect(res.statusCode).to.equal(200);
        expect(resBody.data.individuals.length).equal(2);

    });


    // This test reads the entry created in the last test
    it('05. Individual read one', function() {
        let res = itHelpers.request_graph_ql_post('{individuals(search:{field:name, operator:eq, value:"Second"}, pagination:{limit:25}){id}}');
        let resBody = JSON.parse(res.body.toString('utf8'));
        let individual = resBody.data.individuals[0].id;

        res = itHelpers.request_graph_ql_post(`{ readOneIndividual(id : ${individual}) { id name } }`);
        resBody = JSON.parse(res.body.toString('utf8'));

        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
                readOneIndividual: {
                    id: `${individual}`,
                    name: "Second"
                }
            }
        })

    });

    // This test finds both entries created before - the first entry was modified in 03 to match the search
    it('06. Individual search with like', function() {

        let res = itHelpers.request_graph_ql_post('{individuals(search:{field:name, value:"%Second%", operator:like},pagination:{limit:25}) {name}}');
        let resBody = JSON.parse(res.body.toString('utf8'));

        expect(res.statusCode).to.equal(200);
        expect(resBody.data.individuals.length).equal(2);

    });

    // This test needs entries to exist
    it('07. Individual paginate', function() {

        let res = itHelpers.request_graph_ql_post('{individuals(pagination:{limit:1}) {id name}}');
        let resBody = JSON.parse(res.body.toString('utf8'));

        expect(res.statusCode).to.equal(200);
        expect(resBody.data.individuals.length).equal(1);

    });

    // This test finds both entries created before, with the first entry (here shown second because of sorting) modified in 03
    it('08. Individual sort', function() {

        let res = itHelpers.request_graph_ql_post('{individuals(pagination: {limit:2}, order: [{field: name, order: DESC}]) {name}}');
        let resBody = JSON.parse(res.body.toString('utf8'));

        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
                individuals: [
                    {name: "Second"},
                    {name: "FirstToSecondUpdated"}
                ]
            }
        })

    });

    // After this test, the 2 entries created before are gone
    it('09. Individual delete all', async function() {

        let res = itHelpers.request_graph_ql_post('{ individuals(pagination:{limit:25}) {id} }');
        let individuals = JSON.parse(res.body.toString('utf8')).data.individuals;

        for(let i = 0; i < individuals.length; i++){
            res = itHelpers.request_graph_ql_post(`mutation { deleteIndividual (id: ${individuals[i].id}) }`);
            expect(res.statusCode).to.equal(200);
        }

        let cnt = await itHelpers.count_all_records('countIndividuals');
        expect(cnt).to.equal(0);
    });

    // transcript_count model tests start here:
    it('10. TranscriptCount table is empty', function() {

        let res = itHelpers.request_graph_ql_post('{countTranscript_counts}');
        let resBody = JSON.parse(res.body.toString('utf8'));

        expect(res.statusCode).to.equal(200);
        expect(resBody.data.countTranscript_counts).equal(0);

    });


    it('11. TranscriptCount add', async function() {

        let res = itHelpers.request_graph_ql_post('mutation ' +
            '{ addTranscript_count(gene: "Gene A", ' +
                                  'variable: "RPKM", ' +
                                  'count: 123.32, ' +
                                  'tissue_or_condition: "Root") { id } }');

        expect(res.statusCode).to.equal(200);
        let cnt = await itHelpers.count_all_records('countTranscript_counts');
        expect(cnt).to.equal(1);
    });


    // This test modifies the entry created in the last test
    it('12. TranscriptCount update', function() {
        let res = itHelpers.request_graph_ql_post('{transcript_counts(pagination:{limit:25}){id}}');
        let resBody = JSON.parse(res.body.toString('utf8'));
        let tcount = resBody.data.transcript_counts[0].id;

        res = itHelpers.request_graph_ql_post(`mutation { updateTranscript_count(id: ${tcount}, gene: "Gene B") {id gene} }`);
        resBody = JSON.parse(res.body.toString('utf8'));

        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
                updateTranscript_count: {
                    id: `${tcount}`,
                    gene: "Gene B"
                }
            }
        })

    });

    // This test finds the entry created and modified in the 2 last tests
    it('13. TranscriptCount add one more and find both', function() {

        itHelpers.request_graph_ql_post('mutation { addTranscript_count(gene: "Gene C", ' +
                                                                       'variable: "RPKM", ' +
                                                                       'count: 321.23, ' +
                                                                       'tissue_or_condition: "Stem") {id} }');
        let res = itHelpers.request_graph_ql_post('{ transcript_counts(pagination:{limit:25}) {id} }');
        let resBody = JSON.parse(res.body.toString('utf8'));

        expect(res.statusCode).to.equal(200);
        expect(resBody.data.transcript_counts.length).equal(2);

    });


    // This test reads the entry created in the last test
    it('14. TranscriptCount read one', function() {
        let res = itHelpers.request_graph_ql_post('{transcript_counts(search: {field:gene operator:eq value:"Gene C"},pagination:{limit:25}) {id}}');
        let resBody = JSON.parse(res.body.toString('utf8'));
        let tcount = resBody.data.transcript_counts[0].id;

        res = itHelpers.request_graph_ql_post(`{readOneTranscript_count(id : ${tcount}) { id gene variable count tissue_or_condition}}`);
        resBody = JSON.parse(res.body.toString('utf8'));

        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
                readOneTranscript_count: {
                    id: `${tcount}`,
                    gene: "Gene C",
                    variable: "RPKM",
                    count: 321.23,
                    tissue_or_condition: "Stem"
                }
            }
        })

    });

    // This test reads the 2 entries that were created before (in 11 and 13)
    it('15. TranscriptCount search with like', function() {

        let res = itHelpers.request_graph_ql_post(`{transcript_counts(search: {field: gene,value:"%ene%",operator: like},pagination:{limit:25}) {gene}}`);
        let resBody = JSON.parse(res.body.toString('utf8'));

        expect(res.statusCode).to.equal(200);
        expect(resBody.data.transcript_counts.length).equal(2);

    });

    // This test needs an entry to exist
    it('16. TranscriptCount paginate', function() {

        let res = itHelpers.request_graph_ql_post('{transcript_counts(pagination:{limit:1}) {id gene}}');
        let resBody = JSON.parse(res.body.toString('utf8'));

        expect(res.statusCode).to.equal(200);
        expect(resBody.data.transcript_counts.length).equal(1);

    });

    // This test finds the 2 entries created and modified before (11 - 13)
    it('17. TranscriptCount sort', function() {

        let res = itHelpers.request_graph_ql_post('{ transcript_counts(pagination: {limit:2}, order: [{field: gene, order: DESC}]) {gene} }');
        let resBody = JSON.parse(res.body.toString('utf8'));

        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
                transcript_counts: [
                    {gene: "Gene C"},
                    {gene: "Gene B"}
                ]
            }
        })
    });

    // This test is independent from the other ones, other than the check for total numbers of entries found
    it('18. Extended search and regular expressions', async () => {
        let res = itHelpers.request_graph_ql_post('mutation { addIndividual(name: "Zazanaza") { id name } }');
        let resBody = JSON.parse(res.body.toString('utf8'));

        expect(res.statusCode).to.equal(200);
        expect(resBody.data.addIndividual.name).equal("Zazanaza");

        res = itHelpers.request_graph_ql_post('mutation { addIndividual(name: "Zazaniza") { id name } }');
        resBody = JSON.parse(res.body.toString('utf8'));

        expect(res.statusCode).to.equal(200);
        expect(resBody.data.addIndividual.name).equal("Zazaniza");

        res = itHelpers.request_graph_ql_post('mutation ' +
        '{ addTranscript_count(gene: "Gene D", ' +
                              'variable: "RPKM", ' +
                              'count: 444.44, ' +
                              'tissue_or_condition: "Root"' +
                              ') { id } }');
        res = itHelpers.request_graph_ql_post('{ transcript_counts(pagination:{limit:25}) {id} }');
        resBody = JSON.parse(res.body.toString('utf8'));

        expect(res.statusCode).to.equal(200);
        expect(resBody.data.transcript_counts.length).equal(3);

        res = await itHelpers.request_metaquery_post([`{ transcript_counts(search: {field: gene, operator: eq, value: "Gene D"},pagination:{limit:5}) {gene}}`,
                            `{individuals (search: {field: name, operator: eq, value: "Zazaniza"},pagination:{limit:5}) {name}}`], '.', null);
        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);

        expect(resBody).to.deep.equal({
            data: [
                {
                    transcript_counts: [
                        {gene: "Gene D"}
                    ]
                },
                {
                    individuals: [
                        {name: "Zazaniza"}
                    ]
                }
            ]
        });


        res = itHelpers.request_graph_ql_post(`{ individuals (search: {field: name, operator: regexp, value: "Zazan[aeiou]za"},pagination:{limit:25}) {name}}`);
        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
                individuals: [
                    {name: "Zazanaza"},
                    {name: "Zazaniza"}
                ]
            }
        });

        res = itHelpers.request_graph_ql_post(`{ individuals (search: {field: name, operator: notRegexp, value: "^[A-Ya-z].*"},pagination:{limit:25}) {name}}`);
        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
                individuals: [
                    {name: "Zazanaza"},
                    {name: "Zazaniza"}
                ]
            }
        });

        res = await itHelpers.request_metaquery_post([`{ firstPerson: individuals (search: {field: name, operator: eq, value: "Zazanaza"},pagination:{limit:10}) {name}}`,
                                `{secondPerson: individuals (search: {field: name, operator: eq, value: "Zazaniza"},pagination:{limit:10}) {name}}`], '.', null);

        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
          data: [
              {
                  firstPerson: [
                      {
                          name: "Zazanaza"
                      }
                  ]
              },
              {
                  secondPerson: [
                      {
                          name: "Zazaniza"
                      }
                  ]
              }
          ]
        });

        res = await itHelpers.request_metaquery_post([`{ firstPerson: individuals (search: {field: name, operator: eq, value: "Zazanaza"},pagination:{limit:10}) {names}}`,
                                `{secondPerson: individuals (search: {field: name, operator: eq, value: "Zazaniza"}, pagination:{limit:10}) {names}}`], '.', null);
        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);

        expect(resBody).to.deep.equal({
            data:[
                null, null
            ],
            errors:[
                {
                    message:'Cannot query field "names" on type "individual". Did you mean "name"?',
                    locations:[
                        {
                            line:1,
                            // column:95
                            column: 108
                        }
                    ]
                },
                {
                    message:'Cannot query field "names" on type "individual". Did you mean "name"?',
                    locations:[
                        {
                            line:1,
                            // column:95
                            column: 109
                        }
                    ]
                }
            ]
        });

        res = await itHelpers.request_metaquery_post([`{ firstPerson: individuals (search: {field: name, operator: eq, value: "Zazanaza"},pagination:{limit:10}) {name}}`,
                                `{secondPerson: individuals (search: {field: name, operator: eq, value: "Zazaniza"},pagination:{limit:10}) {name}}`], '.data', null);

        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal(
            [
                {
                    firstPerson: [
                        {
                            name: "Zazanaza"
                        }
                    ]
                },
                {
                    secondPerson: [
                        {
                            name: "Zazaniza"
                        }
                    ]
                }
            ]
        );

        res = await itHelpers.request_metaquery_post([`{ firstPerson: individuals (search: {field: name, operator: eq, value: "Zazanaza"}, pagination:{limit:10}) {name}}`,
                                `{secondPerson: individuals (search: {field: name, operator: eq, value: "Zazaniza"},pagination:{limit:10}) {name}}`], '.~data', null);

        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: null,
            errors: [{message:
                "jq: error: syntax error, unexpected INVALID_CHARACTER (Unix shell quoting issues?) at <top-level>, line 1:\n.~data \njq: error: try .[\"field\"] instead of .field for unusually named fields at <top-level>, line 1:\n.~data\njq: 2 compile errors\n"}]
        });



        res = await itHelpers.request_metaquery_post([`{ firstPerson: individuals (search: {field: name, operator: eq, value: "Zazanaza"},pagination:{limit:10}) {name}}`,
                                `{secondPerson: individuals (search: {field: name, operator: eq, value: "Zazaniza"}, pagination:{limit:10}) {name}}`], null, '$');

        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
          data: [
              {
                  firstPerson: [
                      {
                          name: "Zazanaza"
                      }
                  ]
              },
              {
                  secondPerson: [
                      {
                          name: "Zazaniza"
                      }
                  ]
              }
          ]
        });

        res = await itHelpers.request_metaquery_post([`{ firstPerson: individuals (search: {field: name, operator: eq, value: "Zazanaza"},pagination:{limit:10}) {name}}`,
                                `{secondPerson: individuals (search: {field: name, operator: eq, value: "Zazaniza"},pagination:{limit:10}) {name}}`], null, '$.data');

        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal(
            [
                {
                    firstPerson: [
                        {
                            name: "Zazanaza"
                        }
                    ]
                },
                {
                    secondPerson: [
                        {
                            name: "Zazaniza"
                        }
                    ]
                }
            ]
        );

        res = await itHelpers.request_metaquery_post([`{ firstPerson: individuals (search: {field: name, operator: eq, value: "Zazanaza"},pagination:{limit:10}) {name}}`,
                                `{secondPerson: individuals (search: {field: name, operator: eq, value: "Zazaniza"},pagination:{limit:10}) {name}}`], null, '$~data');

        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: null,
            errors: [{message: "this._trace(...).filter is not a function"}]
        });


        res = await itHelpers.request_metaquery_post([`{ firstPerson: individuals (search: {field: name, operator: eq, value: "Zazanaza"},pagination:{limit:10}) {name}}`,
        `{secondPerson: individuals (search: {field: name, operator: eq, value: "Zazaniza"}) {name},pagination:{limit:10}}`], '.', '$');

        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: null,
            errors: [{message: "State either 'jq' or 'jsonPath' expressions, never both. - jq is . and jsonPath is $"}]
        });

        res = await itHelpers.request_metaquery_post([`{ firstPerson: individuals (search: {field: name, operator: eq, value: "Zazanaza"},pagination:{limit:10}) {name}}`,
        `{secondPerson: individuals (search: {field: name, operator: eq, value: "Zazaniza"},pagination:{limit:10}) {name}}`], null, null);

        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: null,
            errors: [{message: "State either 'jq' or 'jsonPath' expressions, never both. - both are null or undefined"}]
        });
    });




    // Test belongs-to relation between transcript_count and individual data
    // model:
    it('19. TranscriptCount assign new Individual', function() {

        // Create Plant to subjected to RNA-Seq analysis from which the transcript_counts result
        let res = itHelpers.request_graph_ql_post('mutation { addIndividual(name: "IncredibleMaizePlantOne") { id name } }');
        let resBody = JSON.parse(res.body.toString('utf8'));

        expect(res.statusCode).to.equal(200);
        expect(resBody.data.addIndividual.name).equal("IncredibleMaizePlantOne");
        let plantId = resBody.data.addIndividual.id;

        // Create TranscriptCount with above Plant assigned as Individual
        res = itHelpers.request_graph_ql_post('mutation { addTranscript_count(gene: "Gene D", ' +
                                                                             'variable: "RPKM", ' +
                                                                             'count: 321.23, ' +
                                                                             'tissue_or_condition: "Stem", ' +
                                                                             `addIndividual: ${plantId}) ` +
                                                                             '{id gene individual { id name } } }');

        let tcResBody = JSON.parse(res.body.toString('utf8'));
        let tcId = tcResBody.data.addTranscript_count.id;
        expect(res.statusCode).to.equal(200);
        expect(tcResBody).to.deep.equal({
            data: {
              addTranscript_count: {
                id: `${tcId}`,
                gene: "Gene D",
                individual: {
                  id: `${plantId}`,
                  name: "IncredibleMaizePlantOne"
                }
              }
            }
        })

    });

  // This test uses the entry created in the last test, and relies on this entry having got an association (and thus cannot be erased)
  it('20. TranscriptCount - Deleting a record with associations fails', function() {
      let res = itHelpers.request_graph_ql_post('{transcript_counts(search:{field:individual_id operator:ne value:"0"},pagination:{limit:25}) {id individual_id}}');
      let tcResBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      let idValue = tcResBody.data.transcript_counts[0].id;

      res = itHelpers.request_graph_ql_post(`mutation { deleteTranscript_count (id: ${idValue}) }`);
      let resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(500);
      expect(resBody).to.deep.equal({
          errors:[
              {
                  message:`transcript_count with id ${idValue} has associated records and is NOT valid for deletion. Please clean up before you delete.`,
                  locations: [
                            {
                              column: 12,
                              line: 1
                            }
                          ],
                  path:["deleteTranscript_count"]
                }
            ],
            data:null
        });
  });

  // This test is independent of the other ones
  it('21. Limit check', function(){
    // create 8 individuals to tests field Resolver Limits
    let individualName = "CountIndividual";
    let individualAdding = `mutation { addIndividual (name: "${individualName}") { name id}}`;
    let individualsCreated = [];

    for(let i = 0; i < 8; i++){
      res = itHelpers.request_graph_ql_post(individualAdding);
      expect(res.statusCode).to.equal(200);
      individualsCreated.push( JSON.parse(res.body.toString('utf8')).data.addIndividual.id)
    }
    expect(res.statusCode).to.equal(200);
    res = itHelpers.request_graph_ql_post(`{ individuals (search: {field: name, operator: eq, value: "${individualName}"},pagination:{limit:25}) {name}}`);
    resBody = JSON.parse(res.body.toString('utf8'));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.individuals.length).equal(8);

    //  sql record in Limit
    res = itHelpers.request_graph_ql_post(`{ individuals (pagination:{limit:25}) {name}}`);
    expect(res.statusCode).to.equal(200);

    // sql record in Limit with field Resolver
    res = itHelpers.request_graph_ql_post(`{ individuals (pagination:{limit:8}) {name transcript_countsConnection(pagination:{first:2}){edges{node{id}}}}}`);
    expect(res.statusCode).to.equal(200);

    //  sql record over Limit
    res = itHelpers.request_graph_ql_post(`{ individuals (pagination:{limit:26}) {name}}`);
    resBody = JSON.parse(res.body.toString('utf8'));
    expect(resBody.errors[0].message).equal("Max record limit of 25 exceeded in individuals");

    //  sql record over Limit wth field Resolver
    res = itHelpers.request_graph_ql_post(`{ individuals (pagination:{limit:8}) {name transcript_countsConnection(pagination:{first:3}){edges{node{id}}}}}`);
    resBody = JSON.parse(res.body.toString('utf8'));
    expect(resBody.errors[0].message).equal("Max record limit of 25 exceeded in transcript_countsConnection");
    expect(resBody.errors.length).equal(3);

    // remove individuals
    res = itHelpers.request_graph_ql_post(`{individuals(pagination:{limit:25}){id}}`);
    expect(res.statusCode).to.equal(200);
    for(let i = 0; i < individualsCreated.length; i++){
      res = itHelpers.request_graph_ql_post(`mutation { deleteIndividual (id: ${individualsCreated[i]}) }`);
      expect(res.statusCode).to.equal(200);
    }

    // zendro-server over Limit on remote Server
    res = itHelpers.request_graph_ql_post_instance2(`{accessions(pagination:{limit:26}){accession_id}}`);
    expect(res.statusCode).to.equal(200);
    resBody = JSON.parse(res.body.toString('utf8'));
    expect(resBody).to.deep.equal({
      "errors": [
        {
          "message": "Remote server (http://server1:3000/graphql) did not respond with data.",
          "locations": [
            {
              "line": 1,
              "column": 2
            }
          ],
          "path": [
            "accessions"
          ]
        },
        {
          "message": "Max record limit of 25 exceeded in accessions",
          "locations": [
            {
              "line": 2,
              "column": 7
            }
          ],
          "extensions": {
            "receivedFrom": [
              "http://server1:3000/graphql"
            ]
          },
          "path": [
            "accessions"
          ]
        }
      ],
      "data": {
        "accessions": null
      }
    });

    // DDM over Limit on local adapter
    res = itHelpers.request_graph_ql_post(`{peopleConnection(pagination: {first: 26}) { edges { node { person_id } } } }`);
    resBody = JSON.parse(res.body.toString('utf8'));
    expect(resBody.errors[0].message).equal("Max record limit of 25 exceeded in peopleConnection");

    // DDM over Limit on remote zendro-adapter
    // add a local person to make sure data + errors get delivered
    res = itHelpers.request_graph_ql_post(`mutation{ addPerson( person_id:"instance2_p0001"){person_id} }`)
    expect(res.statusCode).to.equal(200);
    res = itHelpers.request_graph_ql_post_instance2(`{peopleConnection(pagination: {first: 26}) { edges { node { person_id } } } }`);
    expect(res.statusCode).to.equal(200);
    resBody = JSON.parse(res.body.toString('utf8'));
    expect(resBody).to.deep.equal({
      "errors": [
        {
          "message": "Max record limit of 25 exceeded in peopleConnection",
          "locations": [
            {
              "line": 2,
              "column": 7
            }
          ],
          "extensions": {
            "receivedFrom": [
              "http://server1:3000/graphql"
            ]
          },
          "path": [
            "peopleConnection"
          ]
        },
        {
          "message": "Remote zendro-server (http://server1:3000/graphql) did not respond with data.",
          "locations": ""
        }
      ],
      "data": {
        "peopleConnection": {
          "edges": [
            {
              "node": {
                "person_id": "instance2_p0001"
              }
            }
          ]
        }
      }
    })
    // remove the person
    res = itHelpers.request_graph_ql_post(`mutation{ deletePerson( person_id:"instance2_p0001")}`)
    expect(res.statusCode).to.equal(200);
  });

  //one_to_one associations where foreignKey is in the target model
  it('22. one_to_one associations setup', function() {
    //setup
    itHelpers.request_graph_ql_post('mutation { addCountry(country_id: "GER", name: "Germany") {country_id} }');
    let res = itHelpers.request_graph_ql_post('{ countries(pagination:{limit:25}) {country_id} }');
    let resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody.data.countries.length).equal(1);

    itHelpers.request_graph_ql_post('mutation { addCapital(capital_id:"GER_B", name: "Berlin", addUnique_country:"GER") {capital_id} }');
    res = itHelpers.request_graph_ql_post('{ capitals(pagination:{limit:25}) {capital_id} }');
    resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody.data.capitals.length).equal(1);
  });

  it('23. one_to_one associations success', function() {
    //test success
    res = itHelpers.request_graph_ql_post('{ countries(pagination:{limit:10}) {country_id unique_capital{ capital_id}} }');
    resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal(
      {"data":{"countries":[{"country_id":"GER","unique_capital":{"capital_id":"GER_B"}}]}}
    )
  });

  it('24. one_to_one associations error', function() {
    //test error
    itHelpers.request_graph_ql_post('mutation { addCapital(capital_id:"GER_BN", name: "Bonn", addUnique_country:"GER") {capital_id} }');
    res = itHelpers.request_graph_ql_post('{ countries(pagination:{limit:10}) {country_id unique_capital{ capital_id}} }');
    resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      errors:[
        {
          message:'Not unique \"to_one\" association Error: Found > 1 capitals matching country with country_id GER. Consider making this a \"to_many\" association, or using unique constraints, or moving the foreign key into the country model. Returning first capital.',
          locations: ""
        }
      ],
      data:{
        countries:[
          {
            country_id:"GER",
            unique_capital:{
              capital_id:"GER_B"
            }
          }
        ]
      }
    });
  });

  it('25. one_to_one associations deletion cleanup', function() {
    //cleanup
    res = itHelpers.request_graph_ql_post('mutation { updateCountry(country_id: "GER", removeUnique_capital:"GER_B") {country_id} }');
    expect(res.statusCode).to.equal(200);
    res = itHelpers.request_graph_ql_post('mutation { updateCountry(country_id: "GER", removeUnique_capital:"GER_BN") {country_id} }');
    expect(res.statusCode).to.equal(200);
    res = itHelpers.request_graph_ql_post('mutation { deleteCountry(country_id: "GER")}');
    expect(res.statusCode).to.equal(200);
    res = itHelpers.request_graph_ql_post('mutation { deleteCapital(capital_id: "GER_B")}');
    expect(res.statusCode).to.equal(200);
    res = itHelpers.request_graph_ql_post('mutation { deleteCapital(capital_id: "GER_BN")}');
    expect(res.statusCode).to.equal(200);
  });

  it('26. to_many_through_sql_cross_table setup', function() {
    res = itHelpers.request_graph_ql_post('mutation { addCountry(country_id: "GER", name: "Germany") {country_id} }');
    expect(res.statusCode).to.equal(200);
    res = itHelpers.request_graph_ql_post('mutation { addCountry(country_id: "NED", name: "Netherlands") {country_id} }');
    expect(res.statusCode).to.equal(200);
    res = itHelpers.request_graph_ql_post('mutation { addCountry(country_id: "AUT", name: "Austria") {country_id} }');
    expect(res.statusCode).to.equal(200);
    res = itHelpers.request_graph_ql_post('mutation { addRiver(river_id: "river_1_rhine", name: "rhine", length:1230, addCountries:["GER","NED","AUT"]) {river_id} }');
    expect(res.statusCode).to.equal(200);
    res = itHelpers.request_graph_ql_post('mutation { addRiver(river_id: "river_2_donau", name: "donau", length:2850, addCountries:["GER","AUT"]) {river_id} }');
    expect(res.statusCode).to.equal(200);
  });

  it('27. to_many_through_sql_cross_table simple', function(){
    //Filter
    res = itHelpers.request_graph_ql_post('{countries(pagination:{limit:5}){name riversFilter(pagination:{limit:5}){name} countFilteredRivers} countCountries}')
    let resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody.data.countries.length).equal(3);
    //Connection
    res = itHelpers.request_graph_ql_post('{countries(pagination:{limit:5}){name riversConnection(pagination:{first:5}){edges{node{name}}} countFilteredRivers} countCountries}')
    resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody.data.countries.length).equal(3);
  });

  it('28. to_many_through_sql_cross_table Filter', function(){
    res = itHelpers.request_graph_ql_post('{ countries(pagination:{limit:5}){ name riversFilter(search:{field:length,value:"2000",valueType:Int, operator:gt},pagination:{limit:5}){ name }}}')
    resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);

    expect(resBody).to.deep.equal(
    {
      "data": {
        "countries": [
          {
            "name": "Austria",
            "riversFilter": [
              {
                "name": "donau"
              }
            ]
          },
          {
            "name": "Germany",
            "riversFilter": [
              {
                "name": "donau"
              }
            ]
          },
          {
            "name": "Netherlands",
            "riversFilter": []
          }
        ]
      }
    })
  });

  it('30. to_many_through_sql_cross_table Cleanup', function(){
    res = itHelpers.request_graph_ql_post('mutation{deleteRiver(river_id:"river_1_rhine")}');
    expect(res.statusCode).to.equal(200);
    res = itHelpers.request_graph_ql_post('mutation{deleteRiver(river_id:"river_2_donau")}');
    expect(res.statusCode).to.equal(200);
    res = itHelpers.request_graph_ql_post('mutation{deleteCountry(country_id:"GER")}');
    expect(res.statusCode).to.equal(200);
    res = itHelpers.request_graph_ql_post('mutation{deleteCountry(country_id:"NED")}');
    expect(res.statusCode).to.equal(200);
    res = itHelpers.request_graph_ql_post('mutation{deleteCountry(country_id:"AUT")}');
    expect(res.statusCode).to.equal(200);
  });

  it('31. Cursor based pagination', function() {
    let res = itHelpers.request_graph_ql_post('{transcript_countsConnection(pagination:{first:25}){edges{cursor node{id gene}} pageInfo{startCursor endCursor hasPreviousPage hasNextPage}}}');
    let resBody = JSON.parse(res.body.toString('utf8'));
    let edges = resBody.data.transcript_countsConnection.edges;

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        transcript_countsConnection: {
          edges: [
              {
                  cursor: `${edges[0].cursor}`,
                  node: {
                      id: `${edges[0].node.id}`,
                      gene: "Gene B"
                  }
              },
              {
                  cursor: `${edges[1].cursor}`,
                  node: {
                      id: `${edges[1].node.id}`,
                      gene: "Gene C"
                  }
              },
              {
                  cursor: `${edges[2].cursor}`,
                  node: {
                      id: `${edges[2].node.id}`,
                      gene: "Gene D"
                  }
              },
              {
                  cursor: `${edges[3].cursor}`,
                  node: {
                      id: `${edges[3].node.id}`,
                      gene: "Gene D"
                  }
              }
          ],
          pageInfo: {
              startCursor: `${resBody.data.transcript_countsConnection.pageInfo.startCursor}`,
              endCursor: `${resBody.data.transcript_countsConnection.pageInfo.endCursor}`,
              hasPreviousPage: false,
              hasNextPage: false
          }
      }
  }});
  })

  it('32. Error output for wrong parameter', function() {
    let res = itHelpers.request_graph_ql_post('{individualsConnection(pagination:{hello:1}) {edges {node {id}}}}');
    let resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(400);
    expect(resBody).to.deep.equal({
      errors: [
          {
              message: 'Field "hello" is not defined by type paginationCursorInput.',
              locations: [
                  {
                      line: 1,
                      column: 36
                  }
              ]
          }
      ]
    });
    res = itHelpers.request_graph_ql_post('{individualsConnection(pagination:{first:1, last:1}) {edges {node {id}}}}');
    resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      errors: [
          {
              message: 'Illegal cursor based pagination arguments. Use either "first" and optionally "after", or "last" and optionally "before"!',
              locations: [
                  {
                      line: 1,
                      column: 2
                  }
              ],
              path: [
                  "individualsConnection"
              ]
          }
      ],
      data: {
          individualsConnection: null
      }
  });

  res = itHelpers.request_graph_ql_post('mutation{addAccession(accession_id:"acc1" sampling_date:"today") {accession_id sampling_date}}');
  resBody = JSON.parse(res.body.toString('utf8'));
  expect(res.statusCode).to.equal(400);
  expect(resBody).to.deep.equal({
    errors: [
        {
            message: 'Expected type Date, found "today"; Date cannot represent an invalid date-string today.',
            locations: [
                {
                    line: 1,
                    column: 57
                }
            ],
        }
    ]
  });

  res = itHelpers.request_graph_ql_post('mutation { addIndividual(name: "@#$%^&") { name } }');
  resBody = JSON.parse(res.body.toString('utf8'));
  expect(res.statusCode).to.equal(500);
    expect(resBody).to.deep.equal({
      errors: [
        {
          message: "validation failed",
          locations: [
            {
              line: 1,
              column: 12
            }
          ],
          extensions: {
            "validationErrors": [
              {
                keyword: "type",
                dataPath: ".name",
                schemaPath: "#/properties/name/anyOf/0/type",
                params: {
                  type: "null"
                },
                message: "should be null"
              },
              {
                keyword: "pattern",
                dataPath: ".name",
                schemaPath: "#/properties/name/anyOf/1/pattern",
                params: {
                  pattern: "^[a-zA-Z0-9]+$"
                },
                message: "should match pattern \"^[a-zA-Z0-9]+$\""
              },
              {
                keyword: "anyOf",
                dataPath: ".name",
                schemaPath: "#/properties/name/anyOf",
                params: {},
                message: "should match some schema in anyOf"
              }
            ]
          },
          path: [
            "addIndividual"
          ]
        }
      ],
      data: null
    });
  });

  it('33. Complementary search operators', async () => {
    //items
    let ita = null;
    let itb = null;
    let itc = null;

    //item a
    res = itHelpers.request_graph_ql_post('mutation { addTranscript_count(gene: "Gene-28-a") { id, gene } }');
    resBody = JSON.parse(res.body.toString('utf8'));

    expect(res.statusCode).to.equal(200);
    should.exist(resBody.data.addTranscript_count);
    should.exist(resBody.data.addTranscript_count.id);
    should.exist(resBody.data.addTranscript_count.gene);
    ita =  resBody.data.addTranscript_count;

    //item b
    res = itHelpers.request_graph_ql_post('mutation { addTranscript_count(gene: "Gene-28-b") { id, gene } }');
    resBody = JSON.parse(res.body.toString('utf8'));

    expect(res.statusCode).to.equal(200);
    should.exist(resBody.data.addTranscript_count);
    should.exist(resBody.data.addTranscript_count.id);
    should.exist(resBody.data.addTranscript_count.gene);
    itb =  resBody.data.addTranscript_count;

    //item c
    res = itHelpers.request_graph_ql_post('mutation { addTranscript_count(gene: "Gene-28-c") { id, gene } }');
    resBody = JSON.parse(res.body.toString('utf8'));

    expect(res.statusCode).to.equal(200);
    should.exist(resBody.data.addTranscript_count);
    should.exist(resBody.data.addTranscript_count.id);
    should.exist(resBody.data.addTranscript_count.gene);
    itc =  resBody.data.addTranscript_count;

    /**
     * op: in ['ita.id', 'itb.id']
     */
    res = await itHelpers.request_graph_ql_post(`query { transcript_counts(search: {field: id, operator: in, valueType: Array, value: "${ita.id},${itb.id}"},pagination:{limit:25}) {id, gene}}`);
    resBody = JSON.parse(res.body.toString('utf8'));

    expect(res.statusCode).to.equal(200);
    should.exist(resBody.data.transcript_counts);
    expect(resBody.data.transcript_counts).to.deep.include(ita);
    expect(resBody.data.transcript_counts).to.deep.include(itb);
    expect(resBody.data.transcript_counts.length).to.equal(2);

    /**
     * op: notIn ('ita.id', 'itb.id')
     */
    res = await itHelpers.request_graph_ql_post(`query { transcript_counts(search: {field: id, operator: notIn, valueType: Array, value: "${ita.id},${itb.id}"},pagination:{limit:25}) {id, gene}}`);
    resBody = JSON.parse(res.body.toString('utf8'));

    expect(res.statusCode).to.equal(200);
    should.exist(resBody.data.transcript_counts);
    expect(resBody.data.transcript_counts).to.deep.include(itc);
    expect(resBody.data.transcript_counts).to.not.include(ita);
    expect(resBody.data.transcript_counts).to.not.include(itb);

    /**
     * op: like '%ene-28%'
     */
    res = await itHelpers.request_graph_ql_post(`query { transcript_counts(search: {field: gene, operator: like, value: "%ene-28%"},pagination:{limit:25}) {id, gene}}`);
    resBody = JSON.parse(res.body.toString('utf8'));

    expect(res.statusCode).to.equal(200);
    should.exist(resBody.data.transcript_counts);
    expect(resBody.data.transcript_counts).to.deep.include(ita);
    expect(resBody.data.transcript_counts).to.deep.include(itb);
    expect(resBody.data.transcript_counts).to.deep.include(itc);
    expect(resBody.data.transcript_counts.length).to.equal(3);

    /**
     * op: notLike '%ene-28%'
     */
    res = await itHelpers.request_graph_ql_post(`query { transcript_counts(search: {field: gene, operator: notLike, value: "%ene-28%"},pagination:{limit:25}) {id, gene}}`);
    resBody = JSON.parse(res.body.toString('utf8'));

    expect(res.statusCode).to.equal(200);
    should.exist(resBody.data.transcript_counts);
    expect(resBody.data.transcript_counts).to.not.include(ita);
    expect(resBody.data.transcript_counts).to.not.include(itb);
    expect(resBody.data.transcript_counts).to.not.include(itc);

    /**
     * op: between ['ita.id', 'itc.id']
     */
    res = await itHelpers.request_graph_ql_post(`query { transcript_counts(search: {field: id, operator: between, valueType:Array, value:"${ita.id},${itc.id}" },pagination:{limit:25}) {id, gene}}`);
    resBody = JSON.parse(res.body.toString('utf8'));

    expect(res.statusCode).to.equal(200);
    should.exist(resBody.data.transcript_counts);
    expect(resBody.data.transcript_counts).to.deep.include(ita);
    expect(resBody.data.transcript_counts).to.deep.include(itb);
    expect(resBody.data.transcript_counts).to.deep.include(itc);
    expect(resBody.data.transcript_counts.length).to.equal(3);

    /**
     * op: notBetween ['ita.id', 'itc.id']
     */
    res = await itHelpers.request_graph_ql_post(`query { transcript_counts(search: {field: id, operator: notBetween, valueType:Array, value:"${ita.id},${itc.id}" },pagination:{limit:25}) {id, gene}}`);
    resBody = JSON.parse(res.body.toString('utf8'));

    expect(res.statusCode).to.equal(200);
    should.exist(resBody.data.transcript_counts);
    expect(resBody.data.transcript_counts).to.not.include(ita);
    expect(resBody.data.transcript_counts).to.not.include(itb);
    expect(resBody.data.transcript_counts).to.not.include(itc);
  });
});


describe(
    'Web service model',
    function() {
        after(async function() {
            let res = itHelpers.request_graph_ql_post('{ individuals(pagination:{limit:25}) {id} }');
            let individuals = JSON.parse(res.body.toString('utf8')).data.individuals;

            for(let i = 0; i < individuals.length; i++){
                res = itHelpers.request_graph_ql_post(`mutation { deleteIndividual (id: ${individuals[i].id}) }`);
                expect(res.statusCode).to.equal(200);
            }

            let cnt = await itHelpers.count_all_records('countIndividuals');
            expect(cnt).to.equal(0);

            res = itHelpers.request_graph_ql_post('{ transcript_counts(pagination:{limit:25}) {id} }');
            let transcript_counts = JSON.parse(res.body.toString('utf8')).data.transcript_counts;

            for(let i = 0; i < transcript_counts.length; i++){
                res = itHelpers.request_graph_ql_post(`mutation { deleteTranscript_count (id: ${transcript_counts[i].id}) }`);
                expect(res.statusCode).to.equal(200);
            }

            cnt = await itHelpers.count_all_records('countTranscript_counts');
            expect(cnt).to.equal(0);
        })

        // The entry used here is set up by the patching of the model file
        it('01. Webservice simulator is up', function() {

            let res = itHelpers.request_graph_ql_get('/aminoAcidSequence/63165');
            let resBody = JSON.parse(res.body.toString('utf8'));

            expect(res.statusCode).to.equal(200);
            expect(resBody).to.deep.equal({
                "accession": "P63165",
                "id": 63165,
                "sequence": "MSDQEAKPSTEDLGDKKEGEYIKLKVIGQDSSEIHFKVKMTTHLKKLKESYCQRQGVPMNSLRFLFEGQRIADNHTPKELGMEEEDVIEVYQEQTGGHSTV"
            });

        });

        // The entry used here is set up by the patching of the model file
        it('02. Webservice read one', function() {

            let res = itHelpers.request_graph_ql_post('{ readOneAminoacidsequence(id : 69905) { id accession sequence} }');
            let resBody = JSON.parse(res.body.toString('utf8'));

            expect(res.statusCode).to.equal(200);
            expect(resBody).to.deep.equal({
                "data": {
                    "readOneAminoacidsequence": {
                        "accession": "P69905",
                        "id": "69905",
                        "sequence": "MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGKKVADALTNAVAHVDDMPNALSALSDLHAHKLRVDPVNFKLLSHCLLVTLAAHLPAEFTPAVHASLDKFLASVSTVLTSKYR"
                    }
                }
            });
        });

        // The same aminoacidsequence as in 01 is used here
        it('03. Webservice associate new TranscriptCount', function() {
            let res = itHelpers.request_graph_ql_post('mutation { addTranscript_count(gene: "new_gene", ' +
                                                                                     'addAminoacidsequence: 63165) { id aminoacidsequence{id }} }');
            let resBody = JSON.parse(res.body.toString('utf8'));
            expect(res.statusCode).to.equal(200);

            let tcId = resBody.data.addTranscript_count.id;
            res = itHelpers.request_graph_ql_post(`{ readOneTranscript_count(id : ${tcId}) ` +
                                                   '{ id aminoacidsequence{id accession} } }');
            resBody = JSON.parse(res.body.toString('utf8'));

            expect(res.statusCode).to.equal(200);
            expect(resBody).to.deep.equal({
                "data": {
                    "readOneTranscript_count": {
                        "aminoacidsequence": {
                            "accession": "P63165",
                            "id": "63165"
                        },
                        "id": `${tcId}`
                    }
                }
            });

            res = itHelpers.request_graph_ql_post(`mutation { updateTranscript_count(id: ${tcId}, removeAminoacidsequence: 63165) {id aminoacidsequence{id}}}`);
            resBody = JSON.parse(res.body.toString('utf8'));
            expect(res.statusCode).to.equal(200);
        });
});




describe( 'Batch Upload', function() {
    // For now, only individuals are present in this section
    after(async function() {
        let res = itHelpers.request_graph_ql_post('{ individuals(pagination:{limit:25}) {id} }');
        let individuals = JSON.parse(res.body.toString('utf8')).data.individuals;

        for(let i = 0; i < individuals.length; i++){
            res = itHelpers.request_graph_ql_post(`mutation { deleteIndividual (id: ${individuals[i].id}) }`);
            expect(res.statusCode).to.equal(200);
        }

        let cnt = await itHelpers.count_all_records('countIndividuals');
        expect(cnt).to.equal(0);

        res = itHelpers.request_graph_ql_post('{ transcript_counts(pagination:{limit:25}) {id} }');
        let transcript_counts = JSON.parse(res.body.toString('utf8')).data.transcript_counts;

        for(let i = 0; i < transcript_counts.length; i++){
            res = itHelpers.request_graph_ql_post(`mutation { deleteTranscript_count (id: ${transcript_counts[i].id}) }`);
            expect(res.statusCode).to.equal(200);
        }

        cnt = await itHelpers.count_all_records('countTranscript_counts');
        expect(cnt).to.equal(0);
    })

    it('01. SCV individual batch upload', async function () {

        let csvPath = path.join(__dirname, 'integration_test_misc', 'individual_valid.csv');

        // count records before upload
        let cnt1 = await itHelpers.count_all_records('countIndividuals');

        // batch_upload_csv start new background, there is no way to test the actual result
        // without explicit delay. The test may fail if delay is too small, just check the
        // resulting DB table to be sure that all records from file individual_valid.csv were added.
        let success = await itHelpers.batch_upload_csv(csvPath, 'mutation {bulkAddIndividualCsv}');
        expect(success).equal(true);
        await delay(500);

        // count records before upload
        let cnt2 = await itHelpers.count_all_records('countIndividuals');
        expect(cnt2 - cnt1).to.equal(4);
    });
});

describe(
    'Generic async validation tests',
    function() {
        after(async function() {
            let res = itHelpers.request_graph_ql_post('{ individuals(pagination:{limit:25}) {id} }');
            let individuals = JSON.parse(res.body.toString('utf8')).data.individuals;

            for(let i = 0; i < individuals.length; i++){
                res = itHelpers.request_graph_ql_post(`mutation { deleteIndividual (id: ${individuals[i].id}) }`);
                expect(res.statusCode).to.equal(200);
            }

            let cnt = await itHelpers.count_all_records('countIndividuals');
            expect(cnt).to.equal(0);

            res = itHelpers.request_graph_ql_post('{ transcript_counts(pagination:{limit:25}) {id} }');
            let transcript_counts = JSON.parse(res.body.toString('utf8')).data.transcript_counts;

            for(let i = 0; i < transcript_counts.length; i++){
                res = itHelpers.request_graph_ql_post(`mutation { deleteTranscript_count (id: ${transcript_counts[i].id}) }`);
                expect(res.statusCode).to.equal(200);
            }

            cnt = await itHelpers.count_all_records('countTranscript_counts');
            expect(cnt).to.equal(0);
        })

        it('01. Validate on add', function () {

            let res = itHelpers.request_graph_ql_post('mutation { addIndividual(name: "@#$%^&") { name } }');
            let resBody = JSON.parse(res.body.toString('utf8'));

            // expect(res.statusCode).to.equal(500);
            expect(resBody).to.have.property('errors');

        });

        it('02. Validate on update', function () {

            // Add correct record
            let res = itHelpers.request_graph_ql_post('mutation { addIndividual(name: "ToBeUpdated") { id } }');
            let resBody = JSON.parse(res.body.toString('utf8'));

            expect(res.statusCode).to.equal(200);

            // Try to update to incorrect
            res = itHelpers.request_graph_ql_post(`mutation { updateIndividual(id: ${resBody.data.addIndividual.id}, name: "#$%^&*") {id name} }`);
            resBody = JSON.parse(res.body.toString('utf8'));

            // expect(res.statusCode).to.equal(500);
            expect(resBody).to.have.property('errors');
        });

        it('03. Validate on delete', function () {

            // Add a record with a special name that can't be deleted
            let res = itHelpers.request_graph_ql_post('mutation { addIndividual(name: "Undeletable") { id } }');
            let resBody = JSON.parse(res.body.toString('utf8'));
            expect(res.statusCode).to.equal(200);
            let indiId = resBody.data.addIndividual.id;

            // Try to delete an item with a special name that can't be deleted (see individual_validate_joi.patch for details)
            res = itHelpers.request_graph_ql_post(`mutation { deleteIndividual (id: ${indiId}) }`);
            resBody = JSON.parse(res.body.toString('utf8'));

            // expect(res.statusCode).to.equal(500);
            expect(resBody).to.have.property('errors');

            res = itHelpers.request_graph_ql_post(`mutation { updateIndividual (id: ${indiId} name:"Another") {id} }`);
            resBody = JSON.parse(res.body.toString('utf8'));

        });


        it('04. Validate CSV individual batch upload', async function () {
            let csvPath = path.join(__dirname, 'integration_test_misc', 'individual_invalid.csv');

            // count records before upload
            let cnt1 = await itHelpers.count_all_records('countIndividuals');

            // batch_upload_csv start new background, it returns a response without
            // an error independently if there are validation errors during batch add or not.
            // These errors will be sent to the user's e-mail.
            let success = await itHelpers.batch_upload_csv(csvPath, 'mutation {bulkAddIndividualCsv}');
            expect(success).equal(true);
            await delay(500);

            // count records before upload
            let cnt2 = await itHelpers.count_all_records('countIndividuals');
            expect(cnt2 - cnt1).to.equal(0);
        });

        it('05. CSV with explicit Null values', async function () {
            let csvPath = path.join(__dirname, 'integration_test_misc', 'transcript_count_nulls.csv');

            // count records before upload
            let cnt1 = await itHelpers.count_all_records('countTranscript_counts');

            // batch_upload_csv start new background, it returns a response without
            // an error independently if there are validation errors during batch add or not.
            // These errors will be sent to the user's e-mail.
            let success = await itHelpers.batch_upload_csv(csvPath, 'mutation { bulkAddTranscript_countCsv }');
            expect(success).equal(true);
            await delay(500);

            // count records before upload
            let cnt2 = await itHelpers.count_all_records('countTranscript_counts');
            expect(cnt2 - cnt1).to.equal(1);
        });

    });

  describe(
        'Date types test',
        function() {

            after(async function() {
                let res = itHelpers.request_graph_ql_post('{ sequencingExperiments(pagination:{limit:25}) {id} }');
                let sequencingExperiments = JSON.parse(res.body.toString('utf8')).data.sequencingExperiments;

                for(let i = 0; i < sequencingExperiments.length; i++){
                    res = itHelpers.request_graph_ql_post(`mutation { deleteSequencingExperiment (id: ${sequencingExperiments[i].id}) }`);
                    expect(res.statusCode).to.equal(200);
                }

                let cnt = await itHelpers.count_all_records('countSequencingExperiments');
                expect(cnt).to.equal(0);

            })

          it('01. Create and retrieve instance with date type', function() {

              // Create Plant to subjected to RNA-Seq analysis from which the transcript_counts result
              let res = itHelpers.request_graph_ql_post('mutation { addSequencingExperiment(name: "Experiment 1" start_date: "2007-12-03" end_date: "2010-12-03") {id name  start_date} }');
              let resBody = JSON.parse(res.body.toString('utf8'));
              expect(res.statusCode).to.equal(200);
              expect(resBody.data.addSequencingExperiment.start_date).equal("2007-12-03");
              let experimentId = resBody.data.addSequencingExperiment.id;

              // Create TranscriptCount with above Plant assigned as Individual
              res = itHelpers.request_graph_ql_post(`{ readOneSequencingExperiment(id: ${experimentId}){ start_date end_date  } }`);
              let tcResBody = JSON.parse(res.body.toString('utf8'));
              expect(res.statusCode).to.equal(200);
              expect(tcResBody).to.deep.equal({
                  data: {
                    readOneSequencingExperiment: {
                      start_date: "2007-12-03",
                      end_date: "2010-12-03"

                    }
                  }
              })
          });

  });

  describe('Distributed Data Models', function() {
    // The entries created in this test are used in the following ones as well
    it('01. Create a person and 2 dogs', function() {
        let res = itHelpers.request_graph_ql_post('mutation {addPerson(person_id: "instance1-01" name: "Anthony") {person_id name}}');
        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data:{
                addPerson:{
                    person_id:"instance1-01",
                    name:"Anthony"
                }
            }
        });

        res = itHelpers.request_graph_ql_post('mutation {addDog(dog_id: "instance2-01" name: "Benji") {dog_id name}}');
        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);

        expect(resBody).to.deep.equal({
            data:{
                addDog:{
                    dog_id:"instance2-01",
                    name:"Benji"
                }
            }
        });

        res = itHelpers.request_graph_ql_post('mutation {addDog(dog_id: "instance2-02" name: "Hector") {dog_id name}}');
        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);

        expect(resBody).to.deep.equal({
            data: {
              addDog: {
                dog_id: "instance2-02",
                name: "Hector"
              }
            }
        });

        res = itHelpers.request_graph_ql_post('{dogsConnection(pagination:{first:-1}) {edges{node{dog_id}}}}');
        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
          "errors": [
            {
              "message": "LIMIT must not be negative",
              "locations": [
                {
                  "line": 1,
                  "column": 2
                }
              ],
              "path": [
                "dogsConnection"
              ]
            }
          ],
          "data": {
            "dogsConnection": null
          }
      });

    });

    it('02. Update the person to associate with a dog', function() {
        let res = itHelpers.request_graph_ql_post('mutation {updatePerson(person_id:"instance1-01" addDogs:"instance2-01") {person_id name countFilteredDogs dogsConnection(pagination:{first:5}){edges {node {dog_id name}}}}}');
        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
              updatePerson: {
                person_id: "instance1-01",
                name: "Anthony",
                countFilteredDogs: 1,
                dogsConnection: {
                  edges: [
                    {
                      node: {
                        dog_id: "instance2-01",
                        name: "Benji"
                      }
                    }
                  ]
                }
              }
            }
          });
    })

    it('03. Update the other dog to associate with the person', function() {
        let res = itHelpers.request_graph_ql_post('mutation {updateDog(dog_id:"instance2-02" addPerson:"instance1-01") {dog_id name person{person_id name countFilteredDogs}}}');
        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
              updateDog: {
                dog_id: "instance2-02",
                name: "Hector",
                person: {
                  person_id: "instance1-01",
                  name: "Anthony",
                  countFilteredDogs: 2
                }
              }
            }
          });
    });

    it('04. Update the person to remove the second dog', function() {
        let res = itHelpers.request_graph_ql_post('mutation{updatePerson(person_id:"instance1-01" removeDogs:"instance2-02") {person_id name countFilteredDogs dogsConnection(pagination:{first:5}){edges{node{dog_id name}}}}}');
        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
              updatePerson: {
                person_id: "instance1-01",
                name: "Anthony",
                countFilteredDogs: 1,
                dogsConnection: {
                  edges: [
                    {
                      node: {
                        dog_id: "instance2-01",
                        name: "Benji"
                      }
                    }
                  ]
                }
              }
            }
          });
    });

    it('05. Update the first dog to remove the person', function() {
        let res = itHelpers.request_graph_ql_post('mutation{updateDog(dog_id:"instance2-01" removePerson:"instance1-01") {dog_id name person{person_id name}}}');
        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
              updateDog: {
                dog_id: "instance2-01",
                name: "Benji",
                person: null
              }
            }
          });
    });

    // At this point, no associations between people and dogs should exist

    it('06. Add another person and read all', function() {
        let res = itHelpers.request_graph_ql_post('mutation{addPerson(person_id:"instance2-01" name:"Bertha") {person_id name countFilteredDogs}}');
        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
              addPerson: {
                person_id: "instance2-01",
                name: "Bertha",
                countFilteredDogs: 0
              }
            }
          });
        res = itHelpers.request_graph_ql_post('{peopleConnection(pagination:{first:25}){edges{node{person_id name countFilteredDogs}}}}');
        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
              peopleConnection: {
                edges: [
                  {
                    node: {
                      person_id: "instance1-01",
                      name: "Anthony",
                      countFilteredDogs: 0
                    }
                  },
                  {
                    node: {
                      person_id: "instance2-01",
                      name: "Bertha",
                      countFilteredDogs: 0
                    }
                  }
                ]
              }
            }
          });
    })

    it('07. Search, pagination and sort', function() {
        // Create a few additional entries so that pagination can be applied better
        let res = itHelpers.request_graph_ql_post('mutation{addPerson(person_id:"instance1-02" name:"Charlie") {person_id name}}');
        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
              addPerson: {
                person_id: "instance1-02",
                name: "Charlie"
              }
            }
          });
        res = itHelpers.request_graph_ql_post('mutation{addPerson(person_id:"instance2-02" name:"Dora") {person_id name}}');
        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
              addPerson: {
                person_id: "instance2-02",
                name: "Dora"
              }
            }
          });
        res = itHelpers.request_graph_ql_post('mutation{addPerson(person_id:"instance1-03" name:"Emily" addDogs:"instance2-01") {person_id name countFilteredDogs dogsConnection(pagination:{first:5}){edges{node{dog_id name}}}}}');
        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
              addPerson: {
                person_id: "instance1-03",
                name: "Emily",
                countFilteredDogs: 1,
                dogsConnection: {
                  edges: [
                    {
                      node: {
                        dog_id: "instance2-01",
                        name: "Benji"
                      }
                    }
                  ]
                }
              }
            }
          });
        // Make sure that no person intended to be stored on server 1 was stored elsewhere
        res = itHelpers.request_graph_ql_post('{peopleConnection(search:{field:person_id operator:like value:"instance1%" excludeAdapterNames:"person_instance1"}, pagination:{first:25}) {edges{node{person_id}}}}');
        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
              peopleConnection: {
                edges: []
              }
            }
          });
        // Get infos about people on server 1
        res = itHelpers.request_graph_ql_post('{peopleConnection(search:{field:person_id operator:like value:"instance1%"},pagination:{first:5}) {edges{node{person_id name countFilteredDogs dogsConnection(pagination:{first:5}){edges{node{dog_id name}}}}}}}');
        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
              peopleConnection: {
                edges: [
                  {
                    node: {
                      person_id: "instance1-01",
                      name: "Anthony",
                      countFilteredDogs: 0,
                      dogsConnection: {
                        edges: []
                      }
                    }
                  },
                  {
                    node: {
                      person_id: "instance1-02",
                      name: "Charlie",
                      countFilteredDogs: 0,
                      dogsConnection: {
                        edges: []
                      }
                    }
                  },
                  {
                    node: {
                      person_id: "instance1-03",
                      name: "Emily",
                      countFilteredDogs: 1,
                      dogsConnection: {
                        edges: [
                          {
                            node: {
                              dog_id: "instance2-01",
                              name: "Benji"
                            }
                          }
                        ]
                      }
                    }
                  }
                ]
              }
            }
          });
          // The same search, but order by name descending
          res = itHelpers.request_graph_ql_post('{peopleConnection(search:{field:person_id operator:like value:"instance1%"} order:{field:name order:DESC}, pagination:{first:5}) {edges{node{person_id name countFilteredDogs dogsConnection(pagination:{first:5}){edges{node{dog_id name}}}}}}}');
          resBody = JSON.parse(res.body.toString('utf8'));
          expect(res.statusCode).to.equal(200);
          expect(resBody).to.deep.equal({
            data: {
              peopleConnection: {
                edges: [
                  {
                    node: {
                      person_id: "instance1-03",
                      name: "Emily",
                      countFilteredDogs: 1,
                      dogsConnection: {
                        edges: [
                          {
                            node: {
                              dog_id: "instance2-01",
                              name: "Benji"
                            }
                          }
                        ]
                      }
                    }
                  },
                  {
                    node: {
                      person_id: "instance1-02",
                      name: "Charlie",
                      countFilteredDogs: 0,
                      dogsConnection: {
                        edges: []
                      }
                    }
                  },
                  {
                    node: {
                      person_id: "instance1-01",
                      name: "Anthony",
                      countFilteredDogs: 0,
                      dogsConnection: {
                        edges: []
                      }
                    }
                  }
                ]
              }
            }
          });
        // Get the first 3 people by name
        res = itHelpers.request_graph_ql_post('{peopleConnection(order:{field:name order:ASC} pagination:{first:3}) {edges{node{person_id name countFilteredDogs dogsConnection(pagination:{first:5}){edges{node{dog_id name}}}}}}}');
        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
              peopleConnection: {
                edges: [
                  {
                    node: {
                      person_id: "instance1-01",
                      name: "Anthony",
                      countFilteredDogs: 0,
                      dogsConnection: {
                        edges: []
                      }
                    }
                  },
                  {
                    node: {
                      person_id: "instance2-01",
                      name: "Bertha",
                      countFilteredDogs: 0,
                      dogsConnection: {
                        edges: []
                      }
                    }
                  },
                  {
                    node: {
                      person_id: "instance1-02",
                      name: "Charlie",
                      countFilteredDogs: 0,
                      dogsConnection: {
                        edges: []
                      }
                    }
                  }
                ]
              }
            }
          });

        // 'Free' dog Benji so that the entries can be erased next
        res = itHelpers.request_graph_ql_post('mutation{updateDog(dog_id:"instance2-01" removePerson:"instance1-03") {dog_id name person_id}}');
        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
              updateDog: {
                dog_id: "instance2-01",
                name: "Benji",
                person_id: null
              }
            }
          });

        //illegal cursor based pagination Arguments
        res = itHelpers.request_graph_ql_post('{peopleConnection(order:{field:name order:ASC}\
           pagination:{last:2, after:"eyJuYW1lIjoiRG9yYSIsInBlcnNvbl9pZCI6Imluc3RhbmNlMi0wMiJ9"})\
             {edges{node{person_id name countFilteredDogs}cursor}}}');
        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal(
          {
            "errors": [
              {
                "message": "Illegal cursor based pagination arguments. Use either \"first\" and optionally \"after\", or \"last\" and optionally \"before\"!",
                "locations": [
                  {
                    "line": 1,
                    "column": 2
                  }
                ],
                "path": [
                  "peopleConnection"
                ]
              }
            ],
            "data": {
              "peopleConnection": null
            }
          }
        )

        //parseOrderCursor Tests (after)
        res = itHelpers.request_graph_ql_post('{peopleConnection(order:{field:name order:ASC} pagination:{\
          first:2, after:"eyJuYW1lIjoiQmVydGhhIiwicGVyc29uX2lkIjoiaW5zdGFuY2UyLTAxIn0="}) \
          {edges{node{person_id name countFilteredDogs dogsConnection(pagination:{first:5}){edges{node{dog_id name}}}}cursor} pageInfo{startCursor endCursor hasNextPage hasPreviousPage}}}');
        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal(
          {
            "data": {
              "peopleConnection": {
                "edges": [
                  {
                    "node": {
                      "person_id": "instance1-02",
                      "name": "Charlie",
                      "countFilteredDogs": 0,
                      "dogsConnection": {
                        "edges": []
                      }
                    },
                    "cursor": "eyJuYW1lIjoiQ2hhcmxpZSIsInBlcnNvbl9pZCI6Imluc3RhbmNlMS0wMiJ9"
                  },
                  {
                    "node": {
                      "person_id": "instance2-02",
                      "name": "Dora",
                      "countFilteredDogs": 0,
                      "dogsConnection": {
                        "edges": []
                      }
                    },
                    "cursor": "eyJuYW1lIjoiRG9yYSIsInBlcnNvbl9pZCI6Imluc3RhbmNlMi0wMiJ9"
                  }
                ],
                "pageInfo": {
                  "startCursor": "eyJuYW1lIjoiQ2hhcmxpZSIsInBlcnNvbl9pZCI6Imluc3RhbmNlMS0wMiJ9",
                  "endCursor": "eyJuYW1lIjoiRG9yYSIsInBlcnNvbl9pZCI6Imluc3RhbmNlMi0wMiJ9",
                  "hasNextPage": true,
                  "hasPreviousPage": true
                }
              }
            }
          }
        )
        //parseOrderCursor Tests (before + includeCursor)
        res = itHelpers.request_graph_ql_post('{peopleConnection(order:{field:name order:ASC} pagination:{\
          last:2, before:"eyJuYW1lIjoiRG9yYSIsInBlcnNvbl9pZCI6Imluc3RhbmNlMi0wMiJ9", includeCursor:true})\
          {edges{node{person_id name countFilteredDogs dogsConnection(pagination:{first:5}){edges{node{dog_id name}}}}cursor}\
          pageInfo{startCursor endCursor hasPreviousPage hasNextPage}}}');
        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal(
          {
            "data": {
              "peopleConnection": {
                "edges": [
                  {
                    "node": {
                      "person_id": "instance1-02",
                      "name": "Charlie",
                      "countFilteredDogs": 0,
                      "dogsConnection": {
                        "edges": []
                      }
                    },
                    "cursor": "eyJuYW1lIjoiQ2hhcmxpZSIsInBlcnNvbl9pZCI6Imluc3RhbmNlMS0wMiJ9"
                  },
                  {
                    "node": {
                      "person_id": "instance2-02",
                      "name": "Dora",
                      "countFilteredDogs": 0,
                      "dogsConnection": {
                        "edges": []
                      }
                    },
                    "cursor": "eyJuYW1lIjoiRG9yYSIsInBlcnNvbl9pZCI6Imluc3RhbmNlMi0wMiJ9"
                  }
                ],
                "pageInfo": {
                  "startCursor": "eyJuYW1lIjoiQ2hhcmxpZSIsInBlcnNvbl9pZCI6Imluc3RhbmNlMS0wMiJ9",
                  "endCursor": "eyJuYW1lIjoiRG9yYSIsInBlcnNvbl9pZCI6Imluc3RhbmNlMi0wMiJ9",
                  "hasPreviousPage": true,
                  "hasNextPage": true
                }
              }
            }
          }
        )
    });
    it('08. Delete people and dogs', function() {
        // Delete dog Hector
        let res = itHelpers.request_graph_ql_post('mutation{deleteDog(dog_id:"instance2-02")}');
        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
              deleteDog: "Item successfully deleted"
            }
          });
        // Delete dog Benji
        res = itHelpers.request_graph_ql_post('mutation{deleteDog(dog_id:"instance2-01")}');
        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
              deleteDog: "Item successfully deleted"
            }
          });
        // Make sure that no dog is left
        res = itHelpers.request_graph_ql_post('{dogsConnection(pagination:{first:5}){edges{node{dog_id}}}}');
        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
              dogsConnection: {
                edges: []
              }
            }
          });
        // Delete Emily
        res = itHelpers.request_graph_ql_post('mutation{deletePerson(person_id:"instance1-03")}');
        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
              deletePerson: "Item successfully deleted"
            }
          });
        // Delete Dora
        res = itHelpers.request_graph_ql_post('mutation{deletePerson(person_id:"instance2-02")}');
        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
              deletePerson: "Item successfully deleted"
            }
          });
        // Make sure that only Anthony, Bertha and Charlie are left
        res = itHelpers.request_graph_ql_post('{peopleConnection(order:{field:name order:ASC},pagination:{first:5}){edges{node{person_id name}}}}');
        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
              peopleConnection: {
                edges: [
                  {
                    node: {
                      person_id: "instance1-01",
                      name: "Anthony"
                    }
                  },
                  {
                    node: {
                      person_id: "instance2-01",
                      name: "Bertha"
                    }
                  },
                  {
                    node: {
                      person_id: "instance1-02",
                      name: "Charlie"
                    }
                  }
                ]
              }
            }
          });
    })
    it('09. Delete all remaining people', async function() {
        let res = itHelpers.request_graph_ql_post('{peopleConnection(pagination:{first:5}){edges{node{person_id}}}}');
        let people = JSON.parse(res.body.toString('utf8')).data.peopleConnection.edges;

        for(let i = 0; i < people.length; i++){
            res = itHelpers.request_graph_ql_post(`mutation { deletePerson (person_id: "${people[i].node.person_id}") }`);
            expect(res.statusCode).to.equal(200);
        }

        let cnt = await itHelpers.count_all_records('countPeople');
        expect(cnt).to.equal(0);
    })

      //one_to_one associations where foreignKey is in the target model
    it('10. one_to_one ddm associations setup', function() {
      //setup
      itHelpers.request_graph_ql_post('mutation { addPerson(person_id: "instance1-person01") {person_id} }');
      let res = itHelpers.request_graph_ql_post('{peopleConnection(pagination:{first:5}){edges{node{person_id}}}}');
      let resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody.data.peopleConnection.edges.length).equal(1);

      itHelpers.request_graph_ql_post_instance2('mutation { addParrot(parrot_id:"instance2-parrot01", addUnique_person:"instance1-person01") {parrot_id} }');
      res = itHelpers.request_graph_ql_post('{parrotsConnection(pagination:{first:5}){edges{node{parrot_id}}}}');
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody.data.parrotsConnection.edges.length).equal(1);
    });

    it('11. one_to_one ddm associations success', function() {
      //test success
      let res = itHelpers.request_graph_ql_post('{peopleConnection(pagination:{first:5}){edges{node{person_id unique_parrot{parrot_id}}}}}');
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal(
        {
          "data": {
            "peopleConnection": {
              "edges": [
                {
                  "node": {
                    "person_id": "instance1-person01",
                    "unique_parrot": {
                      "parrot_id": "instance2-parrot01"
                    }
                  }
                }
              ]
            }
          }
        }
      )
    });

    it('12. one_to_one ddm associations error', function() {
      //test error
      itHelpers.request_graph_ql_post_instance2('mutation { addParrot(parrot_id:"instance2-parrot02", addUnique_person:"instance1-person01") {parrot_id} }');
      let res = itHelpers.request_graph_ql_post('{peopleConnection(pagination:{first:5}) {edges {node {person_id unique_parrot {parrot_id}}}}}');
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal(
        {
          errors:[
            {
              message:'Not unique \"to_one\" association Error: Found > 1 parrots matching person with person_id instance1-person01. Consider making this a \"to_many\" association, or using unique constraints, or moving the foreign key into the person model. Returning first parrot.',
              locations: ""
            }
          ],
          data:{
            peopleConnection:{
              edges:[
                {
                  node:{
                    person_id:"instance1-person01",
                    unique_parrot:{
                      parrot_id:"instance2-parrot01"
                    }
                  }
                }
              ]
            }
          }
        }
      )
    });

    it('13. one_to_one ddm associations deletion cleanup', function() {
      //cleanup
      let res = itHelpers.request_graph_ql_post('mutation { updatePerson(person_id: "instance1-person01", removeUnique_parrot:"instance2-parrot01") {person_id} }');
      expect(res.statusCode).to.equal(200);
      res = itHelpers.request_graph_ql_post('mutation { updatePerson(person_id: "instance1-person01", removeUnique_parrot:"instance2-parrot02") {person_id} }');
      expect(res.statusCode).to.equal(200);
      res = itHelpers.request_graph_ql_post('mutation { deletePerson(person_id: "instance1-person01")}');
      expect(res.statusCode).to.equal(200);
      res = itHelpers.request_graph_ql_post('mutation { deleteParrot(parrot_id: "instance2-parrot01")}');
      expect(res.statusCode).to.equal(200);
      res = itHelpers.request_graph_ql_post('mutation { deleteParrot(parrot_id: "instance2-parrot02")}');
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('Zendro Webservice Data Models', function() {
    it('01. Create one accession', function() {
        let res = itHelpers.request_graph_ql_post_instance2('mutation {addAccession(accession_id: "zendro_1-to-instance1" collectors_name:"me"){ accession_id collectors_name}}');

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
          data: {
            addAccession: {
              accession_id: "zendro_1-to-instance1",
              collectors_name: "me"
            }
          }
        });
    });

    it('02. Read one accession', function() {
        let res = itHelpers.request_graph_ql_post_instance2('query {readOneAccession(accession_id: "zendro_1-to-instance1"){ accession_id collectors_name}}');

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
          data: {
            readOneAccession: {
              accession_id: "zendro_1-to-instance1",
              collectors_name: "me"
            }
          }
        });
    });

    it('03. Update one accession', function() {
        let res = itHelpers.request_graph_ql_post_instance2('mutation {updateAccession(accession_id: "zendro_1-to-instance1" collectors_name:"someone_else"){ accession_id collectors_name}}');

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
          data: {
            updateAccession: {
              accession_id: "zendro_1-to-instance1",
              collectors_name: "someone_else"
            }
          }
        });
    });

    it('04. Delete one accession', function() {
        let res = itHelpers.request_graph_ql_post_instance2('mutation {deleteAccession(accession_id: "zendro_1-to-instance1")}');

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
          data: {
            deleteAccession: "Item successfully deleted"
          }
        });
    });

    it('05. Connection accessions', function() {
        itHelpers.request_graph_ql_post_instance2('mutation {addAccession(accession_id: "a-instance1" collectors_name:"aa"){ accession_id}}');
        itHelpers.request_graph_ql_post_instance2('mutation {addAccession(accession_id: "b-instance1" collectors_name:"bb"){ accession_id}}');
        itHelpers.request_graph_ql_post_instance2('mutation {addAccession(accession_id: "c-instance1" collectors_name:"cc"){ accession_id}}');
        itHelpers.request_graph_ql_post_instance2('mutation {addAccession(accession_id: "d-instance1" collectors_name:"dd"){ accession_id}}');
        let res = itHelpers.request_graph_ql_post_instance2('query {accessionsConnection(pagination:{first:5}){ edges{node{accession_id}}}}');
        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
          "data": {
            "accessionsConnection": {
              "edges": [
                {
                  "node": {
                    "accession_id": "a-instance1"
                  }
                },
                {
                  "node": {
                    "accession_id": "b-instance1"
                  }
                },
                {
                  "node": {
                    "accession_id": "c-instance1"
                  }
                },
                {
                  "node": {
                    "accession_id": "d-instance1"
                  }
                }
              ]
            }
          }
        });
    });

    it('06. Sort accessions', function() {
      /**
       * This integration test assumes that data from previous test (Connection accession) is still stored on the DB.
      */
        let res = itHelpers.request_graph_ql_post_instance2('query {accessions(order: {field: collectors_name order: DESC},pagination:{limit:5}){collectors_name}}');

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
          "data": {
              "accessions": [
                {
                  "collectors_name": "dd"
                },
                {
                  "collectors_name": "cc"
                },
                {
                  "collectors_name": "bb"
                },
                {
                  "collectors_name": "aa"
                }
              ]
            }
        });
    });


    it('07. Search accessions', function() {
      /**
       * This integration test assumes that data from previous test (Connection accession) is still stored on the DB.
       * This test will do a OR search.
      */
        let res = itHelpers.request_graph_ql_post_instance2('query {accessions(pagination:{limit:10},search:{operator: or search:[{field:collectors_name value:"%c%" operator:like },{field:collectors_name value:"%d%" operator:like} ]}){collectors_name}}');

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
          "data": {
              "accessions": [
                {
                  "collectors_name": "cc"
                },
                {
                  "collectors_name": "dd"
                }
              ]
            }
        });
    });


    it('08. Pagination (offset based) accessions', function() {
      /**
       * This integration test assumes that data from previous test (Connection accession) is still stored on the DB.
       * This test will do a OR search.
      */
        let res = itHelpers.request_graph_ql_post_instance2('query {accessions(pagination:{ offset:1 limit: 2}){ accession_id}}');

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
          "data": {
            "accessions": [
              {
                "accession_id": "b-instance1"
              },
              {
                "accession_id": "c-instance1"
              }
            ]
          }
        });
    });

    it('09. Pagination (cursor based) accessions', function() {
      /**
       * This integration test assumes that data from previous tests is still stored on the DB.
       * This test will do a OR search.
      */
        let res = itHelpers.request_graph_ql_post_instance2('query {accessionsConnection(pagination:{ first: 2} order:{field: collectors_name order:DESC}){ edges{node{accession_id}}}}');

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
          "data": {
            "accessionsConnection": {
              "edges": [
                {
                  "node": {
                    "accession_id": "d-instance1"
                  }
                },
                {
                  "node": {
                    "accession_id": "c-instance1"
                  }
                }
              ]
            }
          }
        });
    });

    it('10. Create record with association(to-one) accession-location', function() {
      //add location first
      itHelpers.request_graph_ql_post_instance2('mutation{addLocation(locationId: "location-zendro-1"){locationId}}');

      //create accession with the location created in the line above
      let res = itHelpers.request_graph_ql_post_instance2('mutation{addAccession(accession_id:"zendro-2-accession" addLocation:"location-zendro-1" ){location{locationId}}}');

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
          "data": {
            "addAccession": {
              "location": {
                "locationId": "location-zendro-1"
              }
            }
          }
        });
    });

    it('11. Create record on remote server with failed Validation', function(){
      res = itHelpers.request_graph_ql_post_instance2('mutation{addAccession(accession_id:"faulty-accesion-instance1" collectors_name:"@#$%^&") {accession_id sampling_date}}');
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(500);
      expect(resBody).to.deep.equal({
        "errors":[{
          "message":"Web-service http://server1:3000/graphql returned attached (see below) error(s).",
          "locations":[{"line":1,"column":10}],
          "path":["addAccession"]},
          {
            "message":"validation failed",
            "locations":[{"line":7,"column":15}],
            "extensions":{
              "validationErrors":[{
                "keyword":"pattern",
                "dataPath":".collectors_name",
                "schemaPath":"#/properties/collectors_name/pattern",
                "params":{"pattern":"^[a-zA-Z0-9_]+$"},
                "message":"should match pattern \"^[a-zA-Z0-9_]+$\""
              }],
              "receivedFrom":["http://server1:3000/graphql"
            ]},
            "path":["addAccession"]
          }],
        "data":null
      });
    });

    it('12. Remove association(to-one) accession-location', function() {
      /**
       * This test assumes that the accession and location created in the previous test(10. Create record with association accession-location) are still in the DB
       * */
      let res = itHelpers.request_graph_ql_post_instance2('mutation{updateAccession(accession_id:"zendro-2-accession" removeLocation:"location-zendro-1"){locationId location{locationId}}}');

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
          "data": {
            "updateAccession": {
              "locationId": null,
              "location": null
            }
          }
        });
    });

    it('13. Update association(to-one) accession-location', function() {
      /**
       * This test assumes that the accession and location created in the previous test(10. Create record with association accession-location) are still in the DB
       * */
      let res = itHelpers.request_graph_ql_post_instance2('mutation{updateAccession(accession_id:"zendro-2-accession" addLocation:"location-zendro-1"){location{locationId}}}');

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
          "data": {
            "updateAccession": {
              "location": {
                "locationId": "location-zendro-1"
              }
            }
          }
        });

        //remove association for cleaning
        itHelpers.request_graph_ql_post_instance2('mutation{updateAccession(accession_id:"zendro-2-accession" removeLocation:"location-zendro-1"){location{locationId}}}');
    });


    it('14.Create with association(to-many) accession-measurement', function() {
      /**
       * Create measurements that will be associated to accession
       * */
       itHelpers.request_graph_ql_post_instance2('mutation{addMeasurement(measurement_id:"measuremente_test_1" ){measurement_id}}');
       itHelpers.request_graph_ql_post_instance2('mutation{addMeasurement(measurement_id:"measuremente_test_2" ){measurement_id}}');
       itHelpers.request_graph_ql_post_instance2('mutation{addMeasurement(measurement_id:"measuremente_test_3" ){measurement_id}}');

      let res = itHelpers.request_graph_ql_post_instance2('mutation{addAccession(accession_id:"zendro-3-accession" addMeasurements:["measuremente_test_1","measuremente_test_2","measuremente_test_3"]){ measurementsFilter(order:{field: measurement_id order: ASC},pagination:{limit:5}){measurement_id}}}');

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
          "data": {
            "addAccession": {
              "measurementsFilter": [
                {
                  "measurement_id": "measuremente_test_1"
                },
                {
                  "measurement_id": "measuremente_test_2"
                },
                {
                  "measurement_id": "measuremente_test_3"
                }
              ]
            }
          }
        });
    });

    it('15.Remove association(to-many) accession-measurement', function() {
      /**
       * This test assumes that association from previous test (13.Create with association(to-many) accession-measurement) still is stored in the DB.
       * */

      let res = itHelpers.request_graph_ql_post_instance2('mutation{updateAccession(accession_id:"zendro-3-accession" removeMeasurements:["measuremente_test_1","measuremente_test_3"]){ measurementsFilter(pagination:{limit:5}){measurement_id}}}');

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
          "data": {
            "updateAccession": {
              "measurementsFilter": [
                {
                  "measurement_id": "measuremente_test_2"
                }
              ]
            }
          }
        });
    });

    it('16.Update add association(to-many) accession-measurement', function() {
      /**
       * This test assumes that association from previous tests (13.Create with association(to-many and 14.Remove association(to-many) accession-measurement) accession-measurement) still is stored in the DB.
       * */

      let res = itHelpers.request_graph_ql_post_instance2('mutation{updateAccession(accession_id:"zendro-3-accession" addMeasurements:["measuremente_test_1","measuremente_test_3"]){ measurementsFilter(order:{field: measurement_id order: ASC},pagination:{limit:5}){measurement_id}}}');

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
          "data": {
            "updateAccession": {
              "measurementsFilter": [
                {
                  "measurement_id": "measuremente_test_1"
                },
                {
                  "measurement_id": "measuremente_test_2"
                },
                {
                  "measurement_id": "measuremente_test_3"
                }
              ]
            }
          }
        });

    });

    it('17. Read connection association(to-many) accession-measurement', function() {
      /**
       * This test assumes that association from previous tests (13.Create with association(to-many and 14.Remove association(to-many) accession-measurement) accession-measurement) still is stored in the DB.
       * */

      let res = itHelpers.request_graph_ql_post_instance2('query {readOneAccession(accession_id:"zendro-3-accession"){ measurementsConnection(order:{field: measurement_id order: ASC}, pagination:{first:5}){ edges{node{measurement_id}}}}}');

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
          "data": {
            "readOneAccession": {
              "measurementsConnection": {
                "edges": [
                  {
                    "node": {
                      "measurement_id": "measuremente_test_1"
                    }
                  },
                  {
                    "node": {
                      "measurement_id": "measuremente_test_2"
                    }
                  },
                  {
                    "node": {
                      "measurement_id": "measuremente_test_3"
                    }
                  }
                ]
              }
            }
          }
        });

        //remove associations for cleaning
         itHelpers.request_graph_ql_post_instance2('mutation{updateAccession(accession_id:"zendro-3-accession" removeMeasurements:["measuremente_test_1","measuremente_test_2","measuremente_test_3"]){ measurementsFilter(pagination:{limit:5}){measurement_id}}}');
    });


    it('18 CSV Export - Accessions', async function() {
      /**
       * This test assumes that accessions from previous test are still in the DB
       * */

        let res = await itHelpers.request_export('Accession');

        expect(res.data).to.equal('accession_id,collectors_name,collectors_initials,sampling_date,locationId\n' +
         'a-instance1,aa,NULL,NULL,NULL\n'+
         'b-instance1,bb,NULL,NULL,NULL\n' +
         'c-instance1,cc,NULL,NULL,NULL\n' +
         'd-instance1,dd,NULL,NULL,NULL\n' +
         'zendro-2-accession,NULL,NULL,NULL,NULL\n' +
         'zendro-3-accession,NULL,NULL,NULL,NULL\n');
    });

    it('19. Delete all remaining accessions', async function() {
        let res = itHelpers.request_graph_ql_post_instance2('{accessions(pagination:{limit:25}){accession_id}}');
        let accessions = JSON.parse(res.body.toString('utf8')).data.accessions;

        for(let i = 0; i < accessions.length; i++){
            res = itHelpers.request_graph_ql_post_instance2(`mutation { deleteAccession (accession_id: "${accessions[i].accession_id}") }`);
            expect(res.statusCode).to.equal(200);
        }

        let cnt = await itHelpers.count_all_records('countAccessions');
        expect(cnt).to.equal(0);
    });


    it('20. Delete all remaining measurements', async function() {
        let res = itHelpers.request_graph_ql_post_instance2('{measurements(pagination:{limit:25}){measurement_id}}');
        let measurements = JSON.parse(res.body.toString('utf8')).data.measurements;

        for(let i = 0; i < measurements.length; i++){
            res = itHelpers.request_graph_ql_post_instance2(`mutation { deleteMeasurement (measurement_id: "${measurements[i].measurement_id}") }`);
            expect(res.statusCode).to.equal(200);
        }

        let cnt = await itHelpers.count_all_records('countMeasurements');
        expect(cnt).to.equal(0);
    });

    it('21. Delete all remaining locations', async function() {
        let res = itHelpers.request_graph_ql_post_instance2('{locations(pagination:{limit:25}){locationId}}');
        let locations = JSON.parse(res.body.toString('utf8')).data.locations;

        for(let i = 0; i < locations.length; i++){
            res = itHelpers.request_graph_ql_post_instance2(`mutation { deleteLocation (locationId: "${locations[i].locationId}") }`);
            expect(res.statusCode).to.equal(200);
        }

        let cnt = await itHelpers.count_all_records('countLocations');
        expect(cnt).to.equal(0);
    });

  });

  describe('bulkAssociation', function() {
    // set up the environment
    before(async function(){
      //measurements for sql and zendro-server tests
      let res = itHelpers.request_graph_ql_post('mutation{addMeasurement(measurement_id:"m1" ){measurement_id}}');
      expect(res.statusCode).to.equal(200);
      res = itHelpers.request_graph_ql_post('mutation{addMeasurement(measurement_id:"m2" ){measurement_id}}');
      expect(res.statusCode).to.equal(200);
      res = itHelpers.request_graph_ql_post('mutation{addMeasurement(measurement_id:"m3" ){measurement_id}}');
      expect(res.statusCode).to.equal(200);
      res = itHelpers.request_graph_ql_post('mutation{addMeasurement(measurement_id:"m4" ){measurement_id}}');
      expect(res.statusCode).to.equal(200);
      res = itHelpers.request_graph_ql_post('mutation{addAccession(accession_id:"a1" ){accession_id}}');
      expect(res.statusCode).to.equal(200);
      res = itHelpers.request_graph_ql_post('mutation{addAccession(accession_id:"a2" ){accession_id}}');
      expect(res.statusCode).to.equal(200);
      //dogs for distributed tests
      res = itHelpers.request_graph_ql_post('mutation {addDog(dog_id: "instance1-d01") {dog_id}}');
      expect(res.statusCode).to.equal(200);
      res = itHelpers.request_graph_ql_post('mutation {addDog(dog_id: "instance1-d02") {dog_id}}');
      expect(res.statusCode).to.equal(200);
      res = itHelpers.request_graph_ql_post('mutation {addDog(dog_id: "instance2-d01") {dog_id}}');
      expect(res.statusCode).to.equal(200);
      res = itHelpers.request_graph_ql_post('mutation {addDog(dog_id: "instance2-d02") {dog_id}}');
      expect(res.statusCode).to.equal(200);
      res = itHelpers.request_graph_ql_post('mutation {addPerson(person_id: "instance1-p01") {person_id}}');
      expect(res.statusCode).to.equal(200);
      res = itHelpers.request_graph_ql_post('mutation {addPerson(person_id: "instance2-p01") {person_id}}');
      expect(res.statusCode).to.equal(200);
    });

    // clean up records
    after(async function() {
      itHelpers.request_graph_ql_post('mutation{deleteMeasurement(measurement_id:"m1")}');
      itHelpers.request_graph_ql_post('mutation{deleteMeasurement(measurement_id:"m2")}');
      itHelpers.request_graph_ql_post('mutation{deleteMeasurement(measurement_id:"m3")}');
      itHelpers.request_graph_ql_post('mutation{deleteMeasurement(measurement_id:"m4")}');
      itHelpers.request_graph_ql_post('mutation{deleteAccession(accession_id:"a1")}');
      itHelpers.request_graph_ql_post('mutation{deleteAccession(accession_id:"a2")}');
      itHelpers.request_graph_ql_post('mutation {deleteDog(dog_id: "instance1-d01")}');
      itHelpers.request_graph_ql_post('mutation {deleteDog(dog_id: "instance1-d02")}');
      itHelpers.request_graph_ql_post('mutation {deleteDog(dog_id: "instance2-d01")}');
      itHelpers.request_graph_ql_post('mutation {deleteDog(dog_id: "instance2-d02")}');
      itHelpers.request_graph_ql_post('mutation {deletePerson(person_id: "instance1-p01")}');
      itHelpers.request_graph_ql_post('mutation {deletePerson(person_id: "instance2-p01")}');
    });

    it('01. bulkAssociation - sql', function() {
      let res = itHelpers.request_graph_ql_post('mutation{bulkAssociateMeasurementWithAccessionId(bulkAssociationInput: [{measurement_id:"m1", accessionId: "a1"},{measurement_id:"m2", accessionId: "a1"},{measurement_id:"m3", accessionId: "a2"},{measurement_id:"m4", accessionId: "a2"}] )}');
      expect(res.statusCode).to.equal(200);
      let resBody = JSON.parse(res.body.toString('utf8'));
      expect(resBody.data.bulkAssociateMeasurementWithAccessionId).equal("Records successfully updated!");
      //check if records have been correctly updated
      res = itHelpers.request_graph_ql_post('{accessions(pagination:{limit: 10}){accession_id measurementsFilter(pagination:{limit:5}){measurement_id}}}')
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(resBody).to.deep.equal({
        "data":{"accessions":[{"accession_id":"a1","measurementsFilter":[{"measurement_id":"m1"},{"measurement_id":"m2"}]},{"accession_id":"a2","measurementsFilter":[{"measurement_id":"m3"},{"measurement_id":"m4"}]}]}
      });
    });

    it('02. bulkDisAssociation - sql', function() {
      let res = itHelpers.request_graph_ql_post('mutation{bulkDisAssociateMeasurementWithAccessionId(bulkAssociationInput: [{measurement_id:"m1", accessionId: "a1"},{measurement_id:"m2", accessionId: "a1"},{measurement_id:"m3", accessionId: "a2"},{measurement_id:"m4", accessionId: "a2"}] )}');
      expect(res.statusCode).to.equal(200);
      let resBody = JSON.parse(res.body.toString('utf8'));
      expect(resBody.data.bulkDisAssociateMeasurementWithAccessionId).equal("Records successfully updated!");
      //check if records have been correctly updated
      res = itHelpers.request_graph_ql_post('{accessions(pagination:{limit: 10}){accession_id measurementsFilter(pagination:{limit:5}){measurement_id}}}')
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(resBody).to.deep.equal({
        "data":{"accessions":[{"accession_id":"a1","measurementsFilter":[]},{"accession_id":"a2","measurementsFilter":[]}]}
      });
    });

    it('03. bulkAssociation - zendro-server', function() {
      let res = itHelpers.request_graph_ql_post_instance2('mutation{bulkAssociateMeasurementWithAccessionId(bulkAssociationInput: [{measurement_id:"m1", accessionId: "a1"},{measurement_id:"m2", accessionId: "a1"},{measurement_id:"m3", accessionId: "a2"},{measurement_id:"m4", accessionId: "a2"}] )}');
      expect(res.statusCode).to.equal(200);
      let resBody = JSON.parse(res.body.toString('utf8'));
      expect(resBody.data.bulkAssociateMeasurementWithAccessionId).equal("Records successfully updated!");
      //check if records have been correctly updated
      res = itHelpers.request_graph_ql_post('{accessions(pagination:{limit: 10}){accession_id measurementsFilter(pagination:{limit:5}){measurement_id}}}')
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(resBody).to.deep.equal({
        "data":{"accessions":[{"accession_id":"a1","measurementsFilter":[{"measurement_id":"m1"},{"measurement_id":"m2"}]},{"accession_id":"a2","measurementsFilter":[{"measurement_id":"m3"},{"measurement_id":"m4"}]}]}
      });
    });

    it('04. bulkDisAssociation - zendro-server', function() {
      let res = itHelpers.request_graph_ql_post_instance2('mutation{bulkDisAssociateMeasurementWithAccessionId(bulkAssociationInput: [{measurement_id:"m1", accessionId: "a1"},{measurement_id:"m2", accessionId: "a1"},{measurement_id:"m3", accessionId: "a2"},{measurement_id:"m4", accessionId: "a2"}] )}');
      expect(res.statusCode).to.equal(200);
      let resBody = JSON.parse(res.body.toString('utf8'));
      expect(resBody.data.bulkDisAssociateMeasurementWithAccessionId).equal("Records successfully updated!");
      //check if records have been correctly updated
      res = itHelpers.request_graph_ql_post('{accessions(pagination:{limit: 10}){accession_id measurementsFilter(pagination:{limit:5}){measurement_id}}}')
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(resBody).to.deep.equal({
        "data":{"accessions":[{"accession_id":"a1","measurementsFilter":[]},{"accession_id":"a2","measurementsFilter":[]}]}
      });
    });

    it('05. bulkAssociation - ddm', function() {
      let res = itHelpers.request_graph_ql_post('mutation{bulkAssociateDogWithPerson_id(bulkAssociationInput: [{dog_id:"instance1-d01", person_id: "instance1-p01"},{dog_id:"instance2-d01", person_id: "instance1-p01"},{dog_id:"instance1-d02", person_id: "instance2-p01"},{dog_id:"instance2-d02", person_id: "instance2-p01"}] )}');
      expect(res.statusCode).to.equal(200);
      let resBody = JSON.parse(res.body.toString('utf8'));
      expect(resBody.data.bulkAssociateDogWithPerson_id).equal("Records successfully updated!");
      //check if records have been correctly updated
      res = itHelpers.request_graph_ql_post('{peopleConnection(pagination:{first: 10}){edges{node{person_id dogsConnection(pagination:{first:5}){edges{node{dog_id}}}}}}}');
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(resBody).to.deep.equal({
        "data":{"peopleConnection":{"edges":[{"node":{"person_id":"instance1-p01","dogsConnection":{"edges":[{"node":{"dog_id":"instance1-d01"}},{"node":{"dog_id":"instance2-d01"}}]}}},{"node":{"person_id":"instance2-p01","dogsConnection":{"edges":[{"node":{"dog_id":"instance1-d02"}},{"node":{"dog_id":"instance2-d02"}}]}}}]}}
      });
    });

    it('06. bulkDisAssociation - ddm', function() {
      let res = itHelpers.request_graph_ql_post('mutation{bulkDisAssociateDogWithPerson_id(bulkAssociationInput: [{dog_id:"instance1-d01", person_id: "instance1-p01"},{dog_id:"instance2-d01", person_id: "instance1-p01"},{dog_id:"instance1-d02", person_id: "instance2-p01"},{dog_id:"instance2-d02", person_id: "instance2-p01"}] )}');
      expect(res.statusCode).to.equal(200);
      let resBody = JSON.parse(res.body.toString('utf8'));
      expect(resBody.data.bulkDisAssociateDogWithPerson_id).equal("Records successfully updated!");
      //check if records have been correctly updated
      res = itHelpers.request_graph_ql_post('{peopleConnection(pagination:{first: 10}){edges{node{person_id dogsConnection(pagination:{first:5}){edges{node{dog_id}}}}}}}');
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(resBody).to.deep.equal({
        "data":{"peopleConnection":{"edges":[{"node":{"person_id":"instance1-p01","dogsConnection":{"edges":[]}}},{"node":{"person_id":"instance2-p01","dogsConnection":{"edges":[]}}}]}}
      });
    });


  });

  describe('Foreign-key array', function() {
    //set up the environment
    before(async function(){
      //measurements for sql and zendro-server tests
      let res = itHelpers.request_graph_ql_post('mutation{addBook(id:"remote_b1" title:"t1"){id} }');
      expect(res.statusCode).to.equal(200);
      res = itHelpers.request_graph_ql_post('mutation{addBook(id:"remote_b2" title:"t2"){id } }');
      expect(res.statusCode).to.equal(200);

      res = itHelpers.request_graph_ql_post_instance2('mutation{addSq_book(id:"remote_b1" title:"t1"){id} }');
      expect(res.statusCode).to.equal(200);
      res = itHelpers.request_graph_ql_post_instance2('mutation{addSq_book(id:"remote_b2" title:"t2"){id } }');
      expect(res.statusCode).to.equal(200);

      res = itHelpers.request_graph_ql_post_instance2('mutation{addSq_book(id:"local_b1" title:"t1"){id} }');
      expect(res.statusCode).to.equal(200);
      res = itHelpers.request_graph_ql_post_instance2('mutation{addSq_book(id:"local_b2" title:"t2"){id } }');
      expect(res.statusCode).to.equal(200);

    });

    //clean up records
    after(async function() {
      itHelpers.request_graph_ql_post('mutation{deleteBook(id:"remote_b1")}');
      itHelpers.request_graph_ql_post('mutation{deleteBook(id:"remote_b2")}');
      itHelpers.request_graph_ql_post('mutation{deleteAuthor(id:"remote_a1")}');
      itHelpers.request_graph_ql_post('mutation{deleteAuthor(id:"remote_a2")}');

      itHelpers.request_graph_ql_post_instance2('mutation{deleteSq_book(id:"remote_b1")}');
      itHelpers.request_graph_ql_post_instance2('mutation{deleteSq_book(id:"remote_b2")}');
      itHelpers.request_graph_ql_post_instance2('mutation{deleteSq_author(id:"remote_a1")}');

      itHelpers.request_graph_ql_post_instance2('mutation{deleteSq_book(id:"local_b1")}');
      itHelpers.request_graph_ql_post_instance2('mutation{deleteSq_book(id:"local_b2")}');
      itHelpers.request_graph_ql_post_instance2('mutation{deleteSq_author(id:"local_a1")}');
    });

    it('01. Create record and add association - sql', function() {
      let res = itHelpers.request_graph_ql_post('mutation{addAuthor(id:"remote_a1" name:"n1" addBooks:["remote_b1","remote_b2"]){id book_ids}}');
      expect(res.statusCode).to.equal(200);
      let resBody = JSON.parse(res.body.toString('utf8'));
      //check it has been created correctly
      expect(resBody.data).to.deep.equal({addAuthor: { id: 'remote_a1', book_ids: [ 'remote_b1', 'remote_b2' ] }});
      //check inverse association
      res = itHelpers.request_graph_ql_post('{books(pagination:{limit: 2}){id author_ids}} ')
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(resBody).to.deep.equal({
        "data": {"books": [  {"id": "remote_b1","author_ids": ["remote_a1"]},{"id": "remote_b2","author_ids": ["remote_a1"]}]}
      });
    });

    it('02. Query associated records - sql', function() {
      let res = itHelpers.request_graph_ql_post('{readOneBook(id:"remote_b1"){id authorsFilter(pagination: {limit: 2}){id}}}');
      expect(res.statusCode).to.equal(200);
      let resBody = JSON.parse(res.body.toString('utf8'));
      //check associated records
      expect(resBody.data).to.deep.equal({readOneBook: {"id": "remote_b1", "authorsFilter": [{"id": "remote_a1"}]}});
    });


    it('03. Update record and remove association - sql', function() {
      let res = itHelpers.request_graph_ql_post('mutation{updateAuthor(id:"remote_a1" name:"n1" removeBooks:["remote_b1","remote_b2"]){id book_ids}}');
      expect(res.statusCode).to.equal(200);
      let resBody = JSON.parse(res.body.toString('utf8'));
      //check it has been updated correctly
      expect(resBody.data).to.deep.equal({updateAuthor: { id: 'remote_a1', book_ids: [ ] }});
      //check inverse association
      res = itHelpers.request_graph_ql_post('{books(pagination:{limit: 2}){id author_ids}} ')
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(resBody).to.deep.equal({
        "data": {"books": [{"id": "remote_b1","author_ids": []},{"id": "remote_b2","author_ids": []}]}
      });
    });

    it('04. Create record and add association - remote zendro server', function() {
      let res = itHelpers.request_graph_ql_post_instance2('mutation{addAuthor(id:"remote_a2" name:"n2" addBooks:["remote_b1","remote_b2"]){id book_ids}}');
      expect(res.statusCode).to.equal(200);
      let resBody = JSON.parse(res.body.toString('utf8'));
      //check it has been created correctly
      expect(resBody.data).to.deep.equal({addAuthor: { id: 'remote_a2', book_ids: [ 'remote_b1', 'remote_b2' ] }});
      //check inverse association
      res = itHelpers.request_graph_ql_post_instance2('{books(pagination:{limit: 2}){id author_ids}} ')
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(resBody).to.deep.equal({
        "data": {"books": [  {"id": "remote_b1","author_ids": ["remote_a2"]},{"id": "remote_b2","author_ids": ["remote_a2"]}]}
      });
    });

    it('05. Query associated records - remote zendro server', function() {
      let res = itHelpers.request_graph_ql_post_instance2('{readOneBook(id:"remote_b1"){id authorsFilter(pagination: {limit: 2}){id}}}');
      expect(res.statusCode).to.equal(200);
      let resBody = JSON.parse(res.body.toString('utf8'));
      //check associated records
      expect(resBody.data).to.deep.equal({readOneBook: {"id": "remote_b1", "authorsFilter": [{"id": "remote_a2"}]}});
    });

    it('06. Update record and remove association - remote zendro server', function() {
      let res = itHelpers.request_graph_ql_post_instance2('mutation{updateAuthor(id:"remote_a2" name:"n1" removeBooks:["remote_b1","remote_b2"]){id book_ids}}');
      expect(res.statusCode).to.equal(200);
      let resBody = JSON.parse(res.body.toString('utf8'));
      //check it has been updated correctly
      expect(resBody.data).to.deep.equal({updateAuthor: { id: 'remote_a2', book_ids: [ ] }});
      //check inverse association
      res = itHelpers.request_graph_ql_post_instance2('{books(pagination:{limit: 2}){id author_ids}} ')
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(resBody).to.deep.equal({
        "data": {"books": [{"id": "remote_b1","author_ids": []},{"id": "remote_b2","author_ids": []}]}
      });
    });

    it('07. Create record and add association - ddm zendro adapter', function() {
      let res = itHelpers.request_graph_ql_post_instance2('mutation{addSq_author(id:"remote_a1" name:"n1" addBooks:["remote_b1","remote_b2"]){id book_ids}}');
      expect(res.statusCode).to.equal(200);
      let resBody = JSON.parse(res.body.toString('utf8'));
      //check it has been created correctly
      expect(resBody.data).to.deep.equal({addSq_author: { id: 'remote_a1', book_ids: [ 'remote_b1', 'remote_b2' ] }});
      //check inverse association
      res = itHelpers.request_graph_ql_post_instance2('{sq_booksConnection(pagination:{first: 4}){ edges { node {id author_ids} }}} ')
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(resBody.data).to.deep.equal({
       sq_booksConnection: {"edges": [{"node": {"id": "local_b1","author_ids": []}},{"node": {"id": "local_b2","author_ids": []}},{"node": {"id": "remote_b1","author_ids": ["remote_a1"]}},{"node": {"id": "remote_b2","author_ids": ["remote_a1"]}}] }
      });
    });

    it('08. Query associated records - ddm zendro adapter', function() {
      let res = itHelpers.request_graph_ql_post_instance2('{readOneSq_book(id:"remote_b1"){id authorsConnection(pagination: {first: 2}){ edges{ node{id}}}}}');
      expect(res.statusCode).to.equal(200);
      let resBody = JSON.parse(res.body.toString('utf8'));
      //check associated records
      expect(resBody.data).to.deep.equal({
        readOneSq_book: {"id": "remote_b1","authorsConnection": {"edges": [{"node": {"id": "remote_a1"}}]}}
      });
    });

    it('09. Update record and remove association - ddm zendro adapter', function() {
      let res = itHelpers.request_graph_ql_post_instance2('mutation{updateSq_author(id:"remote_a1" name:"n1" removeBooks:["remote_b1","remote_b2"]){id book_ids}}');
      expect(res.statusCode).to.equal(200);
      let resBody = JSON.parse(res.body.toString('utf8'));
      //check it has been updated correctly
      expect(resBody.data).to.deep.equal({updateSq_author: { id: 'remote_a1', book_ids: [ ] }});
      //check inverse association
      res = itHelpers.request_graph_ql_post_instance2('{sq_booksConnection(pagination:{first: 4}){ edges { node {id author_ids} }}}')
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(resBody).to.deep.equal({
        "data": {sq_booksConnection: {"edges": [{"node": {"id": "local_b1","author_ids": []}},{"node": {"id": "local_b2","author_ids": []}},{"node": {"id": "remote_b1","author_ids": []}},{"node": {"id": "remote_b2","author_ids": []}}] }}
      });
    });


    it('10. Create record and add association - ddm sql adapter', function() {
      let res = itHelpers.request_graph_ql_post_instance2('mutation{addSq_author(id:"local_a1" name:"n1" addBooks:["local_b1","local_b2"]){id book_ids}}');
      expect(res.statusCode).to.equal(200);
      let resBody = JSON.parse(res.body.toString('utf8'));
      //check it has been created correctly
      expect(resBody.data).to.deep.equal({addSq_author: { id: 'local_a1', book_ids: [ 'local_b1', 'local_b2' ] }});
      //check inverse association
      res = itHelpers.request_graph_ql_post_instance2('{sq_booksConnection(pagination:{first: 4}){ edges { node {id author_ids} }}} ')
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(resBody.data).to.deep.equal({
       sq_booksConnection: {"edges": [{"node": {"id": "local_b1","author_ids": ["local_a1"]}},{"node": {"id": "local_b2","author_ids": ["local_a1"]}},{"node": {"id": "remote_b1","author_ids": []}},{"node": {"id": "remote_b2","author_ids": []}} ] }
      });
    });

    it('11. Query associated records - ddm sql adapter', function() {
      let res = itHelpers.request_graph_ql_post_instance2('{readOneSq_book(id:"local_b1"){id authorsConnection(pagination: {first: 2}){ edges{ node{id}}}}}');
      expect(res.statusCode).to.equal(200);
      let resBody = JSON.parse(res.body.toString('utf8'));
      //check associated records
      expect(resBody.data).to.deep.equal({
        readOneSq_book: {"id": "local_b1","authorsConnection": {"edges": [{"node": {"id": "local_a1"}}]}}
      });
    });

    it('12. Update record and remove association - ddm sql adapter', function() {
      let res = itHelpers.request_graph_ql_post_instance2('mutation{updateSq_author(id:"local_a1" name:"n1" removeBooks:["local_b1","local_b2"]){id book_ids}}');
      expect(res.statusCode).to.equal(200);
      let resBody = JSON.parse(res.body.toString('utf8'));
      //check it has been updated correctly
      expect(resBody.data).to.deep.equal({updateSq_author: { id: 'local_a1', book_ids: [ ] }});
      //check inverse association
      res = itHelpers.request_graph_ql_post_instance2('{sq_booksConnection(pagination:{first: 4}){ edges { node {id author_ids} }}}')
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(resBody).to.deep.equal({
        "data": {sq_booksConnection: {"edges": [{"node": {"id": "local_b1","author_ids": []}},{"node": {"id": "local_b2","author_ids": []}},{"node": {"id": "remote_b1","author_ids": []}},{"node": {"id": "remote_b2","author_ids": []}}] }}
      });
    });
  });

  describe('generic readAllCursor', function() {

    before(async function(){
      // add 10 cats
      let res = itHelpers.request_graph_ql_post('mutation{addCat(name:"cat1" ){name}}');
      expect(res.statusCode).to.equal(200);
      for (let i = 2; i < 10; i++) {
        res = itHelpers.request_graph_ql_post(`mutation{addCat(name:"cat${i}" ){name}}`);
        expect(res.statusCode).to.equal(200);
      }
    });

    after(async function(){
      // delete all cats
      let res = itHelpers.request_graph_ql_post('{cats(pagination:{limit: 15}){id}}');
      let resBody = JSON.parse(res.body.toString('utf8'));
      let catIds = resBody.data.cats;
      for (let i = 0; i < catIds.length; i++) {
        res = itHelpers.request_graph_ql_post(`mutation{deleteCat(id:${catIds[i].id})}`);
        expect(res.statusCode).to.equal(200);
      }
    });

    it('01. generic readAllCursor', function() {
      let res = itHelpers.request_graph_ql_post('{catsConnection(pagination: {last: 4, before: "eyJuYW1lIjoiY2F0NSIsInJhY2UiOm51bGwsImFnZSI6bnVsbCwiaWQiOjV9"}, search: {field: name, value: "cat7", operator: lte},order:{field:name,order:DESC}) { edges { node { name } } pageInfo { hasNextPage hasPreviousPage}}}');
      expect(res.statusCode).to.equal(200);
      let resBody = JSON.parse(res.body.toString('utf8'));
      expect(resBody).to.deep.equal({
        "data": {
          "catsConnection": {
            "edges": [
              {
                "node": {
                  "name": "cat7"
                },
              },
              {
                "node": {
                  "name": "cat6"
                },
              }
            ],
            "pageInfo": {
              "hasNextPage": true,
              "hasPreviousPage": false
            }
          }
        }
      })
    });
  });


  describe(
    'Array type attributes: create, update and read record for Arr table',
    function() {
  
      after(async function() {
          // Delete all arrs
          res = itHelpers.request_graph_ql_post('{ arrs(pagination:{limit:25}) {arrId} }');
          let arrs = JSON.parse(res.body.toString('utf8')).data.arrs;
  
          for(let i = 0; i < arrs.length; i++){
              res = itHelpers.request_graph_ql_post(`mutation { deleteArr (arrId: ${arrs[i].arrId}) }`);
              expect(res.statusCode).to.equal(200);
          }
  
          let cnt = await itHelpers.count_all_records('countArrs');
          expect(cnt).to.equal(0)
  
      })
  
  
      it('01. Arr create', async function() {
          let res = itHelpers.request_graph_ql_post('mutation { addArr(arrId: 1, country: "Germany", ' +
          'arrStr:["str1", "str2", "str3"], arrInt:[1, 2, 3], arrFloat:[1.1, 3.34, 453.232], arrBool:[true, false]) { arrId } }');

          expect(res.statusCode).to.equal(200);
  
          let cnt = await itHelpers.count_all_records('countArrs');
          expect(cnt).to.equal(1);
      });
  
  
      it('02. Arr update', function() {
          res = itHelpers.request_graph_ql_post(`mutation { updateArr(arrId: 1, arrDateTime: ["2007-12-03T10:15:30Z", "2007-12-13T10:15:30Z"]) {arrId arrDateTime} }`);
          resBody = JSON.parse(res.body.toString('utf8'));
  
          expect(res.statusCode).to.equal(200);
          expect(resBody).to.deep.equal({
              data: {
                  updateArr: {
                      arrId: "1",
                      arrDateTime: ["2007-12-03T10:15:30.000Z", "2007-12-13T10:15:30.000Z"]
                  }
              }
          })
      });
  
  
      it('03. Arr read', function() {  
          res = itHelpers.request_graph_ql_post('{ readOneArr(arrId : 1) { arrId country arrInt arrBool arrDateTime } }');
          resBody = JSON.parse(res.body.toString('utf8'));
  
          expect(res.statusCode).to.equal(200);
          expect(resBody).to.deep.equal({
              data: {
                  readOneArr: {
                      arrId: "1",
                      country: "Germany", 
                      arrInt: [1, 2, 3], 
                      arrBool: [true, false],
                      arrDateTime: ["2007-12-03T10:15:30.000Z", "2007-12-13T10:15:30.000Z"]
                  }
              }
          })
      });

      it('04. Arr search with eq', function() {
        let res = itHelpers.request_graph_ql_post('{arrs(search:{operator:eq, field:arrInt, value:"[1,2,3]"},'+ 
        'pagination:{limit:3}) {arrId}}');
        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody.data.arrs.length).equal(1);
      });

      it('05. Arr search with ne', function() {
        let res = itHelpers.request_graph_ql_post('{arrs(search:{operator:ne, field:arrInt, value:"[1,2,3,4]"},'+ 
        'pagination:{limit:3}) {arrId}}');
        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody.data.arrs.length).equal(1);
      });

      it('06. Arr search with in', function() {
        let res = itHelpers.request_graph_ql_post('{arrs(search:{operator:in, field:arrInt, value:"3"},'+ 
        'pagination:{limit:3}) {arrId}}');
        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody.data.arrs.length).equal(1);
      });


      it('07. Arr search with notIn', function() {
        let res = itHelpers.request_graph_ql_post('{arrs(search:{operator:notIn, field:arrInt, value:"5"},'+
        'pagination:{limit:3}) {arrId}}');
        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody.data.arrs.length).equal(1);
      });

    })  

  describe('Helper connection for direct acces to nodes', function() {
    //set up the environment
    before(async function(){
      //measurements for sql and zendro-server tests
      let res = itHelpers.request_graph_ql_post('mutation{addBook(id:"remote_b1" title:"t1"){id} }');
      expect(res.statusCode).to.equal(200);
      res = itHelpers.request_graph_ql_post('mutation{addBook(id:"remote_b2" title:"t2"){id } }');
      expect(res.statusCode).to.equal(200);
      res = itHelpers.request_graph_ql_post('mutation{addAuthor(id:"remote_a1" name:"n1" addBooks:["remote_b1","remote_b2"]){id }}');
      expect(res.statusCode).to.equal(200);
      res = itHelpers.request_graph_ql_post('mutation{addAuthor(id:"remote_a2" name:"n2" addBooks:["remote_b1"]){id}}');
      expect(res.statusCode).to.equal(200);
      res = itHelpers.request_graph_ql_post('mutation{addAuthor(id:"remote_a3" name:"n2"){id}}');
      expect(res.statusCode).to.equal(200);

      res = itHelpers.request_graph_ql_post_instance2('mutation{addSq_book(id:"remote_b1" title:"t1"){id} }');
      expect(res.statusCode).to.equal(200);
      res = itHelpers.request_graph_ql_post_instance2('mutation{addSq_book(id:"local_b1" title:"t1"){id} }');
      expect(res.statusCode).to.equal(200);

      res = itHelpers.request_graph_ql_post_instance2('mutation{addSq_author(id:"remote_a2" name:"n2" addBooks:["remote_b1"]){id}}');
      expect(res.statusCode).to.equal(200);
      res = itHelpers.request_graph_ql_post_instance2('mutation{addSq_author(id:"remote_a3" name:"n3"){id}}');
      expect(res.statusCode).to.equal(200);
      res = itHelpers.request_graph_ql_post_instance2('mutation{addSq_author(id:"local_a2" name:"n2" addBooks:[ "local_b1"]){id}}');
      expect(res.statusCode).to.equal(200);

    });

    //clean up records
    after(async function() {
      itHelpers.request_graph_ql_post('mutation{updateAuthor(id:"remote_a1" removeBooks:["remote_b1","remote_b2"]){id }}');
      itHelpers.request_graph_ql_post('mutation{updateAuthor(id:"remote_a2" removeBooks:["remote_b1"]){id}}');
      itHelpers.request_graph_ql_post('mutation{deleteBook(id:"remote_b1")}');
      itHelpers.request_graph_ql_post('mutation{deleteBook(id:"remote_b2")}');
      itHelpers.request_graph_ql_post('mutation{deleteAuthor(id:"remote_a1")}');
      itHelpers.request_graph_ql_post('mutation{deleteAuthor(id:"remote_a2")}');
      itHelpers.request_graph_ql_post('mutation{deleteAuthor(id:"remote_a3")}');

      itHelpers.request_graph_ql_post_instance2('mutation{updateSq_author(id:"remote_a2" removeBooks:["remote_b1"]){id }}');
      itHelpers.request_graph_ql_post_instance2('mutation{deleteSq_book(id:"remote_b1")}');
      itHelpers.request_graph_ql_post_instance2('mutation{deleteSq_author(id:"remote_a2")}');
      itHelpers.request_graph_ql_post_instance2('mutation{deleteSq_author(id:"remote_a3")}');

      itHelpers.request_graph_ql_post_instance2('mutation{updateSq_author(id:"local_a2" removeBooks:["local_b1"]){id }}');
      itHelpers.request_graph_ql_post_instance2('mutation{deleteSq_book(id:"local_b1")}');
      itHelpers.request_graph_ql_post_instance2('mutation{deleteSq_author(id:"local_a2")}');
    });

    it('01. Basic zendro instance', function() {
      let res = itHelpers.request_graph_ql_post('{authorsConnection(pagination:{first:5}){authors{id booksConnection(pagination:{first:3}){books{id}}}}}');
      expect(res.statusCode).to.equal(200);
      let resBody = JSON.parse(res.body.toString('utf8'));
      //check associated records
      expect(resBody.data).to.deep.equal({"authorsConnection":{"authors":[{"id":"remote_a1","booksConnection":{"books":[{"id":"remote_b1"},{"id":"remote_b2"}]}},{"id":"remote_a2","booksConnection":{"books":[{"id":"remote_b1"}]}},{"id":"remote_a3","booksConnection":{"books":[]}}]}});
    });

    it('02. Distributed models instace', function() {
      let res = itHelpers.request_graph_ql_post_instance2('{sq_authorsConnection(pagination:{first:5}){sq_authors{id booksConnection(pagination:{first:3}){sq_books{id}}}}}');
      expect(res.statusCode).to.equal(200);
      let resBody = JSON.parse(res.body.toString('utf8'));
      //check associated records
      expect(resBody.data).to.deep.equal({"sq_authorsConnection":{"sq_authors":[{"id":"local_a2","booksConnection":{"sq_books":[{"id":"local_b1"}]}},{"id":"remote_a2","booksConnection":{"sq_books":[{"id":"remote_b1"}]}},{"id":"remote_a3","booksConnection":{"sq_books":[]}}]}});
    });

    it('03. Remote zendro instace', function() {
      let res = itHelpers.request_graph_ql_post_instance2('{authorsConnection(pagination:{first:5}){authors{id booksConnection(pagination:{first:3}){books{id}}}}}');
      expect(res.statusCode).to.equal(200);
      let resBody = JSON.parse(res.body.toString('utf8'));
      //check associated records
      expect(resBody.data).to.deep.equal({"authorsConnection":{"authors":[{"id":"remote_a1","booksConnection":{"books":[{"id":"remote_b1"},{"id":"remote_b2"}]}},{"id":"remote_a2","booksConnection":{"books":[{"id":"remote_b1"}]}},{"id":"remote_a3","booksConnection":{"books":[]}}]}});
    });

  }); 