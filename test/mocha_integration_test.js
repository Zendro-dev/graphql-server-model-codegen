const { expect } = require('chai');
const should = require('chai').should();
const path = require('path');
const delay = require('delay');
const itHelpers = require('./integration_test_misc/integration_test_helpers');

//HINT:
//DELETE FROM transcript_counts;
//DELETE FROM individuals;
//ALTER SEQUENCE individuals_id_seq RESTART WITH 1;
//ALTER SEQUENCE transcript_counts_id_seq RESTART WITH 1;

describe(
  'Clean GraphQL Server: one new basic function per test ("Individual" model)',
  function() {

    after(async function() {
        // Delete associations between individuals and transcript_counts
        // The only ones to exist at this point are from Test 19
        let res = itHelpers.request_graph_ql_post('{transcript_counts(search:{field:individual_id operator:ne value:{value:"0"}}) {id individual_id}}');
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
        res = itHelpers.request_graph_ql_post('{ individuals {id} }');
        let individuals = JSON.parse(res.body.toString('utf8')).data.individuals;

        for(let i = 0; i < individuals.length; i++){
            res = itHelpers.request_graph_ql_post(`mutation { deleteIndividual (id: ${individuals[i].id}) }`);
            expect(res.statusCode).to.equal(200);
        }

        let cnt = await itHelpers.count_all_records('countIndividuals');
        expect(cnt).to.equal(0)

        // Delete all transcript_counts
        res = itHelpers.request_graph_ql_post('{ transcript_counts {id} }');
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
        let res = itHelpers.request_graph_ql_post('{individuals(search:{field:name operator:eq value:{value:"First"}}){id}}');
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
        let res = itHelpers.request_graph_ql_post('{ individuals {id} }');
        let resBody = JSON.parse(res.body.toString('utf8'));

        expect(res.statusCode).to.equal(200);
        expect(resBody.data.individuals.length).equal(2);

    });


    // This test reads the entry created in the last test
    it('05. Individual read one', function() {
        let res = itHelpers.request_graph_ql_post('{individuals(search:{field:name operator:eq value:{value:"Second"}}){id}}');
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

        let res = itHelpers.request_graph_ql_post('{individuals(search:{field:name, value:{value:"%Second%"}, operator:like}) {name}}');
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

        let res = itHelpers.request_graph_ql_post('{ individuals {id} }');
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
        let res = itHelpers.request_graph_ql_post('{transcript_counts{id}}');
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
        let res = itHelpers.request_graph_ql_post('{ transcript_counts {id} }');
        let resBody = JSON.parse(res.body.toString('utf8'));

        expect(res.statusCode).to.equal(200);
        expect(resBody.data.transcript_counts.length).equal(2);

    });


    // This test reads the entry created in the last test
    it('14. TranscriptCount read one', function() {
        let res = itHelpers.request_graph_ql_post('{transcript_counts(search: {field:gene operator:eq value:{value:"Gene C"}}) {id}}');
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

        let res = itHelpers.request_graph_ql_post(`{transcript_counts(search: {field: gene,value:{value:"%ene%"},operator: like}) {gene}}`);
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
        res = itHelpers.request_graph_ql_post('{ transcript_counts {id} }');
        resBody = JSON.parse(res.body.toString('utf8'));

        expect(res.statusCode).to.equal(200);
        expect(resBody.data.transcript_counts.length).equal(3);

        res = await itHelpers.request_metaquery_post([`{ transcript_counts(search: {field: gene, operator: eq, value: {value: "Gene D"}}) {gene}}`,
                            `{individuals (search: {field: name, operator: eq, value: {value: "Zazaniza"}}) {name}}`], '.', null);
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
            ],
            errors: []
        });


        res = itHelpers.request_graph_ql_post(`{ individuals (search: {field: name, operator: regexp, value: {value: "Zazan[aeiou]za"}}) {name}}`);
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

        res = itHelpers.request_graph_ql_post(`{ individuals (search: {field: name, operator: notRegexp, value: {value: "^[A-Ya-z].*"}}) {name}}`);
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

        res = await itHelpers.request_metaquery_post([`{ firstPerson: individuals (search: {field: name, operator: eq, value: {value: "Zazanaza"}}) {name}}`,
                                `{secondPerson: individuals (search: {field: name, operator: eq, value: {value: "Zazaniza"}}) {name}}`], '.', null);

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
          ],
          errors: []
        });

        res = await itHelpers.request_metaquery_post([`{ firstPerson: individuals (search: {field: name, operator: eq, value: {value: "Zazanaza"}}) {names}}`,
                                `{secondPerson: individuals (search: {field: name, operator: eq, value: {value: "Zazaniza"}}) {names}}`], '.', null);
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
                            column:95
                        }
                    ]
                },
                {
                    message:'Cannot query field "names" on type "individual". Did you mean "name"?',
                    locations:[
                        {
                            line:1,
                            column:95
                        }
                    ]
                }
            ]
        });

        res = await itHelpers.request_metaquery_post([`{ firstPerson: individuals (search: {field: name, operator: eq, value: {value: "Zazanaza"}}) {name}}`,
                                `{secondPerson: individuals (search: {field: name, operator: eq, value: {value: "Zazaniza"}}) {name}}`], '.data', null);

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

        res = await itHelpers.request_metaquery_post([`{ firstPerson: individuals (search: {field: name, operator: eq, value: {value: "Zazanaza"}}) {name}}`,
                                `{secondPerson: individuals (search: {field: name, operator: eq, value: {value: "Zazaniza"}}) {name}}`], '.~data', null);

        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: null,
            errors: [{message:
                "jq: error: syntax error, unexpected INVALID_CHARACTER (Unix shell quoting issues?) at <top-level>, line 1:\n.~data \njq: error: try .[\"field\"] instead of .field for unusually named fields at <top-level>, line 1:\n.~data\njq: 2 compile errors\n"}]
        });



        res = await itHelpers.request_metaquery_post([`{ firstPerson: individuals (search: {field: name, operator: eq, value: {value: "Zazanaza"}}) {name}}`,
                                `{secondPerson: individuals (search: {field: name, operator: eq, value: {value: "Zazaniza"}}) {name}}`], null, '$');

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
          ],
          errors: []
        });

        res = await itHelpers.request_metaquery_post([`{ firstPerson: individuals (search: {field: name, operator: eq, value: {value: "Zazanaza"}}) {name}}`,
                                `{secondPerson: individuals (search: {field: name, operator: eq, value: {value: "Zazaniza"}}) {name}}`], null, '$.data');

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

        res = await itHelpers.request_metaquery_post([`{ firstPerson: individuals (search: {field: name, operator: eq, value: {value: "Zazanaza"}}) {name}}`,
                                `{secondPerson: individuals (search: {field: name, operator: eq, value: {value: "Zazaniza"}}) {name}}`], null, '$~data');

        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: null,
            errors: [{message: "this._trace(...).filter is not a function"}]
        });


        res = await itHelpers.request_metaquery_post([`{ firstPerson: individuals (search: {field: name, operator: eq, value: {value: "Zazanaza"}}) {name}}`,
        `{secondPerson: individuals (search: {field: name, operator: eq, value: {value: "Zazaniza"}}) {name}}`], '.', '$');

        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: null,
            errors: [{message: "State either 'jq' or 'jsonPath' expressions, never both. - jq is . and jsonPath is $"}]
        });

        res = await itHelpers.request_metaquery_post([`{ firstPerson: individuals (search: {field: name, operator: eq, value: {value: "Zazanaza"}}) {name}}`,
        `{secondPerson: individuals (search: {field: name, operator: eq, value: {value: "Zazaniza"}}) {name}}`], null, null);

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
      let res = itHelpers.request_graph_ql_post('{transcript_counts(search:{field:individual_id operator:ne value:{value:"0"}}) {id individual_id}}');
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
  it('21. Limit check', function() {
    let individualName = "CountIndividual";
    let individualAdding = `mutation { addIndividual (name: "${individualName}") { name }}`;
    let res = itHelpers.request_graph_ql_post(individualAdding);
    expect(res.statusCode).to.equal(200);
    res = itHelpers.request_graph_ql_post(individualAdding);
    expect(res.statusCode).to.equal(200);
    res = itHelpers.request_graph_ql_post(individualAdding);
    res = itHelpers.request_graph_ql_post(individualAdding);
    res = itHelpers.request_graph_ql_post(individualAdding);
    res = itHelpers.request_graph_ql_post(individualAdding);
    res = itHelpers.request_graph_ql_post(individualAdding);
    res = itHelpers.request_graph_ql_post(individualAdding);
    res = itHelpers.request_graph_ql_post(individualAdding);
    res = itHelpers.request_graph_ql_post(individualAdding);
    res = itHelpers.request_graph_ql_post(individualAdding);
    res = itHelpers.request_graph_ql_post(individualAdding);
    res = itHelpers.request_graph_ql_post(individualAdding);
    res = itHelpers.request_graph_ql_post(individualAdding);
    res = itHelpers.request_graph_ql_post(individualAdding);
    expect(res.statusCode).to.equal(200);
    res = itHelpers.request_graph_ql_post(`{ individuals (search: {field: name, operator: eq, value: {value: "${individualName}"}}) {name}}`);
    resBody = JSON.parse(res.body.toString('utf8'));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.individuals.length).equal(15);

    let transcript_count_gene = "Gene Z";
    let transcript_count_adding = `mutation { addTranscript_count(gene: "${transcript_count_gene}", variable: "RPKM", count: 555.55, tissue_or_condition: "Root") { id } }`;

    res = itHelpers.request_graph_ql_post(transcript_count_adding);
    res = itHelpers.request_graph_ql_post(transcript_count_adding);
    res = itHelpers.request_graph_ql_post(transcript_count_adding);
    res = itHelpers.request_graph_ql_post(transcript_count_adding);
    res = itHelpers.request_graph_ql_post(transcript_count_adding);
    res = itHelpers.request_graph_ql_post(transcript_count_adding);
    res = itHelpers.request_graph_ql_post(transcript_count_adding);
    res = itHelpers.request_graph_ql_post(transcript_count_adding);
    res = itHelpers.request_graph_ql_post(transcript_count_adding);
    res = itHelpers.request_graph_ql_post(transcript_count_adding);
    res = itHelpers.request_graph_ql_post(transcript_count_adding);
    res = itHelpers.request_graph_ql_post(`{ transcript_counts(search:{field: gene, operator: eq, value: {value: "${transcript_count_gene}"}}) {gene}}`);
    resBody = JSON.parse(res.body.toString('utf8'));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.transcript_counts.length).equal(11);

    res = itHelpers.request_graph_ql_post(`{ individuals(search:{field: name, operator: eq, value: {value: "${individualName}"}}) { name } transcript_counts(search:{field: gene, operator: eq, value: {value: "${transcript_count_gene}"}}) {gene}}`);
    resBody = JSON.parse(res.body.toString('utf8'));

    const errorObject_TranscriptCount = {
        errors:[{
            message:"Max record limit of 25 exceeded in transcript_counts",
            locations: [
                      {
                        column: 95,
                        line: 1
                      }
                    ],
            path:["transcript_counts"]
        }],
        data:{
            individuals:[
                {name:individualName},
                {name:individualName},
                {name:individualName},
                {name:individualName},
                {name:individualName},
                {name:individualName},
                {name:individualName},
                {name:individualName},
                {name:individualName},
                {name:individualName},
                {name:individualName},
                {name:individualName},
                {name:individualName},
                {name:individualName},
                {name:individualName}
            ],
            transcript_counts:null
        }};

    const errorObject_Individual = {
        errors:[{
            message:"Max record limit of 25 exceeded in individuals",
            locations: [
              {
                column: 3,
                line: 1
              }
            ],
            path:["individuals"]
        }],
        data:{
            individuals:null,
            transcript_counts:[
                {gene:transcript_count_gene},
                {gene:transcript_count_gene},
                {gene:transcript_count_gene},
                {gene:transcript_count_gene},
                {gene:transcript_count_gene},
                {gene:transcript_count_gene},
                {gene:transcript_count_gene},
                {gene:transcript_count_gene},
                {gene:transcript_count_gene},
                {gene:transcript_count_gene},
                {gene:transcript_count_gene}
            ]
        }

    };

    expect(res.statusCode).to.equal(200);
    expect((resBody.data.individuals === null) !== (resBody.data.transcript_counts === null)).to.be.true;

    if (resBody.data.individuals === null) {
        expect(resBody).to.deep.equal(errorObject_Individual);
    } else {
        expect(resBody).to.deep.equal(errorObject_TranscriptCount);
    }

    res = itHelpers.request_graph_ql_post(`{individuals(search:{field:name operator:eq value:{value:"${individualName}"}}) {id}}`);
    expect(res.statusCode).to.equal(200);
    let individuals = JSON.parse(res.body.toString('utf8')).data.individuals;
    for(let i = 0; i < individuals.length; i++){
        res = itHelpers.request_graph_ql_post(`mutation { deleteIndividual (id: ${individuals[i].id}) }`);

        expect(res.statusCode).to.equal(200);
    }

    res = itHelpers.request_graph_ql_post(`{individuals(search:{field:name operator:eq value:{value:"${individualName}"}}) {id}}`);
    expect(res.statusCode).to.equal(200);
    individuals = JSON.parse(res.body.toString('utf8')).data.individuals;
    expect(individuals).to.deep.equal([]);

    res = itHelpers.request_graph_ql_post(`{transcript_counts(search:{field:gene operator:eq value:{value:"${transcript_count_gene}"}}) {id}}`);
    expect(res.statusCode).to.equal(200);
    let trCounts = JSON.parse(res.body.toString('utf8')).data.transcript_counts;
    for (let i = 0; i < trCounts.length; i++){
        res = itHelpers.request_graph_ql_post(`mutation { deleteTranscript_count (id: ${trCounts[i].id}) }`);
        expect(res.statusCode).to.equal(200);
    }
    res = itHelpers.request_graph_ql_post(`{transcript_counts(search:{field:gene operator:eq value:{value:"${transcript_count_gene}"}}) {id}}`);
    expect(res.statusCode).to.equal(200);
    trCounts = JSON.parse(res.body.toString('utf8')).data.transcript_counts;
    expect(trCounts).to.deep.equal([]);

  }).timeout(5000);
  
  //one_to_one associations where foreignKey is in the target model
  it('22. one_to_one associations setup', function() {
    //setup
    itHelpers.request_graph_ql_post('mutation { addCountry(country_id: "GER", name: "Germany") {country_id} }');
    let res = itHelpers.request_graph_ql_post('{ countries {country_id} }');
    let resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody.data.countries.length).equal(1);

    itHelpers.request_graph_ql_post('mutation { addCapital(capital_id:"GER_B", name: "Berlin", addUnique_country:"GER") {capital_id} }');
    res = itHelpers.request_graph_ql_post('{ capitals {capital_id} }');
    resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody.data.capitals.length).equal(1);
  });

  it('23. one_to_one associations success', function() {
    //test success
    res = itHelpers.request_graph_ql_post('{ countries {country_id unique_capital{ capital_id}} }');
    resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal(
      {"data":{"countries":[{"country_id":"GER","unique_capital":{"capital_id":"GER_B"}}]}}
    )
  });

  it('24. one_to_one associations error', function() {
    //test error
    itHelpers.request_graph_ql_post('mutation { addCapital(capital_id:"GER_BN", name: "Bonn", addUnique_country:"GER") {capital_id} }');
    res = itHelpers.request_graph_ql_post('{ countries {country_id unique_capital{ capital_id}} }');
    resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      errors:[
        {
          message:'Not unique "to_one" association Error: Found 2 capitals matching country with country_id GER. Consider making this association a "to_many", using unique constraints, or moving the foreign key into the country model. Returning first capital. Found capitals capital_ids: [GER_B,GER_BN]',
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
    res = itHelpers.request_graph_ql_post('{countries{name riversFilter{name} countFilteredRivers} countCountries}')
    let resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody.data.countries.length).equal(3);
    //Connection
    res = itHelpers.request_graph_ql_post('{countries{name riversConnection{edges{node{name}}} countFilteredRivers} countCountries}')
    resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody.data.countries.length).equal(3);
  });

  it('28. to_many_through_sql_cross_table Filter', function(){
    res = itHelpers.request_graph_ql_post('{ countries{ name riversFilter(search:{field:length,value:{value:"2000",type:"Int"}, operator:gt}){ name }}}')
    resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);

    expect(resBody).to.deep.equal(
    {
      "data": {
        "countries": [
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
          },
          {
            "name": "Austria",
            "riversFilter": [
              {
                "name": "donau"
              }
            ]
          }
        ]
      }
    })
  });

  it('29. to_many_through_sql_cross_table Cleanup', function(){
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

  it('30. Cursor based pagination', function() {
    let res = itHelpers.request_graph_ql_post('{transcript_countsConnection{edges{cursor node{id gene}} pageInfo{startCursor endCursor hasPreviousPage hasNextPage}}}');
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

  it('31. Error output for wrong parameter', function() {
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

  it('32. Complementary search operators', async () => {
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
    res = await itHelpers.request_graph_ql_post(`query { transcript_counts(search: {field: id, operator: in, value: {type: "Array", value: "${ita.id},${itb.id}"}}) {id, gene}}`);
    resBody = JSON.parse(res.body.toString('utf8'));

    expect(res.statusCode).to.equal(200);
    should.exist(resBody.data.transcript_counts);
    expect(resBody.data.transcript_counts).to.deep.include(ita);
    expect(resBody.data.transcript_counts).to.deep.include(itb);
    expect(resBody.data.transcript_counts.length).to.equal(2);

    /**
     * op: notIn ('ita.id', 'itb.id')
     */
    res = await itHelpers.request_graph_ql_post(`query { transcript_counts(search: {field: id, operator: notIn, value: {type: "Array", value: "${ita.id},${itb.id}"}}) {id, gene}}`);
    resBody = JSON.parse(res.body.toString('utf8'));

    expect(res.statusCode).to.equal(200);
    should.exist(resBody.data.transcript_counts);
    expect(resBody.data.transcript_counts).to.deep.include(itc);
    expect(resBody.data.transcript_counts).to.not.include(ita);
    expect(resBody.data.transcript_counts).to.not.include(itb);

    /**
     * op: like '%ene-28%'
     */
    res = await itHelpers.request_graph_ql_post(`query { transcript_counts(search: {field: gene, operator: like, value: {value: "%ene-28%"}}) {id, gene}}`);
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
    res = await itHelpers.request_graph_ql_post(`query { transcript_counts(search: {field: gene, operator: notLike, value: {value: "%ene-28%"}}) {id, gene}}`);
    resBody = JSON.parse(res.body.toString('utf8'));

    expect(res.statusCode).to.equal(200);
    should.exist(resBody.data.transcript_counts);
    expect(resBody.data.transcript_counts).to.not.include(ita);
    expect(resBody.data.transcript_counts).to.not.include(itb);
    expect(resBody.data.transcript_counts).to.not.include(itc);

    /**
     * op: between ['ita.id', 'itc.id']
     */
    res = await itHelpers.request_graph_ql_post(`query { transcript_counts(search: {field: id, operator: between, value: {type:"Array", value:"${ita.id},${itc.id}" }}) {id, gene}}`);
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
    res = await itHelpers.request_graph_ql_post(`query { transcript_counts(search: {field: id, operator: notBetween, value: {type:"Array", value:"${ita.id},${itc.id}" }}) {id, gene}}`);
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
            let res = itHelpers.request_graph_ql_post('{ individuals {id} }');
            let individuals = JSON.parse(res.body.toString('utf8')).data.individuals;

            for(let i = 0; i < individuals.length; i++){
                res = itHelpers.request_graph_ql_post(`mutation { deleteIndividual (id: ${individuals[i].id}) }`);
                expect(res.statusCode).to.equal(200);
            }

            let cnt = await itHelpers.count_all_records('countIndividuals');
            expect(cnt).to.equal(0);

            res = itHelpers.request_graph_ql_post('{ transcript_counts {id} }');
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
        let res = itHelpers.request_graph_ql_post('{ individuals {id} }');
        let individuals = JSON.parse(res.body.toString('utf8')).data.individuals;

        for(let i = 0; i < individuals.length; i++){
            res = itHelpers.request_graph_ql_post(`mutation { deleteIndividual (id: ${individuals[i].id}) }`);
            expect(res.statusCode).to.equal(200);
        }

        let cnt = await itHelpers.count_all_records('countIndividuals');
        expect(cnt).to.equal(0);

        res = itHelpers.request_graph_ql_post('{ transcript_counts {id} }');
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
            let res = itHelpers.request_graph_ql_post('{ individuals {id} }');
            let individuals = JSON.parse(res.body.toString('utf8')).data.individuals;

            for(let i = 0; i < individuals.length; i++){
                res = itHelpers.request_graph_ql_post(`mutation { deleteIndividual (id: ${individuals[i].id}) }`);
                expect(res.statusCode).to.equal(200);
            }

            let cnt = await itHelpers.count_all_records('countIndividuals');
            expect(cnt).to.equal(0);

            res = itHelpers.request_graph_ql_post('{ transcript_counts {id} }');
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
                let res = itHelpers.request_graph_ql_post('{ sequencingExperiments {id} }');
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
                  "locations": "",
                  "extensions": {
                      "receivedFrom": ["http://server2:3030/graphql"]
                  }
              },
              {
                "message": "LIMIT must not be negative",
                "locations": ""
              }
          ],
          "data": {
              "dogsConnection": {
                  "edges": []
              }
          }
      });

    });

    it('02. Update the person to associate with a dog', function() {
        let res = itHelpers.request_graph_ql_post('mutation {updatePerson(person_id:"instance1-01" addDogs:"instance2-01") {person_id name countFilteredDogs dogsConnection{edges {node {dog_id name}}}}}');
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
        let res = itHelpers.request_graph_ql_post('mutation{updatePerson(person_id:"instance1-01" removeDogs:"instance2-02") {person_id name countFilteredDogs dogsConnection{edges{node{dog_id name}}}}}');
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
        res = itHelpers.request_graph_ql_post('{peopleConnection{edges{node{person_id name countFilteredDogs}}}}');
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
        res = itHelpers.request_graph_ql_post('mutation{addPerson(person_id:"instance1-03" name:"Emily" addDogs:"instance2-01") {person_id name countFilteredDogs dogsConnection{edges{node{dog_id name}}}}}');
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
        res = itHelpers.request_graph_ql_post('{peopleConnection(search:{field:person_id operator:like value:{value:"instance1%"} excludeAdapterNames:"person_instance1"}) {edges{node{person_id}}}}');
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
        res = itHelpers.request_graph_ql_post('{peopleConnection(search:{field:person_id operator:like value:{value:"instance1%"}}) {edges{node{person_id name countFilteredDogs dogsConnection{edges{node{dog_id name}}}}}}}');
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
          res = itHelpers.request_graph_ql_post('{peopleConnection(search:{field:person_id operator:like value:{value:"instance1%"}} order:{field:name order:DESC}) {edges{node{person_id name countFilteredDogs dogsConnection{edges{node{dog_id name}}}}}}}');
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
        res = itHelpers.request_graph_ql_post('{peopleConnection(order:{field:name order:ASC} pagination:{first:3}) {edges{node{person_id name countFilteredDogs dogsConnection{edges{node{dog_id name}}}}}}}');
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
          {edges{node{person_id name countFilteredDogs dogsConnection{edges{node{dog_id name}}}}cursor} pageInfo{startCursor endCursor hasNextPage hasPreviousPage}}}');
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
          {edges{node{person_id name countFilteredDogs dogsConnection{edges{node{dog_id name}}}}cursor}\
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
        res = itHelpers.request_graph_ql_post('{dogsConnection{edges{node{dog_id}}}}');
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
        res = itHelpers.request_graph_ql_post('{peopleConnection(order:{field:name order:ASC}){edges{node{person_id name}}}}');
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
        let res = itHelpers.request_graph_ql_post('{peopleConnection{edges{node{person_id}}}}');
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
      let res = itHelpers.request_graph_ql_post('{peopleConnection{edges{node{person_id}}}}');
      let resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody.data.peopleConnection.edges.length).equal(1);

      itHelpers.request_graph_ql_post_instance2('mutation { addParrot(parrot_id:"instance2-parrot01", addUnique_person:"instance1-person01") {parrot_id} }');
      res = itHelpers.request_graph_ql_post('{parrotsConnection{edges{node{parrot_id}}}}');
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody.data.parrotsConnection.edges.length).equal(1);
    });

    it('11. one_to_one ddm associations success', function() {
      //test success
      let res = itHelpers.request_graph_ql_post('{peopleConnection{edges{node{person_id unique_parrot{parrot_id}}}}}');
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
      let res = itHelpers.request_graph_ql_post('{peopleConnection {edges {node {person_id unique_parrot {parrot_id}}}}}');
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal(
        {
          errors:[
            {
              message:'Not unique "to_one" association Error: Found 2 parrots matching person with person_id instance1-person01. Consider making this association a "to_many", using unique constraints, or moving the foreign key into the person model. Returning first parrot. Found parrots parrot_ids: [instance2-parrot01,instance2-parrot02]',
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

  describe('Cenzontle Webservice Data Models', function() {
    it('01. Create one accession', function() {
        let res = itHelpers.request_graph_ql_post_instance2('mutation {addAccession(accession_id: "cenz_1-to-instance1" collectors_name:"me"){ accession_id collectors_name}}');

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
          data: {
            addAccession: {
              accession_id: "cenz_1-to-instance1",
              collectors_name: "me"
            }
          }
        });
    });

    it('02. Read one accession', function() {
        let res = itHelpers.request_graph_ql_post_instance2('query {readOneAccession(accession_id: "cenz_1-to-instance1"){ accession_id collectors_name}}');

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
          data: {
            readOneAccession: {
              accession_id: "cenz_1-to-instance1",
              collectors_name: "me"
            }
          }
        });
    });

    it('03. Update one accession', function() {
        let res = itHelpers.request_graph_ql_post_instance2('mutation {updateAccession(accession_id: "cenz_1-to-instance1" collectors_name:"someone_else"){ accession_id collectors_name}}');

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
          data: {
            updateAccession: {
              accession_id: "cenz_1-to-instance1",
              collectors_name: "someone_else"
            }
          }
        });
    });

    it('04. Delete one accession', function() {
        let res = itHelpers.request_graph_ql_post_instance2('mutation {deleteAccession(accession_id: "cenz_1-to-instance1")}');

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
        let res = itHelpers.request_graph_ql_post_instance2('query {accessionsConnection{ edges{node{accession_id}}}}');
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
        let res = itHelpers.request_graph_ql_post_instance2('query {accessions(order: {field: collectors_name order: DESC}){collectors_name}}');

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
        let res = itHelpers.request_graph_ql_post_instance2('query {accessions(search:{operator: or search:[{field:collectors_name value:{value:"%c%"} operator:like },{field:collectors_name value:{value:"%d%"} operator:like} ]}){collectors_name}}');

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
      itHelpers.request_graph_ql_post_instance2('mutation{addLocation(locationId: "location-cenz-1"){locationId}}');

      //create accession with the location created in the line above
      let res = itHelpers.request_graph_ql_post_instance2('mutation{addAccession(accession_id:"cenz-2-accession" addLocation:"location-cenz-1" ){location{locationId}}}');

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
          "data": {
            "addAccession": {
              "location": {
                "locationId": "location-cenz-1"
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
      let res = itHelpers.request_graph_ql_post_instance2('mutation{updateAccession(accession_id:"cenz-2-accession" removeLocation:"location-cenz-1"){locationId location{locationId}}}');

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
      let res = itHelpers.request_graph_ql_post_instance2('mutation{updateAccession(accession_id:"cenz-2-accession" addLocation:"location-cenz-1"){location{locationId}}}');

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
          "data": {
            "updateAccession": {
              "location": {
                "locationId": "location-cenz-1"
              }
            }
          }
        });

        //remove association for cleaning
        itHelpers.request_graph_ql_post_instance2('mutation{updateAccession(accession_id:"cenz-2-accession" removeLocation:"location-cenz-1"){location{locationId}}}');
    });


    it('14.Create with association(to-many) accession-measurement', function() {
      /**
       * Create measurements that will be associated to accession
       * */
       itHelpers.request_graph_ql_post_instance2('mutation{addMeasurement(measurement_id:"measuremente_test_1" ){measurement_id}}');
       itHelpers.request_graph_ql_post_instance2('mutation{addMeasurement(measurement_id:"measuremente_test_2" ){measurement_id}}');
       itHelpers.request_graph_ql_post_instance2('mutation{addMeasurement(measurement_id:"measuremente_test_3" ){measurement_id}}');

      let res = itHelpers.request_graph_ql_post_instance2('mutation{addAccession(accession_id:"cenz-3-accession" addMeasurements:["measuremente_test_1","measuremente_test_2","measuremente_test_3"]){ measurementsFilter(order:{field: measurement_id order: ASC}){measurement_id}}}');

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

      let res = itHelpers.request_graph_ql_post_instance2('mutation{updateAccession(accession_id:"cenz-3-accession" removeMeasurements:["measuremente_test_1","measuremente_test_3"]){ measurementsFilter{measurement_id}}}');

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

      let res = itHelpers.request_graph_ql_post_instance2('mutation{updateAccession(accession_id:"cenz-3-accession" addMeasurements:["measuremente_test_1","measuremente_test_3"]){ measurementsFilter(order:{field: measurement_id order: ASC}){measurement_id}}}');

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

      let res = itHelpers.request_graph_ql_post_instance2('query {readOneAccession(accession_id:"cenz-3-accession"){ measurementsConnection(order:{field: measurement_id order: ASC}){ edges{node{measurement_id}}}}}');

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
         itHelpers.request_graph_ql_post_instance2('mutation{updateAccession(accession_id:"cenz-3-accession" removeMeasurements:["measuremente_test_1","measuremente_test_2","measuremente_test_3"]){ measurementsFilter{measurement_id}}}');
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
         'cenz-2-accession,NULL,NULL,NULL,NULL\n' +
         'cenz-3-accession,NULL,NULL,NULL,NULL\n' +
         'd-instance1,dd,NULL,NULL,NULL\n');
    });

    it('19. Delete all remaining accessions', async function() {
        let res = itHelpers.request_graph_ql_post_instance2('{accessions{accession_id}}');
        let accessions = JSON.parse(res.body.toString('utf8')).data.accessions;

        for(let i = 0; i < accessions.length; i++){
            res = itHelpers.request_graph_ql_post_instance2(`mutation { deleteAccession (accession_id: "${accessions[i].accession_id}") }`);
            expect(res.statusCode).to.equal(200);
        }

        let cnt = await itHelpers.count_all_records('countAccessions');
        expect(cnt).to.equal(0);
    });


    it('20. Delete all remaining measurements', async function() {
        let res = itHelpers.request_graph_ql_post_instance2('{measurements{measurement_id}}');
        let measurements = JSON.parse(res.body.toString('utf8')).data.measurements;

        for(let i = 0; i < measurements.length; i++){
            res = itHelpers.request_graph_ql_post_instance2(`mutation { deleteMeasurement (measurement_id: "${measurements[i].measurement_id}") }`);
            expect(res.statusCode).to.equal(200);
        }

        let cnt = await itHelpers.count_all_records('countMeasurements');
        expect(cnt).to.equal(0);
    });

    it('21. Delete all remaining locations', async function() {
        let res = itHelpers.request_graph_ql_post_instance2('{locations{locationId}}');
        let locations = JSON.parse(res.body.toString('utf8')).data.locations;

        for(let i = 0; i < locations.length; i++){
            res = itHelpers.request_graph_ql_post_instance2(`mutation { deleteLocation (locationId: "${locations[i].locationId}") }`);
            expect(res.statusCode).to.equal(200);
        }

        let cnt = await itHelpers.count_all_records('countLocations');
        expect(cnt).to.equal(0);
    });

  });

  describe('Cassandra', function() {
    after(async function() {
      let res = itHelpers.request_graph_ql_post(`{incidentsConnection {edges {node {incident_id}}}}`);
      let resBody = JSON.parse(res.body.toString('utf8'));
      let edges = resBody.data.incidentsConnection.edges;
      for (let edge of edges) {
        let id = edge.node.incident_id;
        res = itHelpers.request_graph_ql_post(`mutation { deleteIncident(incident_id: "${id}")}`);
        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
          data: {
            deleteIncident: "Item successfully deleted"
          }
        });
      }
      res = itHelpers.request_graph_ql_post(`{countIncidents}`);
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
            countIncidents: 0
        }
      });
      res = itHelpers.request_graph_ql_post(`{instantsConnection {edges {node {instant_id}}}}`);
      resBody = JSON.parse(res.body.toString('utf8'));
       edges = resBody.data.instantsConnection.edges;
      for (let edge of edges) {
        let id = edge.node.instant_id;
        res = itHelpers.request_graph_ql_post(`mutation { deleteInstant(instant_id: "${id}")}`);
        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
          data: {
            deleteInstant: "Item successfully deleted"
          }
        });
      }
      res = itHelpers.request_graph_ql_post(`{countInstants}`);
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
            countInstants: 0
        }
      });
    })
    it('01. Incident table is empty', function() {
      let res = itHelpers.request_graph_ql_post(`{countIncidents}`);
      let resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
            countIncidents: 0
        }
      });
    })

    it('02. Add an incident', function() {
      let res = itHelpers.request_graph_ql_post(`mutation { addIncident(incident_id: "590785b2-062a-4325-8607-9df8e107a7db", incident_description: "An event" ) {incident_id incident_description}}`);
      let resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
            addIncident: {
                incident_id: "590785b2-062a-4325-8607-9df8e107a7db",
                incident_description: "An event"
            }
        }
      });
    })

    it('03. Read an incident', function() {
      let res = itHelpers.request_graph_ql_post('{readOneIncident(incident_id: "590785b2-062a-4325-8607-9df8e107a7db") {incident_id incident_description}}');
      let resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
            readOneIncident: {
                incident_id: "590785b2-062a-4325-8607-9df8e107a7db",
                incident_description: "An event"
            }
        }
      });
    })

    it('04. Update an incident', function() {
      let res = itHelpers.request_graph_ql_post(`mutation { updateIncident(incident_id: "590785b2-062a-4325-8607-9df8e107a7db", incident_description: "Another event" ) {incident_id incident_description}}`);
      let resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
            updateIncident: {
                incident_id: "590785b2-062a-4325-8607-9df8e107a7db",
                incident_description: "Another event"
            }
        }
    });
    })

    // The following produces a warning that is omitted in the return of the model function: 'Aggregation query used without partition key'
    // The server response can return an array of warnings in info.warnings - in this case it has one element
    // The warning itself should be taken seriously in large databases, but here there is only one element.

    it('05. Count and search incidents', function() {
      let res = itHelpers.request_graph_ql_post(`{countIncidents}`);
      let resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
            countIncidents: 1
        }
      });
      res = itHelpers.request_graph_ql_post(`{incidentsConnection {edges {cursor node{incident_id incident_description}} pageInfo{startCursor hasNextPage}}}`);
      resBody = JSON.parse(res.body.toString('utf8'));
      let cursor = resBody.data.incidentsConnection.edges[0].cursor;
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
            incidentsConnection: {
                edges: [
                    {
                      cursor: `${cursor}`,
                      node: {
                        incident_id: "590785b2-062a-4325-8607-9df8e107a7db",
                        incident_description: "Another event"
                      }
                    }
                ],
                pageInfo: {
                    startCursor: null,
                    hasNextPage: false
                }
            }
        }
    });

    });

    it('06. Delete an incident', function() {
      let res = itHelpers.request_graph_ql_post(`mutation { deleteIncident(incident_id: "590785b2-062a-4325-8607-9df8e107a7db")}`);
      let resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
            deleteIncident: "Item successfully deleted"
        }
      });
    })

    it('07. Create 5 incidents, test pagination and delete the incidents in a loop', function() {
      let res = itHelpers.request_graph_ql_post(`mutation { addIncident(incident_id: "aef7cbbc-3f9c-452c-a95a-0eccd51e02e1", incident_description: "First incident", incident_number: 1 ) {incident_id incident_description}}`);
      let resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
            addIncident: {
                incident_id: "aef7cbbc-3f9c-452c-a95a-0eccd51e02e1",
                incident_description: "First incident"
            }
        }
      });
      res = itHelpers.request_graph_ql_post(`mutation { addIncident(incident_id: "0a853fac-1bb2-4adf-bbf9-9371f7db97b6", incident_description: "Second incident", incident_number: 2 ) {incident_id incident_description}}`);
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
            addIncident: {
                incident_id: "0a853fac-1bb2-4adf-bbf9-9371f7db97b6",
                incident_description: "Second incident"
            }
        }
      });
      res = itHelpers.request_graph_ql_post(`mutation { addIncident(incident_id: "8f455707-f7aa-4925-9efc-df18f2f9cd55", incident_description: "Third incident", incident_number: 3 ) {incident_id incident_description}}`);
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
            addIncident: {
                incident_id: "8f455707-f7aa-4925-9efc-df18f2f9cd55",
                incident_description: "Third incident"
            }
        }
      });
      res = itHelpers.request_graph_ql_post(`mutation { addIncident(incident_id: "a1e30fde-2bc0-466b-84f4-1d4fee68af44", incident_description: "Fourth incident", incident_number: 4 ) {incident_id incident_description}}`);
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
            addIncident: {
                incident_id: "a1e30fde-2bc0-466b-84f4-1d4fee68af44",
                incident_description: "Fourth incident"
            }
        }
      });
      res = itHelpers.request_graph_ql_post(`mutation { addIncident(incident_id: "1f458011-49a3-4833-90f0-d084e227c376", incident_description: "Fifth incident", incident_number: 5 ) {incident_id incident_description}}`);
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
            addIncident: {
                incident_id: "1f458011-49a3-4833-90f0-d084e227c376",
                incident_description: "Fifth incident"
            }
        }
      });
      res = itHelpers.request_graph_ql_post(`{incidentsConnection {edges {cursor node{incident_id incident_description incident_number}}}}`);
      resBody = JSON.parse(res.body.toString('utf8'));
      let edges = resBody.data.incidentsConnection.edges;
      let idArray = edges.map(edge => edge.node.incident_id);
      let cursorArray = edges.map(edge => edge.cursor);
      let numberArray = edges.map(edge => edge.node.incident_number);
      res = itHelpers.request_graph_ql_post(`{incidentsConnection(pagination:{limit: 2}) {edges{cursor node{incident_id}} pageInfo{startCursor hasNextPage}}}`);
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
          incidentsConnection: {
            edges: [
              {
                cursor: cursorArray[0],
                node: {
                  incident_id: idArray[0]
                }
              },
              {
                cursor: cursorArray[1],
                node: {
                  incident_id: idArray[1]
                }
              }
            ],
            pageInfo: {
              startCursor: cursorArray[1],
              hasNextPage: true
            }
          }
        }
      })
      res = itHelpers.request_graph_ql_post(`{incidentsConnection(pagination:{limit: 2, after: "${cursorArray[1]}"}) {edges{cursor node{incident_id}} pageInfo{startCursor hasNextPage}}}`);
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
          incidentsConnection: {
            edges: [
              {
                cursor: cursorArray[2],
                node: {
                  incident_id: idArray[2]
                }
              },
              {
                cursor: cursorArray[3],
                node: {
                  incident_id: idArray[3]
                }
              }
            ],
            pageInfo: {
              startCursor: cursorArray[3],
              hasNextPage: true
            }
          }
        }
      })
      res = itHelpers.request_graph_ql_post(`{incidentsConnection(pagination:{limit: 2, after: "${cursorArray[3]}"}) {edges{cursor node{incident_id}} pageInfo{startCursor hasNextPage}}}`);
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
          incidentsConnection: {
            edges: [
              {
                cursor: cursorArray[4],
                node: {
                  incident_id: idArray[4]
                }
              }
            ],
            pageInfo: {
              startCursor: null,
              hasNextPage: false
            }
          }
        }
      })
      res = itHelpers.request_graph_ql_post(`{incidentsConnection(search:{field: incident_number, value: {value: "3"}, operator: gt}, pagination:{limit: 1}) {edges{node{incident_id incident_number}}}}`);
      resBody = JSON.parse(res.body.toString('utf8'));
      let idx = numberArray.indexOf(5);
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
          incidentsConnection: {
            edges: [
              {
                node: {
                  incident_id: idArray[idx],
                  incident_number: 5
                }
              }
            ]
          }
        }
      });
      for (let edge of edges) {
        let id = edge.node.incident_id;
        res = itHelpers.request_graph_ql_post(`mutation { deleteIncident(incident_id: "${id}")}`);
        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
          data: {
            deleteIncident: "Item successfully deleted"
          }
        });
      }
      res = itHelpers.request_graph_ql_post(`{countIncidents}`);
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
            countIncidents: 0
        }
      });
    });

    it('08. Instant table is empty', function() {
      let res = itHelpers.request_graph_ql_post(`{countInstants}`);
      let resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
            countInstants: 0
        }
      });
    })

    it('09. Add an instant', function() {
      let res = itHelpers.request_graph_ql_post(`mutation { addInstant(instant_id: "c28ffcb7-6f55-4577-8359-9d8a46382a45", year: 2020, month: 6, day: 18, hour: 10, minute: 52 ) {instant_id year month day hour minute}}`);
      let resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
            addInstant: {
                instant_id: "c28ffcb7-6f55-4577-8359-9d8a46382a45",
                year: 2020,
                month: 6,
                day: 18,
                hour: 10,
                minute: 52
            }
        }
      });
    })

    it('10. Read an instant', function() {
      let res = itHelpers.request_graph_ql_post('{readOneInstant(instant_id: "c28ffcb7-6f55-4577-8359-9d8a46382a45") {instant_id year month day hour minute}}');
      let resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
            readOneInstant: {
                instant_id: "c28ffcb7-6f55-4577-8359-9d8a46382a45",
                year: 2020,
                month: 6,
                day: 18,
                hour: 10,
                minute: 52
            }
        }
      });
    })

    it('11. Update an instant', function() {
      let res = itHelpers.request_graph_ql_post(`mutation { updateInstant(instant_id: "c28ffcb7-6f55-4577-8359-9d8a46382a45", minute: 57 ) {instant_id year month day hour minute}}`);
      let resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
            updateInstant: {
                instant_id: "c28ffcb7-6f55-4577-8359-9d8a46382a45",
                year: 2020,
                month: 6,
                day: 18,
                hour: 10,
                minute: 57
            }
        }
      });
    })

    it('12. Count and search instants', function() {
      let res = itHelpers.request_graph_ql_post(`{countInstants}`);
      let resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
            countInstants: 1
        }
      });
      res = itHelpers.request_graph_ql_post(`{instantsConnection {edges{cursor node{instant_id year month day hour minute}} pageInfo{startCursor hasNextPage}}}`);
      resBody = JSON.parse(res.body.toString('utf8'));
      let cursor = resBody.data.instantsConnection.edges[0].cursor;
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
            instantsConnection: {
                edges: [
                    {
                      cursor: `${cursor}`,
                      node: {
                        instant_id: "c28ffcb7-6f55-4577-8359-9d8a46382a45",
                        year: 2020,
                        month: 6,
                        day: 18,
                        hour: 10,
                        minute: 57
                      }
                    }
                ],
                pageInfo: {
                    startCursor: null,
                    hasNextPage: false
                }
            }
        }
      });

    });

    it('13. Generate an incident and associate it to the instant', function() {
      let res = itHelpers.request_graph_ql_post(`mutation { addIncident(incident_id: "0d2569b6-c890-4e26-a081-9eff27f70b8a", incident_description: "Associations test incident", addInstants: "c28ffcb7-6f55-4577-8359-9d8a46382a45") {incident_id incident_description}}`);
      let resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
            addIncident: {
                incident_id: "0d2569b6-c890-4e26-a081-9eff27f70b8a",
                incident_description: "Associations test incident"
            }
        }
      });
    })

    it('14. Read the instant and its connection to the incident', function() {
      let res = itHelpers.request_graph_ql_post(`{instantsConnection(search:{field: instant_id, operator: eq, value:{value: "c28ffcb7-6f55-4577-8359-9d8a46382a45"}}) {edges {node {instant_id incident_assoc_id incident {incident_id}}}}}`);
      let resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
            instantsConnection: {
                edges: [
                    {
                        node: {
                            instant_id: "c28ffcb7-6f55-4577-8359-9d8a46382a45",
                            incident_assoc_id: "0d2569b6-c890-4e26-a081-9eff27f70b8a",
                            incident: {
                                incident_id: "0d2569b6-c890-4e26-a081-9eff27f70b8a"
                            }
                        }
                    }
                ]
            }
        }
    });
    })

    it('15. Generate a new instant and associate it to the incident', function() {
      let res = itHelpers.request_graph_ql_post(`mutation { addInstant(instant_id: "36c29673-0cc3-4d50-9172-b0cf885a481c", year: 2020, month: 6, day: 22, hour: 18, minute: 47, addIncident: "0d2569b6-c890-4e26-a081-9eff27f70b8a") {instant_id year month day hour minute incident_assoc_id}}`);
      let resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
            addInstant: {
                instant_id: "36c29673-0cc3-4d50-9172-b0cf885a481c",
                year: 2020,
                month: 6,
                day: 22,
                hour: 18,
                minute: 47,
                incident_assoc_id: "0d2569b6-c890-4e26-a081-9eff27f70b8a"
            }
        }
      });
    })

    it('16. Read the incident and its connection to the instants', function() {
      let res = itHelpers.request_graph_ql_post(`{readOneIncident(incident_id: "0d2569b6-c890-4e26-a081-9eff27f70b8a") {incident_id instantsConnection {edges {node{ instant_id}}} }}`);
      let resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
            readOneIncident: {
                incident_id: "0d2569b6-c890-4e26-a081-9eff27f70b8a",
                instantsConnection: {
                    edges: [
                        {
                            node: {
                                instant_id: "36c29673-0cc3-4d50-9172-b0cf885a481c"
                            }
                        },
                        {
                            node: {
                                instant_id: "c28ffcb7-6f55-4577-8359-9d8a46382a45"
                            }
                        }
                    ]
                }
            }
        }
      });
    })

    it('17. Delete the associations', function() {
      let res = itHelpers.request_graph_ql_post(`{instantsConnection(search:{field: incident_assoc_id, operator: eq, value:{value: "0d2569b6-c890-4e26-a081-9eff27f70b8a"}}) {edges {node{ instant_id}}}}`);
      let resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      let edges = resBody.data.instantsConnection.edges;
      expect(edges.length).to.equal(2);
      for (let edge of edges) {
        let id = edge.node.instant_id;
        res = itHelpers.request_graph_ql_post(`mutation{updateInstant(instant_id: "${id}", removeIncident: "0d2569b6-c890-4e26-a081-9eff27f70b8a") {instant_id incident_assoc_id}}`);
        resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
          data: {
            updateInstant: {
              instant_id: `${id}`,
              incident_assoc_id: null
            }
          }
        });
      }
    })

    it('18. Get the table template', function() {
      let res = itHelpers.request_graph_ql_post(`{csvTableTemplateIncident}`);
      let resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
            csvTableTemplateIncident: [
                "incident_id,incident_description,incident_number",
                "uuid,String,Int"
            ]
        }
      });
    })
    
  })
