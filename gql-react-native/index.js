require('dotenv').config()
const {  gql, ApolloServer, UserInputError} = require('apollo-server')
const mongoose = require('mongoose')
const URI = process.env.URI
const bcrypt = require('bcrypt')
const salt = 1
const jwt = require('jsonwebtoken')

console.log(`connecting to ${URI}`)

mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(console.log('connected succesfuly!'))
  .catch(err => console.log({message: err.message}))

const User = require('./models/user')
const { JsonWebTokenError } = require('jsonwebtoken')

const repositories = [
    {
      id: 'jaredpalmer.formik',
      fullName: 'jaredpalmer/formik',
      description: 'Build forms in React, without the tears',
      language: 'TypeScript',
      forksCount: 1589,
      stargazersCount: 21553,
      ratingAverage: 88,
      reviewCount: 4,
      ownerAvatarUrl: 'https://avatars2.githubusercontent.com/u/4060187?v=4',
    },
    {
      id: 'rails.rails',
      fullName: 'rails/rails',
      description: 'Ruby on Rails',
      language: 'Ruby',
      forksCount: 18349,
      stargazersCount: 45377,
      ratingAverage: 100,
      reviewCount: 2,
      ownerAvatarUrl: 'https://avatars1.githubusercontent.com/u/4223?v=4',
    },
    {
      id: 'django.django',
      fullName: 'django/django',
      description: 'The Web framework for perfectionists with deadlines.',
      language: 'Python',
      forksCount: 21015,
      stargazersCount: 48496,
      ratingAverage: 73,
      reviewCount: 5,
      ownerAvatarUrl: 'https://avatars2.githubusercontent.com/u/27804?v=4',
    },
    {
      id: 'reduxjs.redux',
      fullName: 'reduxjs/redux',
      description: 'Predictable state container for JavaScript apps',
      language: 'TypeScript',
      forksCount: 13902,
      stargazersCount: 52869,
      ratingAverage: 0,
      reviewCount: 0,
      ownerAvatarUrl: 'https://avatars3.githubusercontent.com/u/13142323?v=4',
    },
  ];

const typeDefs = gql`

  type Repositories {
      id: String,
      fullName: String,
      description: String,
      language: String,
      forksCount: Int,
      stargazersCount: Int,
      ratingAverage: Int,
      reviewCount: Int,
      ownerAvatarUrl: String
  }

    
    
    type Query {
        repositories: [Repositories]
    }

    type User {
        username: String
        password: String
        id: String
    }
    type Token{
        value: String
    }

    type Message {
        message: String
    }

    type Mutation {
        register(
            username: String
            password: String
        ): Message

        login(
            username: String
            password: String
        ): Token
    }

    
`


const resolvers = {
    Query: {
        repositories: () => repositories
    },
    Mutation: {
        register: async (root, args) => {
            try{    
                const passwordHash = await bcrypt.hash(args.password, salt)
                const user = new User({
                    username: args.username,
                    password: passwordHash
                })
                await user.save()
                return {message: 'registered succesfuly'}
            }catch(err){
                return new UserInputError(err.message)
            }
        },
        login: async (root,args) => {
            try{
                const user = await User.findOne({username: args.username})
                const passwordIsCorrect = user === null
                ? false
                : await bcrypt.compare(args.password, user.password)
                
                if(!(user && passwordIsCorrect)){
                    return new UserInputError('validation error')
                }

                const {username, id} = user

                const token = jwt.sign(
                    {username,id},
                    process.env.SECRET,
                    {expiresIn: 100*100}
                )

                return {value: token}
            }catch(err){
                console.log({message:err.message})
            }
        }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers
})


server.listen(3000, () => console.log('apolloServer is running at port 3000'))