const agent = require('superagent');

const statusCode = require('http-status-codes');
const chai = require('chai');

const { expect } = chai;

const baseUrl = 'https://github.com/aperdomob/redirect-test';
const expectedRedirection = 'https://github.com/aperdomob/new-redirect-test';

describe('Test consume HEAD service on github API', () => {
  describe(`Given the URL ${baseUrl}`, () => {
    describe(`When I make a HEAD request to ${baseUrl}`, () => {
      let headRequestResponse;

      before(async () => {
        try {
          await agent.head(baseUrl).auth('token', process.env.ACCESS_TOKEN)
            .set('User-Agent', 'agent');
        } catch (response) {
          headRequestResponse = response;
        }
      });

      it('Then respond with status 301, expected redirection and empty body', () => {
        expect(headRequestResponse.status).to.equal(statusCode.StatusCodes.MOVED_PERMANENTLY);
        expect(headRequestResponse.response.header.location).to.equal(expectedRedirection);
        expect(headRequestResponse.response.body).to.eql({});
      });
    });

    describe(`And makes a GET request also to ${baseUrl}`, () => {
      let getRequestResponse;

      before(async () => {
        getRequestResponse = await agent.get(baseUrl).auth('token', process.env.ACCESS_TOKEN)
          .set('User-Agent', 'agent');
      });

      it('Should redirect correctly', () => {
        expect(getRequestResponse.statusCode).to.equal(statusCode.StatusCodes.OK);
        expect(getRequestResponse.header['content-type']).to.contain('html');
      });
    });
  });
});
