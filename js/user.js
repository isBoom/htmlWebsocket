$(function() {
  $("#login").click(function(e) {
    if ($(".userName").val() != "" && $(".passWord").val() != "") {
      login();
    } else {
      alert("不输全就想登录？")
    }
    return false;
  })

  $("#registe").click(function(e) {
    window.location.href = "https://xxxholic.top/registe.html"
  })

  $("#registeUser").click(function(e) {
    if (requsetRegisteInfo()){
      registeUser();
    }
    return false;
  })



  function login(){
    $.ajax({
      url: "https://xxxholic.top:8088/login",
      type: "POST",
      data: {
        userName: $(".userName").val(),
        userPassword: $(".passWord").val()
      },
      xhrFields: {
        withCredentials: true
      },
      crossDomain: true,
      dataType: "JSON",
      success: function(data) {
        console.log(data.status)
        switch (data.status){
          case 0: case 20:
              alert(data.msg);
            break
          case 100:
              console.log(data.msg);
              window.location.href = "https://xxxholic.top"
              break;
          default:
              console.log(data)
            break;
        }
      },
      error: function(data) {
        alert("服务器错误")
        console.log(data)
      }
    })
  }

  function registeUser(){
    $.ajax({
      url: "https://xxxholic.top:8088/registe",
      type: "POST",
      data: {
        userName: $(".userName").val(),
        userPassword: $(".passWord").val(),
        userEmail: $(".email").val()
      },
      xhrFields: {
        withCredentials: true
      },
      crossDomain: true,
      dataType: "JSON",
      success: function(data) {
        switch (data.status){
          case 0:
              alert(data.msg);
            break
          case 100:
            //成功
              console.log(data.msg);
              window.location.href = "https://xxxholic.top"
            break;
          default:
            console.log(data)
            break;
        }
      },
      error: function(data) {
        alert("服务器错误")
        console.log(data)
      }
    })
  }

  function requsetRegisteInfo(){
    if ($(".userName").val()== "" || $(".passWord").val() == "" || $(".requestPassWord").val() == "" || $(".email").val() == "") {
      alert("不输全就想登录？")
      return false;
    }else if(!(/^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/).test($(".email").val())){
      alert("邮箱格式不正确");
      return false;
    }else if($(".passWord").val() != $(".requestPassWord").val()){
      alert("两次密码不一致");
      return false;
    }else if(String($(".passWord").val()).length<6||String($(".requestPassWord").val()).length<6){
      alert("密码过短");
    }
    else{
      return true
    }
  }
})
