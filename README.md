[![GitHub issues](https://img.shields.io/github/issues-raw/phamleduy04/chatvoinguoila?style=for-the-badge)](https://github.com/phamleduy04/chatvoinguoila/issues)
![Travis (.org)](https://img.shields.io/travis/phamleduy04/chatvoinguoila?label=TRAVIS-CI&logo=TRAVIS&style=for-the-badge)
[![David](https://img.shields.io/david/phamleduy04/chatvoinguoila?style=for-the-badge)](https://david-dm.org/phamleduy04/chatvoinguoila)
[![Visits Badge](https://badges.pufler.dev/visits/phamleduy04/chatvoinguoila?style=for-the-badge)](https://badges.pufler.dev)
![GitHub top language](https://img.shields.io/github/languages/top/phamleduy04/chatvoinguoila?style=for-the-badge)
![Codacy grade](https://img.shields.io/codacy/grade/539e40b766a9447990aae86726318ed5?style=for-the-badge)
![Scrutinizer code quality (GitHub/Bitbucket)](https://img.shields.io/scrutinizer/quality/g/phamleduy04/chatvoinguoila?style=for-the-badge)
![Node.js CI](https://github.com/phamleduy04/chatvoinguoila/workflows/Node.js%20CI/badge.svg)

## Hướng dẫn cách chạy bot
1. Tải và cài đặt [NodeJS](https://nodejs.org/en/) (LTS)
2. Clone [repo]([https://github.com/phamleduy04/chatvoinguoila](https://github.com/phamleduy04/chatvoinguoila)) này về máy tính của bạn.
3. Vào [Facebook Developer]([http://developers.facebook.com](http://developers.facebook.com/)), chọn My Apps -> Create App
4. Đặt tên app
5. Sau đó vào phần Setup trên Messenger. [Hình ảnh](https://github.com/phamleduy04/chatvoinguoila/blob/master/assets/msg.png?raw=true)
6. Add trang của bạn vào. [Hình ảnh](https://raw.githubusercontent.com/phamleduy04/chatvoinguoila/master/assets/add%20page.png)
7. Bấm vào nút Generate Token (Copy vào phần MESSENGER_ACCESS_TOKEN) [Hình ảnh](https://github.com/phamleduy04/chatvoinguoila/blob/master/assets/gen%20token.png?raw=true)
8. Lấy Page ID (Copy vào phần MESSENGER_PAGE_ID) [Hình ảnh](https://github.com/phamleduy04/chatvoinguoila/blob/master/assets/page%20id.png?raw=true)
9. Lấy APP_ID và APP_SECRET (Chọn Settings -> Basic) 
10. Phần VERIFY_TOKEN sẽ là bạn tự đặt. 
11. Đổi tên file .env.example thành .env.
12. Setup Redis (có 2 cách)
- Cách 1: Chạy Redis trên máy tính của chính bạn. [Hướng dẫn](https://github.com/phamleduy04/chatvoinguoila#c%C3%A1ch-c%C3%A0i-%C4%91%E1%BA%B7t-redis)
- Cách 2: Chạy Redis trên Heroku. [Hướng dẫn](https://github.com/phamleduy04/chatvoinguoila#c%C3%A1ch-setup-redis-tr%C3%AAn-heroku)
13. Thay đổi file .env
```
MESSENGER_PAGE_ID=
MESSENGER_ACCESS_TOKEN= 
MESSENGER_APP_ID=  
MESSENGER_APP_SECRET=  
MESSENGER_VERIFY_TOKEN=
``` 
14. Chạy lệnh `npm run dev`
15. Sau đó tạo 1 terminal mới và nhập lệnh `npm run setprofile` và `npm run setwebhook`
## Cách cài đặt Redis
**Nếu các bạn đã sử dụng Redis trên Heroku thì không cần bước này**
- Windows: [Link hướng dẫn](https://redislabs.com/blog/redis-on-windows-10/)
- Linux: [Link tải](https://redis.io/download)


## Cách setup Redis trên Heroku
**Nếu các bạn đã cài đặt Redis thì không cần bước này**
1. Vào [Heroku](https://www.heroku.com/) và tạo 1 app
2. Chọn phần "Resources" sau đó add addon có tên là "Redis To Go"
3. Sau khi add xong thì vào phần "Settings" -> "Reveal Config Vars"
4. Copy phần REDISTOGO_URL vào file .env
```
REDISTOGO_URL=
```
## Báo lỗi và góp ý
Các bạn có thể tạo [PR (Pull request)](https://github.com/phamleduy04/chatvoinguoila/pulls) hoặc [issue](https://github.com/phamleduy04/chatvoinguoila/issues).

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/phamleduy04"><img src="https://avatars2.githubusercontent.com/u/32657584?v=4" width="100px;" alt=""/><br /><sub><b>Duy Pham Le</b></sub></a><br /><a href="https://github.com/phamleduy04/chatvoinguoila/issues?q=author%3Aphamleduy04" title="Bug reports">🐛</a> <a href="https://github.com/phamleduy04/chatvoinguoila/commits?author=phamleduy04" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
