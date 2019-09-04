var express = require('express');
var request = require('request');
var path=require("path");
var config=require("./config");
//使用express搭建服务器
var app= express();
//获取静态页面,用正式服务号需要获取MP_verify_cu5qNTSeMnok6laz.txt，用测试公众号不需要
app.use(express.static(path.join(__dirname, '/assets')));

var port=config.port;
var AppID = config.AppID;
var AppSecret = config.AppSecret;
//征求用户同意时，用户点击按钮之后的url
var server = config.server;


//获取微信用户信息
app.get("/login", function (req, res) {
    var redirect_uri= server+"/userinfo";
    var state=req.query.callback_url;
    //console.log(state);
    // 第一步：用户同意授权，获取code
    res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid='+AppID+'&redirect_uri='+redirect_uri+'&response_type=code&scope=snsapi_userinfo&state='+state+'#wechat_redirect');   
});

//征求用户同意时，用户点击按钮之后的回调
app.get("/userinfo", function (req, res) {
    // 第二步：通过code换取网页授权access_token
    var code = req.query.code;
    var callback_url=req.query.state;
    request.get(
        {
            url: 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + AppID + '&secret=' + AppSecret + '&code=' + code + '&grant_type=authorization_code',
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // 第三步：拉取用户信息(需scope为 snsapi_userinfo)               
                var data = JSON.parse(body);
                var access_token = data.access_token;
                var openid = data.openid;
                request.get(
                    {
                        url: 'https://api.weixin.qq.com/sns/userinfo?access_token=' + access_token + '&openid=' + openid + '&lang=zh_CN',
                    },
                    function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            // 第四步：根据获取的用户信息进行对应操作
                            var userinfo = JSON.parse(body);
                            //console.dir(userinfo);
                            var param='&openid='+userinfo.openid+'&nickname='+userinfo.nickname+'&sex='+userinfo.sex+'&language='+userinfo.language+
                            '&city='+userinfo.city+'&province='+userinfo.province+'&country='+userinfo.country+'&headimgurl='+userinfo.headimgurl;
                            res.redirect(callback_url+param);
                        }
                        else{
                            //错误处理
                            console.log("error 2");
                        }

                    });
            }
            else{
                //错误处理
                console.log("error 1");
            }
        });
});


//监听80端口
app.listen(port, function () {
    console.info("web server start ,port:" + port);
});





/**-------------------------------------测试接口 start---------------------------------------------- */


//测试接口
app.get("/test", function (req, res) {
    //获取用户信息的url
    var login_url=server+'/login';
    //获取到微信信息之后返回的页面路径
    var pagepath=req.query.pagepath; 
    //获取到用户信息的回调url
    var callback_url=server+'/test_callback?pagepath='+pagepath;
    res.redirect(login_url+'?callback_url='+callback_url);
});

//测试回调
app.get("/test_callback", function (req, res) {
   // console.dir(req.query);  
    res.send(req.query);
});
/**-------------------------------------测试接口 end---------------------------------------------- */