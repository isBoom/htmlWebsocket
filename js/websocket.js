//发送信息
var socket
var localId=0;
var localVerification="0"
var nowChat;//指示当前群聊节点
var nowChatNum=0;  // 0群聊模式 1私聊模式
$(function() {
  var userInfo = new Map();
  var toBeSendImg_p;
  // 创建一个Socket实例
  socket = new WebSocket("wss://xxxholic.top:8088/ws")
  // 打开Socket
  socket.onopen = function(event) {

    var arr,reg=new RegExp("(^| )"+"userId"+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
      localId=(arr[2]);

    var arr,reg=new RegExp("(^| )"+"verification"+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
      localVerification=(arr[2]);
    // 监听消息
    socket.onmessage = function(event) {
      switch (JSON.parse(event.data).status){
        case 0:
            alert(JSON.parse(event.data).msg)
            break;
        case 10 :case 20:
            //10 cookie错误
            //20 账号已登录
            alert(JSON.parse(event.data).msg)
            window.location.href = "https://xxxholic.top/login.html";
            break
        case 30:
            //没有cookie
            window.location.href = "https://xxxholic.top/login.html";
            break;
        case 100:
            //系统通知
            update(JSON.parse(event.data).msg)
            break;
        case 110:
            //登录后收到的第一条消息 证明登陆成功
            //存储在线用户信息
            saveOnlineData(JSON.parse(event.data).user)
            break;
        case 120:
            //新用户上线 存储在线用户列表
            saveNewOnlieUser(JSON.parse(event.data).user[0])
            break;
        case 130:
              //用户离线
              delOnlieUser(JSON.parse(event.data))
              break;
        case 200:
            //普通用户消息
            simpleMsg(JSON.parse(event.data).uid, JSON.parse(event.data).userName,JSON.parse(event.data).msg,$(".groupChat .pgroupChat"))
            break;
        case 210:
            //不发图等着做遗产吗
            imgMsg(JSON.parse(event.data).uid, JSON.parse(event.data).userName,JSON.parse(event.data).msg,$(".groupChat .pgroupChat"))
            if(JSON.parse(event.data).uid==localId){
              $(".content~p").remove();
            }
            break;
        case 311:
            //改头换命
            alert("修复头像失败")
            console.log(JSON.parse(event.data).msg)
            break
        case 312:
          //改头换命
            ChangeUserHeadPortraitOk(JSON.parse(event.data).user[0])
            break
        case 400:
          //私信
          simpleMsg(JSON.parse(event.data).uid, userInfo.get(JSON.parse(event.data).uid).userName,JSON.parse(event.data).msg,$(".personChat.id"+JSON.parse(event.data).uid+" .personChatTitle"))
            //PrivateChatFromOther(JSON.parse(event.data).msg)
          break
        case 401:
          //自己发送的私信
          simpleMsg(Number(localId), userInfo.get(Number(localId))["userName"],JSON.parse(event.data).msg,$(".personChat.id"+JSON.parse(event.data).uid+" .personChatTitle"))
            //PrivateChatFromMe(JSON.parse(event.data).msg)
            break
      }
      
    }
  }
  socket.onerror = function(event) {
    console.log(event)
    window.location.href = "https://xxxholic.top/login.html"
  }

  $("#sub").click(function(e) {
    if ($(".indexText").val() != "") {
       if(nowChatNum==0){ //群聊模式
        socket.send(JSON.stringify({"status":200,"msg":$(".indexText").val()}))
      }else{
        var temp=(nowChat[0].id).slice(2)
        var uid = Number(temp)
        socket.send(JSON.stringify({"status":400,"uid":uid,"msg":$(".indexText").val()}))
      }
      
      $(".indexText").val("")
    }
    e.preventDefault() 
  })
  //点击发送图片之后模拟点击input type=file按钮
  $(".sendImg").click(function(e){
    $(".sendImgBox")[0].click();
  })
  //修改头像
  $(".changeUserHeadPortrait").click(function(e){
    $(".changeUserHeadPortraitBox")[0].click();
  })
  //离开
  $(".safeLeave").click(function(e){
    var d = new Date();
		d.setTime(d.getTime() - 10000);
    document.cookie = "userId" + '=1; expires=' + d.toGMTString();
    document.cookie = "verification" + '=1; expires=' + d.toGMTString();
    window.location.href = "https://xxxholic.top/login.html"
  })
  //返回群聊
  $(".backGroupChat").click(function(){
    if(nowChatNum==1){
      nowChat.hide()
      nowChat=$(".groupChat");
      nowChat.show()
      nowChatNum=0;
      for(var i=1;i<nowChat[0].childNodes.length;i++){
        nowChat[0].childNodes[i].style.height="100%";
      }
    }
  })
  //插入信息
  function update(msg) {
    var div = document.createElement("div")
    div.style.marginTop="20px";
    var p = document.createElement("p")
    div.className="pcomeChat"
    p.innerHTML =  msg
    div.appendChild(p)
    $(".groupChat")[0].insertBefore(div,$(".groupChat")[0].childNodes[2])
  }
  function simpleMsg(id,name,msg,elementName){

    var $pName = $("<p/>").text(name)
    var $iImg = $('<img src="'+userInfo.get(id)["userHeadPortrait"]+'"/>')
    var $pMsg = $("<p/>").text(msg)
    var $dSimpleMsg = $("<div/>").addClass("simpleMsg").attr('id',"id"+id)
    var $dTextLeft =$("<div/>").addClass("textLeft")
    var $dTextRight = $("<div/>").addClass("textRight")
    var $dTextRightName = $("<div/>").addClass("textRightName")
    var $dTextRightMsg = $("<div/>").addClass("textRightMsg")
    var $dImg = $("<div/>").addClass("img")
    $dImg.append($iImg);
    $dTextRightName.append($pName);
    $dTextRightMsg.append($pMsg);
    $dTextLeft.append($dImg);
    $dTextRight.append($dTextRightName);
    $dTextRight.append($dTextRightMsg);
    $dSimpleMsg.append($dTextLeft);
    $dSimpleMsg.append($dTextRight);
    $dSimpleMsg.insertAfter(elementName)

    var msghHeight = $dSimpleMsg[0].offsetHeight
    $dSimpleMsg.css({"height":"0px","width":"0px"})
    $dSimpleMsg.animate({
          "height": msghHeight+"px",
          "width":"100%"
      }, 150,);
  }
  function imgMsg(id,name,msg,element){
    var $pName = $("<p/>").text(name);
    var $iImg = $('<img src="'+userInfo.get(id)["userHeadPortrait"]+'"/>')
    var $imgMsg = $('<img src="'+msg+'"/>')
    var $dSimpleMsg =$("<div/>").addClass("simpleMsg").attr('id',"id"+id);
    var $dTextLeft = $("<div/>").addClass("textLeft")
    var $dTextRight =$("<div/>").addClass("textRight")
    var $dTextRightName =$("<div/>").addClass("textRightName")
    var $dTextRightMsg =$("<div/>").addClass("textRightMsg")
    var $dImg =$("<div/>").addClass("img")
  
    $dImg.append($iImg)
    $dTextRightName.append($pName);
    $dTextRightMsg.append($imgMsg);
    $dTextLeft.append($dImg);
    $dTextRight.append($dTextRightName);
    $dTextRight.append($dTextRightMsg); 
    $dSimpleMsg.append($dTextLeft);
    $dSimpleMsg.append($dTextRight);
    $dSimpleMsg.insertAfter(element)
    $imgMsg.hover(function(){
      $dSimpleMsg.css({"height":"100%"}) //因为设置了overflow 不设置100%的话会隐藏
      $imgMsg.stop(true,false).animate({
        "width":"100%",
      },
      600)
    },function(){
      $imgMsg.stop(true,false).animate({
        "width":"30%"
      },
      200)
    })
  }
  //渲染在线列表
  function drawOnlieList(id,name,srcImg){
    var $pName = $("<p/>").text(name)
    var $iImg = $('<img src="'+srcImg+'"/>')
    var $pMsg = $("<p/>").text("")
    var $dSimpleMsg = $("<div/>").addClass("simpleMsg").attr('id',"id"+id);
    var $dTextLeft =$("<div/>").addClass("textLeft")
    var $dTextRight = $("<div/>").addClass("textRight")
    var $dTextRightName = $("<div/>").addClass("textRightName")
    var $dTextRightMsg = $("<div/>").addClass("textRightMsg")
    var $dImg = $("<div/>").addClass("img")
    $dImg.append($iImg);
    $dTextRightName.append($pName);
    $dTextRightMsg.append($pMsg);
    $dTextLeft.append($dImg);
    $dTextRight.append($dTextRightName);
    $dTextRight.append($dTextRightMsg);
    $dSimpleMsg.append($dTextLeft);
    $dSimpleMsg.append($dTextRight);

    $(".onlieUserList").prepend($dSimpleMsg) //案例这句每多写一行 就多添加一个节点 事实写几行也只加一个节点

    if(id!=localId){
      //添加私聊标识
    var $personChat = $("<div/>").addClass("id"+id).addClass("personChat").attr("id","id"+id)
    var $psersonDIv = $("<div/>").addClass("personChatTitle").append($("<p/>").text(name))
    $personChat.hide();
    $(".indexTextBox").append($personChat.append($psersonDIv).append($("<span/>")))
    //返回私聊
      $dSimpleMsg.click(function(){
        nowChat.hide();
        nowChat=$personChat;
        nowChat.show()
        nowChatNum=1
        for(var i=1;i<$personChat[0].childNodes.length;i++){
          $personChat[0].childNodes[i].style.height="100%";
        }
      })
    }
    
  }
  ////处理已在线用户信息  110
  function saveOnlineData(arr){
    //处理已在线用户信息
    for(var i=0;i<arr.length;i++){
        var value={}
        value.userName=arr[i].userName;
        imgSetBase64(arr[i].userHeadPortrait,value)
        userInfo.set(arr[i].uid,value);
        drawOnlieList(arr[i].uid,arr[i].userName,arr[i].userHeadPortrait)
    }
    //当前聊天为群聊
    nowChat=$(".groupChat")
    update("你来到了聊天室")
    //列表'我背景加深'
    console.log($(".onlieUserList #id"+Number(localId))[0].style.background="rgba(0,0,0,0.4)")

    //input可输入
    $(".indexText").removeAttr("readonly")
    $(".indexText").removeAttr("placeholder")
  }
  //新用户登入  120
  function saveNewOnlieUser(arr){
    if (arr.uid!=localId){
      var value ={}
      value.userName=arr.userName;
      imgSetBase64(arr.userHeadPortrait,value)
      userInfo.set(arr.uid,value);
      update(arr.userName+"来到了聊天室")
      drawOnlieList(arr.uid,arr.userName,arr.userHeadPortrait);
    }
  }
  //删除在线用户列表
  function delOnlieUser(data){
    userInfo.delete(data.uid)
    update(data.userName+"离开了聊天室")
    $("#id"+String(data.uid)).remove();
}
//修改头像
function ChangeUserHeadPortraitOk(arr){
    userInfo.get(arr.uid).userHeadPortrait=arr.userHeadPortrait
    var temp="#id"+String(arr.uid)
    $(temp+" .textLeft img").attr("src",arr.userHeadPortrait)
    update(userInfo.get(arr.uid).userName+"修改了头像")
}

//img转Base64
  function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var dataURL = canvas.toDataURL("image/jpg");  // 可选其他值 image/jpeg
    return dataURL;
}
function imgSetBase64(src,value) {
    var image = new Image();
    image.src = src + '?v=' + Math.random(); // 处理缓存
    image.crossOrigin = "*";  // 支持跨域图片
    image.onload = function(){
      str=getBase64Image(image);
      value.userHeadPortrait = str;
    }
}
})
