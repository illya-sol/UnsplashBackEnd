import bcrypt from 'bcryptjs'
import faker from 'faker'
import { Connection } from "typeorm"
import { User } from '../../../entity/users'
import { graphCall } from '../../../test-utils/gCall'
import { testConn } from "../../../test-utils/testConfig"
import { unsplashOutput } from '../inputs/unsplashOutput'

let connection: Connection

beforeAll(async () => {
    connection = await testConn()
})

afterAll(async () => {
    await connection.close()
})

const listPhotosQuery = `
query ListPhotos($data: unsplashInput!){
    listPhotos(
      data: $data
    ) {
      id
      width
      height
      description
      alt_description
      urls{
          raw
          full
          regular
          small
          thumb
      }
      likes
      user {
          id
          username
          name
          bio
          location
      }
    }
  }
`

describe("List photos", () => {
    it("should get list of photos", async () => {
        const user = await User.create({
            username: faker.internet.userName(),
            email: faker.internet.email(),
            password: await bcrypt.hash(faker.internet.password(), 12),
            confirmed: true
        }).save()

        const response = await graphCall({
            source: listPhotosQuery,
            variableValues: {
                data: {
                    page: 1,
                    perPage: 2,
                    orderBy: "asc"
                }
            },
            userId: user.id
        })

        let out: [unsplashOutput] = response.data!.listPhotos as [unsplashOutput]

        out.map(element => {
            expect(element).toMatchObject({
                id: element.id
            })
        });
    })

    it("should return null", async () => {
        const user = await User.create({
            username: faker.internet.userName(),
            email: faker.internet.email(),
            password: await bcrypt.hash(faker.internet.password(), 12),
            confirmed: true
        }).save()

        const response = await graphCall({
            source: listPhotosQuery,
            variableValues: {
                data: {
                    page: 1,
                    perPage: 1,
                    orderBy: "asc"
                }
            },
            userId: user.id
        })

        expect(response).toMatchObject({
            data: {
                listPhotos: []
            }
        })
    })
})