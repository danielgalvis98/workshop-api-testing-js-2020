const fetch = require('isomorphic-fetch');

const statusCode = require('http-status-codes');
const chai = require('chai');
const chaiSubset = require('chai-subset');

const { expect } = chai;

chai.use(chaiSubset);

const baseUrl = 'https://api.github.com/gists';

describe('Test DELETE on Github API', () => {
  describe(`Given the url ${baseUrl} and user logged in GitHub`, () => {
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

    describe(`When Make a post request at ${baseUrl} to create a new gist`, () => {
      let saveGistResponse;
      let saveGistBody;
      before('Making the post request', async () => {
        saveGistResponse = await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'User-Agent': 'agent',
            Authorization: `bearer ${process.env.ACCESS_TOKEN}`
          },
          body: JSON.stringify(gistFile)
        });

        saveGistBody = await saveGistResponse.json();
      });

      it('Then respond with status 201 and contain same propertes as the one we uploaded', () => {
        expect(saveGistResponse.status).to.equal(statusCode.StatusCodes.CREATED);
        expect(saveGistBody).to.containSubset(gistFile);
      });

      describe('And now has the URL of the gist created', () => {
        describe('when make GET request to get details of the gist', () => {
          let gistResponse;
          let gistBody;
          before(async () => {
            gistResponse = await fetch(saveGistBody.url, {
              method: 'GET',
              headers: {
                'User-Agent': 'agent',
                Authorization: `bearer ${process.env.ACCESS_TOKEN}`
              }
            });

            gistBody = await gistResponse.json();
          });

          it('Then respond with an existing ressource', () => {
            expect(gistResponse.status).to.equal(statusCode.StatusCodes.OK);
            expect(gistBody).to.containSubset(gistFile);
          });
        });

        describe('And make a DELETE request to delete the gist', () => {
          let deleteGistResponse;

          before(async () => {
            deleteGistResponse = await fetch(saveGistBody.url, {
              method: 'DELETE',
              headers: {
                'User-Agent': 'agent',
                Authorization: `bearer ${process.env.ACCESS_TOKEN}`
              }
            });
          });
          it('Then sould respond with status 204', () => {
            expect(deleteGistResponse.status).to.equal(statusCode.StatusCodes.NO_CONTENT);
          });

          describe('And make another GET request to get details of the gist', () => {
            let gistResponse;

            before(async () => {
              gistResponse = await fetch(saveGistBody.url, {
                method: 'GET',
                headers: {
                  'User-Agent': 'agent',
                  Authorization: `bearer ${process.env.ACCESS_TOKEN}`
                }
              });
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
