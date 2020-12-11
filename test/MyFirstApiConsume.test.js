const agent = require('superagent');
const statusCode = require('http-status-codes');
const chai = require('chai');

const { expect } = chai;

const baseUrl = 'https://httpbin.org';

describe('First Api Tests', () => {
  it('Consume GET Service', async () => {
    const response = await agent.get(`${baseUrl}/ip`);

    expect(response.status).to.equal(statusCode.OK);
    expect(response.body).to.have.property('origin');
  });

  it('Consume GET Service with query parameters', async () => {
    const query = {
      name: 'John',
      age: '31',
      city: 'New York'
    };

    const response = await agent.get(`${baseUrl}/get`).query(query);

    expect(response.status).to.equal(statusCode.OK);
    expect(response.body.args).to.eql(query);
  });

  it('Consume PATCH Service', async () => {
    const query = {
      name: 'John',
      age: '31',
      city: 'New York'
    };

    const response = await agent.patch(`${baseUrl}/patch`).query(query);

    expect(response.status).to.equal(statusCode.OK);
    expect(response.body).to.have.property('origin');
    expect(response.body.args).to.eql(query);
  });

  it('Consume PUT Service', async () => {
    const query = {
      name: 'John',
      age: '31',
      city: 'New York'
    };

    const response = await agent.put(`${baseUrl}/put`).query(query);

    expect(response.status).to.equal(statusCode.OK);
    expect(response.body).to.have.property('origin');
    expect(response.body.args).to.eql(query);
  });

  it('Consume DELETE Service', async () => {
    const query = {
      name: 'John',
      age: '31',
      city: 'New York'
    };

    const response = await agent.delete(`${baseUrl}/delete`).query(query);

    expect(response.status).to.equal(statusCode.OK);
    expect(response.body).to.have.property('origin');
    expect(response.body.args).to.eql(query);
  });

  it('Consume HEAD Service', async () => {
    const query = {
      name: 'John',
      age: '31',
      city: 'New York'
    };

    const response = await agent.head(`${baseUrl}/get`).query(query);

    expect(response.status).to.equal(statusCode.OK);
    expect(response.header.connection).to.equal('close');
  });
});
