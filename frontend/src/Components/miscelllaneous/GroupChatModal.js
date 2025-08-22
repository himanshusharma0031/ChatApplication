import React from "react";
import { useState } from "react";
import { useDisclosure, Button, Modal, ModalOverlay, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, ModalContent, useToast, FormControl, Input, Box } from "@chakra-ui/react";
import { ChatState } from "../../Context/ChatProvider";
import axios from "axios";
import UserListItem from "../useAvatar/userListItem";
import UserBadgeItem from "../useAvatar/UserBadgeItem";
const GroupChatModal = ({ children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const { user, chats, setChats } = ChatState();
    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) {
            return;
        }
        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const { data } = await axios.get(`http://localhost:5000/api/user?search=${query}`, config);
           // console.log(data);
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            toast({
                title: "Error Occured",
                description: "Failed to Load the Search Results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
        }
    };
    const handleSubmit = async () => {
        if (!groupChatName || !selectedUsers) {
            toast({
                title: "Please fill all the fields",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                }
            };
            const { data } = await axios.post("http://localhost:5000/api/chat/group", {
                name: groupChatName,
                users: JSON.stringify(selectedUsers.map((u) => u._id)),
            }, config);
            setChats([data, ...chats]);
            onClose();
            toast({
                title: "New Group Chat Created",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "top",});
        } catch (error) {
            toast({
                title: "Failed to create the group chat",
                description: "error.response.data.message || error.message",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
        }
    };
    const handleDelete = (userToDelete) => {
        setSelectedUsers(selectedUsers.filter((sel) => sel._id !== userToDelete._id));
    };
    const handleGroup = (userToAdd) => {
        if (selectedUsers.includes(userToAdd)) {
            toast({
                title: "User already added",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }
        setSelectedUsers([...selectedUsers, userToAdd]);
    };

    return (<>
        <span onClick={onOpen}>{children}</span>
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader
                    fontSize="35px"
                    fontFamily="Work sans"
                    display="flex"
                    justifyContent="center">Create Group Chat</ModalHeader>
                <ModalCloseButton />
                <ModalBody display="flex" flexDirection="column" alignItems="center">
                    <FormControl>
                        <Input
                            placeholder="Chat Name"
                            mb={1}
                            value={groupChatName}
                            onChange={(e) => setGroupChatName(e.target.value)}
                        />
                    </FormControl>
                    <FormControl>
                        <Input
                            placeholder="Add users"
                            mb={1}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </FormControl>
                    <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
                        {selectedUsers.map(u => (
                            <UserBadgeItem
                                key={u._id} user={u} handleFunction={() => handleDelete(u)} />
                        ))}
                    </Box>

                    {loading ? <div>Loading...</div> : (
                        searchResult?.map(user =>
                            <UserListItem
                                key={user._id}
                                user={user}
                                handleFunction={() => {
                                    handleGroup(user)
                                }}
                            />
                        )
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
                        Create Chat
                    </Button>
                    <Button variant="ghost">Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>)
}
export default GroupChatModal;