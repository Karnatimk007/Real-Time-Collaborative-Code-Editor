import { useEffect, useState } from "react";

function Users({ socket, roomId }) {

  const [users, setUsers] = useState([]);

  useEffect(() => {

    // Receive full user list
    socket.on("room-users", (usersList) => {
      setUsers(usersList);
    });

    // Optional logs
    socket.on("user-joined", ({ username }) => {
      console.log(username + " joined");
    });

    socket.on("user-left", ({ username }) => {
      console.log(username + " left");
    });

    return () => {
      socket.off("room-users");
      socket.off("user-joined");
      socket.off("user-left");
    };

  }, [socket]);

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Users</h2>

      {users.map((user, index) => (
        <div key={index} className="p-2 bg-gray-700 rounded mb-1">
          {user}
        </div>
      ))}

    </div>
  );
}

export default Users;