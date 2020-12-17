const agent = require('superagent');
const agentResponseTime = require('superagent-response-time');

const statusCode = require('http-status-codes');
const chai = require('chai');

const { expect } = chai;

const baseUrl = 'https://github.com/users';

describe('Test response time from github API', () => {
  describe(`Given the url ${baseUrl} to list all github users`, () => {
    let totalResponseTime;
    const callback = (req, time) => {
      totalResponseTime = time;
    };

    describe('When makes a GET request to the url', () => {
      let githubUsersResponse;

      before(async () => {
        githubUsersResponse = await agent.get(baseUrl).use(agentResponseTime(callback));
      });

      it('Then respond with status 200 and in less than 5 seconds', () => {
        expect(githubUsersResponse.statusCode).to.equal(statusCode.StatusCodes.OK);
        expect(totalResponseTime).to.most(5000);
      });
    });
  });
});
