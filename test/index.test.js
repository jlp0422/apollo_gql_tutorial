const expect = require('chai').expect
const url = `http://localhost:8000`
const request = require('supertest')(url)
const jwt = require('jsonwebtoken')
const { SECRET } = process.env
const user = require('../models/user');
const message = require('../models/message');

describe('message model', () => {
  it('can return a message by id', (done) => {
    request.post('/graphql')
      .send({ query: `{ message(id: 2) { id, text, user { id } } }` })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body.data.message).to.have.property('id')
        expect(res.body.data.message).to.have.property('text')
        expect(res.body.data.message).to.have.property('user')
        expect(res.body.data.message.user).to.be.an('object')
        expect(res.body.data.message.user).to.have.property('id')
        done()
      })
  })

  it('can return all messages', (done) => {
    request.post('/graphql')
      .send({ query: `{ messages{ id, text user { username } } }` })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body.data.messages.length).to.equal(4)
        expect(res.body.data.messages[0]).to.have.property('text')
        expect(res.body.data.messages[0].user).to.have.property('username')
        done()
      })
  })
})

describe('user model', () => {
  it('can return a user by id', (done) => {
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
        done()
      })
  })

  it('can delete a user', (done) => {
    request.post('/graphql')
      .send({ query:
        `mutation {
          deleteUser(id: 2)
        }`
      })
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body.data.deleteUser).to.equal(true)
        done()
      })
  })
})

describe('user authentication', () => {
  it('returns a credential error if login is incorrect', (done) => {
    request.post('/graphql')
      .send({ query:
        `mutation {
          signIn(login: "jeremyphilipson" password: "charlesbear")
          { token }
        }`
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body.errors.length).to.equal(1)
        expect(res.body.errors[0].message).to.equal('No user was found with this login information.')
        done()
      })
  })

  it('returns a password error if password is incorrect', (done) => {
    request.post('/graphql')
      .send({ query:
        `mutation {
          signIn(login: "jlp0422" password: "jeremy")
          { token }
        }`
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body.errors.length).to.equal(1)
        expect(res.body.errors[0].message).to.equal('Invalid password.')
        done()
      })
  })

  it('returns valid token after login with correct credentials', (done) => {
    request.post('/graphql')
      .send({ query:
        `mutation {
          signIn(login: "jlp0422" password: "charlesbear")
          { token }
        }`
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body.data.signIn).to.have.property('token')
        expect(res.body.data.signIn.token).to.be.a('string')
        done()
      })
  })
})
