module.exports.to_add_individual = `

_addIndividual( id ){

 let p = new Promise(async (resolve, reject)=>{
   this.individual_id = id;
   await super.save();
   resolve();
 });
 return p;
}
`
