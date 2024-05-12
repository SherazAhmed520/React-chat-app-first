import { arrayUnion, collection,  doc,  getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import './addUser.css'
import { db } from '../../../../lib/firebase';
import { useState } from 'react';
import { useUserStore } from '../../../../lib/userStore';

const AddUser = () => {

  const [user, setUser] = useState(null);
  const {currentUser} = useUserStore();

  const handleSearch = async (e)=>{
    e.preventDefault()
    const formData = new FormData(e.target);
    const username = formData.get("username")

    try {
      
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));

      const querySnapShot = await getDocs(q);

      if(!querySnapShot.empty){
        setUser(querySnapShot.docs[0].data())
      }

    } catch (err) {
      console.log(err);
    }
  };

  const handleAdd = async ()=>{

    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");


    try {
      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),    //yaha hme serverTimestamp() use krna tha current time k lie lkn serverTimestamp() or arrayUnion() ak sath use nh huskty islie Date.now() kia h use.
        }),
      });

      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),    //yaha hme serverTimestamp() use krna tha current time k lie lkn serverTimestamp() or arrayUnion() ak sath use nh huskty islie Date.now() kia h use.
        }),
      });

      // console.log(newChatRef.id);   //is se mujhy new chat id ml rhi ha js s me new user add krskta hu
      
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className='addUser'>
        <form onSubmit={handleSearch}>
            <input type="text" name="username" placeholder='Username' />
            <button>Search</button>
        </form>
       {user && (<div className="user">
            <div className="detail">
                <img src={user.avatar || "./avatar.png"} alt="" />
                <span>{user.username}</span>
            </div>
            <button onClick={handleAdd}>Add User</button>
        </div>
      )}
    </div>
  )
}

export default AddUser