import React from 'react';
import { toast } from 'react-toastify';


const UserRow = ({ user, index, setRefetch }) => {

    const { email, role } = user;
    const makeAdmin = () => {
        fetch(`https://meetroom.onrender.com/user/admin/${email}`, {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({ email })

        }).then(res => res.json())
            .then(data => {
                setRefetch()
                toast.success(`Successfully made an admin`);
                console.log(data);
            })
    }
    const handleDelete = email => {
        fetch(`https://meetroom.onrender.com/user/${email}`, {
            method: 'DELETE',
        }).then(res => res.json())
            .then(data => {
                console.log(data);
                if (data.deletedCount) {
                    toast.success(`Deleted `);
                    setRefetch()
                }

            })
    }
    return (

        <tr className='border-b border-gray-400'>
            <th>{index + 1}</th>
            <td>{email}</td>
            <td>{role !== 'admin' && <button onClick={makeAdmin} className="btn btn-xs">Make Admin</button>}</td>
            <td><button onClick={() => handleDelete(email)} className="btn btn-xs">Remove Admin</button></td>

        </tr>

    );
};

export default UserRow;