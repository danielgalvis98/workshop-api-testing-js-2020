const agent = require('superagent');

const statusCode = require('http-status-codes');
const chai = require('chai');

const { expect } = chai;

const baseUrl = 'https://api.github.com/user';
const repoName = 'Competitive-Programming';

describe('Test Issues managing with githuh api', () => {
  describe(`Given the url ${baseUrl} to check logged user information`, () => {
    describe('When makes a get request to the url', () => {
      let userResponse;

      before(async () => {
        userResponse = await agent.get(baseUrl).auth('token', process.env.ACCESS_TOKEN)
          .set('User-Agent', 'agent');
      });

      it('Then respond with status 200 and have at least 1 public repository', () => {
        expect(userResponse.statusCode).to.equal(statusCode.StatusCodes.OK);
        expect(userResponse.body.public_repos).to.greaterThan(0);
      });

      describe('And the info of the user making the request', () => {
        describe('When makes a request to get all the repos from the user', () => {
          let reposResponse;

          before(async () => {
            reposResponse = await agent.get(userResponse.body.repos_url).auth('token', process.env.ACCESS_TOKEN)
              .set('User-Agent', 'agent');
          });

          describe(`And finds the repo named ${repoName}`, () => {
            const repoDescription = 'Exercises of competitive programming solved';
            let repository;

            before(async () => {
              repository = await reposResponse.body.find((repo) => repo.name === repoName);
            });

            it('Then response has the expected name, description and not be private', () => {
              expect(repository.name).to.equal(repoName);
              expect(repository.description).to.equal(repoDescription);
              expect(repository.private).to.equal(false);
            });

            describe(`And the selected repository named ${repoName}`, () => {
              describe('When makes POST request to create an issue', () => {
                let issueResponse;
                const issueToCreate = {
                  title: 'Issue created with API'
                };

                before(async () => {
                  issueResponse = await agent.post(`${repository.url}/issues`).send(issueToCreate).auth('token', process.env.ACCESS_TOKEN)
                    .set('User-Agent', 'agent');
                });

                it('Then response has status 201, same title and empty body', () => {
                  expect(issueResponse.statusCode).to.equal(statusCode.StatusCodes.CREATED);
                  expect(issueResponse.body.title).to.equal(issueToCreate.title);
                  expect(issueResponse.body.body).to.be.a('null');
                });

                describe('And the issue we just created', () => {
                  describe('When make a PATCH request to add a body to the issue', () => {
                    let patchResponse;
                    const propertiesToPatch = {
                      body: 'The body of this issue was added with the api'
                    };

                    before(async () => {
                      patchResponse = await agent.patch(issueResponse.body.url).send(propertiesToPatch).auth('token', process.env.ACCESS_TOKEN)
                        .set('User-Agent', 'agent');
                    });

                    it('Then response has status 200, conserve the same title and have the new body', () => {
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
