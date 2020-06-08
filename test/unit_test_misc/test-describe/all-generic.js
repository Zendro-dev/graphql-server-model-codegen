/**
 * PART I: Generic models
 */

/* Schema */

/**
 * 1. generic with no associations - person
 * 
 * Schema model with <no associations> should NOT match any of the 
 * following firms.
 * 
 * (Assumed input with no whitespaces).
 */
//to_many firms
module.exports.test1_1 = /.+Filter\(search:search.+Input,order:\[order.+Input\],pagination:paginationInput\):\[.+\].+typeQuery{/;
module.exports.test1_2 = /.+Connection\(search:search.+Input,order:\[order.+Input\],pagination:paginationCursorInput\):.+Connection.+typeQuery{/;
module.exports.test1_3 = /.+countFiltered.+\(search:search.+Input\):Int.+typeQuery{{/;
module.exports.test1_4 = /typeMutation{add.+\(.+add.+:\[ID\]/;
module.exports.test1_5 = /typeMutation{.+update.+\(.+add.+:\[ID\]/;
module.exports.test1_6 = /typeMutation{.+update.+\(.+remove.+:\[ID\]/;
//to_one firms
module.exports.test1_7 = /^module.exports=`type.+{.+\(search:search.+Input\):.+typeQuery{/;
module.exports.test1_8 = /typeMutation{.+add.+\(.+add.+:ID/;
module.exports.test1_9 = /typeMutation{.+update.+\(.+add.+:ID/;
module.exports.test1_10 = /typeMutation{.+update.+\(.+remove.+:ID/;


/**
 * 2. sql <to_many> generic - person
 */
//to_many firms (particular case)
module.exports.test2_1 = /dogsFilter\(search:searchDogInput,order:\[orderDogInput\],pagination:paginationInput\):\[Dog\].+typeQuery{/;
module.exports.test2_2 = /dogsConnection\(search:searchDogInput,order:\[orderDogInput\],pagination:paginationCursorInput\):DogConnection.+typeQuery{/;
module.exports.test2_3 = /countFilteredDogs\(search:searchDogInput\):Int.+typeQuery{/;
module.exports.test2_4 = /typeMutation{addPerson\(.+addDogs:\[ID\]/;
module.exports.test2_5 = /typeMutation{.+updatePerson\(.+addDogs:\[ID\]/;
module.exports.test2_6 = /typeMutation{.+updatePerson\(.+removeDogs:\[ID\]/;

/**
 * 3. generic <to_one> sql - dog
 */
//to_one firms (particular case)
module.exports.test3_1 = /^module.exports=`type.+{.+owner\(search:searchPersonInput\):Person.+typeQuery{/;
module.exports.test3_2 = /typeMutation{addDog\(.+addOwner:ID/;
module.exports.test3_3 = /typeMutation{.+updateDog\(.+addOwner:ID/;
module.exports.test3_4 = /typeMutation{.+updateDog\(.+removeOwner:ID/;

/**
 * 4. sql <to_one> generic - person
 */
//to_one firms (particular case)
module.exports.test4_1 = /^module.exports=`type.+{.+unique_homeTown\(search:searchHometownInput\):Hometown.+typeQuery{/;
module.exports.test4_2 = /typeMutation{addPerson\(.+addUnique_homeTown:ID/;
module.exports.test4_3 = /typeMutation{.+updatePerson\(.+addUnique_homeTown:ID/;
module.exports.test4_4 = /typeMutation{.+updatePerson\(.+removeUnique_homeTown:ID/;

/**
 * 5. generic <to_many> sql - hometown
 */
//to_many firms (particular case)
module.exports.test5_1 = /peopleFilter\(search:searchPersonInput,order:\[orderPersonInput\],pagination:paginationInput\):\[Person\].+typeQuery{/;
module.exports.test5_2 = /peopleConnection\(search:searchPersonInput,order:\[orderPersonInput\],pagination:paginationCursorInput\):PersonConnection.+typeQuery{/;
module.exports.test5_3 = /countFilteredPeople\(search:searchPersonInput\):Int.+typeQuery{/;
module.exports.test5_4 = /typeMutation{addHometown\(.+addPeople:\[ID\]/;
module.exports.test5_5 = /typeMutation{.+updateHometown\(.+addPeople:\[ID\]/;
module.exports.test5_6 = /typeMutation{.+updateHometown\(.+removePeople:\[ID\]/;


/* Resolvers */

/**
 * 6. generic with no associations - person
 */
//to_many firms (general firms)
module.exports.test6_1 = /.+constassociationArgsDef={}/;
module.exports.test6_2 = /.+\.prototype\..+Filter=function\({/;
module.exports.test6_3 = /.+\.prototype\.countFiltered.+=function\({/;
module.exports.test6_4 = /.+\.prototype\..+Connection=function\({/;
module.exports.test6_5 = /.+\.prototype\..+add_.+=asyncfunction\({/;
module.exports.test6_5 = /.+\.prototype\..+remove_.+=asyncfunction\({/;

/**
 * 7. sql <to_many> generic - person
 */
//to_many firms (particular firms)
module.exports.test7_1 = /.+constassociationArgsDef={'addDogs':'dog'}/;
module.exports.test7_2 = /person\.prototype\.dogsFilter=function\({/;
module.exports.test7_3 = /person\.prototype\.countFilteredDogs=function\({/;
module.exports.test7_4 = /person\.prototype\.dogsConnection=function\({/;
module.exports.test7_5 = /promises\.push\(this\.add_dogs\(input,benignErrorReporter\)\);/;
module.exports.test7_6 = /promises\.push\(this\.remove_dogs\(input,benignErrorReporter\)\);/;
module.exports.test7_7 = /person\.prototype\.add_dogs=asyncfunction\(input,benignErrorReporter\){/;
module.exports.test7_8 = /person\.prototype\.remove_dogs=asyncfunction\(input,benignErrorReporter\){/;

/**
 * 8. generic <to_one> sql - dog
 */
//to_one firms (particular firms)
module.exports.test8_1 = /.+constassociationArgsDef={'addOwner':'person'}/;
module.exports.test8_2 = /dog\.prototype\.owner=asyncfunction\({/;
module.exports.test8_3 = /dog\.prototype\.add_owner=asyncfunction\(input\){/;
module.exports.test8_4 = /dog\.prototype\.remove_owner=asyncfunction\(input\){/;


/* Models */

/**
 * 9. generic with no associations - person
 */
//general firms
module.exports.test9_1 = /staticasyncreadById\(id\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test9_2 = /staticasynccountRecords\(search\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test9_3 = /staticasyncreadAllCursor\(search,order,pagination\){/;
module.exports.test9_4 = /staticasyncaddOne\(input\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test9_5 = /staticasyncupdateOne\(input\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test9_6 = /staticasyncdeleteOne\(id\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test9_7 = /staticasyncbulkAddCsv\(context\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test9_8 = /staticasynccsvTableTemplate\(\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
//not match (to_one firms)
module.exports.test9_9 = /staticasyncadd_.+\(.+,.+\){/;
module.exports.test9_10 = /staticasyncremove_.+\(.+,.+\){/;

/**
 * 10. sql <to_many> generic - person
 */
//to_one firms
//not match
module.exports.test10_1 = /staticasyncadd_.+\(.+,.+\){/;
module.exports.test10_2 = /staticasyncremove_.+\(.+,.+\){/;

/**
 * 11. generic <to_one> sql - dog
 */
//general firms
module.exports.test11_1 = /staticasyncreadById\(id\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test11_2 = /staticasynccountRecords\(search\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test11_3 = /staticasyncreadAllCursor\(search,order,pagination\){/;
module.exports.test11_4 = /staticasyncaddOne\(input\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test11_5 = /staticasyncupdateOne\(input\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test11_6 = /staticasyncdeleteOne\(id\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test11_7 = /staticasyncbulkAddCsv\(context\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test11_8 = /staticasynccsvTableTemplate\(\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
//to_one firms
module.exports.test11_9 = /staticasyncadd_personId\(id,personId\){/;
module.exports.test11_10 = /staticasyncremove_personId\(id,personId\){/;

/**
 * 12. sql <to_one> generic - person
 */
//to_one firms
module.exports.test12_1 = /staticasyncadd_hometownId\(personId,hometownId\){/;
module.exports.test12_2 = /staticasyncremove_hometownId\(personId,hometownId\){/;

/**
 * 13. generic <to_many> sql - hometown
 */
//general firms
module.exports.test13_1 = /staticasyncreadById\(id\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test13_2 = /staticasynccountRecords\(search\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test13_3 = /staticasyncreadAllCursor\(search,order,pagination\){/;
module.exports.test13_4 = /staticasyncaddOne\(input\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test13_5 = /staticasyncupdateOne\(input\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test13_6 = /staticasyncdeleteOne\(id\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test13_7 = /staticasyncbulkAddCsv\(context\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test13_8 = /staticasynccsvTableTemplate\(\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
//to_one firms
//not match
module.exports.test13_9 = /staticasyncadd_.+\(.+,.+\){/;
module.exports.test13_10 = /staticasyncremove_.+\(.+,.+\){/;


/**
 * PART II: Generic associations 
 */

/* Schema */

/**
 * 14.    generic <generic_to_one> - dog
 * 14_b.  ddm <generic_to_one> - dog
 */
//to_one firms (particular case)
module.exports.test14_1 = /^module.exports=`type.+{.+owner\(search:searchPersonInput\):Person.+typeQuery{/;
module.exports.test14_2 = /typeMutation{addDog\(.+addOwner:ID/;
module.exports.test14_3 = /typeMutation{.+updateDog\(.+addOwner:ID/;
module.exports.test14_4 = /typeMutation{.+updateDog\(.+removeOwner:ID/;

/**
 * 15.    sql <generic_to_many> - person
 * 15_b.  ddm <generic_to_many> - person
 */
//to_many firms (particular case)
module.exports.test15_1 = /dogsFilter\(search:searchDogInput,order:\[orderDogInput\],pagination:paginationInput\):\[Dog\].+typeQuery{/;
module.exports.test15_2 = /dogsConnection\(search:searchDogInput,order:\[orderDogInput\],pagination:paginationCursorInput\):DogConnection.+typeQuery{/;
module.exports.test15_3 = /countFilteredDogs\(search:searchDogInput\):Int.+typeQuery{/;
module.exports.test15_4 = /typeMutation{addPerson\(.+addDogs:\[ID\]/;
module.exports.test15_5 = /typeMutation{.+updatePerson\(.+addDogs:\[ID\]/;
module.exports.test15_6 = /typeMutation{.+updatePerson\(.+removeDogs:\[ID\]/;

/* Resolvers */

/**
 * 16.    sql <generic_to_many> - person
 * 16_b.  ddm <generic_to_many> - person
 */
//to_many firms (particular firms)
module.exports.test16_1 = /.+constassociationArgsDef={'addDogs':'dog'}/;
module.exports.test16_2 = /person\.prototype\.dogsFilter=function\({.+this\.dogsFilterImpl\({/;
module.exports.test16_3 = /person\.prototype\.countFilteredDogs=function\({.+this\.countFilteredDogsImpl\({/;
module.exports.test16_4 = /person\.prototype\.dogsConnection=function\({.+this\.dogsConnectionImpl\({/;
module.exports.test16_5 = /promises\.push\(this\.add_dogs\(input,benignErrorReporter\)\);/;
module.exports.test16_6 = /promises\.push\(this\.remove_dogs\(input,benignErrorReporter\)\);/;
module.exports.test16_7 = /person\.prototype\.add_dogs=asyncfunction\(input\){.+person\.add_dogsImpl\(input\);/;
module.exports.test16_8 = /person\.prototype\.remove_dogs=asyncfunction\(input\){.+person\.remove_dogsImpl\(input\);/;
module.exports.test16_9 = /countAllAssociatedRecords.+{.+letpromises_generic_to_many=\[\];/;
module.exports.test16_10 = /countAllAssociatedRecords.+promises_generic_to_many\.push\(person\.countFilteredDogs\({},context\)\);/;
module.exports.test16_11 = /countAllAssociatedRecords.+letresult_generic_to_many=awaitPromise\.all\(promises_generic_to_many\);/;
module.exports.test16_12 = /countAllAssociatedRecords.+letget_generic_to_many_associated=result_generic_to_many\.reduce\(\(accumulator,current_val\)=>accumulator\+current_val,0\);/;
module.exports.test16_13 = /countAllAssociatedRecords.+returnget_to_one_associated\+get_to_many_associated\+get_generic_to_many_associated;/;

/**
 * 17.    generic <generic_to_one> - dog
 * 17_b.  ddm <generic_to_one> - dog
 */
//to_one firms (particular firms)
module.exports.test17_1 = /constassociationArgsDef={'addOwner':'person'}/;
module.exports.test17_2 = /dog\.prototype\.owner=asyncfunction\({.+this\.ownerImpl\({/;
module.exports.test17_3 = /promises\.push\(this\.add_owner\(input,benignErrorReporter\)\);/;
module.exports.test17_4 = /promises\.push\(this\.remove_owner\(input,benignErrorReporter\)\);/;
module.exports.test17_5 = /dog\.prototype\.add_owner=asyncfunction\(input\){.+dog\.add_ownerImpl\(input\);/;
module.exports.test17_6 = /dog\.prototype\.remove_owner=asyncfunction\(input\){.+dog\.remove_ownerImpl\(input\);/;
module.exports.test17_7 = /countAllAssociatedRecords.+{.+letpromises_generic_to_one=\[\];/;
module.exports.test17_8 = /countAllAssociatedRecords.+promises_generic_to_one\.push\(dog\.owner\({},context\)\);/;
module.exports.test17_9 = /countAllAssociatedRecords.+letresult_generic_to_one=awaitPromise\.all\(promises_generic_to_one\);/;
module.exports.test17_10 = /countAllAssociatedRecords.+letget_generic_to_one_associated=result_generic_to_one\.filter\(\(r,index\)=>helper\.isNotUndefinedAndNotNull\(r\)\).length;/;
module.exports.test17_11 = /countAllAssociatedRecords.+returnget_to_one_associated\+get_to_many_associated\+get_generic_to_one_associated;/;
   
/* Models */

/**
 * 18.    sql <generic_to_many> - person
 * 18_b.  ddm <generic_to_many> - person
 */
//to_many firms (particular firms)
module.exports.test18_1 = /asyncdogsFilterImpl\({search,order,pagination},context\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test18_2 = /asyncdogsConnectionImpl\({search,order,pagination},context\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test18_3 = /asynccountFilteredDogsImpl\({search},context\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test18_4 = /staticasyncadd_dogsImpl\(person_input\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test18_5 = /staticasyncremove_dogsImpl\(person_input\){\/\*YOURCODEGOESHERE\*\/thrownewError/;

/**
 * 19.    generic <generic_to_one> - dog
 * 19_b.  ddm <generic_to_one> - dog
 */
//to_one firms (particular firms)
module.exports.test19_1 = /asyncownerImpl\({search},context\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test19_2 = /staticasyncadd_ownerImpl\(dog_input\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test19_3 = /staticasyncremove_ownerImpl\(dog_input\){\/\*YOURCODEGOESHERE\*\/thrownewError/;

/**
 * PART III: Generic adapter
 */

/**
 * 20. generic-adapter - person-a
 */
//general firms
module.exports.test20_1 = /staticasyncreadById\(id\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test20_2 = /staticasynccountRecords\(search\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test20_3 = /staticasyncreadAllCursor\(search,order,pagination\){/;
module.exports.test20_4 = /staticasyncaddOne\(input\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test20_5 = /staticasyncupdateOne\(input\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test20_6 = /staticasyncdeleteOne\(id\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test20_7 = /staticasyncbulkAddCsv\(context\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test20_8 = /staticasynccsvTableTemplate\(\){\/\*YOURCODEGOESHERE\*\/thrownewError/;
module.exports.test20_9 = /staticgetadapterName\(\){return'person_a';}/;
module.exports.test20_10 = /staticgetadapterType\(\){return'generic-adapter';}/;
module.exports.test20_11 = /staticrecognizeId\(iri\){returniriRegex\.test\(iri\);}/;
module.exports.test20_12 = /staticidAttribute\(\){returnperson_a\.definition\.id\.name;}/;
module.exports.test20_13 = /staticidAttributeType\(\){returnperson_a\.definition\.id\.type;}/;
module.exports.test20_14 = /getIdValue\(\){returnthis\[person_a\.idAttribute\(\)\]}/;



