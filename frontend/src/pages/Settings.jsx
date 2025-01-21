
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "../Styling/Settings.css";

const SettingsPage = () => {
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleShowUpdateForm = () => {
    setShowUpdateForm(true);
    setShowDeleteForm(false);
    setMessage('');
    setError('');
  };

  const handleShowDeleteForm = () => {
    setShowDeleteForm(true);
    setShowUpdateForm(false);
    setMessage('');
    setError('');
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    console.log(username, email, currentPassword, newPassword);
    fetch(`${API_URL}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, currentPassword, newPassword }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.message === "User details updated successfully") {
          alert("User details updated successfully, Please login again");
          localStorage.removeItem('token');
          navigate("/login");
        } else {
          setError(data.message);
        }
      })
      .catch((error) => {
        console.error('Error updating user details:', error);
        setError('An error occurred while updating user details.');
      });
  };

  const handleDeleteSubmit = (e) => {
    e.preventDefault();
    console.log(username, email, password);
    fetch(`${API_URL}/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.message === "User deleted successfully") {
          alert("User deleted successfully, Please register again");
          localStorage.removeItem('token');
          navigate("/login");
        } else {
          setError(data.message);
        }
      })
      .catch((error) => {
        console.error('Error deleting user account:', error);
        setError('An error occurred while deleting user account.');
      });
  };

  return (
    <div className="settings-container">
      <h1>Settings Page</h1>
      <div className="button-group">
        <button className="action-button" onClick={handleShowUpdateForm}>
          Show Update Form
        </button>
        <button className="action-button delete" onClick={handleShowDeleteForm}>
          Show Delete Form
        </button>
      </div>

      {showUpdateForm && (
        <form className="form" onSubmit={handleUpdateSubmit}>
          <h2>Update Form</h2>
          {error && <p className="error-message">{error}</p>}
          <label>
            Username:
            <input type="text" name="username" onChange={(e) => setUsername(e.target.value)} required />
          </label>
          <label>
            Email:
            <input type="email" name="email" onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Current Password:
            <input type="password" name="currentPassword" onChange={(e) => setCurrentPassword(e.target.value)} required />
          </label>
          <label>
            New Password:
            <input type="password" name="newPassword" onChange={(e) => setNewPassword(e.target.value)} required />
          </label>
          <button type="submit" className="submit-button">Update</button>
        </form>
      )}

      {showDeleteForm && (
        <form className="form" onSubmit={handleDeleteSubmit}>
          <h2>Delete Form</h2>
          {error && <p className="error-message">{error}</p>}
          <label>
            Username:
            <input type="text" name="username" onChange={(e) => setUsername(e.target.value)} required />
          </label>
          <label>
            Email:
            <input type="email" name="email" onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Password:
            <input type="password" name="password" onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <button type="submit" className="submit-button delete">Delete</button>
        </form>
      )}
    </div>
  );
};

export default SettingsPage;