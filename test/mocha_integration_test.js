const { expect } = require('chai');
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
                  details:"",
                  locations: [
                            {
                              column: 12,
                              line: 1
                            }
                          ],
                  path:["deleteTranscript_count"],
                  extensions: null
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
            details:"",
            locations: [
                      {
                        column: 95,
                        line: 1
                      }
                    ],
            path:["transcript_counts"],
            extensions: null
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
            details:"",
            locations: [
              {
                column: 3,
                line: 1
              }
            ],
            path:["individuals"],
            extensions: null
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
        let success = await itHelpers.batch_upload_csv(csvPath, 'mutation {bulkAddIndividualCsv{id}}');
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
            let success = await itHelpers.batch_upload_csv(csvPath, 'mutation {bulkAddIndividualCsv{ id}}');
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
            let success = await itHelpers.batch_upload_csv(csvPath, 'mutation { bulkAddTranscript_countCsv {id}}');
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
  });
