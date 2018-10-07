const expect = require('chai').expect
const url = `http://localhost:8000`
const request = require('supertest')(url)
// const userResolvers = require('./user');

describe('user model', () => {
  it('can return a user with id of 1', (done) => {
    request.post('/graphql')
    .send({ query: '{ user(id: 1) { id username email } }' })
    .expect(200)
    .end((err, res) => {
      if (err) return done(err)
      expect(res.body.data.user).to.have.property('id')
      expect(res.body.data.user).to.have.property('username')
      expect(res.body.data.user).to.have.property('email')
      done()
    })
  })

  it('can return all users', (done) => {
    request.post('/graphql')
    .send({ query: '{ users { id username email } }' })
    .expect(200)
    .end((err, res) => {
      if (err) return done(err)
      expect(res.body.data.users.length).to.equal(2)
      // expect(res.body.data.user).to.have.property('id')
      // expect(res.body.data.user).to.have.property('username')
      // expect(res.body.data.user).to.have.property('email')
      done()
    })
  })

})
