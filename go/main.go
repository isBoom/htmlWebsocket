package main

import (
	"crypto/md5"
	"encoding/json"
	"fmt"
	"model"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/satori/go.uuid"
)

const (
	xx = "fsjiamkfasifjaiodmasdkaso"
)

type User struct {
	UserId         int64  `json:"userId" db:"userId"`
	UserName       string `json:"userName" db:"userName"`
	UserPassword   string `json:"userPassword" db:"userPassword"`
	UserEmail      string `json:"userEmail" db:"userEmail"`
	UserCreateDate string `json:"userCreateDate" db:"userCreateDate"`
}

type Res struct {
	Status   string
	Msg      string
	UserData User
}

func resData(w http.ResponseWriter, status string, msg string) {
	tempR := Res{Status: status, Msg: msg}
	r, err := json.Marshal(tempR)
	if err != nil {
		w.Write([]byte("json.Marshal err"))
	}
	w.Write(r)
}
func login(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", r.Header.Get("Origin"))
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	w.Header().Set("Access-Control-Allow-Methods", "OPTIONS, POST")
	//解析post数据并更新r.PostForm也更新到r.Form
	r.ParseForm()
	//当前登录用户信息
	person := User{
		UserName:     r.PostForm.Get("userName"),
		UserPassword: r.PostForm.Get("userPassword"),
	}
	//检测用户是否存在loginInfo
	loginInfo, err := model.LoginInfo(person.UserName, person.UserPassword)
	if err != nil {
		resData(w, "0", fmt.Sprint(err))
		fmt.Println(loginInfo.UserId, "妄图登录")
	} else {
		//resData(w, "1", "登陆成功")
		c1 := http.Cookie{
			Name:   "userId",
			Value:  fmt.Sprint(loginInfo.UserId),
			Domain: "",
			Path:   "/",
			MaxAge: 86400 * 3,
		}
		c2 := http.Cookie{
			Name: "verification",
			Value: fmt.Sprintf("%x%x%x", md5.Sum([]byte(xx+loginInfo.UserName)),
				md5.Sum([]byte(loginInfo.UserEmail)), md5.Sum([]byte(loginInfo.UserPassword))),
			Domain: "",
			Path:   "/",
			MaxAge: 86400 * 3,
		}
		w.Header().Add("Set-cookie", c1.String())
		w.Header().Add("Set-cookie", c2.String())

	}
}
func register(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write([]byte("register"))
	fmt.Println("register")
}

//客户端管理
type ClientManager struct {
	//客户端 map 储存并管理所有的长连接client，在线的为true，不在的为false
	clients map[*Client]bool
	//web端发送来的的message我们用broadcast来接收，并最后分发给所有的client
	broadcast chan []byte
	//新创建的长连接client
	register chan *Client
	//新注销的长连接client
	unregister chan *Client
}

//客户端 Client
type Client struct {
	//用户id
	id string
	//连接的socket
	socket *websocket.Conn
	//发送的消息
	send chan []byte
}

//会把Message格式化成json
type Message struct {
	//消息struct
	Sender    string `json:"sender,omitempty"`    //发送者
	Recipient string `json:"recipient,omitempty"` //接收者
	Content   string `json:"content,omitempty"`   //内容
}

//创建客户端管理者
var manager = ClientManager{
	broadcast:  make(chan []byte),
	register:   make(chan *Client),
	unregister: make(chan *Client),
	clients:    make(map[*Client]bool),
}

func (manager *ClientManager) start() {
	for {
		select {
		//如果有新的连接接入,就通过channel把连接传递给conn
		case conn := <-manager.register:
			//把客户端的连接设置为true
			manager.clients[conn] = true
			//把返回连接成功的消息json格式化
			jsonMessage, _ := json.Marshal(&Message{Content: "/A new socket has connected."})
			//调用客户端的send方法，发送消息
			manager.send(jsonMessage, conn)
			//如果连接断开了
		case conn := <-manager.unregister:
			//判断连接的状态，如果是true,就关闭send，删除连接client的值
			if _, ok := manager.clients[conn]; ok {
				close(conn.send)
				delete(manager.clients, conn)
				jsonMessage, _ := json.Marshal(&Message{Content: "/A socket has disconnected."})
				manager.send(jsonMessage, conn)
			}
			//广播
		case message := <-manager.broadcast:
			//遍历已经连接的客户端，把消息发送给他们
			for conn := range manager.clients {
				select {
				case conn.send <- message:
				default:
					close(conn.send)
					delete(manager.clients, conn)
				}
			}
		}
	}
}

//定义客户端管理的send方法
func (manager *ClientManager) send(message []byte, ignore *Client) {
	for conn := range manager.clients {
		//不给屏蔽的连接发送消息
		if conn != ignore {
			conn.send <- message
		}
	}
}

//定义客户端结构体的read方法
func (c *Client) read() {
	defer func() {
		manager.unregister <- c
		c.socket.Close()
	}()

	for {
		//读取消息
		_, message, err := c.socket.ReadMessage()
		//如果有错误信息，就注销这个连接然后关闭
		if err != nil {
			manager.unregister <- c
			c.socket.Close()
			break
		}
		//如果没有错误信息就把信息放入broadcast
		jsonMessage, _ := json.Marshal(&Message{Sender: c.id, Content: string(message)})
		manager.broadcast <- jsonMessage
	}
}

func (c *Client) write() {
	defer func() {
		c.socket.Close()
	}()

	for {
		select {
		//从send里读消息
		case message, ok := <-c.send:
			//如果没有消息
			if !ok {
				c.socket.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			//有消息就写入，发送给web端
			c.socket.WriteMessage(websocket.TextMessage, message)
			fmt.Printf("%s\n", string(message))
		}
	}
}

func wsHandler(res http.ResponseWriter, req *http.Request) {

	cookieUserId, err := req.Cookie("userId")
	cookieVerification, err1 := req.Cookie("verification")
	if err != nil || err1 != nil || cookieUserId == nil || cookieVerification == nil {
		return
	}
	person, err := model.SelectUserId(cookieUserId.Value)

	fmt.Println(cookieVerification.Value, fmt.Sprintf("%x%x%x", md5.Sum([]byte(xx+person.UserName)), md5.Sum([]byte(person.UserEmail)), md5.Sum([]byte(person.UserPassword))))

	if fmt.Sprintf("%x%x%x", md5.Sum([]byte(xx+person.UserName)), md5.Sum([]byte(person.UserEmail)), md5.Sum([]byte(person.UserPassword))) != cookieVerification.Value {
		return
	}
	//将http协议升级成websocket协议
	conn, err := (&websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}).Upgrade(res, req, nil)
	if err != nil {
		http.NotFound(res, req)
		return
	}
	//每一次连接都会新开一个client，client.id通过uuid生成保证每次都是不同的
	client := &Client{id: uuid.Must(uuid.NewV4()).String(), socket: conn, send: make(chan []byte)}
	//注册一个新的链接
	manager.register <- client

	//启动协程收web端传过来的消息
	go client.read()
	//启动协程把消息返回给web端
	go client.write()
}
func main() {
	fmt.Println("生枝系统start")
	go manager.start()
	http.HandleFunc(`/login`, login)
	http.HandleFunc(`/register`, register)
	http.HandleFunc("/ws", wsHandler)
	http.ListenAndServeTLS(":8088", "/var/www/html/credentials/xxxholic.top_public.crt", "/var/www/html/credentials/xxxholic.top.key", nil)
}
