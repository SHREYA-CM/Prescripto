import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AdminContext } from '../context/AdminContext';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import './AddDoctor.css'; // Reuse the same CSS

const EditDoctor = () => {
  const { id } = useParams();
  const { backendurl } = useContext(AdminContext);
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const fetchDoctorData = async () => {
      const response = await axios.get(`${backendurl}/api/doctor/${id}`, { headers: { token } });
      if (response.data.success) {
        setFormData(response.data.data);
      }
    };
    fetchDoctorData();
  }, []);

  const onChangeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    const response = await axios.post(`${backendurl}/api/doctor/update`, { id, data: formData }, { headers: { token } });
    if (response.data.success) {
      toast.success(response.data.message);
      navigate('/doctors');
    } else {
      toast.error(response.data.message);
    }
  };

  if (!formData) {
    return <div className="page-content">Loading...</div>;
  }

  return (
    <div className="add-doctor-form page-content">
      <h2>Edit Doctor</h2>
      <form onSubmit={onSubmitHandler}>
        <div className="form-group">
          <label>Doctor Name</label>
          <input onChange={onChangeHandler} value={formData.name} type="text" name="name" required />
        </div>
        <div className="form-group">
          <label>Specialization</label>
          <input onChange={onChangeHandler} value={formData.specialization} type="text" name="specialization" required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input onChange={onChangeHandler} value={formData.email} type="email" name="email" required />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input onChange={onChangeHandler} value={formData.phone} type="tel" name="phone" />
        </div>
        <button type="submit" className="add-button">SAVE CHANGES</button>
      </form>
    </div>
  );
};
export default EditDoctor;