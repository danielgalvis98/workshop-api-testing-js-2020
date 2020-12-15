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
  describe('Get User Information', () => {
    let userResponse;
    before(async () => {
      userResponse = await agent.get(baseUrl)
        .auth('token', process.env.ACCESS_TOKEN)
        .set('User-Agent', 'agent');
    });
    it('Should has status 200 and contain basic information', () => {
      expect(userResponse.status).to.equal(statusCode.StatusCodes.OK);
      expect(userResponse.body.name).to.equal('Alejandro Perdomo');
      expect(userResponse.body.company).to.equal('PSL');
      expect(userResponse.body.location).to.equal('Colombia');
    });
    describe('Search jasmine-awesome-report repository', () => {
      let jasmineRepository;
      const repoDescription = 'An awesome html report for Jasmine';
      before(async () => {
        const reposResponse = await agent.get(userResponse.body.repos_url).auth('token', process.env.ACCESS_TOKEN)
          .set('User-Agent', 'agent');

        jasmineRepository = await reposResponse.body.find(
          (repository) => repository.name === repositoryName
        );
      });
      it('Should has expected name and descriptions and not be private', () => {
        expect(jasmineRepository.name).to.equal(repositoryName);
        expect(jasmineRepository.private).to.equal(false);
        expect(jasmineRepository.description).to.equal(repoDescription);
      });

      describe('And downloads the repository as zip', () => {
        let downloadedFile;
        before(async () => {
          downloadedFile = await agent.get(jasmineRepository.archive_url.replace('{archive_format}{/ref}', 'zipball')).auth('token', process.env.ACCESS_TOKEN)
            .set('User-Agent', 'agent');
        });

        it('Verify downloaded correctly', () => {
          expect(downloadedFile.status).to.equal(statusCode.StatusCodes.OK);
          expect(downloadedFile.header['content-type']).to.equal('application/zip');
          expect(downloadedFile.header['content-disposition']).to.include('.zip');
        });
      });
      describe('And gets the README.md file from the repository', () => {
        let repoFiles;
        before(async () => {
          repoFiles = await agent.get(jasmineRepository.contents_url.replace('/{+path}', '')).auth('token', process.env.ACCESS_TOKEN)
            .set('User-Agent', 'agent');
        });
        it('Verify contains README file', () => {
          expect(repoFiles.body).to.containSubset(
            [{ name: 'README.md', path: 'README.md', sha: 'b9900ca9b34077fe6a8f2aaa37a173824fa9751d' }]
          );
        });

        describe('And downloads the README file', () => {
          let readmeInfo;
          let readmeFile;
          const md5Readme = '3449c9e5e332f1dbb81505cd739fbf3f';
          before(async () => {
            readmeInfo = await repoFiles.body.find((file) => file.name === 'README.md');
            readmeFile = await agent.get(readmeInfo.download_url).auth('token', process.env.ACCESS_TOKEN)
              .set('User-Agent', 'agent');
          });
          it('Should has md5 correct', () => {
            expect(readmeFile.status).to.equal(statusCode.StatusCodes.OK);
            expect(readmeFile.header['content-type']).to.equal('text/plain; charset=utf-8');
            expect(md5(readmeFile.body)).to.equal(md5Readme);
          });
        });
      });
    });
  });
});
