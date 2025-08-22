// export const getSender = (loggedUser, users) => {
//      return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
// };
export const getSender = (loggedUser, users) => {
  if (!users || users.length < 2 || !loggedUser) return null;

  return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
}

export const getSenderFull = (loggedUser, users) => {
     return users[0]._id === loggedUser._id ? users[1] : users[0];
};

export const isSameSender = (messages, m, i, userId) => {
  if (
    i < messages.length - 1 &&
    messages[i + 1] &&
    messages[i + 1].sender &&
    messages[i + 1].sender._id !== m.sender._id &&
    m.sender._id !== userId
  ) {
    return true;
  }
  return false;
};


export const isLastMessage = (messages, i, userId) => {
  if (i === messages.length - 1) return true; 
  if (!messages[i + 1] || !messages[i + 1].sender) return true; 

  return messages[i + 1].sender._id !== messages[i].sender._id;
};

export const isSameSenderMargin = (messages, m, i, userId) => {
  const currentSenderId = m?.sender?._id;
  const nextSenderId = messages[i + 1]?.sender?._id;
  const isNotUser = currentSenderId !== userId;

  if (nextSenderId === currentSenderId && isNotUser) {
    return 33;
  } else if (
    (nextSenderId !== currentSenderId && isNotUser) ||
    (i === messages.length - 1 && isNotUser)
  ) {
    return 0;
  } else {
    return "auto";
  }
};

export const isSameUser =(messages,m,i) =>{
  return i>0 && messages[i-1].sender._id ===m.sender._id;
}




