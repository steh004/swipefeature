import React, { useState, useEffect } from 'react';
import Draggable, { DraggableEvent, DraggableData } from 'react-draggable';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  gender: string;
  location: string;
  university: string;
  interests: string[];
}

const SwipeComponent: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const mysql = require('mysql');

// Create a MySQL connection
  const connection = mysql.createConnection({
        host: 'localhost',
        user: 'your_username',
        password: 'your_password',
        database: 'your_database'
    });

// Connect to the database
  connection.connect((err:any) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database');
  });

  useEffect(() => {

    axios.get('/api/users', {
      params: {
        userId: "user1234"
      }
    }).then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });

  }, []);


  const handleSwipe = (event: DraggableEvent, data: DraggableData) => {
    const deltaX = data.deltaX;
    if (deltaX > 100) {
      // User swiped right
      // You can send a like or do something else
      console.log('Liked:', users[currentIndex].name);
      setCurrentIndex(currentIndex + 1);
    } else if (deltaX < -100) {
      // User swiped left
      // You can skip or do something else
      console.log('Skipped:', users[currentIndex].name);
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div>
      {users.length > 0 && currentIndex < users.length ? (
        <Draggable
          axis="x"
          bounds={{ left: -200, right: 200 }}
          onStop={handleSwipe}
        >
          <div style={{ width: '200px', height: '300px', border: '1px solid #ccc', borderRadius: '5px', textAlign: 'center' }}>
            <h3>{users[currentIndex].name}</h3>
            <p>Gender: {users[currentIndex].gender}</p>
            <p>Location: {users[currentIndex].location}</p>
            <p>University: {users[currentIndex].university}</p>
            <p>Interests: {users[currentIndex].interests.join(', ')}</p>
          </div>
        </Draggable>
      ) : (
        <p>No more users to show</p>
      )}
    </div>
  );
};

export default SwipeComponent;