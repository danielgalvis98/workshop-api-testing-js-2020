const agent = require('superagent');

const statusCode = require('http-status-codes');
const chai = require('chai');
const chaiSubset = require('chai-subset');

const { expect } = chai;

chai.use(chaiSubset);

const baseUrl = 'https://api.github.com/gists';

describe('Test DELETE on Github API', () => {
  describe(`Given the url ${baseUrl} and user logged in GitHub`, () => {
    describe(`When Make a post request at ${baseUrl} to create a new gist`, () => {
      const promiseToSave = `
        new Promise((resolve) => {
          setTimeout(() => {
            resolve('Promise Solved!');
          }, 250);
        });
        `;

      const gistFile = {
        description: 'A simple gist with a little promise',
        public: true,
        files: {
          'myPromise.js': {
            content: promiseToSave
          }
        }
      };

      let saveGistResponse;
      before('Making the post request', async () => {
        saveGistResponse = await agent.post(baseUrl, gistFile).auth('token', process.env.ACCESS_TOKEN)
          .set('User-Agent', 'agent');
      });

      it('Then respond with status 201 and contain same propertes as the one we uploaded', () => {
        expect(saveGistResponse.statusCode).to.equal(statusCode.StatusCodes.CREATED);
        expect(saveGistResponse.body).to.containSubset(gistFile);
      });

      describe('And now has the URL of the gist created', () => {
        describe('And when make GET request to get details of the gist', () => {
          let gistResponse;

          before(async () => {
            gistResponse = await agent.get(saveGistResponse.body.url).auth('token', process.env.ACCESS_TOKEN)
              .set('User-Agent', 'agent');
          });

          it('Then respond with an existing ressource', () => {
            expect(gistResponse.statusCode).to.equal(statusCode.StatusCodes.OK);
            expect(gistResponse.body).to.containSubset(gistFile);
          });
        });

        describe('And when make a DELETE request to delete the gist', () => {
          let deleteGistResponse;

          before(async () => {
            deleteGistResponse = await agent.delete(saveGistResponse.body.url).auth('token', process.env.ACCESS_TOKEN)
              .set('User-Agent', 'agent');
          });
          it('Then sould respond with status 204', () => {
            expect(deleteGistResponse.statusCode).to.equal(statusCode.StatusCodes.NO_CONTENT);
          });

          describe('And when make another GET request to get details of the gist', () => {
            let gistResponse;

            before(async () => {
              try {
                gistResponse = await agent.get(saveGistResponse.body.url).auth('token', process.env.ACCESS_TOKEN)
                  .set('User-Agent', 'agent');
              } catch (response) {
                gistResponse = response;
              }
            });

            it('Then no resource is found', () => {
              expect(gistResponse.status).to.equal(statusCode.StatusCodes.NOT_FOUND);
            });
          });
        });
      });
    });
  });
});
