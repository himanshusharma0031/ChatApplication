import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, Image, Text, ModalFooter } from '@chakra-ui/react';
import { IconButton, Button } from '@chakra-ui/button';
import { useDisclosure } from '@chakra-ui/hooks';

const ProfileModal = ({ user, children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    return (
        <>
            <span onClick={onOpen}>
                {children}
            </span>
            <Modal size="lg" isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent h="410px">
                    <ModalHeader fontSize="40px"
                        fontFamily="Work sans"
                        display="flex"
                        justifyContent="center">{user?.name}</ModalHeader>
                    <ModalBody
                    display ="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="space-between">
                        <Image
                            borderRadius="full" boxSize="150px" src={user?.pic} alt={user?.name} />
                        <Text fontSize={{ base: "28px", md: "30px" }} fontFamily="Work sans">{user?.email}</Text>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={onClose}>Close
                        </Button>
                        <Button varient='ghost'>Secondary Action</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default ProfileModal;
