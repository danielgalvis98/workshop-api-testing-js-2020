const agent = require('superagent');
const agentResponseTime = require('superagent-response-time');

const statusCode = require('http-status-codes');
const chai = require('chai');

const { expect } = chai;

const baseUrl = 'https://api.github.com/users';

describe('Test GET users from github API', () => {
  describe(`Given the url ${baseUrl} to list all github users`, () => {
    let totalResponseTime;
    const callback = (req, time) => {
      totalResponseTime = time;
    };

    const expectedMs = 5000;

    const usersByDefault = 30;

    describe('When makes a GET request to the url', () => {
      let githubUsersResponse;

      before(async () => {
        githubUsersResponse = await agent.get(baseUrl).auth('token', process.env.ACCESS_TOKEN)
          .set('User-Agent', 'agent').use(agentResponseTime(callback));
      });

      it('Then respond with status 200 and in less than 5 seconds, and has 30 elements', () => {
        expect(githubUsersResponse.statusCode).to.equal(statusCode.StatusCodes.OK);
        expect(totalResponseTime).to.most(expectedMs);
        expect(githubUsersResponse.body.length).to.equal(usersByDefault);
      });

      describe('And setting a parameter to get 10 users', () => {
        let usersQuerying = 10;
        let params = {
          per_page: usersQuerying
        };

        describe('When makes the request with those users', () => {
          before(async () => {
            githubUsersResponse = await agent.get(baseUrl).query(params).auth('token', process.env.ACCESS_TOKEN)
              .set('User-Agent', 'agent');
          });

          it(`Then respond with status 200, and has ${usersQuerying} elements`, () => {
            expect(githubUsersResponse.statusCode).to.equal(statusCode.StatusCodes.OK);
            expect(githubUsersResponse.body.length).to.equal(usersQuerying);
          });

          describe('And Setting the parameter to get 50 users', () => {
            usersQuerying = 50;
            params = {
              per_page: usersQuerying
            };

            describe('When makes the request with those users', () => {
              before(async () => {
                githubUsersResponse = await agent.get(baseUrl).query(params).auth('token', process.env.ACCESS_TOKEN)
                  .set('User-Agent', 'agent');
              });

              it(`Then respond with status 200, and has ${usersQuerying} elements`, () => {
                expect(githubUsersResponse.statusCode).to.equal(statusCode.StatusCodes.OK);
                expect(githubUsersResponse.body.length).to.equal(usersQuerying);
              });
            });
          });
        });
      });
    });
  });
});
