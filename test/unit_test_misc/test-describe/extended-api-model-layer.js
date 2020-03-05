module.exports.to_add_individual = `

_addIndividual( id ){
  return this.set_individual_id(id);
}
`

module.exports.set_individual_id = `
set_individual_id( value ){
  this.individual_id = value;
  return super.save();
}
`

module.exports.to_add_transcript_counts = `
async _addTranscript_counts( ids ){

  await helper.asyncForEach( ids, async id =>{
      let record = await models.transcript_count.readById(id);
      await record.set_individual_id(this.getIdValue());
  });
}
`

module.exports.to_add_unique_pet = `

async _addUnique_pet(id){
  let record = await models.dog.readById(id);
  await record.set_personId(this.getIdValue());
}


`

module.exports.to_add_trough_table = `

async _addAuthors(ids){

  await helper.asyncForEach(ids, async id =>{
      let input = {
        book_Id : this.getIdValue(),
        person_Id: id
      }
      await models.books_to_people.addOne(input);
  });
}

`

module.exports.remove_individual = `
  _removeIndividual(id ){
    return this.set_individual_id(null);
  }
`

module.exports.remove_transcript_counts = `
async _removeTranscript_counts( ids ){
   await helper.asyncForEach(ids, async id =>{
     let record  = await models.transcript_count.readById(id);
     await record.set_individual_id(null);
   });
}

`

module.exports.remove_unique_pet = `
async _removeUnique_pet(id){
  let record = await models.dog.readById(id);
  await record.set_personId(null);
}

`

module.exports.remove_trough_table = `

async _removeAuthors(ids){

  await helper.asyncForEach(ids, async id =>{
      let search_a = {
        "field" : "book_Id",
        "value": { "value": this.getIdValue()},
        "operator": "eq"
      }

      let search_b = {
        "field" : "person_Id",
        "value": { "value": id},
        "operator": "eq"
      }

      let record = await models.books_to_people.readAll({operator: "and", search:[search_a, search_b]} );
      await models.books_to_people.deleteOne(record[0][models.books_to_people.idAttribute()]);
  });
}

`

module.exports.cenz_set_personId = `

  set_personId(value ){
    super.updateOne({id: this.id, addOwner: value});
  }

`

module.exports.cenz_add_owner = `
_addOwner( id ){
  super.updateOne({id: this.id, addOwner: id});
}

`

module.exports.cenz_add_unique_pet = `

_addUnique_pet(id){
  super.updateOne({id: this.id, addUnique_pet: id});
}

`

module.exports.cenz_add_works = `
 _addPatients(ids){
   super.updateOne({id: this.id, addPatients: ids});
 }
`
