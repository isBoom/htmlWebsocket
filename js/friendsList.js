$(function(){
    $(".pOnlieUserListBox").click(function(){
        if($(".onlieUserListBox .onlieUserList").children().length>0){
            if($(".onlieUserListBox .onlieUserList")[0].style.display=="none"){
                $(".pOnlieUserListBox .iconfont").removeClass("icon-zhankai")
                $(".pOnlieUserListBox .iconfont").addClass("icon-guanbi")
                $(".onlieUserListBox .onlieUserList")[0].style.display="block"
            }else{
                $(".pOnlieUserListBox .iconfont").removeClass("icon-guanbi")
                $(".pOnlieUserListBox .iconfont").addClass("icon-zhankai")
                $(".onlieUserListBox .onlieUserList")[0].style.display="none"
            }
        }
    })

    $(".pFriendUserListBox").click(function(){
        if($(".friendUserListBox .friendUserList").children().length>0){
            if($(".friendUserListBox .friendUserList")[0].style.display=="none"){
                $(".pFriendUserListBox .iconfont").removeClass("icon-zhankai")
                $(".pFriendUserListBox .iconfont").addClass("icon-guanbi")
                $(".friendUserListBox .friendUserList")[0].style.display="block"
            }else{
                $(".pFriendUserListBox .iconfont").removeClass("icon-guanbi")
                $(".pFriendUserListBox .iconfont").addClass("icon-zhankai")
                $(".friendUserListBox .friendUserList")[0].style.display="none"
            }
        }
        
        
    })
})