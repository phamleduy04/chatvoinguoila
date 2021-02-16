module.exports = {
  session: {
    driver: 'file',
    stores: {
      memory: {
        maxSize: 1000,
      },
      file: {
        dirname: '.sessions',
      },
    },
  },
  initialState: {},
  channels: {
    messenger: {
      fields: ['messages', 'messaging_postbacks', 'message_reactions'],
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
                title: 'Tìm kiếm',
                payload: 'START_MATCHING',
              },
              {
                type: 'web_url',
                title: 'Báo lỗi và góp ý',
                url: 'https://forms.gle/RHg7wA9Ybs9prkd98',
              },
              {
                type: 'web_url',
                title: 'Báo cáo người khác',
                url: 'https://forms.gle/kQuwrZ2NDdXuki2n9',
              },
            ],
          },
        ],
      },
    },
  },
};
