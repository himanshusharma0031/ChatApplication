import React from 'react';
import { Box, Text, Avatar } from "@chakra-ui/react";
const UserListItem = ({ handleFunction, user }) => {
    return (
        <Box
            onClick={handleFunction}
            cursor="pointer"
            bg="#E8E8E8"
            _hover={{
                background: "#3882AC",
                color: "white",
            }}
            w="100%"
            display="flex"
            alignItems="center"
            color="black"
            px={3}
            py={2}
            mb={2}
            borderRadius="1g">
            <Avatar
                mr={2}
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
            />
            <Box>
                <Text>{user.name}</Text>
                <Text frontSize="xs">
                    <b>Email:</b>
                    {user.email}
                </Text>
            </Box>
        </Box>
    )
};

export default UserListItem;