const agent = require('superagent');
const statusCode = require('http-status-codes');
const chai = require('chai');
const chaiSubset = require('chai-subset');
const md5 = require('md5');

chai.use(chaiSubset);

const { expect } = chai;

const baseUrl = 'https://api.github.com/users/aperdomob';
const repositoryName = 'jasmine-awesome-report';

describe('Test GitHub API', () => {
  describe(`GIVEN the url ${baseUrl} from a github user`, () => {
    let userResponse;
    describe(`WHEN makes a GET request to ${baseUrl}`, () => {
      before(async () => {
        userResponse = await agent.get(baseUrl)
          .auth('token', process.env.ACCESS_TOKEN)
          .set('User-Agent', 'agent');
      });
      it('THEN response should has status 200 and name, company and location should be the expected ones', () => {
        expect(userResponse.status).to.equal(statusCode.StatusCodes.OK);
        expect(userResponse.body.name).to.equal('Alejandro Perdomo');
        expect(userResponse.body.company).to.equal('PSL');
        expect(userResponse.body.location).to.equal('Colombia');
      });
    });
    describe(`AND GIVEN the repository named ${repositoryName} owned by the user`, () => {
      let jasmineRepository;
      describe('WHEN makes a GET request to property repos_url from the user using hypermedia', () => {
        const repoDescription = 'An awesome html report for Jasmine';
        let reposResponse;
        before(async () => {
          reposResponse = await agent.get(userResponse.body.repos_url).auth('token', process.env.ACCESS_TOKEN)
            .set('User-Agent', 'agent');
        });
        describe(`AND finds the repo named ${repositoryName}`, () => {
          before(async () => {
            jasmineRepository = await reposResponse.body.find(
              (repository) => repository.name === repositoryName
            );
          });
          it('THEN response should has expected name and descriptions and not be private', () => {
            expect(jasmineRepository.name).to.equal(repositoryName);
            expect(jasmineRepository.private).to.equal(false);
            expect(jasmineRepository.description).to.equal(repoDescription);
          });
        });
      });
      describe(`AND GIVEN the repository ${repositoryName}`, () => {
        describe('WHEN makes a GET request using hypermedia to download the repository as a zip', () => {
          let downloadedFile;
          before(async () => {
            downloadedFile = await agent.get(jasmineRepository.archive_url.replace('{archive_format}{/ref}', 'zipball')).auth('token', process.env.ACCESS_TOKEN)
              .set('User-Agent', 'agent');
          });

          it('SHOULD verify that the header of the response corresponds to a request to download a zip file', () => {
            expect(downloadedFile.status).to.equal(statusCode.StatusCodes.OK);
            expect(downloadedFile.header['content-type']).to.equal('application/zip');
            expect(downloadedFile.header['content-disposition']).to.include('.zip');
          });
        });
        describe('AND WHEN make a GET request using hypermedia to get all the files from the repository', () => {
          let repoFiles;
          before(async () => {
            repoFiles = await agent.get(jasmineRepository.contents_url.replace('/{+path}', '')).auth('token', process.env.ACCESS_TOKEN)
              .set('User-Agent', 'agent');
          });
          it('THEN there is a README.md file with expected path and sha', () => {
            expect(repoFiles.body).to.containSubset(
              [{ name: 'README.md', path: 'README.md', sha: 'b9900ca9b34077fe6a8f2aaa37a173824fa9751d' }]
            );
          });
          describe('AND GIVEN all the files from the repository', () => {
            let readmeInfo;
            let readmeFile;
            const md5Readme = '3449c9e5e332f1dbb81505cd739fbf3f';
            describe('WHEN finds the file named README.md', () => {
              before(async () => {
                readmeInfo = await repoFiles.body.find((file) => file.name === 'README.md');
              });
              describe('AND makes  GET request to download the README file using hypermedia', () => {
                before(async () => {
                  readmeFile = await agent.get(readmeInfo.download_url).auth('token', process.env.ACCESS_TOKEN)
                    .set('User-Agent', 'agent');
                });
                it('THEN response has to be a plain text and md5 of the file be the expected one', () => {
                  expect(readmeFile.status).to.equal(statusCode.StatusCodes.OK);
                  expect(readmeFile.header['content-type']).to.equal('text/plain; charset=utf-8');
                  expect(md5(readmeFile.body)).to.equal(md5Readme);
                });
              });
            });
          });
        });
      });
    });
  });
});
