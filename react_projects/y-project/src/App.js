//I asked chatgpt how to implement the button part from our homework1 in 414 and fucked around with that to get this :)
import React, { useState } from 'react';
import { Container, Row, Col, Button, Navbar, Form, Nav } from 'react-bootstrap';

function App() {
  const [username, setUsername] = useState('');  //stores username entered
  const [checkInfo, setInfo] = useState('Follows'); //stores the dropdown part so the follows following posts
  const [infoMessage, setInfoMessage] = useState(''); //displays the message
  const[userData, setUserData] = useState([]); //this is used for the table that displays user data

  //This will yell at the user if they dont enter a username
  const checkUsername = async () => {
    if (username.trim() === '') {
      setInfoMessage('😡 Please enter a valid username 😡');
      return;
    }

   

    try {
        const response = await fetch(`http://54.147.244.63:8000/api/user/${username}/${checkInfo}`);
        console.log(`Fetching: http://54.147.244.63:8000/api/user/${username}/${checkInfo}`); 
        const data = await response.json();
        console.log(`API Response: `, data);
        if (!response.ok) {
            throw new Error('User not found!');
        }

       setUserData(data);
       setInfoMessage(`Showing ${checkInfo} for user ${username}`);
       setUsername('');
    }  catch (error) {
       setInfoMessage(`😡 ${error.message} 😡`);
       setUserData([]);
   }
};



  //this is where ur html goes/how u format the page incase u wondering 
  return (
    <>
    {/*This is the navaigation bar they gave me this in the default template so i kept it*/}
    <Navbar bg='primary' variant='dark'>
      <Container>
        <Navbar.Brand>Y.com</Navbar.Brand>
      </Container>
    </Navbar>
    

    {/*The juicy stuff*/}
    <Container className="mt-4">
      <h2>Check User Info</h2>
  
      {/* This is what designs where u enter the username */}
      <Form.Group>
        <Form.Control 
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </Form.Group>
    
      {/* This is what designs the dropdown bar*/} 
      <Form.Group className="mt-2">
        <Form.Select value={checkInfo} onChange={(e) => setInfo(e.target.value)}>
          <option value="Follows">Follows</option>
          <option value="Following">Following</option>
          <option value="Posts">Posts</option>
        </Form.Select>
      </Form.Group>
  
      {/* This is just the button to submit the username  */}
      <Button className="mt-2" variant="primary" onClick={checkUsername}>
        Check Info
      </Button>
  
      {/* Status message */}
      {infoMessage && <p className="mt-3">{infoMessage}</p>}
  
      {/* THIS IS THE TABLE THAT DISPLAYS THE USER DATA*/}
      {userData.length > 0 && (
        <table className="table mt-3">
          <thead>
            <tr>
              <th>{checkInfo}</th> {/* This will change the heading based on the choosen selection like follows following posts */}
            </tr>
          </thead>
          <tbody>
            {userData.map((item, index) => (
              <tr key={index}>
                <td>{item}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Container>
    </>
  );
  
}

export default App;
