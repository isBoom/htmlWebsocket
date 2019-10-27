//发送信息
var socket
$(function() {
  var userInfo = new Map();
  var localId=0;
  var toBeSendImg_p;
  // 创建一个Socket实例
  socket = new WebSocket("wss://xxxholic.top:8088/ws")
  // 打开Socket
  socket.onopen = function(event) {

    var arr,reg=new RegExp("(^| )"+"userId"+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
      localId=(arr[2]);
    // 监听消息
    socket.onmessage = function(event) {
      switch (JSON.parse(event.data).status){
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
            console.log("100系统通知")
            update(JSON.parse(event.data).msg)
            break;
        case 110:
            //登录后收到的第一条消息 证明登陆成功
            //存储在线用户信息
            console.log("110初始化在线用户列表")
            saveOnlineData(JSON.parse(event.data).user)
            break;
        case 120:
            //新用户上线 存储在线用户列表
            console.log("120小伙伴登陆了")
            saveNewOnlieUser(JSON.parse(event.data).user)
            break;
        case 130:
              //用户离线
              console.log("130有人离开就再也不会回来了")
              delOnlieUser(JSON.parse(event.data))
              break;
        case 200:
            //普通用户消息
            console.log("200这是一条普通的消息")
            simpleMsg(JSON.parse(event.data).uid, JSON.parse(event.data).userName,JSON.parse(event.data).msg)
            
            break;
        case 210:
            //不发图等着做遗产吗
            console.log("210发*图啊")
            imgMsg(JSON.parse(event.data).uid, JSON.parse(event.data).userName,JSON.parse(event.data).msg)
            if(JSON.parse(event.data).uid==localId){
              $(".content~p").remove();
            }
            break;
      }
      
    }
  }
  socket.onerror = function(event) {
    console.log(event)
    window.location.href = "https://xxxholic.top/login.html"
  }

  $("#sub").click(function(e) {
    if ($(".indexText").val() != "") {
      socket.send(JSON.stringify({"status":200,"msg":$(".indexText").val()}))
      $(".indexText").val("")
    }
    e.preventDefault() 
  })
  //点击发送图片之后模拟点击input type=file按钮
  $(".sendImg").click(function(e){
    $(".sendImgBox")[0].click();
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
  function simpleMsg(id,name,msg){
    var $pName = $("<p/>").text(name)
    var $iImg = $('<img src="'+userInfo.get(id)["userHeadPortrait"]+'"/>')
    var $pMsg = $("<p/>").text(msg)
    var $dSimpleMsg = $("<div/>").addClass("simpleMsg")
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
    $dSimpleMsg.insertAfter($(".groupChat")[0].childNodes[1])
  }
  function imgMsg(id,name,msg){
    var $pName = $("<p/>").text(name);
    var $iImg = $('<img src="'+userInfo.get(id)["userHeadPortrait"]+'"/>')
    var $imgMsg = $('<img src="'+msg+'"/>')
    var $dSimpleMsg =$("<div/>").addClass("simpleMsg")
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
    $dSimpleMsg.insertAfter($(".groupChat")[0].childNodes[1])

    $imgMsg.hover(function(){
      $imgMsg.stop(true,false).animate({
        "width":"100%"
      },
      600)
    },function(){
      $imgMsg.stop(true,false).animate({
        "width":"30%"
      },
      200)
    })

    
  }
  function drawOnlieList(id,name,srcImg){
    var $pName = $("<p/>").text(name)
    var $iImg = $('<img src="'+srcImg+'"/>')
    var $pMsg = $("<p/>").text("")
    var $dSimpleMsg = $("<div/>").addClass("simpleMsg").attr('id',"id"+String(id));
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
    $(".onlieUserList").prepend($dSimpleMsg)
    $(".onlieUserList").prepend($dSimpleMsg)
    $(".onlieUserList").prepend($dSimpleMsg)
    $(".onlieUserList").prepend($dSimpleMsg)
  }
  ////处理已在线用户信息  110
  function saveOnlineData(arr){
    //处理已在线用户信息
    for(var i=0;i<arr.length;i++){
      if (arr[i].uid!=localId){
        var value={}
        value.userName=arr[i].userName;
        imgSetBase64(arr[i].userHeadPortrait,value)
        userInfo.set(arr[i].uid,value);
        drawOnlieList(arr[i].uid,arr[i].userName,arr[i].userHeadPortrait)
      }
    }
    //input可输入
    $(".indexText").removeAttr("readonly")
    $(".indexText").removeAttr("placeholder")
  }
  //新用户登入  120
  function saveNewOnlieUser(arr){
      var value ={}
       value.userName=arr[0].userName;
      imgSetBase64(arr[0].userHeadPortrait,value)
      userInfo.set(arr[0].uid,value);
       update(arr[0].userName+"来到了聊天室")
       drawOnlieList(arr[0].uid,arr[0].userName,arr[0].userHeadPortrait);
  }
  //删除在线用户列表
  function delOnlieUser(data){
    userInfo.delete(data.uid)
    update(data.userName+"离开了聊天室")
    $("#id"+String(data.uid)).remove();
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
