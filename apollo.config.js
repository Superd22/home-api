module.exports = {
  client: {

    includes: ['apps/**/*.graphql', 'libs/**/*.graphql'], // array of glob patterns
    service: {
      name: "homeapi",
      url: "http://localhost:3000/graphql"
    }
  }
};