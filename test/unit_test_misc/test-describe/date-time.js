module.exports.person_date_model = `
birthday: {
  type: Sequelize[ dict['Date'] ]
}
`

module.exports.person_date_schema = `
"""
@original-field
"""
birthday: Date
`

module.exports.person_date_migration = `
birthday: {
    type: Sequelize[ dict['Date'] ]
}
`
module.exports.academic_Team_model_time = `

  meetings_time: {
    type: Sequelize[ dict['Time'] ],
    get(){
      let meetings_time = this.getDataValue('meetings_time');
      if( meetings_time !== null){
        let m = moment(meetings_time, "HH:mm:ss.SSS[Z]");
        if(m.isValid()){
          return m.format("HH:mm:ss.SSS[Z]");
        }
      }
    }
  }

`
