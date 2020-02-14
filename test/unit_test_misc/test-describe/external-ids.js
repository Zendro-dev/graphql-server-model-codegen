module.exports.person_externalIds_migration =`

email: {
    type: Sequelize[dict['String']],
    allowNull: false,
    unique: true
},

phone: {
  type: Sequelize[dict['String']],
  allowNull: false,
  unique: true
}
`

module.exports.externalIdsArray = `

static externalIdsArray(){
  let externalIds = [];
  if(definition.externalIds){
    externalIds = definition.externalIds;
  }

  return externalIds;
}

`
