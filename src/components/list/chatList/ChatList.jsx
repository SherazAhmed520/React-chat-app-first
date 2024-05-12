import { useEffect, useState } from "react"
import "./chatList.css"
import AddUser from "./addUser/addUser"
import { useUserStore } from "../../../lib/userStore"
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore"
import { db } from "../../../lib/firebase"
import { useChatStore } from "../../../lib/chatStore"


const ChatList = () => {
    const [chats, setChats] = useState([]);
    const [addMode, setAddMode] = useState(false);
    const [input, setInput] = useState("")

    const { currentUser } = useUserStore();
    const { chatId, changeChat } = useChatStore();

    useEffect(()=>{
        const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
           const items = res.data().chats;
    
        //    console.log("Items:", items); // Log the items array
    
           const promises = items.map(async (item)=>{
            
                // console.log("Receiver ID:", item.receiverId); // Log the receiverId
    
                const userDocRef = doc(db, "users", item.receiverId);
                const userDocSnap = await getDoc(userDocRef);
    
                const user = userDocSnap.data();
    
                return {...item, user};
           });
    
           const chatData = await Promise.all(promises);
           
           //for latest chats first we can use compare fn
           setChats(chatData.sort((a, b)=> b.updatedAt - a.updatedAt))
        });
    
        return ()=>{
            unSub();   //cleanUp function
        }
    },[currentUser.id])
    
    const handleSelect = async (chat)=>{
       const userChats = chats.map((item) => {
        const { user, ...rest } = item;
        return rest;
       });

       const chatIndex = userChats.findIndex(
        (item) => item.chatId === chat.chatId
       );

       userChats[chatIndex].isSeen = true;
       const userChatsRef = doc(db, "userchats", currentUser.id);

       try {
            await updateDoc(userChatsRef, {
                chats: userChats,
            });
            changeChat(chat.chatId, chat.user);

       } catch (err) {
            console.log(err);
       }
    };

    const filteredChats = chats.filter((c) => 
        c.user.username.toLowerCase().includes(input.toLowerCase())
    );



  return (
    
      <div className="chatList">
        <div className="search">
            <div className="searchBar">
                <img src="./search.png" alt="" />
                <input type="text" placeholder="Search" onChange={(e) => setInput(e.target.value)} />
            </div>
            <img src={addMode ? "./minus.png" : "./plus.png"} alt="" className="add"
            onClick={() => setAddMode((prev) => !prev)} />
        </div>

     {/* hm chat k db me user ko store nh krega username ko kuk user to change huty rhty h agr wo b fix krdya to issue huga is se prevent krna ha */}
    
     {filteredChats.map((chat)=>{
    // console.log(chat); // Log the chat object to inspect its structure
    return (
        <div className="item" key={chat.chatId}  
        onClick={()=>handleSelect(chat)}
        style={{
            backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
        }}
        >
            <img src={chat.user.blocked.includes(currentUser.id) ?"./avatar.png" : chat.user.avatar || "./avatar.png"} alt="" />
            <div className="texts">
                <span>{chat.user.blocked.includes(currentUser.id) ?"User" : chat.user.username}</span>
                <p>{chat.lastMessage || 'No messages yet'}</p>
            </div>
        </div>
    );
})}



       {addMode && <AddUser /> }
      </div>
  )
}

export default ChatList
