import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  useToast,
  Spinner,
  FormControl,
  Input,
  IconButton,
} from "@chakra-ui/react";
import { ArrowBackIcon, ViewIcon } from "@chakra-ui/icons";
import axios from "axios";

import { ChatState } from "../Context/ChatProvider";
import { getSender, getSenderFull } from "../config/ChatLogic";
import ScrollableChat from "./ScrollableChat";
import ProfileModal from "./miscelllaneous/ProfileModal";
import UpdateGroupChatModel from "./miscelllaneous/UpdateGroupChatModel";

import "./style.css";
import io from "socket.io-client";
import { m } from "framer-motion";
const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;
const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { user, selectedChat, setSelectedChat, notifications, setNotifications } = ChatState();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const toast = useToast();
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      setLoading(true);
      const { data } = await axios.get(
        `http://localhost:5000/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);

    } catch (error) {
      console.error("Failed to load messages", error);
      toast({
        title: "Error Occurred",
        description: "Failed to load the messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => {
      setIsTyping(true);
    });
    socket.on("stop typing", () => {
      setIsTyping(false);
    });
  }, []);

  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        if (!notifications.includes(newMessageReceived)) {
          setNotifications([newMessageReceived, ...notifications]);
        }
      } else {
        setMessages([...messages, newMessageReceived]);
      }
    });
  });
  console.log("Notifications:", notifications);


  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage.trim()) {
      socket.emit('stop typing', selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "http://localhost:5000/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );
       // console.log(data);
        setMessages([...messages, data.createdMessage]);
      //  console.log("Message sent:", messages);
        socket.emit("new message", data.createdMessage);
        //setMessages((prev) => [...prev, data]);

      } catch (error) {
        console.error("Failed to send message", error);
        toast({
          title: "Error Occurred",
          description: "Failed to send the message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-left",
        });
      }
    }
  };

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000; // 3 seconds
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            fontFamily="Work sans"
            pb={3}
            px={3}
            w="100%"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)}>
                  <ViewIcon />
                </ProfileModal>
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModel
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}
            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              {isTyping ? <div>Typing...</div> : (<></>)}
              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter a message.."
                onChange={typingHandler}
                value={newMessage}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} px={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;

