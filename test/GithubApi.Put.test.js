const agent = require('superagent');

const statusCode = require('http-status-codes');
const chai = require('chai');
const chaiSubset = require('chai-subset');
const { before } = require('mocha');

const { expect } = chai;
chai.use(chaiSubset);

const baseUrl = 'https://api.github.com/user/following';
const userToFollow = 'aperdomob';

describe('Test PUT request on github API', async () => {
  describe(`Given the url ${baseUrl} to follow a new user`, () => {
    describe(`When make PUT request to ${baseUrl}`, () => {
      let followUserResponse;

      before(async () => {
        followUserResponse = await agent.put(`${baseUrl}/${userToFollow}`).auth('token', process.env.ACCESS_TOKEN)
          .set('User-Agent', 'agent');
      });

      it('Then respond with status 204 and empty body', () => {
        expect(followUserResponse.statusCode).to.equal(statusCode.StatusCodes.NO_CONTENT);
        expect(followUserResponse.body).to.eql({});
      });

      describe(`And ${userToFollow} is being followed`, () => {
        describe('When checks the list of users being followed', () => {
          let usersFollowingResponse;

          before(async () => {
            usersFollowingResponse = await agent.get(baseUrl).auth('token', process.env.ACCESS_TOKEN)
              .set('User-Agent', 'agent');
          });

          it(`Then ${userToFollow} should be on the list`, () => {
            expect(usersFollowingResponse.body).to.containSubset([{
              login: userToFollow
            }]);
          });
          describe('And when makes the same PUT request to follow the user again', () => {
            before(async () => {
              followUserResponse = await agent.put(`${baseUrl}/${userToFollow}`).auth('token', process.env.ACCESS_TOKEN)
                .set('User-Agent', 'agent');
            });

            it('Then respond again with status 204 and empty body', () => {
              expect(followUserResponse.statusCode).to.equal(statusCode.StatusCodes.NO_CONTENT);
              expect(followUserResponse.body).to.eql({});
            });

            describe('And when checks again the users being followd', () => {
              before(async () => {
                usersFollowingResponse = await agent.get(baseUrl).auth('token', process.env.ACCESS_TOKEN)
                  .set('User-Agent', 'agent');
              });

              it(`Then ${userToFollow} should be on the list`, () => {
                expect(usersFollowingResponse.body).to.containSubset([{
                  login: userToFollow
                }]);
              });
            });
          });
        });
      });
    });
  });
});
