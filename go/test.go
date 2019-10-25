package test

import (
	"control"
	"crypto/md5"
	"fmt"
	"model"
	"net/http"
	"strconv"

	"github.com/gorilla/websocket"
)

var (
	ClientMap map[int]*Client = make(map[int]*Client)
	Message   chan MessageStruct
)

//成员结构体
type Client struct {
	Uid              int             `json:"uid"`
	MsgCh            chan []byte     `json:"msgCh"`
	UserName         string          `json:"userName"`
	UserHeadPortrait string          `json:"userHeadPortrait"`
	Socket           *websocket.Conn `json:"socket"`
	MessageStruct    `json:"messageStruct"`
}
type MessageStruct struct {
	Uid    int         `json:"uid"`
	Status int         `json:"status"`
	Msg    string      `json:"msg"`
	Data   interface{} `json:"data"`
}

//处理用户登录
func UserRegister(c *Client) {
	//向map中添加该用户
	ClientMap[c.Uid] = c
	defer func() {
		c.Socket.Close()
		//用户下线
		Message <- MessageStruct{Status: 100, Msg: c.UserName + "退出了聊天室"}
		delete(ClientMap, c.Uid)
	}()
	//收到信息即发送
	go func() {
		for {
			control.SendMsg(c.Socket, 100, <-c.MessageStruct)
		}
	}()

}
func WsTest(res http.ResponseWriter, req *http.Request) {
	//验证cookie登录
	cookieUserId, err := req.Cookie("userId")
	cookieVerification, err1 := req.Cookie("verification")
	if err != nil || err1 != nil || cookieUserId == nil || cookieVerification == nil {
		return
	}
	person, err := model.SelectUserId(cookieUserId.Value)

	if fmt.Sprintf("%x%x", md5.Sum([]byte(person.UserEmail)), md5.Sum([]byte(person.UserPassword))) != cookieVerification.Value {
		return
	}

	//将http协议升级成websocket协议
	conn, err := (&websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}).Upgrade(res, req, nil)
	if err != nil {
		http.NotFound(res, req)
		return
	}

	uid, _ := strconv.Atoi(string(person.UserId))
	client := &Client{
		MsgCh:            make(chan []byte),
		UserName:         person.UserName,
		UserHeadPortrait: person.UserHeadPortrait,
		Socket:           conn,
		Uid:              uid,
	}
	go UserRegister(client)
}
func init() {
	go func() {
		//转发消息模块
		conn := <-Message
		for _, user := range ClientMap {
			user.MessageStruct <- conn
		}
	}()
}
