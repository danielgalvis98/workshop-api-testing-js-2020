const listPublicEventsSchema = {
  title: 'List public Events from github API Schema',
  type: 'object',
  required: ['statusCode', 'header', 'body'],
  properties: {
    statusCode: {
      type: 'number',
      minimum: 100,
      maximum: 599
    },
    header: {
      type: 'object'
    },
    body: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['id', 'type', 'actor', 'repo', 'payload', 'public', 'created_at'],
        properties: {
          id: {
            type: 'string'
          },
          type: {
            type: 'string',
            enum: ['CreateEvent', 'PushEvent', 'WatchEvent', 'DeleteEvent', 'PullRequestReviewEvent', 'IssueCommentEvent', 'PullRequestEvent']
          },
          actor: {
            type: 'object',
            required: ['id', 'url']
          },
          repo: {
            type: 'object',
            required: ['id', 'url']
          },
          payload: {
            type: 'object'
          },
          public: {
            type: 'boolean'
          },
          created_at: {
            type: 'string'
          }
        }

      }
    }
  }
};

exports.listPublicEventsSchema = listPublicEventsSchema;
