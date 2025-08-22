import React from "react";
import { useState } from "react";
import { position, useDisclosure } from "@chakra-ui/react";
import { Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, FormControl, Input, Box, ModalFooter, IconButton, useToast } from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../useAvatar/UserBadgeItem";
import axios from "axios";
import UserListItem from "../useAvatar/userListItem";


const UpdateGroupChatModel = ({fetchAgain, setFetchAgain,fetchMessages}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { user, selectedChat, setSelectedChat } = ChatState();
    const [groupChatName, setGroupChatName] = useState();
    const [renameloading, setRenameloading] = useState(false);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
   
    const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
        toast({
            title: "Only admin can remove someone from the group",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "top",
        });
        return;
    }

    try {
        setLoading(true);
        const config = {
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        };
        const { data } = await axios.put(
            "http://localhost:5000/api/chat/groupremove",
            {
                chatId: selectedChat._id,
                userId: user1._id,
            },
            config
        );

        if (user1._id === user._id) {
            setSelectedChat("");
        } else {
            setSelectedChat(data);
        }

        setFetchAgain(!fetchAgain);
        fetchMessages();
    } catch (error) {
        toast({
            title: "Error removing user",
            description: error.response?.data?.message || error.message,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom-left",
        });
    } finally {
        setLoading(false);
    }
};

    const handleAddUser = async (user1) => {
        if (selectedChat.users.find(u => u._id === user1._id)) {
            toast({
                title: "User already in group",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }

        if (selectedChat.users.length === 2) {
            toast({
                title: "Only admin can add someone to the group",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }

        try {
            setLoading(true);

            const config = {
                headers: {
                    Authorization: `Bearer ${user?.token || ""}`,
                },
            };

            const response = await axios.put(
                "http://localhost:5000/api/chat/groupadd",
                {
                    chatId: selectedChat._id,
                    userId: user1._id,
                },
                config
            );

            if (response && response.data) {
                setSelectedChat(response.data);
                setFetchAgain(!fetchAgain);
            } else {
                console.warn("No response data received.");
                toast({
                    title: "Unexpected error",
                    description: "No response from the server.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom-left",
                });
            }

        } catch (error) {
            console.error("Add user error:", error);
            toast({
                title: "error",
                description:
                    error?.response?.data?.message ||
                    error.message ||
                    "An unexpected error occurred.",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        } finally {
            setLoading(false);
        }
    };


    const handleRename = async () => {
        if (!groupChatName) return
        try {
            setRenameloading(true)
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const response = await axios.put("http://localhost:5000/api/chat/rename", {
                chatId: selectedChat?._id,
                chatName: groupChatName,
            },
                config
            );
            const data = response?.data;
            if (data) {
                setSelectedChat(data);
                setFetchAgain(!fetchAgain);
            } else {
                console.error("No data returned from rename API.");
            }

        } catch (error) {
            console.error("Rename failed:", error?.response?.data || error.message);
        } finally {
            setRenameloading(false);
        }
    };

    const handleSearch = async (query) => {
        setSearch(query);

        if (!query) return;

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user?.token || ""}`,
                },
            };

            const response = await axios.get(`http://localhost:5000/api/user?search=${query}`, config);

            if (response && response.data) {
                console.log(response.data);
                setSearchResult(response.data);
            } else {
                console.warn("No data received from server.");
                setSearchResult([]);
            }

        } catch (error) {
            console.error("Search error:", error);
            toast({
                title: "Error Occurred",
                description: "Failed to load the search results.",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
        } finally {
            setLoading(false);
        }
    };


    return (<>
        <IconButton display={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader
                    fontSize="35px"
                    fontFamily="Work sans"
                    d="flex"
                    justifyContent="center"
                >{selectedChat.chatName}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
                        {selectedChat.users.map(u => (
                            <UserBadgeItem
                                key={u._id} user={u} handleFunction={() => handleRemove(u)} />
                        ))}
                    </Box>
                    <FormControl display="flex">
                        <Input
                            placeholder="Chat Name"
                            mb={1}
                            onChange={(e) => setGroupChatName(e.target.value)}
                        />
                        <Button
                            variant="solid"
                            colorScheme="teal"
                            ml={1}
                            isLoading={renameloading}
                            onClick={() => handleRename()}>Update</Button>
                    </FormControl>
                    <FormControl>
                        <Input placeholder="Add User to group"
                            mb={1}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </FormControl>
                    {loading ? <div>Loading...</div> : (
                        searchResult?.map(user => (
                            <UserListItem
                                key={user._id}
                                user={user}
                                handleFunction={() => handleAddUser(user)}
                            />
                        ))
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button onClick={() => handleRemove(user)} colorScheme="red">
                        Leave Group
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>
    )
};
export default UpdateGroupChatModel;