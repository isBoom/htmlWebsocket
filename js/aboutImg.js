$(function(){
    $(".sendImgBox").change(function(){
        var file=this.files[0];
        var reader = new FileReader();
        // 根据文件类型选择阅读方式
        switch (file.type){
        case 'image/jpg': case 'image/png': case 'image/jpeg': case 'image/gif':
        reader.readAsDataURL(file);
        break;
        }
        reader.onload=function () {
            // 如果说让读取的文件显示的话 还是需要通过文件的类型创建不同的标签
            switch (file.type){
            case 'image/jpg': case 'image/png': case 'image/jpeg': case 'image/gif':

            if(nowChatNum==0){
                socket.send(JSON.stringify({"status":210,"msg":reader.result}))
            }else{
                var temp=(nowChat[0].id).slice(2)
                var uid = Number(temp)
                socket.send(JSON.stringify({"status":410,"uid":uid,"msg":reader.result}))
            }
            
            toBeSendImg_p = $("<p/>").text("正在发送图片(服务器宽带只有5M,速度慢请见谅)...");
            $("body").append(toBeSendImg_p)
            toBeSendImg_p.css({
                    "z-index": 9999999999999,
                    "top": 10,
                    "left": 400,
                    "position": "absolute",
                    "color": "darkorange",
                    "font-family": "宋体",
                    "opacity":0
                },1500,function(){
                    toBeSendImg_p.remove()
                });
            break;
            }
        }
    });
    $(".changeUserHeadPortraitBox").change(function(){
        var file=this.files[0];
        var reader = new FileReader();
        // 根据文件类型选择阅读方式
        switch (file.type){
        case 'image/jpg': case 'image/png': case 'image/jpeg': case 'image/gif':
        reader.readAsDataURL(file);
        break;
        }
        reader.onload=function () {
            // 如果说让读取的文件显示的话 还是需要通过文件的类型创建不同的标签
            switch (file.type){
            case 'image/jpg': case 'image/png': case 'image/jpeg': case 'image/gif':
            socket.send(JSON.stringify({"status":310,"msg":reader.result,"userName":file.type}))
            var $change = $("<p/>").text("正在更改头像(服务器宽带只有5M,速度慢请见谅)...");
            $("body").append($change)
            $change.css({
                    "z-index": 99999999,
                    "top": 10,
                    "left": 400,
                    "position": "absolute",
                    "color": "darkorange",
                    "font-family": "宋体",
                });
            $change.animate({
                    "opacity": 0
                },
                3000,
            function() {
                $change.remove();
            });
            break;
            }
            }
        })
})