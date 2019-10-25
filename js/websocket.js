//发送信息
$(function() {
  var userInfo = new Map();
  var value={}
  var localId=0;
  // 创建一个Socket实例
  var socket = new WebSocket("wss://xxxholic.top:8088/ws")
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
            update(JSON.parse(event.data).msg)
            break;
        case 110:
            //登录后收到的第一条消息 证明登陆成功
            //存储在线用户信息
            saveOnlineData(JSON.parse(event.data).user)
            break;
        case 120:
            //新用户上线 存储在线用户列表
            saveNewOnlieUser(JSON.parse(event.data).user)
            break;
        case 130:
              //用户离线
              delOnlieUser(JSON.parse(event.data))
              break;
        case 200:
            //普通用户消息
            simpleMsg(JSON.parse(event.data).uid, JSON.parse(event.data).userName,JSON.parse(event.data).msg)
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
      socket.send(JSON.stringify({"status":100,"msg":$(".indexText").val()}))
      $(".indexText").val("")
    }
    e.preventDefault() 
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
      var pName = document.createElement("p")
      var iImg = document.createElement("img")
      var pMsg = document.createElement("p")
      pName.innerHTML=name;
      pMsg.innerHTML=msg;

      iImg.src=(value["userHeadPortrait"]);
      var dSimpleMsg = document.createElement("div")
      var dTextLeft = document.createElement("div")
      var dTextRight = document.createElement("div")
      var dTextRightName = document.createElement("div")
      var dTextRightMsg = document.createElement("div")
      var dImg = document.createElement("div")

      dSimpleMsg.className="simpleMsg";
      dTextLeft.className="textLeft";
      dTextRight.className="textRight"
      dTextRightName.className="textRightName";
      dTextRightMsg.className="textRightMsg";
      dImg.className="img";
      
      dImg.appendChild(iImg);
      dTextRightName.appendChild(pName);
      dTextRightMsg.appendChild(pMsg);
      dTextLeft.appendChild(dImg);
      dTextRight.appendChild(dTextRightName);
      dTextRight.appendChild(dTextRightMsg);
      dSimpleMsg.appendChild(dTextLeft);
      dSimpleMsg.appendChild(dTextRight);
      $(".groupChat")[0].insertBefore(dSimpleMsg,$(".groupChat")[0].childNodes[2])
  }
  function drawOnlieList(id,name,srcImg){
    var pName = document.createElement("p")
    var iImg = document.createElement("img")
    var pMsg = document.createElement("p")
    pName.innerHTML=name;

    iImg.src=srcImg;
    var dSimpleMsg = document.createElement("div")
    var dTextLeft = document.createElement("div")
    var dTextRight = document.createElement("div")
    var dTextRightName = document.createElement("div")
    var dTextRightMsg = document.createElement("div")
    var dImg = document.createElement("div")

    dSimpleMsg.className="simpleMsg";
    dSimpleMsg.id="id"+id;
    dTextLeft.className="textLeft";
    dTextRight.className="textRight"
    dTextRightName.className="textRightName";
    dTextRightMsg.className="textRightMsg";
    dImg.className="img";
    
    dImg.appendChild(iImg);
    dTextRightName.appendChild(pName);
    dTextRightMsg.appendChild(pMsg);
    dTextLeft.appendChild(dImg);
    dTextRight.appendChild(dTextRightName);
    dTextRight.appendChild(dTextRightMsg);
    dSimpleMsg.appendChild(dTextLeft);
    dSimpleMsg.appendChild(dTextRight);
    $(".onlieUserList")[0].insertBefore(dSimpleMsg,$(".onlieUserList")[0].childNodes[0])
  }
  ////处理已在线用户信息
  function saveOnlineData(arr){
    //处理已在线用户信息
    for(var i=0;i<arr.length;i++){
      if (arr[i].uid!=localId){
        imgSetBase64(arr[i].userHeadPortrait)
        value.userName=arr[i].userName;
        userInfo.set(arr[i].uid,value);
        drawOnlieList(arr[i].uid,arr[i].userName,arr[i].userHeadPortrait)
      }
    }
    //input可输入
    $(".indexText").removeAttr("readonly")
    $(".indexText").removeAttr("placeholder")
  }
  //新用户登入
  function saveNewOnlieUser(arr){
      value.userName=arr[0].userName;
      imgSetBase64(arr[0].userHeadPortrait)
      userInfo.set(arr[0].uid,value);
      update(arr[0].userName+"来到了聊天室")
      drawOnlieList(arr[0].uid,arr[0].userName,arr[0].userHeadPortrait)
  }
  //删除在线用户列表
  function delOnlieUser(data){
    userInfo.delete(data.uid)
    update(data.userName+"离开了聊天室")
    $("#id"+String(data.uid)).remove();
}
  delOnlieUser



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

function imgSetBase64(src) {
    var image = new Image();
    image.src = src + '?v=' + Math.random(); // 处理缓存
    image.crossOrigin = "*";  // 支持跨域图片
    image.onload = function(){
      value.userHeadPortrait = getBase64Image(image);
    }
}
})
