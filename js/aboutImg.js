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
            console.log("图片准备就绪")
            // 如果说让读取的文件显示的话 还是需要通过文件的类型创建不同的标签
            switch (file.type){
            case 'image/jpg': case 'image/png': case 'image/jpeg': case 'image/gif':
            socket.send(JSON.stringify({"status":210,"msg":reader.result}))
            break;
            }
        }
    });
})