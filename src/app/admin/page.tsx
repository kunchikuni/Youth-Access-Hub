import React from 'react'


interface User {
  id: number;
  name: string;
}

const AdminPage = async () => {
  const res = await fetch('https://jsonplaceholder.typicode.com/users', { cache: 'no-store' });
  // Caching - fetching data from backend after some time => {next: { revalidate: 10 } }
  // The caching behaviors is only implemented in th fetch fxn so using 3rd party library like axios you not gonna get this [data cache]
  const users: User[] = await res.json();


  return (

    <>
      <h1>Users</h1>
      <ul>
        {users.map(user => <li key={user.id}>{user.name}</li>)}
      </ul>
    </>

  )
}

export default AdminPage
