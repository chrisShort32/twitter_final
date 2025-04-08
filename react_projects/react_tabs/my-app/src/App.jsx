// Group 3 Midterm Frontend Application
// Authors: Chris Short, Natalie Zettles, Sauharda Shrestha

import React, { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [userData, setUserData] = useState([]);
  const [selectedTab, setSelectedTab] = useState("tab1");
  const [selectedTable, setSelectedTable] = useState("users");
  const [userMap, setUserMap] = useState({}) // store user_id to username
  const [error, setError] = useState(null); // To handle errors
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const getUsers = async () => {
      try {
        const userResponse = await fetch(`http://54.147.244.63:8000/api/users`);
        if (!userResponse.ok){
          throw new Error('Failed to fetch users');
        }
        const userData = await userResponse.json();
        // Map of users
        const userMap = userData.reduce((acc, user) => {
          acc[user.user_id] = user.username;
          return acc;
        }, {});

        setUserMap(userMap);
      } catch (err) {
        setError(err.message);
      }
    };
    
    
    const getTable = async () => {
      
      let apiUrl = '';
      
      if (selectedTable === "posts"){
        apiUrl = `http://54.147.244.63:8000/view_all_posts`;
      }
      else if (selectedTable === "users"){
        apiUrl = `http://54.147.244.63:8000/api/users`
      }
      else if (selectedTable === "follows"){
        apiUrl = `http://54.147.244.63:8000/api/follows`
      }
      try{
        const response = await fetch(apiUrl);
        if (!response.ok){
          throw new Error('Failed to Fetch table');
        }

        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getUsers();
    if (selectedTab === "tab2") {
      getTable();
    }
  },[selectedTab]);

  const content = {
    tab1: [<button 
            className={`table-button ${selectedTable === "users" ? "active-tab" : ""}`}
            onClick={() => setSelectedTable("users")}
            >Users
          </button>,
          
          <button 
            className={`table-button ${selectedTable === "posts" ? "active-tab" : ""}`}
            onClick={() => setSelectedTable("posts")}
            >Posts
          </button>,
          
          <button 
            className={`table-button ${selectedTable === "follows" ? "active-tab" : ""}`}
            onClick={() => setSelectedTable("follows")}
            >Follows
          </button>
          ],
    tab2: {
      users: userData,

      posts: userData,
      
      follows: userData,
    }
  };

  
  

  return (
    <div>
      <h1>Twitter DB Tables</h1>
      
      {/* Tabs */}
      <div>
        <button
          className={selectedTab === "tab1" ? "active-tab" : ""}
          onClick={() => setSelectedTab("tab1")}
          >Tables
        </button>

        <button 
          className={selectedTab === "tab2" ? "active-tab" : ""}
          onClick={() => {setSelectedTab("tab2"); } }
          >Display
          </button>
      </div>

      {/* Content */}
      {selectedTab === "tab1" && (
        <div>
          {content.tab1.map((tabButton, index) => (
            <React.Fragment key={index}>{tabButton}</React.Fragment>
          ))}
        </div>
      )}

      {selectedTab === "tab2" && (
        <div>
          <h2>{selectedTable}</h2>
          {loading ? (
            <p>loading...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : (  
          <ul className="post-list">
            {content.tab2[selectedTable].map((item, index) => (
                <li key={index} className="post-item">
                  {selectedTable === 'users' && (
                    <div>
                      <h3>{item.username}</h3>
                      <p>{item.first_name} {item.last_name}</p>
                    </div>
                  )}

                {selectedTable === 'posts' && (
                  <div>
                    <h3>{userMap[item.user]}</h3>
                    <p>{item.content}</p>
                  </div>
                )}

                {selectedTable === 'follows' && (
                  <div>
                   <h3>{userMap[item.user]}</h3>
                   <p>Follows {userMap[item.following_user]}</p>
                 </div>
                )}
                  
                  
                </li>
            ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

