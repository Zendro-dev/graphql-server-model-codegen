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
      await record.set_individual_id(this.id);
  });
}
`
