module.exports = {
  session: {
    driver: 'file',
    stores: {
      memory: {
        maxSize: 500,
      },
      file: {
        dirname: '.sessions',
      },
    },
  },
  initialState: {},
  channels: {
    messenger: {
      fields: ['messages', 'messaging_postbacks'],
      enabled: true,
      path: '/webhooks/messenger',
      pageId: process.env.MESSENGER_PAGE_ID,
      accessToken: process.env.MESSENGER_ACCESS_TOKEN,
      appId: process.env.MESSENGER_APP_ID,
      appSecret: process.env.MESSENGER_APP_SECRET,
      verifyToken: process.env.MESSENGER_VERIFY_TOKEN,
      profile: {
        getStarted: {
          payload: 'GET_STARTED',
        },
        persistentMenu: [
          {
            locale: 'default',
            composerInputDisabled: false,
            callToActions: [
              {
                type: 'postback',
                title: 'Bắt đầu chat',
                payload: 'START_MATCHING',
              },
              {
                type: 'web_url',
                title: 'Báo lỗi?',
                url: 'https://github.com/phamleduy04/chatvoinguoila',
              },
            ],
          },
        ],
      },
    },
  },
};
