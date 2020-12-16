const agent = require('superagent');
const statusCode = require('http-status-codes');
const chai = require('chai');

const { expect } = chai;

const baseUrl = 'https://api.github.com/user';
const repoName = 'Competitive-Programming';

describe('Test Issues managing with githuh api', () => {
  describe(`GIVEN the url ${baseUrl} to check logged user information`, () => {
    describe('WHEN makes a get request to the url', () => {
      let userResponse;
      before(async () => {
        userResponse = await agent.get(baseUrl).auth('token', process.env.ACCESS_TOKEN)
          .set('User-Agent', 'agent');
      });
      it('SHOULD respond with status 200 and have at least 1 public repository', () => {
        expect(userResponse.statusCode).to.equal(statusCode.StatusCodes.OK);
        expect(userResponse.body.public_repos).to.greaterThan(0);
      });
      describe('And GIVEN the info of the user making the request', () => {
        describe('WHEN makes a request to get all the repos from the user', () => {
          let reposResponse;
          before(async () => {
            reposResponse = await agent.get(userResponse.body.repos_url).auth('token', process.env.ACCESS_TOKEN)
              .set('User-Agent', 'agent');
          });
          describe(`AND finds the repo named ${repoName}`, () => {
            const repoDescription = 'Exercises of competitive programming solved';
            let repository;
            before(async () => {
              repository = await reposResponse.body.find((repo) => repo.name === repoName);
            });
            it('SHOULD have the expected name, description and not be private', () => {
              expect(repository.name).to.equal(repoName);
              expect(repository.description).to.equal(repoDescription);
              expect(repository.private).to.equal(false);
            });

            describe(`AND GIVEN the selected repository named ${repoName}`, () => {
              describe('WHEN makes POST request to create an issue', () => {
                let issueResponse;
                const issueToCreate = {
                  title: 'Issue created with API'
                };
                before(async () => {
                  issueResponse = await agent.post(`${repository.url}/issues`).send(issueToCreate).auth('token', process.env.ACCESS_TOKEN)
                    .set('User-Agent', 'agent');
                });
                it('SHOULD respond with status 201, have same title and empty body', () => {
                  expect(issueResponse.statusCode).to.equal(statusCode.StatusCodes.CREATED);
                  expect(issueResponse.body.title).to.equal(issueToCreate.title);
                  expect(issueResponse.body.body).to.be.a('null');
                });

                describe('AND GIVEN the issue we just created', () => {
                  describe('WHEN make a PATCH request to add a body to the issue', () => {
                    let patchResponse;
                    const propertiesToPatch = {
                      body: 'The body of this issue was added with the api'
                    };
                    before(async () => {
                      patchResponse = await agent.patch(issueResponse.body.url).send(propertiesToPatch).auth('token', process.env.ACCESS_TOKEN)
                        .set('User-Agent', 'agent');
                    });
                    it('SHOULD has status 200, conserve the same title and have the new body', () => {
                      expect(patchResponse.statusCode).to.equal(statusCode.StatusCodes.OK);
                      expect(patchResponse.body.title).to.equal(issueToCreate.title);
                      expect(patchResponse.body.body).to.equal(propertiesToPatch.body);
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
