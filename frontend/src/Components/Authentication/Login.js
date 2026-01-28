import { VStack, FormControl, FormLabel, Input, InputGroup, InputRightElement, Button } from "@chakra-ui/react";
import React from 'react'
import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
const Login = () => {
    const [show, setShow] = useState(false);
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const toast = useToast();
    const navigate = useNavigate();
    const [Loading, setLoading] = useState(false);
    const handleClick = () => {
        setShow(!show);
    }
    const submitHandler = async () => {
        setLoading(true);
        if (!email || !password) {
            toast({
                title: "Please Fill all the Fields",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
            return;
        }
        try {
            const config = {
                headers:
                {
                    "Content-type": "application/json",
                }
            };
            const { data } = await axios.post("http://localhost:5000/api/user/login", { email, password }, config);
            toast({
                title: "Login Successfull!",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });

            localStorage.setItem("userInfo", JSON.stringify(data));

            setLoading(false);
            // navigate.push("/chats");
            navigate("/chats");

        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
        }
    }
   

    return (
        <VStack spacing='5px'>
            <FormControl id='Email' isRequired>
                <FormLabel>Email</FormLabel>
                <Input placeholder="Enter Your Email" value={email} onChange={(e) => setEmail(e.target.value)}
                />
            </FormControl>
            <FormControl id='Password' isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                    <Input type={show ? "text" : "password"} placeholder="Enter Your Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={handleClick}>
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <Button colorScheme="blue"
                width="100%"
                style={{ marginTop: 15 }}
                onClick={submitHandler}
                isLoading={Loading}
            >
                Login
            </Button>
            <Button varient="solid"
                colorScheme="red"
                width="100%"
                onClick={() => {
                    setEmail("guest@example.com");
                    setPassword("123456");
                }}>
                 Guest User data
            </Button>
        </VStack>
    )


}

export default Login;