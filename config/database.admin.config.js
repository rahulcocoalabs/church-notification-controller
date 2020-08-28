module.exports = {
  development: {
    sql: {
      // database: 'suchitwa',
      // username: 'postgres',
      // password: 'suchitwa'
      database: 'collygo_test',
      username: 'root',
      password: '', 
      host: 'localhost',
      dialect: 'mysql',
      logging: true,
      pool: {
        max: 9,
        min: 0,
        idle: 10000
      } 
    },
    mosngo: 
      { 
        url:"mongodb+srv://root:root@cluster0-mwmnq.mongodb.net/test?retryWrites=true&w=majority",
        useNewUrlParser: true,
        useUnifiedTopology: true
  
      }
    

  },
  qa: {
    sql: {
      // database: 'suchitwa',
      // username: 'postgres',
      // password: 'suchitwa'
      database: 'suchitwa_mission',
      username: 'developer',
      password: 'Projects@2019.com'
    }
  }

}
